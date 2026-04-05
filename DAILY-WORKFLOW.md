# Daily LinkedIn Content Workflow

Total time: ~10 minutes per day

## The Daily Process

### Step 1: Research (3 min)

In Claude Code, run the **Research Engine** skill (skill: `skills/02-research-engine.md`).

It will:
- Search today's AI/tech news via WebSearch
- Find 3-5 trending topics
- Suggest your unique angle for each
- Output: `data/research/YYYY-MM-DD-topics.json`

### Step 2: Generate Posts (3 min)

In Claude Code, run the **Post Generator** skill (skill: `skills/03-post-generator.md`).

It will:
- Read today's research
- Use your writing style from `config/style-profile.json`
- Generate 2 posts:
  - POST 1: Trend-anchored (today's hottest topic)
  - POST 2: Pillar-driven (rotating pillar)
- Output: `data/posts/YYYY-MM-DD-posts.json`

### Step 3: Download Images (2 min)

```bash
cd "E:\LinkedIn Automation"
node scripts/download-images.js YYYY-MM-DD
```

This downloads 2 images using Pollinations.ai (free, no API key needed).

### Step 4: Format for Google Sheets (1 min)

Run the **Content Scheduler** skill (skill: `skills/04-content-scheduler.md`).

It will:
- Format posts for easy copy-paste to Google Sheets
- Check status of previous days' posts
- Suggest tomorrow's pillar rotation

### Step 5: Post to LinkedIn (2 min per post, anytime today)

1. Open your Google Sheets content hub
2. Copy post text
3. Open LinkedIn → Create Post
4. Paste text + upload image from `data/media/`
5. Post!
6. Update status to "Posted" in Sheets

## Content Pillar Rotation

| Day | POST 1 | POST 2 |
|-----|--------|--------|
| Mon | The Take (trend) | The Build |
| Tue | The Take (trend) | The Lesson |
| Wed | The Take (trend) | The Person |
| Thu | The Take (trend) | The Build |
| Fri | The Take (trend) | The Lesson |
| Sat | The Take (trend) | The Person |
| Sun | The Take (trend) | The Build |

The Build → The Lesson → The Person → repeats

## Quick Reference Commands

```bash
# Download images for today
node scripts/download-images.js YYYY-MM-DD

# View all generated posts
ls data/posts/

# View all research
ls data/research/
```

## File Locations

| What | Where |
|------|-------|
| Style profile | `config/style-profile.json` |
| Daily research | `data/research/YYYY-MM-DD-topics.json` |
| Daily posts | `data/posts/YYYY-MM-DD-posts.json` |
| Images | `data/media/YYYY-MM-DD-{pillar}.png` |
| Skills | `skills/01-style-analyzer.md` through `04-content-scheduler.md` |
