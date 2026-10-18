import { useEffect, useRef, useState } from "react";
import { BackIcon, PlayIcon, SpeakerIcon, StarShape } from "./icons";
import { CONSONANTS, VOWELS, compose, exampleWord, letterName, letterTone, words } from "./hangul";
import { isMastered } from "./learning";
import { countingWord, josa, sinoWord, toneClass } from "./rounds";

const NUMBERS = Array.from({ length: 20 }, (_, index) => index + 1);
const SYLLABLE_VOWELS = ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅣ"];
const SYLLABLE_CONSONANTS = ["ㄱ", "ㄴ", "ㄷ", "ㅁ", "ㅅ"];

function vowelExample(vowel) {
  return words.find((entry) => entry.word[0] === compose("ㅇ", vowel)) ?? null;
}

export function dexEntries(subject) {
  if (subject === "numbers") return NUMBERS.map((n) => ({ key: `num:${n}`, value: n }));
  return [...CONSONANTS, ...VOWELS].map((jamo) => ({ key: `ko:${jamo}`, value: jamo }));
}

export function stickerCount(subject, mastery) {
  return dexEntries(subject).filter((entry) => isMastered(mastery[entry.key])).length;
}

// What the voice says when a card is opened.
export function dexSpeech(value) {
  if (typeof value === "number") return `${sinoWord(value)}, ${countingWord(value)}`;
  const name = letterName(value);
  const example = CONSONANTS.includes(value) ? exampleWord(value) : vowelExample(value);
  return example ? `${name}. ${example.word}의 ${name}` : name;
}

function TenFrames({ n, active }) {
  const frames = Math.ceil(n / 10);
  return (
    <div className="ten-frames">
      {Array.from({ length: frames }, (_, frame) => (
        <div className="ten-frame" key={frame}>
          {Array.from({ length: 10 }, (_, cell) => {
            const index = frame * 10 + cell;
            const filled = index < n;
            return (
              <span
                key={cell}
                className={`ten-cell ${filled ? `is-filled ${toneClass(n)}` : ""} ${active === index ? "is-active" : ""}`}
                style={{ "--i": index }}
              >
                {active !== null && active >= index && filled && <b>{index + 1}</b>}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function NumberDetail({ n, onSay }) {
  const [active, setActive] = useState(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    setActive(null);
  }, [n]);

  function countAlong() {
    timers.current.forEach(clearTimeout);
    timers.current = Array.from({ length: n }, (_, index) =>
      setTimeout(() => {
        setActive(index);
        onSay(countingWord(index + 1), "fast");
      }, index * 650)
    );
    timers.current.push(setTimeout(() => onSay(`모두 ${countingWord(n)}!`), n * 650 + 200));
  }

  return (
    <div className={`dex-detail ${toneClass(n)}`} key={n}>
      <div className="dex-hero">
        <span className="dex-big">{n}</span>
        <div className="dex-words">
          <strong>{sinoWord(n)}</strong>
          <span>{countingWord(n)}</span>
        </div>
      </div>
      <TenFrames n={n} active={active} />
      <div className="dex-actions">
        <button className="chunky-button dex-say" onClick={() => onSay(dexSpeech(n))}>
          <SpeakerIcon />
          듣기
        </button>
        <button className="chunky-button dex-count" onClick={countAlong}>
          <PlayIcon />
          같이 세기
        </button>
      </div>
    </div>
  );
}

function LetterDetail({ jamo, onSay }) {
  const consonant = CONSONANTS.includes(jamo);
  const example = consonant ? exampleWord(jamo) : vowelExample(jamo);
  const syllables = consonant
    ? SYLLABLE_VOWELS.map((vowel) => compose(jamo, vowel))
    : SYLLABLE_CONSONANTS.map((c) => compose(c, jamo));
  return (
    <div className={`dex-detail ${letterTone(jamo)}`} key={jamo}>
      <div className="dex-hero">
        <span className="dex-big">{jamo}</span>
        <div className="dex-words">
          <strong>{letterName(jamo)}</strong>
          <span>{consonant ? "자음" : "모음"}</span>
        </div>
        {example && (
          <button className="dex-example" onClick={() => onSay(example.word)}>
            <span className="dex-emoji" aria-hidden="true">{example.emoji}</span>
            <span>
              <b className="dex-example-first">{example.word[0]}</b>
              {example.word.slice(1)}
            </span>
          </button>
        )}
      </div>
      <div className="dex-syllables">
        {syllables.map((syllable, index) => (
          <button
            key={syllable}
            className={`dex-syllable ${letterTone(syllable)}`}
            style={{ "--i": index }}
            onClick={() => onSay(syllable)}
          >
            {syllable}
          </button>
        ))}
      </div>
      <div className="dex-actions">
        <button className="chunky-button dex-say" onClick={() => onSay(dexSpeech(jamo))}>
          <SpeakerIcon />
          듣기
        </button>
      </div>
    </div>
  );
}

export function Dex({ subject, onSubject, mastery, onBack, onOpen, onSay }) {
  const entries = dexEntries(subject);
  const [selected, setSelected] = useState(entries[0].value);
  const total = entries.length;
  const stickers = stickerCount(subject, mastery);

  useEffect(() => {
    setSelected(dexEntries(subject)[0].value);
  }, [subject]);

  function open(entry) {
    setSelected(entry.value);
    onOpen(entry.value);
  }

  return (
    <div className={`play-panel dex-panel play-${subject === "numbers" ? "sky" : "pink"}`}>
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>{subject === "numbers" ? "숫자 도감" : "한글 도감"}</h2>
          <p className="eyebrow">눌러서 듣고, 잘 익히면 스티커를 모아요</p>
        </div>
        <span className="sticker-chip">
          <StarShape />
          {stickers} / {total}
        </span>
      </div>

      <div className="segmented dex-tabs">
        <button className={subject === "numbers" ? "active" : ""} onClick={() => onSubject("numbers")}>숫자</button>
        <button className={subject === "hangul" ? "active" : ""} onClick={() => onSubject("hangul")}>한글</button>
      </div>

      {typeof selected === "number" && subject === "numbers"
        ? <NumberDetail n={selected} onSay={onSay} />
        : subject === "hangul" && typeof selected === "string" && <LetterDetail jamo={selected} onSay={onSay} />}

      {subject === "hangul" && <p className="dex-section">자음 14 · 모음 10</p>}
      <div className={`dex-grid dex-grid-${subject}`} key={subject}>
        {entries.map((entry, index) => {
          const mastered = isMastered(mastery[entry.key]);
          const tone = typeof entry.value === "number" ? toneClass(entry.value) : letterTone(entry.value);
          return (
            <button
              key={entry.key}
              className={`dex-card ${tone} ${entry.value === selected ? "is-selected" : ""} ${mastered ? "is-mastered" : ""}`}
              style={{ "--i": Math.min(index, 24) }}
              onClick={() => open(entry)}
              aria-label={`${entry.value}${mastered ? " 스티커" : ""}`}
            >
              <span className="dex-card-value">{entry.value}</span>
              <small>{typeof entry.value === "number" ? sinoWord(entry.value) : letterName(entry.value)}</small>
              {mastered && <span className="dex-sticker"><StarShape /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function dexOpenLine(value) {
  return typeof value === "number"
    ? `${value}! ${sinoWord(value)}, ${countingWord(value)}`
    : `${value}! ${josa(letterName(value), "이야", "야")}`;
}
