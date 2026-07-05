import { loadConfig } from './util.js';

/**
 * Optional: punch up the day's captions with Claude. Requires
 * ANTHROPIC_API_KEY (or an `ant auth login` profile). Everything else in
 * social-butterfly works offline — this is seasoning, not the meal.
 */
export async function punchUp(ideas) {
  const config = loadConfig();
  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch {
    throw new Error('Claude SDK not installed — run `npm install` first.');
  }

  const client = new Anthropic();
  const model = config.claude?.model ?? 'claude-opus-4-8';

  const payload = ideas.map((i) => ({
    id: i.id,
    pillar: i.pillar,
    hook: i.hook,
    captions: {
      tiktok: i.captions.tiktok?.text,
      x: i.captions.x?.text,
      instagram: i.captions.instagram?.text,
    },
  }));

  const prompt = [
    `You are the social media voice of ${config.site.name} (${config.site.url}), an indie browser stacking game.`,
    'Voice: playful, a little self-deprecating, confident but never corporate. No engagement-bait phrases like "smash that like button".',
    'Rewrite each caption to be punchier while keeping: the URL/link-in-bio line, hashtags, and the X caption under 275 characters.',
    'Return STRICT JSON: an array of {id, captions: {tiktok, x, instagram}}. No commentary, no markdown fences.',
    '',
    JSON.stringify(payload, null, 2),
  ].join('\n');

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '[]';
  let rewrites;
  try {
    rewrites = JSON.parse(text.replace(/^```(json)?|```$/gm, '').trim());
  } catch {
    throw new Error('Claude returned unparseable output — keeping original captions.');
  }

  for (const rw of rewrites) {
    const idea = ideas.find((i) => i.id === rw.id);
    if (!idea) continue;
    for (const p of ['tiktok', 'x', 'instagram']) {
      if (rw.captions?.[p] && idea.captions[p]?.text) {
        if (p === 'x' && rw.captions[p].length > 280) continue;
        idea.captions[p].text = rw.captions[p];
      }
    }
  }
  return ideas;
}
