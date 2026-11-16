// The princess grows up as the child learns: every right answer adds a growth star,
// and at each milestone she moves to the next stage (taller, with a richer glow).

// Optional artwork dropped into src/assets/princess/ is picked up by file name:
//   stage-3.webp        drawn behind the doll (aura, wings, light)
//   stage-3-front.webp  drawn in front of the doll (sparkles, a floating crown)
//   stage-3-body.webp   replaces the doll's body (must match the 320×400 pose so clothes still fit)
// Without a file, the built-in vector effect for that stage is used.
const art = import.meta.glob("./assets/princess/*.{webp,png}", { eager: true, query: "?url", import: "default" });
const artFor = (name) => art[`./assets/princess/${name}.webp`] ?? art[`./assets/princess/${name}.png`] ?? null;

export const princessStages = [
  { id: 1, name: "아기 공주", need: 0, scale: 0.86, perk: "이제 막 공부를 시작했어요" },
  { id: 2, name: "꼬마 공주", need: 15, scale: 0.9, perk: "반짝반짝 빛이 나기 시작했어요" },
  { id: 3, name: "별빛 공주", need: 50, scale: 0.94, perk: "별들이 공주를 따라다녀요" },
  { id: 4, name: "무지개 공주", need: 120, scale: 0.97, perk: "공주 뒤에 무지개가 떴어요" },
  { id: 5, name: "마법 공주", need: 250, scale: 1, perk: "빛나는 마법 날개가 생겼어요" },
  { id: 6, name: "여왕님", need: 450, scale: 1.03, perk: "온 나라가 금빛으로 빛나요" }
].map((stage) => ({
  ...stage,
  back: artFor(`stage-${stage.id}`),
  front: artFor(`stage-${stage.id}-front`),
  body: artFor(`stage-${stage.id}-body`)
}));

export const GROWTH_COINS = 20; // a present each time she grows
export const LESSON_STARS = 3; // growth stars for a finished 한글 길 step

export function stageOf(stars = 0) {
  return [...princessStages].reverse().find((stage) => stars >= stage.need) ?? princessStages[0];
}

// Where she is between this stage and the next, for the growth bar.
export function growthProgress(stars = 0) {
  const stage = stageOf(stars);
  const next = princessStages[stage.id] ?? null;
  if (!next) return { stage, next, left: 0, percent: 100 };
  return {
    stage,
    next,
    left: next.need - stars,
    percent: Math.round(((stars - stage.need) / (next.need - stage.need)) * 100)
  };
}
