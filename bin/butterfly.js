#!/usr/bin/env node
import { parseArgs } from 'node:util';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, todayStr, ROOT, readSecrets } from '../src/util.js';

const HELP = `
🦋 social-butterfly — content toolkit for stackadoo.com

  ideas     generate today's content ideas + captions
              --count N     how many ideas (default 4)
              --date  D     YYYY-MM-DD (default today)
              --full        print every platform caption
              --json        machine-readable output
              --claude      punch up captions with Claude (needs ANTHROPIC_API_KEY)
  plan      fill the posting queue from the weekly rotation
              --days N      how many days (default 7)
              --start D     first date (default today)
  due       what to post today (+ streak)
              --date D
  done ID   mark a queue item posted (ID from \`due\`, date prefix is enough)
  pack      write today's captions, share links & latest media to content/packs/DATE
              --date D
  capture   screenshot/record the site with a real browser
              --url URL       default: site url from config ("demo" = bundled demo page)
              --preset P      vertical | wide | square (default vertical)
              --shots N       screenshots to take (default 3)
              --every S       seconds between shots (default 2)
              --record S      also record S seconds of video (default 0)
              --scroll        auto-scroll the page while capturing
              --wait S        seconds to wait after load (default 3)
              --full-page     make the first screenshot full-page
              --auto          press Play, type a username, answer math questions
                              (scripted steps: capture.steps in butterfly.config.json)
              --headed        open a visible browser window so YOU play while it films
  export    write the queue as CSV (content/queue-export.csv)
  app       open the point-and-click dashboard in your browser (npm start)
  help      this text

daily flow:  npm run due  →  npm run capture -- --record 20  →  npm run pack
             → post (packs folder has everything) → node bin/butterfly.js done <id>
`;

const [, , command, ...rest] = process.argv;
const config = loadConfig();

const opts = {
  count: { type: 'string' },
  date: { type: 'string' },
  days: { type: 'string' },
  start: { type: 'string' },
  url: { type: 'string' },
  preset: { type: 'string' },
  shots: { type: 'string' },
  every: { type: 'string' },
  record: { type: 'string' },
  wait: { type: 'string' },
  scroll: { type: 'boolean' },
  auto: { type: 'boolean' },
  headed: { type: 'boolean' },
  'full-page': { type: 'boolean' },
  full: { type: 'boolean' },
  json: { type: 'boolean' },
  claude: { type: 'boolean' },
};
const { values, positionals } = parseArgs({ args: rest, options: opts, allowPositionals: true });

try {
  switch (command) {
    case 'ideas': {
      const { generateIdeas, renderIdeas } = await import('../src/ideas.js');
      let ideas = generateIdeas(config, values.date ?? todayStr(), Number(values.count ?? 4));
      if (values.claude) {
        const { punchUp } = await import('../src/claude.js');
        try {
          ideas = await punchUp(ideas);
          console.log('✨ captions punched up by Claude');
        } catch (err) {
          const hint = err?.status === 401 ? ' (set ANTHROPIC_API_KEY)' : '';
          console.error(`⚠ Claude punch-up skipped: ${err.message}${hint}`);
        }
      }
      console.log(values.json ? JSON.stringify(ideas, null, 2) : renderIdeas(config, ideas, { full: values.full }));
      break;
    }
    case 'plan': {
      const { buildPlan, renderPlan } = await import('../src/plan.js');
      const { queue, added } = buildPlan(config, {
        days: Number(values.days ?? 7),
        start: values.start ?? todayStr(),
      });
      console.log(renderPlan(queue, { added }));
      break;
    }
    case 'due': {
      const { loadQueue, renderDue } = await import('../src/plan.js');
      console.log(renderDue(config, loadQueue(), values.date ?? todayStr()));
      break;
    }
    case 'done': {
      const { markDone, loadQueue, streak } = await import('../src/plan.js');
      const id = positionals[0];
      if (!id) throw new Error('usage: butterfly done <id>');
      const item = markDone(id);
      if (!item) throw new Error(`no queue item matching "${id}"`);
      console.log(`✅ marked posted: ${item.id}`);
      console.log(`🔥 streak: ${streak(loadQueue())} day(s)`);
      break;
    }
    case 'pack': {
      const { buildPack } = await import('../src/pack.js');
      const { dir, written } = buildPack(config, values.date ?? todayStr());
      console.log(`📦 post pack ready: ${path.relative(ROOT, dir)}`);
      for (const f of written) console.log(`   ${path.relative(ROOT, f)}`);
      console.log('\nopen the links.md file for one-click share links.');
      break;
    }
    case 'capture': {
      const { capture } = await import('../src/capture.js');
      let url = values.url ?? config.site.url;
      if (url === 'demo') url = pathToFileURL(path.join(ROOT, 'demo/index.html')).href;
      await capture({
        url,
        preset: values.preset ?? config.capture?.defaultPreset ?? 'vertical',
        shots: Number(values.shots ?? 3),
        every: Number(values.every ?? 2),
        record: Number(values.record ?? 0),
        scroll: Boolean(values.scroll),
        wait: Number(values.wait ?? 3),
        fullPage: Boolean(values['full-page']),
        outDir: config.capture?.outDir,
        auto: Boolean(values.auto),
        headed: Boolean(values.headed),
        steps: config.capture?.steps ?? [],
        username: config.capture?.username ?? '',
        login: readSecrets().login ?? null,
      });
      break;
    }
    case 'export': {
      const { exportCsv } = await import('../src/pack.js');
      console.log(`📄 wrote ${path.relative(ROOT, exportCsv(config))}`);
      break;
    }
    case 'app': {
      const { startApp } = await import('../src/server.js');
      startApp({ open: !values.json });
      break;
    }
    case 'help':
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(`unknown command: ${command}`);
      console.log(HELP);
      process.exitCode = 1;
  }
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exitCode = 1;
}
