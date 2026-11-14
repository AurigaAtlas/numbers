// 한글 길: Hangul in order. Consonants, then vowels, then reading syllables and words,
// one short lesson at a time. Each lesson is a list of steps built here and played by Path.jsx.
import {
  CONSONANTS,
  VOWELS,
  compose,
  exampleWord,
  initialOf,
  letterName,
  withDistractors,
  words
} from "./hangul";
import { shuffle } from "./rounds";

const ROW_VOWELS = "ㅏㅓㅗㅜㅣ".split("");
// Consonants used to try a new vowel out: their sounds are easy to tell apart.
export const PATH_BLEND_CONSONANTS = "ㄱㄴㅁㅅ".split("");

const consonantGroups = [["ㄱ", "ㄴ", "ㄷ", "ㄹ"], ["ㅁ", "ㅂ", "ㅅ"], ["ㅇ", "ㅈ", "ㅊ", "ㅋ"], ["ㅌ", "ㅍ", "ㅎ"]];
const vowelGroups = [["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ"], ["ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ"]];
// Words made only of the basic letters, with no 받침: the first ones a child can sound out.
const wordGroups = [
  ["나비", "나무", "모자", "사자", "오리"],
  ["우유", "포도", "피자", "하마", "치즈"],
  ["기차", "아기", "여우", "지구", "버스"],
  ["바나나", "도토리", "토마토", "라디오", "너구리"]
];

const letterLesson = (letter) => ({ id: `ko:${letter}`, kind: "letter", letter, label: letter, title: `${letter} ${letterName(letter)}` });
const reviewLesson = (id, letters) => ({ id: `review:${id}`, kind: "review", letters, label: "복습", title: `${letters.join(" ")} 복습` });

export const pathUnits = [
  ...consonantGroups.map((letters, index) => ({
    id: `c${index + 1}`,
    title: `자음 ${letters.join(" ")}`,
    lessons: [...letters.map(letterLesson), reviewLesson(`c${index + 1}`, letters)]
  })),
  ...vowelGroups.map((letters, index) => ({
    id: `v${index + 1}`,
    title: `모음 ${letters.join(" ")}`,
    lessons: [...letters.map(letterLesson), reviewLesson(`v${index + 1}`, letters)]
  })),
  {
    id: "s1",
    title: "글자 읽기 가 거 고 구 기",
    lessons: [
      ...ROW_VOWELS.map((vowel) => ({
        id: `row:${vowel}`,
        kind: "row",
        vowel,
        label: compose("ㄱ", vowel),
        title: `${compose("ㄱ", vowel)} ${compose("ㄴ", vowel)} ${compose("ㄷ", vowel)} 읽기`
      })),
      { id: "review:s1", kind: "rowReview", label: "복습", title: "글자 읽기 복습" }
    ]
  },
  {
    id: "w1",
    title: "낱말 읽기",
    lessons: wordGroups.map((group, index) => ({
      id: `words:${index + 1}`,
      kind: "words",
      words: group,
      label: group[0],
      title: `낱말 읽기 ${index + 1}`
    }))
  }
];

export const pathLessons = pathUnits.flatMap((unit) => unit.lessons);

// The first lesson without a star is the one to do next; earlier ones can be replayed.
export function nextLessonIndex(stars = {}) {
  const index = pathLessons.findIndex((lesson) => !stars[lesson.id]);
  return index === -1 ? pathLessons.length : index;
}

export function lessonReward(lesson) {
  return lesson.kind === "letter" ? 12 : 18;
}

export function vowelWord(vowel) {
  return words.find((entry) => entry.word[0] === compose("ㅇ", vowel)) ?? null;
}

export function examplesFor(letter) {
  if (CONSONANTS.includes(letter)) return words.filter((entry) => initialOf(entry.word) === letter).slice(0, 3);
  const word = vowelWord(letter);
  return word ? [word] : [];
}

export function rowSyllables(vowel) {
  return CONSONANTS.map((consonant) => compose(consonant, vowel));
}

// ---------------------------------------------------------------- steps

const pick = (values) => values[Math.floor(Math.random() * values.length)];
const entryOf = (word) => words.find((entry) => entry.word === word);
const question = (gameId, extra) => ({
  type: "quiz",
  round: { id: `${Date.now()}-${Math.random()}`, gameId, level: 0, feedback: null, eliminated: [], ...extra }
});
// Three choices while only a few letters are known, four after that.
const choices = (answer, pool) => withDistractors(answer, pool, new Set(pool).size >= 5 ? 4 : 3);

const step = {
  meet: (letter) => ({ type: "meet", letter }),
  trace: (target) => {
    const made = question("h-trace", { target, example: exampleWord(target) ?? vowelWord(target) });
    return { ...made, type: "trace" };
  },
  listen: (answer, pool, mode = "jamo") => question("h-listen", { mode, answer, options: choices(answer, pool) }),
  picture: (letter, pool) => {
    const entry = pick(words.filter((w) => initialOf(w.word) === letter));
    return question("h-picture", { mode: "initial", entry, answer: letter, options: choices(letter, pool) });
  },
  pictureWord: (word, pool) => question("h-picture", { mode: "word", entry: entryOf(word), answer: word, options: choices(word, pool) }),
  blend: (mode, consonant, vowel, pool) => {
    const answer = mode === "consonant" ? consonant : vowel;
    return question("h-blend", { mode, consonant, vowel, final: null, answer, target: compose(consonant, vowel), options: choices(answer, pool) });
  },
  build: (consonant, vowel, pool) => {
    const answer = compose(consonant, vowel);
    return question("h-build", { consonant, vowel, answer, options: choices(answer, pool) });
  }
};

// Letters met so far, padded so the very first lessons still have three choices.
const known = (all, letter) => all.slice(0, Math.max(3, all.indexOf(letter) + 1));

function consonantQuestion(kind, letter, pool) {
  if (kind === "listen") return step.listen(letter, pool);
  if (kind === "picture") return step.picture(letter, pool);
  return step.blend("consonant", letter, "ㅏ", pool);
}

function vowelQuestion(kind, letter, pool) {
  const consonant = pick(PATH_BLEND_CONSONANTS);
  if (kind === "listen") return step.listen(letter, pool);
  if (kind === "blend") return step.blend("vowel", consonant, letter, pool);
  return step.build(consonant, letter, pool.map((vowel) => compose(consonant, vowel)));
}

function syllableQuestion(kind, consonant, vowel) {
  const row = rowSyllables(vowel);
  const answer = compose(consonant, vowel);
  if (kind === "listen") return step.listen(answer, row, "syllable");
  if (kind === "blend") return step.blend("consonant", consonant, vowel, CONSONANTS);
  // Same consonant with other vowels, and other consonants with the same vowel.
  return step.build(consonant, vowel, [...ROW_VOWELS.map((v) => compose(consonant, v)), ...shuffle(row).slice(0, 3)]);
}

export function buildSteps(lesson) {
  if (lesson.kind === "letter") {
    const { letter } = lesson;
    if (CONSONANTS.includes(letter)) {
      const pool = known(CONSONANTS, letter);
      return [step.meet(letter), step.trace(letter), ...["listen", "picture", "blend"].map((kind) => consonantQuestion(kind, letter, pool))];
    }
    const pool = known(VOWELS, letter);
    return [step.meet(letter), step.trace(letter), ...["listen", "blend", "build"].map((kind) => vowelQuestion(kind, letter, pool))];
  }

  if (lesson.kind === "review") {
    const consonants = CONSONANTS.includes(lesson.letters[0]);
    const all = consonants ? CONSONANTS : VOWELS;
    const pool = known(all, lesson.letters[lesson.letters.length - 1]);
    // Every letter of the group once, then earlier letters until there are five questions.
    const asked = shuffle(lesson.letters);
    while (asked.length < 5) asked.push(pick(pool));
    const kinds = consonants ? ["listen", "picture", "blend"] : ["listen", "blend", "build"];
    return asked.map((letter, index) => (consonants ? consonantQuestion : vowelQuestion)(kinds[index % 3], letter, pool));
  }

  if (lesson.kind === "row") {
    const consonants = shuffle(CONSONANTS).slice(0, 4);
    return [
      { type: "chart", vowel: lesson.vowel },
      ...["listen", "build", "blend", "listen"].map((kind, index) => syllableQuestion(kind, consonants[index], lesson.vowel))
    ];
  }

  if (lesson.kind === "rowReview") {
    return shuffle(ROW_VOWELS).map((vowel, index) => syllableQuestion(["listen", "build", "blend"][index % 3], pick(CONSONANTS), vowel));
  }

  // Words: look and listen first, then pick the word for a picture and for a sound in turn.
  const pool = [...lesson.words, ...shuffle(wordGroups.flat().filter((word) => !lesson.words.includes(word))).slice(0, 3)];
  return [
    { type: "words", entries: lesson.words.map(entryOf) },
    ...shuffle(lesson.words).map((word, index) => (index % 2 === 0 ? step.pictureWord(word, pool) : step.listen(word, pool, "word")))
  ];
}
