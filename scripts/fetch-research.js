#!/usr/bin/env node

/**
 * Research Feed Fetcher — RSS-based replacement for Chrome scraping
 *
 * Fetches 4 RSS feeds (HN "New", HN "Ask", HN "Top", The Verge AI),
 * normalizes and deduplicates into a unified format.
 * Outputs raw feed data that the Post Generator skill processes for ranking,
 * angle selection, deep dives, and enrichment.
 *
 * Usage: node scripts/fetch-research.js [--date YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RESEARCH_DIR = path.join(ROOT_DIR, 'data', 'research');

const FEED_URLS = {
  hn_new:    'https://hnrss.org/newest?count=30',
  hn_ask:    'https://hnrss.org/ask?count=30',
  hn_top:    'https://hnrss.org/best?count=30',
  verge_ai:  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
};

const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const today = dateArg || new Date().toISOString().slice(0, 10);

// --- XML parsing (no dependencies) ---

function extract(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([^<]*?)(?:\\]\\]>)?</${tag}>`, 's');
  return xml.match(re)?.[1]?.trim() || '';
}

function parseItems(xml, feedName) {
  const results = [];
  let rawItems;

  // RSS 2.0 uses <item>, Atom uses <entry>
  if (feedName === 'verge_ai') {
    rawItems = [...xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/g)];
  } else {
    rawItems = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)];
  }

  for (const item of rawItems) {
    const c = item[1];

    let url, published;
    if (feedName === 'verge_ai') {
      url = extract(c, 'link');
      // Handle link rel="alternate" format
      if (!url) url = c.match(/href="([^"]+)"/)?.[1] || '';
      published = extract(c, 'published') || extract(c, 'updated') || '';
    } else {
      url = extract(c, 'link');
      published = extract(c, 'pubDate') || extract(c, 'published') || extract(c, 'dc:date') || '';
    }

    results.push({
      title: extract(c, 'title'),
      url,
      points: feedName === 'verge_ai' ? 0 : parseInt(extract(c, 'hn:points') || '0'),
      comment_count: feedName === 'verge_ai' ? 0 : parseInt(extract(c, 'hn:comments') || '0'),
      author: extract(c, 'name') || extract(c, 'dc:creator') || extract(c, 'author'),
      publishedAt: published,
      source: extract(c, 'source') || extract(c, 'dc:source'),
    });
  }
  return results;
}

// --- Main ---

async function main() {
  console.log(`[${today}] Fetching research feeds...\n`);

  const allItems = [];
  const seen = new Set();
  const feedStatus = {};

  for (const [source, url] of Object.entries(FEED_URLS)) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        console.log(`  SKIP ${source}: ${resp.status} ${resp.statusText}`);
        feedStatus[source] = false;
        continue;
      }
      const xml = await resp.text();
      const items = parseItems(xml, source);
      console.log(`  OK   ${source}: ${items.length} items`);
      feedStatus[source] = true;

      for (const item of items) {
        if (item.url && seen.has(item.url)) continue;
        item.feed = source;
        allItems.push(item);
        if (item.url) seen.add(item.url);
      }
    } catch (err) {
      console.log(`  FAIL ${source}: ${err.message}`);
      feedStatus[source] = false;
    }
  }

  console.log(`\nTotal: ${allItems.length} unique items`);

  // Save output
  if (!fs.existsSync(RESEARCH_DIR)) {
    fs.mkdirSync(RESEARCH_DIR, { recursive: true });
  }

  const output = {
    date: today,
    raw_items: allItems,
    feed_status: feedStatus,
    total_items: allItems.length,
  };

  const outputFile = path.join(RESEARCH_DIR, `${today}-topics.json`);
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: data/research/${today}-topics.json`);

  // Summary table
  console.log(`\nDaily Research Feed Report: ${today}`);
  console.log('='.repeat(40));
  console.log(`Feed          | Status | Items`);
  console.log('-'.repeat(40));
  for (const source of Object.keys(FEED_URLS)) {
    const items = allItems.filter(i => i.feed === source);
    const status = feedStatus[source] ? 'OK' : 'FAIL';
    console.log(`${source.padEnd(14)}| ${status.padEnd(6)}| ${items.length}`);
  }
  console.log('-'.repeat(40));
  console.log(`Total unique: ${allItems.length}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
