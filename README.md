# 🦋 social-butterfly

Content toolkit for [stackadoo.com](https://stackadoo.com): a daily **idea generator**,
a posting **organizer**, a browser-powered **capture tool** for gameplay
screenshots/video, and a **safe poster** that preps everything but keeps you on the
Send button (so no platform ever mistakes you for a bot).

- 📖 **[docs/STRATEGY.md](docs/STRATEGY.md)** — the traffic playbook (read this first)
- 🛡️ **[docs/SAFE_AUTOMATION.md](docs/SAFE_AUTOMATION.md)** — what's safe to automate, what gets accounts banned

## Setup (once)

```bash
npm install
npx playwright install chromium   # browser for the capture tool (skip in cloud envs that pre-install it)
```

Then open `butterfly.config.json` and make it yours: social handles, hashtags, the
score range of your real game, and the `series.startDate` (the day you start the
"posting until someone beats my high score" series).

## The 20-minute daily routine

```bash
npm run due                        # 1. what's on today + your streak
npm run capture -- --record 20     # 2. film the game (vertical, TikTok-ready)
npm run pack                       # 3. captions + share links + media in one folder
# 4. post: open content/packs/<today>/ — paste captions, click share links
node bin/butterfly.js done <id>    # 5. keep the streak alive
```

Weekly: `npm run plan` refills the queue for the next 7 days (Mon–Sun pillar rotation).

## Commands

| Command | What it does |
|---|---|
| `npm run today` | Today's ideas + captions (`-- --full` for every platform, `-- --json` for raw) |
| `npm run plan` | Fill the queue for the week (`-- --days 14` for two weeks) |
| `npm run due` | What to post today + streak counter |
| `node bin/butterfly.js done <id>` | Mark an item posted |
| `npm run pack` | Write captions, one-click share links, and latest media to `content/packs/<date>/` |
| `npm run capture` | Screenshot/record the site (see below) |
| `npm run demo` | Capture the bundled demo page (sanity check, works offline) |
| `node bin/butterfly.js export` | Queue → CSV (for schedulers or a spreadsheet) |

## The capture tool (your in-house "Hermes")

Points a real Chromium at the site, waits, optionally auto-scrolls, and saves
screenshots + video sized for social:

```bash
npm run capture -- --record 25                   # 25s vertical video + 3 screenshots
npm run capture -- --preset wide --shots 3       # 16:9 screenshots for X/dev-logs
npm run capture -- --scroll --record 15          # auto-scroll the page while recording
npm run capture -- --url https://stackadoo.com/leaderboard --shots 1
```

Presets: `vertical` 1080×1920 (TikTok/Shorts/Reels) · `wide` 1920×1080 · `square` 1080×1080.
Output lands in `content/captures/`. Videos are `.webm` (fine for YouTube/X); the tool
prints the one-line `ffmpeg` command to convert to `.mp4` for TikTok.

This films **your own site with your own browser** — no platform ToS involved.
Never point browser automation at a *social platform* while logged in; see
[docs/SAFE_AUTOMATION.md](docs/SAFE_AUTOMATION.md).

## Daily ideas delivered to you (GitHub Action)

`.github/workflows/daily-content.yml` opens an issue in this repo every morning
(12:00 UTC) titled **“📅 Content plan — YYYY-MM-DD”** with the day's ideas, captions,
and a checklist. Trigger it manually from the Actions tab with *Run workflow*, change
the cron to your timezone, or delete the file if you'd rather pull ideas locally.

## Optional: Claude caption punch-up

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run today -- --claude
```

Rewrites the day's captions with more voice (model configurable in
`butterfly.config.json`, default `claude-opus-4-8`). Everything works without it.

## FAQ

**Won't automated posting get me banned?** This repo deliberately doesn't auto-post.
It automates everything *around* posting; you press Send. Full reasoning and the list
of safe upgrade paths (schedulers, official APIs, Bluesky bots): [docs/SAFE_AUTOMATION.md](docs/SAFE_AUTOMATION.md).

**Why are the ideas the same when I re-run?** They're seeded by the date on purpose —
your plan doesn't reshuffle under you mid-day. New day, new ideas. Use `--date` to peek ahead.

**Where do cartoons fit?** They're the Friday pillar, and the strategy doc has a
"one cartoon = a week of content" repurposing recipe so the drawing effort compounds.
