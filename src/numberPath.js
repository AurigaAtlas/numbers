// 숫자 길: numbers in order, the same way 한글 길 (path.js) teaches Hangul. Each number
// is met, traced, found by ear, counted and placed in a row; then 11–20, comparing,
// and adding and taking away. Lessons are played by Path.jsx.
import { countObjects } from "./data";
import { countingWord, makeOptions, randInt, shuffle, sinoWord } from "./rounds";

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);
const pick = (values) => values[Math.floor(Math.random() * values.length)];

const numberLesson = (n) => ({ id: `num:${n}`, kind: "number", number: n, label: String(n), title: `${n} ${sinoWord(n)}` });
const reviewLesson = (id, numbers) => ({
  id: `review:${id}`,
  kind: "review",
  numbers,
  label: "복습",
  title: numbers.length > 4 ? `${numbers[0]}부터 ${numbers[numbers.length - 1]}까지 복습` : `${numbers.join(" ")} 복습`
});
const teenGroups = [[11, 12, 13], [14, 15, 16], [17, 18, 19, 20]];

export const numberUnits = [
  ...[[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]].map((numbers, index) => ({
    id: `n${index + 1}`,
    title: `숫자 ${numbers.join(" ")}`,
    lessons: [...numbers.map(numberLesson), reviewLesson(`n${index + 1}`, numbers)]
  })),
  {
    id: "n5",
    title: "11부터 20까지",
    lessons: [
      ...teenGroups.map((numbers, index) => ({
        id: `teens:${index + 1}`,
        kind: "teens",
        numbers,
        label: String(numbers[0]),
        title: `${numbers[0]}부터 ${numbers[numbers.length - 1]}까지`
      })),
      reviewLesson("n5", range(11, 20))
    ]
  },
  {
    id: "n6",
    title: "많다 적다",
    lessons: [
      { id: "cmp:objects", kind: "compare", numerals: false, label: "많다", title: "더 많은 쪽, 더 적은 쪽" },
      { id: "cmp:numbers", kind: "compare", numerals: true, label: "크다", title: "더 큰 수, 더 작은 수" }
    ]
  },
  {
    id: "n7",
    title: "더하기 빼기",
    lessons: [
      { id: "add:one", kind: "add", mode: "one", label: "+1", title: "하나 더" },
      { id: "add:plus", kind: "add", mode: "plus", label: "+", title: "더하기" },
      { id: "add:minus", kind: "add", mode: "minus", label: "−", title: "빼기" }
    ]
  }
];

export const numberLessons = numberUnits.flatMap((unit) => unit.lessons);

export function nextNumberLesson(stars = {}) {
  const index = numberLessons.findIndex((lesson) => !stars[lesson.id]);
  return index === -1 ? numberLessons.length : index;
}

// Numbers with a finished lesson, or that came up in any game, smallest first.
export function learnedNumbers(stars = {}, review = {}) {
  const learned = new Set();
  for (const lesson of numberLessons) {
    if (!stars[lesson.id]) continue;
    if (lesson.kind === "number") learned.add(lesson.number);
    if (lesson.kind === "teens") lesson.numbers.forEach((n) => learned.add(n));
  }
  Object.keys(review).forEach((key) => key.startsWith("num:") && learned.add(Number(key.slice(4))));
  return [...learned].sort((a, b) => a - b);
}

function reviewOrder(learned, review, today) {
  const rank = (n) => {
    const entry = review[`num:${n}`];
    if (!entry) return 0;
    return (entry.due <= today ? 0 : 100) + entry.box;
  };
  return shuffle(learned).sort((a, b) => rank(a) - rank(b));
}

// ---------------------------------------------------------------- steps

const question = (gameId, extra) => ({
  type: "quiz",
  round: { id: `${Date.now()}-${Math.random()}`, gameId, level: 0, feedback: null, eliminated: [], ...extra }
});
// Nearby numbers make the best distractors; a lesson only uses numbers up to `top`.
const options = (answer, top, count, bottom = 1) => makeOptions(answer, bottom, Math.max(top, bottom + count - 1), count);

const step = {
  find: (n, top, count = 3, bottom = 1) => question("find", { answer: n, options: options(n, top, count, bottom) }),
  count: (n, top, bottom = 1) => question("count", {
    answer: n,
    count: n,
    tapped: [],
    object: pick(countObjects),
    options: options(n, top, 3, bottom)
  }),
  missing: (n, top) => {
    const start = Math.max(1, Math.min(n - randInt(0, 3), top - 3));
    const sequence = range(start, start + 3);
    return question("missing", { sequence, blank: sequence.indexOf(n), step: 1, answer: n, options: options(n, top, 3) });
  },
  trace: (n) => ({
    type: "trace",
    round: { id: `${Date.now()}-${Math.random()}`, gameId: "n-trace", target: String(n), number: n, example: null, feedback: null }
  }),
  compare: (numerals, ask) => {
    const top = numerals ? 20 : 10;
    let left;
    let right;
    do {
      left = randInt(1, top);
      right = randInt(1, top);
    } while (Math.abs(left - right) < (numerals ? 1 : 2));
    const [leftObject, rightObject] = shuffle(countObjects);
    const leftWins = ask === "more" ? left > right : left < right;
    return question("compare", { left, right, ask, showNumerals: numerals, leftObject, rightObject, answer: leftWins ? "left" : "right" });
  },
  add: (mode) => {
    let a;
    let b;
    if (mode === "one") {
      a = randInt(1, 9);
      b = 1;
    } else if (mode === "plus") {
      a = randInt(1, 6);
      b = randInt(1, Math.min(4, 10 - a));
    } else {
      a = randInt(3, 10);
      b = randInt(1, Math.min(4, a - 1));
    }
    const minus = mode === "minus";
    const answer = minus ? a - b : a + b;
    return question("add", { a, b, op: minus ? "-" : "+", answer, object: pick(countObjects), options: options(answer, 10, 4) });
  }
};

// One question about a number the child has already met.
function reviewQuestion(n, at = 0) {
  const teen = n > 10;
  const top = teen ? 20 : Math.max(5, n + 1);
  const bottom = teen ? 10 : 1;
  const kind = ["find", "count", "missing"][at % 3];
  if (kind === "count" && !teen) return step.count(n, top);
  if (kind === "missing") return step.missing(n, teen ? 20 : Math.max(4, n + 1));
  return step.find(n, top, 3, bottom);
}

export const numberDaily = { id: "daily", kind: "daily", title: "오늘의 복습" };

export function buildNumberDaily({ learned, review, today }) {
  if (learned.length < 2) return null;
  const asked = reviewOrder(learned, review, today).slice(0, 6);
  while (asked.length < 4) asked.push(pick(learned));
  return shuffle(asked).map((n, index) => reviewQuestion(n, index));
}

export function buildNumberSteps(lesson, { learned = [], review = {}, today = "" } = {}) {
  if (lesson.kind === "number") {
    const n = lesson.number;
    const top = Math.max(3, n);
    // Start with one or two numbers from before, so old numbers keep coming back.
    const warmups = reviewOrder(learned.filter((m) => m !== n && m <= 10), review, today)
      .slice(0, 2)
      .map((m) => ({ ...step.find(m, Math.max(3, m)), warmup: true }));
    return [
      ...warmups,
      { type: "numberMeet", number: n },
      step.trace(n),
      step.find(n, top, 2), // the first question about a new number has two choices
      step.count(n, Math.max(4, n + 1)),
      step.missing(n, Math.max(4, n + 1))
    ];
  }

  if (lesson.kind === "review") {
    const asked = shuffle(lesson.numbers);
    while (asked.length < 5) asked.push(pick(lesson.numbers));
    return asked.slice(0, Math.max(5, lesson.numbers.length > 5 ? 6 : 5)).map((n, index) => reviewQuestion(n, index));
  }

  if (lesson.kind === "teens") {
    const [first] = lesson.numbers;
    return [
      { type: "numberChart", numbers: lesson.numbers },
      ...shuffle(lesson.numbers).map((n) => step.find(n, 20, 3, 10)),
      step.count(first, 20, 10),
      step.missing(pick(lesson.numbers), 20)
    ];
  }

  if (lesson.kind === "compare") {
    // "More" first, then "fewer"/"smaller", which children find harder.
    return ["more", "more", "less", "more", "less"].map((ask) => step.compare(lesson.numerals, ask));
  }

  return Array.from({ length: 5 }, () => step.add(lesson.mode));
}

// 듣고 따라 읽기 for a unit: each number with its two names.
export function numberListenItems(unit, stars = {}) {
  const next = nextNumberLesson(stars);
  const reached = (lesson) => stars[lesson.id] || numberLessons.indexOf(lesson) <= next;
  return unit.lessons.filter(reached).flatMap((lesson) => {
    const numbers = lesson.kind === "number" ? [lesson.number] : lesson.kind === "teens" ? lesson.numbers : [];
    return numbers.map((n) => ({ key: `n${n}`, big: String(n), name: `${sinoWord(n)} · ${countingWord(n)}`, number: n }));
  });
}

export function numberLessonReward(lesson) {
  return lesson.kind === "number" ? 12 : 18;
}
