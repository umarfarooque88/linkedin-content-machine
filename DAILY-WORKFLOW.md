# Daily LinkedIn Content Workflow

Total time: ~12 minutes per day (includes engagement tracking)

## The Daily Process

### Step 0: Enter Yesterday's Engagement (2 min)

When a post is 24 hours old, track its engagement:

1. Go to LinkedIn and read likes, comments for yesterday's posts
2. Run: **Track engagement** using skill `skills/05-engagement-tracker.md`
3. Enter: day of week, time posted, likes, comments, shares
4. This feeds the learning engine and calibrates tomorrow's output

> **Timing rule:** Enter engagement for a post at the same time it was posted (e.g., if posted at 10am, enter at 10am next day). This ensures all data points are exactly 24 hours old for fair comparison.

### Step 1: Research (3 min)

Run the **Research Engine** skill (skill: `skills/02-research-engine.md`).

It will:
- Navigate to HN "New" + The Verge AI using the Chrome browser
- Extract live headlines and stories
- Find 3-5 trending topics with your unique angle
- Output: `data/research/YYYY-MM-DD-topics.json`

### Step 2: Generate Posts (3 min)

Run the **Post Generator** skill (skill: `skills/03-post-generator.md`).

It will:
- Read today's research from Step 1
- Read engagement data and calibration settings (if available)
- Generate 2 posts:
  - POST 1: Trend-anchored (today's hottest topic, first post of the day)
  - POST 2: Pillar-driven (rotating pillar, second post)
- Output: `data/posts/YYYY-MM-DD-posts.json`

### Step 3: Download Images (optional, 2 min)

```bash
cd "E:\LinkedIn Automation"
node scripts/download-images.js YYYY-MM-DD
```

> **Note:** Image quality from Pollinations is hit-or-miss. Consider skipping for now.

### Step 4: Format for Google Sheets (1 min)

Run the **Content Scheduler** skill (skill: `skills/04-content-scheduler.md`).

It will:
- Format posts for easy copy-paste to Google Sheets
- Flag any pending engagement entries from previous days
- Suggest tomorrow's pillar rotation

### Step 5: Post to LinkedIn (2 min per post, anytime today)

1. Open your Google Sheets content hub
2. Copy post text
3. Open LinkedIn → Create Post
4. Paste text + upload image from `data/media/` (if generated)
5. Post!
6. Update status to "Posted" in Sheets
7. Note: remember to enter engagement for this post at the 24h mark (Step 0 tomorrow or the next day depending on post time)

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

The Build → The Lesson → The Person → repeats (weighted by engagement data once available)

## Engagement Tracking Schedule

| Post Posted | Engagement Entered At |
|-------------|----------------------|
| Mon 10am Post 1 | Tue 10am (24h later) |
| Mon 4pm Post 2 | Tue 4pm (24h later) |
| Wed 10am Post 1 | Thu 10am (24h later) |

This ensures every post is measured at exactly 24 hours old for fair comparison.

## Calibration Reports

Every 10 posts, review the calibration report in `data/engagement/calibration-reports/`.

It tells you what's working and what's not. The Post Generator uses this to auto-adjust future posts.

## File Locations

| What | Where |
|------|-------|
| Style profile | `config/style-profile.json` |
| Daily research | `data/research/YYYY-MM-DD-topics.json` |
| Daily posts | `data/posts/YYYY-MM-DD-posts.json` |
| Engagement database | `data/engagement/posts-db.jsonl` |
| Engagement analysis | `data/engagement/engagement-log.json` |
| Calibration reports | `data/engagement/calibration-reports/` |
| Images | `data/media/YYYY-MM-DD-{pillar}.png` |
| Skills | `skills/01-style-analyzer.md` through `05-engagement-tracker.md` |
