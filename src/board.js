// 주사위 마을: a Blue Marble style board game for 2–4 players (people or robots).
// All money stays between 0 and 50원 so young children can count it.

export const BOARD_SIZE = 20;
export const START_MONEY = 10;
export const MAX_MONEY = 50;
export const PASS_START_REWARD = 3;
export const PIGGY_FEE = 2;
export const QUIZ_REWARD = 2;
export const SCHOOL_REWARD = 3;
export const FINISH_COINS = 15; // shop coins for finishing a game

const boardImage = (name) => `./assets/board/${name}.webp`;
const lotImages = { apple: "./assets/object-apple.webp", star: "./assets/object-star-storybook-v1.webp" };
const lot = (id, word, emoji, group, price) => ({
  id, type: "lot", word, emoji, group, price, name: `${word} 마을`, image: lotImages[id] ?? boardImage(id)
});
const numberCard = "./assets/game-order.webp";
const letterCard = "./assets/game-h-build-storybook-v2.webp";

// Clockwise from the top-left corner: top row, right column, bottom row, left column.
export const tiles = [
  { id: "start", type: "start", name: "출발", emoji: "🚩", image: boardImage("start") },
  lot("apple", "사과", "🍎", 0, 1),
  lot("grape", "포도", "🍇", 0, 1),
  { id: "num-1", type: "numberQuiz", name: "숫자 카드", emoji: "🔢", image: numberCard },
  lot("strawberry", "딸기", "🍓", 0, 2),
  { id: "island", type: "island", name: "꿀잠 섬", emoji: "🏝️" },
  lot("butterfly", "나비", "🦋", 1, 2),
  lot("sunflower", "해바라기", "🌻", 1, 3),
  { id: "ko-1", type: "hangulQuiz", name: "글자 카드", emoji: "가", image: letterCard },
  lot("banana", "바나나", "🍌", 1, 3),
  { id: "treasure", type: "treasure", name: "보물 상자", emoji: "🎁", image: boardImage("gift") },
  lot("tree", "나무", "🌳", 2, 3),
  lot("rabbit", "토끼", "🐰", 2, 4),
  { id: "piggy", type: "piggy", name: "저금통", emoji: "🐷" },
  lot("duck", "오리", "🦆", 2, 4),
  { id: "school", type: "school", name: "학교", emoji: "🏫", image: boardImage("school") },
  lot("whale", "고래", "🐳", 3, 4),
  lot("star", "별", "⭐", 3, 5),
  { id: "ko-2", type: "hangulQuiz", name: "글자 카드", emoji: "가", image: letterCard },
  lot("rainbow", "무지개", "🌈", 3, 5)
];

export const LOT_COUNT = tiles.filter((tile) => tile.type === "lot").length;

export const groupColors = ["#ff8fb8", "#ffc93c", "#5cc77d", "#5ab8ff"];
export const roofColors = ["#ff6f9f", "#ff8a3d", "#9b7bff", "#3d8bff", "#36bf77"];
export const playerColors = ["#ff6f9f", "#3d8bff", "#2fb67c", "#ff9a1f"];

// Decorating is free: it is the reward for coming home.
export const decorItems = [
  { id: "flowers", name: "꽃밭", image: boardImage("flowers") },
  { id: "fence", name: "울타리", image: boardImage("fence") },
  { id: "tree", name: "나무", image: boardImage("tree") },
  { id: "flag", name: "깃발", image: boardImage("start") },
  { id: "lights", name: "별 조명", image: boardImage("lights") },
  { id: "mailbox", name: "우체통", image: boardImage("mailbox") },
  { id: "dog", name: "강아지", image: boardImage("dog") },
  { id: "cat", name: "고양이", image: boardImage("cat") }
];

export const houseNames = ["오두막", "2층 집", "성"];

export const tokens = ["🐰", "🐻", "🐱", "🐶", "🐸", "🦊", "🐼", "🐥", "🤖"];
export const personNames = ["나", "엄마", "아빠", "언니", "오빠", "누나", "형", "동생", "할머니", "할아버지", "친구"];
export const robotNames = ["로봇", "꼬마 로봇", "아기 로봇"];
export const gameLengths = [
  { rounds: 5, label: "짧게" },
  { rounds: 10, label: "보통" },
  { rounds: 15, label: "길게" }
];

// Building the next floor costs the lot price again; the toll grows with each floor.
export const upgradeCost = (tile) => tile.price;
export const tollOf = (tile, house) => tile.price * house.level;
export const houseValue = (tile, house) => tile.price * house.level;

export const tileById = Object.fromEntries(tiles.map((tile) => [tile.id, tile]));

// 1-based CSS grid cell for a tile on the 6×6 board edge.
export function tileCell(index) {
  if (index <= 5) return { row: 1, col: index + 1 };
  if (index <= 10) return { row: index - 4, col: 6 };
  if (index <= 15) return { row: 6, col: 6 - (index - 10) };
  return { row: 6 - (index - 15), col: 1 };
}

// Dice grow with the number level: 1–3, then 1–5, then real 1–6 dice.
export function diceFaces(numbersLevelId) {
  if (numbersLevelId <= 1) return 3;
  if (numbersLevelId === 2) return 5;
  return 6;
}

export const addMoney = (money, amount) => Math.min(MAX_MONEY, money + amount);

export const defaultSetup = {
  count: 2,
  rounds: 10,
  players: [
    { name: "나", token: "🐰", robot: false },
    { name: "로봇", token: "🤖", robot: true },
    { name: "엄마", token: "🐻", robot: false },
    { name: "아빠", token: "🐶", robot: false }
  ]
};

export function createGame(setup) {
  return {
    players: setup.players.slice(0, setup.count).map((player, index) => ({
      name: player.name,
      token: player.token,
      robot: player.robot,
      color: playerColors[index],
      money: START_MONEY,
      position: 0,
      skip: 0
    })),
    turn: 0,
    round: 1,
    maxRounds: setup.rounds,
    owned: {},
    pot: 0,
    over: false
  };
}

// Money plus what the player's houses are worth.
export function totalOf(game, index) {
  const houses = Object.entries(game.owned)
    .filter(([, house]) => house.owner === index)
    .reduce((sum, [id, house]) => sum + houseValue(tileById[id], house), 0);
  return game.players[index].money + houses;
}

export function housesOf(game, index) {
  return Object.entries(game.owned).filter(([, house]) => house.owner === index);
}

// Moves play to the next player; a full lap of turns is one round.
export function nextTurn(game) {
  const turn = (game.turn + 1) % game.players.length;
  const round = turn === 0 ? game.round + 1 : game.round;
  return { ...game, turn, round, over: game.over || round > game.maxRounds };
}

function validGame(game) {
  return Boolean(game)
    && Array.isArray(game.players)
    && game.players.length >= 2
    && game.players.every((player) => Number.isInteger(player.money) && Number.isInteger(player.position));
}

// Saved games survive reloads; the old single-player village is not carried over.
export function normalizeBoard(raw) {
  return {
    game: validGame(raw?.game) ? raw.game : null,
    setup: raw?.setup?.players?.length === 4 ? raw.setup : defaultSetup
  };
}
