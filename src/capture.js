import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT, timestampSlug } from './util.js';
import { findFfmpeg } from './media.js';

const run = promisify(execFile);

// Social-ready viewport presets.
export const PRESETS = {
  vertical: { width: 1080, height: 1920 }, // TikTok / Reels / Shorts (9:16)
  wide: { width: 1920, height: 1080 },     // YouTube / X / screenshots (16:9)
  square: { width: 1080, height: 1080 },   // Instagram feed (1:1)
};

async function launchChromium(headed = false) {
  const { chromium } = await import('playwright');
  const opts = headed ? { headless: false } : {};
  try {
    return await chromium.launch(opts);
  } catch (err) {
    // Managed environments (e.g. Claude Code cloud) pre-install Chromium at a
    // fixed path that may not match this playwright version's expected build.
    const fallback = process.env.BUTTERFLY_CHROMIUM || '/opt/pw-browsers/chromium';
    if (fs.existsSync(fallback)) {
      return await chromium.launch({ ...opts, executablePath: fallback });
    }
    throw err;
  }
}

/**
 * Scripted steps from butterfly.config.json → capture.steps, e.g.:
 *   { "action": "click",  "selector": "text=Play" }
 *   { "action": "fill",   "selector": "#username", "value": "Butterfly" }
 *   { "action": "press",  "key": "Enter" }
 *   { "action": "scroll", "selector": "#play" }   // or { "y": 600 }
 *   { "action": "wait",   "seconds": 2 }
 */
async function runSteps(page, steps) {
  for (const s of steps) {
    try {
      if (s.action === 'click') await page.click(s.selector, { timeout: 5000 });
      else if (s.action === 'fill') await page.fill(s.selector, s.value ?? '', { timeout: 5000 });
      else if (s.action === 'press') await page.keyboard.press(s.key ?? 'Enter');
      else if (s.action === 'scroll' && s.selector)
        await page.locator(s.selector).first().scrollIntoViewIfNeeded({ timeout: 5000 });
      else if (s.action === 'scroll') await page.evaluate((y) => window.scrollBy(0, y), s.y ?? 600);
      else if (s.action === 'wait') await page.waitForTimeout((s.seconds ?? 1) * 1000);
      console.log(`  ✓ step: ${s.action} ${s.selector ?? s.key ?? s.y ?? ''}`);
    } catch {
      console.log(`  ⚠ step skipped (not found): ${s.action} ${s.selector ?? ''}`);
    }
  }
}

/** A made-up, kid-safe username that never sounds like a real name. */
export function randomUsername() {
  const a = ['Sunny', 'Bouncy', 'Turbo', 'Pixel', 'Cosmic', 'Ziggy', 'Wobbly', 'Snappy'];
  const b = ['Block', 'Meadow', 'Acorn', 'Comet', 'Waffle', 'Doodle', 'Pebble', 'Rocket'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(a)}${pick(b)}${10 + Math.floor(Math.random() * 89)}`;
}

async function clickByText(page, re) {
  const btn = page
    .locator('button, [role="button"], a, input[type="submit"]')
    .filter({ hasText: re })
    .filter({ visible: true })
    .first();
  await btn.scrollIntoViewIfNeeded({ timeout: 3000 });
  await btn.click({ timeout: 3000 });
}

/** Sign in with the account from butterfly.secrets.json, if the site asks. */
async function autoLogin(page, login) {
  if (!login?.email || !login?.password) return;
  const passField = page.locator('input[type="password"]').first();
  if (!(await passField.isVisible().catch(() => false))) {
    try { await clickByText(page, /sign ?in|log ?in/i); } catch { return; } // no login UI — free play
    await page.waitForTimeout(1200);
  }
  try {
    const emailField = page
      .locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[autocomplete="username"]')
      .filter({ visible: true })
      .first();
    await emailField.fill(login.email, { timeout: 4000 });
    const passVisible = page.locator('input[type="password"]').filter({ visible: true }).first();
    await passVisible.fill(login.password, { timeout: 4000 });
    try { await clickByText(page, /sign ?in|log ?in|submit|continue|go/i); } catch { await page.keyboard.press('Enter'); }
    await page.waitForTimeout(2500);
    const stillThere = await page.locator('input[type="password"]').filter({ visible: true }).first().isVisible().catch(() => false);
    console.log(stillThere ? '  ⚠ auto: sign-in may not have worked (password box still showing)' : '  ✓ auto: signed in');
  } catch {
    console.log('  ⚠ auto: login fields not found — continuing without signing in');
  }
}

/** Best-effort "press Play, type a name, start" for unscripted sites. */
async function autoStart(page, username) {
  // Prefer explicit free-play entrances (e.g. "Math Meadow", "Free Play").
  try {
    await clickByText(page, /free ?play|math ?meadow|play free/i);
    console.log('  ✓ auto: clicked free play');
  } catch {
    try { await clickByText(page, /play|start/i); console.log('  ✓ auto: clicked Play'); } catch {}
  }
  await page.waitForTimeout(1200);
  try {
    const input = page
      .locator('input[type="text"], input:not([type]):not([id*="email" i]), input[placeholder*="name" i], input[name*="name" i], input[id*="name" i]')
      .filter({ visible: true })
      .first();
    await input.fill(username, { timeout: 3000 });
    console.log(`  ✓ auto: typed username "${username}"`);
    try { await clickByText(page, /start|go|continue|play|submit|✓/i); } catch { await page.keyboard.press('Enter'); }
  } catch {}
  await page.waitForTimeout(800);
}

/**
 * While filming, keep solving on-screen arithmetic ("32 − 7 = ?") by clicking
 * the button whose label equals the answer. Best-effort; harmless if no match.
 */
function startMathSolver(page, onAnswer) {
  let stopped = false;
  (async () => {
    while (!stopped) {
      try {
        const solved = await page.evaluate(() => {
          const m = document.body.innerText.match(/(\d+)\s*([+\-−×x*÷/])\s*(\d+)\s*=/);
          if (!m) return false;
          const a = +m[1], b = +m[3], op = m[2];
          const ans =
            op === '+' ? a + b :
            op === '−' || op === '-' ? a - b :
            op === '÷' || op === '/' ? a / b : a * b;
          const clickable = [...document.querySelectorAll('button, [role="button"], a, label')];
          const el = clickable.find((e) => e.innerText.trim() === String(ans) && e.offsetParent !== null);
          if (el) { el.click(); return true; }
          return false;
        });
        if (solved) {
          console.log('  ✓ auto: answered a math question');
          onAnswer?.();
        }
      } catch {}
      await page.waitForTimeout(1300).catch(() => { stopped = true; });
    }
  })();
  return () => { stopped = true; };
}

/**
 * Load the site, optionally interact (scripted steps and/or auto-play),
 * and capture screenshots + video.
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
  auto = false,
  headed = false,
  steps = [],
  username = '',
  login = null,
} = {}) {
  username = username || randomUsername();
  const size = PRESETS[preset] ?? PRESETS.vertical;
  const dir = path.resolve(ROOT, outDir ?? 'content/captures');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = timestampSlug();
  const base = `capture-${stamp}-${preset}`;
  const saved = [];

  const browser = await launchChromium(headed);
  if (headed) console.log('🕹  headed mode: a browser window is open — play the game yourself; filming for the set duration');
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

  const recStart = Date.now();
  let stopSolver = null;
  let gameplayAt = auto ? null : Date.now();
  if (steps.length) await runSteps(page, steps);
  if (auto) {
    await autoLogin(page, login);
    await autoStart(page, username);
    stopSolver = startMathSolver(page, () => { if (gameplayAt == null) gameplayAt = Date.now(); });
    console.log('  ⏳ waiting for real gameplay — the clip window starts at the first solved question');
  }

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

  // In auto mode the shot/record window is anchored to the first solved
  // question, so the saved clip is gameplay — not menus. If the site never
  // shows a question, fall back after preRollMax.
  const preRollMax = 40000;
  const start = Date.now();
  const windowMs = Math.max(shots * every, record) * 1000;
  let shotCount = 0;

  while (true) {
    if (gameplayAt == null && Date.now() - start >= preRollMax) gameplayAt = Date.now();
    if (gameplayAt != null) {
      if (shotCount < shots) {
        const file = path.join(dir, `${base}-${shotCount + 1}.png`);
        await page.screenshot({ path: file, fullPage: fullPage && shotCount === 0 });
        saved.push(file);
        console.log(`  📸 ${path.relative(ROOT, file)}`);
        shotCount++;
      }
      if (Date.now() - gameplayAt >= windowMs && shotCount >= shots) break;
    }
    await page.waitForTimeout(gameplayAt != null && shotCount < shots ? every * 1000 : 700);
  }

  if (stopSolver) stopSolver();
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

      // Smart trim: drop the login/menu lead-in so the clip starts at gameplay.
      const lead = gameplayAt ? (gameplayAt - recStart) / 1000 - 1.5 : 0;
      const ff = lead > 1 ? findFfmpeg() : null;
      if (ff) {
        const tmp = target.replace(/\.webm$/, '-trim.webm');
        try {
          await run(ff.path, ['-y', '-loglevel', 'error', '-ss', lead.toFixed(2), '-i', target, '-c', 'copy', tmp]);
          fs.renameSync(tmp, target);
          console.log(`  ✂️ trimmed ${lead.toFixed(1)}s of menus/login — the clip starts at the action`);
        } catch {
          fs.rmSync(tmp, { force: true });
        }
      }
    }
  }

  console.log(`✓ ${saved.length} file(s) in ${path.relative(ROOT, dir)}`);
  console.log('  tip: .webm uploads fine to YouTube/X; for TikTok convert with:');
  console.log(`  ffmpeg -i ${path.relative(ROOT, saved.at(-1) ?? 'clip.webm')} -c:v libx264 -pix_fmt yuv420p clip.mp4`);
  return saved;
}
