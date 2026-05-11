import { useMemo, useState } from "react";

const STORAGE_KEY = "numbers-playground-v1";

const initialState = {
  coins: 0,
  unlockedItems: ["base-outfit"],
  equipped: {
    hat: null,
    outfit: "base-outfit",
    accessory: null
  },
  progress: {
    maxNumber: 5,
    playedRounds: 0,
    correctAnswers: 0
  },
  settings: {
    sound: true
  }
};

const items = [
  { id: "sun-hat", type: "hat", name: "햇살 모자", price: 20, icon: "hat-sun" },
  { id: "star-crown", type: "hat", name: "별 왕관", price: 45, icon: "hat-crown" },
  { id: "base-outfit", type: "outfit", name: "분홍 원피스", price: 0, icon: "outfit-base" },
  { id: "rainbow-outfit", type: "outfit", name: "무지개 옷", price: 35, icon: "outfit-rainbow" },
  { id: "princess-dress", type: "outfit", name: "공주 드레스", price: 70, icon: "outfit-princess" },
  { id: "heart-wand", type: "accessory", name: "하트 요술봉", price: 55, icon: "wand" }
];

const gameCards = [
  { id: "find", title: "숫자 찾기", mark: "?", color: "coral" },
  { id: "count", title: "몇 개일까", mark: "●", color: "mint" },
  { id: "order", title: "차례차례", mark: "1 2", color: "sky" },
  { id: "feed", title: "간식 주기", mark: "★", color: "lemon" },
  { id: "memory", title: "기억하기", mark: "!", color: "lilac" }
];

const praise = ["좋았어!", "잘했어!", "멋져!", "한 번 더!", "최고야!"];
const snackIcons = ["🍓", "🍪", "🍎", "🧁", "⭐"];

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    return { ...initialState, ...JSON.parse(stored) };
  } catch {
    return initialState;
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

function makeRound(gameId, maxNumber) {
  const answer = rand(maxNumber);
  if (gameId === "order") {
    return {
      gameId,
      target: 1,
      answer: maxNumber,
      selected: [],
      next: 1,
      options: shuffle(Array.from({ length: maxNumber }, (_, index) => index + 1))
    };
  }
  if (gameId === "memory") {
    return { gameId, answer, options: makeOptions(answer, maxNumber), hidden: false };
  }
  return { gameId, answer, options: makeOptions(answer, maxNumber), count: answer, fed: 0 };
}

export default function App() {
  const [profile, setProfile] = useState(loadState);
  const [screen, setScreen] = useState("home");
  const [activeGame, setActiveGame] = useState(null);
  const [round, setRound] = useState(null);
  const [message, setMessage] = useState("오늘도 숫자랑 놀아볼까?");

  const equippedItems = useMemo(
    () => items.filter((item) => Object.values(profile.equipped).includes(item.id)),
    [profile.equipped]
  );

  function updateProfile(updater) {
    setProfile((current) => saveState(updater(current)));
  }

  function startGame(gameId) {
    const game = gameCards.find((card) => card.id === gameId);
    const nextRound = makeRound(gameId, profile.progress.maxNumber);
    setActiveGame(game);
    setRound(nextRound);
    setScreen("game");
    setMessage(`${game.title} 시작!`);
    if (gameId === "memory") {
      window.setTimeout(() => {
        setRound((current) => (current?.gameId === "memory" ? { ...current, hidden: true } : current));
      }, 1300);
    }
  }

  function finishRound(correct) {
    const reward = correct ? 8 : 3;
    const nextMessage = correct ? praise[rand(praise.length) - 1] : "괜찮아, 다시 해보자!";
    setMessage(`${nextMessage} 코인 ${reward}개를 받았어.`);
    updateProfile((current) => {
      const playedRounds = current.progress.playedRounds + 1;
      const correctAnswers = current.progress.correctAnswers + (correct ? 1 : 0);
      const maxNumber = correctAnswers >= 12 ? 10 : current.progress.maxNumber;
      return {
        ...current,
        coins: current.coins + reward,
        progress: { maxNumber, playedRounds, correctAnswers }
      };
    });
    window.setTimeout(() => {
      if (activeGame) startGame(activeGame.id);
    }, 900);
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

  function feedSnack() {
    if (!round || round.gameId !== "feed") return;
    const fed = round.fed + 1;
    if (fed === round.answer) {
      setRound({ ...round, fed });
      finishRound(true);
      return;
    }
    setRound({ ...round, fed });
    setMessage(`${fed}개 줬어.`);
  }

  function buyOrEquip(item) {
    const owned = profile.unlockedItems.includes(item.id);
    if (!owned && profile.coins < item.price) {
      setMessage("코인이 조금 더 필요해.");
      return;
    }
    updateProfile((current) => {
      const unlockedItems = owned ? current.unlockedItems : [...current.unlockedItems, item.id];
      return {
        ...current,
        coins: owned ? current.coins : current.coins - item.price,
        unlockedItems,
        equipped: { ...current.equipped, [item.type === "princess" ? "outfit" : item.type]: item.id }
      };
    });
    setMessage(owned ? `${item.name}을 입었어.` : `${item.name}을 샀어!`);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => setScreen("home")} aria-label="처음으로">
          숫자 놀이터
        </button>
        <div className="wallet" aria-label={`코인 ${profile.coins}개`}>
          <span>●</span>
          {profile.coins}
        </div>
      </header>

      <section className="stage">
        <Character equippedItems={equippedItems} message={message} />

        {screen === "home" && (
          <Home
            maxNumber={profile.progress.maxNumber}
            onStart={startGame}
            onShop={() => setScreen("shop")}
          />
        )}

        {screen === "game" && activeGame && round && (
          <GameScreen
            game={activeGame}
            round={round}
            maxNumber={profile.progress.maxNumber}
            onBack={() => setScreen("home")}
            onChoose={chooseNumber}
            onOrder={chooseOrder}
            onFeed={feedSnack}
          />
        )}

        {screen === "shop" && (
          <Shop
            coins={profile.coins}
            owned={profile.unlockedItems}
            equipped={profile.equipped}
            onBack={() => setScreen("home")}
            onBuyOrEquip={buyOrEquip}
          />
        )}
      </section>
    </main>
  );
}

function Character({ equippedItems, message }) {
  const icons = equippedItems.map((item) => item.icon);
  return (
    <aside className="character-panel">
      <div className="speech">{message}</div>
      <div className="avatar" aria-label="꾸미기 캐릭터">
        {icons.includes("hat-sun") && <div className="hat sun-hat" />}
        {icons.includes("hat-crown") && <div className="hat star-crown">★</div>}
        <div className="face">
          <span className="eye left" />
          <span className="eye right" />
          <span className="smile" />
        </div>
        <div className={`dress ${icons.includes("outfit-rainbow") ? "rainbow" : ""} ${icons.includes("outfit-princess") ? "princess" : ""}`}>
          {icons.includes("wand") && <span className="avatar-wand">♡</span>}
        </div>
      </div>
    </aside>
  );
}

function Home({ maxNumber, onStart, onShop }) {
  return (
    <div className="home-grid">
      <div className="section-heading">
        <h1>1부터 {maxNumber}까지 놀아요</h1>
        <button className="shop-link" onClick={onShop}>상점</button>
      </div>
      <div className="game-grid">
        {gameCards.map((game) => (
          <button key={game.id} className={`game-card ${game.color}`} onClick={() => onStart(game.id)}>
            <span className="game-mark">{game.mark}</span>
            <span>{game.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GameScreen({ game, round, maxNumber, onBack, onChoose, onOrder, onFeed }) {
  return (
    <div className="play-panel">
      <div className="play-header">
        <button className="small-button" onClick={onBack}>처음</button>
        <h2>{game.title}</h2>
      </div>

      {game.id === "find" && (
        <>
          <div className="prompt-number">{round.answer}</div>
          <OptionGrid options={round.options} onChoose={onChoose} />
        </>
      )}

      {game.id === "count" && (
        <>
          <div className="objects-row">
            {Array.from({ length: round.count }, (_, index) => (
              <span key={index} className="count-object">{snackIcons[index % snackIcons.length]}</span>
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

      {game.id === "feed" && (
        <div className="feed-zone">
          <div className="feed-target">{round.answer}</div>
          <button className="snack-button" onClick={onFeed}>{snackIcons[round.fed % snackIcons.length]}</button>
          <div className="fed-count">{round.fed} / {round.answer}</div>
        </div>
      )}

      {game.id === "memory" && (
        <>
          <div className={`prompt-number ${round.hidden ? "hidden-number" : ""}`}>
            {round.hidden ? "?" : round.answer}
          </div>
          <OptionGrid options={round.options} onChoose={onChoose} />
        </>
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

function Shop({ coins, owned, equipped, onBack, onBuyOrEquip }) {
  return (
    <div className="shop-panel">
      <div className="play-header">
        <button className="small-button" onClick={onBack}>처음</button>
        <h2>꾸미기 상점</h2>
      </div>
      <div className="shop-grid">
        {items.map((item) => {
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped[item.type] === item.id;
          return (
            <button key={item.id} className="shop-item" onClick={() => onBuyOrEquip(item)}>
              <ItemIcon icon={item.icon} />
              <span>{item.name}</span>
              <strong>{isEquipped ? "입는 중" : isOwned ? "입기" : `${item.price} 코인`}</strong>
            </button>
          );
        })}
      </div>
      <p className="coin-note">가지고 있는 코인: {coins}</p>
    </div>
  );
}

function ItemIcon({ icon }) {
  return <span className={`item-icon ${icon}`} aria-hidden="true" />;
}
