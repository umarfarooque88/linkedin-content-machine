# LinkedIn Content Machine

AI-powered daily LinkedIn content generation system. Researches trending topics, generates posts in your voice, and stores everything in Google Sheets.

## How It Works

Daily workflow (~10 minutes):

1. **Research** — Scans HN "New" and The Verge AI for breaking stories
2. **Generate** — Creates 2 posts (1 trend-anchored + 1 pillar-driven)
3. **Format** — Ready to copy to Google Sheets and LinkedIn

## Daily Post Structure

| Time | Post | Purpose |
|------|------|---------|
| Morning | TREND — What's hot in AI/tech today | Keep people informed, ride engagement |
| Later | PILLAR — Build/Lesson/Person (rotating) | Show who you are, build authority |

## Content Pillars

1. **The Build** — Projects, technical decisions, architecture choices
2. **The Lesson** — Mistakes, learnings, growth moments  
3. **The Take** — Opinions on AI/tech trends
4. **The Person** — Career journey, authentic life content

## Project Structure

```
├── config/              # Style profile and daily config
├── data/                # Generated content (research, posts, media)
├── docs/                # Design docs and implementation plans
├── scripts/             # Utilities (image downloader)
├── skills/              # Claude skill definitions
├── DAILY-WORKFLOW.md    # Step-by-step daily process
└── HANDOVER.md          # Project handover document
```

## Key Files

- `skills/02-research-engine.md` — Daily trend scanner (HN "New" + The Verge AI)
- `skills/03-post-generator.md` — Post writer with viral hook rules
- `config/style-profile.json` — Umar's voice calibration
- `scripts/download-images.js` — Pollinations.ai image downloader

## Status

Built and running. Daily posts generated and ready for LinkedIn.
