# Stackadoo traffic playbook

The honest version first: for a new browser game, **social posting alone is the slow road**.
The fast roads are (A) making the game itself shareable, and (B) putting it where players
already are. Social content then compounds on top. Do all three, in that order.

---

## A. Make the game do the marketing (highest leverage, zero cost)

These are site features, not posts. Each one turns players into your posters.

1. **Share-my-score button.** After a run ends, show a big "Share" button that produces
   a pre-filled post ("I stacked 87 on Stackadoo 🧱 can you beat me? stackadoo.com").
   Use the Web Share API on mobile and the same intent links social-butterfly generates
   (`src/pack.js`) on desktop. This is how Wordle grew — the emoji grid was a share button.
2. **Daily challenge.** Same seed/sequence for everyone each day, resets at midnight.
   It gives players a reason to return daily AND a reason to compare scores publicly.
   Bonus: "Daily #41" posts write themselves — your daily content problem half-solves itself.
3. **Open Graph + Twitter Card tags.** When anyone pastes stackadoo.com anywhere, it should
   show a bright gameplay image, the tagline, and a play button vibe — not a bare link.
   One meta-tag afternoon, permanent payoff.
4. **A tiny leaderboard.** Even top-10 with initials. Screenshot of it = a weekly post,
   and players screenshot it themselves when they get on it.

## B. Distribution — go where the players already are

1. **Web game portals** (biggest single lever for browser games). Submit Stackadoo to
   CrazyGames, Poki, itch.io, Newgrounds, and GameJolt. Portals have millions of players
   actively looking for new games and they link back to your site. Search results for
   stacking games are dominated by portal listings (Coolmath, Poki, etc.) — be *in* those
   catalogs rather than competing with them from a lone domain.
2. **Reddit, done respectfully.** r/WebGames, r/playmygame, and r/IndieGaming welcome
   makers who follow the rules. 2–3 posts per WEEK max across different subs, always as
   yourself ("I'm the solo dev…"), always replying to comments. Reddit hates marketing
   and loves makers.
3. **Discord.** Join indie-game and web-game servers; most have a showcase channel.
   Later, your own server becomes the home for your regulars and playtesters.
4. **Show HN / Product Hunt** — one-shot spikes, worth doing once the site has the share
   button and OG tags so the spike converts.

## C. The content engine (what this repo automates)

**Cadence that won't burn you out (~20–30 min/day):**

| Daily | Weekly |
|---|---|
| 1 short vertical clip → TikTok, then reuse on YouTube Shorts + Reels | 1 dev-log post (X/Bluesky) |
| 1 text post on X or Bluesky (score callout, tip, or question) | 1 cartoon drop, repurposed 4–5 ways |
| reply to every comment | 2–3 Reddit posts (not daily!) |

**Why short vertical video is the engine:** TikTok/Shorts/Reels are the only major
surfaces where brand-new accounts regularly reach thousands of strangers. Games are
perfect for it, and **fails outperform wins** — the tower collapsing gets comments
("you had ONE job"), and comments are the algorithm's favorite food.

**The flagship format — run this as a series:**
> "Day 12 of posting my game until someone beats my high score (87)"

Serialized formats compound: day counts create curiosity, challenges create comments,
and the day you lose your own record is your best-performing post ever. The generator
tracks the day number automatically (`series` in butterfly.config.json).

**The 8 content pillars** (rotated Mon–Sun by `npm run plan`, see `src/pillars.js`):
clip · challenge · tip · dev-log · cartoon · meme · community · milestone.
Rotation prevents both audience fatigue and "repetitive content" flags.

**Cartoons:** they're your most expensive asset, so never post one only once.
One cartoon = full strip (IG/FB) + per-panel teasers (3 days of stories) + slow-pan
animatic with music (TikTok/Reels) + character card + reaction-meme crop. Keep the
cadence weekly or biweekly; the generator schedules them as one pillar, not a daily grind.

**Platform priorities for a game with zero audience:**
1. **TikTok** — best cold-start reach, gaming-native audience
2. **YouTube Shorts** — same clips, second algorithm, builds a permanent library
3. **X / Bluesky** — indie-dev community, build-in-public posts, low effort
4. **Instagram Reels** — same clips again; feed posts for cartoons
5. **Reddit** — weekly, high-value, follow the rules
6. Facebook/Pinterest — only if effort is left over

## D. SEO for the site (slow but free)

- "Stackadoo" is a unique name — you'll own that query fast. The battle is generic terms.
- Add pages that accumulate: **how to play**, **FAQ** ("is Stackadoo free?", "how do I
  get a high score?"), a **changelog/news** page (freshness signal + dev-log crossposts),
  and if you do the daily challenge, a page per day ("Stackadoo Daily #41") — those
  compound into hundreds of indexed pages.
- Page titles matter: "Stackadoo — free online stacking game, no download" beats "Home".

## E. Measure just enough

- Watch **one number per platform**: TikTok = average views per clip; X = replies;
  Reddit = upvote ratio; site = plays per day (any lightweight analytics).
- Give any experiment 2 weeks before judging it. Double down on the one format that
  outperforms; drop the one nobody engages with. The rotation makes this comparison easy.

## The first two weeks, concretely

1. Ship the share-my-score button + OG tags (section A) — before heavy posting.
2. Create accounts everywhere, post 2–3 warm-up posts manually (see SAFE_AUTOMATION.md).
3. Submit to itch.io + one portal.
4. Start the "day N until someone beats my score" series on TikTok/Shorts.
5. `npm run plan` every Sunday; `npm run due` every morning; post; mark `done`; keep the streak.
6. One respectful Reddit intro post in r/WebGames ("I made a free stacking game, feedback welcome").
