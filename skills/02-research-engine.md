# Research Engine

Scan daily AI/tech trends and output 3-5 trending post topics with unique angles for Umar's LinkedIn audience.

## Instructions

1. Use the Chrome browser plugin to scrape real, live news from these sources — in order of urgency:

   **Step 1a: HN "New" — breaking stories FIRST (0-30 min delay)**
   ```
   Navigate to: https://news.ycombinator.com/newest
   Extract: markdown format
   ```
   These are stories submitted within the last hour. Most have 0-5 comments. This is where you find news BEFORE it trends and BEFORE your connections see it. Focus on AI/developer stories.

   **Step 1b: HN "Ask HN" — real-time discussions happening now**
   ```
   Navigate to: https://news.ycombinator.com/ask
   Extract: markdown format
   ```
   Discussions with 0-10 comments are gold mines. People are talking about things RIGHT NOW that haven't hit mainstream yet.

   **Step 1c: The Verge AI — latest published articles (not top stories)**
   ```
   Navigate to: https://www.theverge.com/ai-artificial-intelligence
   Extract: markdown format
   ```
   Grab articles from the top of the list (most recently published, not most popular).

   **Step 1d: HN "Top" — ONLY to cross-reference what's already saturated**
   ```
   Navigate to: https://news.ycombinator.com
   Extract: markdown format
   ```
   Use this to AVOID stories with 200+ comments that everyone has already posted about. Skip those. Find what's NOT there yet.

2. Filter results for:
   - Relevance to Umar's audience (developers, tech professionals, students)
   - Engagement potential (controversial, surprising, or practical)
   - Angle availability (can Umar add a unique developer perspective?)
   - Connection to Umar's experience (AI evaluation, full-stack dev, cold email AI, building products)

3. For each trending topic, identify Umar's personal connection by cross-referencing the experience brief:

   Read `data/personal/experience-brief.md` to find specific connections:
   - **Project connection**: Does any project from the brief directly relate to this topic? (e.g., OutreachAI relates to AI-generated content quality, email infrastructure, deliverability)
   - **Belief connection**: Does this topic connect to a specific belief or opinion from the brief? (e.g., "AI can replace junior developers' coding but not their problem-solving")
   - **Struggle connection**: Does this topic mirror a real struggle Umar has faced? (e.g., moving too fast → incomplete systems, idea overload)
   - **Decision connection**: Did Umar make a real decision about this kind of problem? (e.g., choosing to build fast and iterate rather than plan perfectly)
   - **Trenches connection**: Can he speak as someone who actually built with these tools, not someone who tweets about them?

   When you find a connection, name the specific project, decision, or belief from the brief. Do NOT say "he has experience with AI" — say "he built OutreachAI, a cold email platform that handles AI-generated content quality and deliverability optimization."

4. For each topic, create the research object:

```json
{
  "topic": "brief headline of the trending topic",
  "pillar": "The Build | The Lesson | The Take | The Person",
  "why_its_hot": "1-2 sentences on why this is trending right now",
  "unique_angle": "Umar's specific take that differs from generic takes. Must be personal/opinionated/contrarian.",
  "suggested_hook": "A specific hook line that would stop the scroll. Must feel real, not clickbaity.",
  "source_urls": ["url1", "url2"],
  "urgency": "hot (must post today) | warm (good for this week) | evergreen (always relevant)"
}
```

---

## Phase 2: Deep Dive (after selecting the #1 hottest topic)

After ranking all topics from Phase 1, identify the #1 hottest topic (highest urgency = "hot", most relevant to Umar's audience, strongest angle). This topic gets the full deep dive treatment.

### Step 2a: Extract Article Content

Navigate to the source URL of the #1 topic and extract the full article content.

```
Navigate to: [the source URL from the topic's source_urls array]
Extract: markdown format
```

From the full article, extract:
- **Key argument**: What is the main point the article is making? (1-2 sentences)
- **Data points**: All concrete statistics, numbers, metrics mentioned
- **Key quotes**: Direct quotes from researchers, executives, sources (exact quotes only)
- **Technical details**: Specific architecture, methodology, or implementation details

### Step 2b: Mine HN Comments

Navigate to the HN comments page for this specific story.

- If the story originated from HN: use the story's comment page directly
- If the story originated from The Verge or another source: search HN for the product/company name to find related discussions

```
Navigate to: [HN comments URL for the story] -- OR --
Navigate to: https://news.ycombinator.com/ (search for the topic)
Extract: markdown format — top 20 comments
```

From the comments, extract:
- **Overall sentiment**: positive, negative, divided (with 1-sentence explanation)
- **Top concern**: What commenters are most worried/excited about (the main debate point)
- **Best counter-argument**: The smartest opposing view or strongest pushback found in comments
- **Notable quotes**: 3-5 comment quotes with @username attribution
- **Gaps in the conversation**: What nobody is talking about but should be
- **Engineering context**: Any practical insights, experiences, or technical details shared by commenters

### Step 2c: Post Angles

Read `data/personal/experience-brief.md` for Umar's specific projects, decisions, and beliefs.

Based on the article + comments, identify 3 specific post angles Umar could write about:
- **Angle 1**: The main take (article-backed, with data points and quotes, connected to a specific project from the brief)
- **Angle 2**: The contrarian take (informed by the counter-arguments found in comments, connected to a specific belief or opinion from the brief)
- **Angle 3**: The personal experience connection (connect to a specific project, decision, or struggle from the brief — name it, don't be generic)

Each angle MUST name a specific element from the experience brief. Generic connections like "he's a developer who works with AI" are not acceptable.

### Fallback Rules

- If the article URL fails to load (paywall, 404, error): use the headline + existing knowledge only, note in the brief as "Article extraction failed — using headline context"
- If HN has fewer than 5 comments on the topic: note in the brief as "Thin discussion — limited comment data", skip comment analysis section
- If no HN discussion exists at all: complete the article extraction, skip comment mining, note in the brief as "No HN discussion found"

5. Output Phase 3 — two-part output:

### Part A: Enriched topics.json

Output to: `data/research/YYYY-MM-DD-topics.json` (use today's date)

The #1 topic (hot topic) gets enriched with `article_summary` and `comment_analysis` fields. Other topics remain as-is from the research object template.

```json
{
  "date": "YYYY-MM-DD",
  "topics": [
    {
      "topic": "hot topic headline",
      "pillar": "The Take",
      "why_its_hot": "1-2 sentences",
      "unique_angle": "Umar's specific take",
      "suggested_hook": "A specific hook line",
      "source_urls": ["url1", "url2"],
      "urgency": "hot | warm | evergreen",
      "article_summary": "1-2 sentence key argument",
      "comment_analysis": {
        "sentiment": "overall mood summary",
        "top_concern": "main debate point",
        "counter_argument": "best opposing view",
        "notable_quotes": ["quote 1 - @user", "quote 2 - @user"]
      }
    },
    {
      // Standard topic object (no enrichment)
    }
  ],
  "evergreen_fallback": false,
  "search_queries_used": ["list of actual queries"],
  "notes": "context about today's AI landscape",
  "deep_brief_generated": true
}
```

### Part B: Deep Brief Markdown

Output to: `data/research/YYYY-MM-DD-deep-brief.md`

```markdown
# Deep Brief: YYYY-MM-DD — [Topic Headline]

## Article Summary
- **Source**: [The Verge | HN] — [URL]
- **Key argument**: [1-2 sentences]
- **Data points**:
  - [concrete stat 1]
  - [concrete stat 2]
- **Key quotes**:
  - "[direct quote 1]"
  - "[direct quote 2]"
- **Umar's angle**: [why this connects to his experience]

## HN Comment Sentiment (Top 20)
- **Overall mood**: [positive/negative/divided — 1 sentence]
- **Top concern**: [what commenters are most worried/excited about]
- **Best counter-argument**: [smartest opposing view from comments]
- **Notable quotes**:
  - "[commenter quote 1]" — @username
  - "[commenter quote 2]" — @username
- **Gaps in the conversation**: [what nobody is talking about but should be]

## Post Angles
- Angle 1: [specific take Umar could write about]
- Angle 2: [alternative contrarian take]
- Angle 3: [personal experience connection]
```

6. If research finds nothing sufficiently trending (all topics are stale or irrelevant):
   - Set `evergreen_fallback` to true
   - Generate 5 evergreen topic ideas based on Umar's content pillars
   - Focus on lessons from his real projects (OutreachAI, Hostel Mess System)
   - Connect to his unique angles (self-taught, building in college, shipping real products)

7. Display a summary table:

```
Daily Research Report: YYYY-MM-DD
================================

Topic                    | Pillar     | Urgency   | Deep Brief
-------------------------|------------|-----------|------------
[topic 1 - HOT]          | [pillar]   | [hot]     | ✓ Generated
[topic 2]                | [pillar]   | [warm]    | —
[topic 3]                | [pillar]   | [evergreen]| —

Article: [source] — Key argument summarized
Comments: [N] HN comments analyzed — Overall mood: [sentiment]
Best counter-argument: [1 sentence]

Files written:
  data/research/YYYY-MM-DD-topics.json (enriched with article/comment context)
  data/research/YYYY-MM-DD-deep-brief.md (full extraction for post generation)
```

## Constraints

- Topics must be REAL news, not made up
- Unique angles must leverage Umar's actual experience
- Must avoid controversial topics that could hurt brand (politics, non-tech controversy)
- Never suggest reposting someone else's exact opinion — always a unique angle

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
4. Pick the next 3 connections that haven't been mined yet OR re-mine connections whose `mined_at` is more than 7 days old

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
| Connection has no visible posts | Mark status: "inactive". Increment inactive counter. Pick next unmined connection. |
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
