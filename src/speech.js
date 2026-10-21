// Every sentence the app speaks is built here, so the voice-pack catalog
// (scripts/voice/build-catalog.mjs) can enumerate them all and pre-record them.
import { CONSONANTS, compose, exampleWord, hangulPrompt, letterName, spokenForm, words } from "./hangul";
import { countingWord, josa, nativeCount, sinoWord } from "./rounds";

export const praise = ["잘했어!", "멋져!", "좋았어!", "정말 정확해!", "최고야!"];

// 으로/로: words ending in a vowel or ㄹ take 로 ("리을로", "성으로").
export function withRo(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const final = code >= 0 && code <= 11171 ? code % 28 : 0;
  return `${word}${final === 0 || final === 8 ? "로" : "으로"}`;
}

// How an answer is read aloud: numbers in 일/이/삼, letters by name, words as written.
export function spokenAnswer(answer) {
  return typeof answer === "number" ? sinoWord(answer) : spokenForm(answer);
}

// "나의 집" reads oddly; children say "내 집".
export function possessive(name) {
  return name === "나" ? "내" : `${name}의`;
}

export function vowelExample(vowel) {
  return words.find((entry) => entry.word[0] === compose("ㅇ", vowel)) ?? null;
}

const numberPrompt = {
  find: (round) => `${josa(sinoWord(round.answer), "을", "를")} 찾아주세요.`,
  count: () => "몇 개인지 세어볼까요?",
  order: (round) => `${sinoWord(round.sequence[0])}부터 차례대로 눌러주세요.`,
  compare: (round) => {
    if (round.showNumerals) return round.ask === "more" ? "더 큰 숫자를 골라주세요." : "더 작은 숫자를 골라주세요.";
    return round.ask === "more" ? "더 많은 쪽을 골라주세요." : "더 적은 쪽을 골라주세요.";
  },
  missing: () => "빈칸에 들어갈 숫자는 뭘까요?",
  add: (round) => `${sinoWord(round.a)} ${round.op === "+" ? "더하기" : "빼기"} ${josa(sinoWord(round.b), "은", "는")} 얼마일까요?`,
  balloon: (round) => `${sinoWord(round.target)} 풍선을 터뜨려주세요.`
};

export const say = {
  // Game prompts (also used for "다시 듣기").
  prompt(round) {
    if (round.gameId.startsWith("h-")) return hangulPrompt(round);
    return numberPrompt[round.gameId]?.(round) ?? null;
  },
  counting: (n) => countingWord(n),
  countAll: (n) => `모두 ${countingWord(n)}!`,

  // Results.
  combo: (streak) => `우와, ${nativeCount(streak)} 번 연속이야!`,
  secondTryRight: "맞았어! 잘했어!",
  answerIs: (answer) => `정답은 ${josa(spokenAnswer(answer), "이야", "야")}`,
  tryAgain: "괜찮아, 다시 해보자!",
  levelUp: (name) => `레벨 업! ${name} 단계가 열렸어요!`,
  missionDone: "미션 성공! 보물상자를 열었어요!",
  preview: "안녕! 같이 숫자 놀이 하자. 일, 이, 삼!",
  breakTime: "우와, 많이 놀았다! 눈도 쉬고 물도 한 잔 마셔요.",
  breakOver: "다 쉬었어요! 다시 놀아볼까요?",

  // Hints after a first mistake.
  countTogether: "같이 세어보자!",
  addHint: "그림을 하나씩 세어볼까?",
  missingHint: (step) => `${countingWord(Math.abs(step))}씩 ${step > 0 ? "커지고" : "작아지고"} 있어!`,
  slowWord: (word) => word.split("").join(", "),
  buildHint: (consonant, vowel) => `${spokenForm(consonant)}, ${spokenForm(vowel)}`,
  orderHint: (next) => `${josa(sinoWord(next), "을", "를")} 찾아봐`,

  // 도감.
  dex(value) {
    if (typeof value === "number") return `${sinoWord(value)}, ${countingWord(value)}`;
    const name = letterName(value);
    const example = CONSONANTS.includes(value) ? exampleWord(value) : vowelExample(value);
    return example ? `${name}. ${example.word}의 ${name}` : name;
  },

  // 주사위 마을.
  turn: (name) => `${name} 차례예요!`,
  diceAsk: (numeral) => (numeral ? "두 주사위를 더하면 몇일까요?" : "주사위 점이 모두 몇 개일까요?"),
  diceRight: (sum) => `맞았어! ${nativeCount(sum)} 칸 가자!`,
  diceWrong: (sum) => `정답은 ${josa(sinoWord(sum), "이야", "야")}. ${nativeCount(sum)} 칸 가자!`,
  robotMove: (sum) => `모두 ${countingWord(sum)}! ${nativeCount(sum)} 칸 가요!`,
  doubles: "똑같은 숫자! 한 번 더 굴려요!",
  passStart: (reward) => `출발점을 지나서 ${sinoWord(reward)} 원을 받아요!`,
  lot: (tile, initial) => `${tile.name}! ${josa(tile.word, "은", "는")} ${withRo(letterName(initial))} 시작해요.`,
  lotPrice: (price) => `집값은 ${sinoWord(price)} 원이에요.`,
  payAsk: (n) => `동전 ${nativeCount(n)} 개를 눌러서 내요.`,
  paid: (n) => `${sinoWord(n)} 원을 냈어요!`,
  needMoney: (n) => `돈이 ${sinoWord(n)} 원 모자라요.`,
  newHouse: (tile) => `${tile.name}에 집을 지었어요!`,
  homeAgain: (tile, canGrow) => `${tile.name}, 내 집에 왔어요!${canGrow ? " 집을 더 키울까요?" : ""}`,
  toll: (owner, tile, n) => `${possessive(owner)} ${tile.name}이에요! 통행료 ${sinoWord(n)} 원을 내요.`,
  received: (name, n) => `${name}, ${sinoWord(n)} 원을 받았어요!`,
  soldHouse: (tile) => `돈이 모자라서 ${tile.name} 집을 팔았어요.`,
  broke: (name) => `${name}, 돈이 다 떨어졌어요!`,
  island: "꿀잠 섬이에요. 한 번 쉬어요.",
  sleeping: (name) => `${name}, 쿨쿨 쉬는 중이에요.`,
  piggy: (n) => `저금통에 ${sinoWord(n)} 원을 넣어요.`,
  treasure: (n) => `보물 상자에서 ${sinoWord(n)} 원을 찾았어요!`,
  helpRobot: "로봇을 도와줄래요?",
  quizReward: (n) => `정답! ${sinoWord(n)} 원을 받아요!`,
  walletFull: "지갑이 가득 찼어요!",
  gameOver: "게임 끝! 누가 제일 많이 모았을까요?",
  winner: (name) => `${name} 우승! 모두 잘했어요!`,
  tie: "똑같이 모았어요! 모두 우승!",
  // Written out ("이층") so recorded voices do not have to guess how to read "2층".
  upgraded: (houseName) => `우와! ${josa(houseName.replace(/2층/g, "이층"), "이", "가")} 되었어요!`,
  quizRight: "정답이에요!"
};

// Sentences are recorded and played back piece by piece, split after . ! ? and ,
// (trailing . and , are dropped so "고," and "고." share one clip).
export function splitSpeech(text) {
  return text
    .split(/(?<=[.!?,])\s+/)
    .map((part) => part.trim().replace(/[.,]+$/, ""))
    .filter(Boolean);
}
