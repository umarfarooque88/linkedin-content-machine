# Network Pattern Miner — Design Spec

> Date: 2026-04-06
> Problem: #4 — No connection analysis (don't know what Umar's 1700 connections engage with)
> Solution: Automated daily network mining — extracts top 3 + recent 3 posts from 3 active-posting connections per day, stores cumulatively, generates weekly insights for Post Generator calibration

## Problem Statement

The system posts without knowing what Umar's network actually engages with. We don't know if connections are React devs, HR people, founders, or recruiters. Posts are calibrated against generic best practices, not what gets traction in this specific audience.

## Design

### Overview

Add Phase 4 to the Research Engine: "Network Mining." After deep research on trending topics, the system visits 3 connection profiles per day via Chrome browser, extracts their top-performing and recent posts, builds a cumulative profile database, and generates weekly insights about what works in Umar's network.

Fully automated. No extra user action. Runs as part of the daily research workflow (adds ~5 minutes).

### Architecture

```
Daily Flow:
[Research Engine Phase 1-3] → headline scan → deep dive → two-part output
         |
         v
[Research Engine Phase 4: Network Mining]
  → Read Connections.csv to get unmined connections
  → Skip connections already flagged as "inactive" (no visible posts)
  → Chrome visits 3 active-posting connection profiles
  → Scroll to their post section → extract top 3 + recent 3 posts
  → Write to network-profiles.json (cumulative)
  → If Monday: calculate weekly insights → network-insights.json

[Post Generator reads both files]
  → network-insights.json calibrates format/topic/hook choices
  → Posts optimized for what actually works in this specific network
```

### Profile Selection Logic

Source: `Dataset/Basic_LinkedInDataExport_04-05-2026/Connections.csv` (1,653 connections)

**Selection algorithm:**
1. Filter connections with company and/or role filled in (more likely to be active posters)
2. Check tracking file for `last_mined_at` — skip connections mined in the last 7 days
3. Pick next 3 unmimed connections
4. If connection has no visible posts after visiting, mark as `status: inactive` and skip. Pick next profile.
5. Target: 3 active posters per day

**Why company/role filter first:** Connections with blank company and position fields are typically dormant accounts, students who never updated profiles, or inactive users. We prioritize profiles with filled fields.

### What Gets Extracted Per Profile

```json
{
  "connection_name": "Devabratta Yumnam",
  "connection_url": "https://www.linkedin.com/in/devabratta-yumnam-92a382354",
  "company": "Nothing___Everything",
  "role": "Founder & CEO",
  "mined_at": "2026-04-06",
  "status": "active",
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

**Extraction details:**
- **Topic**: What the post is about (1-3 words: "AI automation", "founder lessons", "product launch")
- **Format**: text, text + image, video, carousel, poll
- **Engagement**: Like and comment counts from the post card
- **Hook style**: Contrarian, personal story, announcement, question, bold claim
- **Word count bucket**: short (< 100 words), medium (100-300 words), long (300+ words)

### Weekly Insights (calculated every Monday)

After 15 profiles mined (Mon-Fri), the system generates `network-insights.json`:

```json
{
  "week_of": "2026-04-06",
  "profiles_analyzed_this_week": 15,
  "profiles_analyzed_total": 60,
  "top_performing_topics": [
    {"topic": "AI automation", "avg_engagement": 89, "post_count": 4},
    {"topic": "founder lessons", "avg_engagement": 76, "post_count": 3},
    {"topic": "building in public", "avg_engagement": 65, "post_count": 2}
  ],
  "top_performing_formats": [
    {"format": "text + image", "avg_engagement": 89, "post_count": 5},
    {"format": "text", "avg_engagement": 67, "post_count": 8},
    {"format": "carousel", "avg_engagement": 45, "post_count": 2}
  ],
  "top_performing_hook_styles": [
    {"hook": "contrarian", "avg_engagement": 112, "post_count": 4},
    {"hook": "personal story", "avg_engagement": 98, "post_count": 6},
    {"hook": "bold claim", "avg_engagement": 76, "post_count": 3}
  ],
  "avg_engagement_by_word_count": {
    "short": 34,
    "medium": 67,
    "long": 45
  },
  "active_connection_types": [
    {"type": "Founder/CEO", "count": 6},
    {"type": "Software Engineer", "count": 4},
    {"type": "Recruiter/HR", "count": 3}
  ],
  "network_size_of_posters": 15
}
```

**Insight rules:**
- Only posts with likes > 10 are considered "performing" (filters noise)
- Topics are normalized: "AI tools" and "AI automation" map to the same topic
- Hook styles are classified automatically from the hook text
- Active connection types: what roles the active posters hold

### Fallback Rules

| Scenario | Response |
|----------|----------|
| LinkedIn shows CAPTCHA | Skip mining for today, retry tomorrow. Note in log. |
| Connection has no visible posts | Mark status: inactive. Pick next unmimed profile. |
| > 70% of attempted profiles are inactive | System reduces mining to 1 profile/day (most connections are lurkers). Re-evaluate every 2 weeks. |
| Connection profile is behind login wall | Skip. Pick next unmimed profile. |
| Engagement numbers not visible on posts | Log post without engagement data. Use topic format data only. |

### Data Storage

```
data/network/
├── network-profiles.json          # Cumulative database, grows daily
└── network-insights.json          # Weekly-calculated insights (updated Mondays)
```

**network-profiles.json structure:**
```json
{
  "last_updated": "2026-04-06",
  "profiles_mined_total": 45,
  "active_posters": 32,
  "inactive_posters": 13,
  "profiles": [
    // Array of profile objects (extracted data above)
  ],
  "mining_queue": {
    "next_profiles_to_visit": ["url1", "url2", "url3"],
    "last_mined_index": 0
  }
}
```

### How Post Generator Uses Network Insights

Modified `skills/03-post-generator.md` Step 0 (Read Calibration Data):

1. Read `data/network/network-insights.json` if it exists (skip if no insights generated yet)
2. If insights exist, use them to calibrate:
   - **Format choice**: Prefer the top-performing format for the day
   - **Hook style**: Use top-performing hooks from network insights
   - **Word count bucket**: Target the engagement-optimized range
   - **Topic awareness**: If a high-performing topic in the network overlaps with today's research, lean into it
3. If no insights yet (first week), use defaults (this is fine — 15 profiles needed before insights are generated)

### Chrome Browser Extraction Method

Extracting from connection profiles via Chrome browser plugin:

```
Navigate to: {connection_url}
Extract: markdown format

→ From extraction, identify the "Activity" section
→ Scroll to find their posts
→ Extract top 3 posts (by engagement numbers visible)
→ Extract 3 most recent posts (by date)
```

If the Activity section requires scrolling or shows limited content:
- Extract what's visible
- Note: "limited_scroll" in the profile object
- System can revisit this profile later as LinkedIn loads more content

### Expected Timeline

| Week | Profiles Mined | Network Insights | Post Generator Calibration |
|------|---------------|------------------|---------------------------|
| 1 | 15 | First generation | No calibration yet (not enough data) |
| 2 | 30 | Week 2 update (15+15) | Light calibration begins |
| 3 | 45 | Week 3 update (30+45) | Stronger calibration |
| 4 | 60 | Week 4 update (45+60) | Robust pattern recognition |

After 4 weeks: The Post Generator knows what format, hook, and style get real engagement in Umar's specific network.

### Files Changed

| File | Action | Responsibility |
|------|--------|----------------|
| `data/network/network-profiles.json` | Create | Cumulative mining database |
| `data/network/network-insights.json` | Create | Weekly-calculated insights |
| `skills/02-research-engine.md` | Modify | Add Phase 4: Network Mining |
| `skills/03-post-generator.md` | Modify | Read network insights for calibration |
| `HANDOVER.md` | Modify | Update Problem #4 status |
