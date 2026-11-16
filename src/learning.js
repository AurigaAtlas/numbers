// Per-item learning records, weak-item practice and daily missions.

// Which number or letter a round is really practising, for the mastery record.
export function itemKey(round) {
  switch (round.gameId) {
    case "find":
    case "count":
    case "missing":
      return `num:${round.answer}`;
    case "balloon":
      return `num:${round.target}`;
    case "h-listen":
    case "h-picture":
      return `ko:${round.answer}`;
    case "h-build":
      return `ko:${round.consonant}`;
    case "h-blend":
      return `ko:${round.answer}`;
    case "h-trace":
    case "h-balloon":
      return `ko:${round.target}`;
    case "n-trace":
      return `num:${round.number}`;
    default:
      return null;
  }
}

// `r` counts right answers; `w` is a decaying mistake score so recent slips matter most.
export function recordResult(mastery, key, correct) {
  if (!key) return mastery;
  const entry = mastery[key] ?? { r: 0, w: 0 };
  const next = correct
    ? { r: entry.r + 1, w: Math.max(0, entry.w - 0.5) }
    : { r: entry.r, w: entry.w + 1 };
  return { ...mastery, [key]: next };
}

export function isMastered(entry) {
  return Boolean(entry) && entry.r >= 3 && entry.w <= 0.5;
}

function weightOf(entry) {
  if (!entry) return 1.4; // not met yet: introduce it soon
  // Kept within 0.7–2.6 so practice leans toward weak items without repeating one forever.
  return Math.min(2.6, Math.max(0.7, 1 + entry.w - Math.min(entry.r, 6) * 0.06));
}

// Random pick that favours items the child has missed or not seen yet.
export function pickWeighted(pool, keyOf, mastery = {}) {
  const weights = pool.map((value) => weightOf(mastery[keyOf(value)]));
  let roll = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let index = 0; index < pool.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return pool[index];
  }
  return pool[pool.length - 1];
}

// ---------------------------------------------------------------- 오늘의 공부

// The same short plan every day, in this order: a step on each path, a review,
// then some free play. Finishing it opens the treasure chest and stamps the day.
const PLAN_VERSION = 2;
const planSteps = [
  { type: "hangulPath", target: 1, text: "한글 길 한 칸", icon: "가" },
  { type: "numberPath", target: 1, text: "숫자 길 한 칸", icon: "123" },
  { type: "review", target: 1, text: "오늘의 복습", icon: "★" },
  { type: "play", target: 3, text: "놀이에서 3번 맞히기", icon: "🎲" }
];

export const MISSION_REWARD = 30;
export const PLAN_GROWTH = 5; // growth stars from the chest

export function ensureDaily(daily, day) {
  if (daily?.date === day && daily.version === PLAN_VERSION) return daily;
  return {
    version: PLAN_VERSION,
    date: day,
    missions: planSteps.map((step) => ({ ...step, progress: 0 })),
    // A chest already opened today stays opened when the plan format changes.
    claimed: daily?.date === day ? Boolean(daily.claimed) : false
  };
}

// Advances the plan for one event: { pathLesson: "hangul" | "numbers" }, { review: true },
// a free-play answer { gameId, correct }, or { boardRoll: true }.
export function applyMissionEvent(daily, event) {
  const missions = daily.missions.map((mission) => {
    if (mission.progress >= mission.target) return mission;
    let progress = mission.progress;
    if (mission.type === "hangulPath" && event.pathLesson === "hangul") progress += 1;
    if (mission.type === "numberPath" && event.pathLesson === "numbers") progress += 1;
    if (mission.type === "review" && event.review) progress += 1;
    if (mission.type === "play" && ((event.correct && event.gameId) || event.boardRoll)) progress += 1;
    return { ...mission, progress: Math.min(progress, mission.target) };
  });
  return { ...daily, missions };
}

// Before two letters or numbers are learned there is nothing to review, so that step
// does not hold the chest back.
export function stepDone(mission, reviewReady = true) {
  return mission.progress >= mission.target || (mission.type === "review" && !reviewReady);
}

export function missionsDone(daily, reviewReady = true) {
  return daily.missions.every((mission) => stepDone(mission, reviewReady));
}

// Days the plan was finished, newest kept, for the stamp card.
export function addStamp(stamps = [], day) {
  return stamps.includes(day) ? stamps : [...stamps, day].sort().slice(-60);
}

// ---------------------------------------------------------------- play log

const HISTORY_DAYS = 60;

// Local calendar day, so "today" turns over at midnight where the child lives.
export function dayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// One record per day: s = seconds played, n/k = [answered, right first time] for numbers/Hangul.
export function logPlay(history, day, { seconds = 0, track, firstTry } = {}) {
  const entry = history?.[day] ?? { s: 0, n: [0, 0], k: [0, 0] };
  const next = { ...entry, s: entry.s + seconds };
  if (track) {
    const key = track === "hangul" ? "k" : "n";
    next[key] = [entry[key][0] + 1, entry[key][1] + (firstTry ? 1 : 0)];
  }
  const merged = { ...history, [day]: next };
  const days = Object.keys(merged).sort();
  for (const old of days.slice(0, Math.max(0, days.length - HISTORY_DAYS))) delete merged[old];
  return merged;
}

export function recentDays(count, today = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return dayKey(date);
  });
}

// Items answered wrongly lately, worst first.
export function weakItems(mastery, prefix, limit = 6) {
  return Object.entries(mastery)
    .filter(([key, entry]) => key.startsWith(prefix) && entry.w >= 1)
    .sort((a, b) => b[1].w - a[1].w)
    .slice(0, limit)
    .map(([key]) => key.slice(prefix.length));
}

export function masteryState(entry) {
  if (!entry) return "new";
  if (isMastered(entry)) return "mastered";
  if (entry.w >= 1.5) return "weak";
  return "learning";
}

// ---------------------------------------------------------------- review

// A letter answered right comes back after a growing gap: 1, 2, 4, 7, then 14 days.
const REVIEW_GAPS = [0, 1, 2, 4, 7, 14];

function addDays(day, count) {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + count);
  return dayKey(date);
}

// `review` maps an item key to { box, due }. A slip sends the letter back to the start
// (due again today); a right answer only moves it on when it was actually due, so
// playing the same letter ten times in one day does not skip the spacing.
export function scheduleReview(review, key, firstTry, day) {
  if (!key) return review;
  const entry = review[key];
  if (!firstTry) return { ...review, [key]: { box: 1, due: day } };
  if (entry && entry.due > day) return review;
  const box = Math.min(REVIEW_GAPS.length - 1, (entry?.box ?? 0) + 1);
  return { ...review, [key]: { box, due: addDays(day, REVIEW_GAPS[box]) } };
}

// Keys to review today, the shakiest and longest-waiting first.
export function dueItems(review, day) {
  return Object.entries(review)
    .filter(([, entry]) => entry.due <= day)
    .sort((a, b) => a[1].box - b[1].box || (a[1].due < b[1].due ? -1 : 1))
    .map(([key]) => key);
}
