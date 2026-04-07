# Content Scheduler

Format today's posts for Google Sheets, download images, and manage the content pipeline.

## Instructions

### Step 1: Read Today's Posts

Read `data/posts/YYYY-MM-DD-posts.json`

### Step 2: Download Images

Use the Pollinations API to generate and download images for each post:

For each post's `image_prompt`, fetch:
```
https://image.pollinations.ai/prompt/{URL_ENCODED_PROMPT}?width=1200&height=630&model= flux&seed=random
```

Save images to `data/media/YYYY-MM-DD-{pillar-slug}.png`

If the image generation fails or times out (15s max), use a fallback prompt and retry once.

### Step 3: Format for Telegram Delivery

The Telegram bot reads this file and delivers posts automatically. No manual formatting needed.

```
═══════════════════════════════════
POST #1  |  Draft  |  YYYY-MM-DD
Pillar: [pillar name]
═══════════════════════════════════

POST TEXT (copy everything below):

[full_post_text with hashtags]

IMAGE: data/media/YYYY-MM-DD-{pillar-slug}.png
Topic Source: [url or "pillar rotation"]

═══════════════════════════════════
POST #2  |  Draft  |  YYYY-MM-DD
Pillar: [pillar name]
═══════════════════════════════════

POST TEXT (copy everything below):

[full_post_text with hashtags]

IMAGE: data/media/YYYY-MM-DD-{pillar-slug}.png
Topic Source: [url or "pillar rotation"]
```

### Step 4: Update Post JSON Files

Add `"status": "Draft"` and the actual image file path to each post in `data/posts/YYYY-MM-DD-posts.json`.

### Step 5: Check Previous Days' Posts

Look at recent post files for any status anomalies:
- Any "Draft" posts older than 7 days? Flag them with a reminder.
- Any "Posted" posts but missing engagement data? Remind to add likes/comments count.

### Step 6: Output Summary

```
Content Report: YYYY-MM-DD
============================
POST 1: [Pillar] — [{status}] — Image: [{status}]
POST 2: [Pillar] — [{status}] — Image: [{status}]

Images: data/media/
Posts:  data/posts/YYYY-MM-DD-posts.json

Copy the formatted output above into Google Sheets.
Upload images to Google Drive and paste Drive link in the Media column.
```

### Step 7: Add Engagement Placeholder to Post JSON

For each post in `data/posts/YYYY-MM-DD-posts.json`, add:

```json
"engagement": {
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "scraped_at": null,
  "status": "pending"
}
```

### Step 8: Suggest Tomorrow's Pillar Rotation

Based on what pillars were used today, suggest tomorrow:

```
Suggested pillars for tomorrow (YYYY-MM-DD):
POST 1: The Take (trend-anchored — always)
POST 2: [next pillar in rotation]
```

### Step 9: Flag Pending Engagement Entries

Check `data/engagement/posts-db.jsonl` — which posts are missing engagement data?

Look at `data/posts/` directory and find posts older than 24 hours that haven't been tracked:
- For each such post, display: `[POST ID] — [Date] — [Pillar] — Status: PENDING (24h+ elapsed)`

If there are pending posts, remind the user:
```
Reminder: You have XX posts pending engagement entry.
Run: "track engagement for <date>" to enter likes, comments, shares.
This feeds the learning engine and calibrates tomorrow's output.
```

## File Management

- Never delete old post files
- Never delete old engagement entries (append-only)
- Images are stored as PNGs in `data/media/`
- Posts are stored as JSON in `data/posts/`
- Research is stored as JSON in `data/research/`
- Engagement data is in `data/engagement/`
- All files use YYYY-MM-DD naming convention for easy sorting
