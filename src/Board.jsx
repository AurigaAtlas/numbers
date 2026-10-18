import { useEffect, useRef, useState } from "react";
import { AddGame, CountGame } from "./games";
import { tileState } from "./gameParts";
import { HangulBuild, HangulPicture } from "./hangulGames";
import { HouseArt } from "./HouseArt";
import { hangulPrompt, initialOf, letterName, makeHangulRound, spokenForm } from "./hangul";
import { BackIcon, CheckIcon, CoinIcon, LockIcon } from "./icons";
import {
  BOARD_SIZE,
  LOT_COUNT,
  PASS_START_REWARD,
  decorItems,
  diceFaces,
  groupColors,
  houseNames,
  houseRent,
  roofColors,
  tileCell,
  tiles,
  upgradeCost
} from "./board";
import { countingWord, josa, makeOptions, makeRound, randInt, sinoWord, toneClass } from "./rounds";
import { sfx } from "./sfx";

const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const STEP_MS = 520;
const VILLAGE_BONUS = 30;

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

// 으로/로: words ending in a vowel or ㄹ take 로 ("리을로", "성으로").
function withRo(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const final = code >= 0 && code <= 11171 ? code % 28 : 0;
  return `${word}${final === 0 || final === 8 ? "로" : "으로"}`;
}

function quizPrompt(round) {
  if (round.gameId === "count") return "몇 개인지 세어볼까요?";
  if (round.gameId === "add") {
    return `${sinoWord(round.a)} ${round.op === "+" ? "더하기" : "빼기"} ${josa(sinoWord(round.b), "은", "는")} 얼마일까요?`;
  }
  return hangulPrompt(round);
}

export function Board({
  board,
  coins,
  numbersLevel,
  hangulLevel,
  mastery,
  say,
  setMessage,
  onBack,
  onEarn,
  onSpend,
  onBoardChange,
  onLearn,
  onCelebrate,
  onRoll
}) {
  const [phase, setPhase] = useState("ready");
  const [dice, setDice] = useState([1, 2]);
  const [diceQ, setDiceQ] = useState(null);
  const [counted, setCounted] = useState(0);
  const [position, setPosition] = useState(board.position);
  const [step, setStep] = useState(0);
  const [event, setEvent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const timers = useRef(new Set());
  const rollTimer = useRef(null);
  const tokenRef = useRef(null);

  const faces = diceFaces(numbersLevel.id);
  const numeralDie = numbersLevel.id >= 4;
  const ownedCount = Object.keys(board.owned).length;

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    clearInterval(rollTimer.current);
  }, []);

  function later(callback, ms) {
    const id = setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, ms);
    timers.current.add(id);
  }

  // ------------------------------------------------------------ dice
  function roll() {
    if (phase !== "ready") return;
    const a = randInt(1, faces);
    const b = randInt(1, faces);
    setPhase("rolling");
    setDiceQ(null);
    setCounted(0);
    onRoll();
    sfx.tap();
    rollTimer.current = setInterval(() => {
      setDice([randInt(1, faces), randInt(1, faces)]);
      sfx.flip();
    }, 110);
    later(() => {
      clearInterval(rollTimer.current);
      setDice([a, b]);
      const sum = a + b;
      setDiceQ({ answer: sum, options: makeOptions(sum, 2, faces * 2, 4), eliminated: [] });
      setPhase("question");
      setMessage(numeralDie ? "두 주사위를 더하면 몇일까?" : "주사위 점을 모두 세어봐!");
      say(numeralDie ? "두 주사위를 더하면 몇일까요?" : "주사위 점이 모두 몇 개일까요?");
    }, 1000);
  }

  function countPipsTogether(sum) {
    setCounted(0);
    for (let n = 1; n <= sum; n += 1) {
      later(() => {
        setCounted(n);
        sfx.count(Math.min(n, 12));
        say(countingWord(n), { rate: "fast" });
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
      setMessage("같이 세어보자!");
      countPipsTogether(sum);
      return;
    }
    setDiceQ({ ...diceQ, feedback: { picked: value, correct } });
    onLearn({ gameId: "count", answer: sum }, correct, correct && !diceQ.retried);
    if (correct) {
      sfx.correct();
      if (!diceQ.retried) onEarn(2, null);
      setMessage(`맞았어! ${sum}칸 가자!`);
      say(`맞았어! ${sinoWord(sum)}칸 가자!`);
    } else {
      sfx.wrong();
      setCounted(sum);
      setMessage(`정답은 ${sum}! ${sum}칸 가자!`);
      say(`정답은 ${josa(sinoWord(sum), "이야", "야")}. ${sinoWord(sum)}칸 가자!`);
    }
    later(() => move(sum), 1300);
  }

  // ------------------------------------------------------------ moving
  function move(steps) {
    setPhase("moving");
    const start = position;
    const path = Array.from({ length: steps }, (_, i) => (start + i + 1) % BOARD_SIZE);
    const passedStart = path.includes(0);
    path.forEach((tileIndex, i) => {
      later(() => {
        setPosition(tileIndex);
        setStep(i + 1);
        sfx.count(Math.min(i + 1, 12));
        say(countingWord(i + 1), { rate: "fast" });
      }, (i + 1) * STEP_MS);
    });
    later(() => land(path[path.length - 1], passedStart), steps * STEP_MS + 450);
  }

  function land(index, passedStart) {
    const tile = tiles[index];
    onBoardChange((current) => ({
      ...current,
      position: index,
      laps: current.laps + (passedStart ? 1 : 0),
      rolls: current.rolls + 1
    }));
    let intro = "";
    if (passedStart) {
      onEarn(PASS_START_REWARD, tokenRef.current);
      intro = `출발점을 지나서 용돈 ${sinoWord(PASS_START_REWARD)} 코인! `;
    }

    if (tile.type === "lot") {
      const house = board.owned[tile.id];
      const initial = initialOf(tile.word);
      if (house) {
        const rent = houseRent(house);
        onEarn(rent, tokenRef.current);
        setMessage(`내 집에 왔어! 쉬면서 코인 ${rent}개를 받았어.`);
        say(`${intro}${tile.name}, 내 집에 왔어요! 예쁘게 꾸며볼까요?`);
        setEvent({ kind: "house", tile, rent });
      } else {
        setMessage(`${tile.name}! ${tile.word}의 첫 글자는 '${tile.word[0]}'`);
        say(`${intro}${tile.name}! ${josa(tile.word, "은", "는")} ${withRo(letterName(initial))} 시작해요.`);
        setEvent({ kind: "lot", tile });
      }
    } else if (tile.type === "numberQuiz" || tile.type === "hangulQuiz" || tile.type === "school") {
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
      round = { ...round, eliminated: [] };
      setQuiz(round);
      setEvent({ kind: "quiz", tile, reward: tile.type === "school" ? 14 : 8, subject });
      setMessage(tile.type === "school" ? "학교에 왔어! 문제를 풀어볼까?" : `${tile.name}! 문제를 풀어봐.`);
      say(`${intro}${quizPrompt(round)}`);
    } else if (tile.type === "park") {
      onEarn(5, tokenRef.current);
      setEvent({ kind: "park", tile });
      setMessage("놀이터에서 신나게 놀았어! 코인 5개!");
      say(`${intro}놀이터에서 신나게 놀았어요!`);
    } else if (tile.type === "gift") {
      const amount = randInt(1, 3) * 5;
      onEarn(amount, tokenRef.current);
      setEvent({ kind: "gift", tile, amount });
      setMessage(`선물 상자에서 코인 ${amount}개!`);
      say(`${intro}선물 상자에서 코인 ${sinoWord(amount)}개가 나왔어요!`);
    } else {
      setEvent({ kind: "start", tile });
      setMessage("출발점에 도착했어!");
      if (intro) say(intro);
    }
    setPhase("event");
  }

  function closeEvent() {
    setEvent(null);
    setQuiz(null);
    setDiceQ(null);
    setCounted(0);
    setPhase("ready");
    setMessage("주사위를 굴려봐!");
  }

  // ------------------------------------------------------------ houses
  function buyLot(tile, element) {
    if (board.owned[tile.id]) return;
    if (!onSpend(tile.price, element)) {
      sfx.wrong();
      say(`코인이 ${sinoWord(tile.price - coins)}개 더 필요해요.`);
      return;
    }
    const nextCount = ownedCount + 1;
    onBoardChange((current) => ({
      ...current,
      owned: { ...current.owned, [tile.id]: { level: 1, roof: roofColors[tile.group], decor: [] } }
    }));
    setEvent({ kind: "house", tile, justBought: true });
    setMessage(`${tile.name}에 내 집이 생겼어!`);
    say(`${tile.name}에 내 집이 생겼어요!`);
    if (nextCount === LOT_COUNT) {
      later(() => {
        onEarn(VILLAGE_BONUS, null);
        onCelebrate(VILLAGE_BONUS, "마을 완성!");
        say("우와! 마을의 집을 모두 모았어요!");
      }, 900);
    } else {
      onCelebrate(null, "새 집!");
    }
  }

  function updateHouse(tile, change) {
    onBoardChange((current) => ({
      ...current,
      owned: { ...current.owned, [tile.id]: change(current.owned[tile.id]) }
    }));
  }

  function buyDecor(tile, item, element) {
    const house = board.owned[tile.id];
    if (!house || house.decor.includes(item.id)) return;
    if (!onSpend(item.price, element)) {
      sfx.wrong();
      say(`코인이 ${sinoWord(item.price - coins)}개 더 필요해요.`);
      return;
    }
    sfx.pop();
    updateHouse(tile, (current) => ({ ...current, decor: [...current.decor, item.id] }));
    setMessage(`${josa(item.name, "을", "를")} 놓았어!`);
    say(`${josa(item.name, "을", "를")} 놓았어요!`);
  }

  function setRoof(tile, color) {
    sfx.tap();
    updateHouse(tile, (current) => ({ ...current, roof: color }));
  }

  function upgradeHouse(tile, element) {
    const house = board.owned[tile.id];
    if (!house || house.level >= 3) return;
    const cost = upgradeCost(tile, house.level);
    if (!onSpend(cost, element)) {
      sfx.wrong();
      say(`코인이 ${sinoWord(cost - coins)}개 더 필요해요.`);
      return;
    }
    updateHouse(tile, (current) => ({ ...current, level: current.level + 1 }));
    const name = houseNames[house.level];
    onCelebrate(null, `${name}!`);
    setMessage(`우와, ${josa(name, "이", "가")} 되었어!`);
    say(`우와! ${josa(name, "이", "가")} 되었어요!`);
  }

  // ------------------------------------------------------------ quiz
  function tapQuizCount(index) {
    if (!quiz || quiz.gameId !== "count" || quiz.feedback || quiz.tapped.includes(index)) return;
    const tapped = [...quiz.tapped, index];
    setQuiz({ ...quiz, tapped });
    sfx.count(Math.min(tapped.length, 12));
    say(countingWord(tapped.length), { rate: "fast" });
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
      if (quiz.gameId === "h-picture") say(quiz.entry.word.split("").join(", "), { rate: "slow" });
      else if (quiz.gameId === "h-build") say(`${spokenForm(quiz.consonant)}, ${spokenForm(quiz.vowel)}`, { rate: "slow" });
      else say("같이 세어보자!");
      setMessage("한 번 더 해보자!");
      return;
    }
    const firstTry = correct && !quiz.retried;
    setQuiz({ ...quiz, feedback: { picked: value, correct } });
    onLearn(quiz, correct, firstTry);
    if (correct) {
      const reward = firstTry ? event.reward : Math.ceil(event.reward / 2);
      sfx.correct();
      onEarn(reward, null);
      onCelebrate(reward, firstTry ? "정답!" : "다시 해서 맞혔어!");
      say(firstTry ? "정답이에요!" : "맞았어! 잘했어!");
    } else {
      sfx.wrong();
      say(`정답은 ${josa(spokenForm(String(quiz.answer)), "이야", "야")}`);
      setMessage(`정답은 ${quiz.answer}! 다음에 또 해보자.`);
    }
    later(closeEvent, correct ? 1700 : 2300);
  }

  // ------------------------------------------------------------ render
  const house = event?.tile ? board.owned[event.tile.id] : null;

  return (
    <div className="play-panel board-panel play-peach">
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>주사위 마을</h2>
          <p className="eyebrow">주사위 점을 세고, 집을 사서 꾸며요</p>
        </div>
        <span className="village-chip">🏠 {ownedCount} / {LOT_COUNT}</span>
      </div>

      <div className="board-grid">
        {tiles.map((tile, index) => {
          const cell = tileCell(index);
          const owned = board.owned[tile.id];
          const isHere = index === position;
          return (
            <div
              key={tile.id}
              className={`board-tile tile-${tile.type} ${owned ? "is-owned" : ""} ${isHere ? "is-here" : ""} ${index % 5 === 0 ? "is-corner" : ""}`}
              style={{ gridRow: cell.row, gridColumn: cell.col, "--group": tile.group !== undefined ? groupColors[tile.group] : "transparent", "--i": index }}
            >
              {owned ? (
                <HouseArt level={owned.level} roof={owned.roof} decor={owned.decor} className="tile-house" />
              ) : (
                <span className="tile-emoji" aria-hidden="true">{tile.emoji}</span>
              )}
              <span className="tile-name">{tile.type === "lot" ? tile.word : tile.name}</span>
              {tile.type === "lot" && !owned && <span className="tile-price"><CoinIcon />{tile.price}</span>}
              {isHere && (
                <span className="board-token" key={`${position}-${step}`} ref={tokenRef} aria-label="내 말">👸</span>
              )}
            </div>
          );
        })}

        <div className="board-center">
          <div className={`dice-row ${phase === "rolling" ? "is-rolling" : ""}`}>
            <Die value={dice[0]} rolling={phase === "rolling"} numberFrom={1} counted={counted} />
            <span className="dice-plus">+</span>
            <Die
              value={dice[1]}
              rolling={phase === "rolling"}
              numeral={numeralDie && phase !== "rolling" && !diceQ?.retried}
              numberFrom={dice[0] + 1}
              counted={counted}
            />
          </div>

          {phase === "ready" && (
            <button className="chunky-button roll-button" onClick={roll}>
              🎲 주사위 굴리기
            </button>
          )}

          {phase === "question" && diceQ && (
            <>
              <p className="board-question">{numeralDie ? "두 주사위를 더하면?" : "점이 모두 몇 개?"}</p>
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
            </>
          )}

          {phase === "moving" && (
            <div className="step-counter" key={step}>
              <strong className={toneClass(Math.max(step, 1))}>{step}</strong>
              <span>{countingWord(Math.max(step, 1))}</span>
            </div>
          )}

          {(phase === "ready" || phase === "rolling") && (
            <p className="board-stats">
              {board.laps > 0 ? `마을 ${board.laps}바퀴 · ` : ""}내 집 {ownedCount}채
            </p>
          )}
        </div>
      </div>

      {event && (
        <div className="sheet-backdrop board-backdrop">
          <section className="sheet board-sheet" role="dialog" aria-modal="true" aria-label={event.tile.name}>
            {event.kind === "lot" && (
              <div className="lot-card" style={{ "--group": groupColors[event.tile.group] }}>
                <span className="lot-emoji" aria-hidden="true">{event.tile.emoji}</span>
                <h3 className="lot-name">
                  <b className={toneClass(event.tile.group + 1)}>{event.tile.word[0]}</b>
                  {event.tile.word.slice(1)} 마을
                </h3>
                <p className="lot-hint">
                  {josa(event.tile.word, "은", "는")} <b>{initialOf(event.tile.word)}</b> {withRo(letterName(initialOf(event.tile.word)))} 시작해요
                </p>
                <div className="lot-price">
                  <span>집 값</span>
                  <strong><CoinIcon />{event.tile.price}</strong>
                  <span>내 코인 {coins}</span>
                </div>
                <div className="sheet-buttons">
                  <button
                    className={`chunky-button buy-house ${coins < event.tile.price ? "is-short" : ""}`}
                    onClick={(e) => buyLot(event.tile, e.currentTarget)}
                  >
                    {coins >= event.tile.price ? "🏠 집 사기" : <><LockIcon />{event.tile.price - coins}개 더 모아요</>}
                  </button>
                  <button className="chunky-button later-button" onClick={closeEvent}>지나가기</button>
                </div>
              </div>
            )}

            {event.kind === "house" && house && (
              <div className="house-editor">
                <div className="house-stage" style={{ "--group": groupColors[event.tile.group] }}>
                  <HouseArt level={house.level} roof={house.roof} decor={house.decor} />
                  <span className="house-label">{event.tile.name} · {houseNames[house.level - 1]}</span>
                  {event.rent ? <span className="rent-chip"><CoinIcon />+{event.rent}</span> : null}
                </div>
                <div className="decor-panel">
                  <p className="decor-title">지붕 색</p>
                  <div className="roof-swatches">
                    {roofColors.map((color) => (
                      <button
                        key={color}
                        className={`roof-swatch ${house.roof === color ? "is-active" : ""}`}
                        style={{ background: color }}
                        onClick={() => setRoof(event.tile, color)}
                        aria-label="지붕 색 바꾸기"
                      >
                        {house.roof === color && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                  <p className="decor-title">꾸미기</p>
                  <div className="decor-grid">
                    {decorItems.map((item) => {
                      const placed = house.decor.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          className={`decor-item ${placed ? "is-placed" : ""} ${!placed && coins < item.price ? "is-short" : ""}`}
                          onClick={(e) => buyDecor(event.tile, item, e.currentTarget)}
                          disabled={placed}
                        >
                          <span className="decor-emoji">{item.emoji}</span>
                          <span>{item.name}</span>
                          <small>{placed ? "완료" : <><CoinIcon />{item.price}</>}</small>
                        </button>
                      );
                    })}
                  </div>
                  <div className="sheet-buttons">
                    {house.level < 3 && (
                      <button
                        className={`chunky-button upgrade-button ${coins < upgradeCost(event.tile, house.level) ? "is-short" : ""}`}
                        onClick={(e) => upgradeHouse(event.tile, e.currentTarget)}
                      >
                        ⬆ {withRo(houseNames[house.level])} 키우기 <CoinIcon />{upgradeCost(event.tile, house.level)}
                      </button>
                    )}
                    <button className="chunky-button later-button" onClick={closeEvent}>다 꾸몄어요</button>
                  </div>
                </div>
              </div>
            )}

            {event.kind === "quiz" && quiz && (
              <div className="board-quiz">
                <p className="quiz-title">
                  {event.tile.emoji === "가" ? <span className="quiz-badge">가</span> : <span aria-hidden="true">{event.tile.emoji}</span>}
                  {event.tile.name} · 맞히면 <CoinIcon />{event.reward}
                </p>
                <div className="round quiz-round" key={quiz.id}>
                  {quiz.gameId === "count" && <CountGame round={quiz} onCountTap={tapQuizCount} onAnswer={answerQuiz} />}
                  {quiz.gameId === "add" && <AddGame round={quiz} onAnswer={answerQuiz} />}
                  {quiz.gameId === "h-picture" && <HangulPicture round={quiz} onAnswer={answerQuiz} />}
                  {quiz.gameId === "h-build" && <HangulBuild round={quiz} onAnswer={answerQuiz} />}
                </div>
              </div>
            )}

            {(event.kind === "park" || event.kind === "gift" || event.kind === "start") && (
              <div className="simple-event">
                <span className="simple-emoji" aria-hidden="true">{event.tile.emoji}</span>
                <h3>{event.tile.name}</h3>
                <p>
                  {event.kind === "park" && <>신나게 놀았어요! <CoinIcon />+5</>}
                  {event.kind === "gift" && <>선물이에요! <CoinIcon />+{event.amount}</>}
                  {event.kind === "start" && "출발점이에요. 다시 한 바퀴!"}
                </p>
                <button className="chunky-button later-button" onClick={closeEvent}>
                  좋아요!
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
