# Telegram Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Telegram bot that delivers daily posts via Telegram, receives engagement stats through inline buttons, and orchestrates the existing research/post-generation scripts.

**Architecture:** Single `telegram-bot.js` process using `node-telegram-bot-api` (polling mode), started by Windows Task Scheduler at 9:50 AM, sends both posts at 10:00 AM. Bot runs existing scripts via `child_process.exec()`. No database — reads/writes from existing JSON file system.

**Tech Stack:** Node.js, node-telegram-bot-api, dotenv, node-cron, child_process.exec, native fetch API

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/telegram-bot.js` | **Create** | Main bot process — commands, scheduling, message delivery, stats flow |
| `scripts/bot-helpers.js` | **Create** | Pure utility functions: `runScript()`, `readPosts()`, `updatePostStatus()`, `findPendingEngagement()` |
| `scripts/telegram-stats.js` | **Create** | Stats ingestion engine — reads Telegram button data, writes to `posts-db.jsonl` via engagement tracker pattern |
| `.env` | **Create** | `TELEGRAM_BOT_TOKEN=...` |
| `.gitignore` | **Modify** | Add `.env` if not present |
| `package.json` | **Create** | Add `node-telegram-bot-api`, `dotenv`, `node-cron` |
| `DAILY-WORKFLOW.md` | **Modify** | Replace Sheets workflow with Telegram |
| `skills/04-content-scheduler.md` | **Modify** | Change output from Sheets → Telegram delivery |
| `HANDOVER.md` | **Modify** | Update #6 status |

---

### Task 1: Project Setup — Dependencies + Environment

**Files:**
- Create: `.env`
- Create: `.gitignore` (if not exists)
- Create: `package.json`

- [ ] **Step 1.1: Create .gitignore**

```
.env
node_modules/
data/media/
Dataset/
.claude/
---.txt
```

Run: `ls .gitignore` (should exist already per HANDOVER, skip if present with .env listed)

- [ ] **Step 1.2: Create .env**

```
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
```

- [ ] **Step 1.3: Create package.json**

```json
{
  "name": "linkedin-content-machine",
  "version": "1.0.0",
  "type": "module",
  "description": "LinkedIn content automation system",
  "main": "scripts/telegram-bot.js",
  "scripts": {
    "bot": "node scripts/telegram-bot.js"
  },
  "dependencies": {
    "node-telegram-bot-api": "^0.66.0",
    "dotenv": "^16.4.5",
    "node-cron": "^3.0.3"
  }
}
```

- [ ] **Step 1.4: Install dependencies**

```bash
cd "E:\LinkedIn Automation" && npm install
```

Expected: `added X packages` — `node-telegram-bot-api`, `dotenv`, `node-cron` installed

- [ ] **Step 1.5: Verify .gitignore blocks .env**

Run: `grep -c "\.env" .gitignore`
Expected: `1` or higher (at least one .env reference)

- [ ] **Step 1.6: Commit**

```bash
git add package.json package-lock.json .env .gitignore
git commit -m "chore: add telegram bot dependencies + .env"
```

---

### Task 2: Bot Core + /help + /today

**Files:**
- Create: `scripts/telegram-bot.js`
- Create: `scripts/bot-helpers.js`

- [ ] **Step 2.1: Write bot-helpers.js**

```js
// scripts/bot-helpers.js — Pure utility functions for the Telegram bot
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'data', 'posts');
const ENGAGEMENT_DIR = path.join(ROOT, 'data', 'engagement');
const POSTS_DB = path.join(ENGAGEMENT_DIR, 'posts-db.jsonl');

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function readTodayPosts() {
  const today = todayStr();
  const file = path.join(POSTS_DIR, `${today}-posts.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function readPostsForDate(dateStr) {
  const file = path.join(POSTS_DIR, `${dateStr}-posts.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function updatePostStatus(dateStr, postIndex, key, value) {
  const file = path.join(POSTS_DIR, `${dateStr}-posts.json`);
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (data.posts[postIndex]) {
    data.posts[postIndex][key] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
}

export function getPendingEngagement() {
  // Find posts older than 24h without engagement data
  const posts = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('-posts.json'));
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pending = [];

  // Read existing engagement DB
  let engaged = new Set();
  if (fs.existsSync(POSTS_DB)) {
    for (const line of fs.readFileSync(POSTS_DB, 'utf-8').trim().split('\n')) {
      if (line) engaged.add(JSON.parse(line).date);
    }
  }

  for (const p of posts) {
    const date = p.replace('-posts.json', '');
    const fileDate = new Date(date);
    if (fileDate < cutoff && !engaged.has(date)) {
      const data = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, p), 'utf-8'));
      for (let i = 0; i < data.posts.length; i++) {
        pending.push({ date, postIndex: i, post: data.posts[i] });
      }
    }
  }

  return pending;
}

export async function runScript(scriptPath, args = '') {
  const cmd = `node "${path.join(ROOT, scriptPath)}" ${args}`;
  return execAsync(cmd);
}
```

- [ ] **Step 2.2: Write telegram-bot.js — Core setup**

```js
#!/usr/bin/env node

/**
 * Telegram Bot — Local content delivery for LinkedIn posts
 *
 * Started by Windows Task Scheduler at 9:50 AM.
 * Sends both posts at 10:00 AM.
 * Receives engagement stats via inline buttons.
 *
 * Usage: node scripts/telegram-bot.js
 */

import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import {
  todayStr, readTodayPosts, readPostsForDate, updatePostStatus,
  getPendingEngagement, runScript
} from './bot-helpers.js';

if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.error('ERROR: Set TELEGRAM_BOT_TOKEN in .env first');
  console.log('1. Talk to @BotFather on Telegram');
  console.log('2. Create a new bot (/newbot)');
  console.log('3. Copy the token into .env');
  process.exit(1);
}

// Polling mode — no webhook needed for local dev
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const DAILY_HOUR = 10;  // 10 AM

// Track which posts have which chat/message for status updates
let lastSentMessages = [];  // [{chatId, messageId, date, postIndex, pillar}]

console.log(`[${new Date().toISOString()}] Bot started, polling active`);
console.log(`  Daily delivery scheduled: ${DAILY_HOUR}:00 AM`);

// ============================================================
// Commands
// ============================================================

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🤖 LinkedIn Content Bot — Commands

/generate — Research + generate today's posts
/today    — Resend today's posts
/stats    — Log engagement for a pending post
/status   — Show system status (posted/pending)
/skip     — Skip today's scheduled generation
/help     — This message
  `.trim());
});

bot.onText(/\/generate/, async (msg) => {
  bot.sendMessage(msg.chat.id, '🔄 Starting research + post generation...');
  try {
    // Step 1: Fetch research
    await runScript('scripts/fetch-research.js');
    bot.sendMessage(msg.chat.id, '✅ Research fetched');

    // Step 2: Generate posts (via existing workflow)
    // For now, this assumes posts are generated by the CLI user
    // TODO: Wire into Post Generator skill
    const posts = readTodayPosts();
    if (!posts || !posts.posts || posts.posts.length === 0) {
      bot.sendMessage(msg.chat.id, '⚠️ No posts generated yet. Run the Post Generator skill first, then try /generate again.');
      return;
    }

    bot.sendMessage(msg.chat.id, `✅ ${posts.posts.length} posts generated. Sending now...`);
    await deliverPosts(msg.chat.id, todayStr(), posts.posts);
  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    console.error('Generate error:', err);
  }
});

// ============================================================
// Delivery
// ============================================================

async function deliverPosts(chatId, date, posts) {
  lastSentMessages = [];

  // Build message text with separators
  let text = `📝 Morning Brief — ${formatDate(date)}\n\n`;

  posts.forEach((post, i) => {
    text += `POST ${i + 1} — ${post.pillar}`;
    if (post.is_trend_anchored) text += ' (Trend)';
    text += '\n';
    text += '━'.repeat(32) + '\n\n';
    text += post.full_post_text.split('\n').slice(0, 6).join('\n'); // Preview only, ~100 words visible
    if (post.full_post_text.split('\n').length > 6) text += '\n...';
    text += '\n\n' + '━'.repeat(32) + '\n\n';
  });

  // Check pending engagement
  const pending = getPendingEngagement();
  if (pending.length > 0) {
    text += `⚠️ ${pending.length} post${pending.length > 1 ? 's' : ''} missing engagement data\n\n`;
  }

  // Inline keyboard
  const keyboard = {
    inline_keyboard: []
  };

  // Copy buttons
  const copyRow = posts.map((_, i) => ({
    text: `Copy Post ${i + 1}`,
    callback_data: `copy_${date}_${i}`
  }));
  keyboard.inline_keyboard.push(copyRow);

  // Stats button
  if (pending.length > 0) {
    keyboard.inline_keyboard.push([{
      text: '📊 Report Stats',
      callback_data: `stats_flow`
    }]);
  }

  const sent = await bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
    disable_web_page_preview: true
  });

  lastSentMessages.push({ chatId, messageId: sent.message_id, date, posts });

  // Update status to delivered
  for (let i = 0; i < posts.length; i++) {
    updatePostStatus(date, i, 'telegram_status', 'delivered');
  }

  console.log(`  Posts delivered at ${new Date().toISOString()}`);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

// ============================================================
// Callback queries (inline buttons)
// ============================================================

bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (data.startsWith('copy_')) {
    // Extract date and post index
    const parts = data.split('_');
    const date = parts[1];
    const index = parseInt(parts[2]);
    const posts = readPostsForDate(date);

    if (posts && posts.posts[index]) {
      // Send clean text for easy copying
      bot.sendMessage(chatId, posts.posts[index].full_post_text, {
        parse_mode: null  // Plain text — no Telegram formatting
      });
      updatePostStatus(date, index, 'telegram_status', 'reviewed');
    }

    bot.answerCallbackQuery(query.id, { text: `Post ${index + 1} sent for copying` });

  } else if (data === 'stats_flow') {
    bot.answerCallbackQuery(query.id);
    startStatsFlow(chatId);
  }
});
```

- [ ] **Step 2.3: Test bot starts**

```bash
cd "E:\LinkedIn Automation" && node scripts/telegram-bot.js
```

Expected output:
```
[2026-04-07T...] Bot started, polling active
  Daily delivery scheduled: 10:00 AM
```

Press Ctrl+C to stop.

- [ ] **Step 2.4: Commit**

```bash
git add scripts/telegram-bot.js scripts/bot-helpers.js
git commit -m "feat: telegram bot core + help + today commands + delivery"
```

---

### Task 3: Scheduled Delivery at 10 AM

**Files:**
- Modify: `scripts/telegram-bot.js`

- [ ] **Step 3.1: Add cron scheduling to telegram-bot.js**

Add this section after the `/generate` handler in `telegram-bot.js`:

```js
// ============================================================
// Scheduled Daily Delivery
// ============================================================

let skipped = false;

bot.onText(/\/skip/, (msg) => {
  skipped = true;
  bot.sendMessage(msg.chat.id, `⏭️ Today's scheduled delivery skipped. Use /generate when ready.`);
});

bot.onText(/\/today/, async (msg) => {
  const posts = readTodayPosts();
  if (!posts || !posts.posts || posts.posts.length === 0) {
    bot.sendMessage(msg.chat.id, '⚠️ No posts generated for today yet.');
    return;
  }
  await deliverPosts(msg.chat.id, todayStr(), posts.posts);
  bot.answerCallbackQuery; // no-op, just ack
});

// Cron: runs every minute, checks if it's 10 AM
cron.schedule(`${Math.floor(Math.random() * 60)} 10 * * *`, async () => {
  // Jitter the minute to avoid exact :00
  if (skipped) {
    console.log('  Skipped today delivery');
    return;
  }

  const posts = readTodayPosts();
  if (!posts || !posts.posts || posts.posts.length === 0) {
    // Try to generate posts now
    console.log('  No posts found, running generation...');
    try {
      await runScript('scripts/fetch-research.js');
    } catch (err) {
      console.log(`  Research fetch error: ${err.message}`);
    }

    // Wait for posts to appear (user may have generated via CLI)
    // Give it 30 seconds
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const check = readTodayPosts();
      if (check && check.posts && check.posts.length > 0) {
        console.log('  Posts appeared, delivering...');
        // Send to the first callback chat we know about (or all active users)
        // For single-user setup, we store chatId
        const chatId = getChatId();
        if (chatId) {
          await deliverPosts(chatId, todayStr(), check.posts);
        }
        return;
      }
    }

    // Still no posts after 30s — notify
    const chatId = getChatId();
    if (chatId) {
      bot.sendMessage(chatId, '⚠️ No posts found at scheduled time. Use /generate to create them manually, or check if the Post Generator skill was run.');
    }
    return;
  }

  console.log(`  Delivering ${posts.posts.length} posts`);
  const chatId = getChatId();
  if (chatId) {
    await deliverPosts(chatId, todayStr(), posts.posts);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'  // IST
});

// Track the user's chat ID for automated delivery
let userChatId = null;

function getChatId() {
  return userChatId;
}

// Capture first user interaction to know who to send scheduled messages to
bot.on('message', (msg) => {
  if (!userChatId) {
    userChatId = msg.chat.id;
    console.log(`  Registered chat ID: ${userChatId}`);
  }
});

console.log(`  Cron schedule set: daily at 10:00 AM IST`);

// ============================================================
// Stats Entry Flow
// ============================================================

// State machine: which user is in which step
const statsSessions = {};  // chatId -> { date, postIndex, pillar, step: 'likes'|'comments'|'shares', values: {} }

bot.onText(/\/stats/, (msg) => {
  startStatsFlow(msg.chat.id);
});

function startStatsFlow(chatId) {
  const pending = getPendingEngagement();
  if (pending.length === 0) {
    bot.sendMessage(chatId, '✅ All posts have engagement data logged. Nothing pending.');
    return;
  }

  // Start with oldest pending
  const target = pending[0];
  statsSessions[chatId] = {
    date: target.date,
    postIndex: target.postIndex,
    pillar: target.post.pillar,
    step: 'likes',
    values: {}
  };

  askStatQuestion(chatId, 'likes');
}

function askStatQuestion(chatId, statType) {
  const session = statsSessions[chatId];
  if (!session) return;

  const label = statType.charAt(0).toUpperCase() + statType.slice(1);
  const quickButtons = statType === 'likes'
    ? [[1, 3, 5, 10, 20], ['+ Custom']]
    : [[0, 1, 3, 5, 10], ['+ Custom']];

  const keyboard = {
    inline_keyboard: quickButtons.map(row =>
      row.map(btn => ({
        text: String(btn),
        callback_data: `stat_${statType}_${btn}`
      }))
    )
  };

  bot.sendMessage(chatId,
    `📊 Post from ${formatDate(session.date)} (${session.pillar})\n\n**${label}?**`,
    { reply_markup: keyboard }
  );
}

bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  // Existing copy handler
  if (data.startsWith('copy_')) {
    const parts = data.split('_');
    const date = parts[1];
    const index = parseInt(parts[2]);
    const posts = readPostsForDate(date);

    if (posts && posts.posts[index]) {
      bot.sendMessage(chatId, posts.posts[index].full_post_text, {
        parse_mode: null
      });
      updatePostStatus(date, index, 'telegram_status', 'reviewed');
    }
    bot.answerCallbackQuery(query.id, { text: `Post ${index + 1} sent for copying` });

  } else if (data === 'stats_flow') {
    bot.answerCallbackQuery(query.id);
    startStatsFlow(chatId);

  } else if (data.startsWith('stat_')) {
    // Stats flow: user tapped a number button
    const parts = data.split('_');  // ['stat', 'likes', '5']
    const statType = parts[1];
    const value = parts[2];

    const session = statsSessions[chatId];
    if (!session) {
      bot.answerCallbackQuery(query.id, { text: 'No active stats session' });
      return;
    }

    if (value === '+ Custom') {
      bot.answerCallbackQuery(query.id, { text: `Type a number for ${statType}:` });
      session.awaitingCustom = statType;
      bot.answerCallbackQuery(query.id);
      return;
    }

    session.values[statType] = parseInt(value);
    bot.answerCallbackQuery(query.id);

    // Move to next stat
    if (statType === 'likes') {
      session.step = 'comments';
      askStatQuestion(chatId, 'comments');
    } else if (statType === 'comments') {
      session.step = 'shares';
      askStatQuestion(chatId, 'shares');
    } else if (statType === 'shares') {
      // All 3 collected — log it
      session.values.shares = parseInt(value);
      finishStatsEntry(chatId, session);
    }
  }
});

// Handle custom number input for stats
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!userChatId) userChatId = chatId;

  const session = statsSessions[chatId];
  if (session && session.awaitingCustom) {
    const num = parseInt(msg.text);
    if (isNaN(num) || num < 0) {
      bot.sendMessage(chatId, 'Please enter a valid number (0 or more):');
      return;
    }

    const field = session.awaitingCustom;
    session.values[field] = num;
    session.awaitingCustom = null;

    if (field === 'likes') {
      session.step = 'comments';
      askStatQuestion(chatId, 'comments');
    } else if (field === 'comments') {
      session.step = 'shares';
      askStatQuestion(chatId, 'shares');
    } else if (field === 'shares') {
      finishStatsEntry(chatId, session);
    }
  }
});

function finishStatsEntry(chatId, session) {
  const { date, postIndex, values } = session;
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  // Append to posts-db.jsonl
  const posts = readPostsForDate(date);
  if (!posts) return;

  const post = posts.posts[postIndex];
  const entry = {
    post_id: `post-${postIndex + 1}`,
    date,
    day_of_week: dayOfWeek,
    time_posted: '10:00',
    pillar: post.pillar,
    hook_type: inferHookType(post.hook || ''),
    word_count: post.word_count || 0,
    hashtags: post.hashtags || [],
    topic_category: post.topic_category || 'unknown',
    is_trend_anchored: post.is_trend_anchored || false,
    topic_source: post.topic_source || '',
    has_image: !!post.image_url,
    likes: values.likes || 0,
    comments: values.comments || 0,
    shares: values.shares || 0,
    scraped_at: '24h',
    engagement_score: (values.likes || 0) + (values.comments || 0) + ((values.shares || 0) * 2)
  };

  // Read existing db, remove stale entry for this date+post if exists, append new
  const POSTS_DB = path.join(ROOT, 'data', 'engagement', 'posts-db.jsonl');
  let lines = [];
  if (fs.existsSync(POSTS_DB)) {
    lines = fs.readFileSync(POSTS_DB, 'utf-8').trim().split('\n').filter(l => {
      if (!l) return false;
      const parsed = JSON.parse(l);
      // Remove old entry for this exact date and post_id
      return !(parsed.date === date && parsed.post_id === entry.post_id);
    });
  }
  lines.push(JSON.stringify(entry));
  fs.writeFileSync(POSTS_DB, lines.join('\n') + '\n');

  updatePostStatus(date, postIndex, 'telegram_status', 'engaged');
  delete statsSessions[chatId];

  bot.sendMessage(chatId,
    `✅ Logged: ${entry.likes} likes, ${entry.comments} comments, ${entry.shares} shares\n` +
    `Engagement score: ${entry.engagement_score}\n\n` +
    `System will calibrate tomorrow's output.`
  );

  // Check if more pending
  const stillPending = getPendingEngagement();
  if (stillPending.length > 0) {
    bot.sendMessage(chatId,
      `📋 ${stillPending.length} more post${stillPending.length > 1 ? 's' : ''} pending. Tap /stats or Report Stats to continue.`
    );
  }
}

function inferHookType(hookText) {
  if (!hookText) return 'unknown';
  const lower = hookText.toLowerCase();
  if (lower.includes("nobody") || lower.includes("everyone") || lower.includes("everyone's") || lower.includes("tells you")) return 'contrarian';
  if (lower.includes("i ") || lower.includes("my ") || lower.includes("we ")) return 'personal_story';
  if (lower.endsWith('?')) return 'question';
  return 'bold_statement';
}

// ============================================================
// /status Command
// ============================================================

bot.onText(/\/status/, (msg) => {
  const today = todayStr();
  const posts = readTodayPosts();
  const pending = getPendingEngagement();

  let text = `📊 System Status — ${formatDate(today)}\n\n`;

  if (posts && posts.posts) {
    text += `Today's posts: ${posts.posts.length}\n`;
    for (let i = 0; i < posts.posts.length; i++) {
      const p = posts.posts[i];
      const status = p.telegram_status || 'pending';
      text += `  POST ${i + 1} (${p.pillar}): ${status}\n`;
    }
  } else {
    text += `Today's posts: Not generated yet\n`;
  }

  text += `\nPending engagement: ${pending.length} post${pending.length > 1 ? 's' : ''}`;

  bot.sendMessage(msg.chat.id, text);
});

console.log('Bot commands registered. Waiting for messages...');
```

- [ ] **Step 4.2: Verify stats flow logic**

Check that `finishStatsEntry` correctly writes to `posts-db.jsonl`:
```bash
cd "E:\LinkedIn Automation" && node -e "
const fs = require('fs');
const db = 'data/engagement/posts-db.jsonl';
if (fs.existsSync(db)) {
  console.log('Current entries:', fs.readFileSync(db, 'utf-8').trim().split('\\n').filter(l => l).length);
} else {
  console.log('No entries yet (first time)');
}
"
```

Expected: `Current entries: 0` or some number if entries exist

- [ ] **Step 4.3: Commit**

```bash
git add scripts/telegram-bot.js scripts/bot-helpers.js
git commit -m "feat: add stats entry flow with inline buttons + /status command"
```

---

### Task 5: Documentation Updates

**Files:**
- Modify: `DAILY-WORKFLOW.md`
- Modify: `skills/04-content-scheduler.md`
- Modify: `HANDOVER.md`

- [ ] **Step 5.1: Update DAILY-WORKFLOW.md**

Replace "Step 4: Format for Google Sheets" (line 72) with:

```markdown
### Step 3: Download Images (optional, 2 min)

> **Note:** Image quality from Pollinations is hit-or-miss. Consider skipping for now.

### Step 4: Receive Posts via Telegram (automatic)

The Telegram bot delivers both posts automatically at 10:00 AM:

1. Bot sends the Morning Brief with both posts
2. Click [Copy Post 1] or [Copy Post 2] to get clean text for copy-pasting
3. Click [Report Stats] if you have engagement data from yesterday

### Step 5: Post to LinkedIn (2 min per post, anytime today)

1. Open Telegram on your phone, find the Morning Brief
2. Tap [Copy] on the post you want
3. Open LinkedIn → Create Post
4. Paste text + upload image from `data/media/` (if generated)
5. Post!
6. The bot marks the post as reviewed

### Step 6: Enter Engagement (when post is 24h old, 2 min)

1. Check your post's likes/comments/shares on LinkedIn
2. Tap [Report Stats] in Telegram or send `/stats`
3. Quick-tap numbers: Likes → Comments → Shares
4. System auto-calibrates — next posts will learn from the data

> **Timing rule:** Enter engagement exactly 24 hours after posting for fair comparison.
```

Also update the "Scripts" table to add:
```
| `scripts/telegram-bot.js` | Telegram bot — delivers posts, receives stats, orchestrates daily flow |
```

- [ ] **Step 5.2: Update skills/04-content-scheduler.md**

Replace "Step 3: Format for Google Sheets" and "Step 6: Output Summary" sections with:

```markdown
### Step 3: Format for Telegram Delivery

The Telegram bot reads this file and delivers posts automatically. No manual formatting needed.

Output each post with status tracking:
... [keep existing Step 4 content about updating status] ...
```

Keep the rest of the skill (engagement placeholder, pillar rotation, pending flags) — it all still works.

- [ ] **Step 5.3: Update HANDOVER.md**

Change row #6 in the weaknesses table (line 191):
```
| 6 | **No Google Sheets integration** | ✅ FIXED | Telegram bot delivers posts directly to phone. Inline buttons for copy/stats. Zero manual formatting needed. |
```

Change "What Needs Work" section (line 298-301):
Remove "Google Sheets API integration" from the list.

Add to "Key Decisions Made" table:
```
| Telegram bot for delivery + stats | Replace Sheets with push notifications. Zero ToS risk, natural for phone review |
```

- [ ] **Step 5.4: Commit all documentation changes**

```bash
git add DAILY-WORKFLOW.md skills/04-content-scheduler.md HANDOVER.md
git commit -m "docs: update workflow for Telegram delivery, remove Sheets references"
```

---

### Task 6: Final Verification + BotFather Setup Guide

**Files:**
- None (manual steps)

- [ ] **Step 6.1: Write BotFather setup instructions**

The user must:
1. Open Telegram, search `@BotFather`
2. Send `/newbot`
3. Choose a name: `LinkedIn Content Bot` (or anything)
4. Choose a username: must end in `bot` (e.g., `umar_linkedin_bot`)
5. Copy the token (looks like `123456789:ABCdef...`)
6. Paste into `.env`: `TELEGRAM_BOT_TOKEN=your_token_here`
7. Start the bot: `node scripts/telegram-bot.js`
8. Send `/start` or `/help` to the new bot on Telegram

- [ ] **Step 6.2: Set up Windows Task Scheduler**

1. Open Task Scheduler → Create Basic Task → "LinkedIn Content Bot"
2. Trigger: Daily at 9:50 AM
3. Action: Start a program
   - Program: `node`
   - Arguments: `"E:\LinkedIn Automation\scripts\telegram-bot.js"`
   - Start in: `"E:\LinkedIn Automation"`
4. Check "Stop the task if it runs longer than" → 23 hours
5. Check "If already running, stop existing instance"
6. Save

- [ ] **Step 6.3: Full end-to-end test**

```bash
cd "E:\LinkedIn Automation"
node scripts/telegram-bot.js
```

Then on Telegram:
1. Send `/help` → should show commands
2. Ensure `data/posts/today-posts.json` exists (or generate posts first)
3. Send `/today` → should deliver posts
4. Tap [Copy Post 1] → should send clean text
5. Send `/status` → should show system status
6. Send `/stats` → should start stats flow if pending

- [ ] **Step 6.4: Final commit**

```bash
git status
git commit -am "feat: telegram bot complete — delivery, stats, docs"
```

---

## Success Criteria

- [ ] Bot starts without errors on `node scripts/telegram-bot.js`
- [ ] `/help` returns all 6 commands
- [ ] Scheduled cron delivers at 10 AM IST
- [ ] `/today` resends today's posts
- [ ] [Copy Post N] sends clean text for easy copy-paste
- [ ] `/stats` opens quick-tap flow (1, 3, 5, 10, 20, + Custom)
- [ ] Stats entry writes to `posts-db.jsonl` correctly
- [ ] `/status` shows pending engagement count
- [ ] `.env` is in `.gitignore`

## Known Limitations

1. **Post generation** — The bot reads posts from `data/posts/YYYY-MM-DD-posts.json`. It does NOT run the Post Generator skill directly. The user generates posts via CLI/skills, and the bot picks them up. In a future iteration, the bot could trigger post generation directly.
2. **Windows must be on** — Scheduled delivery requires the PC to be running at 10 AM IST.
3. **No image sending** — Images are not sent via Telegram. The user copies text, reviews, and posts manually on LinkedIn with images from `data/media/`.
```