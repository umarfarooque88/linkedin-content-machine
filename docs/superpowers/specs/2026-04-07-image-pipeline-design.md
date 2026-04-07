# Image Pipeline Spec — Multi-Style AI Generation

> Date: 2026-04-07 | Replaces: `scripts/download-images.js` (Pollinations-only, broken prompts)

## Problem

Existing image pipeline produces garbage outputs because:
1. Prompts are 80+ words with complex multi-element compositions that the model can't render
2. No style differentiation — every post type gets the same "editorial illustration" prompt
3. No automatic model selection — `flux` is used for photorealistic, `flux-realism` is never used
4. Results: filing cabinet prompt → laptop with question marks. Bridge metaphor → generic flat art.

## Solution

Replace the script with a **multi-style image generation system** that:
1. Maps each post to an image style based on pillar + content category
2. Uses a dedicated prompt template per style (10-15 words, not 80)
3. Selects the optimal Pollinations model per style
4. Applies a color profile per style (orange/navy for trends, cream/green for lessons, etc.)
5. Generates clean, purposeful images that match the post's content

## Architecture

```
Post JSON → Style Router → Prompt Builder → Model Router → Pollinations → Saved PNG
               ↓               ↓               ↓
          picks style      builds 15-word   picks model
          by pillar        prompt template  by style
```

## 4 Styles — 4 Prompt Templates

### 1. Text-Overlay Card
**Used for:** Trend/Take posts (Post 1)
**Model:** `flux`
**Color Palette:** Dark navy → Warm Orange gradient
**Template:**
```
bold white text "${hook}" on a dark navy to warm orange gradient background clean professional sans-serif typography minimal
```
**Hook source:** Post's `hook` field (max 15 words)
**Output:** Hook-only card, no subtitle, no brand tag, no watermark

### 2. Editorial Illustration
**Used for:** Lesson posts (The Lesson pillar)
**Model:** `flux`
**Color Palette:** Cream → Sage Green background, thick black outlines, bold flat colors, minimal white space
**Metaphor Mapping:**
- Mistake/failure → "a cracked lightbulb with green shoots growing from inside"
- Growth/learning → "a small sapling growing through concrete cracks in a city road"
- Decision → "a fork in a mountain path with a signpost"
- Struggle → "a tangled knot of colored yarn on a clean table"
- Pattern → "interlocking gears with one gear glowing gold in black outlines, bold flat colors, minimal"

### 3. Photorealistic
**Used for:** Build/Progress posts (The Build pillar)
**Model:** `flux-realism`
**Palette:** Natural lighting, workspace tones — warm lamp light, wood grain, dark screen glow
**Template:**
```
a ${scene} with warm natural lighting photography professional workspace shot clean composition no people
```
**Scene Mapping:**
- Coding/building → "laptop on a wooden desk at night open terminal showing code"
- Shipping → "a hand pressing a large green publish button on a desk"
- Architecture → "blueprint spread on a desk with coffee cup and laptop"
- Testing → "a clipboard with a checklist on a desk with a laptop in background"
- Debugging → "a single monitor in a dark room with code highlighted"

### 4. Abstract/Moody
**Used for:** Person/Opinion posts (The Person pillar, some Takes)
**Model:** `flux`
**Color Palette:** Deep blue → Purple gradient with subtle geometric shapes in floating atmospheric
**Template:**
```
deep blue to rich purple gradient background with subtle geometric shapes floating minimalist atmosphere smooth dark
```
**Shape Mapping:**
- Career journey → "concentric circles getting larger from center"
- Identity/voice → "interlocking shapes forming a single silhouette"
- Opinion/take → "a single bold triangle among scattered dots"

## Model Selection Table

| Style | Model | Why |
|-------|-------|-----|
| Text-overlay | `flux` | Best text rendering |
| Editorial | `flux` | Clean style control |
| Photorealistic | `flux-realism` | Real lighting/shadows |
| Abstract | `flux` | Smooth gradients |

## Prompt Builder Logic

The prompt builder is a simple function that:
1. Reads the post's `pillar`, `topic_category`, `hook`, and `topic_source`
2. Selects the style from the post pillar
3. Selects the metaphor/scene from the topic category
4. Fills the prompt template
5. Appends model-specific quality suffixes

**Quality suffixes per model:**
- `flux`: `clean professional minimal`
- `flux-realism`: `professional photography natural lighting realistic`

## Error Handling

- 2 retries per image (3 total attempts)
- Each retry uses a different random seed
- On failure: set `image_error` and continue — don't block post generation
- No cross-model fallback (if flux text fails, retry flux — don't switch to turbo)

## Dimension

All images: **1200×627 pixels** (LinkedIn's recommended image size)

## File Output

Output file: `data/media/YYYY-MM-DD-${pillar-slug}.png`

Example: `data/media/2026-04-07-take.png`, `post2_2026-04-07-lesson.png`

## Integration with Post Generator

The Post Generator skill's IMAGE PROMPT field is **replaced** by style metadata:

```json
{
  "image_style": "text_overlay",
  "image_model": "flux",
  "image_prompt": "auto-generated",
  "image_url": null
}
```

The Post Generator no longer writes a natural language image prompt. Instead, it sets `image_style` based on the post's pillar and category. The image generation script picks the style.

## What We're No Longer Doing

- **No 80+ word art prompts** — replaced by 10-15 word templates
- **No generic "editorial illustration" for everything** — 4 distinct styles
- **No single model** — `flux` for text/art, `flux-realism` for photorealistic
- **No failed images from complex prompts** — short prompts = reliable output

## Files Changed

- **New:** `scripts/generate-images.js` — multi-style image generator, replaces `download-images.js`
- **Modified:** `skills/03-post-generator.md` — replaces IMAGE PROMPT with `image_style` metadata field
- **Deleted:** `scripts/download-images.js` (replaced)
