import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, loadConfig, todayStr, addDays } from './util.js';
import { generateIdeas } from './ideas.js';
import { loadQueue, saveQueue, buildPlan, markDone, streak } from './plan.js';
import { buildPack, shareLinks } from './pack.js';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function listCaptures(config) {
  const dir = path.join(ROOT, config.capture?.outDir ?? 'content/captures');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpg|webm|mp4)$/i.test(f))
    .map((f) => {
      const st = fs.statSync(path.join(dir, f));
      return { name: f, size: st.size, mtime: st.mtimeMs, video: /\.(webm|mp4)$/i.test(f) };
    })
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 24);
}

function weekStart(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const back = (d.getDay() + 6) % 7;
  return addDays(dateStr, -back);
}

function stats(queue, today) {
  const done = queue.items.filter((it) => it.status === 'done');
  const byPlatform = {};
  for (const it of done) {
    for (const p of it.platforms) {
      byPlatform[p] ??= { posts: 0, views: 0 };
      byPlatform[p].posts++;
    }
    for (const [p, r] of Object.entries(it.results ?? {})) {
      byPlatform[p] ??= { posts: 0, views: 0 };
      byPlatform[p].views += Number(r.views) || 0;
    }
  }
  const monday = weekStart(today);
  return {
    streak: streak(queue, today),
    totalPosted: done.length,
    postedThisWeek: done.filter((it) => it.date >= monday).length,
    byPlatform,
    recentDone: done.slice(-5).reverse(),
  };
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const config = loadConfig();
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'content-type': MIME['.html'] });
        res.end(fs.readFileSync(path.join(ROOT, 'app/index.html')));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/state') {
        const date = url.searchParams.get('date') ?? todayStr();
        const queue = loadQueue();
        const ideas = generateIdeas(config, date, 4);
        json(res, 200, {
          config: { site: config.site, socials: config.socials },
          date,
          ideas: ideas.map((i) => ({ ...i, links: shareLinks(config, i) })),
          queue: queue.items,
          captures: listCaptures(config),
          stats: stats(queue, todayStr()),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/plan') {
        const { days = 7 } = await readBody(req);
        buildPlan(config, { days: Number(days) });
        json(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/done') {
        const { id, undo } = await readBody(req);
        if (undo) {
          const queue = loadQueue();
          const item = queue.items.find((it) => it.id === id);
          if (item) {
            item.status = 'todo';
            delete item.postedAt;
            saveQueue(queue);
          }
          json(res, 200, { ok: Boolean(item) });
          return;
        }
        json(res, 200, { ok: Boolean(markDone(id)) });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/results') {
        const { id, platform, views } = await readBody(req);
        const queue = loadQueue();
        const item = queue.items.find((it) => it.id === id);
        if (!item) return json(res, 404, { error: 'item not found' });
        item.results ??= {};
        item.results[platform] = { views: Number(views) || 0, at: new Date().toISOString() };
        saveQueue(queue);
        json(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/pack') {
        const { dir } = buildPack(config);
        json(res, 200, { ok: true, dir: path.relative(ROOT, dir) });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/capture') {
        const body = await readBody(req);
        const { capture } = await import('./capture.js');
        let target = body.url || config.site.url;
        if (target === 'demo') {
          target = new URL('file://' + path.join(ROOT, 'demo/index.html')).href;
        }
        const saved = await capture({
          url: target,
          preset: body.preset || 'vertical',
          shots: Number(body.shots ?? 2),
          record: Number(body.record ?? 0),
          scroll: Boolean(body.scroll),
          wait: Number(body.wait ?? 3),
          outDir: config.capture?.outDir,
        });
        json(res, 200, { ok: true, files: saved.map((f) => path.basename(f)) });
        return;
      }

      if (req.method === 'GET' && url.pathname.startsWith('/media/captures/')) {
        const name = path.basename(decodeURIComponent(url.pathname));
        const file = path.join(ROOT, loadConfig().capture?.outDir ?? 'content/captures', name);
        if (!fs.existsSync(file)) return json(res, 404, { error: 'not found' });
        res.writeHead(200, { 'content-type': MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
        return;
      }

      json(res, 404, { error: 'not found' });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
  });
}

export function startApp({ port = Number(process.env.PORT) || 4646, open = true } = {}) {
  const server = createServer();
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('');
    console.log(`🦋 social-butterfly dashboard → ${url}`);
    console.log('   (keep this window open; Ctrl+C to stop)');
    if (open) {
      const cmd =
        process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      try {
        spawn(cmd, [url], { shell: process.platform === 'win32', stdio: 'ignore', detached: true }).unref();
      } catch {
        /* no browser available — the printed URL is enough */
      }
    }
  });
  return server;
}
