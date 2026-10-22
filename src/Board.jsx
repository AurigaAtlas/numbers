import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AddGame, CountGame } from "./games";
import { tileState } from "./gameParts";
import { HangulBuild, HangulPicture } from "./hangulGames";
import { HouseArt } from "./HouseArt";
import { initialOf, letterName, makeHangulRound } from "./hangul";
import { BackIcon } from "./icons";
import {
  BOARD_SIZE,
  FINISH_COINS,
  LOT_COUNT,
  MAX_MONEY,
  PASS_START_REWARD,
  PIGGY_FEE,
  QUIZ_REWARD,
  SCHOOL_REWARD,
  addMoney,
  createGame,
  diceFaces,
  gameLengths,
  groupColors,
  houseNames,
  houseValue,
  housesOf,
  nextTurn,
  personNames,
  playerColors,
  robotNames,
  tileById,
  tileCell,
  tiles,
  tollOf,
  tokens,
  totalOf,
  upgradeCost
} from "./board";
import { countingWord, josa, makeOptions, makeRound, randInt, toneClass } from "./rounds";
import { sfx } from "./sfx";
import { say as lines, possessive, withRo } from "./speech";

const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const STEP_MS = 520;
const ROBOT_WAIT = 1500;

function withPlayer(game, index, patch) {
  return { ...game, players: game.players.map((player, i) => (i === index ? { ...player, ...patch } : player)) };
}

// Sells the cheapest houses back to the bank until `need` can be paid.
function sellForDebt(game, index, need) {
  let next = game;
  const sold = [];
  const houses = housesOf(game, index).sort((a, b) => houseValue(tileById[a[0]], a[1]) - houseValue(tileById[b[0]], b[1]));
  for (const [id, house] of houses) {
    if (next.players[index].money >= need) break;
    const owned = { ...next.owned };
    delete owned[id];
    next = withPlayer({ ...next, owned }, index, { money: addMoney(next.players[index].money, houseValue(tileById[id], house)) });
    sold.push(tileById[id]);
  }
  return { game: next, sold };
}

function Die({ value, rolling, numeral, numberFrom, counted }) {
  return (
    <span className={`die ${rolling ? "is-rolling" : ""} ${numeral ? "is-numeral" : ""}`}>
      {numeral ? (
        <b className={`die-numeral ${toneClass(value)}`}>{value}</b>
      ) : (
        Array.from({ length: 9 }, (_, cell) => {
          const pipIndex = PIPS[value].indexOf(cell);
          const label = numberFrom + pipIndex;
          return (
            <i key={cell} className={pipIndex >= 0 ? "pip" : ""}>
              {pipIndex >= 0 && counted >= label && <em className={toneClass(label)}>{label}</em>}
            </i>
          );
        })
      )}
    </span>
  );
}

function Won({ n, big = false }) {
  return (
    <span className={`won ${big ? "is-big" : ""}`}>
      <i className="won-coin" aria-hidden="true" />
      <b>{n}</b>원
    </span>
  );
}

// Money shown as real coins in rows of ten, so amounts can be counted.
function CoinRows({ count, taken = 0, onTap, small = false }) {
  const rows = Math.max(1, Math.ceil(count / 10));
  return (
    <div className={`coin-rows ${small ? "is-small" : ""}`}>
      {Array.from({ length: rows }, (_, row) => (
        <div className="coin-row" key={row}>
          {Array.from({ length: 10 }, (_, cell) => {
            const index = row * 10 + cell;
            if (index >= count) return <span key={cell} className="coin-slot is-empty" />;
            const gone = index >= count - taken;
            return (
              <button
                key={cell}
                type="button"
                className={`coin-slot ${gone ? "is-gone" : ""}`}
                onClick={onTap && !gone ? onTap : undefined}
                disabled={!onTap || gone}
                aria-label="동전"
              >
                <i className="won-coin" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Paying is counting: tap one coin at a time into the tray. Robots pay by themselves.
function PayPanel({ player, amount, title, auto, numbersLevelId, say, onDone }) {
  const [paid, setPaid] = useState(0);
  const timers = useRef([]);
  const done = paid >= amount;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!auto) return;
    timers.current = Array.from({ length: amount }, (_, index) => setTimeout(() => payOne(index + 1), 700 + index * 520));
    return () => timers.current.forEach(clearTimeout);
    // payOne only uses state setters and props that do not change while paying.
  }, [auto, amount]);
  useEffect(() => {
    if (!done) return undefined;
    const id = setTimeout(onDone, 1100);
    return () => clearTimeout(id);
    // onDone is a fresh closure every render; it is called once when paying completes.
  }, [done]);

  function payOne(next = paid + 1) {
    if (next > amount) return;
    setPaid(next);
    sfx.count(Math.min(next, 12));
    say(lines.counting(next), { rate: "fast" });
  }

  function helpMe() {
    timers.current.forEach(clearTimeout);
    timers.current = Array.from({ length: amount - paid }, (_, index) => setTimeout(() => payOne(paid + index + 1), index * 520));
  }

  const left = player.money - paid;
  return (
    <div className="pay-panel">
      <p className="pay-title">{title}</p>
      <div className="pay-tray" aria-label={`${amount}원 내기`}>
        {Array.from({ length: amount }, (_, index) => (
          <span key={index} className={`tray-slot ${index < paid ? "is-filled" : ""}`}>
            {index < paid ? <i className="won-coin" /> : <em>{index + 1}</em>}
          </span>
        ))}
      </div>
      <p className="pay-count">
        <strong className={toneClass(Math.max(paid, 1))}>{paid}</strong> / {amount}원
      </p>
      <div className="pay-wallet">
        <span className="pay-who">{player.token} {possessive(player.name)} 돈</span>
        <CoinRows count={player.money} taken={paid} onTap={!auto && !done ? () => payOne() : undefined} />
      </div>
      {done ? (
        <p className="pay-equation" key="eq">
          {numbersLevelId >= 3 ? (
            <>{player.money} − {amount} = <b>{left}</b></>
          ) : (
            <>남은 돈 <b>{left}</b>원</>
          )}
        </p>
      ) : (
        !auto && <button className="pay-help" onClick={helpMe}>같이 세어줘</button>
      )}
    </div>
  );
}

function PlayerCard({ player, index, active, fx }) {
  return (
    <div className={`player-card ${active ? "is-active" : ""}`} style={{ "--player": player.color }}>
      <span className="player-token">{player.token}</span>
      <span className="player-name">
        {player.name}
        {player.robot && <small>로봇</small>}
        {player.skip > 0 && <small className="is-sleep">쿨쿨</small>}
      </span>
      <span className="player-money"><Won n={player.money} /></span>
      <span className="player-bar" aria-hidden="true">
        <i style={{ width: `${(player.money / MAX_MONEY) * 100}%` }} />
      </span>
      {fx?.player === index && (
        <span key={fx.id} className={`money-fx ${fx.amount < 0 ? "is-minus" : ""}`}>
          {fx.amount > 0 ? "+" : "−"}{Math.abs(fx.amount)}원
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- setup

function Setup({ setup, onChange, onStart }) {
  const [naming, setNaming] = useState(null);
  const players = setup.players;

  function patchPlayer(index, patch) {
    onChange({ ...setup, players: players.map((player, i) => (i === index ? { ...player, ...patch } : player)) });
  }

  function nextToken(index) {
    sfx.pop();
    const taken = players.slice(0, setup.count).filter((_, i) => i !== index).map((player) => player.token);
    let at = tokens.indexOf(players[index].token);
    do at = (at + 1) % tokens.length; while (taken.includes(tokens[at]));
    patchPlayer(index, { token: tokens[at] });
  }

  function toggleRobot(index) {
    sfx.tap();
    const robot = !players[index].robot;
    const usedRobots = players.slice(0, setup.count).filter((p, i) => i !== index && p.robot).map((p) => p.name);
    const name = robot ? robotNames.find((n) => !usedRobots.includes(n)) ?? "로봇" : personNames[Math.min(index, personNames.length - 1)];
    const taken = players.slice(0, setup.count).filter((_, i) => i !== index).map((player) => player.token);
    const token = robot && !taken.includes("🤖") ? "🤖" : players[index].token;
    patchPlayer(index, { robot, name, token });
  }

  return (
    <div className="board-setup">
      <h3 className="setup-title">누구랑 놀까요?</h3>
      <div className="segmented setup-count">
        {[2, 3, 4].map((count) => (
          <button
            key={count}
            className={setup.count === count ? "active" : ""}
            onClick={() => {
              sfx.tap();
              // Keep tokens unique when more seats open up.
              const seats = players.map((player, i) => {
                const earlier = players.slice(0, i).map((p) => p.token);
                return earlier.includes(player.token) ? { ...player, token: tokens.find((t) => !earlier.includes(t)) } : player;
              });
              onChange({ ...setup, count, players: seats });
            }}
          >
            {count}명
          </button>
        ))}
      </div>

      <div className="setup-players">
        {players.slice(0, setup.count).map((player, index) => (
          <div className="setup-player" key={index} style={{ "--player": playerColors[index] }}>
            <button className="setup-token" onClick={() => nextToken(index)} aria-label="말 바꾸기">
              {player.token}
            </button>
            <button className="setup-name" onClick={() => !player.robot && setNaming(index)} disabled={player.robot}>
              {player.name}
            </button>
            <button className={`setup-kind ${player.robot ? "is-robot" : ""}`} onClick={() => toggleRobot(index)}>
              {player.robot ? "🤖 로봇" : "🙂 사람"}
            </button>
          </div>
        ))}
      </div>

      <div className="setup-length">
        <span>게임 길이</span>
        <div className="segmented">
          {gameLengths.map((length) => (
            <button
              key={length.rounds}
              className={setup.rounds === length.rounds ? "active" : ""}
              onClick={() => onChange({ ...setup, rounds: length.rounds })}
            >
              {length.label} · {length.rounds}바퀴
            </button>
          ))}
        </div>
      </div>

      <ul className="setup-rules">
        <li>모두 <Won n={10} />으로 시작해요.</li>
        <li>가진 돈으로만 집을 지어요. 집값은 1원~5원!</li>
        <li>다른 사람 집에 서면 통행료를 내요.</li>
        <li>가장 많이 모은 사람이 우승!</li>
      </ul>

      <button className="chunky-button board-start" onClick={onStart}>🎲 시작!</button>

      {naming !== null && (
        <div className="sheet-backdrop board-backdrop" onClick={() => setNaming(null)}>
          <section className="sheet name-sheet" role="dialog" aria-modal="true" aria-label="이름 고르기" onClick={(e) => e.stopPropagation()}>
            <h3>누구예요?</h3>
            <div className="name-grid">
              {personNames.map((name) => (
                <button
                  key={name}
                  className={players[naming].name === name ? "is-active" : ""}
                  onClick={() => {
                    sfx.pop();
                    patchPlayer(naming, { name });
                    setNaming(null);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- results

function Results({ game, say, onAgain, onHome }) {
  const totals = game.players.map((_, index) => totalOf(game, index));
  const best = Math.max(...totals);
  const [picked, setPicked] = useState(null);
  const order = game.players.map((player, index) => ({ player, index, total: totals[index] })).sort((a, b) => b.total - a.total);

  function pick(index) {
    if (picked !== null) return;
    setPicked(index);
    const right = totals[index] === best;
    if (right) sfx.correct();
    else sfx.wrong();
    const winners = order.filter((entry) => entry.total === best);
    setTimeout(() => say(winners.length > 1 ? lines.tie : lines.winner(winners[0].player.name)), 300);
  }

  return (
    <div className="board-results">
      <h3 className="setup-title">{picked === null ? "누가 제일 많이 모았을까요?" : "게임 끝!"}</h3>
      {picked === null ? (
        <>
          <p className="results-hint">돈과 집을 모두 세어봐요</p>
          <div className="results-pick">
            {game.players.map((player, index) => (
              <button key={index} className="results-player" style={{ "--player": player.color }} onClick={() => pick(index)}>
                <span className="player-token">{player.token}</span>
                <strong>{player.name}</strong>
                <CoinRows count={player.money} small />
                <span className="results-houses">
                  {housesOf(game, index).map(([id, house]) => (
                    <HouseArt key={id} level={house.level} roof={house.roof} className="mini-house" />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className={`results-verdict ${totals[picked] === best ? "is-right" : ""}`}>
            {totals[picked] === best ? "맞았어요! 🎉" : "다시 세어보면 이렇게 돼요!"}
          </p>
          <ol className="results-rank">
            {order.map((entry, rank) => (
              <li key={entry.index} className={entry.total === best ? "is-winner" : ""} style={{ "--player": entry.player.color, "--i": rank }}>
                <span className="rank-medal">{entry.total === best ? "👑" : rank + 1}</span>
                <span className="player-token">{entry.player.token}</span>
                <strong>{entry.player.name}</strong>
                <span className="rank-detail">
                  돈 {entry.player.money} + 집 {entry.total - entry.player.money}
                </span>
                <span className="rank-total"><Won n={entry.total} big /></span>
              </li>
            ))}
          </ol>
          <p className="results-reward">다 같이 끝까지 했어요! 상점 코인 +{FINISH_COINS}</p>
          <div className="sheet-buttons">
            <button className="chunky-button board-start" onClick={onAgain}>🎲 다시 하기</button>
            <button className="chunky-button later-button" onClick={onHome}>처음으로</button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- game

export function Board({
  board,
  numbersLevel,
  hangulLevel,
  mastery,
  say,
  onBack,
  onEarn,
  onBoardChange,
  onLearn,
  onCelebrate,
  onRoll
}) {
  const game = board.game;
  const [phase, setPhase] = useState(game ? (game.over ? "results" : "turn") : "setup");
  const [dice, setDice] = useState([1, 2]);
  const [diceQ, setDiceQ] = useState(null);
  const [counted, setCounted] = useState(0);
  const [walk, setWalk] = useState(null);
  const [step, setStep] = useState(0);
  const [event, setEvent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [note, setNote] = useState("");
  const [fx, setFx] = useState(null);
  const gameRef = useRef(game);
  const timers = useRef(new Set());
  const rollTimer = useRef(null);
  const extraRoll = useRef(false);
  const eventRef = useRef(null);

  const faces = diceFaces(numbersLevel.id);
  const numeralDie = numbersLevel.id >= 4;
  const current = game?.players[game.turn];

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    clearInterval(rollTimer.current);
  }, []);

  // Resume a saved game where it stopped: at the start of the current player's turn.
  useEffect(() => {
    if (game && !game.over) beginTurn(game);
    // Runs on mount only; timers it starts are cleared on unmount.
  }, []);

  function later(callback, ms) {
    const id = setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, ms);
    timers.current.add(id);
  }

  function clearLater() {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    clearInterval(rollTimer.current);
  }

  function commit(next) {
    gameRef.current = next;
    onBoardChange((saved) => ({ ...saved, game: next }));
  }

  function showFx(player, amount) {
    if (amount) setFx({ id: Date.now() + player, player, amount });
  }

  // ------------------------------------------------------------ setup / end
  function startGame() {
    sfx.levelUp();
    clearLater();
    const fresh = createGame(board.setup);
    commit(fresh);
    showEvent(null);
    setQuiz(null);
    setDiceQ(null);
    beginTurn(fresh);
  }

  function newGame() {
    clearLater();
    commit(null);
    showEvent(null);
    setQuiz(null);
    setDiceQ(null);
    setWalk(null);
    setPhase("setup");
  }

  function endGame() {
    clearLater();
    const g = gameRef.current;
    if (!g.rewarded) {
      commit({ ...g, over: true, rewarded: true });
      onEarn(FINISH_COINS, null);
    }
    showEvent(null);
    setQuiz(null);
    setPhase("results");
    sfx.levelUp();
    say(lines.gameOver);
  }

  // ------------------------------------------------------------ turns
  function beginTurn(g) {
    const player = g.players[g.turn];
    setDiceQ(null);
    setCounted(0);
    setWalk(null);
    setPhase("turn");
    if (player.skip > 0) {
      setNote(`${player.name}, 꿀잠 섬에서 쉬어요`);
      say(lines.sleeping(player.name));
      if (player.robot) later(wakeUp, ROBOT_WAIT + 600);
      return;
    }
    setNote(player.robot ? `${josa(player.name, "이", "가")} 주사위를 굴려요` : "주사위를 굴려요!");
    say(lines.turn(player.name));
    if (player.robot) later(roll, ROBOT_WAIT);
  }

  function wakeUp() {
    const g = gameRef.current;
    commit(withPlayer(g, g.turn, { skip: g.players[g.turn].skip - 1 }));
    extraRoll.current = false;
    finishTurn();
  }

  function finishTurn() {
    showEvent(null);
    setQuiz(null);
    setDiceQ(null);
    setCounted(0);
    let g = gameRef.current;
    if (g.over) {
      endGame();
      return;
    }
    if (extraRoll.current && !g.players[g.turn].skip) {
      extraRoll.current = false;
      sfx.pop();
      say(lines.doubles);
      setPhase("turn");
      setNote("똑같은 숫자! 한 번 더!");
      if (g.players[g.turn].robot) later(roll, ROBOT_WAIT + 600);
      return;
    }
    extraRoll.current = false;
    g = nextTurn(g);
    commit(g);
    if (g.over) endGame();
    else beginTurn(g);
  }

  // ------------------------------------------------------------ dice
  function roll() {
    const g = gameRef.current;
    const player = g.players[g.turn];
    const a = randInt(1, faces);
    const b = randInt(1, faces);
    extraRoll.current = a === b;
    setPhase("rolling");
    setDiceQ(null);
    setCounted(0);
    if (!player.robot) onRoll();
    sfx.tap();
    rollTimer.current = setInterval(() => {
      setDice([randInt(1, faces), randInt(1, faces)]);
      sfx.flip();
    }, 110);
    later(() => {
      clearInterval(rollTimer.current);
      setDice([a, b]);
      const sum = a + b;
      if (player.robot) {
        // The robot counts out loud, which is a counting lesson for whoever is watching.
        setPhase("robotCount");
        setNote("같이 세어봐요!");
        countPipsTogether(sum);
        later(() => {
          say(lines.robotMove(sum));
          later(() => move(sum), 1400);
        }, 500 + sum * 560);
        return;
      }
      setDiceQ({ answer: sum, options: makeOptions(sum, 2, faces * 2, 4), eliminated: [] });
      setPhase("question");
      setNote(numeralDie ? "두 주사위를 더하면?" : "점이 모두 몇 개?");
      say(lines.diceAsk(numeralDie));
    }, 1000);
  }

  function countPipsTogether(sum) {
    setCounted(0);
    for (let n = 1; n <= sum; n += 1) {
      later(() => {
        setCounted(n);
        sfx.count(Math.min(n, 12));
        say(lines.counting(n), { rate: "fast" });
      }, 300 + n * 560);
    }
  }

  function answerDice(value) {
    if (phase !== "question" || !diceQ || diceQ.feedback || diceQ.eliminated.includes(value)) return;
    const sum = diceQ.answer;
    const correct = value === sum;
    if (!correct && !diceQ.retried) {
      const others = diceQ.options.filter((option) => option !== value && option !== sum);
      setDiceQ({ ...diceQ, retried: true, lastWrong: value, eliminated: [value, others[0]].filter(Boolean) });
      sfx.wrong();
      setNote("같이 세어보자!");
      countPipsTogether(sum);
      return;
    }
    setDiceQ({ ...diceQ, feedback: { picked: value, correct } });
    onLearn({ gameId: "count", answer: sum }, correct, correct && !diceQ.retried);
    if (correct) {
      sfx.correct();
      say(lines.diceRight(sum));
    } else {
      sfx.wrong();
      setCounted(sum);
      say(lines.diceWrong(sum));
    }
    later(() => move(sum), 1400);
  }

  // ------------------------------------------------------------ moving
  function move(steps) {
    setPhase("moving");
    setDiceQ(null);
    const g = gameRef.current;
    const start = g.players[g.turn].position;
    const path = Array.from({ length: steps }, (_, i) => (start + i + 1) % BOARD_SIZE);
    path.forEach((tileIndex, i) => {
      later(() => {
        setWalk({ player: g.turn, position: tileIndex });
        setStep(i + 1);
        sfx.count(Math.min(i + 1, 12));
        say(lines.counting(i + 1), { rate: "fast" });
      }, (i + 1) * STEP_MS);
    });
    later(() => land(path[path.length - 1], path.includes(0)), steps * STEP_MS + 450);
  }

  function land(index, passedStart) {
    let g = gameRef.current;
    const me = g.turn;
    const player = g.players[me];
    const tile = tiles[index];
    let money = player.money;
    let intro = "";
    if (passedStart) {
      money = addMoney(money, PASS_START_REWARD);
      intro = `${lines.passStart(PASS_START_REWARD)} `;
      showFx(me, money - player.money);
      sfx.coin();
    }
    g = withPlayer(g, me, { position: index, money });
    commit(g);
    setWalk(null);
    setPhase("event");
    const robot = player.robot;

    if (tile.type === "lot") {
      const house = g.owned[tile.id];
      if (!house) {
        showEvent({ kind: "lot", tile });
        say(`${intro}${lines.lot(tile, initialOf(tile.word))} ${lines.lotPrice(tile.price)}`);
        if (robot) later(() => robotLot(tile), ROBOT_WAIT + 1200);
      } else if (house.owner === me) {
        showEvent({ kind: "home", tile });
        say(`${intro}${lines.homeAgain(tile, house.level < 3)}`);
        if (robot) later(() => robotHome(tile), ROBOT_WAIT + 800);
      } else {
        const owner = g.players[house.owner];
        const toll = tollOf(tile, house);
        say(`${intro}${lines.toll(owner.name, tile, toll)}`);
        const pay = { kind: "pay", reason: "toll", tile, amount: toll, to: house.owner };
        if (money >= toll) {
          showEvent(pay);
          return;
        }
        // Not enough money: sell houses first, like the real game.
        const sale = sellForDebt(g, me, toll);
        commit(sale.game);
        const left = sale.game.players[me].money;
        const broke = left < toll;
        const finalPay = { ...pay, amount: Math.min(toll, left), broke };
        const info = sale.sold.length
          ? { kind: "info", emoji: "🏚️", title: "집을 팔았어요", text: `돈이 모자라서 ${sale.sold.map((t) => t.word).join(", ")} 마을 집을 팔았어요.`, next: finalPay }
          : null;
        if (sale.sold.length) later(() => say(lines.soldHouse(sale.sold[0])), 2600);
        showEvent(info ?? (finalPay.amount > 0 ? finalPay : brokeInfo(me)));
      }
      return;
    }

    if (tile.type === "numberQuiz" || tile.type === "hangulQuiz" || tile.type === "school") {
      const subject = tile.type === "school" ? (Math.random() < 0.5 ? "numberQuiz" : "hangulQuiz") : tile.type;
      let round;
      if (subject === "numberQuiz") {
        round = numbersLevel.id >= 3 && Math.random() < 0.5
          ? makeRound("add", numbersLevel, mastery)
          : makeRound("count", numbersLevel, mastery);
      } else {
        round = Math.random() < 0.5
          ? makeHangulRound("h-picture", hangulLevel, mastery)
          : makeHangulRound("h-build", hangulLevel, mastery);
      }
      setQuiz({ ...round, eliminated: [] });
      showEvent({ kind: "quiz", tile, reward: tile.type === "school" ? SCHOOL_REWARD : QUIZ_REWARD });
      say(`${intro}${robot ? `${lines.helpRobot} ` : ""}${lines.prompt(round)}`);
      return;
    }

    if (tile.type === "island") {
      commit(withPlayer(g, me, { skip: 1 }));
      extraRoll.current = false;
      showInfo({ emoji: tile.emoji, image: tile.image, title: "꿀잠 섬", text: "다음 차례에 한 번 쉬어요. 쿨쿨!" }, `${intro}${lines.island}`);
      return;
    }

    if (tile.type === "piggy") {
      const fee = Math.min(PIGGY_FEE, money);
      say(`${intro}${lines.piggy(PIGGY_FEE)}`);
      if (fee > 0) showEvent({ kind: "pay", reason: "piggy", tile, amount: fee });
      else showInfo({ emoji: tile.emoji, image: tile.image, title: "저금통", text: "낼 돈이 없어요. 괜찮아요!" }, "");
      return;
    }

    if (tile.type === "treasure") {
      const found = g.pot > 0 ? g.pot : 1;
      const after = addMoney(money, found);
      commit({ ...withPlayer(g, me, { money: after }), pot: 0 });
      showFx(me, after - money);
      sfx.coin();
      onCelebrate(null, `+${found}원`);
      showInfo(
        { emoji: "🎁", image: tile.image, title: "보물 상자", text: g.pot > 0 ? `저금통에 모인 돈 ${found}원을 모두 가져가요!` : "작은 동전 1원을 찾았어요!", coins: found },
        `${intro}${lines.treasure(found)}${after === MAX_MONEY ? ` ${lines.walletFull}` : ""}`
      );
      return;
    }

    showInfo({ emoji: "🚩", image: tile.image, title: "출발", text: `출발점이에요! 용돈 ${PASS_START_REWARD}원을 받았어요.`, coins: PASS_START_REWARD }, intro.trim());
  }

  function brokeInfo(index) {
    const g = gameRef.current;
    commit({ ...g, over: true });
    return { kind: "info", emoji: "😵", title: "돈이 다 떨어졌어요", text: `${possessive(g.players[index].name)} 돈이 다 떨어져서 게임이 끝나요.`, speech: lines.broke(g.players[index].name) };
  }

  // Robots do not press buttons, so their info cards close by themselves.
  function showEvent(next) {
    eventRef.current = next;
    setEvent(next);
    if (next?.speech) say(next.speech);
    const g = gameRef.current;
    if (next?.kind === "info" && g.players[g.turn].robot) later(closeInfo, ROBOT_WAIT + 1800);
  }

  function showInfo(info, speech) {
    if (speech) say(speech);
    showEvent({ kind: "info", ...info });
  }

  function closeInfo() {
    const open = eventRef.current;
    if (open?.kind !== "info") return;
    if (open.next) showEvent(open.next);
    else finishTurn();
  }

  // ------------------------------------------------------------ paying
  function paid(pay) {
    let g = gameRef.current;
    const me = g.turn;
    const player = g.players[me];
    g = withPlayer(g, me, { money: player.money - pay.amount });
    showFx(me, -pay.amount);
    sfx.buy();
    say(lines.paid(pay.amount));

    if (pay.reason === "buy") {
      g = { ...g, owned: { ...g.owned, [pay.tile.id]: { owner: me, level: 1, roof: player.color } } };
      commit(g);
      onCelebrate(null, "새 집!");
      later(() => say(lines.newHouse(pay.tile)), 900);
      showEvent({ kind: "home", tile: pay.tile, justBuilt: true });
      if (player.robot) later(finishTurn, ROBOT_WAIT + 1400);
      return;
    }
    if (pay.reason === "upgrade") {
      const house = g.owned[pay.tile.id];
      const name = houseNames[house.level];
      g = { ...g, owned: { ...g.owned, [pay.tile.id]: { ...house, level: house.level + 1 } } };
      commit(g);
      onCelebrate(null, `${name}!`);
      later(() => say(lines.upgraded(name)), 900);
      showEvent({ kind: "home", tile: pay.tile, upgraded: true });
      if (player.robot) later(finishTurn, ROBOT_WAIT + 1400);
      return;
    }
    if (pay.reason === "toll") {
      const owner = g.players[pay.to];
      const got = addMoney(owner.money, pay.amount);
      g = withPlayer(g, pay.to, { money: got });
      commit(g);
      later(() => {
        showFx(pay.to, got - owner.money);
        sfx.coin();
        say(lines.received(owner.name, pay.amount));
      }, 900);
      if (pay.broke) {
        const info = brokeInfo(me);
        later(() => showEvent(info), 2600);
        return;
      }
      later(finishTurn, 2600);
      return;
    }
    // piggy bank
    commit({ ...g, pot: g.pot + pay.amount });
    later(finishTurn, 1600);
  }

  // ------------------------------------------------------------ houses
  function buyLot(tile) {
    const player = gameRef.current.players[gameRef.current.turn];
    if (player.money < tile.price) {
      sfx.wrong();
      say(lines.needMoney(tile.price - player.money));
      return;
    }
    sfx.tap();
    say(lines.payAsk(tile.price));
    showEvent({ kind: "pay", reason: "buy", tile, amount: tile.price });
  }

  function upgradeHouse(tile) {
    const g = gameRef.current;
    const player = g.players[g.turn];
    const cost = upgradeCost(tile);
    if (player.money < cost) {
      sfx.wrong();
      say(lines.needMoney(cost - player.money));
      return;
    }
    sfx.tap();
    say(lines.payAsk(cost));
    showEvent({ kind: "pay", reason: "upgrade", tile, amount: cost });
  }

  function robotLot(tile) {
    const player = gameRef.current.players[gameRef.current.turn];
    if (player.money >= tile.price + 1) {
      showEvent({ kind: "pay", reason: "buy", tile, amount: tile.price });
    } else {
      setNote(`${josa(player.name, "은", "는")} 그냥 지나가요`);
      finishTurn();
    }
  }

  function robotHome(tile) {
    const g = gameRef.current;
    const player = g.players[g.turn];
    const house = g.owned[tile.id];
    if (house.level < 3 && player.money >= upgradeCost(tile) + 3) {
      showEvent({ kind: "pay", reason: "upgrade", tile, amount: upgradeCost(tile) });
    } else {
      finishTurn();
    }
  }

  // ------------------------------------------------------------ quiz
  function tapQuizCount(index) {
    if (!quiz || quiz.gameId !== "count" || quiz.feedback || quiz.tapped.includes(index)) return;
    const tapped = [...quiz.tapped, index];
    setQuiz({ ...quiz, tapped });
    sfx.count(Math.min(tapped.length, 12));
    say(lines.counting(tapped.length), { rate: "fast" });
  }

  function answerQuiz(value) {
    if (!quiz || quiz.feedback || quiz.eliminated.includes(value)) return;
    const correct = value === quiz.answer;
    if (!correct && !quiz.retried) {
      const others = quiz.options.filter((option) => option !== value && option !== quiz.answer);
      const extra = quiz.options.length >= 4 && others.length ? [others[0]] : [];
      const next = { ...quiz, retried: true, hint: true, lastWrong: value, eliminated: [value, ...extra] };
      if (quiz.gameId === "count") next.tapped = Array.from({ length: quiz.count }, (_, i) => i);
      setQuiz(next);
      sfx.wrong();
      if (quiz.gameId === "h-picture") say(lines.slowWord(quiz.entry.word), { rate: "slow" });
      else if (quiz.gameId === "h-build") say(lines.buildHint(quiz.consonant, quiz.vowel), { rate: "slow" });
      else say(lines.countTogether);
      return;
    }
    const firstTry = correct && !quiz.retried;
    setQuiz({ ...quiz, feedback: { picked: value, correct } });
    onLearn(quiz, correct, firstTry);
    if (correct) {
      const reward = firstTry ? event.reward : 1;
      const g = gameRef.current;
      const before = g.players[g.turn].money;
      const after = addMoney(before, reward);
      commit(withPlayer(g, g.turn, { money: after }));
      showFx(g.turn, after - before);
      sfx.correct();
      onCelebrate(null, firstTry ? "정답!" : "다시 해서 맞혔어!");
      say(lines.quizReward(reward));
    } else {
      sfx.wrong();
      say(lines.answerIs(quiz.answer));
    }
    later(finishTurn, correct ? 2000 : 2600);
  }

  // ------------------------------------------------------------ render
  const tokensAt = (index) => {
    if (!game) return [];
    return game.players
      .map((player, i) => ({ ...player, i, position: walk?.player === i ? walk.position : player.position }))
      .filter((player) => player.position === index);
  };
  const house = event?.tile && game ? game.owned[event.tile.id] : null;
  const builtCount = game ? Object.keys(game.owned).length : 0;
  const eventIsRobot = Boolean(current?.robot);

  const screen = (
    <div className="board-screen" role="dialog" aria-label="주사위 마을">
      <header className="board-head">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>주사위 마을</h2>
          {game && !game.over && <p className="eyebrow">{Math.min(game.round, game.maxRounds)} / {game.maxRounds}바퀴 · 집 {builtCount}/{LOT_COUNT}</p>}
        </div>
        {game && (
          <span className="pot-chip" title="저금통"><img src="./assets/board/piggy.webp" alt="" aria-hidden="true" /> <Won n={game.pot} /></span>
        )}
        {game && phase !== "results" && (
          <button
            className="new-game-button"
            onClick={() => {
              if (window.confirm("지금 게임을 끝내고 새로 시작할까요?")) newGame();
            }}
          >
            새 게임
          </button>
        )}
      </header>

      {phase === "setup" || !game ? (
        <Setup setup={board.setup} onChange={(setup) => onBoardChange((saved) => ({ ...saved, setup }))} onStart={startGame} />
      ) : phase === "results" ? (
        <Results game={game} say={say} onAgain={startGame} onHome={onBack} />
      ) : (
        <div className="board-main">
          <div className="board-players">
            {game.players.map((player, index) => (
              <PlayerCard key={index} player={player} index={index} active={index === game.turn} fx={fx} />
            ))}
          </div>

          <div className="board-area">
            <div className="board-grid">
              {tiles.map((tile, index) => {
                const cell = tileCell(index);
                const owned = game.owned[tile.id];
                const owner = owned ? game.players[owned.owner] : null;
                const here = tokensAt(index);
                return (
                  <div
                    key={tile.id}
                    className={`board-tile tile-${tile.type} ${owned ? "is-owned" : ""} ${here.some((p) => p.i === game.turn) ? "is-here" : ""} ${index % 5 === 0 ? "is-corner" : ""}`}
                    style={{
                      gridRow: cell.row,
                      gridColumn: cell.col,
                      "--group": tile.group !== undefined ? groupColors[tile.group] : "transparent",
                      "--owner": owner?.color ?? "transparent",
                      "--i": index
                    }}
                  >
                    {owned ? (
                      <HouseArt level={owned.level} roof={owned.roof} className="tile-house" />
                    ) : (
                      tile.image
                        ? <img className="tile-image" src={tile.image} alt="" aria-hidden="true" />
                        : <span className="tile-emoji" aria-hidden="true">{tile.emoji}</span>
                    )}
                    <span className="tile-name">{tile.type === "lot" ? tile.word : tile.name}</span>
                    {tile.type === "lot" && (
                      <span className="tile-price">{owned ? `통행료 ${tollOf(tile, owned)}` : `${tile.price}원`}</span>
                    )}
                    {owner && <span className="tile-owner">{owner.token}</span>}
                    {here.length > 0 && (
                      <span className={`board-tokens n-${here.length}`}>
                        {here.map((player) => (
                          <span
                            key={`${player.i}-${player.i === game.turn ? step : 0}`}
                            className={`board-token ${player.i === game.turn ? "is-turn" : ""}`}
                            style={{ "--player": player.color }}
                          >
                            {player.token}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="board-center">
                {current && (
                  <p className="turn-banner" key={`${game.turn}-${game.round}`} style={{ "--player": current.color }}>
                    <span>{current.token}</span> {current.name} 차례
                  </p>
                )}
                <div className={`dice-row ${phase === "rolling" ? "is-rolling" : ""}`}>
                  <Die value={dice[0]} rolling={phase === "rolling"} numberFrom={1} counted={counted} />
                  <span className="dice-plus">+</span>
                  <Die
                    value={dice[1]}
                    rolling={phase === "rolling"}
                    numeral={numeralDie && phase !== "rolling" && !diceQ?.retried && phase !== "robotCount"}
                    numberFrom={dice[0] + 1}
                    counted={counted}
                  />
                </div>

                {phase === "turn" && current && !current.robot && (
                  current.skip > 0 ? (
                    <button className="chunky-button roll-button" onClick={wakeUp}>😴 쉬고 넘기기</button>
                  ) : (
                    <button className="chunky-button roll-button" onClick={roll}>
                      <span className="roll-button-icon" aria-hidden="true"><i /><i /><i /></span> 주사위 굴리기
                    </button>
                  )
                )}

                {phase === "question" && diceQ && (
                  <div className="dice-options">
                    {diceQ.options.map((value, index) => (
                      <button
                        key={value}
                        className={`number-tile dice-option ${toneClass(value)} ${tileState(value, diceQ, diceQ.answer)}`}
                        style={{ "--i": index }}
                        onClick={() => answerDice(value)}
                      >
                        <span>{value}</span>
                      </button>
                    ))}
                  </div>
                )}

                {phase === "moving" && (
                  <div className="step-counter" key={step}>
                    <strong className={toneClass(Math.max(step, 1))}>{step}</strong>
                    <span>{countingWord(Math.max(step, 1))}</span>
                  </div>
                )}

                {note && phase !== "moving" && <p className="board-note">{note}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {event && game && (
        <div className="sheet-backdrop board-backdrop">
          <section className="sheet board-sheet" role="dialog" aria-modal="true" aria-label={event.tile?.name ?? event.title}>
            {event.kind === "lot" && (
              <div className="lot-card" style={{ "--group": groupColors[event.tile.group] }}>
                <span className="lot-emoji" aria-hidden="true"><img src={event.tile.image} alt="" /></span>
                <h3 className="lot-name">
                  <b className={toneClass(event.tile.group + 1)}>{event.tile.word[0]}</b>
                  {event.tile.word.slice(1)} 마을
                </h3>
                <p className="lot-hint">
                  {josa(event.tile.word, "은", "는")} <b>{initialOf(event.tile.word)}</b> {withRo(letterName(initialOf(event.tile.word)))} 시작해요
                </p>
                <div className="lot-compare">
                  <div>
                    <small>집값</small>
                    <Won n={event.tile.price} big />
                    <CoinRows count={event.tile.price} small />
                  </div>
                  <span className="compare-sign">{event.tile.price < current.money ? "<" : event.tile.price === current.money ? "=" : ">"}</span>
                  <div>
                    <small>{possessive(current.name)} 돈</small>
                    <Won n={current.money} big />
                    <CoinRows count={current.money} small />
                  </div>
                </div>
                {eventIsRobot ? (
                  <p className="robot-thinking">🤖 생각하는 중…</p>
                ) : (
                  <div className="sheet-buttons">
                    <button
                      className={`chunky-button buy-house ${current.money < event.tile.price ? "is-short" : ""}`}
                      onClick={() => buyLot(event.tile)}
                    >
                      {current.money >= event.tile.price ? "🏠 집 짓기" : `${event.tile.price - current.money}원 모자라요`}
                    </button>
                    <button className="chunky-button later-button" onClick={finishTurn}>지나가기</button>
                  </div>
                )}
              </div>
            )}

            {event.kind === "pay" && (
              <PayPanel
                key={`${event.reason}-${event.tile?.id}-${event.amount}`}
                player={current}
                amount={event.amount}
                auto={eventIsRobot}
                numbersLevelId={numbersLevel.id}
                say={say}
                title={
                  event.reason === "toll"
                    ? `${game.players[event.to].token} ${possessive(game.players[event.to].name)} ${event.tile.name}! ${event.broke ? `가진 돈 ${event.amount}원을 모두 내요` : `통행료 ${event.amount}원`}`
                    : event.reason === "piggy"
                      ? <><img className="pay-title-image" src={event.tile.image} alt="" aria-hidden="true" /> 저금통에 {event.amount}원을 넣어요</>
                      : event.reason === "upgrade"
                        ? `${withRo(houseNames[house?.level ?? 1])} 키우기 · ${event.amount}원`
                        : `🏠 ${event.tile.name} 집값 ${event.amount}원`
                }
                onDone={() => paid(event)}
              />
            )}

            {event.kind === "home" && house && (
              <div className="house-editor">
                <div className="house-stage" style={{ "--group": groupColors[event.tile.group] }}>
                  <HouseArt level={house.level} roof={house.roof} />
                  <span className="house-label">{event.tile.name} · {houseNames[house.level - 1]}</span>
                  <span className="rent-chip">통행료 {tollOf(event.tile, house)}원</span>
                </div>
                <div className="home-panel">
                  <p className="home-message">
                    {event.justBuilt
                      ? `${possessive(current.name)} 집이 생겼어요! 🎉`
                      : event.upgraded
                        ? "집이 커졌어요! 통행료도 커져요"
                        : house.level < 3
                          ? `내 집에 왔어요! ${withRo(houseNames[house.level])} 키울까요?`
                          : "내 집에 왔어요! 가장 큰 성이에요"}
                  </p>
                  {!eventIsRobot && (
                    <div className="sheet-buttons">
                      {house.level < 3 && !event.justBuilt && !event.upgraded && (
                        <button
                          className={`chunky-button upgrade-button ${current.money < upgradeCost(event.tile) ? "is-short" : ""}`}
                          onClick={() => upgradeHouse(event.tile)}
                        >
                          ⬆ {withRo(houseNames[house.level])} 키우기 · {upgradeCost(event.tile)}원
                        </button>
                      )}
                      <button className="chunky-button later-button" onClick={finishTurn}>
                        {event.justBuilt || event.upgraded ? "좋아요!" : "지나가기"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {event.kind === "quiz" && quiz && (
              <div className="board-quiz">
                <p className="quiz-title">
                  <img className="quiz-title-image" src={event.tile.image} alt="" aria-hidden="true" />
                  {eventIsRobot ? `${josa(current.name, "을", "를")} 도와줘요!` : event.tile.name} · 맞히면 <Won n={event.reward} />
                </p>
                <div className="round quiz-round" key={quiz.id}>
                  {quiz.gameId === "count" && <CountGame round={quiz} onCountTap={tapQuizCount} onAnswer={answerQuiz} />}
                  {quiz.gameId === "add" && <AddGame round={quiz} onAnswer={answerQuiz} />}
                  {quiz.gameId === "h-picture" && <HangulPicture round={quiz} onAnswer={answerQuiz} />}
                  {quiz.gameId === "h-build" && <HangulBuild round={quiz} onAnswer={answerQuiz} />}
                </div>
              </div>
            )}

            {event.kind === "info" && (
              <div className="simple-event">
                {event.image
                  ? <img className="simple-image" src={event.image} alt="" aria-hidden="true" />
                  : <span className="simple-emoji" aria-hidden="true">{event.emoji}</span>}
                <h3>{event.title}</h3>
                <p>{event.text}</p>
                {event.coins ? <CoinRows count={event.coins} small /> : null}
                {!eventIsRobot && (
                  <button className="chunky-button later-button" onClick={closeInfo}>좋아요!</button>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );

  return createPortal(screen, document.body);
}
