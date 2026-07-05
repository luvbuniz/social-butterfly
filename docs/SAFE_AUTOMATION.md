# Safe automation — how to not get flagged as a bot

Your instinct ("I don't want to get shut down for being a bot") is exactly right.
Platforms don't ban you for *using tools*; they ban you for *behaving like spam*.
The line is clearer than it looks:

## The golden rule

> **Automate creation, preparation, and scheduling. Keep a human on the Send button
> for TikTok, Instagram, Reddit, and YouTube.**

That's the design of this repo: social-butterfly generates ideas, writes captions,
captures media, and builds one-click share links — and then *you* post, which takes
about 30 seconds per platform and keeps you unbannable.

## Always safe ✅

- **Everything this repo does.** Generating ideas/captions locally, screenshotting your
  own site with your own browser (the capture tool), building share links, GitHub Actions
  in your own repo. No platform ToS is even involved.
- **Official share/intent links** (`content/packs/*/links.md`) — they open the platform's
  own compose window pre-filled; a human presses Post. That's a feature platforms provide
  on purpose.
- **Licensed scheduling tools** (Buffer, Later, Publer, Metricool and similar). They post
  through official platform APIs under agreements with the platforms. Scheduling posts at
  sane times through them will not get you flagged.
- **RSS auto-share** (dlvr.it, IFTTT, Zapier → official APIs) — e.g. auto-tweeting new
  posts from a stackadoo.com news feed. Fine, because it rides official APIs.
- **Bluesky and Mastodon automation.** Both are automation-friendly with open APIs.
  A fully automated account is acceptable there — label it as such in the bio. Good
  low-risk place to experiment with full auto-posting later.

## Risky — don't ⛔

- **Browser-puppeteering your logged-in accounts to post** (scripting the TikTok/IG web
  UI with Playwright/Selenium). This is the thing that actually looks like a bot to
  their detection and risks the account. Ironically, the tech we happily use to film
  your own site is the tech you must NOT point at their login pages.
- **Engagement automation:** auto-follow/unfollow, auto-DM, auto-comment, buying
  followers/likes. Fastest route to a ban and it poisons your analytics anyway.
- **Identical text blasted to every platform at the same minute, every day.** Even via
  legit schedulers this reads as spam to humans and algorithms. The generator writes
  per-platform variants for exactly this reason.
- **Reddit at daily frequency or copy-paste across subs.** Reddit is the most
  ban-happy toward promotion. Weekly-ish, personal, engaged — or not at all.
- **New account + instant scheduler.** Warm up every new account with 1–2 weeks of
  manual posting, following, and commenting before connecting any tool to it.

## If you later want true auto-posting

Do it through official APIs only, in this order of friendliness:
1. **Bluesky / Mastodon** — open APIs, bots welcome.
2. **X API** — the free tier allows posting your own content at low volume.
3. **Meta Graph API** — auto-publish to Instagram Business / Facebook Pages (requires
   a business account + app review; this is what Buffer uses under the hood).
4. **YouTube Data API** — uploads are allowed; note new apps face quota limits.
5. **TikTok Content Posting API** — exists, but approval is aimed at established
   businesses; for an indie, manual upload is the practical answer.

The pragmatic middle path: connect X + Facebook + Bluesky to a scheduler fed by your
queue (`npm run export` gives you CSV), and hand-post TikTok/IG/Shorts — which you'd
want to do anyway, since those platforms reward native-feeling uploads (trending
sounds, text overlays) that no API post can carry.

## Sane pacing defaults

- ≤ 1–2 posts per platform per day; not at :00 on the dot every day.
- Vary captions per platform (done for you) and vary posting time by ±an hour.
- Reply like a person, because you are one. Replies are also the best growth lever.
