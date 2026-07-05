import { generateIdeas } from './ideas.js';
import { loadJson, saveJson, todayStr, addDays } from './util.js';

const QUEUE_PATH = 'content/queue.json';

export function loadQueue() {
  return loadJson(QUEUE_PATH, { items: [] });
}

export function saveQueue(queue) {
  saveJson(QUEUE_PATH, queue);
}

/**
 * Build (or extend) the posting queue: one headline idea per day,
 * following the weekly rotation in butterfly.config.json.
 */
export function buildPlan(config, { days = 7, start = todayStr() } = {}) {
  const queue = loadQueue();
  const existingIds = new Set(queue.items.map((it) => it.id));
  const added = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const [headline] = generateIdeas(config, date, 1);
    if (existingIds.has(headline.id)) continue;
    const item = {
      id: headline.id,
      date,
      pillar: headline.pillar,
      pillarLabel: headline.pillarLabel,
      hook: headline.hook,
      platforms: headline.platforms,
      status: 'todo',
      idea: headline,
    };
    queue.items.push(item);
    added.push(item);
  }

  queue.items.sort((a, b) => a.date.localeCompare(b.date));
  saveQueue(queue);
  return { queue, added };
}

export function itemsForDate(queue, date) {
  return queue.items.filter((it) => it.date === date);
}

export function markDone(id) {
  const queue = loadQueue();
  const item = queue.items.find((it) => it.id === id || it.id.startsWith(id));
  if (!item) return null;
  item.status = 'done';
  item.postedAt = new Date().toISOString();
  saveQueue(queue);
  return item;
}

/** Consecutive days ending today (or yesterday) with at least one done item. */
export function streak(queue, today = todayStr()) {
  const doneDates = new Set(queue.items.filter((it) => it.status === 'done').map((it) => it.date));
  let count = 0;
  let cursor = doneDates.has(today) ? today : addDays(today, -1);
  while (doneDates.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function renderPlan(queue, { added = null } = {}) {
  const lines = [''];
  if (added) {
    lines.push(`🗓  added ${added.length} day(s) to the queue`);
  }
  lines.push('🦋 posting queue');
  lines.push('═'.repeat(56));
  if (!queue.items.length) {
    lines.push('  (empty — run `npm run plan` to fill a week)');
  }
  for (const it of queue.items) {
    const mark = it.status === 'done' ? '✅' : '⬜';
    lines.push(`${mark} ${it.date} · ${it.pillarLabel}`);
    lines.push(`     ${it.hook}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function renderDue(config, queue, date) {
  const items = itemsForDate(queue, date);
  const lines = [''];
  lines.push(`🦋 due today (${date}) — streak: ${streak(queue, date)} day(s) 🔥`);
  lines.push('═'.repeat(56));
  if (!items.length) {
    lines.push('  nothing queued for today — run `npm run plan`');
    lines.push('  or grab a fresh idea with `npm run today`');
  }
  for (const it of items) {
    const mark = it.status === 'done' ? '✅ posted' : '⬜ todo  ';
    lines.push('');
    lines.push(`${mark} ${it.pillarLabel}  (id: ${it.id})`);
    lines.push(`   ${it.hook}`);
    lines.push(`   platforms: ${it.platforms.join(', ')}`);
    lines.push(`   asset: ${it.idea.asset}`);
    lines.push('');
    lines.push('   👉 `npm run pack` writes captions + share links to a folder');
    lines.push(`   👉 when posted: \`node bin/butterfly.js done ${it.id}\``);
  }
  lines.push('');
  return lines.join('\n');
}
