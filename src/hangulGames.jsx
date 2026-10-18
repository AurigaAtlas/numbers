import { useEffect, useRef, useState } from "react";
import { ResetIcon } from "./icons";
import { isJamo, letterName, letterTone } from "./hangul";
import { VoiceStage, tileState } from "./gameParts";

function LetterGrid({ round, onAnswer }) {
  const long = round.options.some((value) => value.length > 1);
  return (
    <div className={`option-grid options-${round.options.length} ${long ? "is-words" : ""}`}>
      {round.options.map((value, index) => {
        // The name would give the answer away, so it only appears once answered.
        const showName = round.feedback && value === round.answer && letterName(value);
        return (
          <button
            key={value}
            className={`number-tile letter-tile ${isJamo(value) ? "is-jamo" : ""} ${letterTone(value)} ${tileState(value, round, round.answer)}`}
            style={{ "--i": index }}
            onClick={() => onAnswer(value)}
          >
            <span>{value}</span>
            {showName && <small className="letter-name">{showName}</small>}
          </button>
        );
      })}
    </div>
  );
}

export function HangulListen({ round, speaking, onSpeak, onAnswer }) {
  const copy = {
    jamo: "소리를 듣고 글자를 찾아요",
    syllable: "어떤 글자인지 잘 들어봐요",
    word: "어떤 낱말인지 잘 들어봐요"
  }[round.mode];
  return (
    <>
      <VoiceStage speaking={speaking} onSpeak={onSpeak} title={copy} />
      <LetterGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

export function HangulPicture({ round, onAnswer }) {
  const { entry, mode } = round;
  const solved = round.feedback?.correct;
  return (
    <>
      <div className="picture-stage">
        <span className="picture-emoji" aria-hidden="true">{entry.emoji}</span>
        {mode !== "word" && (
          <div className="picture-word" aria-label={entry.word}>
            {entry.word.split("").map((char, index) => (
              <span
                key={index}
                className={`picture-char ${index === 0 ? `is-first ${letterTone(char)}` : ""} ${index === 0 && mode === "syllable" && !solved ? "is-hidden" : ""}`}
                style={{ "--i": index }}
              >
                {index === 0 && mode === "syllable" && !solved ? "?" : char}
              </span>
            ))}
          </div>
        )}
        {mode === "word" && solved && <div className="picture-word is-reveal">{entry.word}</div>}
        <p className="picture-question">
          {mode === "initial" && "첫 글자는 어떤 자음으로 시작할까?"}
          {mode === "syllable" && "물음표에 들어갈 글자는?"}
          {mode === "word" && "그림에 맞는 낱말을 골라요"}
        </p>
      </div>
      <LetterGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

export function HangulBuild({ round, onAnswer }) {
  const solved = round.feedback?.correct;
  return (
    <>
      <div className={`build-stage ${solved ? "is-solved" : ""}`}>
        <span className={`build-piece piece-c ${letterTone(round.consonant)}`}>
          {round.consonant}
          <small>{letterName(round.consonant)}</small>
        </span>
        <span className="build-plus">+</span>
        <span className="build-piece piece-v">
          {round.vowel}
          <small>{letterName(round.vowel)}</small>
        </span>
        <span className="build-plus">=</span>
        <span className={`build-result ${solved ? `is-filled ${letterTone(round.answer)}` : ""}`}>
          {solved ? round.answer : "?"}
        </span>
      </div>
      <LetterGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

// Finger tracing: the letter is drawn faintly on a canvas, strokes are tracked on a
// coarse grid and compared with the letter's own pixels.
const GRID = 80;
const PASS_COVERAGE = 0.7;
const MAX_OUTSIDE = 0.5;
const FONT = '"Jua", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

// Fits the glyph's real ink box to ~68% of the square and centres it. Jamo glyphs
// are drawn much smaller than syllables inside the em box, so font size alone is not enough.
function drawGlyph(ctx, text, px, paint) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `100px ${FONT}`;
  const probe = ctx.measureText(text);
  const width = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight;
  const height = probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent;
  const fontSize = (100 * px * 0.68) / Math.max(width, height, 1);
  ctx.font = `${fontSize}px ${FONT}`;
  const m = ctx.measureText(text);
  const x = px / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const y = px / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  paint(x, y);
  ctx.restore();
}

export function HangulTrace({ round, onTraced }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const coveredRef = useRef(new Uint8Array(GRID * GRID));
  const lastRef = useRef(null);
  const [size, setSize] = useState(0);
  const [coverage, setCoverage] = useState(0);
  const [hint, setHint] = useState(null);
  const [fontReady, setFontReady] = useState(false);
  const done = Boolean(round.feedback?.correct);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setSize(Math.floor(Math.min(entry.contentRect.width, 460)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    const ready = document.fonts?.load ? document.fonts.load(`80px ${FONT}`, round.target) : Promise.resolve();
    ready.catch(() => {}).finally(() => alive && setFontReady(true));
    return () => {
      alive = false;
    };
  }, [round.target]);

  function paintGuide(ctx, px) {
    ctx.clearRect(0, 0, px, px);
    drawGlyph(ctx, round.target, px, (x, y) => {
      ctx.fillStyle = "#ece9f6";
      ctx.fillText(round.target, x, y);
      ctx.setLineDash([px * 0.012, px * 0.02]);
      ctx.lineWidth = Math.max(2, px * 0.006);
      ctx.strokeStyle = "#b9b3d6";
      ctx.strokeText(round.target, x, y);
    });
  }

  // Build the letter mask and draw the guide whenever the letter or size changes.
  useEffect(() => {
    if (!size || !fontReady || !canvasRef.current) return;
    const ratio = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    const ctx = canvas.getContext("2d");
    paintGuide(ctx, canvas.width);

    const off = document.createElement("canvas");
    off.width = GRID;
    off.height = GRID;
    const offCtx = off.getContext("2d");
    drawGlyph(offCtx, round.target, GRID, (x, y) => {
      offCtx.fillStyle = "#000";
      offCtx.fillText(round.target, x, y);
    });
    const pixels = offCtx.getImageData(0, 0, GRID, GRID).data;
    const mask = new Uint8Array(GRID * GRID);
    for (let i = 0; i < GRID * GRID; i += 1) mask[i] = pixels[i * 4 + 3] > 100 ? 1 : 0;
    const near = new Uint8Array(GRID * GRID);
    const reach = 4;
    for (let y = 0; y < GRID; y += 1) {
      for (let x = 0; x < GRID; x += 1) {
        if (!mask[y * GRID + x]) continue;
        for (let dy = -reach; dy <= reach; dy += 1) {
          for (let dx = -reach; dx <= reach; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) near[ny * GRID + nx] = 1;
          }
        }
      }
    }
    maskRef.current = { mask, near, total: mask.reduce((sum, value) => sum + value, 0) };
    coveredRef.current = new Uint8Array(GRID * GRID);
    setCoverage(0);
    setHint(null);
  }, [size, fontReady, round.target]);

  // Fill the letter in colour once it is traced.
  useEffect(() => {
    if (!done || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const color = getComputedStyle(wrapRef.current).getPropertyValue("--num").trim() || "#ff6f9f";
    drawGlyph(ctx, round.target, canvas.width, (x, y) => {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.fillText(round.target, x, y);
    });
  }, [done, round.target]);

  function point(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  }

  function mark(from, to) {
    const covered = coveredRef.current;
    const radius = 3;
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) * GRID));
    for (let s = 0; s <= steps; s += 1) {
      const cx = Math.round((from.x + ((to.x - from.x) * s) / steps) * GRID);
      const cy = Math.round((from.y + ((to.y - from.y) * s) / steps) * GRID);
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && y >= 0 && x < GRID && y < GRID) covered[y * GRID + x] = 1;
        }
      }
    }
  }

  function stroke(from, to) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const color = getComputedStyle(wrapRef.current).getPropertyValue("--num").trim() || "#ff6f9f";
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = canvas.width * 0.075;
    ctx.beginPath();
    ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
    ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
    ctx.stroke();
    ctx.restore();
    mark(from, to);
  }

  function evaluate() {
    const info = maskRef.current;
    if (!info || !info.total) return;
    const covered = coveredRef.current;
    let hit = 0;
    let drawn = 0;
    let outside = 0;
    for (let i = 0; i < covered.length; i += 1) {
      if (!covered[i]) continue;
      drawn += 1;
      if (info.mask[i]) hit += 1;
      if (!info.near[i]) outside += 1;
    }
    const ratio = hit / info.total;
    setCoverage(ratio);
    if (drawn && outside / drawn > MAX_OUTSIDE) {
      setHint("선을 따라 천천히 그려봐!");
      return;
    }
    setHint(null);
    if (ratio >= PASS_COVERAGE) onTraced();
  }

  function onPointerDown(event) {
    if (done) return;
    event.preventDefault();
    canvasRef.current.setPointerCapture?.(event.pointerId);
    const p = point(event);
    lastRef.current = p;
    stroke(p, p);
  }

  function onPointerMove(event) {
    if (!lastRef.current || done) return;
    const p = point(event);
    stroke(lastRef.current, p);
    lastRef.current = p;
  }

  function onPointerUp() {
    if (!lastRef.current) return;
    lastRef.current = null;
    evaluate();
  }

  function clear() {
    if (done || !canvasRef.current) return;
    paintGuide(canvasRef.current.getContext("2d"), canvasRef.current.width);
    coveredRef.current = new Uint8Array(GRID * GRID);
    setCoverage(0);
    setHint(null);
  }

  const name = letterName(round.target);
  const progress = Math.min(100, Math.round((coverage / PASS_COVERAGE) * 100));

  return (
    <div className="trace-layout">
      <div className={`trace-pad ${letterTone(round.target)} ${done ? "is-done" : ""}`} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          style={{ width: size, height: size }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          aria-label={`${round.target} 따라 쓰기`}
        />
      </div>
      <div className={`trace-side ${letterTone(round.target)}`}>
        <div className="trace-letter">
          <strong>{round.target}</strong>
          {name && <span>{name}</span>}
        </div>
        {round.example && (
          <div className="trace-example">
            <span className="trace-emoji" aria-hidden="true">{round.example.emoji}</span>
            <span>{round.example.word}</span>
          </div>
        )}
        <div className={`trace-meter ${hint ? "is-warn" : ""}`} aria-label={`${progress}% 따라 썼어요`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className={`trace-hint ${hint ? "is-warn" : ""}`}>{done ? "참 잘 썼어요!" : hint ?? "회색 글자 위를 손가락으로 따라 그려요"}</p>
        <button className="chunky-button trace-clear" onClick={clear} disabled={done}>
          <ResetIcon />
          지우기
        </button>
      </div>
    </div>
  );
}
