import { pickWeighted } from "./learning";
import { josa, shuffle } from "./rounds";

export const CONSONANTS = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split("");
export const VOWELS = "ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ".split("");
const BASIC_VOWELS = "ㅏㅓㅗㅜㅣ".split("");

// Unicode tables for composing/decomposing syllables.
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");
const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");

const consonantNames = {
  ㄱ: "기역", ㄴ: "니은", ㄷ: "디귿", ㄹ: "리을", ㅁ: "미음", ㅂ: "비읍", ㅅ: "시옷",
  ㅇ: "이응", ㅈ: "지읒", ㅊ: "치읓", ㅋ: "키읔", ㅌ: "티읕", ㅍ: "피읖", ㅎ: "히읗",
  ㄲ: "쌍기역", ㄸ: "쌍디귿", ㅃ: "쌍비읍", ㅆ: "쌍시옷", ㅉ: "쌍지읒"
};
const vowelNames = {
  ㅏ: "아", ㅑ: "야", ㅓ: "어", ㅕ: "여", ㅗ: "오", ㅛ: "요", ㅜ: "우", ㅠ: "유", ㅡ: "으", ㅣ: "이"
};

export const words = [
  ["기차", "🚂"], ["고양이", "🐱"], ["거북이", "🐢"], ["개", "🐶"], ["고래", "🐳"],
  ["나비", "🦋"], ["나무", "🌳"], ["너구리", "🦝"], ["낙타", "🐪"], ["눈사람", "⛄"],
  ["다람쥐", "🐿️"], ["도토리", "🌰"], ["달", "🌙"], ["돼지", "🐷"], ["드럼", "🥁"],
  ["라면", "🍜"], ["레몬", "🍋"], ["로봇", "🤖"], ["라디오", "📻"], ["리본", "🎀"],
  ["모자", "👒"], ["무지개", "🌈"], ["말", "🐴"], ["물고기", "🐟"], ["멜론", "🍈"],
  ["바나나", "🍌"], ["비행기", "✈️"], ["버스", "🚌"], ["별", "⭐"], ["부엉이", "🦉"],
  ["사과", "🍎"], ["사자", "🦁"], ["소", "🐮"], ["수박", "🍉"], ["시계", "⏰"],
  ["오리", "🦆"], ["우유", "🥛"], ["아기", "👶"], ["여우", "🦊"], ["양", "🐑"],
  ["자동차", "🚗"], ["지구", "🌍"], ["자전거", "🚲"], ["주스", "🧃"], ["장갑", "🧤"],
  ["치즈", "🧀"], ["축구공", "⚽"], ["칫솔", "🪥"], ["촛불", "🕯️"], ["치마", "👗"],
  ["케이크", "🍰"], ["코끼리", "🐘"], ["키위", "🥝"], ["쿠키", "🍪"], ["코알라", "🐨"],
  ["토끼", "🐰"], ["토마토", "🍅"], ["택시", "🚕"], ["튤립", "🌷"], ["트럭", "🚚"],
  ["포도", "🍇"], ["피자", "🍕"], ["펭귄", "🐧"], ["피아노", "🎹"], ["팝콘", "🍿"],
  ["하마", "🦛"], ["호랑이", "🐯"], ["해", "☀️"], ["햄버거", "🍔"], ["하트", "❤️"]
].map(([word, emoji]) => ({ word, emoji }));

export const hangulLevels = [
  {
    id: 1,
    name: "자음 하나",
    perk: "ㄱ부터 ㅅ까지 자음을 배워요",
    goal: 10,
    options: 3,
    consonants: CONSONANTS.slice(0, 7),
    listen: "consonant",
    picture: "initial",
    buildVowels: ["ㅏ"],
    trace: "consonant"
  },
  {
    id: 2,
    name: "자음 둘",
    perk: "ㅇ부터 ㅎ까지, 자음 14개를 모두 만나요",
    goal: 15,
    options: 4,
    consonants: CONSONANTS,
    listen: "consonant",
    picture: "initial",
    buildVowels: ["ㅏ"],
    trace: "consonant"
  },
  {
    id: 3,
    name: "모음",
    perk: "ㅏ ㅑ ㅓ ㅕ… 모음 친구들을 배워요",
    goal: 20,
    options: 4,
    consonants: CONSONANTS,
    listen: "vowel",
    picture: "initial",
    buildVowels: BASIC_VOWELS,
    trace: "vowel"
  },
  {
    id: 4,
    name: "글자",
    perk: "자음과 모음을 합쳐서 글자를 읽어요",
    goal: 25,
    options: 4,
    consonants: CONSONANTS,
    listen: "syllable",
    picture: "syllable",
    buildVowels: VOWELS,
    trace: "syllable"
  },
  {
    id: 5,
    name: "낱말",
    perk: "그림을 보고 낱말을 읽어요. 최고 단계예요!",
    goal: null,
    options: 4,
    consonants: CONSONANTS,
    listen: "word",
    picture: "word",
    buildVowels: VOWELS,
    trace: "word"
  }
];

export function compose(consonant, vowel) {
  return String.fromCharCode(0xac00 + (CHO.indexOf(consonant) * 21 + JUNG.indexOf(vowel)) * 28);
}

export function initialOf(text) {
  const code = text.charCodeAt(0) - 0xac00;
  return CHO[Math.floor(code / 588)];
}

export function isJamo(text) {
  return CONSONANTS.includes(text) || VOWELS.includes(text);
}

// What the voice says for a letter: jamo by name, syllables and words as written.
export function spokenForm(text) {
  return consonantNames[text] ?? vowelNames[text] ?? text;
}

export function letterName(text) {
  return consonantNames[text] ?? vowelNames[text] ?? null;
}

// Stable colour per letter, reusing the number palette: jamo by their order,
// syllables and words by their first character so neighbouring options differ.
export function letterTone(text) {
  if (CONSONANTS.includes(text)) return `n-${(CONSONANTS.indexOf(text) % 10) + 1}`;
  if (VOWELS.includes(text)) return `n-${((VOWELS.indexOf(text) + 3) % 10) + 1}`;
  return `n-${(text.charCodeAt(0) % 10) + 1}`;
}

export function exampleWord(jamo) {
  if (CONSONANTS.includes(jamo)) return words.find((entry) => initialOf(entry.word) === jamo);
  return null;
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function withDistractors(answer, pool, count) {
  const others = shuffle([...new Set(pool)].filter((value) => value !== answer)).slice(0, count - 1);
  return shuffle([answer, ...others]);
}

// Syllables that differ from `syllable` by one part: same consonant or same vowel.
function similarSyllables(consonant, vowel, level) {
  const vowels = level.buildVowels.length > 1 ? level.buildVowels : BASIC_VOWELS;
  return shuffle([
    ...level.consonants.filter((c) => c !== consonant).map((c) => compose(c, vowel)),
    ...vowels.filter((v) => v !== vowel).map((v) => compose(consonant, v))
  ]);
}

function wordsFor(level) {
  return words.filter((entry) => level.consonants.includes(initialOf(entry.word)));
}

export function makeHangulRound(gameId, level, mastery = {}) {
  const koKey = (text) => `ko:${text}`;
  const weighted = (pool) => pickWeighted(pool, koKey, mastery);
  const base = { id: `${Date.now()}-${Math.random()}`, gameId, level: level.id, feedback: null };

  if (gameId === "h-listen") {
    if (level.listen === "consonant") {
      const answer = weighted(level.consonants);
      return { ...base, mode: "jamo", answer, options: withDistractors(answer, level.consonants, level.options) };
    }
    if (level.listen === "vowel") {
      const answer = weighted(VOWELS);
      return { ...base, mode: "jamo", answer, options: withDistractors(answer, VOWELS, level.options) };
    }
    if (level.listen === "syllable") {
      const consonant = weighted(level.consonants);
      const vowel = pick(BASIC_VOWELS);
      const answer = compose(consonant, vowel);
      return { ...base, mode: "syllable", answer, options: withDistractors(answer, similarSyllables(consonant, vowel, level), level.options) };
    }
    const entry = pick(words);
    return { ...base, mode: "word", answer: entry.word, options: withDistractors(entry.word, words.map((w) => w.word), level.options) };
  }

  if (gameId === "h-picture") {
    const pool = wordsFor(level);
    // Pick the starting consonant first so weak consonants come up more often.
    const initials = [...new Set(pool.map((w) => initialOf(w.word)))];
    const initial = level.picture === "initial" ? weighted(initials) : pick(initials);
    const entry = pick(pool.filter((w) => initialOf(w.word) === initial));
    if (level.picture === "initial") {
      const answer = initialOf(entry.word);
      return { ...base, mode: "initial", entry, answer, options: withDistractors(answer, level.consonants, level.options) };
    }
    if (level.picture === "syllable") {
      const answer = entry.word[0];
      const consonant = initialOf(answer);
      const vowel = JUNG[Math.floor(((answer.charCodeAt(0) - 0xac00) % 588) / 28)];
      const hasFinal = (answer.charCodeAt(0) - 0xac00) % 28 !== 0;
      const pool2 = hasFinal
        ? words.map((w) => w.word[0])
        : similarSyllables(consonant, VOWELS.includes(vowel) ? vowel : "ㅏ", level);
      return { ...base, mode: "syllable", entry, answer, options: withDistractors(answer, pool2, level.options) };
    }
    return { ...base, mode: "word", entry, answer: entry.word, options: withDistractors(entry.word, words.map((w) => w.word), level.options) };
  }

  if (gameId === "h-build") {
    const consonant = weighted(level.consonants);
    const vowel = pick(level.buildVowels);
    const answer = compose(consonant, vowel);
    return {
      ...base,
      consonant,
      vowel,
      answer,
      options: withDistractors(answer, similarSyllables(consonant, vowel, level), level.options)
    };
  }

  if (gameId === "h-trace") {
    let target;
    if (level.trace === "consonant") target = weighted(level.consonants);
    else if (level.trace === "vowel") target = weighted(VOWELS);
    else if (level.trace === "syllable") target = compose(pick(level.consonants), pick(BASIC_VOWELS));
    else target = pick(words).word[0];
    return { ...base, target, example: exampleWord(target) ?? words.find((w) => w.word[0] === target) ?? null };
  }

  return base;
}

export function hangulPrompt(round) {
  switch (round.gameId) {
    case "h-listen":
      if (round.mode === "jamo") return `${josa(spokenForm(round.answer), "을", "를")} 찾아주세요.`;
      return `${josa(round.answer, "을", "를")} 찾아주세요.`;
    case "h-picture":
      if (round.mode === "initial") return `${round.entry.word}. 어떤 자음으로 시작할까요?`;
      if (round.mode === "syllable") return `${round.entry.word}. 첫 글자는 뭘까요?`;
      return "이건 뭘까요?";
    case "h-build":
      return `${spokenForm(round.consonant)}하고 ${josa(spokenForm(round.vowel), "을", "를")} 합치면 어떤 글자가 될까요?`;
    case "h-trace": {
      const name = letterName(round.target);
      return name ? `${name}. 손가락으로 따라 써볼까요?` : `${round.target}. 손가락으로 따라 써볼까요?`;
    }
    default:
      return null;
  }
}

// Hangul answers are spoken by name ("기역") or as written ("나비").
