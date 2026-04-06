# LinkedIn Content Machine — Handover Document

> Last updated: 2026-04-06
> Status: **Full Chrome Replacement Complete** — RSS/API-based research + 6-tag hashtag strategy
> Decision: Approach C (Evergreen + Trend Mix) — 2 posts daily — 6 hashtags per post

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
                   RSS/API feeds (no browser needed)
                              |
           ┌──────────────────┼──────────────────┐
           v                  v                   v
  [HN "New/Ask/Top"]  [HN "Ask"]  [The Verge AI RSS]
           |                  |                   |
           └──────────────────┼──────────────────┘
                              v
                  [fetch-research.js script]
                              |
                              v
              [Research Engine: rank + filter]
                              |
              [deep-dive.js on #1 topic]
                (Jina API + HN Firebase)
                              |
                              v
               [Post Generator (daily, 2 posts)]
                              |
                     ┌───────────────┐
                     v               v
              [Text Posts]    [Download Images]
                     │          (Pollinations)
                     └──────┬──────┘
                            v
               [Content Scheduler → Google Sheets]
                            |
                   [Umar reviews + posts]
                            |
                    LinkedIn (manual posting)
                            |
                   [Engagement Tracker enters stats]
                            |
                   [Calibration → Post Generator auto-adjusts]
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

## 5 Custom Skills

| Order | Skill | Purpose | Input | Output |
|-------|-------|---------|-------|--------|
| 1 | Style Analyzer | Extract Umar's voice profile | Writing samples, interview | `config/style-profile.json` |
| 2 | Research Engine | Daily AI/tech trend detection | HN "New" feed, The Verge AI | `data/research/YYYY-MM-DD-topics.json` |
| 3 | Post Generator | Write 2 daily posts with viral hooks | Style + research + pillar | `data/posts/YYYY-MM-DD-posts.json` |
| 4 | Content Scheduler | Store + track in Google Sheets, flag pending engagement | Today's posts | Formatted for Sheets paste |
| 5 | Engagement Tracker | Track, analyze, auto-calibrate the system | Manual likes/comments input | `data/engagement/engagement-log.json` |

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
**RSS feeds — no web scraping needed.** We run a local script (`scripts/fetch-research.js`) that fetches 4 RSS feeds:
```
node scripts/fetch-research.js
```
- HN "New" → https://hnrss.org/newest?count=30
- HN "Ask" → https://hnrss.org/ask?count=30
- HN "Top" → https://hnrss.org/best?count=30
- The Verge AI → https://www.theverge.com/rss/ai-artificial-intelligence/index.xml

**Phase 2 Deep Dive — API-based article extraction + comment mining:**
```
node scripts/deep-dive.js <article_url> [search_term]
```
- Article body: Jina Reader API (`r.jina.ai/<url>`) — free, 200/day, clean markdown
- HN comments: Firebase API (`hacker-news.firebaseio.com/v0/item/<id>.json`) — free, no auth, unlimited
- Non-HN article discussion: Algolia HN search — free, no auth needed

Structured data from all sources. No API keys, no credits, no browser needed.

### Media Generation
- Tool: Pollinations.ai (free, no API key, Flux model)
- Status: Hit-or-miss results. Deferred — text-only posts work fine on LinkedIn for now.
- Decision: Skip images until we find a reliable solution (Canva API, text-overlay templates, etc.)

## Original 9 Weaknesses — Status

| # | Problem | Status | Details |
|---|---------|--------|---------|
| 1 | **No feedback loop — flying blind** | ✅ FIXED | Engagement tracker (skill 05) built. Multi-dimensional analysis tracks engagement by pillar, hook type, word count, hashtag set, day of week, topic category. System auto-calibrates Post Generator using confidence-weighted calibration. Append-only JSONL database + rolling analysis with confidence levels. Full implementation: `skills/05-engagement-tracker.md`, `data/engagement/`. See HANDOVER.md "The Engagement Feedback Loop" section for complete details. |
| 2 | **Research is shallow** | ✅ FIXED | Deep research engine upgraded. Three-phase flow: headline scan → article extraction + comment mining → two-part output (enriched JSON + deep brief markdown). Selects #1 hot topic, reads full article body, mines top 20 HN comments for sentiment/counter-arguments/post angles. For non-HN sources: searches HN for related discussions. Fallback rules for empty/comment-sparse topics. Post Generator now consumes deep brief when available. Full changes: `skills/02-research-engine.md` (Phase 2 + 3 added), `skills/03-post-generator.md` (deep brief integration). Design: `docs/superpowers/specs/2026-04-05-deep-research-design.md`. |
| 3 | **Personal experience feels generic** | ✅ FIXED | Created `data/personal/experience-brief.md` — a living document extracted from Umar's personal research reports containing specific projects (OutreachAI, BuildStudio, Hostel Mess System, STERL, AI Medical Triage), key decisions (building in college, fast iteration over perfectionism, services + products focus), beliefs (AI replaces coding not problem-solving, speed > perfectionism, ideas cheap vs scale hardest), struggles (moving too fast → incomplete systems, refining vs testing, high-complexity ideas), thinking patterns (root cause first, systems thinking, minimal-human-intervention design), and real context (college life, self-taught path, freelancer mindset). Post Generator now reads this brief and enforces specificity rules: every pillar post must reference specific projects, decisions, or beliefs. Research Engine cross-references the brief for personal connections. Generic language ("I built a platform") replaced with concrete references ("I built OutreachAI, a cold email platform"). Full changes: `data/personal/experience-brief.md`, updated `skills/03-post-generator.md` and `skills/02-research-engine.md`. |
| 4 | **No connection analysis** | REMOVED | Network mining via Chrome was removed. The engagement feedback loop (#1) provides superior ground-truth data. |
| 5 | **Image pipeline is dead weight** | Open | Pollinations gives hit-or-miss results. Deferred. |
| 6 | **No Google Sheets integration** | Open | Still manual copy-paste. No API integration yet. |
| 7 | **No topic calendar** | Open | Risk of repeating themes or having gaps. |
| 8 | **No hashtag strategy** | ✅ FIXED | Three-layer hashtag system: 3 fixed core tags (`#BuildInPublic`, `#AI`, `#BuildStudio`) always present, 2 topic-match tags from dictionary (7 categories mapped), 1 rotating discovery tag from pool of 8. Total 6 per post. Engagement tracker logs per-tag + per-set performance, auto-calibrates preferred/banned lists. |
| 9 | **No consistency between days** | ✅ Part of #1 | Handled by calibration reports that run every 10 posts. |

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
│   ├── daily-config.json       # Post frequency, pillar rotation, hashtags-per-post (6)
│   └── style-profile.json      # Voice + core/topic/discovery hashtag dictionaries
├── data/
│   ├── research/               # Daily research (YYYY-MM-DD-topics.json)
│   ├── posts/                  # Daily posts (YYYY-MM-DD-posts.json)
│   ├── media/                  # Generated images (deferred)
│   └── engagement/             # Feedback loop data
│       ├── posts-db.jsonl      # Append-only post fingerprints + engagement
│       ├── engagement-log.json # Multi-dimensional analysis + calibration
│       └── calibration-reports/ # Periodic calibration reports
├── docs/
│   └── superpowers/
│       ├── plans/              # Implementation plans
│       └── specs/              # Design specifications
├── scripts/
│   ├── fetch-research.js       # RSS feed fetcher — HN + The Verge research data
│   ├── deep-dive.js            # Article extraction + HN comment mining (Jina + Firebase APIs)
│   └── download-images.js      # Pollinations.ai image downloader
└── skills/
    ├── 01-style-analyzer.md    # Analyzes writing samples
    ├── 02-research-engine.md   # RSS feeds + Jina/Firebase APIs — no Chrome
    ├── 03-post-generator.md    # Generates 2 daily posts with 6-tag hashtag strategy
    ├── 04-content-scheduler.md # Formats for Google Sheets
    └── 05-engagement-tracker.md# Tracks per-tag + per-set engagement, auto-calibrates
```

## Daily Workflow

See `DAILY-WORKFLOW.md` — ~10 minutes per day:
1. Research (3 min) → 2. Generate (3 min) → 3. Download images (if using) → 4. Format for Sheets (1 min) → 5. Review & copy (2 min) → 6. Post on LinkedIn (2 min per post)

## Environment

- Platform: Windows 11, Win32
- Shell: Bash (Git Bash)
- Node.js: v22.15.0
- Python: Not installed
- GitHub repo: `Umar-Farooque/linkedin-content-machine`
- RSS feeds for research: hnrss.org + The Verge RSS

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Approach C (Evergreen + Trend Mix) | Balance consistency with relevance |
| No auto-posting | Zero ToS risk, still fast |
| 2 posts per day | Maximum feed presence, faster learning |
| Google Sheets as hub | Familiar, accessible, organized |
| Pollinations.ai for images | Free, no API key — but quality is hit-or-miss |
| RSS feeds for research | Structured data, instant, no browser/credits needed |
| HN "New" over HN "Top" | Speed advantage — post before news trends |
| Brand-name hooks for trends | Named brands = instant context = scroll stop |
| Contrarian hooks for pillars | Challenge beliefs = tension loop = engagement |

## What's Working Well

- RSS feeds for research pull structured data instantly (no browser needed)
- Deep dive API extracts full articles + HN comments automatically (Jina + Firebase)
- Hook rules are calibrated — posts now have punchy, brand-named openers
- Short format (80-150 words) matches LinkedIn's sweet spot
- No employer name-dropping — posts feel like thought leadership, not resumes
- 6-tag hashtag strategy: 3 core (#BuildInPublic, #AI, #BuildStudio) + 2 topic-match + 1 rotating discovery
- Network mining (Phase 4) removed — engagement tracker provides superior ground-truth calibration

## What Needs Work

- Google Sheets API integration
- Consistent image quality (or skip images)
- Topic calendar

---

*This document should be updated after each significant iteration of the system.*
