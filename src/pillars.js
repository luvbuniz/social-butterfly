// Content pillars for an indie web game. Template variables:
//   {game}   game name          {url}    short url
//   {score}  plausible score    {day}    day # of the challenge series
export const PILLARS = {
  clip: {
    label: 'Gameplay clip',
    emoji: '🎬',
    effort: 'S',
    platforms: ['tiktok', 'youtube', 'instagram'],
    hooks: [
      "POV: you said 'just one more stack' 20 minutes ago",
      'This game has no right being this satisfying 🧱',
      'Sound ON — the wobble is real 🔊',
      '60 seconds of pure stacking zen',
      'The tower was doing SO well until…',
      'Watch till the end. You will feel this in your soul.',
      'My hands were shaking at block {score}, not gonna lie',
    ],
    asset:
      'Record 15–30s of gameplay in vertical: `npm run capture -- --record 25` then trim to the best 10–15s. Fails outperform wins — post the collapse.',
  },
  challenge: {
    label: 'Score challenge',
    emoji: '🏆',
    effort: 'S',
    platforms: ['tiktok', 'x', 'instagram'],
    hooks: [
      'Day {day} of posting {game} until someone beats my high score ({score})',
      'My high score is {score}. I dare you.',
      'Nobody has beaten {score} yet. Be the first 🏆',
      'If you beat {score}, drop a screenshot below 👇',
      "I bet you can't get past 50 on your first try",
      "Beat my mom's score ({score}). She is getting cocky.",
    ],
    asset:
      'Screenshot your score screen: `npm run capture -- --shots 1`. The serialized "day N until someone beats me" format is algorithm gold — keep the day count honest.',
  },
  tip: {
    label: 'Tip / secret',
    emoji: '💡',
    effort: 'S',
    platforms: ['tiktok', 'youtube', 'x'],
    hooks: [
      'The trick nobody notices in {game}: watch the shadow, not the block',
      '3 mistakes every new {game} player makes',
      'How to break 100 in {game} (took me embarrassingly long to learn)',
      'Slow is smooth, smooth is fast — the {game} mantra',
      'Why counting the rhythm beats watching the block',
      'The one setting that instantly made me better at {game}',
    ],
    asset:
      'Record the exact move you are explaining (vertical), add text overlays in TikTok/CapCut. Tips get saved & shared — great for reach.',
  },
  devlog: {
    label: 'Dev log / behind the scenes',
    emoji: '🛠️',
    effort: 'M',
    platforms: ['x', 'bluesky', 'instagram'],
    hooks: [
      'Building {game} in public — what changed this week',
      'You asked, I added it. New in {game} 👀',
      "Before vs after: {game}'s glow-up",
      'The bug that made blocks float (and why I almost kept it)',
      'Solo dev life: shipped a feature nobody asked for and I love it',
      'How I make the {game} cartoons — process thread',
    ],
    asset:
      'Grab 2–3 wide screenshots: `npm run capture -- --shots 3 --preset wide`. Build-in-public posts do best on X/Bluesky — devs love following the journey.',
  },
  cartoon: {
    label: 'Cartoon / character',
    emoji: '🎨',
    effort: 'L',
    platforms: ['instagram', 'tiktok', 'facebook'],
    hooks: [
      'New {game} cartoon just dropped 🎬',
      'Meet the blocks — a {game} character intro',
      'Panel 1 of this week\'s comic. Full strip on {url}',
      'When the tower falls… (a {game} animation)',
      'Drew this instead of fixing bugs. Worth it.',
    ],
    asset:
      'Repurpose ONE cartoon 4–5 ways: full strip (IG/FB), one panel per day as teasers, a slow pan/animatic for TikTok, character card, reaction-meme crop. One cartoon = a week of posts.',
  },
  meme: {
    label: 'Meme / relatable',
    emoji: '😂',
    effort: 'S',
    platforms: ['tiktok', 'instagram', 'x'],
    hooks: [
      'Me: one quick game. The tower: {score} blocks tall. My dinner: cold.',
      "Nobody: …  {game} players: 'the block is DRIFTING'",
      'Stages of a {game} run: confidence → greed → tragedy',
      'My tower fell and I felt that physically',
      'Gamers will stack {score} blocks but won\'t do the dishes (me. I\'m gamers)',
      'The audacity of block #{score} to land like that',
    ],
    asset:
      'Screenshot a fail moment or crop a cartoon panel; add the caption as text on the image. Low effort, high relatability.',
  },
  community: {
    label: 'Community / question',
    emoji: '💬',
    effort: 'S',
    platforms: ['x', 'facebook', 'instagram'],
    hooks: [
      "What's your {game} high score? Wrong answers only.",
      'Name our new block character — best comment wins 👑',
      'Poll: {game} with sound ON or OFF?',
      'Screenshot your worst tower fail. Let\'s heal together.',
      'What should I add to {game} next? I\'m building this WITH you.',
    ],
    asset:
      'Text-first post; optional screenshot. Reply to EVERY comment in the first hour — replies double your reach on most platforms.',
  },
  milestone: {
    label: 'Milestone / leaderboard',
    emoji: '📈',
    effort: 'S',
    platforms: ['x', 'instagram', 'facebook'],
    hooks: [
      'Someone just scored {score} on {game} 🤯 new record',
      'Leaderboard update: this week\'s top stackers 🏆',
      'Small win: {game} had its best day ever yesterday. Thank you 💛',
      '{day} days of daily posts. Here\'s what happened to my little game.',
    ],
    asset:
      'Screenshot the leaderboard or a stats graph (wide + vertical crop). Gratitude posts humanize the account — post one every few weeks.',
  },
};

export const CTAS = {
  default: [
    'Play free in your browser → {url}',
    'No download, no signup. Just stack → {url}',
    'One tap to play → {url}',
    'Free to play, dangerously hard to put down → {url}',
  ],
  linkInBio: [
    'Play free — link in bio 🧱',
    'No download needed — link in bio',
    'Try to beat me — link in bio 🏆',
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
