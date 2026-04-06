# Research Engine

Scan daily AI/tech trends using RSS feeds and output 3-5 trending post topics with unique angles for Umar's LinkedIn audience.

## Instructions

1. Fetch today's raw feed data by running:
```bash
cd "E:\LinkedIn Automation"
node scripts/fetch-research.js
```

This fetches 4 RSS feeds (HN "New", HN "Ask", HN "Top", The Verge AI), normalizes, deduplicates, and outputs to `data/research/YYYY-MM-DD-topics.json`.

The output contains `raw_items` array with fields: `title`, `url`, `points`, `comment_count`, `author`, `publishedAt`, `feed` (`hn_new`, `hn_ask`, `hn_top`, `verge_ai`).

2. Read the raw feed data from `data/research/YYYY-MM-DD-topics.json` and process it:

2. Filter and rank the raw items by:
   - Relevance to Umar's audience (developers, tech professionals, students)
   - Engagement potential (controversial, surprising, or practical)
   - Angle availability (can Umar add a unique developer perspective?)
   - Connection to Umar's experience (AI evaluation, full-stack dev, cold email AI, building products)
   - Freshness: prefer items with `feed` = `hn_new` or `hn_ask` (posted in last 0-30 min) over `hn_top`
   - Use `hn_top` items ONLY to identify saturated topics (>200 comment_count) to AVOID
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

### Step 2a: Extract Article Content via API

Run the deep dive script to fetch the article automatically:
```bash
cd "E:\LinkedIn Automation"
node scripts/deep-dive.js <article_url> [search_term]
```

- **article_url**: The #1 topic's source URL
- **search_term** (optional): Product, company, or keyword to search HN for comment discussion

The script:
1. Fetches the full article body via Jina Reader API (`r.jina.ai/<url>`) — returns clean markdown, no paywalls or ads
2. Extracts HN story ID from the URL (if it's `ycombinator.com/item?id=...`), OR searches HN via Algolia API using `search_term`
3. Fetches the full HN comment thread via Firebase API (`hacker-news.firebaseio.com/v0/item/<id>.json`) — official HN API, no auth needed
4. Saves raw data to `data/research/YYYY-MM-DD-deep-dive.json`

**The script output** contains:
- `article.body` — Full article markdown (capped at 20k chars)
- `article.success` — Whether extraction worked
- `hn_comments.story` — HN story metadata (title, score, total comments)
- `hn_comments.comments[]` — Up to 20 top-level comments with author, text (500 char preview), points, timestamp

If you don't run the script manually, use the AI tool's built-in data fetching to get the article content and HN comments. The key is: Jina Reader API for articles, Firebase API for HN comments.

From the fetched article + comments, extract the following fields that become the deep brief:
- **Key argument**: What is the main point the article is making? (1-2 sentences)
- **Data points**: All concrete statistics, numbers, metrics mentioned
- **Key quotes**: Direct quotes from researchers, executives, sources (exact quotes only)
- **Technical details**: Specific architecture, methodology, or implementation details
- **Comment sentiment**: Overall mood, top concerns, counter-arguments, notable quotes

### Step 2c: Post Angles

Read `data/personal/experience-brief.md` for Umar's specific projects, decisions, and beliefs.

Based on the article + comments, identify 3 specific post angles Umar could write about:
- **Angle 1**: The main take (article-backed, with data points and quotes, connected to a specific project from the brief)
- **Angle 2**: The contrarian take (informed by the counter-arguments found in comments, connected to a specific belief or opinion from the brief)
- **Angle 3**: The personal experience connection (connect to a specific project, decision, or struggle from the brief — name it, don't be generic)

Each angle MUST name a specific element from the experience brief. Generic connections like "he's a developer who works with AI" are not acceptable.

### Fallback Rules

- If Jina API fails (article unavailable, paywall): `article.success` will be false — use the headline + existing knowledge, note in the brief as "Article extraction failed — using headline context"
- If HN story has fewer than 5 comments: note in the brief as "Thin discussion — limited comment data", skip comment analysis section unless there are at least 3 interesting comments
- If Algolia search returns no HN discussion: note in the brief as "No HN discussion found", complete the article extraction section only
- If the article is from The Verge or another mainstream source with no HN discussion: focus on the article content + cross-reference Twitter/X or LinkedIn sentiment if available

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

## Phase 3: Output Generation (after Deep Dive)
