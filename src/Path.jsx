import { useEffect, useRef, useState } from "react";
import { AddGame, CompareGame, CountGame, FindGame, MissingGame } from "./games";
import { HangulBlend, HangulBuild, HangulListen, HangulPicture, HangulTrace } from "./hangulGames";
import { CONSONANTS, blendParts, compose, letterName, letterSound } from "./hangul";
import { BackIcon, CheckIcon, LockIcon, PlayIcon, SpeakerIcon, StarShape } from "./icons";
import { dueItems } from "./learning";
import { examplesFor, repeatStep, rowSyllables } from "./path";
import { countingWord, josa, sinoWord, toneClass } from "./rounds";
import { sfx } from "./sfx";
import { praise, say as lines } from "./speech";

const MEET_VOWELS = "ㅏㅓㅗㅜㅣ".split("");
const MEET_CONSONANTS = "ㄱㄴㅁㅅㅇ".split("");

function Stars({ count, className = "" }) {
  return (
    <span className={`path-stars ${className}`} aria-label={`별 ${count}개`}>
      {[1, 2, 3].map((n) => <StarShape key={n} className={n <= count ? "is-on" : ""} />)}
    </span>
  );
}

// 만나기: the letter, its name and sound, words that start with it, and how it reads in syllables.
function Meet({ letter, onSay, onNext }) {
  const consonant = CONSONANTS.includes(letter);
  const examples = examplesFor(letter);
  const syllables = consonant
    ? MEET_VOWELS.map((vowel) => compose(letter, vowel))
    : MEET_CONSONANTS.map((c) => compose(c, letter));
  return (
    <div className="path-meet">
      <div className="meet-main">
        <button className="meet-letter" onClick={() => onSay(lines.pathMeet(letter))} aria-label={`${letterName(letter)} 듣기`}>
          {letter}
        </button>
        <div className="meet-info">
          <strong>{letterName(letter)}</strong>
          <span>{consonant ? "자음" : "모음"}</span>
          {letter === "ㅇ" ? (
            <p className="meet-sound is-quiet">앞에 오면 소리가 없어요</p>
          ) : (
            <button className="meet-sound" onClick={() => onSay(letterSound(letter))}>
              <SpeakerIcon />
              소리 <b>{letterSound(letter)}</b>
            </button>
          )}
        </div>
      </div>
      {examples.length > 0 && (
        <div className="meet-examples">
          {examples.map((entry) => (
            <button key={entry.word} className="meet-example" onClick={() => onSay(entry.word)}>
              <span aria-hidden="true">{entry.emoji}</span>
              <b>{entry.word}</b>
            </button>
          ))}
        </div>
      )}
      <div className="meet-syllables">
        {syllables.map((syllable) => (
          <button key={syllable} onClick={() => onSay(syllable)}>{syllable}</button>
        ))}
      </div>
      <button className="chunky-button path-next" onClick={onNext}>
        다음 <PlayIcon />
      </button>
    </div>
  );
}

// 숫자 만나기: the numeral, its two names, and dots to count one by one.
function NumberMeet({ number, onSay, onNext }) {
  const [counted, setCounted] = useState(0);
  function countOne() {
    if (counted >= number) {
      onSay(lines.dex(number));
      return;
    }
    const next = counted + 1;
    setCounted(next);
    sfx.count(Math.min(next, 12));
    onSay(next === number ? lines.countAll(next) : lines.counting(next), { rate: "fast" });
  }
  return (
    <div className="path-meet">
      <div className="meet-main">
        <button className={`meet-letter meet-number ${toneClass(number)}`} onClick={() => onSay(lines.dex(number))} aria-label={`${sinoWord(number)} 듣기`}>
          {number}
        </button>
        <div className="meet-info">
          <strong>{sinoWord(number)}</strong>
          <span>{countingWord(number)}</span>
          <button className="meet-sound" onClick={() => onSay(lines.dex(number))}>
            <SpeakerIcon />
            듣기
          </button>
        </div>
      </div>
      <p className="chart-title">{counted < number ? "점을 눌러서 하나씩 세어봐요" : `모두 ${countingWord(number)}!`}</p>
      <div className="meet-dots" aria-label={`점 ${number}개`}>
        {Array.from({ length: number }, (_, index) => (
          <button
            key={index}
            className={`meet-dot ${index < counted ? `is-counted ${toneClass(number)}` : ""}`}
            style={{ "--i": index }}
            onClick={countOne}
            aria-label={index < counted ? `${index + 1}` : "세기"}
          >
            {index < counted ? index + 1 : ""}
          </button>
        ))}
      </div>
      <button className="chunky-button path-next" onClick={onNext}>
        다음 <PlayIcon />
      </button>
    </div>
  );
}

// 11–20: the new numbers among all the ones up to 20, each read out when tapped.
function NumberChart({ numbers, onSay, onNext }) {
  return (
    <div className="path-meet">
      <p className="chart-title">새 숫자를 눌러서 들어봐요</p>
      <div className="number-chart">
        {Array.from({ length: 20 }, (_, index) => index + 1).map((n) => (
          <button
            key={n}
            className={numbers.includes(n) ? `is-new ${toneClass(n)}` : ""}
            style={{ "--i": n }}
            onClick={() => onSay(lines.dex(n))}
          >
            {n}
          </button>
        ))}
      </div>
      <button className="chunky-button path-next" onClick={onNext}>
        다음 <PlayIcon />
      </button>
    </div>
  );
}

function Chart({ vowel, onSay, onNext }) {
  return (
    <div className="path-meet">
      <p className="chart-title">눌러서 읽어봐요</p>
      <div className="path-chart">
        {rowSyllables(vowel).map((syllable, index) => (
          <button key={syllable} style={{ "--i": index }} onClick={() => onSay(syllable)}>{syllable}</button>
        ))}
      </div>
      <button className="chunky-button path-next" onClick={onNext}>
        다음 <PlayIcon />
      </button>
    </div>
  );
}

function WordCards({ entries, onSay, onNext }) {
  return (
    <div className="path-meet">
      <p className="chart-title">눌러서 낱말을 들어봐요</p>
      <div className="path-words">
        {entries.map((entry, index) => (
          <button key={entry.word} style={{ "--i": index }} onClick={() => onSay(entry.word)}>
            <span aria-hidden="true">{entry.emoji}</span>
            <b>{entry.word}</b>
          </button>
        ))}
      </div>
      <button className="chunky-button path-next" onClick={onNext}>
        다음 <PlayIcon />
      </button>
    </div>
  );
}

// 듣고 따라 읽기: cards that turn by themselves while the voice reads them, for easy repetition.
function ListenAlong({ title, items, say, onClose }) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const item = items[at];

  useEffect(() => {
    if (!playing || finished) return undefined;
    let alive = true;
    let waiting = null;
    const advance = () => {
      if (!alive) return;
      alive = false;
      clearTimeout(waiting);
      waiting = setTimeout(() => {
        if (at + 1 < items.length) setAt(at + 1);
        else setFinished(true);
      }, 650);
    };
    const speech = item.number ? lines.dex(item.number) : item.letter ? lines.pathMeet(item.letter) : item.text;
    const start = setTimeout(() => say(speech, { onEnd: advance }), 350);
    // If the voice never reports the end, move on after a generous wait.
    waiting = setTimeout(advance, 2500 + speech.length * 320);
    return () => {
      alive = false;
      clearTimeout(start);
      clearTimeout(waiting);
    };
    // `say` and `item` follow `at`; restarting on every render would cut the voice off.
  }, [at, playing, finished]);

  function go(next) {
    sfx.tap();
    setPlaying(true);
    setFinished(false);
    setAt(Math.max(0, Math.min(items.length - 1, next)));
  }

  return (
    <div className="sheet-backdrop listen-backdrop">
      <section className="sheet listen-sheet" role="dialog" aria-modal="true" aria-label={`${title} 듣고 따라 읽기`}>
        <header className="sheet-head">
          <h2>듣고 따라 읽기</h2>
          <button className="chunky-button sheet-done" onClick={onClose}>닫기</button>
        </header>
        <div className={`listen-card ${item.isWord ? "is-word" : ""}`} key={item.key}>
          <span className="listen-big">{item.big}</span>
          {item.name && <strong>{item.name}</strong>}
          {item.emoji && (
            <span className="listen-example">
              <i aria-hidden="true">{item.emoji}</i>
              {!item.isWord && item.word}
            </span>
          )}
        </div>
        <div className="listen-dots" aria-label={`${items.length}개 중 ${at + 1}번째`}>
          {items.map((entry, index) => <i key={entry.key} className={index === at ? "is-now" : index < at ? "is-done" : ""} />)}
        </div>
        <div className="listen-controls">
          <button className="chunky-button later-button" onClick={() => go(at - 1)} disabled={at === 0} aria-label="앞 글자">
            <BackIcon />
          </button>
          {finished ? (
            <button className="chunky-button path-next" onClick={() => go(0)}>처음부터 다시</button>
          ) : (
            <button className="chunky-button path-next" onClick={() => setPlaying(!playing)}>
              {playing ? "잠깐 멈춤" : "계속 듣기"}
            </button>
          )}
          <button className="chunky-button later-button listen-forward" onClick={() => go(at + 1)} disabled={at === items.length - 1} aria-label="다음 글자">
            <BackIcon />
          </button>
        </div>
      </section>
    </div>
  );
}

export function Path({ course, autoDaily, stars, review, today, reviewedToday, say, setMessage, onBack, onLearn, onComplete }) {
  const [lesson, setLesson] = useState(null);
  const [listening, setListening] = useState(null);
  const [steps, setSteps] = useState([]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [result, setResult] = useState(null);
  const timers = useRef(new Set());
  const mistakes = useRef(0); // read by a delayed nextStep, so not state
  const stepsRef = useRef([]); // likewise: a missed question is added while nextStep is waiting
  const currentRef = useRef(null);
  const { lessons, units, itemWord } = course;
  const learned = course.learned(stars, review);
  const prefix = course.id === "numbers" ? "num:" : "ko:";
  const dueCount = dueItems(review, today).filter((key) => key.startsWith(prefix)).length;
  const context = { learned, review, today };
  const nextIndex = course.next(stars);
  const doneCount = lessons.filter((item) => stars[item.id]).length;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Opened from 오늘의 공부's review step: go straight into the review.
  useEffect(() => {
    if (autoDaily && learned.length >= 2) startLesson(course.daily);
    // Only when the screen opens.
  }, []);
  // Bring the lesson to do next into view when the map opens.
  useEffect(() => {
    if (!lesson) currentRef.current?.scrollIntoView({ block: "center" });
  }, [lesson]);

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
  }

  // ------------------------------------------------------------ lesson flow
  function startLesson(item) {
    clearLater();
    sfx.tap();
    const made = course.build(item, context);
    setLesson(item);
    stepsRef.current = made;
    setSteps(made);
    mistakes.current = 0;
    setResult(null);
    showStep(made, 0);
  }

  function showStep(list, at) {
    const current = list[at];
    setIndex(at);
    setRound(current.round ?? null);
    if (current.type === "meet") {
      setMessage(`${current.letter}! 눌러서 소리를 들어봐.`);
      later(() => say(lines.pathMeet(current.letter)), 450);
    } else if (current.type === "chart") {
      setMessage("글자를 눌러서 읽어봐!");
      later(() => say(lines.pathChart(rowSyllables(current.vowel))), 450);
    } else if (current.type === "numberMeet") {
      setMessage(`${current.number}! 점을 눌러서 세어봐.`);
      later(() => say(lines.dex(current.number)), 450);
    } else if (current.type === "numberChart") {
      setMessage("새 숫자를 눌러서 들어봐!");
      later(() => say(lines.numberChart(current.numbers)), 450);
    } else if (current.type === "words") {
      setMessage("낱말을 눌러서 들어봐!");
      later(() => say(lines.pathWords), 450);
    } else {
      setMessage(
        current.type === "trace" ? "회색 글자를 손가락으로 따라 써봐!"
          : current.warmup ? `먼저 배운 ${itemWord}를 복습해보자!`
            : current.repeat ? "아까 그 문제, 한 번 더 해보자!"
              : "잘 보고, 잘 듣고 골라봐!"
      );
      const prompt = lines.prompt(current.round);
      if (prompt) later(() => say(prompt), 450);
    }
  }

  function nextStep() {
    clearLater();
    if (index + 1 < stepsRef.current.length) {
      showStep(stepsRef.current, index + 1);
      return;
    }
    const earned = mistakes.current === 0 ? 3 : mistakes.current <= 2 ? 2 : 1;
    const daily = lesson.kind === "daily";
    // The daily review pays once a day; doing it again is just for practice.
    const reward = daily ? (reviewedToday ? 2 : 10) : course.reward(lesson);
    const last = !daily && lessons.indexOf(lesson) === lessons.length - 1;
    setResult({ stars: earned, reward, last, daily });
    setRound(null);
    sfx.levelUp();
    setMessage(`${lesson.title}, 참 잘했어!`);
    const allDone = course.id === "numbers" ? lines.numberPathAllDone : lines.pathAllDone;
    say(daily ? lines.reviewDone : last ? allDone : lines.pathDone);
    onComplete(lesson, earned, reward);
  }

  function leaveLesson() {
    clearLater();
    setLesson(null);
    setResult(null);
    setRound(null);
    setMessage(`${josa(course.title, "을", "를")} 따라가 보자!`);
  }

  // ------------------------------------------------------------ answers
  function giveHint(target, value) {
    if (target.gameId === "h-listen" || target.gameId === "find") say(lines.prompt(target));
    else if (target.gameId === "count") say(lines.countTogether);
    else if (target.gameId === "missing") say(lines.missingHint(target.sequence[1] - target.sequence[0]));
    else if (target.gameId === "add") say(lines.addHint);
    else if (target.gameId === "h-picture") say(lines.slowWord(target.entry.word), { rate: "slow" });
    else if (target.gameId === "h-build") say(lines.buildHint(target.consonant, target.vowel), { rate: "slow" });
    else {
      const made = blendParts(target, value);
      say(`${lines.blend(made)} ${lines.notThis(made.syllable, target.target)}`, { rate: "slow" });
    }
  }

  function answer(value) {
    if (!round || round.feedback || round.eliminated.includes(value)) return;
    const correct = value === round.answer;
    // A repeated question is there to end on a success: it does not touch stars or records.
    const again = Boolean(stepsRef.current[index].repeat);
    // Two-sided questions (more or fewer) have no second try: the other side would be a giveaway.
    if (!correct && !round.retried && round.options?.length >= 2) {
      const others = round.options.filter((option) => option !== value && option !== round.answer);
      const extra = round.options.length >= 4 && others.length ? [others[0]] : [];
      const retry = { ...round, retried: true, hint: true, lastWrong: value, eliminated: [value, ...extra] };
      // Counting again: number every object so the child can count along.
      if (round.gameId === "count") retry.tapped = Array.from({ length: round.count }, (_, i) => i);
      setRound(retry);
      // The missed question comes back once at the end of the lesson.
      if (!again) {
        mistakes.current += 1;
        stepsRef.current = [...stepsRef.current, repeatStep(stepsRef.current[index])];
        setSteps(stepsRef.current);
      }
      sfx.wrong();
      setMessage("괜찮아! 한 번 더 해보자.");
      giveHint(round, value);
      return;
    }
    const firstTry = correct && !round.retried;
    setRound({ ...round, feedback: { picked: value, correct } });
    if (!again) onLearn(round, correct, firstTry);
    const lead = round.gameId === "h-blend" ? `${lines.blend(blendParts(round))} ` : "";
    if (correct) {
      sfx.correct();
      setMessage(firstTry ? "맞았어!" : "다시 해서 맞혔어!");
      say(lead + (firstTry ? praise[Math.floor(Math.random() * praise.length)] : lines.secondTryRight));
    } else {
      sfx.wrong();
      if (!again) mistakes.current += 1;
      const shown = round.gameId === "compare" ? round[round.answer] : round.answer;
      setMessage(`정답은 ${shown}!`);
      say(lead + lines.answerIs(shown));
    }
    later(nextStep, correct ? (lead ? 2600 : 1700) : 2800);
  }

  function countTap(at) {
    if (!round || round.gameId !== "count" || round.feedback || round.tapped.includes(at)) return;
    const tapped = [...round.tapped, at];
    setRound({ ...round, tapped });
    sfx.count(Math.min(tapped.length, 12));
    say(lines.counting(tapped.length), { rate: "fast" });
  }

  function traced() {
    if (!round || round.feedback) return;
    setRound({ ...round, feedback: { correct: true } });
    onLearn(round, true, true);
    sfx.correct();
    setMessage("참 잘 썼어!");
    say(praise[Math.floor(Math.random() * praise.length)]);
    later(nextStep, 1600);
  }

  // ------------------------------------------------------------ render
  if (lesson) {
    const current = steps[index];
    return (
      <div className={`play-panel path-panel play-${course.theme}`}>
        <div className="play-header">
          <button className="back-button" onClick={leaveLesson} aria-label={`${course.title}로`}>
            <BackIcon />
            <span>길</span>
          </button>
          <div className="play-title">
            <h2>
              {lesson.title}
              {!result && current?.warmup && <span className="step-tag">복습</span>}
              {!result && current?.repeat && <span className="step-tag is-again">한 번 더</span>}
            </h2>
            <div className="step-dots" aria-label={`${steps.length}개 중 ${index + 1}번째`}>
              {steps.map((_, at) => (
                <i key={at} className={result || at < index ? "is-done" : at === index ? "is-now" : ""} />
              ))}
            </div>
          </div>
          {round && lines.prompt(round) && !result && (
            <button className="icon-button listen-mini" onClick={() => say(lines.prompt(round))} aria-label="다시 듣기">
              <SpeakerIcon />
            </button>
          )}
        </div>

        {result ? (
          <div className="path-result">
            <Stars count={result.stars} className="is-big" />
            <h3>{lesson.title} 끝!</h3>
            <p>
              {result.daily ? `배운 ${josa(itemWord, "을", "를")} 다시 만났어요. 내일 또 해요!`
                : result.last ? `${josa(course.title, "을", "를")} 끝까지 걸었어요!` : "참 잘했어요! 다음 칸이 열렸어요."}
            </p>
            <p className="path-reward">코인 +{result.reward}</p>
            <div className="sheet-buttons">
              {result.daily && (
                <button className="chunky-button path-next" onClick={() => startLesson(course.daily)}>한 번 더</button>
              )}
              {!result.last && !result.daily && (
                <button className="chunky-button path-next" onClick={() => startLesson(lessons[lessons.indexOf(lesson) + 1])}>
                  다음 칸 <PlayIcon />
                </button>
              )}
              <button className="chunky-button later-button" onClick={leaveLesson}>길 보기</button>
            </div>
          </div>
        ) : (
          <div className="round" key={`${lesson.id}-${index}`}>
            {current.type === "meet" && <Meet letter={current.letter} onSay={say} onNext={nextStep} />}
            {current.type === "chart" && <Chart vowel={current.vowel} onSay={say} onNext={nextStep} />}
            {current.type === "words" && <WordCards entries={current.entries} onSay={say} onNext={nextStep} />}
            {current.type === "numberMeet" && <NumberMeet number={current.number} onSay={say} onNext={nextStep} />}
            {current.type === "numberChart" && <NumberChart numbers={current.numbers} onSay={say} onNext={nextStep} />}
            {current.type === "trace" && round && <HangulTrace round={round} onTraced={traced} />}
            {current.type === "quiz" && round && (
              <>
                {round.gameId === "h-listen" && (
                  <HangulListen round={round} speaking={false} onSpeak={() => say(lines.prompt(round))} onAnswer={answer} />
                )}
                {round.gameId === "h-picture" && <HangulPicture round={round} onAnswer={answer} />}
                {round.gameId === "h-build" && <HangulBuild round={round} onAnswer={answer} />}
                {round.gameId === "h-blend" && <HangulBlend round={round} onAnswer={answer} onSay={say} />}
                {round.gameId === "find" && (
                  <FindGame round={round} speaking={false} onSpeak={() => say(lines.prompt(round))} onAnswer={answer} />
                )}
                {round.gameId === "count" && <CountGame round={round} onCountTap={countTap} onAnswer={answer} />}
                {round.gameId === "missing" && <MissingGame round={round} onAnswer={answer} />}
                {round.gameId === "compare" && <CompareGame round={round} onAnswer={answer} />}
                {round.gameId === "add" && <AddGame round={round} onAnswer={answer} />}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`play-panel path-panel play-${course.theme}`}>
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>{course.title}</h2>
          <p className="eyebrow">{course.subtitle}</p>
        </div>
        <span className="sticker-chip">
          <StarShape />
          {doneCount} / {lessons.length}
        </span>
      </div>

      <div className="path-map">
        <section className={`daily-card ${reviewedToday ? "is-done" : ""}`}>
          <span className="daily-icon" aria-hidden="true"><StarShape /></span>
          <div className="daily-copy">
            <strong>오늘의 복습</strong>
            <small>
              {learned.length < 2 ? `${josa(itemWord, "을", "를")} 두 개 배우면 열려요`
                : reviewedToday ? "오늘 복습 끝! 더 하고 싶으면 또 해도 돼요"
                  : dueCount > 0 ? `다시 만날 ${itemWord} ${Math.min(dueCount, learned.length)}개가 기다려요` : `배운 ${josa(itemWord, "을", "를")} 짧게 다시 만나요`}
            </small>
          </div>
          <button className="chunky-button path-next" onClick={() => startLesson(course.daily)} disabled={learned.length < 2}>
            {reviewedToday ? "또 하기" : "복습하기"} <PlayIcon />
          </button>
        </section>

        {units.map((unit) => {
          const unitDone = unit.lessons.every((item) => stars[item.id]);
          const cards = course.listenItems(unit, stars);
          return (
            <section key={unit.id} className={`path-unit ${unitDone ? "is-done" : ""}`}>
              <h3>
                {unit.title}
                {unitDone && <span className="unit-badge"><CheckIcon /> 다 했어요</span>}
                {cards.length > 0 && (
                  <button className="unit-listen" onClick={() => { sfx.tap(); setListening({ title: unit.title, items: cards }); }}>
                    <SpeakerIcon /> 듣고 따라 읽기
                  </button>
                )}
              </h3>
              <div className="path-stones">
                {unit.lessons.map((item) => {
                  const at = lessons.indexOf(item);
                  const earned = stars[item.id] ?? 0;
                  const locked = at > nextIndex;
                  const isNext = at === nextIndex;
                  return (
                    <button
                      key={item.id}
                      ref={isNext ? currentRef : null}
                      className={`path-stone kind-${item.kind} ${earned ? "is-done" : ""} ${isNext ? "is-next" : ""} ${locked ? "is-locked" : ""}`}
                      onClick={() => !locked && startLesson(item)}
                      disabled={locked}
                      aria-label={`${item.title}${locked ? " 잠김" : ""}`}
                    >
                      <span className="stone-face">
                        {locked ? <LockIcon /> : course.isReview(item) ? <StarShape /> : item.label}
                      </span>
                      {earned > 0 ? <Stars count={earned} /> : <small>{isNext ? "여기!" : course.isReview(item) ? "복습" : ""}</small>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {listening && (
        <ListenAlong
          title={listening.title}
          items={listening.items}
          say={say}
          onClose={() => {
            setListening(null);
            say(" ");
          }}
        />
      )}
    </div>
  );
}
