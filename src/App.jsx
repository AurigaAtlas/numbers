import { useMemo, useState } from "react";

const STORAGE_KEY = "numbers-playground-v2";
const LEGACY_STORAGE_KEY = "numbers-playground-v1";

const defaultState = {
  coins: 30,
  inventory: ["base-outfit", "room-sky"],
  equipped: {
    hat: null,
    outfit: "base-outfit",
    accessory: null,
    room: "room-sky"
  },
  progress: {
    maxNumber: 5,
    playedRounds: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0
  },
  lastRewardDate: null
};

const numberWords = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"];
const countObjects = [
  { name: "별", image: "./assets/object-star.svg" },
  { name: "사과", image: "./assets/object-apple.svg" },
  { name: "하트", image: "./assets/object-heart.svg" }
];

const shopItems = [
  {
    id: "room-sky",
    type: "room",
    name: "공주 놀이방",
    price: 0,
    rarity: "기본",
    image: "./assets/generated-princess-room.png",
    description: "새로 만든 따뜻한 공주방"
  },
  {
    id: "room-castle",
    type: "room",
    name: "성 안뜰",
    price: 10,
    rarity: "희귀",
    image: "./assets/generated-castle-courtyard.png",
    description: "새로 만든 햇살 가득한 성 안뜰"
  },
  {
    id: "room-garden",
    type: "room",
    name: "꽃 정원",
    price: 7,
    rarity: "고급",
    image: "./assets/generated-flower-garden.png",
    description: "새로 만든 꽃과 정자 배경"
  },
  {
    id: "base-outfit",
    type: "outfit",
    name: "분홍 원피스",
    price: 0,
    rarity: "기본",
    image: "./assets/avatar-gen-pink-dress.png",
    previewImage: "./assets/shop-pink-dress-generated.png",
    avatarImage: "./assets/avatar-gen-pink-dress.png",
    description: "캐릭터 몸에 맞춰 만든 기본 드레스"
  },
  {
    id: "rainbow-outfit",
    type: "outfit",
    name: "무지개 드레스",
    price: 5,
    rarity: "고급",
    image: "./assets/outfit-rainbow.svg",
    previewImage: "./assets/shop-rainbow-dress-v3.png",
    avatarImage: "./assets/avatar-gen-rainbow-dress.png",
    description: "색깔이 반짝이는 드레스"
  },
  {
    id: "princess-dress",
    type: "outfit",
    name: "공주 드레스",
    price: 8,
    rarity: "희귀",
    image: "./assets/outfit-princess.svg",
    previewImage: "./assets/shop-princess-dress-v3.png",
    avatarImage: "./assets/avatar-gen-princess-dress.png",
    description: "상점의 대표 공주 옷"
  },
  {
    id: "royal-dress",
    type: "outfit",
    name: "왕실 드레스",
    price: 10,
    rarity: "전설",
    image: "./assets/outfit-royal.svg",
    previewImage: "./assets/shop-royal-dress-v3.png",
    avatarImage: "./assets/avatar-gen-royal-dress.png",
    description: "오래 모으면 살 수 있는 특별한 옷"
  },
  {
    id: "sun-hat",
    type: "hat",
    name: "햇살 모자",
    price: 3,
    rarity: "고급",
    image: "./assets/hat-sun.svg",
    previewImage: "./assets/shop-sun-hat-v3.png",
    avatarImage: "./assets/avatar-gen-sun-hat.png",
    description: "노란 리본이 달린 모자"
  },
  {
    id: "star-crown",
    type: "hat",
    name: "별 왕관",
    price: 6,
    rarity: "희귀",
    image: "./assets/hat-crown.svg",
    previewImage: "./assets/shop-star-crown-v3.png",
    avatarImage: "./assets/avatar-gen-star-crown.png",
    description: "별이 달린 작은 왕관"
  },
  {
    id: "flower-tiara",
    type: "hat",
    name: "꽃 티아라",
    price: 8,
    rarity: "희귀",
    image: "./assets/hat-tiara.svg",
    previewImage: "./assets/shop-flower-tiara-v3.png",
    avatarImage: "./assets/avatar-gen-flower-tiara.png",
    description: "꽃잎 장식 머리띠"
  },
  {
    id: "heart-wand",
    type: "accessory",
    name: "하트 요술봉",
    price: 5,
    rarity: "고급",
    image: "./assets/acc-wand.svg",
    previewImage: "./assets/gen-heart-wand.png",
    avatarImage: "./assets/avatar-gen-heart-wand.png",
    description: "정답을 응원하는 요술봉"
  },
  {
    id: "butterfly-wings",
    type: "accessory",
    name: "나비 날개",
    price: 10,
    rarity: "전설",
    image: "./assets/acc-wings.svg",
    previewImage: "./assets/shop-butterfly-wings-v3.png",
    avatarImage: "./assets/avatar-gen-butterfly-wings.png",
    description: "캐릭터 뒤에 달리는 날개"
  }
];

const shopCategories = [
  { id: "all", label: "전체" },
  { id: "outfit", label: "옷" },
  { id: "hat", label: "모자" },
  { id: "accessory", label: "소품" },
  { id: "room", label: "방" }
];

const gameCards = [
  {
    id: "find",
    title: "숫자 찾기",
    subtitle: "목소리를 듣고 숫자를 골라요",
    image: "./assets/game-find.svg",
    color: "coral",
    reward: 9
  },
  {
    id: "count",
    title: "몇 개일까",
    subtitle: "그림을 세고 숫자를 눌러요",
    image: "./assets/game-count.svg",
    color: "mint",
    reward: 9
  },
  {
    id: "order",
    title: "차례차례",
    subtitle: "1부터 순서대로 눌러요",
    image: "./assets/game-order.svg",
    color: "sky",
    reward: 10
  },
  {
    id: "memory",
    title: "카드 기억하기",
    subtitle: "같은 숫자 카드를 찾아요",
    image: "./assets/game-memory.svg",
    color: "lilac",
    reward: 16
  }
];

const praise = ["잘했어!", "멋져!", "좋았어!", "정말 정확해!", "연속 성공!"];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeState(rawState) {
  const legacyInventory = rawState?.inventory ?? rawState?.unlockedItems ?? [];
  const inventory = Array.from(new Set([...defaultState.inventory, ...legacyInventory]));
  return {
    ...defaultState,
    ...rawState,
    inventory,
    equipped: {
      ...defaultState.equipped,
      ...rawState?.equipped
    },
    progress: {
      ...defaultState.progress,
      ...rawState?.progress
    }
  };
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return defaultState;
    return normalizeState(JSON.parse(stored));
  } catch {
    return defaultState;
  }
}

function saveState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function rand(max) {
  return Math.floor(Math.random() * max) + 1;
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function makeOptions(answer, maxNumber) {
  const pool = Array.from({ length: maxNumber }, (_, index) => index + 1).filter((n) => n !== answer);
  return shuffle([answer, ...shuffle(pool).slice(0, 3)]);
}

function objectParticle(word) {
  return ["일", "삼", "육", "칠", "팔", "십"].includes(word) ? "을" : "를";
}

function rarityTone(rarity) {
  return {
    기본: "basic",
    고급: "fine",
    희귀: "rare",
    전설: "legend"
  }[rarity] ?? "basic";
}

function getKoreanVoice() {
  const voices = window.speechSynthesis.getVoices();
  const koreanVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("ko"));
  const preferredNames = ["Yuna", "Google", "Microsoft", "Heami", "Yuri", "한국", "Korean"];
  return (
    preferredNames
      .map((name) => koreanVoices.find((voice) => voice.name.includes(name)))
      .find(Boolean) ??
    koreanVoices[0] ??
    null
  );
}

function speakNumber(number) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const word = numberWords[number] ?? String(number);
  const utterance = new SpeechSynthesisUtterance(`${word}${objectParticle(word)} 찾아주세요.`);
  utterance.lang = "ko-KR";
  utterance.voice = getKoreanVoice();
  utterance.rate = 0.88;
  utterance.pitch = 1.04;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function makeRound(gameId, maxNumber) {
  const answer = rand(maxNumber);
  if (gameId === "order") {
    return {
      gameId,
      answer: maxNumber,
      selected: [],
      next: 1,
      options: shuffle(Array.from({ length: maxNumber }, (_, index) => index + 1))
    };
  }
  if (gameId === "memory") {
    const pairCount = Math.min(maxNumber, 4);
    const values = shuffle(Array.from({ length: maxNumber }, (_, index) => index + 1)).slice(0, pairCount);
    const cards = shuffle(values.flatMap((value) => [0, 1].map((copy) => ({
      id: `${value}-${copy}`,
      value,
      matched: false
    }))));
    return { gameId, cards, flipped: [], resolving: false };
  }
  if (gameId === "count") {
    return {
      gameId,
      answer,
      count: answer,
      object: countObjects[rand(countObjects.length) - 1],
      options: makeOptions(answer, maxNumber)
    };
  }
  return { gameId, answer, options: makeOptions(answer, maxNumber) };
}

export default function App() {
  const [profile, setProfile] = useState(loadState);
  const [screen, setScreen] = useState("home");
  const [activeGame, setActiveGame] = useState(null);
  const [round, setRound] = useState(null);
  const [shopCategory, setShopCategory] = useState("all");
  const [message, setMessage] = useState("오늘도 숫자랑 같이 놀아볼까?");

  const equippedItems = useMemo(
    () => shopItems.filter((item) => Object.values(profile.equipped).includes(item.id)),
    [profile.equipped]
  );

  const roomItem = useMemo(
    () => shopItems.find((item) => item.id === profile.equipped.room) ?? shopItems[0],
    [profile.equipped.room]
  );

  const filteredShopItems = shopItems.filter((item) => (
    shopCategory === "all" ? true : item.type === shopCategory
  ));

  function updateProfile(updater) {
    setProfile((current) => saveState(normalizeState(updater(current))));
  }

  function goHome() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setScreen("home");
    setActiveGame(null);
    setRound(null);
  }

  function startGame(gameId) {
    const game = gameCards.find((card) => card.id === gameId);
    const nextRound = makeRound(gameId, profile.progress.maxNumber);
    setActiveGame(game);
    setRound(nextRound);
    setScreen("game");
    setMessage(`${game.title} 시작!`);
    if (gameId === "find") {
      window.setTimeout(() => speakNumber(nextRound.answer), 250);
    }
    if (gameId === "memory") {
      setMessage("카드 위치를 기억해서 같은 숫자를 찾아봐.");
    }
  }

  function finishRound(correct) {
    const reward = correct ? activeGame?.reward ?? 9 : 4;
    const nextMessage = correct ? praise[rand(praise.length) - 1] : "괜찮아, 다시 해보자!";
    setMessage(`${nextMessage} 코인 ${reward}개를 받았어.`);
    updateProfile((current) => {
      const playedRounds = current.progress.playedRounds + 1;
      const correctAnswers = current.progress.correctAnswers + (correct ? 1 : 0);
      const streak = correct ? current.progress.streak + 1 : 0;
      const bestStreak = Math.max(current.progress.bestStreak, streak);
      const maxNumber = correctAnswers >= 12 ? 10 : current.progress.maxNumber;
      return {
        ...current,
        coins: current.coins + reward,
        progress: { maxNumber, playedRounds, correctAnswers, streak, bestStreak }
      };
    });
    window.setTimeout(() => {
      if (activeGame) startGame(activeGame.id);
    }, 950);
  }

  function chooseNumber(value) {
    if (!round) return;
    finishRound(value === round.answer);
  }

  function chooseOrder(value) {
    if (!round || round.gameId !== "order") return;
    if (value !== round.next) {
      finishRound(false);
      return;
    }
    const selected = [...round.selected, value];
    if (value === round.answer) {
      setRound({ ...round, selected });
      finishRound(true);
      return;
    }
    setRound({ ...round, selected, next: value + 1 });
    setMessage(`${value} 다음은 ${value + 1}!`);
  }

  function chooseMemory(cardId) {
    if (!round || round.gameId !== "memory" || round.resolving) return;
    const card = round.cards.find((candidate) => candidate.id === cardId);
    if (!card || card.matched || round.flipped.includes(cardId)) return;

    const flipped = [...round.flipped, cardId];
    if (flipped.length === 1) {
      setRound({ ...round, flipped });
      setMessage("같은 숫자 카드를 찾아봐.");
      return;
    }

    const [firstId, secondId] = flipped;
    const first = round.cards.find((candidate) => candidate.id === firstId);
    const second = round.cards.find((candidate) => candidate.id === secondId);

    if (first.value === second.value) {
      const cards = round.cards.map((candidate) =>
        candidate.value === first.value ? { ...candidate, matched: true } : candidate
      );
      const allMatched = cards.every((candidate) => candidate.matched);
      setRound({ ...round, cards, flipped: [], resolving: false });
      setMessage(`${first.value} 짝을 찾았어!`);
      if (allMatched) {
        window.setTimeout(() => finishRound(true), 500);
      }
      return;
    }

    setRound({ ...round, flipped, resolving: true });
    setMessage("다른 카드야. 다시 기억해보자.");
    window.setTimeout(() => {
      setRound((current) => (
        current?.gameId === "memory"
          ? { ...current, flipped: [], resolving: false }
          : current
      ));
    }, 850);
  }

  function buyOrEquip(item) {
    const owned = profile.inventory.includes(item.id);
    const equipped = profile.equipped[item.type] === item.id;
    if (!owned && profile.coins < item.price) {
      setMessage(`${item.name}을 사려면 코인이 더 필요해.`);
      return;
    }
    updateProfile((current) => {
      const currentOwned = current.inventory.includes(item.id);
      const inventory = currentOwned ? current.inventory : [...current.inventory, item.id];
      const isEquipped = current.equipped[item.type] === item.id;
      const nextEquipped = {
        ...current.equipped,
        [item.type]: isEquipped ? null : item.id
      };
      return {
        ...current,
        coins: currentOwned ? current.coins : current.coins - item.price,
        inventory,
        equipped: nextEquipped
      };
    });
    setMessage(equipped ? `${item.name}을 벗었어.` : owned ? `${item.name}을 장착했어.` : `${item.name}을 샀어!`);
  }

  function claimDailyReward() {
    const today = todayKey();
    if (profile.lastRewardDate === today) {
      setMessage("오늘의 선물은 이미 받았어.");
      return;
    }
    updateProfile((current) => ({
      ...current,
      coins: current.coins + 25,
      lastRewardDate: today
    }));
    setMessage("오늘의 선물로 코인 25개를 받았어!");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={goHome} aria-label="처음으로">
          숫자 놀이터
        </button>
        <div className="wallet" aria-label={`코인 ${profile.coins}개`}>
          <span className="coin-dot" />
          {profile.coins}
        </div>
      </header>

      <section className="stage">
        <Character
          equippedItems={equippedItems}
          message={message}
          roomItem={roomItem}
          coins={profile.coins}
        />

        {screen === "home" && (
          <Home
            profile={profile}
            games={gameCards}
            onStart={startGame}
            onShop={() => setScreen("shop")}
            onGift={claimDailyReward}
          />
        )}

        {screen === "game" && activeGame && round && (
          <GameScreen
            game={activeGame}
            round={round}
            maxNumber={profile.progress.maxNumber}
            onBack={goHome}
            onChoose={chooseNumber}
            onOrder={chooseOrder}
            onMemory={chooseMemory}
            onSpeak={() => round?.answer && speakNumber(round.answer)}
          />
        )}

        {screen === "shop" && (
          <Shop
            items={filteredShopItems}
            categories={shopCategories}
            category={shopCategory}
            coins={profile.coins}
            inventory={profile.inventory}
            equipped={profile.equipped}
            onCategory={setShopCategory}
            onBack={goHome}
            onBuyOrEquip={buyOrEquip}
          />
        )}
      </section>
    </main>
  );
}

function Character({ equippedItems, message, roomItem, coins }) {
  const layers = [
    { id: "base", type: "base", image: "./assets/avatar-base-generated.png", name: "기본 공주 캐릭터" },
    ...equippedItems.filter((item) => item.type !== "room")
  ];

  return (
    <aside className="character-panel">
      <div className="speech">{message}</div>
      <div className="room-scene">
        <img className="room-art" src={roomItem.image} alt="" aria-hidden="true" />
        <div className="avatar" aria-label="꾸미기 캐릭터">
          {layers.map((item) => (
            <img
              key={item.id}
              src={item.avatarImage ?? item.image}
              alt=""
              className={`avatar-layer layer-${item.type} avatar-item-${item.id}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <div className="mini-stats" aria-label={`현재 코인 ${coins}개`}>
        <span>보유 코인</span>
        <strong>{coins}</strong>
      </div>
    </aside>
  );
}

function Home({ profile, games, onStart, onShop, onGift }) {
  const unlockProgress = Math.min(100, Math.round((profile.progress.correctAnswers / 12) * 100));
  const giftTaken = profile.lastRewardDate === todayKey();

  return (
    <div className="home-grid">
      <section className="home-summary">
        <div>
          <p className="eyebrow">1부터 {profile.progress.maxNumber}까지</p>
          <h1>오늘의 숫자 놀이</h1>
        </div>
        <div className="summary-actions">
          <button className="gift-button" onClick={onGift} disabled={giftTaken}>
            {giftTaken ? "선물 받음" : "오늘의 선물"}
          </button>
          <button className="shop-link" onClick={onShop}>상점</button>
        </div>
      </section>

      <section className="progress-panel" aria-label="진행도">
        <div>
          <span>10까지 열기</span>
          <strong>{profile.progress.correctAnswers} / 12</strong>
        </div>
        <div className="progress-track">
          <span style={{ width: `${unlockProgress}%` }} />
        </div>
        <div className="progress-facts">
          <span>연속 성공 {profile.progress.streak}</span>
          <span>최고 기록 {profile.progress.bestStreak}</span>
        </div>
      </section>

      <section className="game-grid" aria-label="게임 목록">
        {games.map((game) => (
          <button key={game.id} className={`game-card ${game.color}`} onClick={() => onStart(game.id)}>
            <img src={game.image} alt="" aria-hidden="true" />
            <span className="game-copy">
              <strong>{game.title}</strong>
              <small>{game.subtitle}</small>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function GameScreen({ game, round, maxNumber, onBack, onChoose, onOrder, onMemory, onSpeak }) {
  return (
    <div className="play-panel">
      <div className="play-header">
        <button className="small-button" onClick={onBack}>처음</button>
        <div>
          <p className="eyebrow">코인 {game.reward}개</p>
          <h2>{game.title}</h2>
        </div>
      </div>

      {game.id === "find" && (
        <>
          <div className="voice-prompt">
            <img src="./assets/sound-wave.svg" alt="" aria-hidden="true" />
            <button className="listen-button" onClick={onSpeak}>다시 듣기</button>
          </div>
          <OptionGrid options={round.options} onChoose={onChoose} />
        </>
      )}

      {game.id === "count" && (
        <>
          <div className="objects-row" aria-label={`${round.object.name} ${round.count}개`}>
            {Array.from({ length: round.count }, (_, index) => (
              <img key={index} className="count-object" src={round.object.image} alt="" aria-hidden="true" />
            ))}
          </div>
          <OptionGrid options={round.options} onChoose={onChoose} />
        </>
      )}

      {game.id === "order" && (
        <div className="order-grid">
          {round.options.map((value) => (
            <button
              key={value}
              className={`number-tile ${round.selected.includes(value) ? "selected" : ""}`}
              onClick={() => onOrder(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {game.id === "memory" && (
        <div className="memory-grid">
          {round.cards.map((card) => {
            const visible = card.matched || round.flipped.includes(card.id);
            return (
              <button
                key={card.id}
                className={`memory-card ${visible ? "visible" : ""} ${card.matched ? "matched" : ""}`}
                onClick={() => onMemory(card.id)}
                disabled={card.matched}
              >
                <span>{visible ? card.value : "?"}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OptionGrid({ options, onChoose }) {
  return (
    <div className="option-grid">
      {options.map((value) => (
        <button key={value} className="number-tile" onClick={() => onChoose(value)}>
          {value}
        </button>
      ))}
    </div>
  );
}

function Shop({
  items,
  categories,
  category,
  coins,
  inventory,
  equipped,
  onCategory,
  onBack,
  onBuyOrEquip
}) {
  return (
    <div className="shop-panel">
      <div className="play-header">
        <button className="small-button" onClick={onBack}>처음</button>
        <div>
          <p className="eyebrow">보유 코인 {coins}</p>
          <h2>꾸미기 상점</h2>
        </div>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="상점 카테고리">
        {categories.map((tab) => (
          <button
            key={tab.id}
            className={category === tab.id ? "active" : ""}
            onClick={() => onCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="shop-showcase" aria-label="새로운 상점 컬렉션">
        <img src="./assets/shop-collection-showcase-v3.png" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">새 컬렉션</p>
          <strong>공주 옷장</strong>
          <span>게임으로 모은 코인으로 원하는 스타일을 골라요.</span>
        </div>
      </div>

      <div className="shop-grid">
        {items.map((item) => {
          const owned = inventory.includes(item.id);
          const isEquipped = equipped[item.type] === item.id;
          return (
            <button
              key={item.id}
              className={`shop-item ${owned ? "owned" : ""} ${isEquipped ? "equipped" : ""}`}
              onClick={() => onBuyOrEquip(item)}
            >
              <span className={`rarity rarity-${rarityTone(item.rarity)}`}>{item.rarity}</span>
              <img src={item.previewImage ?? item.image} alt="" aria-hidden="true" />
              <span className="shop-copy">
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <span className="shop-action">
                {isEquipped ? "해제하기" : owned ? "장착하기" : `${item.price} 코인`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
