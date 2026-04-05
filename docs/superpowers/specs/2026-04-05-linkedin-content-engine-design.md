# LinkedIn Content Engine — Design Document

## Purpose

Automate Umar Farooque's LinkedIn content creation by researching trending topics (especially AI), generating posts that match his writing style and content pillars, creating accompanying media, and storing everything in Google Sheets. The system runs daily, producing 2 ready-to-post drafts per day with ~10 min of Umar's review time.

## User Profile

- **Name:** Umar Farooque
- **Role:** Full-Stack Developer at BuildStudio, pursuing BTech in CS at MIT ADT University
- **Key projects:** OutreachAI (cold email automation), Hostel Mess Management System (real clients)
- **Past work:** Outrier (AI model evaluation), Microspectra (Frontend Dev)
- **Positioning:** Professional journey + tech mix (pillars 2 & 4)
- **Goal:** Build personal brand + thought leadership
- **Posting frequency:** 2 posts per day
- **1700+ connections** on LinkedIn, currently getting 3-4 likes per post

## Architecture

```
[Style Analyzer (one-time)]
         |
         v
[Research Engine (daily)] --> [Post Generator (daily, 2 posts)]
                                       |
                            ┌──────────┴──────────┐
                            v                     v
                     [Text Posts]          [Media Generation]
                            │                     │
                            └──────────┬──────────┘
                                       v
                          [Google Sheets Content Hub]
                           (post + image + status)
                                       |
                              [Umar reviews + posts]
                                       |
                               LinkedIn (manual post)
```

## Content Pillars

| # | Pillar | Focus | Example |
|---|-------|-------|---------|
| 1 | The Build | Projects, technical decisions, architecture | "How I solved X," "What I'd redo" |
| 2 | The Lesson | Mistakes, learnings, growth moments | "I wasted 3 months on this" |
| 3 | The Take | Opinions on industry/AI trends | "Everyone's wrong about X" |
| 4 | The Person | Career journey, authentic life moments | "Where I started vs now" |

Daily mix: Rotate through pillars, always include at least one trend-anchored post.

## Research Engine

### Data Sources (daily)
1. **WebSearch** — AI news, product launches, debates, research papers
2. **Industry awareness** — What's being talked about in dev/AI communities
3. **Content gap analysis** — What is everyone saying that we can add a unique take to

### Output
3-5 trending topic ideas per day with:
- Topic headline
- Why it matters to Umar's audience
- Recommended pillar for approaching it
- Unique angle/opinion that differentiates from the generic

## Post Generator

### Input
- Style profile (from Style Analyzer)
- Content pillar assignment
- Research output (trend + topic)

### Output (per post)
- **Hook:** First line that stops the scroll
- **Body:** 150-300 words, structured for LinkedIn readability
- **CTA:** Call to action (comment question, engage prompt)
- **Hashtags:** 3-5 relevant tags
- **Media prompt:** Description for image generation

## Style Profile

### Captured attributes
- Tone: Mix of formal/analytical and casual/conversational
- Sentence structure: Both short punchy and longer explanatory
- Hook preferences
- Formatting habits (line breaks, lists, etc.)
- Hashtag style
- Emoji usage level

### Maintenance
- Created once via analysis of Umar's existing posts + interview
- Refreshed monthly as Umar's voice evolves
- Updated based on which posts perform best

## Media Generation

### Process
1. Each post gets a unique AI prompt for image creation
2. Images use a consistent visual brand/esthetic
3. Generated using Google's image generation models (Vertex AI / Imagen via API)
4. Saved locally, then uploaded to Google Drive
5. Drive link stored in Google Sheets row

### Brand consistency
- Same aesthetic across all posts (recognizable visual identity)
- Different content per post
- Text overlays minimal, clean typography

## Google Sheets Content Hub

### Schema
| Column | Type | Description |
|--------|------|-------------|
| Post # | Integer | Auto-incrementing ID |
| Date | Date | Date generated |
| Pillar | String | The Build / The Lesson / The Take / The Person |
| Post Text | String | Full post copy (ready to paste) |
| Media | URL | Google Drive link to generated image |
| Media Prompt | String | The prompt used to generate the image |
| Status | Enum | Draft → Reviewed → Scheduled → Posted |
| Posted Date | Date | Actual posting date |
| Engagement | JSON | {likes, comments} after posting |
| Notes | String | Context or tweaks |
| Topic Source | String | News URL or trend that inspired this post |

## Error Handling

- If research finds nothing trending: fall back to evergreen pillar topics
- If image generation fails: post goes to Sheets with "media needed" placeholder
- If Sheets API fails: save posts locally as markdown files as backup
- Style profile missing: use default professional-tech voice (marked clearly as needing calibration)

## Skills to Build

### 1. Style Analyzer
- **Input:** Umar's existing posts, writing samples, interview responses
- **Output:** JSON style profile saved to `config/style-profile.json`
- **Skills used:** skill-creator to define this as a reusable skill

### 2. Research Engine
- **Input:** Current date, content pillars
- **Process:** WebSearch for AI/tech trends, gap analysis, topic scoring
- **Output:** `data/research/YYYY-MM-DD-topics.json` with 3-5 topics
- **Skills used:** skill-creator

### 3. Post Generator
- **Input:** Style profile + today's research + pillar assignment
- **Process:** Generate 2 posts using style constraints
- **Output:** `data/posts/YYYY-MM-DD-posts.json` (2 posts)
- **Skills used:** skill-creator

### 4. Content Scheduler
- **Input:** Today's posts
- **Process:** Format for Google Sheets, manage status tracking
- **Output:** Updated Google Sheet row per post
- **Skills used:** skill-creator, xlsx (for local backup)

## Implementation Order

1. Style Analyzer → creates the foundation
2. Research Engine → provides the content direction
3. Post Generator → creates the actual posts
4. Content Scheduler → stores and tracks everything
5. Media Generator → adds images to each post
6. Google Sheets integration → connects to the content hub
