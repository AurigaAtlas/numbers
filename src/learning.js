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
    case "h-trace":
      return `ko:${round.target}`;
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

// ---------------------------------------------------------------- missions

const missionPool = {
  numbers: [
    { type: "numbersCorrect", target: 5, text: "숫자 놀이 5번 맞히기", icon: "🔢" },
    { type: "count", target: 3, text: "몇 개일까 3번 맞히기", icon: "🍎" },
    { type: "balloon", target: 1, text: "풍선 터뜨리기 1판", icon: "🎈" },
    { type: "add", target: 2, text: "더하기 빼기 2번 맞히기", icon: "➕" }
  ],
  hangul: [
    { type: "hangulCorrect", target: 5, text: "한글 놀이 5번 맞히기", icon: "가" },
    { type: "trace", target: 2, text: "따라 쓰기 2번 하기", icon: "✏️" },
    { type: "build", target: 3, text: "글자 만들기 3번 맞히기", icon: "🧩" },
    { type: "picture", target: 3, text: "그림 글자 3번 맞히기", icon: "🖼️" }
  ],
  fun: [
    { type: "streak", target: 3, text: "3번 연속 맞히기", icon: "🔥" },
    { type: "dex", target: 3, text: "도감에서 3개 들어보기", icon: "📖" },
    { type: "streak", target: 5, text: "5번 연속 맞히기", icon: "🔥" }
  ]
};

export const MISSION_REWARD = 30;

function hashDay(day) {
  let hash = 0;
  for (const char of day) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export function ensureDaily(daily, day) {
  if (daily?.date === day) return daily;
  const seed = hashDay(day);
  const pickFrom = (list, salt) => list[(seed >>> salt) % list.length];
  const missions = [pickFrom(missionPool.numbers, 0), pickFrom(missionPool.hangul, 4), pickFrom(missionPool.fun, 8)]
    .map((mission) => ({ ...mission, progress: 0 }));
  return { date: day, missions, claimed: false };
}

// Advances missions for one event: { gameId, track, correct, streak } or { dex: true }.
export function applyMissionEvent(daily, event) {
  const missions = daily.missions.map((mission) => {
    if (mission.progress >= mission.target) return mission;
    let progress = mission.progress;
    const correct = event.correct;
    switch (mission.type) {
      case "numbersCorrect":
        if (correct && event.track === "numbers") progress += 1;
        break;
      case "hangulCorrect":
        if (correct && event.track === "hangul") progress += 1;
        break;
      case "count":
        if (correct && event.gameId === "count") progress += 1;
        break;
      case "balloon":
        if (correct && event.gameId === "balloon") progress += 1;
        break;
      case "add":
        if (correct && event.gameId === "add") progress += 1;
        break;
      case "trace":
        if (correct && event.gameId === "h-trace") progress += 1;
        break;
      case "build":
        if (correct && event.gameId === "h-build") progress += 1;
        break;
      case "picture":
        if (correct && event.gameId === "h-picture") progress += 1;
        break;
      case "streak":
        if (event.streak !== undefined) progress = Math.max(progress, event.streak);
        break;
      case "dex":
        if (event.dex) progress += 1;
        break;
      default:
        break;
    }
    return { ...mission, progress: Math.min(progress, mission.target) };
  });
  return { ...daily, missions };
}

export function missionsDone(daily) {
  return daily.missions.every((mission) => mission.progress >= mission.target);
}
