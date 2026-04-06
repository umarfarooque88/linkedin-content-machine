# Personal Experience Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a living experience brief file with Umar's specific projects, decisions, and beliefs, then wire it into Post Generator and Research Engine skills so posts reference concrete, unique-to-Umar material instead of generic descriptions.

**Architecture:** Create one new markdown data file (`data/personal/experience-brief.md`) containing Umar's real experiences. Update both the Post Generator (skill 03) and Research Engine (skill 02) to read and reference this file when generating content.

**Tech Stack:** Markdown data files, Claude Code skill files (markdown instructions), no code changes.

---

### Task 1: Create the Experience Brief file

**Files:**
- Create: `data/personal/experience-brief.md`
- Create: `data/personal/` directory (mkdir -p)

- [ ] **Step 1: Create the directory**

Run:
```bash
mkdir -p "E:\LinkedIn Automation\data\personal"
```

- [ ] **Step 2: Create the experience brief file**

Write `data/personal/experience-brief.md` with this content:

```markdown
# Umar Farooque — Experience Brief

> Updated: 2026-04-06 | Source: Personal research reports + project history

## Active Projects

### OutreachAI (Cold Email Platform)
Cold email automation platform. Handles email infrastructure, contact data management, AI-generated content generation, routing logic, and spam scoring. Built from scratch with real clients. Key challenges: email deliverability, AI content quality validation, data hygiene, deliverability optimization. Real architecture decisions around filters, routing logic, priority queues — built for speed and reliability.

### BuildStudio (Self-Founded)
Personal company positioned as "an execution system to convert ideas into real, functional products." Philosophy: ideas are cheap, making them work is hard, and working on scale is hardest. Not positioning as an agency — positioning as a product-to-execution company.

### STERL (Collaboration)
Collaboration project focused on website development with real business clients.

### AI Medical Triage System
Multilingual medical triage system with advanced NLP. Combines AI with real-world healthcare workflow problems.

### Resume Parser + Job Tracker
Smart resume parsing and job tracking system using NLP and automation.

### Personal AI Assistant
Personal product concept combining intelligence and automation for daily productivity.

## Past Projects & Outcomes

### Hostel Mess Management System
Deployed at MIT ADT University. Real clients, real users. Firebase integration, responsive signup/login flows, notifications, attendance tracking. Learned what real users actually care about vs what engineers think matters.

## Key Decisions & Tradeoffs

### Building Products While In College
Choosing to build real products with real clients while others are studying theory. Creates: practical advantages (real skills, real portfolio, real revenue) but makes the academic and social situation harder.

### Services + Products, Not Just Hobbies
Moving toward commercial products and services, not just hobby projects. A deliberate shift from "learning to build" to "building to ship."

### Fast Iteration Over Perfectionism
Preferring to build fast, test with real data, iterate. Not over-planning or seeking abstract elegance. Real-world utility > theoretical perfection.

### Building Around Messy Real Problems
Choosing to build around messy, operational workflow problems (email deliverability, hostel management, medical triage) not clean demo problems. Where valuable software actually lives.

## Beliefs & Opinions

- AI can replace junior developers' coding but not their problem-solving ability
- Speed matters more than perfectionism in early-stage building
- Building fast, testing, iterating beats planning perfectly every time
- Ideas are cheap; making them work is hard; working on scale is hardest
- Real-world utility > abstract elegance in software
- Honesty and directness are more valuable than comfort in feedback
- AI should enable minimal-human-intervention systems — automate the boring, keep judgment calls human
- The gap between what a privacy policy says and what the code actually does is often deliberate

## Struggles & Pattern Recognition

### Moving Too Fast → Incomplete Systems
Broad interests and rapid ideation lead to incomplete systems that never harden into fully shipped products. Multiple ambitious projects at once dilute shipping speed.

### Refining Instead of Testing
Tendency to spend time refining the system architecture rather than testing it with real users first. Deep thinking is valuable, but can slow validation.

### High-Complexity Ideas
Many ideas are inherently complex. Without strict prioritization, they become impressive prototypes that never reach production. The gap between a working demo and a production-grade system is where the real engineering lives.

## Thinking Style

### Root Cause First
Identifies root causes, not surface symptoms. Finds patterns across different situations and applies them consistently.

### Systems Thinking
Approaches problems as: symptom → workflow → automation → data layer. Always thinks in terms of complete systems, not isolated features.

### Minimal-Human-Intervention Design
Wants systems where AI + automation reduce human intervention to only the judgment calls. Everything else should flow automatically.

### Product-Oriented, Not Theory-Oriented
More interested in whether something works, scales, and can become a usable product than in abstract elegance alone. Unusually product-oriented for a student.

### Directness Over Comfort
Values honest, direct feedback. Pushes for harder feedback and clearer thinking. Cares more about accuracy than comfort in communication.

## Real Context

- Computer Science student at MIT ADT University, pursuing BTech
- Self-taught developer path — not traditional CS education only
- Building multiple projects simultaneously while managing college
- Freelancer mindset — always open to gigs and collaborations
- 1700+ LinkedIn connections, currently getting 3-4 likes per post
- Located in Pune, India
- Full-stack developer who actually builds with these tools, not just tweets about them
```

### Task 2: Update Post Generator to read the Experience Brief

**Files:**
- Modify: `skills/03-post-generator.md`

- [ ] **Step 1: Add experience brief to Step 1 inputs**

Find the existing Step 1 section:

```markdown
### Step 1: Read Inputs
- Read `config/style-profile.json` for voice constraints and unique angles
- Read `config/style-profile.json` → `calibration` section for additional learned parameters
- Read today's research: `data/research/YYYY-MM-DD-topics.json`
- Read today's deep brief if it exists: `data/research/YYYY-MM-DD-deep-brief.md`
- If calibration data exists: apply all calibration_settings overrides from Step 0
```

Replace with:

```markdown
### Step 1: Read Inputs
- Read `config/style-profile.json` for voice constraints and unique angles
- Read `config/style-profile.json` → `calibration` section for additional learned parameters
- Read today's research: `data/research/YYYY-MM-DD-topics.json`
- Read today's deep brief if it exists: `data/research/YYYY-MM-DD-deep-brief.md`
- Read `data/personal/experience-brief.md` for Umar's specific projects, decisions, beliefs, and stories
- If calibration data exists: apply all calibration_settings overrides from Step 0
```

- [ ] **Step 2: Add specificity rules for pillar posts**

Find the existing section for POST 2 (Step 3: Generate POST 2 (PILLAR-DRIVEN)), specifically the "Topic selection" subsection that starts with:

```markdown
**Topic selection:**
- If `calibration_settings.preferred_topic_categories` has entries, lean toward posts matching those themes
```

After the "Topic selection" section and before the "Draw from Umar's real experiences:" section, add:

```markdown
**Specificity Rules (CRITICAL):**
Every pillar post MUST reference a specific project, decision, moment, or belief from the experience brief. Vague references like "I built a platform" or "in my experience" are not specific enough.
- Name actual projects: "OutreachAI" (cold email platform), "BuildStudio" (your company), "Hostel Mess Management System" (deployed at MIT ADT University)
- Reference real decisions: the choice to build products in college, the decision to iterate fast rather than plan perfectly, the philosophy that ideas are cheap but scale is hardest
- Include real numbers, timelines, or specific situations when available from the brief
- If the post is about a technical decision, name what you actually built and why
- For "The Person" posts, reference real context: college life, self-taught path, managing multiple projects, freelancer mindset
```

- [ ] **Step 3: Replace generic experience references with brief references**

Find the existing "Draw from Umar's real experiences:" section:

```markdown
Draw from Umar's real experiences:
- Built an email automation platform (cold email system)
- Built a hostel management system with real clients
- Building BuildStudio (my own company)
- Worked on AI model evaluation
- Self-taught developer in college
- Freelance and project experience
- Non-conventional path to development
```

Replace with:

```markdown
**Source your content from the experience brief:**
Read `data/personal/experience-brief.md` for the full list of Umar's projects, decisions, beliefs, struggles, thinking patterns, and real context.
- For "The Build": reference specific projects (OutreachAI, Hostel Mess System, BuildStudio) with real architectural decisions and tradeoffs
- For "The Lesson": draw from the "Struggles & Pattern Recognition" section — moving too fast, refining vs testing, high-complexity ideas
- For "The Person": use the "Real Context" section — college life, self-taught path, simultaneous projects, freelancer mindset
- For "The Take": connect opinions from the "Beliefs & Opinions" section to the topic at hand
```

- [ ] **Step 4: Add validation rule for specificity**

Find the existing Step 4 (Validate Each Post) checklist:

```markdown
### Step 4: Validate Each Post
- [ ] Word count within bounds (80-150, or calibrated range)
- [ ] No banned AI phrases (from style-profile.json forbidden_phrases)
- [ ] Matches style profile tone
- [ ] Has clear hook → body → CTA structure
- [ ] Image prompt is 80+ words and detailed
- [ ] Feels like a real human wrote it
- [ ] Could it be anyone's post, or does it sound like Umar specifically?
- [ ] Hook hook_type matches calibration preference (if set and confidence >= "good")
- [ ] Hashtags don't include anything from banned_hashtags (if calibration available)
```

Replace the "Could it be anyone's post" item with a more specific check:

```markdown
### Step 4: Validate Each Post
- [ ] Word count within bounds (80-150, or calibrated range)
- [ ] No banned AI phrases (from style-profile.json forbidden_phrases)
- [ ] Matches style profile tone
- [ ] Has clear hook → body → CTA structure
- [ ] Image prompt is 80+ words and detailed
- [ ] **Specificity check**: Post references at least one specific project, decision, or belief from the experience brief. If the post says "I built a platform" without naming WHICH platform or WHAT made it interesting, it fails this check.
- [ ] Could it be anyone's post, or does it sound like Umar specifically? If it could be anyone's opinion, REJECT and rewrite with specific Umar detail
- [ ] Hook hook_type matches calibration preference (if set and confidence >= "good")
- [ ] Hashtags don't include anything from banned_hashtags (if calibration available)
```

### Task 3: Update Research Engine to cross-reference the brief

**Files:**
- Modify: `skills/02-research-engine.md`

- [ ] **Step 1: Add experience brief to step 3 (personal connection)**

Find the existing step 3:

```markdown
3. For each trending topic, also identify Umar's personal connection:
   - Can he relate it to a project he's built?
   - Can he give a contrary opinion?
   - Can he share a lesson or mistake?
   - Can he speak as someone "in the trenches"?
```

Replace with:

```markdown
3. For each trending topic, identify Umar's personal connection by cross-referencing the experience brief:

   Read `data/personal/experience-brief.md` to find specific connections:
   - **Project connection**: Does any project from the brief directly relate to this topic? (e.g., OutreachAI relates to AI-generated content quality, email infrastructure, deliverability)
   - **Belief connection**: Does this topic connect to a specific belief or opinion from the brief? (e.g., "AI can replace junior developers' coding but not their problem-solving")
   - **Struggle connection**: Does this topic mirror a real struggle Umar has faced? (e.g., moving too fast → incomplete systems, idea overload)
   - **Decision connection**: Did Umar make a real decision about this kind of problem? (e.g., choosing to build fast and iterate rather than plan perfectly)
   - **Trenches connection**: Can he speak as someone who actually built with these tools, not someone who tweets about them?

   When you find a connection, name the specific project, decision, or belief from the brief. Do NOT say "he has experience with AI" — say "he built OutreachAI, a cold email platform that handles AI-generated content quality and deliverability optimization."
```

- [ ] **Step 2: Update step 2c (post angles) to reference specific brief material**

Find the existing step 2c (in Phase 2: Deep Dive section):

```markdown
### Step 2c: Post Angles

Based on the article + comments, identify 3 specific post angles Umar could write about:
- **Angle 1**: The main take (article-backed, with data points and quotes)
- **Angle 2**: The contrarian take (informed by the counter-arguments found in comments)
- **Angle 3**: The personal experience connection (connect to Umar's actual projects/experience)
```

Replace with:

```markdown
### Step 2c: Post Angles

Read `data/personal/experience-brief.md` for Umar's specific projects, decisions, and beliefs.

Based on the article + comments, identify 3 specific post angles Umar could write about:
- **Angle 1**: The main take (article-backed, with data points and quotes, connected to a specific project from the brief)
- **Angle 2**: The contrarian take (informed by the counter-arguments found in comments, connected to a specific belief or opinion from the brief)
- **Angle 3**: The personal experience connection (connect to a specific project, decision, or struggle from the brief — name it, don't be generic)

Each angle MUST name a specific element from the experience brief. Generic connections like "he's a developer who works with AI" are not acceptable.
```

### Task 4: Update HANDOVER.md and commit

**Files:**
- Modify: `HANDOVER.md`

- [ ] **Step 1: Update Problem #3 in HANDOVER.md**

Find the current Problem #3 row:

```markdown
| 3 | **Personal experience feels generic** | Open | Needs more specific, unique-to-Umar details. |
```

Replace with:

```markdown
| 3 | **Personal experience feels generic** | ✅ FIXED | Created `data/personal/experience-brief.md` — a living document extracted from Umar's personal research reports containing specific projects (OutreachAI, BuildStudio, Hostel Mess System, STERL, AI Medical Triage), key decisions (building in college, fast iteration over perfectionism, services + products focus), beliefs (AI replaces coding not problem-solving, speed > perfectionism, ideas cheap vs scale hardest), struggles (moving too fast → incomplete systems, refining vs testing, high-complexity ideas), thinking patterns (root cause first, systems thinking, minimal-human-intervention design), and real context (college life, self-taught path, freelancer mindset). Post Generator now reads this brief and enforces specificity rules: every pillar post must reference specific projects, decisions, or beliefs. Research Engine cross-references the brief for personal connections. Generic language ("I built a platform") replaced with concrete references ("I built OutreachAI, a cold email platform that handles real deliverability optimization"). Full changes: `data/personal/experience-brief.md`, updated `skills/03-post-generator.md` and `skills/02-research-engine.md`. Design: `docs/superpowers/specs/2026-04-06-personal-experience-brief-design.md`. |
```

- [ ] **Step 2: Commit all changes**

```bash
git add data/personal/experience-brief.md skills/02-research-engine.md skills/03-post-generator.md HANDOVER.md docs/superpowers/specs/2026-04-06-personal-experience-brief-design.md docs/superpowers/plans/2026-04-06-personal-experience-brief-plan.md
git commit -m "$(cat <<'EOF'
feat: add personal experience brief — posts now reference specific projects and decisions

Creates living experience document from Umar's personal research reports
containing specific projects, key decisions, beliefs, struggles, and thinking
patterns. Post Generator now reads this brief and enforces specificity rules:
every pillar post must reference concrete, unique-to-Umar material. Research
Engine cross-references brief for personal connections to trending topics.

Design: specs/2026-04-06-personal-experience-brief-design.md
Plan: plans/2026-04-06-personal-experience-brief-plan.md
EOF
)"
```

- [ ] **Step 3: Push to GitHub**

```bash
git push origin master
```