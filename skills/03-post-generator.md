# Post Generator

Generate 2 daily LinkedIn posts combining Umar's style voice, content pillars, and today's trending topics.

## Requirements

- Each post must be 80-150 words MAXIMUM (LinkedIn optimal length)
- Each post must use the exact writing style from `config/style-profile.json`
- At least 1 post per day must be trend-anchored (based on today's research)
- Posts should be structured: hook → body → soft CTA
- NO AI-sounding phrases ("In today's fast-paced", "As we navigate", "It's important to note", "Let's dive in", "In conclusion")
- NO engagement bait ("Like this post if", "Comment below", "Share your thoughts")
- NEVER mention employer or company names (Outrier, BuildStudio, Microspectra, etc.) — use "a project", "a platform", "some clients" instead
- NEVER write in a resume/cover letter tone — no listing credentials or positions
- Every post must feel authentically Umar, not generic AI content
- Use Umar's real experiences, projects, and opinions from style-profile.json unique_angles
- Line breaks between ideas for LinkedIn readability

## Process

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
- If "medium" wins, that supports the current 80-150 word range. If "short" wins, tighten.

**Topic awareness:**
- If any of `top_performing_topics` overlap with today's research topic, lean harder into that overlap.

**Active connection types:**
- Look at `active_connection_types` — are the active posters "Founder/CEO" types, "Software Engineer" types, or "Recruiter/HR" types?
- This tells you who in your network is creating content and getting engagement.

Network calibration is secondary to engagement calibration. If engagement data exists and conflicts with network insights, weight engagement data more heavily (it's your own audience's behavior; network insights are peers' behavior).

### Step 0.75: Read Topic Calendar (always)

Read `data/topics/calendar.json`. Check two things before selecting topics:

**Duplicates check:** Compare today's research topics against `posted_topics` in the calendar. If a topic covers the same event, product, or keyword within the last 7 days (`duplicate_check_window_days`), SKIP it unless the angle is fundamentally different (not just rewording the same event about Perplexity or Anthropic again).

**Gap check:** Look at `gaps.uncovered_pillars` and `gaps.uncovered_categories`. If "The Lesson" or "The Person" hasn't been posted in 7 days, the pillar post (POST 2) MUST use one of those uncovered pillars. If certain categories have 0 coverage, prefer topics that fill those categories.

### Step 1: Read Inputs
- Read `config/style-profile.json` for voice constraints and unique angles
- Read `config/style-profile.json` → `calibration` section for additional learned parameters
- Read today's research: `data/research/YYYY-MM-DD-topics.json`
- Read today's deep brief if it exists: `data/research/YYYY-MM-DD-deep-brief.md`
- Read `data/personal/experience-brief.md` for Umar's specific projects, decisions, beliefs, and stories
- Read `config/style-profile.json` → `core_hashtags`, `topic_hashtags`, `discovery_hashtags` for hashtag strategy
- Read `data/topics/calendar.json` for topic history, gaps, and dedup rules
- If calibration data exists: apply all calibration_settings overrides from Step 0

**Deep brief priority:** If a deep brief exists for today's date, the #1 hot topic in the research file will have enriched context (`article_summary` + `comment_analysis`). The Post Generator MUST use the deep brief as the PRIMARY context for POST 1. This means:
- Use specific data points and statistics from the article as evidence in the post body
- Use direct quotes from sources to add credibility
- Reference the community debate/consensus found in HN comments
- Use the counter-argument from comments to avoid naive one-sided takes
- Consider the "gaps in conversation" for a unique angle nobody else is taking

### Step 1.5: Build Hashtag Set (6 tags total — STRICT)

Every post gets EXACTLY 6 hashtags. No exceptions. No custom/fabricated tags.

**IMPORTANT: The ONLY hashtags you may ever use are the ones listed in the three sections below. You MUST NOT invent, improvise, or fabricate hashtags. If a post topic does not map cleanly to a category, pick the closest category and use its tags.**

**Step 1.5a — 3 core hashtags (fixed, ALWAYS present, in this exact order):**
`#BuildInPublic #AI #BuildStudio`

These are from `core_hashtags` in style-profile.json. They appear in EVERY post. Never omit, never reorder.

**Step 1.5b — 2 topic-match hashtags (based on post content category):**

First determine the post's content category, then pick 2 from that category's list:

| Content category | Pick 2 from → |
|---|---|
| AI tools, models, API news, LLMs | `#AISystems` `#LLM` `#MachineLearning` |
| Developer workflow, code craft | `#SoftwareEngineering` `#DeveloperLife` |
| Products, startups, founding | `#ProductDevelopment` `#Startups` `#FounderJourney` |
| Career, education, self-taught journey | `#SelfTaughtDeveloper` `#CareerGrowth` |
| Automation, systems, productivity | `#Automation` `#Productivity` |
| Business ops, SaaS, tech news | `#SaaS` `#TechNews` |
| Opinions, controversial takes, developer economy | `#DeveloperEconomy` `#TechCommunity` |

If the category has exactly 2 tags, use both. If it has 3+, pick the 2 most specific to the post content. Never use a hashtag from outside this table.

**Step 1.5c — 1 discovery hashtag (rotating):**
Pick from `discovery_hashtags` in style-profile.json: `#FutureOfWork` `#Innovation` `#WebDev` `#OpenSource` `#DeveloperEconomy` `#TechCommunity` `#CodingLife` `#StartupMindset`

Rotate sequentially across posts — never reuse the previous post's discovery tag.

**Assembly order (exact, no deviations):**
```
#BuildInPublic #AI #BuildStudio #topic_1 #topic_2 #discovery
```

This equals exactly 6 hashtags. Not 5. Not 7. Exactly 6.

**Calibration override:** If `banned_hashtags` exists in engagement-log.json, remove any banned tag and replace it with the next tag from the same category. If `preferred_hashtags` exists, ensure at least one preferred tag appears in the topic-match slots.

**FORBIDDEN:** Never use hashtags not listed in the tables above. Specifically:
- Never use brand names as hashtags (e.g., `#Anthropic`, `#Google`, `#OpenAI` are FORBIDDEN)
- Never use project names as hashtags (e.g., `#OutreachAI`, `#BuildStudio` is only as a core tag)
- Never use made-up hashtags like `#TechPolicy`, `#CodeReview`, `#DevCommunity`
- If a hashtag is not in `core_hashtags`, `topic_hashtags`, or `discovery_hashtags` in style-profile.json, it is INVALID

### Step 2: Generate POST 1 (TREND-ANCHORED)
Pick the hottest (most urgent, most interesting) topic from today's research.

**Deep Brief Integration (if available):** When a deep brief exists, use it to ground your post in real evidence, not generic takes. Specifically:
- Lead with a concrete detail from the article (a number, a quote, a specific claim), not a vague "this just happened"
- In the body, reference the community reaction: "Engineers on HN are split between X and Y" or "The pushback is coming from people who point out Z"
- Use the counter-argument to create tension: "But the other side argues that..."
- Reference the "gaps in conversation" for a unique angle that nobody else on LinkedIn is taking

## HOOK RULES (CRITICAL — this determines whether anyone reads anything else)

### For TREND-ANCHORED posts (POST 1):
- Lead with the BRAND/CONCRETE NAME everyone knows (Perplexity, Google, Microsoft, OpenAI, etc.)
- Make a bold claim/accusation/statement about that entity
- Example hooks that work:
  - "Perplexity's biggest secret got leaked in a lawsuit."
  - "Google just admitted what developers suspected."
  - "Microsoft doesn't even know how many Copilots they have."
- BAD hook: "Everyone is talking about privacy lately." (generic, no anchor)

### For PILLAR posts (POST 2):
- Use a contrarian opening — challenge a common belief your audience holds
- Example hooks that work:
  - "Everyone tells you to scale first. I wish someone told me to stop."
  - "Clean code is a trap." 
  - "The best developers I know write the least code."
- BAD hook: "Let me tell you about something I learned." (no tension)

### Hook requirements for ALL posts:
- Maximum 15 words for trends (shorter = punchier)
- Maximum 12 words for pillars
- Must be a complete thought — no cliffhangers without payoff
- The rest of the post must deliver on the hook's promise (no empty clickbait)

## Post Structure:
```
[HOOK — see hook rules above]

[Body paragraph 1 — develop the point with evidence, story, or logic — 2-3 short sentences]

[Body paragraph 2 — add depth, perspective, or personal experience — 2-3 short sentences]

[SOFT CTA — question or open thought, never "Comment below"]

#BuildInPublic #AI #BuildStudio #topic_tag_1 #topic_tag_2 #discovery_tag

IMAGE PROMPT: [80+ word detailed description of a specific, concrete visual. NO floating screens, NO code editors, NO corporate stock art. Must be editorial illustration style with bold colors, specific composition, and a visual metaphor that matches the hook.]
```

### Step 3: Generate POST 2 (PILLAR-DRIVEN)

**Pillar selection uses calibration data if available:**
- Read `calibration_settings.pillar_weights` from engagement-log.json
- Weight pillar rotation accordingly (min 0.1 per pillar for variety)
- If no calibration or < 11 posts: use equal rotation (The Build → The Lesson → The Person → The Take)

Same structure as POST 1, but driven by the pillar topic rather than trends.

**Hook type calibration:**
- If `hook_type_preference` is set in calibration_settings, use that hook type
- Otherwise use contrarian for pillar posts (default)

**Word count calibration:**
- Use `calibration_settings.post_word_count_min` and `post_word_count_max` if available
- Default to 80-150 if no calibration

**Hashtag calibration:**
- Prefer hashtags from `calibration_settings.preferred_hashtags`
- Avoid hashtags from `calibration_settings.banned_hashtags`

**Topic selection:**
- If `calibration_settings.preferred_topic_categories` has entries, lean toward posts matching those themes
- For "The Build": focus on system architecture, email platforms, data flow design
- For "The Lesson": focus on self-taught journey, mistakes, learning curves
- For "The Person": focus on career decisions, college life, building in public
- For "The Take": use today's hottest research topic

**Honest Specificity Rules (CRITICAL — do NOT inflate):**
Every pillar post MUST reference something authentic: a real project (honestly framed), a genuine learning moment, an actual decision, or a real struggle. Do NOT inflate prototypes into products.

**Reference projects honestly:**
- "I was building an email automation system and learning how SPF records work" NOT "I built OutreachAI, a cold email platform"
- "Deployed a hostel mess app to real users and saw what actually breaks" NOT "Built a production SaaS"
- "Today I built X and realized Y" NOT "X is a revolutionary platform"

**What to draw from (in priority order):**
1. **Today's building** — what Umar actually worked on yesterday/today (this project, a learning experiment, a freelance task)
2. **Real project lessons** — things that broke, things that worked, honest post-mortems
3. **College dev decisions** — choosing to code while studying, time tradeoffs, career choices
4. **Beliefs and opinions** — genuine takes backed by real experience, not hot takes for engagement
5. **Struggles and patterns** — too many projects at once, refining vs testing, complexity creep

**What NOT to do (FORBIDDEN):**
- Do NOT call any project a "platform" unless it actually is one with paying users
- Do NOT use words like "production-grade," "at-scale," "enterprise," "revolutionary"
- Do NOT frame learning prototypes as shipped products
- Do NOT name "OutreachAI" like it's a known brand — describe what it does: "an email automation system I'm building"
- Do NOT use BuildStudio as a credibility anchor — it exists but it's early

### Step 4: Validate Each Post
- [ ] Word count within bounds (80-150, or calibrated range)
- [ ] No banned AI phrases (from style-profile.json forbidden_phrases)
- [ ] Matches style profile tone
- [ ] Has clear hook → body → CTA structure
- [ ] Image prompt is 80+ words and detailed
- [ ] Feels like a real human wrote it
- [ ] **Specificity check**: Post references at least one specific project, decision, belief, or struggle from the experience brief by name. If the post says "I built a platform" without naming which platform or what made it interesting, it fails.
- [ ] Could it be anyone's post, or does it sound like Umar specifically? If generic, REJECT and rewrite with concrete Umar detail
- [ ] Hook hook_type matches calibration preference (if set and confidence >= "good")
- [ ] **Hashtag check**: Post has EXACTLY 6 hashtags in this order: `#BuildInPublic #AI #BuildStudio` (3 core) + 2 topic-match (from category table in Step 1.5b) + 1 discovery (from step 1.5c). No fabricated, brand-name, project-name, or custom hashtags allowed. No duplicates.

### Step 5: Write Output to `data/posts/YYYY-MM-DD-posts.json`

```json
{
  "date": "YYYY-MM-DD",
  "posts": [
    {
      "pillar": "The Take",
      "is_trend_anchored": true,
      "topic_source": "topic headline from research",
      "used_deep_brief": true,
      "hook": "The hook line",
      "body": "Everything after hook and before soft CTA",
      "soft_cta": "The closing question/thought",
      "hashtags": ["#BuildInPublic", "#AI", "#BuildStudio", "#AISystems", "#TechNews", "#FutureOfWork"],
      "topic_category": "business_ops",
      "full_post_text": "Complete post ready for LinkedIn, with line breaks",
      "image_prompt": "Detailed image generation prompt",
      "image_url": null,
      "word_count": 215
    },
    {
      "pillar": "The Build",
      "is_trend_anchored": false,
      "topic_source": "pillar rotation",
      "used_deep_brief": false,
      "hook": "The hook line",
      "body": "Everything after hook and before soft CTA",
      "soft_cta": "The closing question/thought",
      "hashtags": ["#BuildInPublic", "#AI", "#BuildStudio", "#ProductDevelopment", "#Startups", "#Innovation"],
      "topic_category": "product_building",
      "full_post_text": "Complete post ready for LinkedIn, with line breaks",
      "image_prompt": "Detailed image generation prompt",
      "image_url": null,
      "word_count": 198
    }
  ]
}
```

### Step 6: Display Summary
```
Posts Generated: YYYY-MM-DD
============================

POST 1 [The Take] — Trend: [topic headline]
Words: NNN
---
[Display post 1]
---

POST 2 [The Build] — Topic: [pillar topic]
Words: NNN
---
[Display post 2]
---

Both posts stored in data/posts/YYYY-MM-DD-posts.json
Run content-scheduler to format for Google Sheets.
```
