import { countObjects } from "./data";
import { pickWeighted } from "./learning";

const sinoDigits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const nativeOnes = ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉"];

// 1 → 일, 12 → 십이, 20 → 이십
export function sinoWord(number) {
  if (number <= 0) return "영";
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  const tensWord = tens === 0 ? "" : `${tens === 1 ? "" : sinoDigits[tens]}십`;
  return `${tensWord}${sinoDigits[ones]}`;
}

// 1 → 하나, 12 → 열둘, 20 → 스물
export function countingWord(number) {
  if (number === 20) return "스물";
  if (number === 10) return "열";
  if (number > 10) return `열${nativeOnes[number - 10]}`;
  return nativeOnes[number] ?? String(number);
}

// Native number before a counter word: 한 개, 두 칸, 세 번, 스무 개, 스물다섯 개.
const nativeUnits = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const nativeTens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
export function nativeCount(number) {
  if (number === 20) return "스무";
  if (number <= 0 || number >= 100) return sinoWord(number);
  return `${nativeTens[Math.floor(number / 10)]}${nativeUnits[number % 10]}`;
}

// Picks 을/를 (or 이/가, 은/는 …) from whether the last Hangul syllable has a final consonant.
export function josa(word, withFinal, withoutFinal) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${hasFinal ? withFinal : withoutFinal}`;
}

// Digit plus particle chosen by how the number is read: 3 → "3을", 2 → "2를".
export function numberJosa(number, withFinal, withoutFinal) {
  const word = sinoWord(number);
  return `${number}${josa(word, withFinal, withoutFinal).slice(word.length)}`;
}

// Numbers above 10 reuse the 1–10 palette by their last digit.
export function toneClass(number) {
  return `n-${((number - 1) % 10) + 1}`;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

// Distractors are drawn mostly from nearby numbers so higher levels feel trickier.
export function makeOptions(answer, min, max, count) {
  const pool = range(min, max)
    .filter((n) => n !== answer)
    .map((n) => ({ n, weight: Math.abs(n - answer) + Math.random() * 3 }))
    .sort((a, b) => a.weight - b.weight)
    .slice(0, count - 1)
    .map(({ n }) => n);
  return shuffle([answer, ...pool]);
}

function twoObjects() {
  const [first, second] = shuffle(countObjects);
  return [first, second];
}

export function makeRound(gameId, level, mastery = {}) {
  const base = { id: `${Date.now()}-${Math.random()}`, gameId, level: level.id, feedback: null };
  const { max } = level;

  const numKey = (n) => `num:${n}`;

  if (gameId === "find") {
    const answer = pickWeighted(range(1, max), numKey, mastery);
    return { ...base, answer, options: makeOptions(answer, 1, max, level.options) };
  }

  if (gameId === "count") {
    const answer = pickWeighted(range(1, level.countMax), numKey, mastery);
    return {
      ...base,
      answer,
      count: answer,
      tapped: [],
      object: pick(countObjects),
      options: makeOptions(answer, 1, Math.max(level.countMax, 5), level.options)
    };
  }

  if (gameId === "order") {
    const count = Math.min(level.order.count, max);
    const start = level.order.randomStart ? randInt(1, max - count + 1) : 1;
    const sequence = range(start, start + count - 1);
    return {
      ...base,
      sequence,
      answer: sequence[sequence.length - 1],
      selected: [],
      next: start,
      options: shuffle(sequence)
    };
  }

  if (gameId === "memory") {
    const values = shuffle(range(1, max)).slice(0, level.memoryPairs);
    const cards = shuffle(values.flatMap((value) => [0, 1].map((copy) => ({
      id: `${value}-${copy}`,
      value,
      matched: false
    }))));
    return { ...base, cards, flipped: [], resolving: false };
  }

  if (gameId === "compare") {
    const { numerals, less, minDiff } = level.compare;
    const showNumerals = numerals === "always" || (numerals === "mix" && Math.random() < 0.5);
    const top = showNumerals ? max : Math.min(max, 10);
    let left;
    let right;
    do {
      left = randInt(1, top);
      right = randInt(1, top);
    } while (Math.abs(left - right) < minDiff);
    const ask = less && Math.random() < 0.4 ? "less" : "more";
    const leftWins = ask === "more" ? left > right : left < right;
    const [leftObject, rightObject] = twoObjects();
    return {
      ...base,
      left,
      right,
      ask,
      showNumerals,
      leftObject,
      rightObject,
      answer: leftWins ? "left" : "right"
    };
  }

  if (gameId === "missing") {
    const { length, steps, descending } = level.missing;
    let step = pick(steps);
    if ((length - 1) * step >= max) step = 1;
    const start = randInt(1, max - (length - 1) * step);
    let sequence = Array.from({ length }, (_, index) => start + index * step);
    if (descending && Math.random() < 0.35) sequence = sequence.reverse();
    const blank = level.id === 1 ? randInt(1, length - 1) : randInt(0, length - 1);
    const answer = sequence[blank];
    return {
      ...base,
      sequence,
      blank,
      step,
      answer,
      options: makeOptions(answer, 1, max, level.options)
    };
  }

  if (gameId === "add") {
    const minus = level.add.minus && Math.random() < 0.45;
    let a;
    let b;
    let answer;
    if (minus) {
      a = randInt(2, level.add.max);
      b = randInt(1, a - 1);
      answer = a - b;
    } else {
      a = randInt(1, level.add.max - 1);
      b = randInt(1, level.add.max - a);
      answer = a + b;
    }
    return {
      ...base,
      a,
      b,
      op: minus ? "-" : "+",
      answer,
      object: pick(countObjects),
      options: makeOptions(answer, 1, Math.max(level.add.max, 5), level.options)
    };
  }

  if (gameId === "balloon") {
    const target = pickWeighted(range(1, max), numKey, mastery);
    const { goal, duration } = level.balloon;
    const poolSize = 9;
    const others = range(1, max).filter((n) => n !== target);
    const values = shuffle([
      ...Array.from({ length: goal + 1 }, () => target),
      ...Array.from({ length: poolSize - goal - 1 }, () => pick(others))
    ]);
    const lanes = shuffle(range(0, poolSize - 1));
    const balloons = values.map((value, index) => {
      const speed = duration * (0.85 + Math.random() * 0.3);
      return {
        id: `b${index}`,
        value,
        x: 12 + (lanes[index] / (poolSize - 1)) * 76,
        duration: speed,
        delay: -((index / poolSize) * speed) - Math.random() * 0.6,
        sway: randInt(0, 2)
      };
    });
    return { ...base, target, goal, balloons, popped: [], wrong: null };
  }

  return base;
}
