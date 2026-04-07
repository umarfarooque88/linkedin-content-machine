# LinkedIn Content Machine — Handover Document

> Last updated: 2026-04-07
> Status: **Honest Framing + Full Enforcement** — Topic calendar, 6-tag hashtag, content strategy rewrite
> Decision: Approach C (Evergreen + Trend Mix) — 2 posts daily — 6 hashtags per post — Mix of content angles for pillar posts

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
| Key Projects | OutreachAI (email automation learning project), Hostel Mess Management System (deployed at college), LinkedIn automation system (this project) |
| Portfolio | umarfarooque.netlify.app |
| Headline | "Full-Stack Developer | Building Scalable Systems & Backend-Driven Applications" |
| Positioning | Professional journey + tech mix + honest building-in-public |

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
              [Research Engine: rank + filter + topic dedup]
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
                            |
                   [Topic Calendar updates coverage]
```

## Daily Post Structure

| Time | Post | Purpose |
|------|------|---------|
| Morning | **TREND** — Breaking AI/tech news with unique take | First to market, rides engagement |
| Later | **PILLAR** — Build/Lesson/Person/Today's Journey (mix) | Show who you are, build authority |

## Content Pillars (4)

1. **The Build** — Projects, technical decisions, architecture choices
2. **The Lesson** — Mistakes, learnings, growth moments
3. **The Take** — Opinions on AI/tech trends ("Everyone's wrong about X")
4. **The Person** — Career journey, authentic life content

**Pillar POST 2 content mix** — not limited to project references:
1. Today's building journey (what Umar actually worked on today)
2. Learning lessons from projects (honestly framed)
3. Tech analysis (opinion pieces with developer perspective)
4. College dev life (building while studying, career decisions)
5. Project updates (when genuinely relevant, honestly framed)

No inflated project language. Everything honest, nothing exaggerated.

## Post Writing Rules (2026-04-07 Update)

- 80-150 words MAXIMUM — short and punchy
- Topic-first, not resume — Umar's voice in 1-2 lines max
- NEVER mention "Outrier" or "Microspectra"
- NEVER inflate projects — call prototypes prototypes, not platforms
- Line break between each idea
- End with a question, never a hard CTA

### Honest Framing Rules (ADDED 2026-04-07)
- **Do NOT** call any project a "platform" unless it has paying users
- **Do NOT** use "production-grade," "at-scale," "enterprise," "revolutionary"
- **Do NOT** frame learning prototypes as shipped products
- **Do NOT** name "OutreachAI" as a brand — describe: "an email automation system I'm building"
- **Say instead**: "Today I built X and realized Y" — daily building IS the content
- **Say instead**: "Deployed my hostel mess app to real users and watching what breaks"

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

### Hashtag Strategy (ENFORCED 2026-04-07)
Exactly 6 hashtags per post, strict composition:
- **3 core (always):** `#BuildInPublic #AI #BuildStudio` — first 3 tags, never reordered
- **2 topic-match:** From 7 mapped categories in `config/style-profile.json` → `topic_hashtags`
- **1 discovery:** Rotating from pool of 8 in `config/style-profile.json` → `discovery_hashtags`

**Forbidden:** Brand names as hashtags, project names as hashtags, any tag not in the approved dictionaries. Engagement tracker logs per-tag and per-set performance, auto-calibrates preferred/banned after 10+ posts.

### Topic Calendar (BUILT 2026-04-07)
`data/topics/calendar.json` tracks all posted topics. Rules enforced:
- **Dedup:** Skip same-topic repeats within 7-day window (keyword matching)
- **Gap priority:** Under-covered pillars and categories get boosted
- **Auto-update:** Calendar refreshes after each day's posts with coverage stats
- **Rotation targets:** Weekly targets for pillar balance (`The Lesson: 3/week, The Person: 3/week`)

## Original 9 Weaknesses — Status

| # | Problem | Status | Details |
|---|---------|--------|---------|
| 1 | **No feedback loop — flying blind** | ✅ FIXED | Engagement tracker (skill 05) built. Multi-dimensional analysis tracks engagement by pillar, hook type, word count, hashtag set, day of week, topic category. System auto-calibrates Post Generator using confidence-weighted calibration. Append-only JSONL database + rolling analysis with confidence levels. Full implementation: `skills/05-engagement-tracker.md`, `data/engagement/`. |
| 2 | **Research is shallow** | ✅ FIXED | Deep research engine upgraded. Three-phase flow: headline scan → article extraction + comment mining → two-part output (enriched JSON + deep brief markdown). Selects #1 hot topic, reads full article body, mines top 20 HN comments for sentiment/counter-arguments/post angles. For non-HN sources: searches HN for related discussions. Fallback rules for empty/comment-sparse topics. Post Generator now consumes deep brief when available. Full changes: `skills/02-research-engine.md` (Phase 2 + 3 added), `skills/03-post-generator.md` (deep brief integration). Design: `docs/superpowers/specs/2026-04-05-deep-research-design.md`. |
| 3 | **Personal experience feels generic** | ✅ FIXED + REWRITTEN | Experience brief (`data/personal/experience-brief.md`) completely rewritten with honest framing. Projects described as learning prototypes, not production SaaS. Post Generator rules updated: daily building journey is valid content source, project mentions must be honest ("an email automation system I'm building" not "OutreachAI, a cold email platform"). FORBIDDEN list for inflated language (platform, production-grade, at-scale). Priority order: today's work → real lessons → decisions → beliefs → struggles. |
| 4 | **No connection analysis** | REMOVED | Network mining via Chrome was removed. The engagement feedback loop (#1) provides superior ground-truth data. |
| 5 | **Image pipeline is dead weight** | Open | Pollinations gives hit-or-miss results. Deferred. |
| 6 | **No Google Sheets integration** | Open | Still manual copy-paste. No API integration yet. |
| 7 | **No topic calendar** | ✅ FIXED | Topic calendar (`data/topics/calendar.json`) tracks all posted topics with date, pillar, category, headline, keywords, and angle. Research Engine dedups against `recently_used_keywords` (7-day window) — skips same event/product unless hot + new angle. Post Generator reads `gaps.uncovered_pillars` and `gaps.uncovered_categories` to fill coverage holes. Calendar auto-updates with coverage stats, gap analysis, and rotation targets per week. Backfilled with all existing posts. |
| 8 | **No hashtag strategy** | ✅ FIXED | Three-layer hashtag system: 3 fixed core tags (`#BuildInPublic`, `#AI`, `#BuildStudio`) always present in first 3 positions, 2 topic-match tags from dictionary (7 categories, 14+ options), 1 rotating discovery tag from pool of 8. Total 6 per post — strictly enforced. Only approved hashtags may appear (no brand names, no project names, no fabricated tags). Post Generator skill updated with FORBIDDEN list for invalid hashtags. Engagement tracker logs per-tag + per-set performance, auto-calibrates preferred/banned lists after 10+ posts. Existing posts (Apr 5, Apr 6) retrofixed. |
| 9 | **No consistency between days** | ✅ Part of #1 | Handled by calibration reports that run every 10 posts. |

## Hashtag Dictionaries

### Core (always, exactly these 3)
`#BuildInPublic` `#AI` `#BuildStudio`

### Topic-Match (pick 2 from matching category)
- AI tools, models, APIs → `#AISystems` `#LLM` `#MachineLearning`
- Developer workflow, code craft → `#SoftwareEngineering` `#DeveloperLife`
- Products, startups, founding → `#ProductDevelopment` `##Startups` `#FounderJourney`
- Career, education, journey → `#SelfTaughtDeveloper` `#CareerGrowth`
- Automation, systems, productivity → `#Automation` `#Productivity`
- Business ops, SaaS, tech news → `#SaaS` `#TechNews`
- Opinions, developer economy → `#DeveloperEconomy` `#TechCommunity`

### Discovery (rotate from pool)
`#FutureOfWork` `#Innovation` `#WebDev` `#OpenSource` `#DeveloperEconomy` `#TechCommunity` `#CodingLife` `#StartupMindset`

## Data Sources

- `Dataset/` — Full LinkedIn data export (Basic_LinkedInDataExport_04-05-2026.zip)
- `data/research/` — Daily research output (live news from HN + The Verge)
- `data/posts/` — All generated posts (JSON format, with full post text + metadata)
- `data/topics/calendar.json` — Topic tracking, dedup, coverage history

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
│   ├── topics/                 # Topic calendar (NEW)
│   │   └── calendar.json       # Posted topics, coverage, gaps, dedup
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
    ├── 02-research-engine.md   # RSS feeds + Jina/Firebase APIs + topic calendar dedup
    ├── 03-post-generator.md    # Generates 2 daily posts with 6-tag + honest framing
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
| Honest project framing | Prototypes as prototypes, daily building as content — no inflation |

## What's Working Well

- RSS feeds for research pull structured data instantly (no browser needed)
- Deep dive API extracts full articles + HN comments automatically (Jina + Firebase)
- Hook rules are calibrated — posts now have punchy, brand-named openers
- Short format (80-150 words) matches LinkedIn's sweet spot
- 6-tag hashtag strategy: 3 core (#BuildInPublic, #AI, #BuildStudio) + 2 topic-match + 1 rotating discovery
- Topic calendar: dedup, gap detection, coverage tracking — no repeats, no blank spots
- Daily building journey as content: what Umar worked on today = what he posts about tomorrow
- Honest framing: projects described as learning prototypes, not products

## What Needs Work

- Google Sheets API integration
- Consistent image quality (or skip images)
- Engagement tracking needs live data to calibrate

---

*This document should be updated after each significant iteration of the system.*
