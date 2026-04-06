# Network Pattern Miner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automated daily network mining that extracts top + recent posts from 3 active connection profiles per day, stores cumulative data, generates weekly insights, and feeds them into the Post Generator for calibration.

**Architecture:** Phase 4 added to Research Engine. Chrome browser visits 3 connection profiles daily, extracts post data, writes to cumulative JSON file. Weekly insights calculated and consumed by Post Generator.

**Tech Stack:** Markdown skill files, JSON data files, Chrome browser plugin for profile extraction, Connections.csv as input.

---

### Task 1: Create network data files and directory

**Files:**
- Create: `data/network/` directory
- Create: `data/network/network-profiles.json`
- Create: `data/network/network-insights.json`

- [ ] **Step 1: Create the directory**

Run:
```bash
mkdir -p "E:\LinkedIn Automation\data\network"
```

- [ ] **Step 2: Create network-profiles.json**

Write `data/network/network-profiles.json`:

```json
{
  "last_updated": null,
  "profiles_mined_total": 0,
  "active_posters": 0,
  "inactive_posters": 0,
  "profiles": [],
  "mining_queue": {
    "next_profiles_to_visit": [],
    "last_mined_index": 0,
    "total_connections_scanned": 0
  }
}
```

- [ ] **Step 3: Create network-insights.json**

Write `data/network/network-insights.json`:

```json
{
  "last_updated": null,
  "last_week_of": null,
  "profiles_analyzed_this_week": 0,
  "profiles_analyzed_total": 0,
  "top_performing_topics": [],
  "top_performing_formats": [],
  "top_performing_hook_styles": [],
  "avg_engagement_by_word_count": { "short": 0, "medium": 0, "long": 0 },
  "active_connection_types": [],
  "insights_available": false
}
```

### Task 2: Add Phase 4 (Network Mining) to Research Engine skill

**Files:**
- Modify: `skills/02-research-engine.md`

- [ ] **Step 1: Find the insertion point**

Read the current `skills/02-research-engine.md` file. Find the end of the "## Constraints" section at the bottom of the file. The file currently ends with:

```markdown
## Constraints

- Topics must be REAL news, not made up
- Unique angles must leverage Umar's actual experience
- Must avoid controversial topics that could hurt brand (politics, non-tech controversy)
- Never suggest reposting someone else's exact opinion — always a unique angle
```

- [ ] **Step 2: Read the Connections.csv to understand the data**

Read `Dataset/Basic_LinkedInDataExport_04-05-2026/Connections.csv`.

- [ ] **Step 3: Add Phase 4 section after the Constraints section**

Append the following new section after the "## Constraints" section:

```markdown
---

## Phase 4: Network Pattern Mining (daily, automated, 3 active profiles per day)

After generating today's research topics and deep brief, the system mines network patterns from Umar's connections.

### Step 4a: Initialize Mining Queue

Read `data/network/network-profiles.json` to get the current mining state.
Read `Dataset/Basic_LinkedInDataExport_04-05-2026/Connections.csv` for the full connection list.

**Selection algorithm:**

1. Sort connections by: (1) has company and/or role filled in first, (2) most recently connected first
2. Skip connections where `status` is already "inactive" in the profiles array
3. Skip connections mined in the last 7 days (check `mined_at` date)
4. Pick the next 3 connections that haven't been mined yet OR re-mine connections whose `last_mined_at` is more than 7 days old

For each of the 3 selected connections, proceed to extraction.

### Step 4b: Extract Post Data from Each Profile

For each selected connection:

**Navigate to their LinkedIn profile:**
```
Navigate to: [connection's LinkedIn URL from Connections.csv]
Extract: markdown format
```

**From the extraction, identify the connection's recent activity:**
- Look for their recent posts in their Activity section
- Note: LinkedIn profiles may show limited posts without deep scrolling. Extract what is visible.

**For each post found, extract:**
- Date of the post
- Topic in 1-3 words from the post headline/body
- Engagement numbers (likes, comments) visible on the post card
- Format: text, text + image, video, carousel
- Infer hook style: contrarian, personal story, announcement, question, or bold claim
- Estimate word_count_bucket: short (<100), medium (100-300), long (300+)

**Classify the posts:**
- Rank all visible posts by engagement (likes + comments)
- Select top 3 (highest engagement) — these are the top performers
- Select the 3 most recent — these show what they're posting now
- If fewer than 6 posts are visible, work with what's available

**If the connection has NO visible posts:**
- Mark their profile as: `"status": "inactive"`
- Increment `inactive_posters` counter
- Move to the next connection in the queue

### Step 4c: Output Profile Structure

For each active profile, append/update the profiles array in `data/network/network-profiles.json`:

```json
{
  "connection_name": "Devabratta Yumnam",
  "connection_url": "https://www.linkedin.com/in/devabratta-yumnam-92a382354",
  "company": "Nothing___Everything",
  "role": "Founder & CEO",
  "status": "active",
  "mined_at": "2026-04-06",
  "connection_type": "Founder/CEO",
  "top_3_posts": [
    {
      "date": "2026-03-28",
      "topic": "AI automation for small teams",
      "format": "text + image",
      "likes": 142,
      "comments": 23,
      "hook_style": "personal story opening",
      "word_count_bucket": "medium"
    }
  ],
  "recent_3_posts": [
    {
      "date": "2026-04-05",
      "topic": "startup funding round",
      "format": "text",
      "likes": 8,
      "comments": 1,
      "hook_style": "announcement",
      "word_count_bucket": "short"
    }
  ]
}
```

**Connection type categories (for active_connection_types tracking):**
- Founder/CEO
- Software Engineer/Developer
- Product Manager
- Designer
- Recruiter/HR
- Student
- Data Scientist/AI Engineer
- Marketing/Sales
- Other (specify)

### Step 4d: Update the Cumulative Database

After mining all 3 profiles for today:

1. Update `data/network/network-profiles.json` with the new profile data
2. Update counters:
   - `profiles_mined_total` = total profiles analyzed
   - `active_posters` = profiles with status "active"
   - `inactive_posters` = profiles with status "inactive"
   - `mining_queue.next_profiles_to_visit` = list of next 3 profile URLs for tomorrow
   - `mining_queue.last_mined_index` = current index in connection list
3. Set `last_updated` to today's date

### Step 4e: Weekly Insights Calculation (Mondays only)

If today is Monday:

1. Aggregate all profiles mined in the last 7 days (the current week's cohort)
2. Count `profiles_analyzed_this_week` from profiles with `mined_at` within the last 7 days
3. **Only calculate insights if we have at least 5 profiles with posts** from this week. Otherwise set `insights_available: false` and skip to Step 4f.

**Calculate the following:**

**top_performing_topics:**
- Group all posts with likes > 10 by topic
- Calculate avg_engagement (likes + comments) per topic
- Sort descending, return top 3
- Include post_count for statistical context

**top_performing_formats:**
- Group all posts with likes > 10 by format type
- Calculate avg_engagement per format
- Sort descending, return all
- Include post_count

**top_performing_hook_styles:**
- Group all posts with likes > 10 by hook_style
- Calculate avg_engagement per hook style
- Sort descending, return top 3
- Include post_count

**avg_engagement_by_word_count:**
- Group all posts with likes > 10 by word_count_bucket
- Calculate avg_engagement per bucket
- Calculate for all three buckets: short, medium, long

**active_connection_types:**
- From all profiles with status "active", count by connection_type
- Sort by count descending
- Return all types found with counts

Update `data/network/network-insights.json` with computed values. Set `insights_available: true`. Set `last_week_of` to current date.

### Fallback Rules

| Scenario | Response |
|----------|----------|
| LinkedIn shows CAPTCHA or "Verify you're human" | Skip ALL mining for today. Retry tomorrow. Log: "CAPTCHA encountered — mining paused" |
| Connection has no visible posts | Mark status: "inactive". Increment inactive counter. Pick next unmimed connection. |
| > 70% of attempted profiles are inactive | Note: "Majority of connections are inactive posters — consider reducing mining frequency" |
| Engagement numbers not visible on posts | Log post with likes: 0, comments: 0, "engagement_not_visible": true |
| Connection URL is invalid or profile deleted | Skip. Mark status: "unavailable". Pick next connection. |

### Display Summary

```
Network Mining Report: YYYY-MM-DD
=================================
Profiles mined: 3 (X active, X inactive)

Active posters:
  - [Name] ([Company]) — Top post: [topic] ([likes] likes)
  - [Name] ([Company]) — Top post: [topic] ([likes] likes)
  - [Name] ([Company]) — Top post: [topic] ([likes] likes)

Cumulative: X active posters, X inactive posters

[If Monday] Weekly insights generated:
  Top topic: [topic] — avg [X] engagement
  Top format: [format] — avg [X] engagement
  Top hook: [hook] — avg [X] engagement
```
```

### Task 3: Update Post Generator to read network insights

**Files:**
- Modify: `skills/03-post-generator.md`

- [ ] **Step 1: Add network insights to Step 0 (Read Calibration Data)**

Find the existing Step 0 section:

```markdown
### Step 0: Read Calibration Data (if available)

Read `data/engagement/engagement-log.json` if it exists. Check `total_posts_analyzed` and `confidence_level`:

- If 0-10 posts (confidence: "no_data"): ignore calibration, use defaults
- If 11+ posts: apply calibration settings from `calibration_settings` section:
  - **pillar_weights**: Weight pillar rotation probabilities (keep minimum 0.1 per pillar for variety)
  - **post_word_count_min / max**: Use instead of hardcoded 80-150
  - **hook_type_preference**: If set, use this hook type for both posts
  - **preferred_hashtags**: If non-empty, prefer these over others when choosing hashtags
  - **banned_hashtags**: Do NOT use these hashtags
  - **preferred_topic_categories**: When selecting research topics, prefer these categories
```

After this section, add a new Step 0.5:

```markdown
### Step 0.5: Read Network Insights (if available)

Read `data/network/network-insights.json` if it exists. Check `insights_available`:

- If `insights_available` is false: skip network calibration, continue with current settings
- If `insights_available` is true: use network patterns to calibrate format and style choices:

**Format choice:**
- Look at `top_performing_formats` — if text + image dominates, prefer that format. If text alone performs equally, text-only is fine.
- This should inform the IMAGE PROMPT priority: does this network even engage with image-heavy posts?

**Hook style:**
- Look at `top_performing_hook_styles` — if contrarian hooks significantly outperform others, weight the hook style toward contrarian.
- If personal story is dominant, weave more personal openings.

**Word count:**
- Look at `avg_engagement_by_word_count` — target the bucket with highest engagement.
- If "medium" wins, that supports the current 80-150 word range. If "short" wins, tighten. If "long" wins, expand slightly.

**Topic awareness:**
- If any of `top_performing_topics` overlap with today's research topic, lean harder into that overlap.
- Example: if "AI automation" is the top-performing topic in the network and today's deep brief is about AI-generated code, connect the angle explicitly to automation.

**Connection types:**
- Look at `active_connection_types` — are the active posters "Founder/CEO" types, "Software Engineer" types, or "Recruiter/HR" types?
- This tells you who in your network is creating content and getting engagement. Lean into what THEY post about.

Network calibration is secondary to engagement calibration. If engagement data exists and says "use 80-120 words" but network insights say "medium (100-300 words) wins," weight the engagement data more heavily (it's your own audience's behavior, network insights are your network's peers' behavior).
```

### Task 4: Update HANDOVER.md and commit

**Files:**
- Modify: `HANDOVER.md`

- [ ] **Step 1: Update Problem #4 in HANDOVER.md**

Find the current Problem #4 row:

```markdown
| 4 | **No connection analysis** | Open | Don't know what Umar's 1700 connections actually engage with. |
```

Replace with:

```markdown
| 4 | **No connection analysis** | ✅ FIXED | Added automated daily network mining (Phase 4 of Research Engine). System visits 3 connection profiles per day via Chrome browser, extracts their top 3 performing + 3 recent posts (topic, engagement, format, hook style, word count), stores in cumulative `data/network/network-profiles.json`. Weekly insights calculated every Monday (needs 5+ profiles with posts): top-performing topics, formats, hook styles, word count buckets, and active connection types. Post Generator reads network insights (Step 0.5) and calibrates format/hook/word count choices. After 4 weeks: ~60 profiles analyzed, robust pattern recognition of what works in Umar's specific network. Extraction data source: `Dataset/Basic_LinkedInDataExport_04-05-2026/Connections.csv`. Full changes: `data/network/`, updated `skills/02-research-engine.md` (Phase 4 added) and `skills/03-post-generator.md` (Step 0.5 added). |
```

- [ ] **Step 2: Commit all changes**

```bash
cd "E:\LinkedIn Automation"
git add data/network/network-profiles.json data/network/network-insights.json skills/02-research-engine.md skills/03-post-generator.md HANDOVER.md docs/superpowers/specs/2026-04-06-network-pattern-miner-design.md docs/superpowers/plans/2026-04-06-network-pattern-miner-plan.md
git commit -m "$(cat <<'EOF'
feat: add network pattern miner — automated daily connection profile analysis

Adds Phase 4 to Research Engine: visits 3 connection profiles per day via
Chrome, extracts top 3 + recent 3 posts with engagement data, stores cumulatively.
Weekly network insights generated every Monday (top topics, formats, hooks).
Post Generator reads insights to calibrate format/hook/style choices.

After 4 weeks (60 profiles): robust pattern recognition of what works in
Umar's specific network of 1,653 connections.

Design: specs/2026-04-06-network-pattern-miner-design.md
Plan: plans/2026-04-06-network-pattern-miner-plan.md
EOF
)"
```

- [ ] **Step 3: Push to GitHub**

```bash
cd "E:\LinkedIn Automation"
git push origin master
```