import fs from 'node:fs';
import path from 'node:path';
import { ROOT, timestampSlug } from './util.js';

// Social-ready viewport presets.
export const PRESETS = {
  vertical: { width: 1080, height: 1920 }, // TikTok / Reels / Shorts (9:16)
  wide: { width: 1920, height: 1080 },     // YouTube / X / screenshots (16:9)
  square: { width: 1080, height: 1080 },   // Instagram feed (1:1)
};

async function launchChromium() {
  const { chromium } = await import('playwright');
  try {
    return await chromium.launch();
  } catch (err) {
    // Managed environments (e.g. Claude Code cloud) pre-install Chromium at a
    // fixed path that may not match this playwright version's expected build.
    const fallback = process.env.BUTTERFLY_CHROMIUM || '/opt/pw-browsers/chromium';
    if (fs.existsSync(fallback)) {
      return await chromium.launch({ executablePath: fallback });
    }
    throw err;
  }
}

/**
 * Load the site, optionally auto-scroll, and capture screenshots + video.
 * This automates YOUR browser looking at YOUR site — no platform ToS in play.
 */
export async function capture({
  url,
  preset = 'vertical',
  shots = 3,
  every = 2,
  record = 0,
  scroll = false,
  scrollSpeed = 120,
  wait = 3,
  fullPage = false,
  outDir,
} = {}) {
  const size = PRESETS[preset] ?? PRESETS.vertical;
  const dir = path.resolve(ROOT, outDir ?? 'content/captures');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = timestampSlug();
  const base = `capture-${stamp}-${preset}`;
  const saved = [];

  const browser = await launchChromium();
  const context = await browser.newContext({
    viewport: size,
    ...(record > 0 ? { recordVideo: { dir, size } } : {}),
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  console.log(`→ loading ${url} at ${size.width}x${size.height} (${preset})`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(wait * 1000);

  if (scroll) {
    // Fire-and-forget smooth scroll to the bottom and back, looping.
    await page.evaluate((pxPerSec) => {
      const step = pxPerSec / 20;
      let dir = 1;
      setInterval(() => {
        window.scrollBy(0, step * dir);
        const bottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 2;
        if (bottom) dir = -1;
        if (window.scrollY <= 0) dir = 1;
      }, 50);
    }, scrollSpeed);
  }

  const totalMs = Math.max(shots * every, record) * 1000;
  const start = Date.now();
  let shotCount = 0;

  while (Date.now() - start < totalMs || shotCount < shots) {
    if (shotCount < shots) {
      const file = path.join(dir, `${base}-${shotCount + 1}.png`);
      await page.screenshot({ path: file, fullPage: fullPage && shotCount === 0 });
      saved.push(file);
      console.log(`  📸 ${path.relative(ROOT, file)}`);
      shotCount++;
    }
    const remaining = totalMs - (Date.now() - start);
    if (remaining <= 0 && shotCount >= shots) break;
    await page.waitForTimeout(Math.min(every * 1000, Math.max(remaining, 250)));
  }

  await context.close(); // flushes the video file
  await browser.close();

  if (record > 0) {
    // Playwright names videos randomly — rename the newest .webm to match.
    const vids = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.webm') && !f.startsWith('capture-'))
      .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    if (vids.length) {
      const target = path.join(dir, `${base}.webm`);
      fs.renameSync(path.join(dir, vids[0].f), target);
      saved.push(target);
      console.log(`  🎥 ${path.relative(ROOT, target)}`);
    }
  }

  console.log(`✓ ${saved.length} file(s) in ${path.relative(ROOT, dir)}`);
  console.log('  tip: .webm uploads fine to YouTube/X; for TikTok convert with:');
  console.log(`  ffmpeg -i ${path.relative(ROOT, saved.at(-1) ?? 'clip.webm')} -c:v libx264 -pix_fmt yuv420p clip.mp4`);
  return saved;
}
