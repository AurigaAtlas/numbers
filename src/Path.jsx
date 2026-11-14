import { useEffect, useRef, useState } from "react";
import { HangulBlend, HangulBuild, HangulListen, HangulPicture, HangulTrace } from "./hangulGames";
import { CONSONANTS, blendParts, compose, letterName, letterSound } from "./hangul";
import { BackIcon, CheckIcon, LockIcon, PlayIcon, SpeakerIcon, StarShape } from "./icons";
import { buildSteps, examplesFor, lessonReward, nextLessonIndex, pathLessons, pathUnits, rowSyllables } from "./path";
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

export function Path({ stars, say, setMessage, onBack, onLearn, onComplete }) {
  const [lesson, setLesson] = useState(null);
  const [steps, setSteps] = useState([]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [result, setResult] = useState(null);
  const timers = useRef(new Set());
  const mistakes = useRef(0); // read by a delayed nextStep, so not state
  const currentRef = useRef(null);
  const nextIndex = nextLessonIndex(stars);
  const doneCount = pathLessons.filter((item) => stars[item.id]).length;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
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
    const made = buildSteps(item);
    setLesson(item);
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
    } else if (current.type === "words") {
      setMessage("낱말을 눌러서 들어봐!");
      later(() => say(lines.pathWords), 450);
    } else {
      setMessage(current.type === "trace" ? "회색 글자를 손가락으로 따라 써봐!" : "잘 보고, 잘 듣고 골라봐!");
      const prompt = lines.prompt(current.round);
      if (prompt) later(() => say(prompt), 450);
    }
  }

  function nextStep() {
    clearLater();
    if (index + 1 < steps.length) {
      showStep(steps, index + 1);
      return;
    }
    const earned = mistakes.current === 0 ? 3 : mistakes.current <= 2 ? 2 : 1;
    const reward = lessonReward(lesson);
    const last = pathLessons.indexOf(lesson) === pathLessons.length - 1;
    setResult({ stars: earned, reward, last });
    setRound(null);
    sfx.levelUp();
    setMessage(`${lesson.title}, 참 잘했어!`);
    say(last ? lines.pathAllDone : lines.pathDone);
    onComplete(lesson, earned, reward);
  }

  function leaveLesson() {
    clearLater();
    setLesson(null);
    setResult(null);
    setRound(null);
    setMessage("한글 길을 따라가 보자!");
  }

  // ------------------------------------------------------------ answers
  function giveHint(target, value) {
    if (target.gameId === "h-listen") say(lines.prompt(target));
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
    if (!correct && !round.retried) {
      const others = round.options.filter((option) => option !== value && option !== round.answer);
      const extra = round.options.length >= 4 && others.length ? [others[0]] : [];
      setRound({ ...round, retried: true, hint: true, lastWrong: value, eliminated: [value, ...extra] });
      mistakes.current += 1;
      sfx.wrong();
      setMessage("괜찮아! 한 번 더 해보자.");
      giveHint(round, value);
      return;
    }
    const firstTry = correct && !round.retried;
    setRound({ ...round, feedback: { picked: value, correct } });
    onLearn(round, correct, firstTry);
    const lead = round.gameId === "h-blend" ? `${lines.blend(blendParts(round))} ` : "";
    if (correct) {
      sfx.correct();
      setMessage(firstTry ? "맞았어!" : "다시 해서 맞혔어!");
      say(lead + (firstTry ? praise[Math.floor(Math.random() * praise.length)] : lines.secondTryRight));
    } else {
      sfx.wrong();
      mistakes.current += 1;
      setMessage(`정답은 ${round.answer}!`);
      say(lead + lines.answerIs(round.answer));
    }
    later(nextStep, correct ? (lead ? 2600 : 1700) : 2800);
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
      <div className="play-panel path-panel play-pink">
        <div className="play-header">
          <button className="back-button" onClick={leaveLesson} aria-label="한글 길로">
            <BackIcon />
            <span>길</span>
          </button>
          <div className="play-title">
            <h2>{lesson.title}</h2>
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
            <p>{result.last ? "한글 길을 끝까지 걸었어요!" : "참 잘했어요! 다음 칸이 열렸어요."}</p>
            <p className="path-reward">코인 +{result.reward}</p>
            <div className="sheet-buttons">
              {!result.last && (
                <button className="chunky-button path-next" onClick={() => startLesson(pathLessons[pathLessons.indexOf(lesson) + 1])}>
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
            {current.type === "trace" && round && <HangulTrace round={round} onTraced={traced} />}
            {current.type === "quiz" && round && (
              <>
                {round.gameId === "h-listen" && (
                  <HangulListen round={round} speaking={false} onSpeak={() => say(lines.prompt(round))} onAnswer={answer} />
                )}
                {round.gameId === "h-picture" && <HangulPicture round={round} onAnswer={answer} />}
                {round.gameId === "h-build" && <HangulBuild round={round} onAnswer={answer} />}
                {round.gameId === "h-blend" && <HangulBlend round={round} onAnswer={answer} onSay={say} />}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="play-panel path-panel play-pink">
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>한글 길</h2>
          <p className="eyebrow">ㄱ부터 차례대로, 한 칸씩 배워요</p>
        </div>
        <span className="sticker-chip">
          <StarShape />
          {doneCount} / {pathLessons.length}
        </span>
      </div>

      <div className="path-map">
        {pathUnits.map((unit) => {
          const unitDone = unit.lessons.every((item) => stars[item.id]);
          return (
            <section key={unit.id} className={`path-unit ${unitDone ? "is-done" : ""}`}>
              <h3>
                {unit.title}
                {unitDone && <span className="unit-badge"><CheckIcon /> 다 했어요</span>}
              </h3>
              <div className="path-stones">
                {unit.lessons.map((item) => {
                  const at = pathLessons.indexOf(item);
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
                        {locked ? <LockIcon /> : item.kind === "review" || item.kind === "rowReview" ? <StarShape /> : item.label}
                      </span>
                      {earned > 0 ? <Stars count={earned} /> : <small>{isNext ? "여기!" : item.kind.includes("eview") ? "복습" : ""}</small>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
