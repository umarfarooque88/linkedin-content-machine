// scripts/bot-helpers.js — Pure utility functions for the Telegram bot
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
export const POSTS_DIR = path.join(ROOT, 'data', 'posts');
export const ENGAGEMENT_DIR = path.join(ROOT, 'data', 'engagement');
export const POSTS_DB = path.join(ENGAGEMENT_DIR, 'posts-db.jsonl');

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
  const posts = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('-posts.json'));
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pending = [];

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