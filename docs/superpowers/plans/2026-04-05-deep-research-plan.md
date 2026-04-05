# Deep Research Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Research Engine skill to extract full article content and mine HN comments, producing two-part research output (enriched JSON + deep brief) for the #1 hottest topic each day.

**Architecture:** Add two new phases to the existing Research Engine skill: Phase 2 (deep dive: article extraction + comment mining) and Phase 3 (two-part output generation). Also update the Post Generator skill to consume the deep brief when available.

**Tech Stack:** Claude Code skills (markdown), Chrome browser plugin for navigation/extraction, WebFetch or Chrome for article and comment extraction.

---

### Task 1: Add Phase 2 (Deep Dive) to Research Engine skill

**Files to Modify:**
- `skills/02-research-engine.md`

**Action:** Insert a new "Phase 2: Deep Dive" section after the existing step 3 (research object creation) and before the current step 5 (output writing). The new section reads the current step numbers as-is and inserts between them.

**Add this content to `skills/02-research-engine.md` after the existing step 4 (research object creation) and before the existing step 5 (output writing):**

Find this section in the current file (it's currently the numbered steps 1-7):

Step 4 ends with the research object JSON template (line ~62 of the file).
Step 5 is the output writing step (starts with "Output to: `data/research/YYYY-MM-DD-topics.json`").

Insert the following between them:

```markdown
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

Based on the article + comments, identify 3 specific post angles Umar could write about:
- **Angle 1**: The main take (article-backed, with data points and quotes)
- **Angle 2**: The contrarian take (informed by the counter-arguments found in comments)
- **Angle 3**: The personal experience connection (connect to Umar's actual projects/experience)

### Fallback Rules

- If the article URL fails to load (paywall, 404, error): use the headline + existing knowledge only, note in the brief as "Article extraction failed — using headline context"
- If HN has fewer than 5 comments on the topic: note in the brief as "Thin discussion — limited comment data", skip comment analysis section
- If no HN discussion exists at all: complete the article extraction, skip comment mining, note in the brief as "No HN discussion found"
```

### Task 2: Add Phase 3 (Two-Part Output) to Research Engine skill

**File to Modify:**
- `skills/02-research-engine.md`

**Action:** Replace the existing step 5 (output to topics.json) with an updated version that supports two-part output. Replace the existing output JSON template with one that includes the enriched fields for the #1 topic.

Find this section in the current file (the existing output step):

```
5. Output to: `data/research/YYYY-MM-DD-topics.json` (use today's date)

```json
{
  "date": "YYYY-MM-DD",
  "topics": [
    // Array of 3-5 topic objects
  ],
  "evergreen_fallback": false,
  "search_queries_used": ["list of actual query used"],
  "notes": "any context about today's AI landscape"
}
```
```

Replace it entirely with:

```markdown
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
```

### Task 3: Add Deep Brief Consumption to Post Generator skill

**File to Modify:**
- `skills/03-post-generator.md`

**Action:** After the existing "Step 1: Read Inputs" in the Post Generator, add a new step "Step 1b: Read Deep Brief" that checks for and reads the deep brief file. Also update Step 2 (Generate POST 1) to reference the deep brief as primary context.

Find this section (Step 1 in Post Generator):

```markdown
### Step 1: Read Inputs
- Read `config/style-profile.json` for voice constraints and unique angles
- Read `config/style-profile.json` → `calibration` section for additional learned parameters
- Read today's research: `data/research/YYYY-MM-DD-topics.json`
- If calibration data exists: apply all calibration_settings overrides from Step 0
```

Replace it with:

```markdown
### Step 1: Read Inputs
- Read `config/style-profile.json` for voice constraints and unique angles
- Read `config/style-profile.json` → `calibration` section for additional learned parameters
- Read today's research: `data/research/YYYY-MM-DD-topics.json`
- Read today's deep brief if it exists: `data/research/YYYY-MM-DD-deep-brief.md`
- If calibration data exists: apply all calibration_settings overrides from Step 0

**Deep brief priority:** If a deep brief exists for today's date, the #1 hot topic in the research file will have enriched context (`article_summary` + `comment_analysis`). The Post Generator MUST use the deep brief as the PRIMARY context for POST 1. This means:
- Use specific data points and statistics from the article as evidence in the post body
- Use direct quotes from sources to add credibility
- Reference the community debate/consensus found in HN comments
- Use the counter-argument from comments to avoid naive one-sided takes
- Consider the "gaps in conversation" for a unique angle nobody else is taking
- If `fallback_missing_comments` is noted in the brief, acknowledge this limitation gracefully rather than fabricating comments
```

**Action:** Also update the "Step 2: Generate POST 1 (TREND-ANCHORED)" section to reference deep brief usage. Add this subsection after the existing "HOOK RULES (CRITICAL — this determines whether anyone reads anything else)" section but before the "Post Structure" block:

Add this paragraph:

```markdown
**Deep Brief Integration (if available):** When a deep brief exists, use it to ground your post in real evidence, not generic takes. Specifically:
- Lead with a concrete detail from the article (a number, a quote, a specific claim), not a vague "this just happened"
- In the body, reference the community reaction: "Engineers on HN are split between X and Y" or "The pushback is coming from people who point out Z"
- Use the counter-argument to create tension: "But the other side argues that..."
- Reference the "gaps in conversation" for a unique angle that nobody else on LinkedIn is taking
```

**Action:** Update Step 5's output JSON to include a new field `used_deep_brief` so we can trace which posts were informed by deep research.

Find the POST 1 JSON output template in Step 5 and add `"used_deep_brief": true` to the first post object, and `"used_deep_brief": false` to the second post object.

The updated POST 1 object:

```json
{
  "pillar": "The Take",
  "is_trend_anchored": true,
  "topic_source": "topic headline from research",
  "used_deep_brief": true,
  "hook": "The hook line",
  "body": "Everything after hook and before soft CTA",
  "soft_cta": "The closing question/thought",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "full_post_text": "Complete post ready for LinkedIn, with line breaks",
  "image_prompt": "Detailed image generation prompt",
  "image_url": null,
  "word_count": 215
}
```

### Task 4: Update Summary Table in Research Engine

**File to Modify:**
- `skills/02-research-engine.md`

**Action:** Update the display summary table (currently step 7) to reflect the new deep research output.

Find the current summary table:

```
Daily Research Report: YYYY-MM-DD
================================

Topic                    | Pillar     | Urgency
-------------------------|------------|----------
[topic 1]                | [pillar]   | [hot/warm/evergreen]
[topic 2]                | [pillar]   | [hot/warm/evergreen]
...
```

Replace with:

```
Daily Research Report: YYYY-MM-DD
================================

Topic                    | Pillar     | Urgency | Deep Brief
-------------------------|------------|---------|------------
[topic 1 - HOT]          | [pillar]   | [hot]   | ✓ Generated
[topic 2]                | [pillar]   | [warm]  | —
[topic 3]                | [pillar]   | [evergreen]| —

Article: [source] — Key argument summarized
Comments: [N] HN comments analyzed — Overall mood: [sentiment]
Best counter-argument: [1 sentence]

Files written:
  data/research/YYYY-MM-DD-topics.json (enriched with article/comment context)
  data/research/YYYY-MM-DD-deep-brief.md (full extraction for post generation)
```

### Task 5: Test — Run Deep Research End-to-End

**Files:**
- `skills/02-research-engine.md` (modified skill)
- Expected new: `data/research/YYYY-MM-DD-deep-brief.md`

**Action:** Run the updated Research Engine skill. It will:

1. Phase 1: Navigate to HN "New" + The Verge AI, extract headlines
2. Phase 2: Select #1 hot topic, extract article content, mine HN comments
3. Phase 3: Write enriched topics.json + deep brief markdown

Verify:
- `data/research/YYYY-MM-DD-topics.json` has `article_summary` and `comment_analysis` fields on the #1 topic
- `data/research/YYYY-MM-DD-deep-brief.md` exists with all sections populated
- The deep brief contains real quotes, data points, and comment analysis (not filler)
- If any fallback rules triggered, they are clearly noted

### Task 6: Test — Post Generator Consumes Deep Brief

**Files:**
- `skills/03-post-generator.md` (modified skill)
- `data/research/YYYY-MM-DD-deep-brief.md` (created by Task 5)

**Action:** Run the Post Generator skill after the Research Engine. Verify:

- POST 1 in `data/posts/YYYY-MM-DD-posts.json` has `"used_deep_brief": true`
- POST 1 contains specific data points, quotes, or comment references from the deep brief
- POST 1 is noticeably more substantive than the 04-05 Perplexity post (which had only headline context)
- POST 2 is unaffected (pillar-driven, no deep brief needed)

### Task 7: Commit

```bash
git add skills/02-research-engine.md skills/03-post-generator.md
git commit -m "feat: add deep research — article extraction + HN comment mining"
```
