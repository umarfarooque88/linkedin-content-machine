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
import fs from 'fs';
import path from 'path';
import {
  todayStr, readTodayPosts, readPostsForDate, updatePostStatus,
  getPendingEngagement, runScript, POSTS_DB
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
let userChatId = null;
let skipped = false;
const statsSessions = {};  // chatId -> session state

console.log(`[${new Date().toISOString()}] Bot started, polling active`);
console.log(`  Daily delivery scheduled: ${DAILY_HOUR}:00 AM IST`);

// ============================================================
// Commands
// ============================================================

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🤖 LinkedIn Content Bot — Commands

/generate — Research + generate today's posts
/today    — Resend today's posts
/stats    — Log engagement for a pending post
/status   — Show system status (posted/pending)
/skip     — Skip today's scheduled generation
/actions  — Show suggested actions
/help     — This message`.trim());
});

bot.onText(/\/actions/, async (msg) => {
  const chatId = msg.chat.id;
  const posts = readTodayPosts();
  const pending = getPendingEngagement();

  let text = `📋 Suggested Actions\n\n`;
  const keyboard = { inline_keyboard: [] };

  // Primary action based on state
  if (!posts || !posts.posts || posts.posts.length === 0) {
    text += `No posts generated for today yet.\n`;
    keyboard.inline_keyboard.push([{ text: '🔬 Generate Posts', callback_data: 'action_generate' }]);
  } else if (posts.posts.some(p => p.telegram_status === 'delivered')) {
    text += `Today's posts have been delivered.\n`;
    // Add copy buttons for each delivered post
    const copyRow = posts.posts.map((_, i) => ({
      text: `📋 Copy Post ${i + 1}`,
      callback_data: `copy_${todayStr()}_${i}`
    }));
    keyboard.inline_keyboard.push(copyRow);
    text += `\nTap to copy text for LinkedIn.`;
  } else {
    text += `Posts are ready but not delivered yet.\n`;
    keyboard.inline_keyboard.push([{ text: '📨 Deliver Posts Now', callback_data: 'action_deliver' }]);
  }

  // Stats action if pending
  if (pending.length > 0) {
    text += `\n⚠️ ${pending.length} post${pending.length > 1 ? 's' : ''} need engagement stats.\n`;
    keyboard.inline_keyboard.push([{ text: '📊 Report Stats', callback_data: 'stats_flow' }]);
  }

  // Secondary actions
  const secondary = [];
  secondary.push({ text: '📊 System Status', callback_data: 'action_status' });
  if (pending.length === 0 && posts && posts.posts) {
    secondary.push({ text: '⏭️ Skip Today', callback_data: 'action_skip' });
  }
  if (secondary.length > 0) {
    keyboard.inline_keyboard.push(secondary);
  }

  keyboard.inline_keyboard.push([{ text: '❓ Help', callback_data: 'action_help' }]);

  await bot.sendMessage(chatId, text, { reply_markup: keyboard });
});

bot.onText(/\/generate/, async (msg) => {
  bot.sendMessage(msg.chat.id, '🔄 Starting research + post generation...');
  try {
    await runScript('scripts/fetch-research.js');
    bot.sendMessage(msg.chat.id, '✅ Research fetched. Waiting for posts to appear...');

    // Poll for posts to appear (user may generate via CLI while bot waits)
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const posts = readTodayPosts();
      if (posts && posts.posts && posts.posts.length > 0) {
        bot.sendMessage(msg.chat.id, `✅ ${posts.posts.length} posts generated. Sending now...`);
        await deliverPosts(msg.chat.id, todayStr(), posts.posts);
        return;
      }
    }

    bot.sendMessage(msg.chat.id, '⚠️ No posts appeared after 60s. Run the Post Generator skill, then try /generate again.');
  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    console.error('Generate error:', err);
  }
});

bot.onText(/\/skip/, (msg) => {
  skipped = true;
  bot.sendMessage(msg.chat.id, "⏭️ Today's scheduled delivery skipped. Use /generate when ready.");
});

bot.onText(/\/today/, async (msg) => {
  const posts = readTodayPosts();
  if (!posts || !posts.posts || posts.posts.length === 0) {
    bot.sendMessage(msg.chat.id, '⚠️ No posts generated for today yet.');
    return;
  }
  await deliverPosts(msg.chat.id, todayStr(), posts.posts);
});

bot.onText(/\/status/, (msg) => {
  const today = todayStr();
  const posts = readTodayPosts();
  const pending = getPendingEngagement();

  let text = `📊 System Status — ${formatDate(today)}\n\n`;

  if (posts && posts.posts) {
    text += `Today\'s posts: ${posts.posts.length}\n`;
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

bot.onText(/\/stats/, (msg) => {
  startStatsFlow(msg.chat.id);
});

// ============================================================
// Capture chat ID from first interaction
// ============================================================

bot.on('message', (msg) => {
  if (!userChatId) {
    userChatId = msg.chat.id;
    console.log(`  Registered chat ID: ${userChatId}`);
  }
  handleStatsCustomInput(msg);
});

// ============================================================
// Delivery
// ============================================================

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

async function deliverPosts(chatId, date, posts) {
  // Build message text
  let text = `📝 Morning Brief — ${formatDate(date)}\n\n`;

  posts.forEach((post, i) => {
    text += `POST ${i + 1} — ${post.pillar}`;
    if (post.is_trend_anchored) text += ' (Trend)';
    text += '\n';
    text += '━'.repeat(32) + '\n\n';
    text += post.full_post_text;
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

  // Copy buttons for each post
  const copyRow = posts.map((_, i) => ({
    text: `📋 Copy Post ${i + 1}`,
    callback_data: `copy_${date}_${i}`
  }));
  keyboard.inline_keyboard.push(copyRow);

  // Stats button if pending
  if (pending.length > 0) {
    keyboard.inline_keyboard.push([{
      text: '📊 Report Stats',
      callback_data: 'stats_flow'
    }]);
  }

  const sent = await bot.sendMessage(chatId, text, {
    parse_mode: null,
    reply_markup: keyboard,
    disable_web_page_preview: true
  });

  // Update status to delivered
  for (let i = 0; i < posts.length; i++) {
    updatePostStatus(date, i, 'telegram_status', 'delivered');
  }

  console.log(`  Posts delivered at ${new Date().toISOString()}`);
}

// ============================================================
// Callback queries (inline buttons)
// ============================================================

bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

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
    handleStatsButton(query, data, chatId);
  } else if (data === 'action_generate') {
    bot.answerCallbackQuery(query.id);
    // Trigger generate command programmatically
    bot.sendMessage(chatId, '🔄 Starting research + post generation...');
    // We'll call the same logic as /generate by executing the command
    // Since we can't directly call the handler, we re-run the script
    bot.sendMessage(chatId, 'Please run /generate manually or the scheduled delivery will handle it.');
    // For now, just guide user

  } else if (data === 'action_deliver') {
    bot.answerCallbackQuery(query.id);
    const posts = readTodayPosts();
    if (posts && posts.posts) {
      deliverPosts(chatId, todayStr(), posts.posts);
    } else {
      bot.sendMessage(chatId, '⚠️ No posts found. Generate them first with /generate.');
    }

  } else if (data === 'action_status') {
    bot.answerCallbackQuery(query.id);
    // Reuse /status logic inline
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
    bot.sendMessage(chatId, text);

  } else if (data === 'action_skip') {
    bot.answerCallbackQuery(query.id);
    skipped = true;
    bot.sendMessage(chatId, "⏭️ Today's scheduled delivery skipped. Use /generate when ready.");

  } else if (data === 'action_help') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId,
`🤖 Commands:

/generate — Research + generate today's posts
/today    — Resend today's posts
/stats    — Log engagement
/status   — System status
/skip     — Skip today
/actions  — This menu
/help     — Full help`.trim());
  }
});

// ============================================================
// Stats Entry Flow
// ============================================================

function startStatsFlow(chatId) {
  const pending = getPendingEngagement();
  if (pending.length === 0) {
    bot.sendMessage(chatId, '✅ All posts have engagement data logged. Nothing pending.');
    return;
  }

  const target = pending[0];
  statsSessions[chatId] = {
    date: target.date,
    postIndex: target.postIndex,
    pillar: target.post.pillar,
    values: {},
    awaitingCustom: null
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
    `📊 Post from ${formatDate(session.date)} (${session.pillar})\n\n${label}?`,
    { reply_markup: keyboard }
  );
}

function handleStatsButton(query, data, chatId) {
  const parts = data.split('_');  // ['stat', 'likes', '5']
  const statType = parts[1];
  const value = parts[2];

  const session = statsSessions[chatId];
  if (!session) {
    bot.answerCallbackQuery(query.id, { text: 'No active stats session' });
    return;
  }

  if (value === '+ Custom') {
    session.awaitingCustom = statType;
    bot.answerCallbackQuery(query.id, { text: `Type a number for ${statType}:` });
    return;
  }

  session.values[statType] = parseInt(value);
  bot.answerCallbackQuery(query.id);

  if (statType === 'likes') {
    askStatQuestion(chatId, 'comments');
  } else if (statType === 'comments') {
    askStatQuestion(chatId, 'shares');
  } else if (statType === 'shares') {
    session.values.shares = parseInt(value);
    finishStatsEntry(chatId, session);
  }
}

function handleStatsCustomInput(msg) {
  const chatId = msg.chat.id;
  const session = statsSessions[chatId];
  if (!session || !session.awaitingCustom) return;

  const num = parseInt(msg.text);
  if (isNaN(num) || num < 0) {
    bot.sendMessage(chatId, 'Please enter a valid number (0 or more):');
    return;
  }

  const field = session.awaitingCustom;
  session.values[field] = num;
  session.awaitingCustom = null;

  if (field === 'likes') {
    askStatQuestion(chatId, 'comments');
  } else if (field === 'comments') {
    askStatQuestion(chatId, 'shares');
  } else if (field === 'shares') {
    finishStatsEntry(chatId, session);
  }
}

function finishStatsEntry(chatId, session) {
  const { date, postIndex, values } = session;
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
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

  // Read existing db, remove duplicate for this date+post, append new
  let lines = [];
  if (fs.existsSync(POSTS_DB)) {
    lines = fs.readFileSync(POSTS_DB, 'utf-8').trim().split('\n').filter(l => {
      if (!l) return false;
      const parsed = JSON.parse(l);
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

  const stillPending = getPendingEngagement();
  if (stillPending.length > 0) {
    // Auto-advance to next pending post
    setTimeout(() => startStatsFlow(chatId), 1000);
  } else {
    bot.sendMessage(chatId,
      `✅ All stats entered! System now has data for calibration.`
    );
  }
}

function inferHookType(hookText) {
  if (!hookText) return 'unknown';
  const lower = hookText.toLowerCase();
  if (lower.includes('nobody') || lower.includes('everyone') || lower.includes("everyone's") || lower.includes('tells you')) return 'contrarian';
  if (lower.includes('i ') || lower.includes('my ') || lower.includes('we ')) return 'personal_story';
  if (lower.endsWith('?')) return 'question';
  return 'bold_statement';
}

// ============================================================
// Scheduled Daily Delivery — 10:00 AM IST
// ============================================================

cron.schedule(`30 ${DAILY_HOUR} * * *`, async () => {
  // Runs at 10:30 AM IST daily
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
        const chatId = userChatId;
        if (chatId) {
          await deliverPosts(chatId, todayStr(), check.posts);
        }
        return;
      }
    }

    // Still no posts after 30s — notify
    const chatId = userChatId;
    if (chatId) {
      bot.sendMessage(chatId, '⚠️ No posts found at scheduled time. Use /generate to create them manually, or check if the Post Generator skill was run.');
    }
    return;
  }

  console.log(`  Delivering ${posts.posts.length} posts`);
  const chatId = userChatId;
  if (chatId) {
    await deliverPosts(chatId, todayStr(), posts.posts);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'  // IST
});

console.log('  Cron schedule set: daily at 10:30 AM IST');
console.log('Bot commands registered. Waiting for messages...');