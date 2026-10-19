import { useEffect, useMemo, useState } from "react";
import { CONSONANTS, VOWELS, hangulLevels, letterName } from "./hangul";
import { stickerCount } from "./Dex";
import { masteryState, recentDays, weakItems } from "./learning";
import { levels } from "./data";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function newQuestion() {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 3 + Math.floor(Math.random() * 7);
  return { a, b, answer: String(a * b) };
}

// A multiplication question keeps settings and the break override for grown-ups.
export function ParentGate({ onPass, onClose }) {
  const [question, setQuestion] = useState(newQuestion);
  const [typed, setTyped] = useState("");
  const [shake, setShake] = useState(0);
  useEscape(onClose);

  function press(digit) {
    const next = `${typed}${digit}`;
    if (next.length < question.answer.length) {
      setTyped(next);
      return;
    }
    if (next === question.answer) {
      onPass();
      return;
    }
    setShake((count) => count + 1);
    setTyped("");
    setQuestion(newQuestion());
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet gate-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="어른 확인"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-head">
          <h2>어른 확인</h2>
          <button className="chunky-button sheet-done" onClick={onClose}>닫기</button>
        </header>
        <p className="gate-copy">부모님만 열 수 있어요. 답을 눌러주세요.</p>
        <div className={`gate-question ${shake ? "is-wrong" : ""}`} key={shake}>
          {question.a} × {question.b} =
          <span className="gate-answer">
            {Array.from({ length: question.answer.length }, (_, index) => (
              <i key={index}>{typed[index] ?? ""}</i>
            ))}
          </span>
        </div>
        <div className="gate-keys">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
            <button key={digit} className="gate-key" onClick={() => press(digit)}>{digit}</button>
          ))}
          <button className="gate-key gate-clear" onClick={() => setTyped("")} aria-label="지우기">지우기</button>
        </div>
      </section>
    </div>
  );
}

function percent(pair) {
  return pair[0] ? Math.round((pair[1] / pair[0]) * 100) : null;
}

function sumPairs(entries, key) {
  return entries.reduce((sum, entry) => [sum[0] + (entry?.[key]?.[0] ?? 0), sum[1] + (entry?.[key]?.[1] ?? 0)], [0, 0]);
}

function minutesText(seconds) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}

const stateLabel = { mastered: "익혔어요", learning: "배우는 중", weak: "연습 필요", new: "아직 안 해봤어요" };

function MasteryGrid({ items, mastery }) {
  return (
    <div className="report-grid">
      {items.map(({ key, label, sub }) => {
        const state = masteryState(mastery[key]);
        return (
          <span key={key} className={`report-cell is-${state}`} title={stateLabel[state]}>
            <b>{label}</b>
            {sub && <small>{sub}</small>}
          </span>
        );
      })}
    </div>
  );
}

// 학습 리포트: what the child played this week and which numbers and letters need practice.
export function ReportSheet({ profile, onClose }) {
  useEscape(onClose);
  const history = profile.history ?? {};
  const week = recentDays(7);
  const weekEntries = week.map((day) => history[day]);
  const maxSeconds = Math.max(60, ...weekEntries.map((entry) => entry?.s ?? 0));
  const weekSeconds = weekEntries.reduce((sum, entry) => sum + (entry?.s ?? 0), 0);
  const numbers = sumPairs(weekEntries, "n");
  const hangul = sumPairs(weekEntries, "k");
  const { mastery, progress } = profile;

  const numberItems = useMemo(
    () => Array.from({ length: 20 }, (_, index) => ({ key: `num:${index + 1}`, label: index + 1 })),
    []
  );
  const letterItems = useMemo(
    () => [...CONSONANTS, ...VOWELS].map((jamo) => ({ key: `ko:${jamo}`, label: jamo })),
    []
  );
  const weakNumbers = weakItems(mastery, "num:");
  const weakLetters = weakItems(mastery, "ko:");
  const weak = [...weakNumbers, ...weakLetters];

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet report-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="학습 리포트"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-head">
          <h2>학습 리포트</h2>
          <button className="chunky-button sheet-done" onClick={onClose}>닫기</button>
        </header>

        <div className="report-stats">
          <div>
            <small>이번 주 놀이</small>
            <strong>{minutesText(weekSeconds)}</strong>
          </div>
          <div>
            <small>숫자 정답률</small>
            <strong>{percent(numbers) === null ? "–" : `${percent(numbers)}%`}</strong>
            <em>{numbers[0]}문제</em>
          </div>
          <div>
            <small>한글 정답률</small>
            <strong>{percent(hangul) === null ? "–" : `${percent(hangul)}%`}</strong>
            <em>{hangul[0]}문제</em>
          </div>
          <div>
            <small>최고 연속</small>
            <strong>{progress.bestStreak}번</strong>
          </div>
        </div>

        <div className="sheet-section">
          <h3>최근 7일 놀이 시간</h3>
          <div className="report-week">
            {week.map((day, index) => {
              const entry = weekEntries[index];
              const seconds = entry?.s ?? 0;
              const answered = (entry?.n?.[0] ?? 0) + (entry?.k?.[0] ?? 0);
              const date = new Date(`${day}T12:00:00`);
              return (
                <div key={day} className={`report-day ${index === 6 ? "is-today" : ""}`}>
                  <span className="report-bar-wrap">
                    <span className="report-bar" style={{ "--h": `${(seconds / maxSeconds) * 100}%` }} />
                  </span>
                  <b>{seconds ? `${Math.max(1, Math.round(seconds / 60))}분` : ""}</b>
                  <small>{index === 6 ? "오늘" : WEEKDAYS[date.getDay()]}</small>
                  <em>{answered ? `${answered}문제` : ""}</em>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sheet-section">
          <h3>단계</h3>
          <div className="report-levels">
            <span>숫자 {progress.level}단계 · {levels[progress.level - 1].name}</span>
            <span>한글 {progress.hangulLevel}단계 · {hangulLevels[progress.hangulLevel - 1].name}</span>
            <span>스티커 숫자 {stickerCount("numbers", mastery)}/20 · 한글 {stickerCount("hangul", mastery)}/24</span>
          </div>
        </div>

        <div className="sheet-section">
          <h3>더 연습하면 좋아요</h3>
          {weak.length ? (
            <div className="report-weak">
              {weak.map((item) => (
                <span key={item}>{/^\d+$/.test(item) ? item : `${item} ${letterName(item)}`}</span>
              ))}
            </div>
          ) : (
            <p className="sheet-note">요즘 자주 틀리는 것이 없어요. 아주 잘하고 있어요!</p>
          )}
          <p className="sheet-note report-hint">자주 틀린 숫자와 글자는 게임에서 더 자주 나와요.</p>
        </div>

        <div className="sheet-section">
          <h3>숫자 1–20</h3>
          <MasteryGrid items={numberItems} mastery={mastery} />
          <h3>자음 · 모음</h3>
          <MasteryGrid items={letterItems} mastery={mastery} />
          <div className="report-legend">
            {Object.entries(stateLabel).map(([state, label]) => (
              <span key={state}><i className={`report-cell is-${state}`} />{label}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export const BREAK_SECONDS = 180;

// Shown after the play time a parent chose; play resumes after a short rest.
export function BreakOverlay({ onDone, onParent }) {
  const [left, setLeft] = useState(BREAK_SECONDS);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      setLeft(Math.max(0, BREAK_SECONDS - Math.floor((Date.now() - started) / 1000)));
    }, 500);
    return () => window.clearInterval(timer);
  }, []);
  const done = left === 0;

  return (
    <div className="levelup-backdrop break-backdrop">
      <div className="levelup-card break-card" role="dialog" aria-modal="true" aria-label="쉬는 시간">
        <div className="break-cloud" aria-hidden="true">
          <span className="break-eye l" />
          <span className="break-eye r" />
          <span className="break-z z1">z</span>
          <span className="break-z z2">z</span>
        </div>
        <p className="levelup-kicker">쉬는 시간</p>
        <h2>눈도 쉬고, 물도 한 잔!</h2>
        <p className="levelup-copy">
          {done ? "다 쉬었어요. 다시 놀아볼까요?" : "기지개를 쭉 펴고 창밖을 봐요."}
        </p>
        {done ? (
          <button className="chunky-button levelup-button" onClick={onDone}>다시 놀기</button>
        ) : (
          <div className="break-timer" aria-live="polite">
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </div>
        )}
        {!done && <button className="break-parent" onClick={onParent}>부모님이 열어주기</button>}
      </div>
    </div>
  );
}
