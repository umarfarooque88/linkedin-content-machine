# LinkedIn Content Machine — Handover Document

> Last updated: 2026-04-05
> Status: **Running** — Daily posts being generated, ready for LinkedIn
> Decision: Approach C (Evergreen + Trend Mix) — 2 posts daily

---

## What We're Building

A **daily LinkedIn content generation system** that automates research, post writing, and image creation for Umar Farooque's LinkedIn account. The system is **semi-automated** — AI generates everything, Umar reviews in ~10 min, then manually posts. Zero risk of ToS violation.

## Why

Umar has 1700+ connections but near-zero engagement (3-4 likes). No time to research or write. Goal: build personal brand + thought leadership in the professional journey + tech space. Posting 2x daily.

## User Profile

| Field | Value |
|-------|-------|
| Name | Umar Farooque |
| Location | Pune, India |
| Role | Full-Stack Developer @ BuildStudio |
| Education | BTech CS @ MIT ADT University |
| Key Projects | OutreachAI (cold email platform), Hostel Mess Management System |
| Portfolio | umarfarooque.netlify.app |
| Headline | "Full-Stack Developer | Building Scalable Systems & Backend-Driven Applications" |
| Positioning | Professional journey + tech mix |

## Architecture

```
[Style Analyzer (one-time setup)]
         |
         v
[Research Engine (daily scan)] --> [Post Generator (daily, 2 posts)]
                                           |
                                ┌────────────────────┐
                                v                     v
                         [Text Posts]          [Media Generator]
                                │                     │
                                └──────────┬──────────┘
                                           v
                              [Google Sheets Content Hub]
                               (post text + image + status)
                                           |
                                  [Umar reviews + posts]
                                           |
                                   LinkedIn (manual)
```

## Daily Post Structure

| Time | Post | Purpose |
|------|------|---------|
| Morning | **TREND** — Breaking AI/tech news with unique take | First to market, rides engagement |
| Later | **PILLAR** — Build/Lesson/Person (rotating) | Show who you are, build authority |

## Content Pillars (4)

1. **The Build** — Projects, technical decisions, architecture choices
2. **The Lesson** — Mistakes, learnings, growth moments
3. **The Take** — Opinions on AI/tech trends ("Everyone's wrong about X")
4. **The Person** — Career journey, authentic life content

Daily rotation through pillars. Post 1 is always trend-anchored.

## 4 Custom Skills

| Order | Skill | Purpose | Input | Output |
|-------|-------|---------|-------|--------|
| 1 | Style Analyzer | Extract Umar's voice profile | Writing samples, interview | `config/style-profile.json` |
| 2 | Research Engine | Daily AI/tech trend detection | HN "New" feed, The Verge AI | `data/research/YYYY-MM-DD-topics.json` |
| 3 | Post Generator | Write 2 daily posts with viral hooks | Style + research + pillar | `data/posts/YYYY-MM-DD-posts.json` |
| 4 | Content Scheduler | Store + track in Google Sheets | Today's posts | Formatted for Sheets paste |

## Key Learnings (Calibrated from actual post runs)

### Hook Rules (CRITICAL — determines whether anyone reads anything)

**Trend posts:** Lead with the BRAND NAME + bold claim. Max 15 words.
- ✅ "Perplexity's biggest secret got leaked in a lawsuit."
- ❌ "The incognito mode you trusted is a lie."

**Pillar posts:** Use a contrarian opening — challenge a common belief. Max 12 words.
- ✅ "Everyone tells you to scale first. I wish someone told me to stop."
- ❌ "I wasted 3 months building the wrong thing."

### Post Writing Rules
- 80-150 words MAXIMUM — short and punchy
- Topic-first, not resume — Umar's voice in 1-2 lines max
- NEVER mention "Outrier" or "Microspectra"
- BuildStudio can be mentioned (it's Umar's own company)
- Line break between each idea
- End with a question, never a hard CTA

### Research Speed Strategy
We source from **fresh feeds**, not trending pages:
| Source | Delay | Why |
|--------|-------|-----|
| HN "New" | 0-30 min | Stories posted in the last hour, before they trend |
| HN "Ask HN" | 0-60 min | Live discussions happening NOW |
| The Verge AI | Article publish time | Today's new articles |
| HN "Top" | Reference only | Check what's ALREADY saturated — AVOID those |

### Research Method
**WebSearch doesn't work with free model.** We use the Chrome browser plugin:
```
Navigate to: https://news.ycombinator.com/newest → Extract markdown
Navigate to: https://www.theverge.com/ai-artificial-intelligence → Extract markdown
```
No API needed, no credits needed, works with any model.

### Media Generation
- Tool: Pollinations.ai (free, no API key, Flux model)
- Status: Hit-or-miss results. Deferred — text-only posts work fine on LinkedIn for now.
- Decision: Skip images until we find a reliable solution (Canva API, text-overlay templates, etc.)

## Known Weaknesses (To Fix Next)

1. **No feedback loop** — We generate but never learn what works. Need engagement tracking.
2. **Research is shallow** — Grabbing headlines only, not reading articles/comments where real conversations are.
3. **Personal experience feels generic** — Needs more specific, unique-to-Umar details.
4. **No connection analysis** — Don't know what Umar's 1700 connections actually engage with.
5. **No Google Sheets integration** — Still manual copy-paste, should be automated.
6. **No topic calendar** — Risk of repeating themes or having gaps.
7. **Style profile is "initial"** — Needs calibration after several days of posts.

## Data Sources

- `Dataset/` — Full LinkedIn data export (Basic_LinkedInDataExport_04-05-2026.zip)
- `data/research/` — Daily research output (live news from HN + The Verge)
- `data/posts/` — All generated posts (JSON format, with full post text + metadata)

## File Structure

```
├── .gitignore                  # Ignore Dataset/, media/, .claude/
├── .gitkeep                    # Empty media directory tracking
├── README.md                   # Project overview
├── HANDOVER.md                 # This file
├── DAILY-WORKFLOW.md           # Step-by-step daily process
├── config/
│   ├── daily-config.json       # Post frequency, pillar rotation settings
│   └── style-profile.json      # Umar's voice calibration
├── data/
│   ├── research/               # Daily research (YYYY-MM-DD-topics.json)
│   ├── posts/                  # Daily posts (YYYY-MM-DD-posts.json)
│   └── media/                  # Generated images (deferred)
├── docs/
│   └── superpowers/
│       ├── plans/              # Implementation plans
│       └── specs/              # Design specifications
├── scripts/
│   └── download-images.js      # Pollinations.ai image downloader
└── skills/
    ├── 01-style-analyzer.md    # Analyzes writing samples
    ├── 02-research-engine.md   # Scans daily AI/tech trends
    ├── 03-post-generator.md    # Generates 2 daily posts
    └── 04-content-scheduler.md # Formats for Google Sheets
```

## Daily Workflow

See `DAILY-WORKFLOW.md` — ~10 minutes per day:
1. Research (3 min) → 2. Generate (3 min) → 3. Download images (if using) → 4. Format for Sheets (1 min) → 5. Review & copy (2 min) → 6. Post on LinkedIn (2 min per post)

## Environment

- Platform: Windows 11, Win32
- Shell: Bash (Git Bash)
- Node.js: v22.15.0
- Python: Not installed
- Chrome browser plugin: Works perfectly for research
- GitHub repo: `Umar-Farooque/linkedin-content-machine`

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Approach C (Evergreen + Trend Mix) | Balance consistency with relevance |
| No auto-posting | Zero ToS risk, still fast |
| 2 posts per day | Maximum feed presence, faster learning |
| Google Sheets as hub | Familiar, accessible, organized |
| Pollinations.ai for images | Free, no API key — but quality is hit-or-miss |
| Chrome browser for research | Works with free model, no credits needed |
| HN "New" over HN "Top" | Speed advantage — post before news trends |
| Brand-name hooks for trends | Named brands = instant context = scroll stop |
| Contrarian hooks for pillars | Challenge beliefs = tension loop = engagement |

## What's Working Well

- Research via Chrome browser pulls real live data
- Hook rules are calibrated — posts now have punchy, brand-named openers
- Short format (80-150 words) matches LinkedIn's sweet spot
- No employer name-dropping — posts feel like thought leadership, not resumes

## What Needs Work

- Feedback loop (engagement tracking)
- Deep research (read articles, not just headlines)
- Connection analysis (know your audience)
- Google Sheets API integration
- Consistent image quality (or skip images)

---

*This document should be updated after each significant iteration of the system.*
