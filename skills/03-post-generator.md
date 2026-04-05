# Post Generator

Generate 2 daily LinkedIn posts combining Umar's style voice, content pillars, and today's trending topics.

## Requirements

- Each post must be 150-300 words (LinkedIn optimal length)
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

### Step 1: Read Inputs
- Read `config/style-profile.json` for voice constraints and unique angles
- Read today's research: `data/research/YYYY-MM-DD-topics.json`

### Step 2: Generate POST 1 (TREND-ANCHORED)
Pick the hottest (most urgent, most interesting) topic from today's research.

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

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5

IMAGE PROMPT: [80+ word detailed description of a specific, concrete visual. NO floating screens, NO code editors, NO corporate stock art. Must be editorial illustration style with bold colors, specific composition, and a visual metaphor that matches the hook.]
```

### Step 3: Generate POST 2 (PILLAR-DRIVEN)
Rotate through pillars daily: Day1=The Build, Day2=The Lesson, Day3=The Person, Day4=The Take.

Same structure as POST 1, but driven by the pillar topic rather than trends.

Draw from Umar's real experiences:
- OutreachAI (the cold email platform he built)
- Hostel Mess Management System (used by real clients)
- BuildStudio (current full-stack role)
- Outrier (AI model evaluation work)
- Being self-taught and building in college
- Freelance and project experience
- Non-conventional path to development

### Step 4: Validate Each Post
- [ ] Word count 150-300
- [ ] No banned AI phrases
- [ ] Matches style profile tone
- [ ] Has clear hook → body → CTA structure
- [ ] Image prompt is 50+ words and detailed
- [ ] Feels like a real human wrote it
- [ ] Could it be anyone's post, or does it sound like Umar specifically?

### Step 5: Write Output to `data/posts/YYYY-MM-DD-posts.json`

```json
{
  "date": "YYYY-MM-DD",
  "posts": [
    {
      "pillar": "The Take",
      "is_trend_anchored": true,
      "topic_source": "topic headline from research",
      "hook": "The hook line",
      "body": "Everything after hook and before soft CTA",
      "soft_cta": "The closing question/thought",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "full_post_text": "Complete post ready for LinkedIn, with line breaks",
      "image_prompt": "Detailed image generation prompt",
      "image_url": null,
      "word_count": 215
    },
    {
      "pillar": "The Build",
      "is_trend_anchored": false,
      "topic_source": "pillar rotation",
      "hook": "The hook line",
      "body": "Everything after hook and before soft CTA",
      "soft_cta": "The closing question/thought",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
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
