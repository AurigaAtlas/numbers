// Plays thousands of random rounds of every game, level and 한글 길 lesson and reports
// any line the app would say that has no recorded clip (it would fall back to the
// device voice). Usage: node scripts/voice/check-coverage.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const server = await createServer({ root, logLevel: "error", server: { middlewareMode: true }, appType: "custom" });
const load = (p) => server.ssrLoadModule(p);
const { say, splitSpeech, praise } = await load("/src/speech.js");
const { makeRound, sinoWord } = await load("/src/rounds.js");
const { makeHangulRound, hangulLevels, blendParts, spokenForm } = await load("/src/hangul.js");
const { levels, gameCards, hangulGameCards } = await load("/src/data.js");
const { pathLessons, buildSteps, rowSyllables } = await load("/src/path.js");
const clips = JSON.parse(readFileSync(`${root}/public/voice/manifest.json`, "utf8")).clips;
const missing = new Map();
const check = (text, where) => { if (!text) return; for (const part of splitSpeech(text)) if (!clips[part] && !missing.has(part)) missing.set(part, `${where}: ${text}`); };
const answerOf = (r) => (r.gameId.startsWith("h-") ? r.answer : ["find", "count", "missing", "add"].includes(r.gameId) ? r.answer : r.gameId === "order" ? r.next : undefined);
function roundLines(r, where) {
  check(say.prompt(r), where);
  const a = answerOf(r);
  if (a !== undefined) check(say.answerIs(a), where);
  if (r.gameId === "missing") check(say.missingHint(r.sequence[1] - r.sequence[0]), where);
  if (r.gameId === "order") r.sequence.forEach((n) => check(say.orderHint(n), where));
  if (r.gameId === "count" || r.gameId === "add") for (let n = 1; n <= (r.count ?? r.answer); n++) { check(say.counting(n), where); check(say.countAll(n), where); }
  if (r.gameId === "h-picture") check(say.slowWord(r.entry.word), where);
  if (r.gameId === "h-build") check(say.buildHint(r.consonant, r.vowel), where);
  if (r.gameId === "h-blend") for (const o of r.options) { const made = blendParts(r, o); check(say.blend(made), where); check(say.notThis(made.syllable, r.target), where); check(blendParts(r).base, where); check(r.target, where); }
  if (r.gameId === "h-balloon") r.balloons.forEach((b) => check(spokenForm(b.value), where));
  if (r.gameId === "h-memory") r.cards.forEach((c) => check(c.say, where));
}
let rounds = 0;
for (const level of levels) for (const game of gameCards) for (let i = 0; i < 400; i++) { roundLines(makeRound(game.id, level), `${game.id} L${level.id}`); rounds++; }
for (const level of hangulLevels) for (const game of hangulGameCards) for (let i = 0; i < 400; i++) { roundLines(makeHangulRound(game.id, level), `${game.id} L${level.id}`); rounds++; }
for (const lesson of pathLessons) for (let i = 0; i < 40; i++) for (const step of buildSteps(lesson)) {
  if (step.round) { roundLines(step.round, `path ${lesson.id}`); rounds++; }
  if (step.type === "meet") check(say.pathMeet(step.letter), `path ${lesson.id}`);
  if (step.type === "chart") { check(say.pathChart(rowSyllables(step.vowel)), `path ${lesson.id}`); rowSyllables(step.vowel).forEach((s) => check(s, "chart")); }
  if (step.type === "words") step.entries.forEach((e) => check(e.word, "words"));
}
for (let streak = 3; streak <= 60; streak += 3) check(say.combo(streak), "combo");
[...praise, say.secondTryRight, say.tryAgain, say.preview, say.breakTime, say.breakOver, say.missionDone, say.pathDone, say.pathAllDone, say.pathWords, say.reviewDone].forEach((t) => check(t, "fixed"));
[...levels, ...hangulLevels].forEach((l) => check(say.levelUp(l.name), "levelUp"));
for (let n = 1; n <= 20; n++) { check(say.dex(n), "dex"); check(sinoWord(n), "dex"); }
console.log(rounds, "random rounds;", missing.size, "pieces without a recording");
for (const [part, where] of missing) console.log(`  "${part}"   ← ${where}`);
await server.close();
process.exit(missing.size ? 1 : 0);
