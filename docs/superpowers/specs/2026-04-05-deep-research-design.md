# Deep Research Design — LinkedIn Content Engine

> Date: 2026-04-05
> Problem: #2 — Research is shallow (headlines only, no article content or comment mining)
> Solution: Upgrade Research Engine (skill 02) with three-phase flow: headline scan → deep dive → brief output

## Problem Statement

The current Research Engine extracts headlines from HN "New", "Ask HN", The Verge AI, and HN "Top". This is sufficient for generating surface-level "takes" but produces no genuine insight. The real value — article arguments, data points, comment debates, counter-arguments — is never extracted.

## Design

### Three-Phase Flow

```
Phase 1: Headline Scan (30 sec)
  → HN "New" + The Verge AI scrape → 15-20 headlines → rank & pick #1 hottest topic

Phase 2: Deep Dive (2-4 min)
  → Article extraction (full body, quotes, data points)
  → Comment mining (top 20 HN comments for #1 topic)
  → If non-HN source: search HN for related discussions

Phase 3: Output (30 sec)
  → data/research/YYYY-MM-DD-topics.json (enriched)
  → data/research/YYYY-MM-DD-deep-brief.md (full extracted content)
```

### Phase 1: Headline Scan (unchanged)

The existing skill already navigates to HN "New", "Ask HN", The Verge AI, and HN "Top" and extracts headlines. This Phase 1 continues exactly as-is — it's fast and works well for topic discovery.

At the end of Phase 1, topics are ranked by:
1. **Urgency** — hot > warm > evergreen
2. **Relevance to Umar's audience** — developers, tech professionals, students
3. **Angle availability** — can Umar add a unique developer/hands-on perspective?

### Phase 2: Deep Dive (new)

**Article Extraction (all topics):**

Navigate to the source URL of the #1 ranked topic. Extract:
- Full article body and key arguments
- Concrete data points, statistics, numbers
- Direct quotes from sources, researchers, executives
- Technical details that provide substance for analysis

**Comment Mining (all topics):**

Navigate to the HN comments page for the story. If the topic does not have a direct HN thread, search HN for the product/company/topic name and find the closest related discussion. Extract:
- Top 20 comments (by upvotes or recency)
- Overall sentiment (positive, negative, divided)
- Main concerns, excitement, or debates from the community
- Best counter-argument: the smartest opposing view in the comments
- Notable commenter quotes and attributions
- Gaps in the conversation: what's being missed

**Conditional Path:**

| Source | Strategy |
|--------|----------|
| HN story | Navigate to HN comments directly — already there |
| The Verge article | Navigate to article body → Search HN for related discussion → Navigate to HN thread → Mine comments |
| No HN discussion found | Extract full article only — note in brief that comment layer is missing |

### Phase 3: Two-Part Output

**Part A: Enriched topics.json**

Update the existing `data/research/YYYY-MM-DD-topics.json` with two new optional fields on the #1 topic:

```json
{
  "article_summary": "1-2 sentence key argument + bulleted data points",
  "comment_analysis": {
    "sentiment": "overall mood summary",
    "top_concern": "main debate point from comments",
    "counter_argument": "best opposing view",
    "notable_quotes": ["quote 1 - @user", "quote 2 - @user"]
  }
}
```

**Part B: Deep Brief Markdown**

New file: `data/research/YYYY-MM-DD-deep-brief.md`

```markdown
# Deep Brief: YYYY-MM-DD — [Topic Headline]

## Article Summary
- **Source**: [The Verge | HN] — [URL]
- **Key argument**: [1-2 sentences]
- **Data points**: [bullet list of concrete stats/facts]
- **Key quotes**: ["direct quote 1", "direct quote 2"]
- **Umar's angle**: [why this connects to his experience]

## HN Comment Sentiment (Top 20)
- **Overall mood**: [positive/negative/divided — 1 sentence]
- **Top concern**: [what commenters are most worried/excited about]
- **Best counter-argument**: [smartest opposing view from comments]
- **Notable quotes**: ["commenter quote 1" — @username, "commenter quote 2" — @username]
- **Gaps in the conversation**: [what nobody is talking about but should be]

## Post Angles
- Angle 1: [specific take Umar could write about]
- Angle 2: [alternative contrarian take]
- Angle 3: [personal experience connection]
```

## Changes to `skills/02-research-engine.md`

1. **Keep all existing Phase 1 steps unchanged** — same navigation, same sources
2. **Add new "Phase 2: Deep Dive" section** after topic ranking with:
   - Article extraction instructions
   - Comment mining instructions
   - Conditional path logic (HN vs non-HN sources)
3. **Add new "Phase 3: Output" section** with:
   - Two-part output format (enriched JSON + deep brief MD)
   - Fallback rules for sparse content
4. **Update the output summary** to show deep research status

### Fallback Rules

- If article URL fails to load (paywall, error): note it, skip extraction, use headline + external context only
- If HN comments < 5: note in brief that comment layer is thin, rely on article content
- If no HN discussion exists: article extraction only, skip comment section entirely with note

### Time Budget

Total expected: 3-5 minutes per run
- Phase 1 (headline scan): ~30 seconds
- Phase 2 (deep dive): ~2-4 minutes (1-2 min article + 1-2 min comments)
- Phase 3 (output formatting): ~30 seconds

## Post Generator Integration

The Post Generator (skill 03) must be updated to read the deep brief when it exists:

1. After reading `data/research/YYYY-MM-DD-topics.json`, also check for `data/research/YYYY-MM-DD-deep-brief.md`
2. If the deep brief exists, use it as the primary context for the trend-anchored post (POST 1)
3. The deep brief's angles, counter-arguments, and comment quotes should inform the post body and hook
4. If no deep brief exists, fall back to current behavior (headline-only context)

## Expected Impact

- Trend posts will have specific data points and quotes instead of generic takes
- Comment mining reveals angles no other LinkedIn poster is using (the "engineer perspective")
- Posts can reference what the community is debating, not just what happened
- Counter-arguments from comments prevent naive one-sided takes
- Time cost increases by ~3-5 minutes total, not per day (still one deep dive per run)
