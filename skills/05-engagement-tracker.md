# Engagement Tracker

Track, analyze, and learn from post engagement data across all dimensions. Self-calibrates the content generation system.

## Directory Structure

```
data/engagement/
├── posts-db.jsonl                    # Append-only log, one JSON per line
├── engagement-log.json               # Rolling analysis with confidence scores
└── calibration-reports/
    └── YYYY-MM-DD-report.json        # Periodic calibration reports
```

## Sub-Command: `track`

### Purpose
Enter 24-hour engagement data for yesterday's posts. Append to the append-only database.

### Instructions

1. **Read the posts file** from `data/posts/YYYY-MM-DD-posts.json` to get post fingerprints:
   - post_id, pillar, hook_type (auto-infer from hook text), word_count
   - hashtags[], topic_category (infer from topic_source), is_trend_anchored
   - topic_source, has_image

2. **For each post in that file**, ask the user for these fields:
   - `day_of_week` — e.g. "Monday", "Tuesday"
   - `time_posted` — e.g. "10:00", "16:00"
   - `likes` — integer, ≥ 0
   - `comments` — integer, ≥ 0
   - `shares` — integer, ≥ 0 (default 0 if user doesn't know)

3. **Infer additional fields automatically:**
   - `hook_type` — classify as `brand_name_claim`, `contrarian`, `bold_statement`, `personal_story`, `question` based on the hook text
   - `topic_category` — derive from topic_source (e.g. "ai_code_review", "privacy", "layoffs", "system_design", "developer_career")
   - `scraped_at` — the age of the post when data was entered (should be ~24h)
   - `engagement_score` — calculate as: likes + comments + (shares * 2)

4. **Validate all inputs:**
   - likes, comments, shares must be non-negative integers
   - day_of_week must be a valid day name
   - If any field fails validation, ask again

5. **Append each entry as a single JSON line to `data/engagement/posts-db.jsonl`:**

```jsonl
{"post_id":"post-1","date":"2026-04-05","day_of_week":"Sunday","time_posted":"10:00","pillar":"The Take","hook_type":"brand_name_claim","word_count":124,"hashtags":["#AICodeGeneration","#SoftwareEngineering","#CodeReview","#DevCommunity"],"topic_category":"ai_code_review","is_trend_anchored":true,"topic_source":"AI code agents shipping to production","has_image":false,"likes":47,"comments":12,"shares":0,"scraped_at":"24h","engagement_score":59}
```

6. **Display confirmation:**
```
Tracked 2 posts:
  post-1 [The Take] | Likes: 47, Comments: 12, Score: 59
  post-2 [The Build] | Likes: 12, Comments: 3, Score: 15

Total posts in database: XX
```

7. **Auto-trigger `analyze`** if total posts >= 5 (run the analysis engine after tracking).

---

## Sub-Command: `analyze`

### Purpose
Read all entries from `posts-db.jsonl` and update `engagement-log.json` with multi-dimensional analysis.

### Instructions

1. **Read `data/engagement/posts-db.jsonl`** and parse every line into an array of post objects.

2. **Calculate confidence level:**
   - 0-10 posts: `"no_data"`
   - 11-25 posts: `"emerging"`
   - 26-50 posts: `"good"`
   - 50+ posts: `"confident"`

3. **Calculate ALL aggregates:**

   **By pillar:**
   - For each pillar (The Take, The Build, The Lesson, The Person):
     - count, avg_likes, avg_comments, avg_engagement
     - best_post_id (highest engagement), worst_post_id (lowest engagement)

   **By hook type:**
   - For each hook_type found in data:
     - count, avg_engagement

   **By word count bucket:**
   - Buckets: "under_100", "100_to_120", "120_to_150", "over_150"
   - For each bucket: count, avg_engagement

   **By hashtag set:**
   - Convert hashtags array to a sorted comma-separated string (e.g. "#AI #CodeReview #DevCommunity")
   - For each unique set: count, avg_engagement

   **By day of week:**
   - For each day: count, avg_engagement

   **By topic category:**
   - For each category: count, avg_engagement

   **Trend vs evergreen:**
   - Group by is_trend_anchored: count, avg_engagement

4. **Identify top/bottom performers:**
   - Sort all posts by engagement_score descending
   - Top 5 go into `top_performing_posts` (include post_id, pillar, hook_type, engagement_score, hook text)
   - Bottom 5 go into `bottom_performing_posts`

5. **Generate recommendations (ONLY if confidence >= "no_data", i.e. 5+ posts):**
   - For each pillar with 2+ samples: compare to overall average, recommend weight changes
   - For each hook type with 3+ samples: identify best performer
   - For word count: identify optimal range
   - For hashtag sets with 3+ samples: recommend preferred/banned
   - For trend vs evergreen: recommend balance adjustment
   - **IMPORTANT:** Only make a recommendation if the data volume supports it. Use confidence level rules.

6. **Update `calibration_settings` in engagement-log.json:**
   - `pillar_weights`: Adjust based on pillar performance (normalized to sum=1.0, min 0.1 per pillar for variety)
   - `post_word_count_min` / `max`: Set to best-performing bucket boundaries
   - `hook_type_preference`: Set to best-performing hook type
   - `preferred_hashtags`: Aggregate hashtags from top 25% posts
   - `banned_hashtags`: Hashtags that only appear in bottom 25% posts
   - `preferred_topic_categories`: Top 3 categories by avg engagement

7. **Write updated analysis to `data/engagement/engagement-log.json`**

8. **Display summary:**
```
Engagement Analysis (XX posts analyzed)
Confidence: [level]

By Pillar:
  The Take:    XX posts, avg XX engagement
  The Build:   XX posts, avg XX engagement
  The Lesson:  XX posts, avg XX engagement
  The Person:  XX posts, avg XX engagement

Recommendations:
  - [recommendation 1]
  - [recommendation 2]

Top performing: [post_id] — [engagement_score] pts
```

### Confidence Rules for Recommendations

| Confidence | Allowed recommendations |
|------------|------------------------|
| no_data (0-10) | None. Only display raw numbers. No advice. |
| emerging (11-25) | Pillar-level only. One-dimensional: "The Take outperforms." No combinations. |
| good (26-50) | All single-dim + simple combos (pillar+hook). Word count buckets. |
| confident (50+) | Everything. Cross-dimensional patterns. Aggressive calibration. |

---

## Sub-Command: `report`

### Purpose
Generate a calibration report every 10 posts, saved to `data/engagement/calibration-reports/`.

### Instructions

1. **Check if a report is due:** Read `data/engagement/engagement-log.json`. If `total_posts_analyzed` is a multiple of 10 (or 10, 20, 30, 40, 50), generate a report.

2. **Build the report JSON:**
```json
{
  "report_number": 1,
  "date": "YYYY-MM-DD",
  "posts_analyzed": 20,
  "confidence": "emerging",
  "summary": {
    "total_engagement": 534,
    "avg_engagement_per_post": 26.7,
    "avg_likes": 22.3,
    "avg_comments": 4.4,
    "total_posts_tracked": 20
  },
  "winners": [
    {
      "dimension": "pillar",
      "category": "The Take",
      "avg_engagement": 34.2,
      "vs_average": "+27%",
      "action": "INCREASE weight"
    },
    {
      "dimension": "hook_type",
      "category": "brand_name_claim",
      "avg_engagement": 31.5,
      "vs_average": "+18%",
      "action": "USE MORE"
    }
  ],
  "losers": [
    {
      "dimension": "pillar",
      "category": "The Build",
      "avg_engagement": 12.1,
      "vs_average": "-55%",
      "action": "DECREASE weight"
    },
    {
      "dimension": "word_count",
      "category": "over_150",
      "avg_engagement": 8.3,
      "vs_average": "-69%",
      "action": "SHORTER"
    }
  ],
  "recommendations": [
    {
      "action": "Shift The Build from 25% to 15% of daily posts",
      "evidence": "Avg engagement 12.1 vs overall 26.7"
    },
    {
      "action": "Target 80-120 word range",
      "evidence": "Over-150 posts perform 69% worse"
    },
    {
      "action": "Use brand_name_claim hooks for trend posts",
      "evidence": "18% above average"
    },
    {
      "action": "Drop #BuildInPublic hashtag",
      "evidence": "Present in 0 top-performing posts, 3 bottom-performing"
    }
  ],
  "calibration_snapshot": {
    "pillar_weights": {"The Take": 0.35, "The Build": 0.15, "The Lesson": 0.25, "The Person": 0.25},
    "word_count_min": 80,
    "word_count_max": 120,
    "hook_type_preference": "brand_name_claim",
    "preferred_hashtags": ["#AI", "#PrivacyTech", "#AICodeGeneration"],
    "banned_hashtags": ["#BuildInPublic"]
  }
}
```

3. **Save to `data/engagement/calibration-reports/YYYY-MM-DD-report.json`**

4. **Display the report** in a formatted table for the user:

```
═══════════════════════════════════════
Calibration Report #1 (20 posts)
Confidence: emerging
═══════════════════════════════════════

WINNERS:
  The Take (pillar)       +27% vs avg → INCREASE weight
  brand_name_claim (hook) +18% vs avg → USE MORE

LOSERS:
  The Build (pillar)      -55% vs avg → DECREASE weight
  over_150 (words)        -69% vs avg → SHORTER

RECOMMENDATIONS:
  1. Shift The Build from 25% → 15%
  2. Target 80-120 words (not 80-150)
  3. Drop #BuildInPublic hashtag

Calibration saved. Post Generator will adjust next run.
═══════════════════════════════════════
```

---

## Auto-Update Loop

The engagement tracker should also maintain `config/style-profile.json` by updating its `calibration` section after each analyze run:

```json
{
  "calibration": {
    "last_calibrated_post_count": 20,
    "top_performing_dimensions": {
      "pillar": "The Take",
      "hook_type": "brand_name_claim",
      "word_bucket": "100_to_120",
      "day_of_week": null
    },
    "hook_performance": {
      "brand_name_claim": { "avg_engagement": 31.5, "count": 8 },
      "contrarian": { "avg_engagement": 22.1, "count": 7 }
    },
    "best_performing_topics": ["ai_code_review", "privacy"],
    "worst_performing_topics": ["startup_news"],
    "optimal_word_length": { "min": 80, "max": 120 },
    "preferred_hashtag_sets": [
      ["#AI", "#PrivacyTech"],
      ["#SoftwareEngineering", "#AICodeGeneration"]
    ]
  }
}
```

This ensures the Post Generator has a unified view in the style profile without needing to read two separate files.
