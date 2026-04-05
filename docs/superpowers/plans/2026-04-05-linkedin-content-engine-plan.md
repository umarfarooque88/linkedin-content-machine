# LinkedIn Content Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily LinkedIn content generation system that researches trending AI/tech topics, generates 2 style-matched posts with images, and stores everything in Google Sheets.

**Architecture:** 4 reusable skills (Style Analyzer, Research Engine, Post Generator, Content Scheduler) + config files + data output directories. Each skill is a Claude skill file that can be invoked daily. Media uses Pollinations.ai for free image generation.

**Tech Stack:** Claude Code skills (markdown-based), Pollinations.ai for images, WebSearch for research, Google Sheets via user manual paste or API, JSON for data files.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `config/style-profile.json` | Umar's writing voice profile (tone, structure, hooks) |
| `skills/01-style-analyzer.md` | Skill that analyzes writing samples and generates style-profile.json |
| `skills/02-research-engine.md` | Skill that scans daily AI/tech trends, outputs topics |
| `skills/03-post-generator.md` | Skill that generates 2 daily posts using style + trends |
| `skills/04-content-scheduler.md` | Skill that formats posts for Google Sheets, tracks status |
| `data/research/` | Daily research output: `YYYY-MM-DD-topics.json` |
| `data/posts/` | Daily post output: `YYYY-MM-DD-posts.json` |
| `data/media/` | Generated images stored here |
| `scripts/download-images.js` | Utility to download Pollinations images |

---

### Task 1: Create Project Structure

**Files:**
- Create: `config/style-profile.json` (stub)
- Create: `data/research/.gitkeep`
- Create: `data/posts/.gitkeep`
- Create: `data/media/.gitkeep`

- [ ] **Step 1: Create config directory and stub style profile**

Create `config/style-profile.json`:

```json
{
  "name": "Umar Farooque",
  "tone": "mix of formal/analytical and casual/conversational",
  "sentence_length": "both short punchy and longer explanatory",
  "hook_style": ["bold statement", "personal story", "question"],
  "structure": "story or opinion first, evidence second, lesson third",
  "formatting": {
    "line_breaks": true,
    "lists": true,
    "emojis": "minimal - use sparingly for emphasis only",
    "hashtags": "3-5 relevant, placed at end"
  },
  "content_pillars": ["The Build", "The Lesson", "The Take", "The Person"],
  "positioning": "professional journey + tech mix",
  "goal": "personal brand + thought leadership",
  "voice_notes": "Self-taught developer. Values 'real-world development > just learning'. Product-focused, not tutorial-focused. Ships real products.",
  "calibration_status": "initial",
  "last_updated": "2026-04-05"
}
```

- [ ] **Step 2: Create data directories**

```bash
mkdir -p data/research data/posts data/media
touch data/research/.gitkeep
touch data/posts/.gitkeep
touch data/media/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add config/ data/
git commit -m "feat: add project structure and initial style profile"
```

---

### Task 2: Build Skill 01 - Style Analyzer

**Files:**
- Create: `skills/01-style-analyzer.md`
- Modify: `config/style-profile.json` (populates with real analysis)

This skill is a one-time analyzer that processes whatever writing data we have (LinkedIn profile summary, existing posts, chat messages, interviews) and produces a detailed voice profile.

- [ ] **Step 1: Create the Style Analyzer skill**

Create `skills/01-style-analyzer.md`:

```markdown
# Style Analyzer

Analyze Umar's writing samples and produce a detailed voice profile in `config/style-profile.json`.

## Instructions

1. Read all writing samples from `Dataset/` directory, including:
   - LinkedIn Profile Summary (Basic_LinkedInDataExport → Profile.csv)
   - Any existing LinkedIn posts
   - Any messages, emails, or documents found
   - Interview responses if provided

2. Analyze for the following dimensions:

   ### A. Tone Scale (1-10)
   - Formal ←——→ Casual
   - Technical ←——→ Accessible
   - Confident ←——→ Humble
   - Direct ←——→ Tangential
   - Academic ←——→ Conversational

   ### B. Sentence Patterns
   - Average sentence length (short/medium/long)
   - Sentence variety (monotonous/varied/creative)
   - Paragraph length (1-2 lines / 3-5 lines / long paragraphs)
   - Use of line breaks between ideas

   ### C. Structural Patterns
   - Hook type (how they start posts/stories)
   - Body structure (how they develop points)
   - Conclusion pattern (how they end — CTA, question, statement)

   ### D. Formatting Habits
   - Emojis: none / occasional / many
   - Lists: uses / avoids
   - Quotes: uses / avoids
   - Hashtags: how many, style, placement
   - Bold/italics: uses / avoids

   ### E. Content Focus
   - Topics they gravitate toward
   - Themes in their storytelling
   - What they emphasize (process vs results vs feelings vs facts)

3. Write findings to `config/style-profile.json` with this structure:

```json
{
  "name": "Umar Farooque",
  "tone_scales": {
    "formality": 4,
    "technical_depth": 5,
    "confidence": 7,
    "directness": 6,
    "conversational": 6
  },
  "sentence_patterns": {
    "avg_length": "mixed - short for impact, longer for explanation",
    "variety": "varied",
    "paragraph_style": "short paragraphs, 1-3 lines each",
    "uses_line_breaks": true
  },
  "structure": {
    "hooks": ["bold statements", "personal story openings", "contrarian takes"],
    "body": "develops point with personal evidence or example",
    "conclusion": "ends with question or open thought, never hard CTA"
  },
  "formatting": {
    "emojis": "minimal, strategic only",
    "lists": "uses for emphasis",
    "quotes": true,
    "hashtags": "3-5 at end, relevant only",
    "formatting": "uses line spacing for readability"
  },
  "content_themes": ["building in public", "developer journey", "real project experiences", "AI commentary"],
  "calibrated_phrases": [],
  "forbidden_phrases": [],
  "unique_angles": [],
  "calibration_status": "initial",
  "last_updated": "YYYY-MM-DD",
  "raw_samples_analyzed": 0
}
```

4. Update `calibration_status` to `initial` if samples found, `interview_needed` if too few.

5. If calibration is `interview_needed`, output 5 questions to better understand the writing style.
```

- [ ] **Step 2: Run the Style Analyzer**

```
Run the style-analyzer skill:
- Read Dataset/ files
- Analyze writing patterns
- Generate config/style-profile.json
```

Expected output: Updated `config/style-profile.json` with real analysis.

- [ ] **Step 3: Verify**

Check `config/style-profile.json` has all fields populated. If `calibration_status` is `interview_needed`, ask Umar the interview questions.

- [ ] **Step 4: Commit**

```bash
git add skills/01-style-analyzer.md config/style-profile.json
git commit -m "feat: add style analyzer skill and initial profile"
```

---

### Task 3: Build Skill 02 - Research Engine

**Files:**
- Create: `skills/02-research-engine.md`
- Output: `data/research/YYYY-MM-DD-topics.json`

This skill runs daily, scanning AI/tech news and finding trending topics.

- [ ] **Step 1: Create the Research Engine skill**

Create `skills/02-research-engine.md`:

```markdown
# Research Engine

Scan daily AI/tech trends and output 3-5 trending post topics with unique angles for Umar's LinkedIn audience.

## Instructions

1. Run WebSearch for today's AI and tech news:
   - Search: "AI news today [current date]"
   - Search: "tech industry trends [current month] [current year]"
   - Search: "developer tools new release [current month] [current year]"
   - Search: "AI debate controversy [current month] [current year]"

2. Filter results for:
   - Relevance to Umar's audience (developers, tech professionals)
   - Engagement potential (controversial, surprising, or practical)
   - Angle availability (can Umar add a unique perspective?)

3. For each trending topic, create a post idea with:

```json
{
  "topic": "brief headline",
  "pillar": "The Build | The Lesson | The Take | The Person",
  "why_its_hot": "1-2 sentences on why this is trending",
  "unique_angle": "Umar's specific take that differs from generic takes",
  "suggested_hook": "A hook line that would stop the scroll",
  "source_urls": ["...", "..."],
  "urgency": "hot (today) | warm (this week) | evergreen"
}
```

4. If research finds nothing sufficiently trending:
   - Generate evergreen topic ideas that align with the 4 content pillars
   - Focus on lessons Umar has learned from his real projects
   - Examples: "What building OutreachAI taught me about X"

5. Write output to: `data/research/YYYY-MM-DD-topics.json`
   (Replace YYYY-MM-DD with today's date)

```json
{
  "date": "YYYY-MM-DD",
  "topics": [
    // Array of 3-5 topic objects (above structure)
  ],
  "evergreen_fallback": bool,
  "search_queries_used": ["...", "..."]
}
```
```

- [ ] **Step 2: Test the Research Engine**

Run the skill manually by executing WebSearch and generating the first day's research file.

- [ ] **Step 3: Commit**

```bash
git add skills/02-research-engine.md
git commit -m "feat: add daily research engine skill"
```

---

### Task 4: Build Skill 03 - Post Generator

**Files:**
- Create: `skills/03-post-generator.md`
- Output: `data/posts/YYYY-MM-DD-posts.json`
- Dependency: `config/style-profile.json` and today's research file

This skill takes research + style → 2 ready-to-post LinkedIn posts.

- [ ] **Step 1: Create the Post Generator skill**

Create `skills/03-post-generator.md`:

```markdown
# Post Generator

Generate 2 daily LinkedIn posts combining Umar's style voice, content pillars, and today's trending topics.

## Requirements

- Each post must be 150-300 words (LinkedIn optimal length)
- Each post must use the exact writing style from `config/style-profile.json`
- At least 1 post per day must be trend-anchored (based on today's research)
- Posts should be structured for maximum engagement: hook → body → soft CTA
- No AI-sounding phrases ("In today's fast-paced", "As we navigate", "It's important to note")
- No engagement bait ("Like this post if", "Comment below")
- Every post should feel authentically Umar, not like generic AI content

## Process

1. Read `config/style-profile.json` for voice constraints

2. Read today's research: `data/research/YYYY-MM-DD-topics.json`

3. Generate POST 1 (TREND-ANCHORED):
   - Pick the hottest topic from research
   - Write the post with:
     - Hook: Stops the scroll (bold, surprising, personal)
     - Body: 3-5 short paragraphs, develop the point with evidence or story
     - Soft CTA: A question or open thought at the end
     - Hashtags: 3-5 relevant
   - Apply style profile constraints strictly
   - Create image prompt for this post (detailed, for Pollinations.ai)

4. Generate POST 2 (PILLAR-DRIVEN):
   - Rotate through pillars (The Build → The Lesson → The Person → The Take)
   - Write the post following the assigned pillar
   - Use Umar's real experiences and projects
   - Same quality standards as POST 1

5. Write output to: `data/posts/YYYY-MM-DD-posts.json`

```json
{
  "date": "YYYY-MM-DD",
  "posts": [
    {
      "pillar": "string",
      "is_trend_anchored": true,
      "topic_source": "string (topic headline)",
      "hook": "string",
      "body": "string",
      "soft_cta": "string",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "full_post_text": "string",
      "image_prompt": "string",
      "image_url": "string (generated by media utility)",
      "word_count": 0
    },
    {
      // same structure for post 2
    }
  ]
}
```

6. Validate each post:
   - Word count 150-300
   - No banned AI phrases
   - Matches style profile tone
   - Has clear hook, body, CTA structure
   - Image prompt is detailed (50+ words)
```

- [ ] **Step 2: Commit**

```bash
git add skills/03-post-generator.md
git commit -m "feat: add post generator skill"
```

---

### Task 5: Build Skill 04 - Content Scheduler

**Files:**
- Create: `skills/04-content-scheduler.md`
- Create: `scripts/download-images.js`
- Integration: Reads posts, formats for Google Sheets

This skill takes today's posts and formats them for Google Sheets, including image download.

- [ ] **Step 1: Create the image download utility**

Create `scripts/download-images.js`:

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, '..', 'data', 'media');

function downloadImage(imageUrl, outputPath) {
  const encodedPrompt = encodeURIComponent(imageUrl.split('?prompt=')[1] || imageUrl);
  const fullUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
  
  console.log(`Generating: ${outputPath}`);
  // Fetch is synchronous for simplicity
  fetch(fullUrl)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`Saved: ${outputPath}`);
    })
    .catch(err => console.error(`Failed: ${err.message}`));
}

// Main: read today's posts file and download images
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node download-images.js YYYY-MM-DD');
  process.exit(1);
}

const date = args[0];
const postsFile = path.join(__dirname, '..', 'data', 'posts', `${date}-posts.json`);

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));

for (const post of posts.posts) {
  const safeName = post.pillar.toLowerCase().replace(/\s+/g, '-');
  const outputPath = path.join(MEDIA_DIR, `${date}-${safeName}.png`);
  downloadImage(post.image_prompt, outputPath);
  post.image_url = outputPath.replace(/\.\.\/+/g, '');
}

// Save updated posts with local paths
fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
console.log('\nAll images downloaded and posts updated with local paths.');
```

- [ ] **Step 2: Create the Content Scheduler skill**

Create `skills/04-content-scheduler.md`:

```markdown
# Content Scheduler

Format today's posts for Google Sheets, download images, and manage the content pipeline.

## Instructions

1. Read today's posts: `data/posts/YYYY-MM-DD-posts.json`

2. Download images using the utility script:
   ```bash
   node scripts/download-images.js YYYY-MM-DD
   ```

3. For each post, format as a Google Sheets row:

```
POST # | Date | Pillar | Post Text | Image (Google Drive link) | Media Prompt | Status | Notes | Topic Source |
```

   Output in a copy-friendly format for the user to paste into Sheets:

```
--- POST 1 ---
Date: YYYY-MM-DD
Pillar: [pillar name]
Post Text: [full post copy ready to paste]
Image Prompt: [the prompt used]
Status: Draft
Topic Source: [url or topic headline]

--- POST 2 ---
[ same format ]
```

4. Update `data/posts/YYYY-MM-DD-posts.json` with Status: "Draft"

5. If this is a recurring daily run, check previous posts and:
   - Remind about any "Draft" posts from previous days
   - Suggest posting schedule based on pillar rotation
   - Show engagement stats if `data/posts/engagement.log` exists

6. Output summary:
```
Today's Posts (YYYY-MM-DD):
- Post #N [The Take] - Trend: [topic]
- Post #M [The Build] - Topic: [topic]

Ready for Google Sheets.
```
```

- [ ] **Step 3: Commit**

```bash
git add skills/04-content-scheduler.md scripts/download-images.js
git commit -m "feat: add content scheduler skill and image downloader"
```

---

### Task 6: Build Image Media Generation Utility

**Files:**
- Modify: `scripts/download-images.js` (add polling retry, better error handling)

The basic downloader works. Now add resilience:

- [ ] **Step 1: Update download-images.js with proper retry logic**

Update to support: retry on network failure, multiple image style options, verbose output, timeout handling.

Expected improvements:
- Poll-based checking for image availability
- Fallback to alternate style if generation fails
- Progress output with timing

- [ ] **Step 2: Commit**

```bash
git add scripts/download-images.js
git commit -m "feat: add retry logic and error handling to image downloader"
```

---

### Task 7: Create Daily Workflow Script

**Files:**
- Create: `DAILY-WORKFLOW.md`
- Create: `config/daily-config.json`

A simple doc that maps the daily process step-by-step for Umar.

- [ ] **Step 1: Create daily workflow doc**

Create `DAILY-WORKFLOW.md`:

```markdown
# Daily LinkedIn Content Workflow

Total time: ~10 minutes

## Step 1: Research (2 min)

Run the Research Engine skill. It will scan today's AI/tech news and suggest 3-5 potential post topics.

## Step 2: Generate Posts (3 min)

Run the Post Generator skill. It reads the research and generates 2 posts in your voice.

## Step 3: Download Images (2 min)

```bash
cd "E:\LinkedIn Automation"
node scripts/download-images.js YYYY-MM-DD
```

This downloads the images for today's posts.

## Step 4: Format for Sheets (1 min)

Run the Content Scheduler skill. It formats everything for Google Sheets paste.

## Step 5: Review & Copy (2 min)

Open your Google Sheets content hub. Review the 2 posts. Make any tweaks needed. Mark as "Draft".

## Step 6: Post (2 min, anytime today)

1. Open LinkedIn
2. Copy post text from Sheets
3. Download image from the Drive link
4. Create post with text + image
5. Update status to "Posted" in Sheets

Done.
```

- [ ] **Step 2: Create daily config**

Create `config/daily-config.json`:

```json
{
  "posts_per_day": 2,
  "pillar_rotation": ["The Build", "The Lesson", "The Take", "The Person"],
  "min_word_count": 150,
  "max_word_count": 300,
  "always_trend_anchored_posts": 1,
  "hashtags_per_post": 5,
  "image_style": "modern tech, clean minimalist, professional, high quality, no text overlay"
}
```

- [ ] **Step 3: Commit**

```bash
git add DAILY-WORKFLOW.md config/daily-config.json
git commit -m "feat: add daily workflow guide and config"
```

---

### Task 8: End-to-End Test

**Files:** All existing files

- [ ] **Step 1: Run full daily pipeline manually**

   1. Style Analyzer → verify profile exists
   2. Research Engine → run WebSearch, generate today's topics
   3. Post Generator → generate 2 posts
   4. Content Scheduler → format and verify Sheets output

- [ ] **Step 2: Verify outputs exist**

```
config/style-profile.json           ← voice profile
data/research/YYYY-MM-DD-topics.json ← research
data/posts/YYYY-MM-DD-posts.json     ← 2 posts
data/media/YYYY-MM-DD-*.png          ← 2 images
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: end-to-end pipeline working, system ready for daily use"
```
