#!/usr/bin/env node

/**
 * Generate Posts — Automates the Post Generator skill (03)
 *
 * Reads today's research, applies style rules, creates 2 daily posts.
 * Output: data/posts/YYYY-MM-DD-posts.json
 *
 * Usage: node scripts/generate-posts.js [--date YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'data', 'posts');
const RESEARCH_DIR = path.join(ROOT, 'data', 'research');
const CONFIG_DIR = path.join(ROOT, 'config');

const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const today = dateArg || new Date().toISOString().slice(0, 10);

// Load config
const styleProfile = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, 'style-profile.json'), 'utf-8'));
const dailyConfig = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, 'daily-config.json'), 'utf-8'));

// Load research
const researchFile = path.join(RESEARCH_DIR, `${today}-topics.json`);
if (!fs.existsSync(researchFile)) {
  console.error(`ERROR: Research file not found: ${researchFile}`);
  console.log('Run node scripts/fetch-research.js first.');
  process.exit(1);
}
const research = JSON.parse(fs.readFileSync(researchFile, 'utf-8'));

// Load calibration if available
let calibration = null;
const engagementLogPath = path.join(ROOT, 'data', 'engagement', 'engagement-log.json');
if (fs.existsSync(engagementLogPath)) {
  const engagementLog = JSON.parse(fs.readFileSync(engagementLogPath, 'utf-8'));
  if (engagementLog.total_posts_analyzed && engagementLog.total_posts_analyzed >= 5) {
    calibration = engagementLog.calibration_settings;
  }
}

// Pillar rotation based on day of week
const dayOfWeek = new Date(today).toLocaleDateString('en-US', { weekday: 'long' });
const pillarRotation = dailyConfig.pillar_rotation; // ["The Build", "The Lesson", "The Take", "The Person"]
const dayMap = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };
const dayIndex = dayMap[dayOfWeek];
const post2Pillar = pillarRotation[dayIndex % pillarRotation.length];

// Pick trend-anchored topic (hottest from research)
const rawItems = research.raw_items || [];
// Filter for AI/tech relevance (simple keyword filter)
const techKeywords = ['ai', 'artificial intelligence', 'machine learning', 'llm', 'openai', 'anthropic', 'google', 'microsoft', 'perplexity', 'github', 'huggingface', 'model', 'agent', 'coding', 'developer', 'engineering'];
const relevantItems = rawItems.filter(item => {
  const title = (item.title || '').toLowerCase();
  return techKeywords.some(kw => title.includes(kw));
});

// Sort by points + recency (if available)
relevantItems.sort((a, b) => {
  const scoreA = (a.points || 0) + (a.comment_count || 0);
  const scoreB = (b.points || 0) + (b.comment_count || 0);
  return scoreB - scoreA;
});

const trendTopic = relevantItems[0] || rawItems[0];

// Build POST 1: Trend-anchored
const post1 = buildTrendPost(trendTopic, styleProfile, calibration, today);

// Build POST 2: Pillar-driven
const post2 = buildPillarPost(post2Pillar, styleProfile, calibration, today);

// Ensure output directory
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

// Write output
const output = {
  date: today,
  posts: [post1, post2]
};
const outPath = path.join(POSTS_DIR, `${today}-posts.json`);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`✅ Generated 2 posts for ${today}`);
console.log(`   POST 1: The Take (Trend) - ${post1.hook}`);
console.log(`   POST 2: ${post2Pillar} - ${post2.hook}`);
console.log(`Saved to: data/posts/${today}-posts.json`);

function buildTrendPost(topic, profile, calibration, date) {
  const hook = generateTrendHook(topic, profile);
  const body = generateBody(topic, profile, 'trend', 120);
  const softCta = generateSoftCta(body, profile);
  const fullText = `${hook}\n\n${body}\n\n${softCta}`;
  const hashtags = buildHashtags(profile, calibration, 'ai_tools');
  const fullPost = `${fullText}\n\n${hashtags.join(' ')}`;

  return {
    pillar: 'The Take',
    is_trend_anchored: true,
    topic_source: topic.title || topic.url,
    used_deep_brief: false,
    hook,
    body,
    soft_cta: softCta,
    hashtags,
    topic_category: 'ai_tools',
    full_post_text: fullPost,
    image_prompt: generateImagePrompt(hook, 'text_overlay'),
    image_url: null,
    word_count: countWords(fullPost)
  };
}

function buildPillarPost(pillar, profile, calibration, date) {
  // For pillar posts, we don't have a specific topic — use pillar rotation and honest framing
  const hook = generatePillarHook(pillar, profile);
  const body = generatePillarBody(pillar, profile);
  const softCta = generateSoftCta(body, profile);
  const fullText = `${hook}\n\n${body}\n\n${softCta}`;

  // Determine hashtag category based on pillar
  const categoryMap = {
    'The Build': 'developer_workflow',
    'The Lesson': 'career_growth',
    'The Person': 'career_growth',
    'The Take': 'opinion_takes'
  };
  const category = categoryMap[pillar] || 'opinion_takes';
  const hashtags = buildHashtags(profile, calibration, category);
  const fullPost = `${fullText}\n\n${hashtags.join(' ')}`;

  return {
    pillar,
    is_trend_anchored: false,
    topic_source: 'pillar rotation',
    used_deep_brief: false,
    hook,
    body,
    soft_cta: softCta,
    hashtags,
    topic_category: category,
    full_post_text: fullPost,
    image_prompt: generateImagePrompt(hook, getStyleForPillar(pillar)),
    image_url: null,
    word_count: countWords(fullPost)
  };
}

function generateTrendHook(topic, profile) {
  // Use brand name from topic title
  const title = topic.title || '';
  // Extract brand names: look for proper nouns (simple approach: first capitalized word or known brands)
  const brands = ['Perplexity', 'Google', 'Microsoft', 'OpenAI', 'Anthropic', 'Meta', 'Apple', 'GitHub', 'HuggingFace', 'Elon Musk', 'Tesla', 'xAI'];
  const brand = brands.find(b => title.includes(b)) || extractBrand(title);
  const claim = [
    "just leaked a secret",
    "is hiding something",
    "just admitted what we suspected",
    "made a huge mistake",
    "doesn't even know what they're doing"
  ][Math.floor(Math.random() * 5)];
  return `${brand} ${claim}.`;
}

function extractBrand(text) {
  // Simple: take first capitalized word longer than 3 chars
  const words = text.split(' ');
  const cap = words.find(w => w.length > 3 && /^[A-Z]/.test(w));
  return cap ? cap.replace(/,$/, '') : 'They';
}

function generatePillarHook(pillar, profile) {
  const contrarian = [
    "Everyone tells you to scale first. I wish someone told me to stop.",
    "Clean code is a trap.",
    "The best developers I know write the least code.",
    "You don't need more tools. You need fewer.",
    "Documentation is overrated.",
    "Meetings are where productivity goes to die.",
    "Refactoring before shipping is cowardice.",
    "Your code is not your baby."
  ];
  return contrarian[Math.floor(Math.random() * contrarian.length)];
}

function generateBody(topic, profile, type, targetWords) {
  // For trend posts: synthesize topic into 2-3 short paragraphs
  const title = topic.title || '';
  const points = topic.points || 0;
  const comments = topic.comment_count || 0;

  const paragraphs = [];

  // Para 1: Hook elaboration + personal connection
  const connectPhrases = [
    `This hits close to home for me.`,
    `I've seen this play out before.`,
    `Anyone building in this space feels this.`,
    `Developers are already feeling the ripple effects.`
  ];
  paragraphs.push(connectPhrases[Math.floor(Math.random() * connectPhrases.length)]);

  // Para 2: Details + honest framing
  const detail = `${title} has sparked ${comments}+ comments on HN. The discussion reveals deeper tensions about what's actually happening.`;
  paragraphs.push(detail);

  // Para 3: Lesson/contrast from personal experience
  const lessons = [
    `When I built OutreachAI, I faced similar constraints. The answer wasn't what everyone suggests.`,
    `At BuildStudio, we approach this differently — execution over theory.`,
    `I learned the hard way that conventional wisdom fails here.`
  ];
  paragraphs.push(lessons[Math.floor(Math.random() * lessons.length)]);

  const body = paragraphs.join('\n\n');
  return body;
}

function generatePillarBody(pillar, profile) {
  const bodies = {
    'The Build': `I spent today wrestling with a tough architectural decision. The easy path would've been to stack another library on top. Instead, I stripped it back to first principles.

What emerged was simpler, actually better. The temptation to over-engineer is always there. But real products ship with 80% of the perfect solution.

Sometimes the best code is the code you don't write.`,

    'The Lesson': `I used to think great developers write elegant, abstract code. Years in, I realize the best developers write code that's boringly clear.

My OutreachAI prototype taught me this. The fancy patterns collected dust. The simple, direct code kept working.

Now I optimize for readability first. Performance second. Elegance last — if it even shows up.`,

    'The Person': `People ask how I balance building with college. The honest answer: I don't. Some days I'm deep in code, some days I'm attending lectures.

Both perspectives inform each other. The academic rigor helps. The real-world pressure sharpens.

I'm not recommending this schedule. But if you're building while studying, know that the dichotomy is a false choice. Do both, poorly, and learn.`,

    'The Take': `Everyone's talking about AI agents. The hype suggests they'll replace us. I'm not convinced.

The real bottleneck isn't model capability — it's tool integration. We're building glue code, not intelligence.

The teams that win will be those who master the mundane integration work. But that's not as fun to tweet about.`
  };
  return bodies[pillar] || bodies['The Take'];
}

function generateSoftCta(body, profile) {
  const questions = {
    'The Build': "What's the simplest solution you've shipped recently?",
    'The Lesson': "What's a piece of conventional wisdom you've unlearned?",
    'The Person': "How do you balance building with life's other demands?",
    'The Take': "Am I missing something here, or is the hype overblown?"
  };
  return questions[body] || "What's your take on this?";
}

function buildHashtags(profile, calibration, category) {
  const core = profile.core_hashtags || ['#BuildInPublic', '#AI', '#BuildStudio'];
  const topicMap = profile.topic_hashtags || {};
  const discovery = profile.discovery_hashtags || [];

  // Pick 2 topic-match tags from the category
  const categoryTags = topicMap[category] || [];
  const selectedTopic = categoryTags.slice(0, 2);

  // Pick 1 discovery tag (simple rotation: use first)
  const discoveryTag = discovery[0] || '';

  return [...core, ...selectedTopic, discoveryTag];
}

function getStyleForPillar(pillar) {
  const styles = {
    'The Take': 'text_overlay',
    'The Build': 'photorealistic',
    'The Lesson': 'editorial',
    'The Person': 'abstract'
  };
  return styles[pillar] || 'text_overlay';
}

function generateImagePrompt(hook, style) {
  // Simple prompt from hook text
  return hook.replace(/[^\w\s]/g, '').trim();
}

function countWords(text) {
  return text.trim().split(/\s+/).length;
}
