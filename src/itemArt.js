const customPngAsset = (id) => `./assets/custom-shop-png/${id}.png`;
const customAvatarAsset = (id) => `./assets/custom-shop-avatar/${id}.png`;

const availablePngItems = new Set([
  "candy-dress",
  "candy-headband",
  "cloud-cushion",
  "cloud-dress",
  "flower-bouquet",
  "garden-apron",
  "gem-necklace",
  "heart-balloon",
  "magic-book",
  "mint-beret",
  "mint-ribbon-dress",
  "moon-lantern",
  "moon-hairpin",
  "moonlight-dress",
  "music-mic",
  "ocean-dress",
  "peach-dress",
  "pearl-crown",
  "ribbon-bonnet",
  "ribbon-umbrella",
  "rose-crown",
  "room-candy",
  "room-cloud",
  "room-moon",
  "room-ocean",
  "room-picnic",
  "room-rainbow",
  "room-stage",
  "room-study",
  "room-treasure",
  "room-winter",
  "ruby-gown",
  "ruby-tiara",
  "sky-cap",
  "snow-dress",
  "snow-earmuffs",
  "sparkle-shield",
  "star-bag",
  "star-ribbon",
  "violet-star-dress"
]);

function item({ id, type, name, price, rarity, description }) {
  if (!availablePngItems.has(id)) return null;
  const image = customPngAsset(id);
  return {
    id,
    type,
    name,
    price,
    rarity,
    image,
    previewImage: image,
    avatarImage: type === "room" ? undefined : customAvatarAsset(id),
    description
  };
}

export const extraShopItems = [
  item({
    id: "moonlight-dress",
    type: "outfit",
    name: "달빛 드레스",
    price: 7,
    rarity: "고급",
    description: "은은하게 빛나는 밤하늘 옷"
  }),
  item({
    id: "peach-dress",
    type: "outfit",
    name: "복숭아 드레스",
    price: 6,
    rarity: "고급",
    description: "부드러운 과일색 원피스"
  }),
  item({
    id: "mint-ribbon-dress",
    type: "outfit",
    name: "민트 리본 드레스",
    price: 6,
    rarity: "고급",
    description: "큰 리본이 달린 산뜻한 옷"
  }),
  item({
    id: "violet-star-dress",
    type: "outfit",
    name: "보라별 드레스",
    price: 9,
    rarity: "희귀",
    description: "보라색 별무늬 무대 옷"
  }),
  item({
    id: "ocean-dress",
    type: "outfit",
    name: "바다 물결 드레스",
    price: 8,
    rarity: "희귀",
    description: "파도처럼 흔들리는 파란 옷"
  }),
  item({
    id: "candy-dress",
    type: "outfit",
    name: "캔디 드레스",
    price: 7,
    rarity: "고급",
    description: "알록달록 점무늬 드레스"
  }),
  item({
    id: "snow-dress",
    type: "outfit",
    name: "눈꽃 드레스",
    price: 8,
    rarity: "희귀",
    description: "하얀 눈꽃 장식 옷"
  }),
  item({
    id: "garden-apron",
    type: "outfit",
    name: "정원 앞치마",
    price: 6,
    rarity: "고급",
    description: "꽃밭 놀이에 어울리는 옷"
  }),
  item({
    id: "ruby-gown",
    type: "outfit",
    name: "루비 무도회복",
    price: 12,
    rarity: "전설",
    description: "반짝이는 보석빛 예복"
  }),
  item({
    id: "cloud-dress",
    type: "outfit",
    name: "구름 드레스",
    price: 7,
    rarity: "고급",
    description: "폭신한 구름색 드레스"
  }),

  item({
    id: "moon-hairpin",
    type: "hat",
    name: "달빛 머리핀",
    price: 4,
    rarity: "고급",
    description: "작은 달 장식 머리핀"
  }),
  item({
    id: "ribbon-bonnet",
    type: "hat",
    name: "리본 보닛",
    price: 5,
    rarity: "고급",
    description: "둥근 리본 모자"
  }),
  item({
    id: "pearl-crown",
    type: "hat",
    name: "진주 왕관",
    price: 9,
    rarity: "희귀",
    description: "진주빛이 도는 작은 왕관"
  }),
  item({
    id: "mint-beret",
    type: "hat",
    name: "민트 베레모",
    price: 5,
    rarity: "고급",
    description: "가볍게 얹는 민트색 모자"
  }),
  item({
    id: "candy-headband",
    type: "hat",
    name: "캔디 머리띠",
    price: 5,
    rarity: "고급",
    description: "달콤한 색의 큰 리본"
  }),
  item({
    id: "sky-cap",
    type: "hat",
    name: "하늘 캡",
    price: 4,
    rarity: "고급",
    description: "활동하기 편한 파란 캡"
  }),
  item({
    id: "ruby-tiara",
    type: "hat",
    name: "루비 티아라",
    price: 10,
    rarity: "전설",
    description: "붉은 보석이 박힌 티아라"
  }),
  item({
    id: "snow-earmuffs",
    type: "hat",
    name: "눈꽃 귀마개",
    price: 6,
    rarity: "희귀",
    description: "추운 방에서도 포근한 장식"
  }),
  item({
    id: "star-ribbon",
    type: "hat",
    name: "별 리본핀",
    price: 5,
    rarity: "고급",
    description: "별빛이 붙은 리본핀"
  }),
  item({
    id: "rose-crown",
    type: "hat",
    name: "장미 화관",
    price: 8,
    rarity: "희귀",
    description: "꽃잎처럼 둘러 쓰는 화관"
  }),

  item({
    id: "heart-balloon",
    type: "accessory",
    name: "하트 풍선",
    price: 5,
    rarity: "고급",
    description: "둥실 뜨는 하트 풍선"
  }),
  item({
    id: "star-bag",
    type: "accessory",
    name: "별 가방",
    price: 6,
    rarity: "고급",
    description: "별 장식이 붙은 작은 가방"
  }),
  item({
    id: "moon-lantern",
    type: "accessory",
    name: "달 랜턴",
    price: 7,
    rarity: "희귀",
    description: "은은하게 빛나는 손전등"
  }),
  item({
    id: "flower-bouquet",
    type: "accessory",
    name: "꽃다발",
    price: 6,
    rarity: "고급",
    description: "정원에서 딴 듯한 꽃다발"
  }),
  item({
    id: "magic-book",
    type: "accessory",
    name: "마법 책",
    price: 8,
    rarity: "희귀",
    description: "숫자 주문이 적힌 책"
  }),
  item({
    id: "ribbon-umbrella",
    type: "accessory",
    name: "리본 우산",
    price: 7,
    rarity: "고급",
    description: "비 오는 방에도 어울리는 우산"
  }),
  item({
    id: "gem-necklace",
    type: "accessory",
    name: "보석 목걸이",
    price: 8,
    rarity: "희귀",
    description: "드레스 위에 반짝이는 보석"
  }),
  item({
    id: "music-mic",
    type: "accessory",
    name: "노래 마이크",
    price: 6,
    rarity: "고급",
    description: "정답 노래를 부르는 마이크"
  }),
  item({
    id: "sparkle-shield",
    type: "accessory",
    name: "반짝 방패",
    price: 9,
    rarity: "전설",
    description: "용기 있게 문제를 푸는 방패"
  }),
  item({
    id: "cloud-cushion",
    type: "accessory",
    name: "구름 쿠션",
    price: 5,
    rarity: "고급",
    description: "폭신하게 안고 있는 쿠션"
  }),

  item({
    id: "room-moon",
    type: "room",
    name: "달빛 방",
    price: 8,
    rarity: "희귀",
    description: "달이 떠 있는 조용한 방"
  }),
  item({
    id: "room-candy",
    type: "room",
    name: "캔디 방",
    price: 7,
    rarity: "고급",
    description: "알록달록한 사탕색 방"
  }),
  item({
    id: "room-study",
    type: "room",
    name: "숫자 공부방",
    price: 6,
    rarity: "고급",
    description: "숫자 놀이를 하기 좋은 방"
  }),
  item({
    id: "room-ocean",
    type: "room",
    name: "바다 방",
    price: 8,
    rarity: "희귀",
    description: "파도 무늬가 들어간 방"
  }),
  item({
    id: "room-stage",
    type: "room",
    name: "무대 방",
    price: 10,
    rarity: "전설",
    description: "커튼이 열린 작은 무대"
  }),
  item({
    id: "room-winter",
    type: "room",
    name: "눈꽃 방",
    price: 8,
    rarity: "희귀",
    description: "하얀 눈꽃이 보이는 방"
  }),
  item({
    id: "room-picnic",
    type: "room",
    name: "피크닉 방",
    price: 7,
    rarity: "고급",
    description: "돗자리와 햇살이 있는 방"
  }),
  item({
    id: "room-cloud",
    type: "room",
    name: "구름 방",
    price: 7,
    rarity: "고급",
    description: "구름 위에 있는 듯한 방"
  }),
  item({
    id: "room-rainbow",
    type: "room",
    name: "무지개 방",
    price: 9,
    rarity: "희귀",
    description: "무지개가 크게 걸린 방"
  }),
  item({
    id: "room-treasure",
    type: "room",
    name: "보물 방",
    price: 11,
    rarity: "전설",
    description: "코인을 모아 여는 반짝 방"
  })
].filter(Boolean);
