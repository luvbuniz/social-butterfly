// Content pillars for Stackadoo — a math game where kids build 3D worlds by
// solving problems. AUDIENCE: PARENTS (never market to kids directly).
// Template variables:
//   {game}   game name          {url}    short url
//   {score}  problems solved    {day}    day # of the build-in-public series
export const PILLARS = {
  clip: {
    label: 'Gameplay clip',
    emoji: '🎬',
    effort: 'S',
    platforms: ['tiktok', 'instagram', 'youtube', 'facebook'],
    hooks: [
      'POV: your kid just asked to do MORE math',
      "This is what 20 minutes of 'one more math problem' builds 🧱",
      'The moment the math clicks… and the world grows',
      'Screen time you don\'t have to feel guilty about',
      'Watch a math problem turn into a castle',
      'No ads, no videos, no brain rot — just math and blocks',
      '{score} math problems went into building this world',
    ],
    asset:
      'Record 15–30s of world-building with auto-play: use the Capture studio (auto-play ON) or `npm run capture -- --auto --record 25`. The "problem solved → block earned" moment is the money shot.',
  },
  challenge: {
    label: 'Kid progress / brag',
    emoji: '🏆',
    effort: 'S',
    platforms: ['facebook', 'instagram', 'tiktok'],
    hooks: [
      'A kid somewhere solved {score} math problems this week — just to earn blocks',
      'Day {day}: kids are still choosing math over cartoons. I\'m as surprised as you.',
      'Your kid could solve {score} problems this month without noticing they\'re practicing',
      'The average session sneaks in dozens of math problems. They think they\'re just building.',
      'Quietly proud of every kid who leveled up their math this week 💛',
    ],
    asset:
      'Screenshot a finished kid-built world or the progress screen: `npm run capture -- --auto --shots 2`. Real numbers beat invented ones — swap in stats from your dashboard when you have them.',
  },
  tip: {
    label: 'Parent tip',
    emoji: '💡',
    effort: 'S',
    platforms: ['instagram', 'facebook', 'tiktok'],
    hooks: [
      'The trick to math practice without the battle: make it the reward, not the chore',
      '3 signs your kid is bored (not bad) at math',
      'Swap 15 minutes of autoplay videos for 15 minutes of building — same tablet, zero fight',
      'Why kids remember math they USED (and forget math they memorized)',
      'The car-ride question that shows you how your kid actually thinks about numbers',
      'Summer slide is real — 15 minutes a day is the whole fix',
    ],
    asset:
      'Text-over-video or a carousel: film gameplay (auto-play capture) and add the tip as on-screen text in CapCut/Canva. Tips get SAVED by parents — saves boost reach the most.',
  },
  devlog: {
    label: 'Behind the scenes (parent-dev)',
    emoji: '🛠️',
    effort: 'M',
    platforms: ['facebook', 'instagram', 'x'],
    hooks: [
      'I\'m building the math game kids actually ask to play — day {day}',
      'Why I made {game}: math practice at our house was a nightly battle',
      'You asked, I added it: new in {game} this week 👀',
      'Building {game} in public — what changed this week',
      'The cartoon characters my kids helped design 🎨',
      'Solo parent-dev life: shipped a feature at midnight, tested by a 7-year-old at breakfast',
    ],
    asset:
      'Wide screenshots (`--preset wide --shots 3`) or a phone selfie-video. The "parent who built the thing" story is your unfair advantage — no big edtech company has it.',
  },
  cartoon: {
    label: 'Cartoon / character',
    emoji: '🎨',
    effort: 'L',
    platforms: ['instagram', 'facebook', 'tiktok'],
    hooks: [
      'New {game} cartoon just dropped 🎬 (my kids approved this one)',
      'Meet the blocks — the characters your kids keep asking about',
      'Panel 1 of this week\'s comic. Full strip on {url}',
      'When the tower falls… (a {game} cartoon)',
      'Drew this instead of sleeping. The kids say it was worth it.',
    ],
    asset:
      'Repurpose ONE cartoon 4–5 ways: full strip (IG/FB), one panel per day as teasers, a slow pan with music (Reels/TikTok), character card, printable coloring-page version (parents LOVE printables — great Pinterest material).',
  },
  meme: {
    label: 'Parent meme',
    emoji: '😂',
    effort: 'S',
    platforms: ['facebook', 'instagram', 'tiktok'],
    hooks: [
      "Me: bedtime. Kid: 'one more math problem??' Me: …fine. FINE.",
      'POV: your kid picked math over YouTube and you don\'t know who they are anymore',
      'Nobody: … My kid at dinner: \'want to hear a math fact?\' (yes. always yes.)',
      'Stages of tablet time: negotiation → silence → \'MOM look what I built\'',
      'My kid thinks they\'re gaming. The math worksheet disagrees.',
    ],
    asset:
      'Screenshot + bold caption text on the image (Canva). Relatable parenting humor travels further in Facebook groups than anything polished.',
  },
  community: {
    label: 'Parent question',
    emoji: '💬',
    effort: 'S',
    platforms: ['facebook', 'instagram', 'x'],
    hooks: [
      'What\'s the one subject your kid fights you on? (Math parents, I see you)',
      'Homeschool parents: what does math time actually look like at your house?',
      'Poll: would you rather your kid had 30 min of videos or 30 min of a building game?',
      'What did YOUR kid build this week? Show me 👇',
      'Parents of reluctant mathematicians — what finally worked for you?',
    ],
    asset:
      'Text-first post; optional screenshot. Reply to EVERY comment — in parent groups the comments ARE the marketing.',
  },
  milestone: {
    label: 'Milestone / gratitude',
    emoji: '📈',
    effort: 'S',
    platforms: ['facebook', 'instagram', 'x'],
    hooks: [
      'Kids on {game} solved {score}+ math problems this week 🤯',
      'Small win: {game} had its best week yet. Thank you to every family trying it 💛',
      '{day} days of building this in public. Here\'s what\'s happened so far.',
      'First families are in! Watching kids build their worlds is everything.',
    ],
    asset:
      'Screenshot a stats graph or a collage of kid-built worlds (with permission). Gratitude posts humanize the account — every few weeks.',
  },
};

export const CTAS = {
  default: [
    'Free on tablets → {url}',
    'Grab the family tablet and go to {url} — free to play',
    'Try it free on a tablet → {url} (Google Play version coming soon)',
    'No download needed on tablets → {url}',
  ],
  linkInBio: [
    'Free on tablets — link in bio 🧱',
    'Math they\'ll actually ask for — link in bio',
    'Try it on the family tablet — link in bio (free)',
  ],
};

// Platform-specific formatting rules used by the caption builder.
export const PLATFORM_RULES = {
  tiktok: { maxLen: 2100, linkInBio: true, tags: 8 },
  instagram: { maxLen: 2100, linkInBio: true, tags: 12 },
  youtube: { maxLen: 4900, linkInBio: false, tags: 4, titled: true, titleMax: 95 },
  x: { maxLen: 275, linkInBio: false, tags: 2 },
  facebook: { maxLen: 2000, linkInBio: false, tags: 2 },
  bluesky: { maxLen: 295, linkInBio: false, tags: 1 },
  reddit: { maxLen: 0, linkInBio: false, tags: 0, special: true },
};
