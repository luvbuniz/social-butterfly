import { PILLARS, CTAS, PLATFORM_RULES } from './pillars.js';
import { seededRng, pick, shuffle, randInt, daysBetween, todayStr, weekdayIndex } from './util.js';

function fillVars(template, vars) {
  return template
    .replaceAll('{game}', vars.game)
    .replaceAll('{url}', vars.url)
    .replaceAll('{score}', String(vars.score))
    .replaceAll('{day}', String(vars.day));
}

export function seriesDay(config, dateStr) {
  if (!config.series?.enabled || !config.series.startDate) return 1;
  return Math.max(1, daysBetween(config.series.startDate, dateStr) + 1);
}

/**
 * Generate the day's ideas. Deterministic: the same date always produces the
 * same ideas, so you can re-run commands all day without the plan shifting.
 * The first idea is the "headline" — today's pillar from the weekly rotation.
 */
export function generateIdeas(config, dateStr = todayStr(), count = 4) {
  const rng = seededRng(`${config.site.name}:${dateStr}`);
  const rotation = config.rotation?.length ? config.rotation : Object.keys(PILLARS);
  const headlinePillar = rotation[weekdayIndex(dateStr) % rotation.length];

  const others = shuffle(rng, Object.keys(PILLARS).filter((p) => p !== headlinePillar));
  const pillarOrder = [headlinePillar, ...others].slice(0, count);

  return pillarOrder.map((pillarKey, i) => {
    const pillar = PILLARS[pillarKey];
    const vars = {
      game: config.site.name,
      url: config.site.shortUrl || config.site.url,
      score: randInt(rng, config.scoreRange?.[0] ?? 40, config.scoreRange?.[1] ?? 180),
      day: seriesDay(config, dateStr),
    };
    const hook = fillVars(pick(rng, pillar.hooks), vars);
    const cta = fillVars(pick(rng, CTAS.default), vars);
    const ctaBio = pick(rng, CTAS.linkInBio);

    const idea = {
      id: `${dateStr}-${pillarKey}`,
      date: dateStr,
      pillar: pillarKey,
      pillarLabel: `${pillar.emoji} ${pillar.label}`,
      headline: i === 0,
      effort: pillar.effort,
      hook,
      cta,
      ctaBio,
      platforms: pillar.platforms,
      asset: fillVars(pillar.asset, vars),
      captions: {},
    };
    for (const platform of Object.keys(PLATFORM_RULES)) {
      idea.captions[platform] = buildCaption(config, idea, platform);
    }
    return idea;
  });
}

function tagsFor(config, platform, limit) {
  const core = config.hashtags?.core ?? [];
  const extra = config.hashtags?.[platform] ?? [];
  return [...core, ...extra].slice(0, limit).join(' ');
}

export function buildCaption(config, idea, platform) {
  const rules = PLATFORM_RULES[platform];
  if (!rules) return null;
  const url = config.site.url;

  if (platform === 'reddit') {
    // Reddit hates marketing-speak and hashtags. Honest title + maker context.
    const title = idea.hook.replace(/#[\w]+/g, '').trim();
    const body =
      `I'm a parent and the solo dev behind ${config.site.name} — a math game where kids ` +
      `build 3D worlds by solving problems (the math is the way you earn blocks). ` +
      `Free to play on tablets via the site; Google Play version on the way.\n\n` +
      `${url}\n\nWould genuinely love feedback from other parents (be brutal).`;
    return {
      title,
      body,
      communities: config.redditCommunities ?? [],
      note: 'Read each sub\'s self-promo rules first. Post as yourself, reply to every comment, and don\'t post the same thing to many subs on the same day.',
    };
  }

  const tags = tagsFor(config, platform, rules.tags);
  const link = rules.linkInBio ? idea.ctaBio : idea.cta.includes(url) ? idea.cta : `${idea.cta}`;
  let text = `${idea.hook}\n\n${rules.linkInBio ? idea.ctaBio : idea.cta}${tags ? `\n\n${tags}` : ''}`;

  if (rules.titled) {
    // YouTube Shorts: separate title + description.
    const title = idea.hook.slice(0, rules.titleMax);
    const description = `${idea.cta}\n\n${tags}`;
    return { title, description };
  }

  if (text.length > rules.maxLen) {
    // Trim hashtags first, then the hook.
    text = `${idea.hook}\n\n${rules.linkInBio ? idea.ctaBio : idea.cta}`;
    if (text.length > rules.maxLen) {
      const room = rules.maxLen - (rules.linkInBio ? idea.ctaBio : idea.cta).length - 3;
      text = `${idea.hook.slice(0, room)}…\n${rules.linkInBio ? idea.ctaBio : idea.cta}`;
    }
  }
  return { text };
}

// --- CLI rendering ---

export function renderIdeas(config, ideas, { full = false } = {}) {
  const lines = [];
  const d = ideas[0]?.date;
  lines.push('');
  lines.push(`🦋 social-butterfly — content ideas for ${d}`);
  lines.push('═'.repeat(56));
  for (const idea of ideas) {
    lines.push('');
    lines.push(
      `${idea.headline ? '⭐ TODAY\'S POST' : '   backup idea'} · ${idea.pillarLabel} · effort ${idea.effort}`
    );
    lines.push(`   ${idea.hook}`);
    lines.push(`   platforms: ${idea.platforms.join(', ')}`);
    lines.push(`   asset: ${idea.asset}`);
    if (full) {
      for (const [platform, cap] of Object.entries(idea.captions)) {
        if (!idea.platforms.includes(platform) && platform !== 'reddit') continue;
        lines.push('');
        lines.push(`   ── ${platform} ${'─'.repeat(Math.max(1, 40 - platform.length))}`);
        if (cap.title !== undefined && cap.description !== undefined) {
          lines.push(`   title: ${cap.title}`);
          lines.push(indent(cap.description));
        } else if (cap.title !== undefined) {
          lines.push(`   title: ${cap.title}`);
          lines.push(indent(cap.body));
          lines.push(`   suggested subs: ${cap.communities.join(', ')}`);
          lines.push(`   ⚠ ${cap.note}`);
        } else {
          lines.push(indent(cap.text));
        }
      }
    }
  }
  lines.push('');
  lines.push('─'.repeat(56));
  lines.push('next: `npm run pack` writes today\'s captions to files ·');
  lines.push('      `npm run due` shows the queue · add --full for all captions');
  lines.push('');
  return lines.join('\n');
}

function indent(text) {
  return text
    .split('\n')
    .map((l) => `   ${l}`)
    .join('\n');
}
