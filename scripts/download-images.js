#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, '..', 'data', 'media');

// Ensure media directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

async function downloadPostImage(prompt, outputPath, options = {}) {
  const { width = 1200, height = 630, model = 'flux', retries = 2 } = options;
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${Date.now()}&nologo=true`;

  console.log(`\nGenerating image...`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        console.log(`  Attempt ${attempt + 1} failed: ${response.status}. Retrying...`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`  Image saved: ${outputPath}`);
      console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
      return outputPath;
    } catch (err) {
      console.log(`  Attempt ${attempt + 1} error: ${err.message}`);
    }
  }

  console.error(`  Failed after ${retries + 1} attempts`);
  return null;
}

// Main: read today's posts file and download images
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node download-images.js YYYY-MM-DD');
  process.exit(1);
}

const date = args[0];
const postsFile = path.join(__dirname, '..', 'data', 'posts', `${date}-posts.json`);

if (!fs.existsSync(postsFile)) {
  console.error(`Error: ${postsFile} not found`);
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));

console.log(`\nDownloading ${posts.posts.length} images for ${date}...`);

for (let i = 0; i < posts.posts.length; i++) {
  const post = posts.posts[i];
  const safeName = post.pillar.toLowerCase().replace(/\s+/g, '-');
  const outputPath = path.join(MEDIA_DIR, `${date}-${safeName}.png`);

  console.log(`\n[${i + 1}/${posts.posts.length}] ${post.pillar}`);

  const result = await downloadPostImage(post.image_prompt, outputPath);

  if (result) {
    post.image_url = result;
  } else {
    post.image_url = null;
    post.image_error = 'Failed to generate image after retries';
  }
}

// Save updated posts with image paths
fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

console.log('\nDone. Posts updated with image paths.');
console.log('Upload images to Google Drive and paste links in Sheets.');
