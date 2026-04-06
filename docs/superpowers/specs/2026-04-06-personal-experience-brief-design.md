# Personal Experience Brief — Design Spec

> Date: 2026-04-06
> Problem: #3 — Personal experience feels generic (posts could be anyone's)
> Solution: Create a living experience brief file + wire it into Post Generator and Research Engine skills

## Problem Statement

Posts reference projects generically ("built an email platform") but lack the specific details, decisions, tradeoffs, and moments that make content unique to Umar. Two personal research reports in `Dataset/` contain rich material that's never been loaded into the content generation pipeline.

## Design

### 1. Create `data/personal/experience-brief.md`

Single source of truth for Umar-specific stories, decisions, projects, and beliefs. Markdown format, editable, updateable over time. Structure:

```markdown
# Umar Farooque — Experience Brief

## Active Projects
[Specific projects with details, not bullet points]

## Past Projects & Outcomes
[Things built, what happened, real results]

## Key Decisions & Tradeoffs
[Specific choices with reasoning and consequences]

## Beliefs & Opinions
[Things Umar actually holds as opinions that others push back on]

## Struggles & Pattern Recognition
[Recurring problems, what went wrong, lessons learned]

## Thinking Style
[How Umar approaches problems, not what problems]

## Real Context
[Life circumstances, college situation, actual day-to-day work]
```

### 2. Content (extracted from personal research reports)

**Active Projects:**
- **OutreachAI** — Cold email automation platform. Key challenges: email deliverability, AI-generated content quality, contact data hygiene, routing logic, scoring. Built from scratch handling real clients.
- **BuildStudio** — Self-founded. Not an agency — positioned as "an execution system to convert ideas into real, functional products." Philosophy: ideas are cheap, making them work is hard, and working on scale is hardest.
- **STERL** — Collaboration project, website development, real business clients.
- **DieOnThisHill** — Opinion/conviction platform concept.
- **AI Medical Triage System** — Multilingual medical triage concept with advanced NLP.
- **Resume Parser + Job Tracker** — Smart parsing and tracking system.
- **Personal AI Assistant** — Personal product concept combining intelligence and automation.

**Past Projects:**
- **Hostel Mess Management System** — Deployed at MIT ADT University. Real clients, real users. Firebase integration, responsive flows, notifications, attendance tracking.

**Key Decisions:**
- Choosing to build real products in college while others are studying theory — a deliberate path that creates practical advantages but makes the academic/social situation harder.
- Moving toward services + commercial products, not just hobby projects.
- Preferring to build fast, test, iterate — not over-plan.
- Building around messy real problems, not clean demo problems.

**Beliefs & Opinions:**
- AI can replace junior developers' coding but not their problem-solving.
- Speed matters more than perfectionism in early-stage building.
- Building fast, testing, iterating is better than planning perfectly.
- Ideas are cheap; making them work is hard; working on scale is hardest.
- Real-world utility > abstract elegance.

**Struggles & Patterns:**
- Moving too fast → incomplete systems that never harden into shipped products.
- Idea overload — broad interests diluting shipping speed.
- Spending time refining systems rather than testing with real users.
- The tension between ambition and focus.

**Thinking Style:**
- Root cause first, not surface symptoms. Identifies patterns across different situations.
- Systems thinking: symptom → workflow → automation → data layer.
- Wants minimal-human-intervention systems (AI + automation approach to problems).
- Honesty and directness valued over comfort.
- Product-oriented rather than theory-oriented.

**Real Context:**
- CS student at MIT ADT University, pursuing BTech.
- Self-taught developer path.
- Building multiple projects simultaneously while managing college.
- Freelancer mindset — always open to gigs and collaborations.
- 1700+ LinkedIn connections, near-zero engagement (3-4 likes currently).

### 3. Skill Changes

**Post Generator (`skills/03-post-generator.md`):**
- Add to Step 1: Read `data/personal/experience-brief.md` for specific stories, projects, decisions
- Add rule: Every pillar post MUST reference a specific project, decision, moment, or belief from the brief — not generic descriptions
- Add rule: Posts should name specific products (OutreachAI, BuildStudio, Hostel Mess System) when they are Umar's own creations
- Update the "Draw from Umar's real experiences" section to reference the brief file instead of inline bullet points
- Add validation: Post feels like it could be anyone's opinion → REJECT → needs specific Umar detail

**Research Engine (`skills/02-research-engine.md`):**
- Update step 3 (personal connection) to cross-reference the experience brief for specific project connections
- Update step 2c (post angles) to tie angles to specific projects/beliefs from the brief rather than generic "can he relate" questions

### 4. Output Change Example

Before: "I built an email automation platform and learned about complexity."
After: "I spent weeks building email infrastructure for OutreachAI — filters, routing logic, spam scoring. Then watched a deliverability bug silently drop 42% of cold traffic for 11 days before anyone noticed. You don't need a bigger system. You need one that catches what matters."

## Files Changed

| File | Action | Responsibility |
|------|--------|----------------|
| `data/personal/experience-brief.md` | Create | Living document of Umar-specific material |
| `skills/03-post-generator.md` | Modify | Read brief, enforce specificity rules |
| `skills/02-research-engine.md` | Modify | Cross-reference brief for personal angles |
| `HANDOVER.md` | Modify | Update Problem #3 status |
