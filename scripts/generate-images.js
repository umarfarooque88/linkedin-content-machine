#!/usr/bin/env node

/**
 * Multi-Style Image Generator — Replaces download-images.js
 *
 * Generates images for LinkedIn posts using 4 distinct styles:
 * 1. Text-Overlay (Trend/Take posts) — Flux model, navy-orange gradient + hook text
 * 2. Editorial Illustration (Lesson posts) — Flux model, cream-green, flat design
 * 3. Photorealistic (Build posts) — Flux-Realism model, workspace photography
 * 4. Abstract/Moody (Person posts) — Flux model, blue-purple, atmospheric
 *
 * Usage: node scripts/generate-images.js YYYY-MM-DD
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const MEDIA_DIR = path.join(ROOT_DIR, 'data', 'media');
const WIDTH = 1200;
const HEIGHT = 627;

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// ============================================================
// STYLE DEFINITIONS
// ============================================================

const STYLES = {
  text_overlay: {
    pillar: 'The Take',
    model: 'flux',
    template: (hook) =>
      `bold white text "${hook}" on a dark navy to warm orange gradient background clean professional sans-serif typography minimal`,
  },
  editorial: {
    pillar: 'The Lesson',
    model: 'flux',
    template: (metaphor) =>
      `editorial flat illustration of ${metaphor} on a cream to sage green background thick black outlines bold flat colors minimal white space`,
  },
  photorealistic: {
    pillar: 'The Build',
    model: 'flux-realism',
    template: (scene) =>
      `a ${scene} with warm natural lighting photography professional workspace shot clean composition no people`,
  },
  abstract: {
    pillar: 'The Person',
    model: 'flux',
    template: (shapes) =>
      `deep blue to rich purple gradient background with ${shapes} floating minimalist atmosphere smooth dark`,
  },
};

// ============================================================
// METAPHOR AND SCENE MAPPINGS
// ============================================================

const EDITORIAL_METAPHORS = [
  { keywords: ['mistake', 'fail', 'wrong', 'broke', 'error', 'broken', 'crash'], metaphor: 'a cracked lightbulb with green shoots growing from inside' },
  { keywords: ['learn', 'grow', 'skill', 'improve', 'better', 'journey', 'progress'], metaphor: 'a small sapling growing through concrete cracks in a city road' },
  { keywords: ['decide', 'choice', 'tradeoff', 'decision', 'select'], metaphor: 'a fork in a mountain path with a wooden signpost' },
  { keywords: ['struggle', 'hard', 'difficult', 'stuck', 'overwhelm', 'mess'], metaphor: 'a tangled knot of colored yarn on a clean table' },
  { keywords: ['pattern', 'system', 'repeat', 'habit', 'routine'], metaphor: 'interlocking gears with one golden gear in a set of steel gears' },
  { keywords: ['build', 'ship', 'create', 'craft', 'construct'], metaphor: 'a hand placing the final piece into a jigsaw puzzle on a table' },
  { keywords: ['test', 'try', 'experiment', 'prototype'], metaphor: 'a lightbulb with wires and a switch on a desk' },
  { keywords: ['think', 'idea', 'realize', 'discover', 'understand'], metaphor: 'a lightbulb above an open notebook filled with sketches on a wooden desk' },
];

const PHOTO_SCENES = [
  { keywords: ['code', 'terminal', 'coding', 'develop', 'build', 'script'], scene: 'laptop on a wooden desk at night open terminal showing code' },
  { keywords: ['ship', 'deploy', 'publish', 'launch'], scene: 'a hand pressing a large green button on a clean desk' },
  { keywords: ['architecture', 'design', 'system', 'structure', 'plan'], scene: 'blueprint spread on a desk with coffee cup and laptop' },
  { keywords: ['test', 'verify', 'validate', 'review'], scene: 'a clipboard with a checklist on a desk with a laptop in background' },
  { keywords: ['debug', 'fix', 'patch', 'repair'], scene: 'a single monitor in a dark room with code highlighted' },
  { keywords: ['email', 'mail', 'deliver'], scene: 'a laptop showing an email interface on a clean desk at night' },
  { keywords: ['data', 'database', 'query'], scene: 'a monitor displaying charts and graphs on a wooden desk' },
  { keywords: ['collaborate', 'team', 'meeting'], scene: 'two laptops open on a shared desk with coffee cups' },
];

const ABSTRACT_SHAPES = [
  { keywords: ['career', 'journey', 'path', 'progress', 'moving'], shapes: 'concentric circles getting larger from center' },
  { keywords: ['identity', 'voice', 'personal', 'authentic', 'self'], shapes: 'interlocking organic shapes forming a single silhouette' },
  { keywords: ['opinion', 'take', 'view', 'perspective', 'angle'], shapes: 'a single bold triangle among scattered small dots' },
  { keywords: ['life', 'story', 'experience', 'memory'], shapes: 'overlapping translucent circles in soft layers' },
];

// ============================================================
// PROMPT BUILDER
// ============================================================

function pickBest(items, text) {
  const lower = text.toLowerCase();
  for (const item of items) {
    if (item.keywords.some((k) => lower.includes(k))) return item;
  }
  return items[0];
}

function buildPrompt(styleName, post) {
  const style = Object.values(STYLES).find((s) => s.pillar === (STYLES[styleName]?.pillar || ''));
  if (!style) {
    const st = Object.entries(STYLES).find(([k]) => k === styleName);
    if (!st) return `abstract shapes on gradient`;
    style = st[1];
  }

  const topicText = `${post.topic_source || ''} ${post.hook || ''} ${post.body || ''}`;

  switch (styleName) {
    case 'text_overlay':
      return style.template(post.hook || 'trends are changing fast');
    case 'editorial': {
      const match = pickBest(EDITORIAL_METAPHORS, topicText);
      return style.template(match.metaphor);
    }
    case 'photorealistic': {
      const match = pickBest(PHOTO_SCENES, topicText);
      return style.template(match.scene);
    }
    case 'abstract': {
      const match = pickBest(ABSTRACT_SHAPES, topicText);
      return style.template(match.shapes);
    }
    default:
      return style.template('abstract shapes');
  }
}

// ============================================================
// IMAGE GENERATION
// ============================================================

async function generateImage(prompt, outputPath, model = 'flux', retries = 2) {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 100000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${WIDTH}&height=${HEIGHT}&model=${model}&seed=${seed}&nologo=true`;

  console.log(`  Model: ${model}`);
  console.log(`  Prompt: ${prompt.slice(0, 80)}...`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        console.log(`  Attempt ${attempt + 1} failed: ${response.status}. Retrying...`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`  Saved: ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return outputPath;
    } catch (err) {
      console.log(`  Attempt ${attempt + 1} error: ${err.message}`);
    }
  }

  console.error(`  Failed after ${retries + 1} attempts`);
  return null;
}

// ============================================================
// MAIN
// ============================================================

const args = process.argv.slice(2);
const DATE = args[0];

if (!DATE || !/^\d{4}-\d{2}-\d{2}$/.test(DATE)) {
  console.log('Usage: node scripts/generate-images.js YYYY-MM-DD');
  process.exit(1);
}

const postsFile = path.join(ROOT_DIR, 'data', 'posts', `${DATE}-posts.json`);

if (!fs.existsSync(postsFile)) {
  console.error(`Error: ${postsFile} not found`);
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));

console.log(`\n[${DATE}] Generating ${posts.posts.length} images...\n`);

for (let i = 0; i < posts.posts.length; i++) {
  const post = posts.posts[i];
  const safeName = post.pillar.toLowerCase().replace(/\s+/g, '-');
  const outputPath = path.join(MEDIA_DIR, `${DATE}-${safeName}.png`);

  console.log(`[${i + 1}/${posts.posts.length}] ${post.pillar}`);

  let styleName = post.image_style;
  if (!styleName) {
    const mapped = Object.entries(STYLES).find(([_, s]) => s.pillar === post.pillar);
    styleName = mapped ? mapped[0] : 'abstract';
  }

  const prompt = buildPrompt(styleName, post);
  const styleDef = Object.entries(STYLES).find(([k]) => k === styleName)?.[1] || STYLES.abstract;

  const result = await generateImage(prompt, outputPath, styleDef.model);

  if (result) {
    post.image_url = result;
    post.image_prompt = prompt;
    post.image_style = styleName;
    delete post.image_error;
  } else {
    post.image_url = null;
    post.image_error = 'Failed to generate image after retries';
    post.image_prompt = prompt;
  }
}

fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
console.log(`\nDone. Posts updated in data/posts/${DATE}-posts.json`);
console.log(`Images in data/media/\n`);
