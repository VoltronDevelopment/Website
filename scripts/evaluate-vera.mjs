import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { isDeepStrictEqual } from 'node:util';

const preview = new URL(process.argv[2] || 'http://localhost:3043');
if (!['http:', 'https:'].includes(preview.protocol) ||
    !['localhost', '127.0.0.1'].includes(preview.hostname) ||
    preview.username || preview.password) {
  throw new Error('Vera evaluation requires a local preview.');
}

const fixturePath = process.argv[3] || 'tests/fixtures/vera-multiturn.json';
const suite = JSON.parse((await readFile(fixturePath, 'utf8')).replace(/^\uFEFF/, ''));
const requested = process.argv.slice(5);
const fixtures = requested.length ? suite.filter(scenario => requested.includes(scenario.id)) : suite;
if (requested.some(id => !fixtures.some(scenario => scenario.id === id))) {
  throw new Error('One or more requested scenario IDs are missing from the fixture file.');
}
const release = JSON.parse(await readFile('lib/vectra/published.json', 'utf8'));
const evidence = new Map(release.map(source => [source.id, source]));
const fixtureHash = createHash('sha256').update(JSON.stringify(fixtures)).digest('hex');
const startedAt = new Date().toISOString();
const output = process.argv[4] || 'data/vera-evaluation/' + startedAt.replace(/[:.]/g, '-');
const endpoint = new URL('/api/vectra', preview);
const planned = fixtures.reduce((sum, scenario) => sum + scenario.turns.length, 0);

if (!fixtures.length || new Set(fixtures.map(scenario => scenario.id)).size !== fixtures.length ||
    fixtures.some(scenario => !/^[A-Za-z0-9-]+$/.test(scenario.id) ||
      scenario.turns.length === 0 || scenario.turns.length > 24)) {
  throw new Error('Expected unique fixture IDs and 1–24 turns per scenario.');
}
await mkdir(output, { recursive: true });

function request(headers, method = 'GET', body) {
  return fetch(endpoint, {
    method, headers, body, redirect: 'error', signal: AbortSignal.timeout(60_000),
  });
}

async function sendTurn(headers, body) {
  let response = await request(headers, 'POST', body);
  let data = await response.json();
  let rateWaitMs = 0;
  if (response.status === 429 && data.message === 'Please wait a minute before sending another message.') {
    // Keep the same guest and message ID, and honor the API's minute window.
    const timestamp = Date.parse(response.headers.get('date')) || Date.now();
    rateWaitMs = 60_000 - timestamp % 60_000 + 250;
    await delay(rateWaitMs);
    response = await request(headers, 'POST', body);
    data = await response.json();
  }
  return { response, data, rateWaitMs };
}

function checkpoints(rules, reply) {
  const checks = {};
  const text = [reply.text, reply.enquirySummary].join(' ').toLowerCase();
  if (rules?.includes) {
    for (const anchor of rules.includes) checks['includes ' + anchor] = text.includes(anchor.toLowerCase());
  }
  for (const anchor of rules?.excludes || []) {
    checks['excludes ' + anchor] = !text.includes(anchor.toLowerCase());
  }
  for (const word of rules?.excludesWords || []) {
    const words = text.match(/[\p{L}\p{N}]+/gu) || [];
    checks['excludes word ' + word] = !words.includes(word.toLowerCase());
  }
  if (rules?.maxWords !== undefined) {
    checks.wordLimit = reply.text.trim().split(/\s+/).length <= rules.maxWords;
  }
  if (rules?.maxLines !== undefined) {
    checks.lineLimit = reply.text.trim().split(/\r?\n/).length <= rules.maxLines;
  }
  if (rules?.enquiry !== undefined) checks.enquiry = reply.enquiry === rules.enquiry;
  return checks;
}

async function evaluate(scenario, index) {
  const record = { id: scenario.id, title: scenario.title, expect: scenario.expect, turns: [] };
  // Separate synthetic guests on the local server, without touching production traffic.
  const headers = {
    origin: preview.origin, 'content-type': 'application/json',
    'x-forwarded-for': '192.0.2.' + (30 + index),
  };
  try {
    const opened = await request(headers);
    if (!opened.ok) throw new Error('Opening guest session returned HTTP ' + opened.status);
    headers.cookie = opened.headers.get('set-cookie')?.split(';')[0];
    if (!headers.cookie) throw new Error('Guest session cookie missing');

    for (const [index, question] of scenario.turns.entries()) {
      const id = randomUUID();
      const start = performance.now();
      const { response, data, rateWaitMs } = await sendTurn(headers, JSON.stringify({ id, message: question }));
      const reply = data.turns?.at(-1)?.reply;
      const turn = {
        question, id, status: response.status, ms: Math.round(performance.now() - start),
        rateWaitMs, timing: response.headers.get('server-timing'), reply, checks: { persisted: false }, checkpoints: {},
      };
      record.turns.push(turn);
      if (!response.ok || !reply) {
        turn.error = data.message || 'Reply missing';
        break;
      }

      const persistedResponse = await request(headers);
      const persisted = await persistedResponse.json();
      turn.checks = {
        persisted: persistedResponse.ok && isDeepStrictEqual(persisted.turns, data.turns),
        historyLength: data.turns.length === index + 1,
        identity: data.turns.at(-1).id === id && data.turns.at(-1).question === question,
        englishScript: ![...reply.text, ...(reply.enquirySummary || '')]
          .some(character => /\p{L}/u.test(character) && !/\p{Script=Latin}/u.test(character)),
        sources: reply.sources.every(source => evidence.get(source.id)?.href === source.href),
        nonempty: !!reply.text.trim(),
      };
      turn.checkpoints = checkpoints(scenario.checks?.find(rule => rule.turn === index + 1), reply);
    }
  } catch (error) {
    record.error = error.name + ': ' + error.message;
  } finally {
    if (headers.cookie) await request(headers, 'DELETE').catch(() => {});
    await writeFile(output + '/' + scenario.id + '.json', JSON.stringify(record, null, 2));
  }
  return record;
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < fixtures.length) {
    const index = cursor++;
    const result = await evaluate(fixtures[index], index);
    results.push(result);
    console.log(result.id, result.turns.length + '/' + fixtures[index].turns.length, result.error || '');
  }
}
await Promise.all([worker(), worker()]);
results.sort((a, b) => a.id.localeCompare(b.id));

const turns = results.flatMap(record => record.turns);
const completed = turns.filter(turn => turn.status === 200 && turn.reply);
const timings = completed.map(turn => turn.ms - turn.rateWaitMs).sort((a, b) => a - b);
const summary = {
  planned, completed: completed.length,
  mechanicalFailures: planned - completed.length +
    completed.filter(turn => Object.values(turn.checks).includes(false)).length,
  failedCheckpoints: completed.flatMap(turn => Object.values(turn.checkpoints)).filter(value => !value).length,
  rateWaits: turns.filter(turn => turn.rateWaitMs).length,
  p50Ms: timings[Math.ceil(timings.length * .5) - 1] ?? null,
  p95Ms: timings[Math.ceil(timings.length * .95) - 1] ?? null,
};
await writeFile(output + '/results.json', JSON.stringify({ startedAt, fixturePath, fixtureHash, summary, results }, null, 2));
console.log(JSON.stringify({ output, ...summary }));
if (summary.mechanicalFailures || summary.failedCheckpoints || results.some(result => result.error)) {
  process.exitCode = 1;
}
