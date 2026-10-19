import { extraShopItems } from "./itemArt";

function raisedShopPrice(price) {
  return price === 0 ? 0 : Math.ceil(price * 3);
}

export const shopItems = [
  {
    id: "room-sky",
    type: "room",
    name: "공주 놀이방",
    price: 0,
    rarity: "기본",
    image: "./assets/generated-princess-room.webp",
    description: "새로 만든 따뜻한 공주방"
  },
  {
    id: "room-castle",
    type: "room",
    name: "성 안뜰",
    price: 10,
    rarity: "희귀",
    image: "./assets/generated-castle-courtyard.webp",
    description: "새로 만든 햇살 가득한 성 안뜰"
  },
  {
    id: "room-garden",
    type: "room",
    name: "꽃 정원",
    price: 7,
    rarity: "고급",
    image: "./assets/generated-flower-garden.webp",
    description: "새로 만든 꽃과 정자 배경"
  },
  {
    id: "base-outfit",
    type: "outfit",
    name: "분홍 원피스",
    price: 0,
    rarity: "기본",
    image: "./assets/avatar-gen-pink-dress.webp",
    previewImage: "./assets/shop-pink-dress-generated.webp",
    avatarImage: "./assets/avatar-gen-pink-dress.webp",
    description: "캐릭터 몸에 맞춰 만든 기본 드레스"
  },
  {
    id: "rainbow-outfit",
    type: "outfit",
    name: "무지개 드레스",
    price: 5,
    rarity: "고급",
    image: "./assets/avatar-gen-rainbow-dress.webp",
    previewImage: "./assets/shop-rainbow-dress-v3.webp",
    avatarImage: "./assets/avatar-gen-rainbow-dress.webp",
    description: "색깔이 반짝이는 드레스"
  },
  {
    id: "princess-dress",
    type: "outfit",
    name: "공주 드레스",
    price: 8,
    rarity: "희귀",
    image: "./assets/avatar-gen-princess-dress.webp",
    previewImage: "./assets/shop-princess-dress-v3.webp",
    avatarImage: "./assets/avatar-gen-princess-dress.webp",
    description: "상점의 대표 공주 옷"
  },
  {
    id: "royal-dress",
    type: "outfit",
    name: "왕실 드레스",
    price: 10,
    rarity: "전설",
    image: "./assets/avatar-gen-royal-dress.webp",
    previewImage: "./assets/shop-royal-dress-v3.webp",
    avatarImage: "./assets/avatar-gen-royal-dress.webp",
    description: "오래 모으면 살 수 있는 특별한 옷"
  },
  {
    id: "sun-hat",
    type: "hat",
    name: "햇살 모자",
    price: 3,
    rarity: "고급",
    image: "./assets/avatar-gen-sun-hat.webp",
    previewImage: "./assets/shop-sun-hat-v3.webp",
    avatarImage: "./assets/avatar-gen-sun-hat.webp",
    description: "노란 리본이 달린 모자"
  },
  {
    id: "star-crown",
    type: "hat",
    name: "별 왕관",
    price: 6,
    rarity: "희귀",
    image: "./assets/avatar-gen-star-crown.webp",
    previewImage: "./assets/shop-star-crown-v3.webp",
    avatarImage: "./assets/avatar-gen-star-crown.webp",
    description: "별이 달린 작은 왕관"
  },
  {
    id: "flower-tiara",
    type: "hat",
    name: "꽃 티아라",
    price: 8,
    rarity: "희귀",
    image: "./assets/avatar-gen-flower-tiara.webp",
    previewImage: "./assets/shop-flower-tiara-v3.webp",
    avatarImage: "./assets/avatar-gen-flower-tiara.webp",
    description: "꽃잎 장식 머리띠"
  },
  {
    id: "heart-wand",
    type: "accessory",
    name: "하트 요술봉",
    price: 5,
    rarity: "고급",
    image: "./assets/avatar-gen-heart-wand.webp",
    previewImage: "./assets/gen-heart-wand.webp",
    avatarImage: "./assets/avatar-gen-heart-wand.webp",
    description: "정답을 응원하는 요술봉"
  },
  {
    id: "butterfly-wings",
    type: "accessory",
    name: "나비 날개",
    price: 10,
    rarity: "전설",
    image: "./assets/avatar-gen-butterfly-wings.webp",
    previewImage: "./assets/shop-butterfly-wings-v3.webp",
    avatarImage: "./assets/avatar-gen-butterfly-wings.webp",
    description: "캐릭터 뒤에 달리는 날개"
  },
  ...extraShopItems.filter(Boolean)
].map((item) => ({
  ...item,
  price: raisedShopPrice(item.price)
}));

export const shopCategories = [
  { id: "all", label: "전체" },
  { id: "outfit", label: "옷" },
  { id: "hat", label: "모자" },
  { id: "accessory", label: "소품" },
  { id: "room", label: "방" }
];


export const gameCards = [
  {
    id: "find",
    title: "숫자 찾기",
    subtitle: "목소리를 듣고 숫자를 골라요",
    intro: "잘 듣고 맞는 숫자를 눌러봐!",
    image: "./assets/game-find-storybook-v1.webp",
    color: "coral",
    reward: 9
  },
  {
    id: "count",
    title: "몇 개일까",
    subtitle: "그림을 세고 숫자를 눌러요",
    intro: "그림을 하나씩 눌러서 세어봐!",
    image: "./assets/game-count.webp",
    color: "mint",
    reward: 9
  },
  {
    id: "order",
    title: "차례차례",
    subtitle: "작은 숫자부터 순서대로",
    intro: "작은 숫자부터 차례대로 눌러봐!",
    image: "./assets/game-order.webp",
    color: "sky",
    reward: 10
  },
  {
    id: "memory",
    title: "카드 기억하기",
    subtitle: "같은 숫자 카드를 찾아요",
    intro: "카드를 뒤집어서 같은 숫자 짝을 찾아봐!",
    image: "./assets/game-memory.webp",
    color: "lilac",
    reward: 16
  },
  {
    id: "compare",
    title: "어느 쪽이 많을까",
    subtitle: "많은 쪽, 적은 쪽을 골라요",
    intro: "두 쪽을 잘 비교해봐!",
    art: "compare",
    color: "sun",
    reward: 9
  },
  {
    id: "missing",
    title: "빈칸 채우기",
    subtitle: "빠진 숫자를 찾아요",
    intro: "물음표 자리에 어떤 숫자가 올까?",
    art: "missing",
    color: "pink",
    reward: 10
  },
  {
    id: "add",
    title: "더하기 빼기",
    subtitle: "그림으로 셈을 해요",
    intro: "모두 몇 개가 될까?",
    art: "math",
    color: "teal",
    reward: 12
  },
  {
    id: "balloon",
    title: "풍선 터뜨리기",
    subtitle: "날아가는 숫자 풍선을 잡아요",
    intro: "숫자 풍선을 콕 눌러서 터뜨려봐!",
    art: "balloon",
    color: "peach",
    reward: 12
  }
];

// Each level widens the number range and adds new twists to every game.
export const levels = [
  {
    id: 1,
    name: "새싹",
    perk: "1부터 5까지 놀아요",
    max: 5,
    goal: 10,
    options: 4,
    countMax: 5,
    memoryPairs: 3,
    order: { count: 5, randomStart: false },
    compare: { numerals: "never", less: false, minDiff: 2 },
    missing: { length: 4, steps: [1], descending: false },
    add: { max: 5, minus: false },
    balloon: { goal: 1, duration: 10 }
  },
  {
    id: 2,
    name: "꽃잎",
    perk: "이제 1부터 10까지 놀 수 있어요",
    max: 10,
    goal: 15,
    options: 4,
    countMax: 10,
    memoryPairs: 4,
    order: { count: 10, randomStart: false },
    compare: { numerals: "never", less: true, minDiff: 1 },
    missing: { length: 5, steps: [1], descending: false },
    add: { max: 7, minus: false },
    balloon: { goal: 2, duration: 9 }
  },
  {
    id: 3,
    name: "별빛",
    perk: "고를 숫자가 많아지고 빼기도 나와요",
    max: 10,
    goal: 20,
    options: 6,
    countMax: 10,
    memoryPairs: 5,
    order: { count: 6, randomStart: true },
    compare: { numerals: "mix", less: true, minDiff: 1 },
    missing: { length: 5, steps: [1], descending: true },
    add: { max: 10, minus: true },
    balloon: { goal: 3, duration: 7.5 }
  },
  {
    id: 4,
    name: "무지개",
    perk: "이제 1부터 15까지 놀 수 있어요",
    max: 15,
    goal: 25,
    options: 6,
    countMax: 12,
    memoryPairs: 6,
    order: { count: 8, randomStart: true },
    compare: { numerals: "mix", less: true, minDiff: 1 },
    missing: { length: 5, steps: [1], descending: true },
    add: { max: 10, minus: true },
    balloon: { goal: 3, duration: 6.5 }
  },
  {
    id: 5,
    name: "왕관",
    perk: "이제 1부터 20까지! 최고 단계예요",
    max: 20,
    goal: null,
    options: 6,
    countMax: 15,
    memoryPairs: 6,
    order: { count: 10, randomStart: true },
    compare: { numerals: "always", less: true, minDiff: 1 },
    missing: { length: 5, steps: [1, 2], descending: true },
    add: { max: 15, minus: true },
    balloon: { goal: 4, duration: 5.5 }
  }
];

export const countObjects = [
  { name: "별", image: "./assets/object-star-storybook-v1.webp" },
  { name: "사과", image: "./assets/object-apple.webp" },
  { name: "하트", image: "./assets/object-heart-storybook-v1.webp" }
];

export const praise = ["잘했어!", "멋져!", "좋았어!", "정말 정확해!", "최고야!"];

export const hangulGameCards = [
  {
    id: "h-listen",
    track: "hangul",
    title: "소리 듣고 찾기",
    subtitle: "소리를 듣고 글자를 골라요",
    intro: "잘 듣고 맞는 글자를 눌러봐!",
    art: "hListen",
    color: "coral",
    reward: 9
  },
  {
    id: "h-picture",
    track: "hangul",
    title: "그림 글자",
    subtitle: "그림을 보고 글자를 찾아요",
    intro: "그림을 보고 맞는 글자를 찾아봐!",
    art: "hPicture",
    color: "mint",
    reward: 9
  },
  {
    id: "h-build",
    track: "hangul",
    title: "글자 만들기",
    subtitle: "자음과 모음을 합쳐요",
    intro: "두 친구를 합치면 어떤 글자가 될까?",
    art: "hBuild",
    color: "sky",
    reward: 10
  },
  {
    id: "h-trace",
    track: "hangul",
    title: "따라 쓰기",
    subtitle: "손가락으로 글자를 써요",
    intro: "회색 글자를 손가락으로 따라 써봐!",
    art: "hTrace",
    color: "lilac",
    reward: 12
  }
];
