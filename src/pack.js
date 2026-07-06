import fs from 'node:fs';
import path from 'node:path';
import { generateIdeas } from './ideas.js';
import { loadQueue, itemsForDate } from './plan.js';
import { ROOT, todayStr } from './util.js';

const enc = encodeURIComponent;

/**
 * Official share endpoints — these open a prefilled compose window and the
 * HUMAN presses Post. Zero ToS risk on any platform.
 */
export function shareLinks(config, idea) {
  const url = config.site.url;
  const short = config.site.shortUrl ?? url;
  const hasLink = (t) => t.includes(url) || t.includes(short);
  // utm tags let Cloudflare/GA4 attribute visitors to the exact platform.
  // Applied only where the URL is a link target (not visible post text).
  const tagged = (platform) =>
    config.tracking?.utm === false ? url : `${url}?utm_source=${platform}&utm_medium=social`;
  const x = idea.captions.x?.text ?? idea.hook;
  const bsky = idea.captions.bluesky?.text ?? idea.hook;
  const reddit = idea.captions.reddit;
  return {
    x: `https://x.com/intent/post?text=${enc(hasLink(x) ? x : `${x}\n${url}`)}`,
    bluesky: `https://bsky.app/intent/compose?text=${enc(hasLink(bsky) ? bsky : `${bsky}\n${url}`)}`,
    threads: `https://www.threads.net/intent/post?text=${enc(`${idea.hook}\n${url}`)}`,
    reddit: `https://www.reddit.com/submit?url=${enc(tagged('reddit'))}&title=${enc(reddit.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(tagged('facebook'))}&quote=${enc(idea.hook)}`,
    telegram: `https://t.me/share/url?url=${enc(tagged('telegram'))}&text=${enc(idea.hook)}`,
    whatsapp: `https://wa.me/?text=${enc(`${idea.hook}\n${url}`)}`,
    pinterest: `https://www.pinterest.com/pin/create/button/?url=${enc(tagged('pinterest'))}&description=${enc(idea.hook)}`,
  };
}

/**
 * Write a "post pack": one folder per day containing every caption as a
 * text file, share links, and the latest captured media. Posting becomes
 * a 30-second copy/paste per platform.
 */
export function buildPack(config, date = todayStr()) {
  const queue = loadQueue();
  let items = itemsForDate(queue, date).map((it) => it.idea);
  if (!items.length) items = generateIdeas(config, date, 1); // no queue? improvise

  const dir = path.join(ROOT, 'content', 'packs', date);
  fs.mkdirSync(dir, { recursive: true });

  const written = [];
  for (const idea of items) {
    const prefix = items.length > 1 ? `${idea.pillar}-` : '';
    for (const [platform, cap] of Object.entries(idea.captions)) {
      let out = '';
      if (platform === 'reddit') {
        out = `TITLE:\n${cap.title}\n\nBODY:\n${cap.body}\n\nSUGGESTED SUBS: ${cap.communities.join(', ')}\n\nNOTE: ${cap.note}\n`;
      } else if (cap.title !== undefined) {
        out = `TITLE:\n${cap.title}\n\nDESCRIPTION:\n${cap.description}\n`;
      } else {
        out = cap.text + '\n';
      }
      const file = path.join(dir, `${prefix}${platform}.txt`);
      fs.writeFileSync(file, out);
      written.push(file);
    }

    const links = shareLinks(config, idea);
    const linksMd = [
      `# One-click share links — ${date}`,
      '',
      `**${idea.hook}**`,
      '',
      'These open an official compose window with everything prefilled — you press Post.',
      'TikTok / Instagram / YouTube have no prefill links: upload the media there and paste from the caption files.',
      '',
      ...Object.entries(links).map(([k, v]) => `- [${k}](${v})`),
      '',
      `Asset plan: ${idea.asset}`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(dir, `${prefix}links.md`), linksMd);
    written.push(path.join(dir, `${prefix}links.md`));
  }

  // Pull in the freshest captures so everything for today sits in one folder.
  const capDir = path.join(ROOT, config.capture?.outDir ?? 'content/captures');
  if (fs.existsSync(capDir)) {
    const media = fs
      .readdirSync(capDir)
      .filter((f) => /\.(png|jpg|webm|mp4)$/i.test(f))
      .map((f) => ({ f, t: fs.statSync(path.join(capDir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)
      .slice(0, 4);
    if (media.length) {
      const mediaDir = path.join(dir, 'media');
      fs.mkdirSync(mediaDir, { recursive: true });
      for (const { f } of media) {
        fs.copyFileSync(path.join(capDir, f), path.join(mediaDir, f));
        written.push(path.join(mediaDir, f));
      }
    }
  }

  return { dir, written, items };
}

export function exportCsv(config) {
  const queue = loadQueue();
  const rows = [['date', 'status', 'pillar', 'platform', 'caption']];
  for (const it of queue.items) {
    for (const platform of it.platforms) {
      const cap = it.idea.captions[platform];
      const text = cap?.text ?? (cap?.title ? `${cap.title} — ${cap.description ?? cap.body ?? ''}` : '');
      rows.push([it.date, it.status, it.pillar, platform, text]);
    }
  }
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""').replaceAll('\n', ' ')}"`).join(','))
    .join('\n');
  const out = path.join(ROOT, 'content', 'queue-export.csv');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, csv + '\n');
  return out;
}
