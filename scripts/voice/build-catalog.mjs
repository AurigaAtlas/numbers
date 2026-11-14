// Lists every sentence piece the app can speak, using the app's own phrase builders.
// Usage: node scripts/voice/build-catalog.mjs   → scripts/voice/phrases.json
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const server = await createServer({ root, logLevel: "error", server: { middlewareMode: true }, appType: "custom" });
const load = (path) => server.ssrLoadModule(path);

const { say, splitSpeech, praise } = await load("/src/speech.js");
const { CONSONANTS, VOWELS, words, compose, hangulLevels } = await load("/src/hangul.js");
const { levels, praise: gamePraise } = await load("/src/data.js");
const { tiles, houseNames, personNames, robotNames, MAX_MONEY, PASS_START_REWARD, PIGGY_FEE, QUIZ_REWARD, SCHOOL_REWARD } = await load("/src/board.js");
const { initialOf, blendParts, letterSound, BLEND_FINALS } = await load("/src/hangul.js");

const pieces = new Set();
const add = (text) => {
  if (text) splitSpeech(text).forEach((piece) => pieces.add(piece));
};
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// Numbers.
for (const n of range(1, 20)) {
  add(say.counting(n));
  add(say.countAll(n));
  add(say.answerIs(n));
  add(say.orderHint(n));
  add(say.dex(n));
  add(say.prompt({ gameId: "find", answer: n }));
  add(say.prompt({ gameId: "order", sequence: [n] }));
  add(say.prompt({ gameId: "balloon", target: n }));
}
add(say.prompt({ gameId: "count" }));
add(say.prompt({ gameId: "missing" }));
for (const showNumerals of [true, false]) {
  for (const ask of ["more", "less"]) add(say.prompt({ gameId: "compare", showNumerals, ask }));
}
for (const a of range(1, 15)) {
  for (const b of range(1, 15)) {
    add(say.prompt({ gameId: "add", a, b, op: "+" }));
    if (b < a) add(say.prompt({ gameId: "add", a, b, op: "-" }));
  }
}
for (const step of [1, 2, -1, -2]) add(say.missingHint(step));
for (let streak = 3; streak <= 60; streak += 3) add(say.combo(streak));
[...praise, ...gamePraise].forEach(add);
[say.secondTryRight, say.tryAgain, say.preview, say.breakTime, say.breakOver, say.missionDone, say.countTogether, say.addHint, say.quizRight].forEach(add);
[...levels, ...hangulLevels].forEach((level) => add(say.levelUp(level.name)));

// Hangul letters, syllables and words.
for (const jamo of [...CONSONANTS, ...VOWELS]) {
  add(say.answerIs(jamo));
  add(say.dex(jamo));
  add(say.prompt({ gameId: "h-listen", mode: "jamo", answer: jamo }));
  add(say.prompt({ gameId: "h-trace", target: jamo }));
}
for (const consonant of CONSONANTS) {
  for (const vowel of VOWELS) {
    const syllable = compose(consonant, vowel);
    add(syllable);
    add(say.answerIs(syllable));
    add(say.prompt({ gameId: "h-listen", mode: "syllable", answer: syllable }));
    add(say.prompt({ gameId: "h-trace", target: syllable }));
    add(say.prompt({ gameId: "h-build", consonant, vowel }));
    add(say.buildHint(consonant, vowel));
  }
}
for (const entry of words) {
  const first = entry.word[0];
  add(entry.word);
  add(say.answerIs(entry.word));
  add(say.answerIs(first));
  add(say.slowWord(entry.word));
  add(say.prompt({ gameId: "h-listen", mode: "word", answer: entry.word }));
  add(say.prompt({ gameId: "h-trace", target: first }));
  for (const mode of ["initial", "syllable", "word"]) add(say.prompt({ gameId: "h-picture", mode, entry }));
}

// 소리 합치기: every syllable a round can aim for or end up making.
const blendVowels = "ㅏㅓㅗㅜㅣ".split("");
const blendRounds = [];
for (const consonant of CONSONANTS) {
  for (const vowel of blendVowels) {
    blendRounds.push({ gameId: "h-blend", mode: "consonant", consonant, vowel, final: null, answer: consonant });
    blendRounds.push({ gameId: "h-blend", mode: "vowel", consonant, vowel, final: null, answer: vowel });
  }
  for (const final of BLEND_FINALS) {
    blendRounds.push({ gameId: "h-blend", mode: "final", consonant, vowel: "ㅏ", final, answer: final });
  }
}
for (const round of blendRounds) {
  const parts = blendParts(round);
  const full = { ...round, target: parts.syllable };
  add(say.prompt(full));
  add(say.blend(parts));
  add(say.notThis(parts.syllable, parts.syllable));
  add(parts.base);
  add(parts.syllable);
}
CONSONANTS.forEach((c) => add(letterSound(c)));
blendVowels.forEach((v) => add(letterSound(v)));
BLEND_FINALS.forEach((f) => add(letterSound(f, true)));

// 한글 길, 글자 풍선, 글자 짝 맞추기.
const { PATH_BLEND_CONSONANTS, rowSyllables } = await load("/src/path.js");
for (const letter of [...CONSONANTS, ...VOWELS]) {
  add(say.pathMeet(letter));
  add(say.prompt({ gameId: "h-balloon", target: letter }));
}
for (const vowel of blendVowels) add(say.pathChart(rowSyllables(vowel)));
[say.pathWords, say.pathDone, say.pathAllDone].forEach(add);
for (const consonant of CONSONANTS) {
  for (const vowel of VOWELS) add(compose(consonant, vowel)); // tapped syllables, popped balloons
  for (const vowel of blendVowels) add(say.prompt({ gameId: "h-balloon", target: compose(consonant, vowel) }));
}
// A new vowel is tried out with a few easy consonants (ㄱ + ? = 갸).
for (const consonant of PATH_BLEND_CONSONANTS) {
  for (const vowel of VOWELS) {
    const round = { gameId: "h-blend", mode: "vowel", consonant, vowel, final: null, answer: vowel };
    const parts = blendParts(round);
    add(say.prompt({ ...round, target: parts.syllable }));
    add(say.blend(parts));
    add(say.notThis(parts.syllable, parts.syllable));
  }
}
for (const entry of words) {
  add(entry.word); // memory cards and word cards read the word alone
  add(entry.word[0]);
}

// 주사위 마을.
const lots = tiles.filter((t) => t.type === "lot");
const names = [...personNames, ...robotNames];
add(say.diceAsk(true));
add(say.diceAsk(false));
for (const sum of range(2, 12)) {
  add(say.diceRight(sum));
  add(say.diceWrong(sum));
  add(say.robotMove(sum));
}
for (const name of names) {
  add(say.turn(name));
  add(say.sleeping(name));
  add(say.broke(name));
  add(say.winner(name));
  for (const n of range(1, 15)) add(say.received(name, n));
  for (const tile of lots) add(say.toll(name, tile, tile.price));
}
for (const tile of lots) {
  // Landing on a village asks for its first letter.
  const entry = { word: tile.word, emoji: tile.emoji };
  for (const mode of ["initial", "syllable", "word"]) add(say.prompt({ gameId: "h-picture", mode, entry }));
  add(say.slowWord(tile.word));
  add(say.answerIs(tile.word));
  add(say.answerIs(tile.word[0]));
  add(say.answerIs(initialOf(tile.word)));
  add(say.lot(tile, initialOf(tile.word)));
  add(say.lotPrice(tile.price));
  add(say.newHouse(tile));
  add(say.homeAgain(tile, true));
  add(say.soldHouse(tile));
}
// Tolls go up to 15원 (a 5원 castle); pots and treasure can reach the money limit.
for (const n of range(1, 15)) {
  add(say.payAsk(n));
  add(say.paid(n));
  add(say.needMoney(n));
}
for (const n of range(1, MAX_MONEY)) add(say.treasure(n));
for (const n of [1, QUIZ_REWARD, SCHOOL_REWARD]) add(say.quizReward(n));
add(say.passStart(PASS_START_REWARD));
add(say.piggy(PIGGY_FEE));
[say.doubles, say.island, say.helpRobot, say.walletFull, say.gameOver, say.tie].forEach(add);
houseNames.slice(1).forEach((name) => add(say.upgraded(name)));

await server.close();
const list = [...pieces].sort((a, b) => a.localeCompare(b, "ko"));
writeFileSync(join(root, "scripts", "voice", "phrases.json"), `${JSON.stringify(list, null, 1)}\n`);
console.log(`${list.length} phrases → scripts/voice/phrases.json`);
