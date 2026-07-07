import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT } from './util.js';

const run = promisify(execFile);

export const INBOX_DIR = 'content/inbox';
export const SAVED_DIR = 'content/saved';
const VIDEO_RE = /\.(webm|mp4|mov|m4v|mkv)$/i;
const MEDIA_RE = /\.(webm|mp4|mov|m4v|mkv|png|jpe?g|gif|webp)$/i;

/**
 * Find a usable ffmpeg. Preference order: FFMPEG_PATH env → ffmpeg on PATH →
 * Playwright's bundled build. `full: true` means it can read phone mp4/mov
 * files; Playwright's bundled build is webm-only.
 */
let ffmpegCache;
export function findFfmpeg() {
  if (ffmpegCache !== undefined) return ffmpegCache;
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push('ffmpeg');
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright')
      : process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library/Caches/ms-playwright')
        : path.join(os.homedir(), '.cache/ms-playwright'),
  ].filter(Boolean);
  for (const r of roots) {
    try {
      for (const d of fs.readdirSync(r)) {
        if (!d.startsWith('ffmpeg')) continue;
        for (const f of fs.readdirSync(path.join(r, d))) {
          if (f.startsWith('ffmpeg')) candidates.push(path.join(r, d, f));
        }
      }
    } catch { /* root missing — fine */ }
  }
  for (const c of candidates) {
    try {
      const out = execFileSync(c, ['-hide_banner', '-muxers'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      ffmpegCache = { path: c, full: /\smp4\s/.test(out) };
      return ffmpegCache;
    } catch { /* try next */ }
  }
  ffmpegCache = null;
  return null;
}

/** Can this specific file be processed by the ffmpeg we found? */
export function canProcess(name) {
  const ff = findFfmpeg();
  if (!ff) return false;
  if (/\.(webm|mkv)$/i.test(name)) return true;
  return ff.full;
}

function dirFor(config, src) {
  if (src === 'inbox') return path.join(ROOT, INBOX_DIR);
  if (src === 'saved') return path.join(ROOT, SAVED_DIR);
  return path.join(ROOT, config.capture?.outDir ?? 'content/captures');
}

/** Merged library: your imported recordings (inbox) + tool captures. */
export function listMedia(config) {
  const out = [];
  for (const src of ['saved', 'inbox', 'capture']) {
    const dir = dirFor(config, src);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!MEDIA_RE.test(f)) continue;
      const st = fs.statSync(path.join(dir, f));
      out.push({
        name: f,
        src,
        size: st.size,
        mtime: st.mtimeMs,
        video: VIDEO_RE.test(f),
        canProcess: VIDEO_RE.test(f) && canProcess(f),
      });
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime).slice(0, 40);
}

export function resolveMedia(config, src, name) {
  const file = path.join(dirFor(config, src), path.basename(name));
  if (!fs.existsSync(file)) throw new Error(`file not found: ${name}`);
  return file;
}

async function videoDuration(ff, file) {
  // ffmpeg -i prints "Duration: 00:00:24.84" to stderr (no ffprobe needed)
  try {
    await run(ff.path, ['-hide_banner', '-i', file]);
  } catch (err) {
    const m = String(err.stderr ?? '').match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  return null;
}

/** Pull N evenly-spaced screenshots out of a recording → captures folder. */
export async function extractStills(config, src, name, n = 6) {
  const ff = findFfmpeg();
  if (!ff) throw new Error('ffmpeg not found — see the hint in the gallery');
  const file = resolveMedia(config, src, name);
  const dur = await videoDuration(ff, file);
  if (!dur) throw new Error('could not read video duration (unsupported format for this ffmpeg build)');
  const outDir = path.join(ROOT, config.capture?.outDir ?? 'content/captures');
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.basename(name).replace(/\.[^.]+$/, '');
  const made = [];
  for (let i = 0; i < n; i++) {
    const t = (dur * (i + 0.5)) / n;
    const out = path.join(outDir, `still-${base}-${i + 1}.png`);
    await run(ff.path, ['-y', '-loglevel', 'error', '-ss', t.toFixed(2), '-i', file, '-frames:v', '1', out]);
    if (fs.existsSync(out)) made.push(path.basename(out));
  }
  if (!made.length) throw new Error('no stills produced — this ffmpeg build may not read this format');
  return made;
}

/**
 * Cut a share-ready clip. Stream-copy (no re-encode) keeps original quality
 * AND sound, and works with any ffmpeg that can read the file.
 */
export async function makeClip(config, src, name, { seconds = 15, start = null } = {}) {
  const ff = findFfmpeg();
  if (!ff) throw new Error('ffmpeg not found — see the hint in the gallery');
  const file = resolveMedia(config, src, name);
  const dur = await videoDuration(ff, file);
  if (!dur) throw new Error('could not read video duration (unsupported format for this ffmpeg build)');
  const from = start ?? Math.min(dur * 0.1, Math.max(0, dur - seconds));
  const outDir = path.join(ROOT, config.capture?.outDir ?? 'content/captures');
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.basename(name).replace(/\.[^.]+$/, '');
  const out = path.join(outDir, `clip-${base}-${seconds}s${path.extname(name).toLowerCase()}`);
  try {
    await run(ff.path, [
      '-y', '-loglevel', 'error',
      '-ss', from.toFixed(2), '-t', String(seconds),
      '-i', file, '-c', 'copy', out,
    ]);
  } catch {
    // Some files refuse stream copy — re-encode as a fallback (webm/VP8
    // works on every ffmpeg build; silent if the build has no audio encoder).
    const reOut = out.replace(/\.[^.]+$/, '.webm');
    await run(ff.path, [
      '-y', '-loglevel', 'error',
      '-ss', from.toFixed(2), '-t', String(seconds),
      '-i', file, '-c:v', 'libvpx', '-b:v', '2M', '-an', reOut,
    ]);
    return path.basename(reOut);
  }
  return path.basename(out);
}

/** Copy a chosen file into today's post pack so posting is one folder. */
export function useToday(config, src, name, date) {
  const file = resolveMedia(config, src, name);
  const dest = path.join(ROOT, 'content', 'packs', date, 'media');
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(file, path.join(dest, path.basename(name)));
  return path.relative(ROOT, path.join(dest, path.basename(name)));
}

/** Move a file to content/saved/ so daily cleanups never touch it. */
export function saveForLater(config, src, name) {
  const file = resolveMedia(config, src, name);
  const dest = path.join(ROOT, SAVED_DIR);
  fs.mkdirSync(dest, { recursive: true });
  const target = path.join(dest, path.basename(name));
  fs.renameSync(file, target);
  return path.relative(ROOT, target);
}

/** Permanently delete a capture/import/saved file. */
export function deleteMedia(config, src, name) {
  const file = resolveMedia(config, src, name);
  fs.rmSync(file);
  return true;
}
