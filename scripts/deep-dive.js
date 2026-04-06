#!/usr/bin/env node

/**
 * Deep Dive API Fetcher — Replacement for Chrome-based article extraction + HN comment mining
 *
 * Fetches the full article body (Jina Reader API) and HN comment discussion
 * (Firebase API or Algolia search) for today's #1 trending topic.
 *
 * Usage:
 *   node scripts/deep-dive.js <article_url> [search_term]
 *
 * Examples:
 *   node scripts/deep-dive.js https://techcrunch.com/some-article "AI agent framework"
 *   node scripts/deep-dive.js https://www.theverge.com/ai/article "Gemini Google Maps"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RESEARCH_DIR = path.join(ROOT_DIR, 'data', 'research');
const today = new Date().toISOString().slice(0, 10);

const articleUrl = process.argv[2];
if (!articleUrl) {
  console.log('Usage: node scripts/deep-dive.js <article_url> [search_term]\n');
  process.exit(1);
}

const searchTerm = process.argv[3] || '';

if (!fs.existsSync(RESEARCH_DIR)) {
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
}

// --- Step 2a: Article Extraction via Jina Reader API ---

async function fetchArticle(url) {
  console.log('[2a] Fetching article via Jina Reader API...');
  try {
    const resp = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      console.log(`  FAIL ${resp.status}: ${resp.statusText}`);
      return { success: false, error: `Jina API returned ${resp.status}` };
    }

    const body = await resp.text();
    console.log(`  OK   ${body.length} chars of article markdown`);
    return { success: true, body };
  } catch (err) {
    console.log(`  FAIL ${err.message}`);
    return { success: false, error: err.message };
  }
}

// --- Step 2b: HN Comments via Firebase API ---

async function fetchHnStory(storyId) {
  console.log(`[2b] Fetching HN story + comments via Firebase API (id: ${storyId})...`);
  try {
    const resp = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
    const story = await resp.json();

    if (!story) {
      console.log('  FAIL Story not found');
      return null;
    }

    const total = story.descendants || 0;
    const kids = story.kids || [];
    const limit = Math.min(kids.length, 20);
    console.log(`  OK   ${total} comments total, fetching top ${limit} top-level...`);

    const comments = [];
    for (let i = 0; i < limit; i++) {
      const comment = await fetchHnComment(kids[i]);
      if (comment && comment.text && !comment.deleted) {
        comments.push(comment);
      }
      // Rate limit: be polite to Firebase
      if (i % 10 === 9) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`  Got ${comments.length} comment`);
    return { story, comments };
  } catch (err) {
    console.log(`  FAIL ${err.message}`);
    return null;
  }
}

async function fetchHnComment(id) {
  const resp = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
  return resp.json();
}

// --- Search HN via Algolia (for non-HN sources) ---

async function searchHn(query) {
  console.log(`[2b] Searching HN for "${query}" via Algolia...`);
  try {
    const resp = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hits_per_page=5&restrictSearchableAttributes=title,url`
    );
    const data = await resp.json();
    if (data.hits?.length > 0) {
      const top = data.hits[0];
      console.log(`  Found HN story: ${top.object_id} — "${top.title}"`);
      return top.object_id;
    }
    console.log(`  No HN discussion found`);
    return null;
  } catch (err) {
    console.log(`  FAIL ${err.message}`);
    return null;
  }
}

// --- Main ---

async function main() {
  console.log(`\n[${today}] Deep dive for article: ${articleUrl}\n`);

  // Step 2a: Fetch article
  const article = await fetchArticle(articleUrl);

  // Step 2b: Find HN discussion and fetch comments
  let hnData = null;
  let storyId;

  // Extract HN item ID from the URL itself
  if (articleUrl.includes('ycombinator.com')) {
    storyId = articleUrl.match(/id=(\d+)/)?.[1];
  }

  if (storyId) {
    hnData = await fetchHnStory(storyId);
  } else {
    const query = searchTerm || articleUrl.split('/').pop().replace(/[-_]/g, ' ').slice(0, 50);
    const foundId = await searchHn(query);
    if (foundId) {
      hnData = await fetchHnStory(foundId);
    }
  }

  // Build output
  const output = {
    date: today,
    article_url: articleUrl,
    search_terms: searchTerm || null,
    article: {
      success: article.success,
      body: article.success ? article.body.substring(0, 20000) : '',
      truncated: article.body?.length > 20000,
      error: article.error || null,
    },
    hn_comments: hnData
      ? {
          success: true,
          story: {
            title: hnData.story.title,
            url: hnData.story.url,
            score: hnData.story.score,
            total_comments: hnData.story.descendants,
          },
          comments: hnData.comments.map(c => ({
            author: c.by,
            text: c.text.substring(0, 500),
            points: c.score || 0,
            time: new Date(c.time * 1000).toISOString(),
          })),
        }
      : {
          success: false,
          note: 'No HN discussion found or search returned nothing',
          comments: [],
        },
  };

  const outputFile = path.join(RESEARCH_DIR, `${today}-deep-dive.json`);
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: data/research/${today}-deep-dive.json`);

  // Summary
  console.log('\nDeep Dive Report:');
  console.log(
    `  Article: ${article.success ? `${article.body.length} chars` : `FAIL — ${article.error}`}`
  );
  console.log(
    `  HN Comments: ${hnData ? `${hnData.comments.length} comments (story: ${hnData.story.title})` : 'None found'}`
  );
  console.log('\nNext: Run the Post Generator skill — it reads the deep dive data and generates posts.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
