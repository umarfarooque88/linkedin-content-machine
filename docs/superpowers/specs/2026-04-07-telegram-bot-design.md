# Telegram Bot — Content Delivery System

> Date: 2026-04-07
> Status: Design Review

---

## Goal

Replace the Google Sheets review step with a Telegram bot that automatically delivers daily posts, receives engagement stats, and feeds local scripts — all running on Umar's machine via Windows Task Scheduler.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Umar's Machine (local Node.js)                         │
│                                                         │
│  9:50 AM  → Task Scheduler starts telegram-bot.js       │
│  10:00 AM → Morning briefing sent (both posts)          │
│  3:50 PM  → (optional: reminder/engagement check)       │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐   │
│  │ Research │──→│ Post Gen │──→│ telegram-bot.js  │   │
│  │ Engine   │   │          │   │  (runs 24/7)     │   │
│  └──────────┘   └──────────┘   └─────┬────────────┘   │
│                                      │                 │
│  ┌──────────────┐   ┌────────────┐  │                 │
│  │ Eng Tracker  │←─ │ Stats      │←─┘                 │
│  │              │   │ Ingestion  │                    │
│  └──────────────┘   └────────────┘                    │
└─────────────────────────────────────────────────────────┘
              ↕ Telegram Bot API
              ↕
        Umar's Phone (Telegram app)
```

## Components

### 1. The Bot: `scripts/telegram-bot.js`

- Single Node.js process using `node-telegram-bot-api` (polling mode)
- Runs continuously, managed by Windows Task Scheduler
- No database — reads/writes from existing file system
- Bot token stored in `.env` (never committed)

### 2. Scheduling

| Time | Trigger | Action |
|------|---------|--------|
| 9:50 AM | Windows Task Scheduler starts process | Start bot |
| 10:00 AM | Cron expression `0 10 * * *` | Run research + post gen → send both posts |
| 3:50 PM | Windows Task Scheduler (optional) | Second instance if first not running |
| Ongoing | User commands | Respond to /today, /stats, /generate, /skip, /status, /help |

### 3. Commands

| Command | Type | Response |
|---------|------|----------|
| (auto) | Scheduled | Morning briefing with both posts + Copy buttons + Stats button |
| `/today` | Manual | Resend today's posts |
| `/generate` | Manual | Force-run research + post gen + send (catch-up) |
| `/stats` | Manual | Open stats entry flow for oldest pending post |
| `/status` | Manual | Show: posts posted/pending/missing engagement |
| `/skip` | Manual | Skip today's scheduled generation |
| `/help` | Manual | List all commands |

### 4. Morning Briefing Message Format

```
📝 Morning Brief — Apr 07

POST 1 — The Take (Trend)
────────────────────────────────
[full post text, ~100 words, with hashtags]
────────────────────────────────

POST 2 — The Person (Pillar)
────────────────────────────────
[full post text, ~100 words, with hashtags]
────────────────────────────────

⚠️ 1 post missing engagement data

Inline buttons per post:
  [Copy Post 1]  [Copy Post 2]
  [Report Stats]
```

**Copy** → Sends post text as a standalone message with no formatting, making it easy to long-press copy.

**Report Stats** → Opens interactive stats entry flow.

### 5. Stats Entry Flow (Interactive Buttons)

When user taps "Report Stats" or sends `/stats`:

```
Step 1: Bot reads engagement-log.json for oldest pending post
Step 2: Sends: "📊 Post from Apr 06 (The Build) — Likes?"
        Inline: [1] [3] [5] [10] [20] [+ Custom]
Step 3: User taps → next question: "Comments?"
        Inline: [0] [1] [3] [5] [10] [+ Custom]
Step 4: User taps → "Shares?"
        Inline: [0] [1] [3] [5] [+ Custom]
Step 5: All 3 collected → writes to posts-db.jsonl
        Sends: "✅ Logged: 5 likes, 2 comments, 0 shares"
```

For "Custom" → bot expects a numeric text reply, then continues.

### 6. Integration with Existing Scripts

The bot runs existing scripts via `child_process.exec()`:

| Existing Script | Called By | Output |
|----------------|-----------|--------|
| `scripts/fetch-research.js` | Bot daily trigger | `data/research/YYYY-MM-DD-topics.json` |
| `scripts/deep-dive.js` | Bot (if hot topic found) | `data/research/YYYY-MM-DD-deep-dive.json` |
| Post Generator (skill 03) | Bot (after research) | `data/posts/YYYY-MM-DD-posts.json` |
| `scripts/generate-images.js` | Bot (optional, skip by default) | `data/media/` |
| Engagement Tracker (skill 05) | Bot (stats ingestion) | Updated posts-db.jsonl |

**No scripts are rewritten.** The bot is the conductor, existing scripts are the musicians.

### 7. Error Handling

| Scenario | Response |
|----------|----------|
| Research returns empty feeds | "Research empty today. Generating pillar-only post." → skip research, generate Post 2 |
| Deep dive API fails | Continue without deep insights → use headline only |
| Post generation fails | Retry once → if still fails, send basic fallback: "Today I learned [pillar lesson]" |
| Bot crashes mid-delivery | Messages partial → `/today` re-sends everything |
| Windows Task Scheduler doesn't fire | PC was off → `/generate` manual catch-up |
| Rate limiting from Telegram | Pause 30 seconds, retry |

### 8. Post Status Tracking

| Field | Value |
|------|-------|
| `pending` | Generated, not sent to Telegram yet |
| `delivered` | Sent to Umar via Telegram |
| `reviewed` | Umar clicked [Copy] (indicates review) |
| `posted` | Umar manually posted on LinkedIn (stats pending) |
| `engaged` | Stats logged via bot → engagement tracker updated |

When bot sends posts → status updates to `delivered`.
When user clicks [Copy] → status updates to `reviewed`.
When stats entered via bot → status updates to `engaged` (engagement tracker updated via existing flow).

### 9. File System Changes

**New files:**

| File | Purpose |
|------|---------|
| `scripts/telegram-bot.js` | The bot process |
| `.env` | Bot token (TELEGRAM_BOT_TOKEN=xxx) |
| `.gitignore` → add `.env` | Never commit tokens |

**Modified files:**

| File | Change |
|------|--------|
| `package.json` | Add `node-telegram-bot-api` + `dotenv` dependencies |
| `DAILY-WORKFLOW.md` | Update workflow to reflect Telegram delivery |
| `skills/04-content-scheduler.md` | Change "Google Sheets" → "Telegram delivery" |
| `HANDOVER.md` | Update #6 from "Open" → "IN PROGRESS: Telegram" |

**Unchanged files:**

- `scripts/fetch-research.js` — runs as-is
- `scripts/deep-dive.js` — runs as-is
- `scripts/generate-images.js` — runs as-is (optional)
- `data/**` — all data files remain the same schema
- `skills/01-05` — skills work as-is, triggered by bot

### 10. Dependencies

| Package | Purpose |
|---------|---------|
| `node-telegram-bot-api` | Bot framework (polling mode) |
| `dotenv` | Environment variables |
| `node-cron` | Scheduling (or use process start time + setTimeout) |
| Built-in `fs`, `path`, `child_process` | File system + script execution |

### 11. Windows Task Scheduler Setup (Manual Steps)

1. Create task "LinkedIn Bot" → Trigger: Daily 9:50 AM
2. Action: `node "E:\LinkedIn Automation\scripts\telegram-bot.js"`
3. Working directory: `E:\LinkedIn Automation`
4. Run whether user is logged in or not — NO (must be logged in, bot needs active session)
5. **Stop existing task if already running** (checkbox) — YES

---

## Post-Implementation Cleanup

After the bot is live, these items change in HANDOVER.md:

| Item | From | To |
|------|------|----|
| #6 Google Sheets | Open | ✅ FIXED (Telegram delivery) |
| Daily Workflow Step 4-5 | "Format for Sheets → Post" | "Bot delivers → Review → Post" |
| What Needs Work | "Google Sheets API" | (remove) |
| Image quality | ⚠️ | Continue deferred until stats data arrives |
