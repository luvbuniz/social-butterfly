# Stackadoo traffic playbook

**Audience: parents.** Stackadoo is "the math game kids actually ask to play" — kids
build 3D worlds by earning blocks through math. The person you're talking to online
is a parent (homeschool parents especially), not a gamer. Every caption, hashtag,
and channel choice follows from that.

**The offer to lead with:** *free on a tablet, straight from the site — nothing to
download.* That kills the two biggest objections (price, "another app to install")
in one line. When the Google Play version ships, that becomes the second big beat.

**One rule that's not optional:** market **to parents, never to kids**. Kid-directed
advertising trips COPPA and platform policies; parent-directed content about your
kids' product is completely fine. All the generated captions already speak
parent-to-parent — keep it that way.

---

## A. Make the game do the marketing (highest leverage)

Site features, not posts — each one turns families into promoters:

1. **Share button for parents** (`site-snippets/share-score.html`): after a session,
   let the parent share "My kid solved 87 math problems building a world 🧱". A
   proud-parent brag is the most credible ad that exists.
2. **Open Graph tags** (`site-snippets/og-tags.html`): pasted links in Facebook
   groups and group chats must show the pitch card, not a bare URL — most parent
   discovery happens in exactly those two places.
3. **A "what your kid practiced" recap** (weekly email or end-of-session screen):
   parents stay for proof of learning. Screenshots of these recaps are also
   perfect social content.
4. **Printables** (coloring pages of the characters, a "math bingo" sheet):
   printables are Pinterest and homeschool-newsletter currency, and each one
   carries your logo and URL into the house.

## B. Distribution — where parents actually look

1. **Facebook groups** — homeschool groups, "kids activities" groups, grade-level
   parent groups. Join as yourself, be useful for a week before ever mentioning
   the game, then share as "I'm a parent and I built this." Weekly, not daily.
2. **Pinterest** — the sleeping giant for kids' education. Teachers and homeschool
   parents live there, pins compound for years (unlike posts that die in a day).
   Pin every cartoon, printable, tip-graphic, and world-screenshot. The share links
   in your packs already include Pinterest.
3. **Educational directories & review sites** — being listed is passive, compounding
   traffic: Common Sense Media, educational-app roundups, homeschool-curriculum
   blogs (many review free tools happily). One outreach email each is worth more
   than a month of posting.
4. **Reddit, carefully** — r/homeschool and r/matheducation welcome makers who
   follow the rules; big parenting subs usually restrict promo to weekly threads.
   The generated Reddit caption is already worded parent-dev-honest.
5. **Google Play launch** (when ready) — a launch is a content event: "it's out"
   posts everywhere, ask early families for reviews (store reviews are the whole
   ballgame for app discovery), and update every bio link.

## C. The content engine (what this repo automates)

**Cadence (~20–30 min/day):**

| Daily | Weekly |
|---|---|
| 1 short vertical clip → TikTok + Reels + Shorts | 1–2 Facebook group shares (value-first) |
| 1 text post (Facebook page / X) | 1 cartoon drop, repurposed 4–5 ways |
| reply to every comment | a few Pinterest pins + 1 Reddit post max |

**Why short vertical video still leads:** parents scroll TikTok and Reels too —
#momsoftiktok is enormous — and the algorithm reaches strangers on day one. The
highest-performing formats for kids' products are: the **transformation** ("math
battle → kid asking for more"), the **over-the-shoulder** clip of a kid building
(hands and screen only — no faces needed), and the **honest parent-dev story**
("math time was a nightly fight at our house, so I built this").

**The flagship series:** *"Day {N} of building the math game kids actually ask to
play."* Build-in-public, parent-to-parent. The generator tracks the day number
(`series` in butterfly.config.json). Milestone days (first family, first 1,000
problems solved, Play Store approval) are your best posts — save screenshots.

**The 8 pillars** (rotated Mon–Sun by the planner): gameplay clip · kid progress ·
parent tip · behind-the-scenes · cartoon · parent meme · parent question · milestone.

**Cartoons:** post each one 4–5 ways (strip → panels → animatic → character card →
**printable coloring page**). The printable version is the secret weapon — parents
print it, kids ask what it's from.

**Platform priorities for a parents-of-kids product:**
1. **Facebook** — where parent communities actually are; groups > page
2. **Instagram Reels** — parent-heavy, cartoon-friendly
3. **TikTok** — biggest cold reach via #momsoftiktok / #homeschool
4. **Pinterest** — compounding evergreen traffic from printables & tips
5. **YouTube Shorts** — same clips, builds a permanent library
6. X / Bluesky — for the build-in-public dev story and edtech crowd

## D. SEO for the site

- Own "stackadoo" (easy), then chase parent phrases: "math game for 7 year old",
  "free math games no download", "math practice kids actually like". Put those
  words in real page copy, titles, and an FAQ.
- Pages that compound: **how it works** (for parents), **FAQ** ("is it free?",
  "what ages?", "is it safe?"), **changelog/news**, and eventually a **printables
  page** — printables rank and get linked by homeschool blogs.
- Title tag: "Stackadoo — free math game for kids, no download (tablet & web)"
  beats anything clever.

## E. Measure just enough

- Cloudflare/GA4 (see the Results card in the dashboard): watch **visitors by
  source** weekly — the utm tags on your share links label each platform.
- In the dashboard, log views per post; after two weeks, double down on the pillar
  and platform that win. For a parents product, expect Facebook + Pinterest to
  quietly beat everything else on *site visits* even when TikTok wins on *views*.

## The first two weeks, concretely

1. Ship the OG tags + parent share button (section A) — before heavy posting.
2. Set up accounts with the parent-facing bio: "The math game kids actually ask to
   play. Built by a parent. Free on tablets → stackadoo.com".
3. Start the "Day N of building the math game kids ask to play" series (TikTok/Reels).
4. Join 3–5 Facebook homeschool/parent groups and just be helpful (no links yet).
5. `npm start` every morning: capture with auto-play, post the day's idea, tick it off.
6. Week 2: one honest intro post in r/homeschool; email Common Sense Media and two
   homeschool bloggers; first value-share in one Facebook group.
