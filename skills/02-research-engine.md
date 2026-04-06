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
