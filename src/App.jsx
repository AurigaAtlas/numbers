import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { extraShopItems } from "./itemArt";
import { sfx } from "./sfx";
import { bump, centerOf, flyCoins, prefersReducedMotion, viewportCenter } from "./motion";
import {
  BackIcon,
  BagIcon,
  CheckIcon,
  CloudShape,
  CoinIcon,
  FlameIcon,
  GiftIcon,
  HeartShape,
  LockIcon,
  PlayIcon,
  ResetIcon,
  SoundOffIcon,
  SpeakerIcon,
  StarShape,
  TrophyIcon
} from "./icons";

const STORAGE_KEY = "numbers-playground-v2";
const LEGACY_STORAGE_KEY = "numbers-playground-v1";
const SOUND_KEY = "numbers-playground-sound";
const UNLOCK_GOAL = 12;

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
const countingWords = ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
const countObjects = [
  { name: "별", image: "./assets/object-star.png" },
  { name: "사과", image: "./assets/object-apple.png" },
  { name: "하트", image: "./assets/object-heart.png" }
];

function raisedShopPrice(price) {
  return price === 0 ? 0 : Math.ceil(price * 3);
}

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
    image: "./assets/avatar-gen-rainbow-dress.png",
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
    image: "./assets/avatar-gen-princess-dress.png",
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
    image: "./assets/avatar-gen-royal-dress.png",
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
    image: "./assets/avatar-gen-sun-hat.png",
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
    image: "./assets/avatar-gen-star-crown.png",
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
    image: "./assets/avatar-gen-flower-tiara.png",
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
    image: "./assets/avatar-gen-heart-wand.png",
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
    image: "./assets/avatar-gen-butterfly-wings.png",
    previewImage: "./assets/shop-butterfly-wings-v3.png",
    avatarImage: "./assets/avatar-gen-butterfly-wings.png",
    description: "캐릭터 뒤에 달리는 날개"
  },
  ...extraShopItems.filter(Boolean)
].map((item) => ({
  ...item,
  price: raisedShopPrice(item.price)
}));

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
    intro: "잘 듣고 맞는 숫자를 눌러봐!",
    image: "./assets/game-find.png",
    color: "coral",
    reward: 9
  },
  {
    id: "count",
    title: "몇 개일까",
    subtitle: "그림을 세고 숫자를 눌러요",
    intro: "그림을 하나씩 눌러서 세어봐!",
    image: "./assets/game-count.png",
    color: "mint",
    reward: 9
  },
  {
    id: "order",
    title: "차례차례",
    subtitle: "1부터 순서대로 눌러요",
    intro: "1부터 차례대로 눌러봐!",
    image: "./assets/game-order.png",
    color: "sky",
    reward: 10
  },
  {
    id: "memory",
    title: "카드 기억하기",
    subtitle: "같은 숫자 카드를 찾아요",
    intro: "카드를 뒤집어서 같은 숫자 짝을 찾아봐!",
    image: "./assets/game-memory.png",
    color: "lilac",
    reward: 16
  }
];

const praise = ["잘했어!", "멋져!", "좋았어!", "정말 정확해!", "최고야!"];
const confettiColors = ["#FF5C7A", "#FFC62E", "#3CC47C", "#3D8BFF", "#A07CFF", "#FF8A3D", "#22B8CF"];

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode); the game still works for this visit.
  }
  return next;
}

function loadSoundPreference() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

function rand(max) {
  return Math.floor(Math.random() * max) + 1;
}

function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function makeOptions(answer, maxNumber) {
  const pool = Array.from({ length: maxNumber }, (_, index) => index + 1).filter((n) => n !== answer);
  return shuffle([answer, ...shuffle(pool).slice(0, 3)]);
}

// Picks 을/를 (or 이/가 etc.) from whether the last Hangul syllable has a final consonant.
function josa(word, withFinal, withoutFinal) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${hasFinal ? withFinal : withoutFinal}`;
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

function speak(text, { rate = 0.88, onStart, onEnd } = {}) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.voice = getKoreanVoice();
  utterance.rate = rate;
  utterance.pitch = 1.04;
  utterance.volume = 1;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function makeRound(gameId, maxNumber) {
  const answer = rand(maxNumber);
  const base = { id: `${Date.now()}-${Math.random()}`, gameId, feedback: null };
  if (gameId === "order") {
    return {
      ...base,
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
    return { ...base, cards, flipped: [], resolving: false };
  }
  if (gameId === "count") {
    return {
      ...base,
      answer,
      count: answer,
      tapped: [],
      object: countObjects[rand(countObjects.length) - 1],
      options: makeOptions(answer, maxNumber)
    };
  }
  return { ...base, answer, options: makeOptions(answer, maxNumber) };
}

function useCountUp(value) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);

  useEffect(() => {
    const start = shownRef.current;
    if (start === value) return undefined;
    if (prefersReducedMotion()) {
      shownRef.current = value;
      setShown(value);
      return undefined;
    }
    // Wait for flying coins to land before counting up; spend instantly.
    const delay = value > start ? 650 : 0;
    const duration = 600;
    let frame = 0;
    let startedAt = null;
    const timer = window.setTimeout(() => {
      const step = (time) => {
        startedAt ??= time;
        const progress = Math.min(1, (time - startedAt) / duration);
        const eased = 1 - (1 - progress) ** 3;
        const next = Math.round(start + (value - start) * eased);
        shownRef.current = next;
        setShown(next);
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return shown;
}

export default function App() {
  const [profile, setProfile] = useState(loadState);
  const [screen, setScreen] = useState("home");
  const [activeGame, setActiveGame] = useState(null);
  const [round, setRound] = useState(null);
  const [shopCategory, setShopCategory] = useState("all");
  const [celebration, setCelebration] = useState(null);
  const [message, setMessage] = useState("오늘도 숫자랑 같이 놀아볼까?");
  const [toast, setToast] = useState(null);
  const [mood, setMood] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [soundOn, setSoundOn] = useState(loadSoundPreference);
  const [shopFx, setShopFx] = useState(null);

  const walletRef = useRef(null);
  const timers = useRef(new Set());
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const shownCoins = useCountUp(profile.coins);

  useEffect(() => {
    sfx.setEnabled(soundOn);
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    } catch {
      // ignore
    }
  }, [soundOn]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    timers.current.forEach((id) => window.clearTimeout(id));
  }, []);

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

  const schedule = useCallback((callback, delay) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, delay);
    timers.current.add(id);
  }, []);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current.clear();
  }

  function updateProfile(updater) {
    setProfile((current) => saveState(normalizeState(updater(current))));
  }

  function showToast(text, tone = "info") {
    setToast({ id: Date.now(), text, tone });
  }

  function coinsToWallet(from, count) {
    flyCoins({
      from,
      to: centerOf(walletRef.current),
      count,
      onEach: () => {
        sfx.coin();
        bump(walletRef.current);
      }
    });
  }

  function goHome() {
    clearTimers();
    stopSpeaking();
    setSpeaking(false);
    setCelebration(null);
    setScreen("home");
    setActiveGame(null);
    setRound(null);
    setMessage("또 어떤 놀이를 해볼까?");
  }

  function openShop() {
    sfx.tap();
    setScreen("shop");
    setMessage("마음에 드는 옷을 골라봐!");
  }

  function sayNumber(number) {
    const word = numberWords[number] ?? String(number);
    speak(`${josa(word, "을", "를")} 찾아주세요.`, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false)
    });
  }

  function startGame(gameId, { fresh = true } = {}) {
    clearTimers();
    const game = gameCards.find((card) => card.id === gameId);
    const nextRound = makeRound(gameId, profileRef.current.progress.maxNumber);
    setActiveGame(game);
    setRound(nextRound);
    setScreen("game");
    setCelebration(null);
    if (fresh) {
      sfx.tap();
      setMessage(game.intro);
    }
    if (gameId === "find") {
      schedule(() => sayNumber(nextRound.answer), fresh ? 650 : 450);
    }
  }

  function triggerCelebration(reward) {
    const id = Date.now();
    setCelebration({ id, reward, word: praise[rand(praise.length) - 1] });
    schedule(() => {
      setCelebration((current) => (current?.id === id ? null : current));
    }, 1500);
  }

  function finishRound(correct, gameId) {
    const game = gameCards.find((card) => card.id === gameId);
    const reward = correct ? game.reward : 4;
    const nextMessage = correct ? praise[rand(praise.length) - 1] : "괜찮아, 다시 해보자!";
    if (correct) {
      sfx.correct();
      triggerCelebration(reward);
    } else {
      sfx.wrong();
    }
    setMood({ id: Date.now(), type: correct ? "happy" : "oops" });
    setMessage(`${nextMessage} 코인 ${reward}개를 받았어.`);
    updateProfile((current) => {
      const playedRounds = current.progress.playedRounds + 1;
      const correctAnswers = current.progress.correctAnswers + (correct ? 1 : 0);
      const streak = correct ? current.progress.streak + 1 : 0;
      const bestStreak = Math.max(current.progress.bestStreak, streak);
      const maxNumber = correctAnswers >= UNLOCK_GOAL ? 10 : current.progress.maxNumber;
      return {
        ...current,
        coins: current.coins + reward,
        progress: { maxNumber, playedRounds, correctAnswers, streak, bestStreak }
      };
    });
    schedule(() => coinsToWallet(viewportCenter(), correct ? 6 : 3), correct ? 420 : 500);
    schedule(() => startGame(gameId, { fresh: false }), correct ? 1650 : 1900);
  }

  function chooseNumber(value) {
    if (!round || round.feedback) return;
    const correct = value === round.answer;
    setRound({ ...round, feedback: { picked: value, correct } });
    finishRound(correct, round.gameId);
  }

  function tapCountObject(index) {
    if (!round || round.gameId !== "count" || round.feedback || round.tapped.includes(index)) return;
    const tapped = [...round.tapped, index];
    setRound({ ...round, tapped });
    sfx.count(tapped.length);
    speak(countingWords[tapped.length], { rate: 1 });
    if (tapped.length === round.count) {
      setMessage(`모두 ${countingWords[tapped.length]}! 이제 숫자를 골라봐.`);
    }
  }

  function chooseOrder(value) {
    if (!round || round.gameId !== "order" || round.feedback) return;
    if (round.selected.includes(value)) return;
    if (value !== round.next) {
      setRound({ ...round, feedback: { picked: value, correct: false } });
      finishRound(false, round.gameId);
      return;
    }
    const selected = [...round.selected, value];
    sfx.count(value);
    if (value === round.answer) {
      setRound({ ...round, selected, feedback: { picked: value, correct: true } });
      finishRound(true, round.gameId);
      return;
    }
    setRound({ ...round, selected, next: value + 1 });
    setMessage(`${value} 다음은 ${value + 1}!`);
  }

  function chooseMemory(cardId) {
    if (!round || round.gameId !== "memory" || round.resolving || round.feedback) return;
    const card = round.cards.find((candidate) => candidate.id === cardId);
    if (!card || card.matched || round.flipped.includes(cardId)) return;

    sfx.flip();
    const flipped = [...round.flipped, cardId];
    if (flipped.length === 1) {
      setRound({ ...round, flipped });
      setMessage("같은 숫자 카드를 하나 더 찾아봐.");
      return;
    }

    const [firstId, secondId] = flipped;
    const first = round.cards.find((candidate) => candidate.id === firstId);
    const second = round.cards.find((candidate) => candidate.id === secondId);

    if (first.value === second.value) {
      setRound({ ...round, flipped, resolving: true });
      schedule(() => {
        sfx.pop();
        setRound((current) => {
          if (current?.id !== round.id) return current;
          const cards = current.cards.map((candidate) =>
            candidate.value === first.value ? { ...candidate, matched: true } : candidate
          );
          const allMatched = cards.every((candidate) => candidate.matched);
          return {
            ...current,
            cards,
            flipped: [],
            resolving: false,
            feedback: allMatched ? { correct: true } : null
          };
        });
        setMessage(`${first.value} 짝을 찾았어!`);
        const allMatched = round.cards.every((candidate) => candidate.matched || candidate.value === first.value);
        if (allMatched) schedule(() => finishRound(true, "memory"), 450);
      }, 420);
      return;
    }

    setRound({ ...round, flipped, resolving: true });
    setMessage("다른 카드야. 자리를 기억해보자.");
    schedule(() => {
      setRound((current) => (
        current?.id === round.id
          ? { ...current, flipped: [], resolving: false }
          : current
      ));
    }, 1000);
  }

  function buyOrEquip(item, element) {
    const owned = profile.inventory.includes(item.id);
    const equipped = profile.equipped[item.type] === item.id;
    if (!owned && profile.coins < item.price) {
      const shortage = item.price - profile.coins;
      const notice = `${josa(item.name, "을", "를")} 사려면 코인이 ${shortage}개 더 필요해.`;
      sfx.wrong();
      setMessage(notice);
      showToast(notice, "warn");
      setShopFx({ id: item.id, kind: "shake", key: Date.now() });
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
    if (!owned) {
      sfx.buy();
      flyCoins({
        from: centerOf(walletRef.current),
        to: centerOf(element),
        count: Math.min(8, Math.ceil(item.price / 5))
      });
      bump(walletRef.current);
      setShopFx({ id: item.id, kind: "sparkle", key: Date.now() });
      setMood({ id: Date.now(), type: "happy" });
      showToast(`${josa(item.name, "을", "를")} 샀어!`, "success");
    } else {
      sfx.pop();
      if (!equipped) setMood({ id: Date.now(), type: "happy" });
    }
    setMessage(equipped
      ? `${josa(item.name, "을", "를")} 벗었어.`
      : owned
        ? `${josa(item.name, "을", "를")} 장착했어.`
        : `${josa(item.name, "을", "를")} 샀어!`);
  }

  function claimDailyReward(element) {
    const today = todayKey();
    if (profile.lastRewardDate === today) {
      setMessage("오늘의 선물은 이미 받았어. 내일 또 만나!");
      return;
    }
    updateProfile((current) => ({
      ...current,
      coins: current.coins + 25,
      lastRewardDate: today
    }));
    sfx.buy();
    setMood({ id: Date.now(), type: "happy" });
    coinsToWallet(centerOf(element), 8);
    setMessage("오늘의 선물로 코인 25개를 받았어!");
    showToast("오늘의 선물! 코인 25개", "success");
  }

  function resetData() {
    const confirmed = window.confirm("코인, 아이템, 진행도를 처음 상태로 되돌릴까요?");
    if (!confirmed) return;
    clearTimers();
    stopSpeaking();
    const resetProfile = normalizeState({});
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore
    }
    saveState(resetProfile);
    setProfile(resetProfile);
    setScreen("home");
    setActiveGame(null);
    setRound(null);
    setShopCategory("all");
    setCelebration(null);
    setMessage("저장된 데이터를 처음 상태로 돌렸어.");
  }

  return (
    <main className="app-shell">
      <Backdrop />

      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="처음으로">
          <span className="brand-blocks" aria-hidden="true">
            <i className="n-1">1</i>
            <i className="n-2">2</i>
            <i className="n-6">3</i>
          </span>
          <span className="brand-title">
            {"숫자 놀이터".split("").map((char, index) => (
              <span key={index} style={{ "--i": index }}>{char === " " ? " " : char}</span>
            ))}
          </span>
        </button>
        <div className="top-actions">
          <button
            className="icon-button"
            onClick={() => setSoundOn((value) => !value)}
            aria-label={soundOn ? "효과음 끄기" : "효과음 켜기"}
            aria-pressed={soundOn}
          >
            {soundOn ? <SpeakerIcon /> : <SoundOffIcon />}
          </button>
          <button className="icon-button" onClick={resetData} aria-label="초기화">
            <ResetIcon />
          </button>
          <div className="wallet" ref={walletRef} aria-label={`코인 ${profile.coins}개`}>
            <CoinIcon />
            <strong>{shownCoins}</strong>
          </div>
        </div>
      </header>

      {celebration && (
        <Celebration key={celebration.id} reward={celebration.reward} word={celebration.word} />
      )}

      {toast && (
        <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          {toast.text}
        </div>
      )}

      <section className={`stage stage-${screen}`}>
        <Character
          equippedItems={equippedItems}
          message={message}
          roomItem={roomItem}
          progress={profile.progress}
          mood={mood}
        />

        <div className="screen" key={screen}>
          {screen === "home" && (
            <Home
              profile={profile}
              games={gameCards}
              onStart={startGame}
              onShop={openShop}
              onGift={claimDailyReward}
            />
          )}

          {screen === "game" && activeGame && round && (
            <GameScreen
              game={activeGame}
              round={round}
              maxNumber={profile.progress.maxNumber}
              speaking={speaking}
              onBack={goHome}
              onChoose={chooseNumber}
              onCountTap={tapCountObject}
              onOrder={chooseOrder}
              onMemory={chooseMemory}
              onSpeak={() => round?.answer && sayNumber(round.answer)}
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
              fx={shopFx}
              onCategory={(id) => {
                sfx.tap();
                setShopFx(null);
                setShopCategory(id);
              }}
              onBack={goHome}
              onBuyOrEquip={buyOrEquip}
            />
          )}
        </div>
      </section>
    </main>
  );
}

const floaters = [
  { kind: "digit", text: "1", x: 6, y: 18, size: 74, tone: 1, delay: 0, speed: 9 },
  { kind: "star", x: 18, y: 72, size: 34, tone: 3, delay: 1.2, speed: 7 },
  { kind: "digit", text: "7", x: 92, y: 30, size: 86, tone: 7, delay: 2.1, speed: 11 },
  { kind: "heart", x: 84, y: 82, size: 38, tone: 1, delay: 0.6, speed: 8 },
  { kind: "digit", text: "3", x: 46, y: 90, size: 64, tone: 6, delay: 3.2, speed: 10 },
  { kind: "star", x: 64, y: 10, size: 26, tone: 3, delay: 1.8, speed: 6 },
  { kind: "digit", text: "5", x: 30, y: 8, size: 52, tone: 4, delay: 0.9, speed: 12 },
  { kind: "dot", x: 74, y: 58, size: 22, tone: 5, delay: 2.6, speed: 7 },
  { kind: "digit", text: "9", x: 3, y: 62, size: 60, tone: 8, delay: 4, speed: 10 },
  { kind: "heart", x: 56, y: 44, size: 24, tone: 8, delay: 3.6, speed: 9 },
  { kind: "dot", x: 24, y: 40, size: 16, tone: 2, delay: 1.4, speed: 6 },
  { kind: "digit", text: "2", x: 96, y: 92, size: 56, tone: 2, delay: 2.4, speed: 11 }
];

function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-glow glow-a" />
      <div className="backdrop-glow glow-b" />
      <div className="backdrop-glow glow-c" />
      <CloudShape className="cloud cloud-1" />
      <CloudShape className="cloud cloud-2" />
      <CloudShape className="cloud cloud-3" />
      {floaters.map((item, index) => (
        <span
          key={index}
          className={`floater floater-${item.kind} n-${item.tone}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            "--size": `${item.size}px`,
            "--delay": `${-item.delay}s`,
            "--speed": `${item.speed}s`
          }}
        >
          {item.kind === "digit" && item.text}
          {item.kind === "star" && <StarShape />}
          {item.kind === "heart" && <HeartShape />}
        </span>
      ))}
    </div>
  );
}

function Celebration({ reward, word }) {
  const pieces = useMemo(() => Array.from({ length: 44 }, (_, index) => {
    const angle = (index / 44) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 160 + Math.random() * 260;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance * 0.75 - 80,
      fall: 220 + Math.random() * 260,
      rotate: Math.round(Math.random() * 720 - 360),
      delay: Math.round(Math.random() * 120),
      color: confettiColors[index % confettiColors.length],
      shape: index % 4
    };
  }), []);

  return (
    <div className="celebration-layer" aria-hidden="true">
      <div className="celebration-flash" />
      <div className="celebration-rays" />
      <div className="celebration-pop">
        <StarShape className="pop-star pop-star-a" />
        <StarShape className="pop-star pop-star-b" />
        <span className="pop-word">{word}</span>
        <strong className="pop-reward">
          <CoinIcon />+{reward}
        </strong>
      </div>
      {pieces.map((piece, index) => (
        <span
          key={index}
          className={`confetti confetti-${piece.shape}`}
          style={{
            "--x": `${piece.x}px`,
            "--y": `${piece.y}px`,
            "--fall": `${piece.fall}px`,
            "--r": `${piece.rotate}deg`,
            "--d": `${piece.delay}ms`,
            "--c": piece.color
          }}
        />
      ))}
    </div>
  );
}

const moodKeyframes = {
  happy: [
    { transform: "translateY(0) scale(1) rotate(0deg)" },
    { transform: "translateY(-26px) scale(1.06, 0.96) rotate(-3deg)", offset: 0.3 },
    { transform: "translateY(0) scale(0.97, 1.03) rotate(2deg)", offset: 0.55 },
    { transform: "translateY(-10px) scale(1.02) rotate(0deg)", offset: 0.75 },
    { transform: "translateY(0) scale(1) rotate(0deg)" }
  ],
  oops: [
    { transform: "rotate(0deg)" },
    { transform: "rotate(-5deg) translateX(-6px)", offset: 0.25 },
    { transform: "rotate(4deg) translateX(5px)", offset: 0.55 },
    { transform: "rotate(-2deg)", offset: 0.8 },
    { transform: "rotate(0deg)" }
  ]
};

function Character({ equippedItems, message, roomItem, progress, mood }) {
  const bodyRef = useRef(null);
  const layers = [
    { id: "base", type: "base", image: "./assets/avatar-base-generated.png", name: "기본 공주 캐릭터" },
    ...equippedItems.filter((item) => item.type !== "room")
  ];

  useEffect(() => {
    if (!mood || !bodyRef.current || prefersReducedMotion()) return;
    bodyRef.current.animate(moodKeyframes[mood.type], {
      duration: mood.type === "happy" ? 900 : 620,
      easing: "cubic-bezier(0.3, 0.7, 0.3, 1)"
    });
  }, [mood]);

  return (
    <aside className="character-panel">
      <div className="speech" aria-live="polite">
        <p key={message}>{message}</p>
      </div>
      <div className="room-scene">
        <img key={roomItem.id} className="room-art" src={roomItem.image} alt="" aria-hidden="true" />
        <div className="room-sparkles" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <StarShape key={index} className={`room-sparkle sparkle-${index}`} />
          ))}
        </div>
        {mood?.type === "happy" && <span key={mood.id} className="room-burst" aria-hidden="true" />}
        <div className="avatar-floor" aria-hidden="true" />
        <div className="avatar" aria-label="꾸미기 캐릭터">
          <div className="avatar-idle">
            <div className="avatar-body" ref={bodyRef}>
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
        </div>
      </div>
      <div className="mini-stats">
        <span className="stat-chip">
          <FlameIcon />
          연속 <strong key={`s-${progress.streak}`}>{progress.streak}</strong>
        </span>
        <span className="stat-chip">
          <TrophyIcon />
          최고 <strong>{progress.bestStreak}</strong>
        </span>
      </div>
    </aside>
  );
}

function Home({ profile, games, onStart, onShop, onGift }) {
  const unlocked = profile.progress.maxNumber >= 10;
  const earned = Math.min(UNLOCK_GOAL, profile.progress.correctAnswers);
  const giftTaken = profile.lastRewardDate === todayKey();

  return (
    <div className="home-grid">
      <section className="home-hero enter" style={{ "--i": 0 }}>
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="range-chip">1 ~ {profile.progress.maxNumber}</span>
            {unlocked ? "10까지 모두 할 수 있어요" : "숫자 친구들과 놀아요"}
          </p>
          <h1>
            오늘의 <span className="rainbow-word">{"숫자".split("").map((char, index) => <span key={index}>{char}</span>)}</span> 놀이
          </h1>
        </div>
        <div className="summary-actions">
          <button
            className={`chunky-button gift-button ${giftTaken ? "is-taken" : ""}`}
            onClick={(event) => onGift(event.currentTarget)}
            disabled={giftTaken}
          >
            <GiftIcon />
            {giftTaken ? "내일 또 만나요" : "오늘의 선물"}
          </button>
          <button className="chunky-button shop-button" onClick={onShop}>
            <BagIcon />
            상점
          </button>
        </div>
      </section>

      <section className="progress-panel enter" style={{ "--i": 1 }} aria-label="진행도">
        <div className="progress-head">
          <strong>{unlocked ? "10까지 열렸어!" : "별을 모아 10까지 열기"}</strong>
          <span>{earned} / {UNLOCK_GOAL}</span>
        </div>
        <div className="star-track">
          {Array.from({ length: UNLOCK_GOAL }, (_, index) => (
            <span
              key={index}
              className={`star-slot ${index < earned ? "is-filled" : ""}`}
              style={{ "--i": index }}
            >
              <StarShape />
            </span>
          ))}
        </div>
      </section>

      <section className="game-grid" aria-label="게임 목록">
        {games.map((game, index) => (
          <button
            key={game.id}
            className={`game-card ${game.color} enter`}
            style={{ "--i": index + 2 }}
            onClick={() => onStart(game.id)}
          >
            <span className="game-art">
              <img src={game.image} alt="" aria-hidden="true" />
            </span>
            <span className="game-copy">
              <strong>{game.title}</strong>
              <small>{game.subtitle}</small>
              <span className="game-meta">
                <span className="reward-chip"><CoinIcon />+{game.reward}</span>
                <span className="play-dot"><PlayIcon /></span>
              </span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function tileState(value, round, answer) {
  const feedback = round.feedback;
  if (!feedback) return "";
  if (value === feedback.picked) return feedback.correct ? "is-correct" : "is-wrong";
  if (!feedback.correct && value === answer) return "is-answer";
  return "is-dim";
}

function GameScreen({ game, round, maxNumber, speaking, onBack, onChoose, onCountTap, onOrder, onMemory, onSpeak }) {
  return (
    <div className={`play-panel play-${game.color}`}>
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>{game.title}</h2>
          <p className="eyebrow">{game.subtitle}</p>
        </div>
        <span className="reward-chip big"><CoinIcon />+{game.reward}</span>
      </div>

      <div className="round" key={round.id}>
        {game.id === "find" && (
          <>
            <div className={`voice-stage ${speaking ? "is-speaking" : ""}`}>
              <button className="speaker-button" onClick={onSpeak} aria-label="다시 듣기">
                <span className="speaker-ring ring-1" />
                <span className="speaker-ring ring-2" />
                <span className="speaker-ring ring-3" />
                <span className="speaker-core"><SpeakerIcon /></span>
              </button>
              <div className="voice-copy">
                <div className="eq" aria-hidden="true">
                  {Array.from({ length: 7 }, (_, index) => <i key={index} style={{ "--i": index }} />)}
                </div>
                <strong>잘 듣고 숫자를 찾아요</strong>
                <span>스피커를 누르면 다시 들려줘요</span>
              </div>
            </div>
            <OptionGrid round={round} onChoose={onChoose} />
          </>
        )}

        {game.id === "count" && (
          <>
            <div className="count-stage" aria-label={`${round.object.name} ${round.count}개`}>
              <div className="count-field">
                {Array.from({ length: round.count }, (_, index) => {
                  const order = round.tapped.indexOf(index) + 1;
                  return (
                    <button
                      key={index}
                      className={`count-object ${order ? `is-counted n-${order}` : ""}`}
                      style={{ "--i": index, "--tilt": `${((index * 37) % 13) - 6}deg` }}
                      onClick={() => onCountTap(index)}
                      aria-label={order ? `${order}번째` : `${round.object.name} 세기`}
                    >
                      <img src={round.object.image} alt="" aria-hidden="true" />
                      {order > 0 && <span className="count-badge">{order}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="count-meter" aria-hidden="true">
                <span>센 개수</span>
                <strong key={round.tapped.length}>{round.tapped.length}</strong>
              </div>
            </div>
            <OptionGrid round={round} onChoose={onChoose} />
          </>
        )}

        {game.id === "order" && (
          <>
            <div className="order-track" aria-label={`${round.selected.length}개 눌렀어요`}>
              {Array.from({ length: maxNumber }, (_, index) => {
                const value = index + 1;
                const done = round.selected.includes(value);
                const isNext = !round.feedback && value === round.next;
                return (
                  <span
                    key={value}
                    className={`track-slot n-${value} ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
                  >
                    {value}
                  </span>
                );
              })}
            </div>
            <div className={`order-grid count-${maxNumber}`}>
              {round.options.map((value, index) => (
                <button
                  key={value}
                  className={`number-tile n-${value} ${round.selected.includes(value) ? "selected" : ""} ${tileState(value, round, round.next)}`}
                  style={{ "--i": index }}
                  onClick={() => onOrder(value)}
                >
                  <span>{value}</span>
                  {round.selected.includes(value) && <span className="tile-check"><CheckIcon /></span>}
                </button>
              ))}
            </div>
          </>
        )}

        {game.id === "memory" && (
          <div className="memory-grid">
            {round.cards.map((card, index) => {
              const visible = card.matched || round.flipped.includes(card.id);
              return (
                <button
                  key={card.id}
                  className={`memory-card n-${card.value} ${visible ? "visible" : ""} ${card.matched ? "matched" : ""}`}
                  style={{ "--i": index }}
                  onClick={() => onMemory(card.id)}
                  aria-label={visible ? `${card.value}` : "뒤집힌 카드"}
                >
                  <span className="memory-inner">
                    <span className="memory-face memory-back">
                      <StarShape />
                    </span>
                    <span className="memory-face memory-front">{card.value}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OptionGrid({ round, onChoose }) {
  return (
    <div className="option-grid">
      {round.options.map((value, index) => (
        <button
          key={value}
          className={`number-tile n-${value} ${tileState(value, round, round.answer)}`}
          style={{ "--i": index }}
          onClick={() => onChoose(value)}
        >
          <span>{value}</span>
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
  fx,
  onCategory,
  onBack,
  onBuyOrEquip
}) {
  return (
    <div className="shop-panel">
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>꾸미기 상점</h2>
          <p className="eyebrow">게임으로 모은 코인으로 골라요</p>
        </div>
        <span className="reward-chip big"><CoinIcon />{coins}</span>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="상점 카테고리">
        {categories.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={category === tab.id}
            className={category === tab.id ? "active" : ""}
            onClick={() => onCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="shop-showcase">
        <img src="./assets/shop-collection-showcase-v3.png" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">새 컬렉션</p>
          <strong>공주 옷장</strong>
          <span>마음에 드는 옷을 사서 입혀봐요.</span>
        </div>
      </div>

      <div className="shop-grid" key={category}>
        {items.map((item, index) => {
          const owned = inventory.includes(item.id);
          const isEquipped = equipped[item.type] === item.id;
          const affordable = owned || coins >= item.price;
          const effect = fx?.id === item.id ? fx : null;
          return (
            <button
              key={effect ? `${item.id}-${effect.key}` : item.id}
              className={[
                "shop-item",
                `tone-${rarityTone(item.rarity)}`,
                owned ? "owned" : "",
                isEquipped ? "equipped" : "",
                affordable ? "" : "is-locked",
                effect ? `fx-${effect.kind}` : "enter"
              ].join(" ")}
              style={{ "--i": Math.min(index, 12) }}
              onClick={(event) => onBuyOrEquip(item, event.currentTarget)}
            >
              <span className={`rarity rarity-${rarityTone(item.rarity)}`}>{item.rarity}</span>
              {isEquipped && <span className="equipped-badge"><CheckIcon /></span>}
              <span className="shop-art">
                <img
                  className={`shop-preview preview-${item.type}`}
                  src={item.previewImage ?? item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              </span>
              <span className="shop-copy">
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <span className="shop-action">
                {isEquipped ? "해제하기" : owned ? (item.type === "room" ? "바꾸기" : "입어보기") : (
                  <>
                    {affordable ? <CoinIcon /> : <LockIcon />}
                    {item.price}
                  </>
                )}
              </span>
              {effect?.kind === "sparkle" && (
                <span className="buy-burst" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, burst) => (
                    <StarShape key={burst} className={`burst-star b-${burst}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
