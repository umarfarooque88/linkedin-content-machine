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

3. For each trending topic, also identify Umar's personal connection:
   - Can he relate it to a project he's built?
   - Can he give a contrary opinion?
   - Can he share a lesson or mistake?
   - Can he speak as someone "in the trenches"?

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

5. Output to: `data/research/YYYY-MM-DD-topics.json` (use today's date)

```json
{
  "date": "YYYY-MM-DD",
  "topics": [
    // Array of 3-5 topic objects
  ],
  "evergreen_fallback": false,
  "search_queries_used": ["list of actual queries run"],
  "notes": "any context about today's AI landscape"
}
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

Topic                    | Pillar     | Urgency
-------------------------|------------|----------
[topic 1]                | [pillar]   | [hot/warm/evergreen]
[topic 2]                | [pillar]   | [hot/warm/evergreen]
...
```

## Constraints

- Topics must be REAL news, not made up
- Unique angles must leverage Umar's actual experience
- Must avoid controversial topics that could hurt brand (politics, non-tech controversy)
- Never suggest reposting someone else's exact opinion — always a unique angle
