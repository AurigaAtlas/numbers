import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gameCards, levels, praise, shopCategories, shopItems } from "./data";
import { GameScreen } from "./games";
import {
  BagIcon,
  BalloonArt,
  CheckIcon,
  CloudShape,
  CoinIcon,
  CompareArt,
  FlameIcon,
  GearIcon,
  GiftIcon,
  HeartShape,
  LockIcon,
  MathArt,
  MissingArt,
  PlayIcon,
  SoundOffIcon,
  SpeakerIcon,
  StarShape,
  TrophyIcon
} from "./icons";
import { bump, centerOf, flyCoins, prefersReducedMotion, viewportCenter } from "./motion";
import { LevelUpOverlay, SettingsSheet } from "./overlays";
import { countingWord, josa, makeRound, numberJosa, sinoWord } from "./rounds";
import { sfx } from "./sfx";
import { speak, stopSpeaking } from "./voice";

const STORAGE_KEY = "numbers-playground-v2";
const LEGACY_STORAGE_KEY = "numbers-playground-v1";
const SETTINGS_KEY = "numbers-playground-settings";
const LEGACY_SOUND_KEY = "numbers-playground-sound";

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
    level: 1,
    playLevel: 1,
    levelStars: 0,
    playedRounds: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0
  },
  lastRewardDate: null
};

const defaultSettings = {
  sound: true,
  voiceURI: null,
  rate: "normal",
  praiseVoice: true
};

const confettiColors = ["#FF5C7A", "#FFC62E", "#3CC47C", "#3D8BFF", "#A07CFF", "#FF8A3D", "#22B8CF"];
const gameArt = { compare: CompareArt, missing: MissingArt, math: MathArt, balloon: BalloonArt };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeProgress(raw) {
  const progress = { ...defaultState.progress, ...raw };
  if (raw && raw.level === undefined) {
    // Profiles from before levels existed: "10까지 열림" becomes level 2.
    const level = (raw.maxNumber ?? 5) >= 10 ? 2 : 1;
    progress.level = level;
    progress.playLevel = level;
    progress.levelStars = level === 1 ? Math.min(raw.correctAnswers ?? 0, levels[0].goal - 1) : 0;
  }
  progress.level = clamp(progress.level, 1, levels.length);
  progress.playLevel = clamp(progress.playLevel, 1, progress.level);
  return progress;
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
    progress: normalizeProgress(rawState?.progress)
  };
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return normalizeState({});
    return normalizeState(JSON.parse(stored));
  } catch {
    return normalizeState({});
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

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    return { ...defaultSettings, sound: localStorage.getItem(LEGACY_SOUND_KEY) !== "off" };
  } catch {
    return defaultSettings;
  }
}

function rarityTone(rarity) {
  return {
    기본: "basic",
    고급: "fine",
    희귀: "rare",
    전설: "legend"
  }[rarity] ?? "basic";
}

function randomPraise() {
  return praise[Math.floor(Math.random() * praise.length)];
}

// What the voice says when a round starts (and on "다시 듣기").
function promptFor(round) {
  switch (round.gameId) {
    case "find":
      return `${josa(sinoWord(round.answer), "을", "를")} 찾아주세요.`;
    case "count":
      return "몇 개인지 세어볼까요?";
    case "order":
      return `${sinoWord(round.sequence[0])}부터 차례대로 눌러주세요.`;
    case "compare":
      if (round.showNumerals) return round.ask === "more" ? "더 큰 숫자를 골라주세요." : "더 작은 숫자를 골라주세요.";
      return round.ask === "more" ? "더 많은 쪽을 골라주세요." : "더 적은 쪽을 골라주세요.";
    case "missing":
      return "빈칸에 들어갈 숫자는 뭘까요?";
    case "add":
      return `${sinoWord(round.a)} ${round.op === "+" ? "더하기" : "빼기"} ${josa(sinoWord(round.b), "은", "는")} 얼마일까요?`;
    case "balloon":
      return `${sinoWord(round.target)} 풍선을 터뜨려주세요.`;
    default:
      return null;
  }
}

// The number to say out loud after a wrong answer, when there is one.
function answerNumber(round) {
  if (["find", "count", "missing", "add"].includes(round.gameId)) return round.answer;
  if (round.gameId === "order") return round.next;
  return null;
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
  const [settings, setSettings] = useState(loadSettings);
  const [screen, setScreen] = useState("home");
  const [activeGame, setActiveGame] = useState(null);
  const [round, setRound] = useState(null);
  const [shopCategory, setShopCategory] = useState("all");
  const [celebration, setCelebration] = useState(null);
  const [message, setMessage] = useState("오늘도 숫자랑 같이 놀아볼까?");
  const [toast, setToast] = useState(null);
  const [mood, setMood] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [shopFx, setShopFx] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelUp, setLevelUp] = useState(null);

  const walletRef = useRef(null);
  const timers = useRef(new Set());
  const profileRef = useRef(profile);
  const settingsRef = useRef(settings);
  profileRef.current = profile;
  settingsRef.current = settings;

  const shownCoins = useCountUp(profile.coins);
  const playLevel = levels[profile.progress.playLevel - 1];

  useEffect(() => {
    sfx.setEnabled(settings.sound);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

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

  function updateSettings(patch) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function say(text, { track = false, voiceURI, rate } = {}) {
    const current = settingsRef.current;
    speak(text, {
      voiceURI: voiceURI ?? current.voiceURI,
      rate: rate ?? current.rate,
      onStart: track ? () => setSpeaking(true) : undefined,
      onEnd: track ? () => setSpeaking(false) : undefined
    });
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
    setLevelUp(null);
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

  function speakPrompt(target = round) {
    const text = target && promptFor(target);
    if (text) say(text, { track: true });
  }

  function startGame(gameId, { fresh = true } = {}) {
    clearTimers();
    const game = gameCards.find((card) => card.id === gameId);
    const level = levels[profileRef.current.progress.playLevel - 1];
    const nextRound = makeRound(gameId, level);
    setActiveGame(game);
    setRound(nextRound);
    setScreen("game");
    setCelebration(null);
    if (fresh) {
      sfx.tap();
      setMessage(game.intro);
    }
    if (promptFor(nextRound)) {
      schedule(() => speakPrompt(nextRound), fresh ? 650 : 450);
    }
  }

  function pickLevel(levelId) {
    if (levelId > profile.progress.level) return;
    sfx.pop();
    updateProfile((current) => ({
      ...current,
      progress: { ...current.progress, playLevel: levelId }
    }));
    const level = levels[levelId - 1];
    setMessage(`${level.id}단계 ${level.name}! 1부터 ${level.max}까지 놀아요.`);
  }

  function triggerCelebration(reward) {
    const id = Date.now();
    setCelebration({ id, reward, word: randomPraise() });
    schedule(() => {
      setCelebration((current) => (current?.id === id ? null : current));
    }, 1500);
  }

  function finishRound(correct, finishedRound) {
    const game = gameCards.find((card) => card.id === finishedRound.gameId);
    const current = profileRef.current.progress;
    const level = levels[current.playLevel - 1];
    const reward = correct ? game.reward + (level.id - 1) * 2 : 4;

    let { level: unlocked, playLevel: nextPlayLevel, levelStars } = current;
    let leveledUp = null;
    if (correct && current.playLevel === unlocked && unlocked < levels.length) {
      levelStars += 1;
      if (levelStars >= levels[unlocked - 1].goal) {
        unlocked += 1;
        nextPlayLevel = unlocked;
        levelStars = 0;
        leveledUp = levels[unlocked - 1];
      }
    }
    const streak = correct ? current.streak + 1 : 0;
    const nextProgress = {
      ...current,
      level: unlocked,
      playLevel: nextPlayLevel,
      levelStars,
      playedRounds: current.playedRounds + 1,
      correctAnswers: current.correctAnswers + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(current.bestStreak, streak)
    };

    const word = randomPraise();
    if (correct) {
      sfx.correct();
      triggerCelebration(reward);
      setMessage(`${word} 코인 ${reward}개를 받았어.`);
    } else {
      sfx.wrong();
      const answer = answerNumber(finishedRound);
      setMessage(answer ? `정답은 ${answer}! 코인 ${reward}개를 받았어.` : `괜찮아, 다시 해보자! 코인 ${reward}개를 받았어.`);
    }
    if (settingsRef.current.praiseVoice) {
      const answer = answerNumber(finishedRound);
      const line = correct ? word : answer ? `정답은 ${josa(sinoWord(answer), "이야", "야")}` : "괜찮아, 다시 해보자!";
      schedule(() => say(line), correct ? 250 : 350);
    }
    setMood({ id: Date.now(), type: correct ? "happy" : "oops" });
    updateProfile((latest) => ({
      ...latest,
      coins: latest.coins + reward,
      progress: nextProgress
    }));
    schedule(() => coinsToWallet(viewportCenter(), correct ? 6 : 3), correct ? 420 : 500);

    if (leveledUp) {
      schedule(() => {
        sfx.levelUp();
        setLevelUp(leveledUp);
        setMessage(`${leveledUp.id}단계 ${leveledUp.name}에 올랐어!`);
        if (settingsRef.current.praiseVoice) say(`레벨 업! ${leveledUp.name} 단계가 열렸어요!`);
      }, 1500);
      return;
    }
    schedule(() => startGame(finishedRound.gameId, { fresh: false }), correct ? 1650 : 2100);
  }

  function closeLevelUp() {
    sfx.tap();
    setLevelUp(null);
    if (activeGame) startGame(activeGame.id, { fresh: false });
  }

  function chooseAnswer(value) {
    if (!round || round.feedback) return;
    const correct = value === round.answer;
    setRound({ ...round, feedback: { picked: value, correct } });
    finishRound(correct, round);
  }

  function tapCountObject(index) {
    if (!round || round.gameId !== "count" || round.feedback || round.tapped.includes(index)) return;
    const tapped = [...round.tapped, index];
    setRound({ ...round, tapped });
    sfx.count(Math.min(tapped.length, 12));
    say(countingWord(tapped.length), { rate: "fast" });
    if (tapped.length === round.count) {
      setMessage(`모두 ${countingWord(tapped.length)}! 이제 숫자를 골라봐.`);
    }
  }

  function chooseOrder(value) {
    if (!round || round.gameId !== "order" || round.feedback) return;
    if (round.selected.includes(value)) return;
    if (value !== round.next) {
      setRound({ ...round, feedback: { picked: value, correct: false } });
      finishRound(false, round);
      return;
    }
    const selected = [...round.selected, value];
    sfx.count(Math.min(selected.length, 12));
    if (value === round.answer) {
      setRound({ ...round, selected, feedback: { picked: value, correct: true } });
      finishRound(true, round);
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
        if (allMatched) schedule(() => finishRound(true, round), 450);
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

  function popBalloon(balloonId) {
    if (!round || round.gameId !== "balloon" || round.feedback) return;
    const balloon = round.balloons.find((candidate) => candidate.id === balloonId);
    if (!balloon || round.popped.includes(balloonId)) return;

    if (balloon.value !== round.target) {
      sfx.wrong();
      setRound({ ...round, wrong: { id: balloonId, key: Date.now() } });
      setMessage(`그건 ${balloon.value}! ${numberJosa(round.target, "을", "를")} 찾아봐.`);
      return;
    }

    sfx.pop();
    const popped = [...round.popped, balloonId];
    if (popped.length >= round.goal) {
      setRound({ ...round, popped, wrong: null, feedback: { correct: true } });
      finishRound(true, round);
      return;
    }
    setRound({ ...round, popped, wrong: null });
    setMessage(`펑! ${round.goal - popped.length}개 더 찾아봐.`);
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
    const confirmed = window.confirm("코인, 아이템, 단계를 처음 상태로 되돌릴까요?");
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
    setSettingsOpen(false);
    setScreen("home");
    setActiveGame(null);
    setRound(null);
    setShopCategory("all");
    setCelebration(null);
    setLevelUp(null);
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
            onClick={() => updateSettings({ sound: !settings.sound })}
            aria-label={settings.sound ? "효과음 끄기" : "효과음 켜기"}
            aria-pressed={settings.sound}
          >
            {settings.sound ? <SpeakerIcon /> : <SoundOffIcon />}
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="설정">
            <GearIcon />
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

      {levelUp && <LevelUpOverlay level={levelUp} onClose={closeLevelUp} />}

      {settingsOpen && (
        <SettingsSheet
          settings={settings}
          onChange={updateSettings}
          onPreview={(voiceURI, rate) => say("안녕! 같이 숫자 놀이 하자. 일, 이, 삼!", { voiceURI, rate })}
          onReset={resetData}
          onClose={() => setSettingsOpen(false)}
        />
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
              onPickLevel={pickLevel}
            />
          )}

          {screen === "game" && activeGame && round && (
            <GameScreen
              game={activeGame}
              round={round}
              level={levels[round.level - 1] ?? playLevel}
              reward={activeGame.reward + ((round.level ?? 1) - 1) * 2}
              speaking={speaking}
              onBack={goHome}
              onSpeak={promptFor(round) ? () => speakPrompt() : null}
              onAnswer={chooseAnswer}
              onCountTap={tapCountObject}
              onOrder={chooseOrder}
              onMemory={chooseMemory}
              onBalloon={popBalloon}
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

function Home({ profile, games, onStart, onShop, onGift, onPickLevel }) {
  const { level: unlocked, playLevel, levelStars } = profile.progress;
  const current = levels[playLevel - 1];
  const top = levels[unlocked - 1];
  const maxed = unlocked >= levels.length;
  const percent = maxed ? 100 : Math.round((levelStars / top.goal) * 100);
  const giftTaken = profile.lastRewardDate === todayKey();

  return (
    <div className="home-grid">
      <section className="home-hero enter" style={{ "--i": 0 }}>
        <div className="hero-copy">
          <p className="eyebrow">
            <span className={`level-pill level-${current.id}`}>{current.id}단계 {current.name}</span>
            1부터 {current.max}까지
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

      <section className="level-panel enter" style={{ "--i": 1 }} aria-label="단계">
        <div className="level-progress">
          <div className="level-progress-head">
            <strong>
              {maxed ? "모든 단계를 열었어요!" : `${top.id + 1}단계 ${levels[top.id].name}까지`}
            </strong>
            {!maxed && (
              <span className="star-count">
                <StarShape />
                {levelStars} / {top.goal}
              </span>
            )}
          </div>
          <div className="level-bar">
            <span style={{ width: `${percent}%` }} />
          </div>
          {playLevel < unlocked && (
            <p className="level-hint">연습 중이에요. 별은 {unlocked}단계에서 모여요.</p>
          )}
        </div>
        <div className="level-chips" role="radiogroup" aria-label="단계 고르기">
          {levels.map((level) => {
            const open = level.id <= unlocked;
            const active = level.id === playLevel;
            return (
              <button
                key={level.id}
                role="radio"
                aria-checked={active}
                className={`level-chip level-${level.id} ${active ? "is-active" : ""} ${open ? "" : "is-locked"}`}
                onClick={() => onPickLevel(level.id)}
                disabled={!open}
                style={{ "--i": level.id }}
              >
                <span className="level-chip-num">{open ? level.id : <LockIcon />}</span>
                <span className="level-chip-name">{level.name}</span>
                {active && <span className="level-chip-check"><CheckIcon /></span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="game-grid" aria-label="게임 목록">
        {games.map((game, index) => {
          const Art = game.art ? gameArt[game.art] : null;
          return (
            <button
              key={game.id}
              className={`game-card ${game.color} enter`}
              style={{ "--i": index + 2 }}
              onClick={() => onStart(game.id)}
            >
              <span className="game-art">
                {Art ? <Art /> : <img src={game.image} alt="" aria-hidden="true" />}
              </span>
              <span className="game-copy">
                <strong>{game.title}</strong>
                <small>{game.subtitle}</small>
              </span>
              <span className="game-meta">
                <span className="reward-chip"><CoinIcon />+{game.reward + (current.id - 1) * 2}</span>
                <span className="play-dot"><PlayIcon /></span>
              </span>
            </button>
          );
        })}
      </section>
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
