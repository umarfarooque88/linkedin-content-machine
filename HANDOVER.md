# LinkedIn Content Machine — Handover Document

> Last updated: 2026-04-05
> Status: **Running with Feedback Loop** — Engagement tracking active, system self-calibrating
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

## Original 9 Weaknesses — Status

| # | Problem | Status | Details |
|---|---------|--------|---------|
| 1 | **No feedback loop — flying blind** | ✅ FIXED | Engagement tracker (skill 05) built. Multi-dimensional analysis tracks engagement by pillar, hook type, word count, hashtag set, day of week, topic category. System auto-calibrates Post Generator using confidence-weighted calibration. Append-only JSONL database + rolling analysis with confidence levels. Full implementation: `skills/05-engagement-tracker.md`, `data/engagement/`. See HANDOVER.md "The Engagement Feedback Loop" section for complete details. |
| 2 | **Research is shallow** | ✅ FIXED | Deep research engine upgraded. Three-phase flow: headline scan → article extraction + comment mining → two-part output (enriched JSON + deep brief markdown). Selects #1 hot topic, reads full article body, mines top 20 HN comments for sentiment/counter-arguments/post angles. For non-HN sources: searches HN for related discussions. Fallback rules for empty/comment-sparse topics. Post Generator now consumes deep brief when available. Full changes: `skills/02-research-engine.md` (Phase 2 + 3 added), `skills/03-post-generator.md` (deep brief integration). Design: `docs/superpowers/specs/2026-04-05-deep-research-design.md`. |
| 3 | **Personal experience feels generic** | ✅ FIXED | Created `data/personal/experience-brief.md` — a living document extracted from Umar's personal research reports containing specific projects (OutreachAI, BuildStudio, Hostel Mess System, STERL, AI Medical Triage), key decisions (building in college, fast iteration over perfectionism, services + products focus), beliefs (AI replaces coding not problem-solving, speed > perfectionism, ideas cheap vs scale hardest), struggles (moving too fast → incomplete systems, refining vs testing, high-complexity ideas), thinking patterns (root cause first, systems thinking, minimal-human-intervention design), and real context (college life, self-taught path, freelancer mindset). Post Generator now reads this brief and enforces specificity rules: every pillar post must reference specific projects, decisions, or beliefs. Research Engine cross-references the brief for personal connections. Generic language ("I built a platform") replaced with concrete references ("I built OutreachAI, a cold email platform"). Full changes: `data/personal/experience-brief.md`, updated `skills/03-post-generator.md` and `skills/02-research-engine.md`. |
| 4 | **No connection analysis** | ✅ FIXED | Added automated daily network mining (Phase 4 of Research Engine). System visits 3 connection profiles per day via Chrome browser, extracts their top 3 performing + 3 recent posts (topic, engagement, format, hook style, word count), stores cumulatively in `data/network/network-profiles.json`. Weekly insights calculated every Monday (requires 5+ profiles with posts): top-performing topics, formats, hook styles, word count buckets, active connection types. Post Generator reads network insights (Step 0.5) and calibrates format/hook/style choices. After 4 weeks (~60 profiles): robust pattern recognition of what works in Umar's specific network of 1,653 connections. Source: `Dataset/Basic_LinkedInDataExport_04-05-2026/Connections.csv`. |
| 5 | **Image pipeline is dead weight** | Open | Pollinations gives hit-or-miss results. Deferred. |
| 6 | **No Google Sheets integration** | Open | Still manual copy-paste. No API integration yet. |
| 7 | **No topic calendar** | Open | Risk of repeating themes or having gaps. |
| 8 | **No hashtag strategy** | ✅ Part of #1 | Handled by engagement tracker — analyzes hashtag set performance, recommends preferred/banned sets. |
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
│   ├── daily-config.json       # Post frequency, pillar rotation settings
│   └── style-profile.json      # Umar's voice calibration
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
