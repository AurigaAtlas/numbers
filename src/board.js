// 주사위 마을: board layout, prices and decorations.

export const BOARD_SIZE = 20;
export const PASS_START_REWARD = 10;

const boardImage = (name) => `./assets/board/${name}.webp`;
const lot = (id, word, group, price) => ({ id, type: "lot", word, group, price, image: id === "apple" ? "./assets/object-apple.webp" : id === "star" ? "./assets/object-star-storybook-v1.webp" : boardImage(id), name: `${word} 마을` });

// Clockwise from the top-left corner: top row, right column, bottom row, left column.
export const tiles = [
  { id: "start", type: "start", name: "출발", image: boardImage("start") },
  lot("apple", "사과", 0, 10),
  lot("grape", "포도", 0, 10),
  { id: "num-1", type: "numberQuiz", name: "숫자 카드", image: "./assets/game-order.webp" },
  lot("strawberry", "딸기", 0, 15),
  { id: "park", type: "park", name: "놀이터", image: boardImage("park") },
  lot("butterfly", "나비", 1, 20),
  lot("sunflower", "해바라기", 1, 20),
  { id: "ko-1", type: "hangulQuiz", name: "글자 카드", image: "./assets/game-h-build-storybook-v2.webp" },
  lot("banana", "바나나", 1, 25),
  { id: "gift", type: "gift", name: "선물 상자", image: boardImage("gift") },
  lot("tree", "나무", 2, 30),
  lot("rabbit", "토끼", 2, 30),
  { id: "num-2", type: "numberQuiz", name: "숫자 카드", image: "./assets/game-order.webp" },
  lot("duck", "오리", 2, 35),
  { id: "school", type: "school", name: "학교", image: boardImage("school") },
  lot("whale", "고래", 3, 40),
  lot("star", "별", 3, 40),
  { id: "ko-2", type: "hangulQuiz", name: "글자 카드", image: "./assets/game-h-build-storybook-v2.webp" },
  lot("rainbow", "무지개", 3, 50)
];

export const LOT_COUNT = tiles.filter((tile) => tile.type === "lot").length;

export const groupColors = ["#ff8fb8", "#ffc93c", "#5cc77d", "#5ab8ff"];

export const roofColors = ["#ff6f9f", "#ff8a3d", "#9b7bff", "#3d8bff", "#36bf77"];

export const decorItems = [
  { id: "flowers", name: "꽃밭", image: boardImage("flowers"), price: 6 },
  { id: "fence", name: "울타리", image: boardImage("fence"), price: 6 },
  { id: "tree", name: "나무", image: boardImage("tree"), price: 8 },
  { id: "flag", name: "깃발", image: boardImage("start"), price: 5 },
  { id: "lights", name: "별 조명", image: boardImage("lights"), price: 8 },
  { id: "mailbox", name: "우체통", image: boardImage("mailbox"), price: 6 },
  { id: "dog", name: "강아지", image: boardImage("dog"), price: 10 },
  { id: "cat", name: "고양이", image: boardImage("cat"), price: 10 }
];

export const houseNames = ["오두막", "2층 집", "성"];

export function upgradeCost(tile, level) {
  return level === 1 ? tile.price : Math.round(tile.price * 1.5);
}

export function houseRent(house) {
  return house.level * 3 + house.decor.length;
}

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

export const emptyBoard = { position: 0, owned: {}, laps: 0, rolls: 0 };

export function normalizeBoard(raw) {
  return {
    ...emptyBoard,
    ...raw,
    position: Number.isInteger(raw?.position) ? raw.position % BOARD_SIZE : 0,
    owned: raw?.owned ?? {}
  };
}
