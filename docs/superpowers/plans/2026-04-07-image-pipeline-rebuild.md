# Image Pipeline Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken Pollinations image pipeline with a 4-style multi-model system that generates clean, purposeful images for every post type.

**Architecture:** New `generate-images.js` reads post JSON, routes each post to a style (text-overlay/editorial/photorealistic/abstract), builds a short structured prompt from templates, calls Pollinations with the right model, saves the PNG. Post Generator skill updated to set `image_style` metadata instead of writing 80-word art prompts.

**Tech Stack:** Node.js, Pollinations API (flux, flux-realism models), Node fs module

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/generate-images.js` | CREATE | Main generation script — Style Router + Prompt Builder + Model Router + Pollinations call |
| `scripts/download-images.js` | DELETE | Old script, replaced |
| `skills/03-post-generator.md` | MODIFY | Replace IMAGE PROMPT section with `image_style` metadata instructions |
| `data/media/.gitkeep` | NO CHANGE | Media directory already exists |
| `HANDOVER.md` | MODIFY | Update problem #5 status |

---

### Task 1: Write the Prompt Template Module

**Files:**
- Create: `scripts/generate-images.js`

Write the style definitions, metaphor mappings, and prompt builder function.

```javascript
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

// Ensure media directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// ============================================================
// STYLE DEFINITIONS
// ============================================================

const STYLES = {
  text_overlay: {
    pillar: 'The Take',              // Maps to this pillar
    model: 'flux',                    // Pollinations model
    template: (hook) =>
      `bold white text "${hook}" on a dark navy to warm orange gradient background clean professional sans-serif typography minimal`,
    qualitySuffix: 'clean professional minimal',
  },
  editorial: {
    pillar: 'The Lesson',
    model: 'flux',
    template: (metaphor) =>
      `editorial flat illustration of ${metaphor} on a cream to sage green background thick black outlines bold flat colors minimal white space`,
    qualitySuffix: 'clean professional minimal',
  },
  photorealistic: {
    pillar: 'The Build',
    model: 'flux-realism',
    template: (scene) =>
      `a ${scene} with warm natural lighting photography professional workspace shot clean composition no people`,
    qualitySuffix: 'professional photography natural lighting realistic',
  },
  abstract: {
    pillar: 'The Person',
    model: 'flux',
    template: (shapes) =>
      `deep blue to rich purple gradient background with ${shapes} floating minimalist atmosphere smooth dark`,
    qualitySuffix: 'clean professional minimal',
  },
};

// ============================================================
// STYLE ROUTER — Maps pillar → style
// ============================================================

function selectStyle(pillar) {
  const styleEntry = Object.values(STYLES).find((s) => s.pillar === pillar);
  return styleEntry || STYLES.abstract; // Fallback to abstract
}

// Reverse: style name → style definition
function getStyleByName(name) {
  const entry = Object.entries(STYLES).find(([key]) => key === name);
  return entry ? { name: entry[0], ...entry[1] } : { name: 'abstract', ...STYLES.abstract };
}

// ============================================================
// METAPHOR/SCENE SHAPER — Maps topic keywords → prompt content
// ============================================================

const EDITORIAL_METAPHORS = [
  { keywords: ['mistake', 'fail', 'wrong', 'broke', 'error', 'broken'], metaphor: 'a cracked lightbulb with green shoots growing from inside' },
  { keywords: ['learn', 'grow', 'skill', 'improve', 'better', 'journey'], metaphor: 'a small sapling growing through concrete cracks in a city road' },
  { keywords: ['decide', 'choice', 'tradeoff', 'decision'], metaphor: 'a fork in a mountain path with a wooden signpost' },
  { keywords: ['struggle', 'hard', 'difficult', 'stuck', 'overwhelm'], metaphor: 'a tangled knot of colored yarn on a clean table' },
  { keywords: ['pattern', 'system', 'repeat', 'habit'], metaphor: 'interlocking gears with one golden gear in a set of steel gears, editorial flat style' },
  { keywords: ['build', 'ship', 'create', 'craft'], metaphor: 'a hand placing the final piece into a jigsaw puzzle on a table' },
];

const PHOTO_SCENES = [
  { keywords: ['code', 'terminal', 'coding', 'develop', 'build'], scene: 'laptop on a wooden desk at night open terminal showing code' },
  { keywords: ['ship', 'deploy', 'publish', 'launch'], scene: 'a hand pressing a large green button on a clean desk' },
  { keywords: ['architecture', 'design', 'system', 'structure'], scene: 'blueprint spread on a desk with coffee cup and laptop' },
  { keywords: ['test', 'verify', 'validate'], scene: 'a clipboard with a checklist on a desk with a laptop in background' },
  { keywords: ['debug', 'fix', 'patch', 'repair'], scene: 'a single monitor in a dark room with code highlighted' },
  { keywords: ['email', 'mail'], scene: 'a laptop showing an email client interface on a clean desk' },
];

const ABSTRACT_SHAPES = [
  { keywords: ['career', 'journey', 'path', 'progress'], shapes: 'concentric circles getting larger from center' },
  { keywords: ['identity', 'voice', 'personal', 'authentic'], shapes: 'interlocking organic shapes forming a single silhouette' },
  { keywords: ['opinion', 'take', 'view', 'perspective'], shapes: 'a single bold triangle among scattered small dots' },
];

function pickBest(items, text) {
  const lower = text.toLowerCase();
  for (const item of items) {
    if (item.keywords.some((k) => lower.includes(k))) return item;
  }
  return items[0]; // Fallback to first
}

function buildPrompt(styleName, post) {
  const style = getStyleByName(styleName);
  const topicText = `${post.topic_source || ''} ${post.hook || ''} ${post.body || ''}`;

  let promptContent;

  switch (styleName) {
    case 'text_overlay':
      promptContent = style.template(post.hook || 'LLM trends are changing fast');
      break;
    case 'editorial': {
      const match = pickBest(EDITORIAL_METAPHORS, topicText);
      promptContent = style.template(match.metaphor);
      break;
    }
    case 'photorealistic': {
      const match = pickBest(PHOTO_SCENES, topicText);
      promptContent = style.template(match.scene);
      break;
    }
    case 'abstract': {
      const match = pickBest(ABSTRACT_SHAPES, topicText);
      promptContent = style.template(match.shapes);
      break;
    }
    default:
      promptContent = style.template('abstract shapes on gradient');
  }

  return promptContent;
}
```

- [ ] **Step: Write prompt template module**

Create `scripts/generate-images.js` with the code above (style definitions, style router, metaphor mappings, and prompt builder).

- [ ] **Step: Verify the file created correctly**

```bash
node -c scripts/generate-images.js
```
Expected: No syntax errors.

- [ ] **Commit this task**

```bash
git add scripts/generate-images.js
git commit -m "feat: add image generator prompt template module"
```

---

### Task 2: Write the Download/Generation Function

**Files:**
- Modify: `scripts/generate-images.js`

Append the Pollinations API download function and retry logic to the bottom of the file.

```javascript
// ============================================================
// IMAGE GENERATION VIA POLLENATIONS API
// ============================================================

async function generateImage(prompt, outputPath, model = 'flux', retries = 2) {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 100000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${WIDTH}&height=${HEIGHT}&model=${model}&seed=${seed}&nologo=true`;

  console.log(`  Model: ${model} | ${prompt.slice(0, 60)}...`);

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
      console.log(`  ✓ Saved: ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return outputPath;
    } catch (err) {
      console.log(`  Attempt ${attempt + 1} error: ${err.message}`);
    }
  }

  console.error(`  ✗ Failed after ${retries + 1} attempts`);
  return null;
}
```

- [ ] **Step: Append download function**

Add the code block above to the end of `scripts/generate-images.js` (before the main function).

- [ ] **Step: Verify syntax**

```bash
node -c scripts/generate-images.js
```
Expected: No syntax errors.

- [ ] **Commit this task**

```bash
git add scripts/generate-images.js
git commit -m "feat: add Pollinations API download function with retry"
```

---

### Task 3: Write the Main Orchestrator

**Files:**
- Modify: `scripts/generate-images.js`

Append the main function that reads today's posts, selects style per post, builds prompt, generates image.

```javascript
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

  // Determine style: use image_style from post JSON if set, else infer from pillar
  let styleName = post.image_style;
  if (!styleName) {
    const mapped = Object.entries(STYLES).find(([_, s]) => s.pillar === post.pillar);
    styleName = mapped ? mapped[0] : 'abstract';
  }

  // Build prompt via template
  const prompt = buildPrompt(styleName, post);

  // Get model from style definition
  const style = getStyleByName(styleName);

  const result = await generateImage(prompt, outputPath, style.model);

  if (result) {
    post.image_url = result;
    post.image_prompt = prompt;
    post.image_style = styleName;
  } else {
    post.image_url = null;
    post.image_error = 'Failed to generate image after retries';
    post.image_prompt = prompt; // Save attempted prompt for debugging
  }
}

// Save updated posts with image metadata
fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
console.log(`\nDone. Posts updated in data/posts/${DATE}-posts.json`);
console.log('Images saved to data/media/\n');
```

- [ ] **Step: Append main function**

Add this code to the end of `scripts/generate-images.js`.

- [ ] **Step: Run with April 7 posts to test**

```bash
node scripts/generate-images.js 2026-04-07
```

Expected output:
- 2 images generated (one for The Take, one for The Lesson)
- The Take gets text-overlay style with hook text
- The Lesson gets editorial illustration style
- Posts JSON updated with `image_url` and `image_prompt`

- [ ] **Step: Verify output files exist**

```bash
ls data/media/2026-04-07-*.png
```
Expected: `2026-04-07-take.png` and `2026-04-07-lesson.png`

- [ ] **Step: Verify posts JSON was updated**

```bash
node -e "
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('data/posts/2026-04-07-posts.json','utf8'));
for (const p of data.posts) {
  console.log(p.pillar, '| url:', p.image_url ? 'yes' : 'null', '| style:', p.image_style);
}
"
```
Expected: Each post has `image_url` (or null if generation failed), `image_style` set, `image_prompt` saved.

- [ ] **Commit this task**

```bash
git add scripts/generate-images.js
git commit -m "feat: complete image generation orchestrator"
```

---

### Task 4: Delete Old Script

**Files:**
- Delete: `scripts/download-images.js`

- [ ] **Step: Remove the old script**

```bash
node scripts/generate-images.js 2026-04-07
```
Verify: `scripts/download-images.js` is gone, no imports of it exist.

- [ ] **Commit this task**

```bash
git add -A
git commit -m "chore: remove old download-images.js replaced by generate-images.js"
```

---

### Task 5: Update Post Generator Skill

**Files:**
- Modify: `skills/03-post-generator.md`

- [ ] **Step: Remove IMAGE PROMPT field from output JSON**

In the JSON output example (around the `full_post_text` field), replace the `image_prompt` field with `image_style`:

Find:
```json
"image_prompt": "Detailed image generation prompt",
```

Replace with:
```json
"image_style": "text_overlay | editorial | photorealistic | abstract",
```

- [ ] **Step: Add image_style assignment instructions**

In Post Generator Step 3 (before `### Step 4: Validate Each Post`), add:

**Setting image_style metadata:**

After generating each post, set the `image_style` field based on pillar:
- `The Take` → `"text_overlay"` (trend posts get bold hook text cards)
- `The Lesson` → `"editorial"` (learning posts get flat-design metaphors)
- `The Build` → `"photorealistic"` (build posts get workspace photography)
- `The Person` → `"abstract"` (personal posts get atmospheric gradients)

The `image_prompt` field is now **auto-generated** by `scripts/generate-images.js`. The Post Generator only sets the `image_style` string — no natural language prompt needed.

- [ ] **Step: Update the validation checklist**

Replace:
```
- [ ] Image prompt is 80+ words and detailed
```

With:
```
- [ ] `image_style` is set correctly for the pillar
```

- [ ] **Commit this task**

```bash
git add skills/03-post-generator.md
git commit -m "feat: update Post Generator skill with image_style metadata replacing image_prompt"
```

---

### Task 6: Update Existing Posts and HANDOVER.md

**Files:**
- Modify: `data/posts/2026-04-05-posts.json`
- Modify: `data/posts/2026-04-06-posts.json`
- Modify: `HANDOVER.md`

- [ ] **Step: Add image_style to existing posts**

Run this to add `image_style` metadata to the 4 existing posts:

```bash
python -c "
import json

for date in ['2026-04-05', '2026-04-06']:
    with open(f'data/posts/{date}-posts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    image_style_map = {
        'The Take': 'text_overlay',
        'The Build': 'photorealistic',
        'The Lesson': 'editorial',
        'The Person': 'abstract'
    }
    for post in data['posts']:
        post['image_style'] = image_style_map.get(post['pillar'], 'abstract')
    with open(f'data/posts/{date}-posts.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'{date}: added image_style to {len(data[\"posts\"])} posts')
"
```

Expected: All 4 posts get `image_style` field.

- [ ] **Step: Regenerate images for existing posts**

```bash
node scripts/generate-images.js 2026-04-05
node scripts/generate-images.js 2026-04-06
```

Expected: New images generated with proper style (text-overlay for Take posts, etc.)

- [ ] **Step: Update HANDOVER.md problem #5**

Find the row for problem #5 in `HANDOVER.md`:

```
| 5 | **Image pipeline is dead weight** | Open | Pollinations gives hit-or-miss results. Deferred. |
```

Replace with:
```
| 5 | **Image pipeline is dead weight** | ✅ FIXED | Multi-style AI generation: 4 styles per post type (text-overlay card, editorial illustration, photorealistic workspace, abstract/moody gradient). Short structured prompt templates (10-15 words) instead of 80-word AI art prompts. Automatic model selection (flux for text/art, flux-realism for photorealistic). Color profiles per style (navy-orange for trends, cream-green for lessons). Post Generator sets `image_style` metadata; generation script builds prompts from templates. No more complex composition prompts that the model ignores. Full implementation: `scripts/generate-images.js`, updated `skills/03-post-generator.md`. |
```

Also update the "What Needs Work" section — remove "Consistent image quality (or skip images)" since it's now addressed.

- [ ] **Commit this task**

```bash
git add data/posts/ data/media/*.png HANDOVER.md
git commit -m "feat: regenerate existing images with new multi-style pipeline, update handover"
```

---

### Task 7: Update Daily Workflow

**Files:**
- Modify: `DAILY-WORKFLOW.md`

- [ ] **Step: Update workflow step 3**

In `DAILY-WORKFLOW.md`, find the step about downloading images. Replace:

```
3. Download images (if using)
```

With:
```
3. Generate images (text-overlay, editorial, photorealistic, or abstract per post type)
```

And add:
```
Command: `node scripts/generate-images.js YYYY-MM-DD`
```

- [ ] **Commit this task**

```bash
git add DAILY-WORKFLOW.md
git commit -m "docs: update daily workflow for new image generation script"
```

---

## Full Plan Review

**Spec coverage check:**

| Spec Requirement | Task | Status |
|-----------------|------|--------|
| Style Router: maps pillar → style | Task 1 | ✅ selectStyle() function |
| Prompt Builder: 4 templates, 10-15 words | Task 1 | ✅ STYLES object with templates |
| Model Router: flux vs flux-realism | Task 1, 3 | ✅ per-style model selection |
| Color profiles per style | Task 1 | ✅ built into templates |
| Text-overlay for trend/take | Task 1, 3 | ✅ text_overlay style |
| Editorial for lesson | Task 1, 3 | ✅ editorial style |
| Photorealistic for build | Task 1, 3 | ✅ photorealistic style |
| Abstract for person | Task 1, 3 | ✅ abstract style |
| Metaphor/scene mapping from keywords | Task 1 | ✅ EDITORIAL_METAPHORS, PHOTO_SCENES, ABSTRACT_SHAPES |
| 1200×627 dimension | Task 1 | ✅ WIDTH/HEIGHT constants |
| 2 retries per image | Task 2 | ✅ retries parameter in generateImage() |
| 30s timeout | Task 2 | ✅ AbortSignal with 30s timeout |
| image_style metadata in posts JSON | Task 5 | ✅ Post Generator skill update |
| Remove old download-images.js | Task 4 | ✅ deletion task |
| Regenerate existing images | Task 6 | ✅ re-runs for Apr 5 & Apr 6 |
| Update HANDOVER.md | Task 6 | ✅ problem #5 status update |

**Placeholder scan:**

Searching for TBD, TODO, "implement later", "fill in details"...
- ✅ No placeholders found. All steps have actual code and commands.

**Type/Name consistency check:**

- `image_style` is the key name everywhere (Post Generator, posts JSON, generation script) → ✅ consistent
- `image_url` and `image_error` fields maintained for backward compatibility → ✅
- `generateImages()` function name → only in main script → ✅
- Style names: `text_overlay`, `editorial`, `photorealistic`, `abstract` → used in both script and skill doc → ✅

All consistent. Plan is ready for execution.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-07-image-pipeline-rebuild.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`

Which approach?
