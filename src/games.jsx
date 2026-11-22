import { BackIcon, CheckIcon, CoinIcon, SpeakerIcon, StarShape } from "./icons";
import { VoiceStage, tileState } from "./gameParts";
import { HangulBlend, HangulBuild, HangulListen, HangulPicture, HangulTrace } from "./hangulGames";
import { picnicStops, toneClass } from "./rounds";

export function GameScreen({
  game,
  round,
  level,
  reward,
  speaking,
  onBack,
  onSpeak,
  onAnswer,
  onPictureHint,
  onCountTap,
  onOrder,
  onMemory,
  onSequence,
  onSequenceStudy,
  onBalloon,
  onTraced,
  onSay
}) {
  return (
    <div className={`play-panel play-${game.color}`}>
      <div className="play-header">
        <button className="back-button" onClick={onBack} aria-label="처음으로">
          <BackIcon />
          <span>처음</span>
        </button>
        <div className="play-title">
          <h2>{game.title}</h2>
          <p className="eyebrow">
            <span className={`level-pill level-${level.id}`}>{game.id === "h-sequence" ? `기억 도전 ${round.sequenceStage}단계` : `${level.id}단계 ${level.name}`}</span>
            <span className="eyebrow-text">{game.subtitle}</span>
          </p>
        </div>
        {onSpeak && game.id !== "find" && game.id !== "h-listen" && !game.id.endsWith("balloon") && (
          <button
            className={`icon-button listen-mini ${speaking ? "is-speaking" : ""}`}
            onClick={onSpeak}
            aria-label="다시 듣기"
          >
            <SpeakerIcon />
          </button>
        )}
        <span className="reward-chip big"><CoinIcon />+{reward}</span>
      </div>

      {round.picnicStep != null && (
        <ol className="picnic-stops" aria-label="소풍 길">
          {picnicStops.map(({ label }, at) => (
            <li key={label} aria-current={at === round.picnicStep ? "step" : undefined} className={at < round.picnicStep ? "visited" : ""}>
              <span aria-hidden="true">
                {at === round.picnicStep ? <img src="./assets/board/rabbit.webp" alt="" /> : at < round.picnicStep ? <CheckIcon /> : at + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      )}

      <div className="round" key={round.id}>
        {game.id === "find" && <FindGame round={round} speaking={speaking} onSpeak={onSpeak} onAnswer={onAnswer} onHint={onPictureHint} />}
        {game.id === "count" && <CountGame round={round} onCountTap={onCountTap} onAnswer={onAnswer} />}
        {game.id === "order" && <OrderGame round={round} onOrder={onOrder} />}
        {(game.id === "memory" || game.id === "h-memory") && <MemoryGame round={round} onMemory={onMemory} />}
        {game.id === "h-sequence" && <SequenceGame round={round} onPick={onSequence} onStudy={onSequenceStudy} onSay={onSay} />}
        {game.id === "compare" && <CompareGame round={round} onAnswer={onAnswer} />}
        {game.id === "missing" && <MissingGame round={round} onAnswer={onAnswer} />}
        {game.id === "add" && <AddGame round={round} onAnswer={onAnswer} />}
        {(game.id === "balloon" || game.id === "h-balloon") && <BalloonGame round={round} onBalloon={onBalloon} onSpeak={onSpeak} />}
        {game.id === "h-listen" && <HangulListen round={round} speaking={speaking} onSpeak={onSpeak} onAnswer={onAnswer} />}
        {game.id === "h-picture" && <HangulPicture round={round} onAnswer={onAnswer} />}
        {game.id === "h-build" && <HangulBuild round={round} onAnswer={onAnswer} />}
        {game.id === "h-blend" && <HangulBlend round={round} onAnswer={onAnswer} onSay={onSay} />}
        {game.id === "h-trace" && <HangulTrace round={round} onTraced={onTraced} />}
      </div>
    </div>
  );
}

function OptionGrid({ round, onAnswer }) {
  return (
    <div className={`option-grid options-${round.options.length}`}>
      {round.options.map((value, index) => (
        <button
          key={value}
          className={`number-tile ${toneClass(value)} ${tileState(value, round, round.answer)}`}
          style={{ "--i": index }}
          disabled={Boolean(round.feedback) || round.eliminated?.includes(value)}
          onClick={() => onAnswer(value)}
        >
          <span>{value}</span>
        </button>
      ))}
    </div>
  );
}

function FindGame({ round, speaking, onSpeak, onAnswer, onHint }) {
  return (
    <>
      <VoiceStage speaking={speaking} onSpeak={onSpeak} title="잘 듣고 숫자를 찾아요" />
      {round.picnicStep != null && (
        <details
          className="picnic-clue"
          open={round.hint || undefined}
          onToggle={(event) => {
            if (event.currentTarget.open && !round.usedPicture) onHint();
          }}
        >
          <summary>그림 힌트</summary>
          <div className="picnic-harvest" aria-label={`사과 ${round.answer}개`}>
            {Array.from({ length: round.answer }, (_, i) => <img key={i} src="./assets/object-apple.webp" alt="" />)}
          </div>
        </details>
      )}
      <OptionGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

function ObjectPile({ count, object, className = "", counted, onTap, leaving = 0, numberFrom = 0 }) {
  return (
    <div className={`object-pile ${className} ${count > 10 ? "is-crowded" : ""}`}>
      {Array.from({ length: count }, (_, index) => {
        const isLeaving = index >= count - leaving;
        // numberFrom > 0 labels every staying object (used as the counting hint).
        const order = numberFrom && !isLeaving ? numberFrom + index : counted ? counted.indexOf(index) + 1 : 0;
        const Tag = onTap ? "button" : "span";
        return (
          <Tag
            key={index}
            className={`count-object ${order ? `is-counted ${onTap ? "n-4" : toneClass(order)}` : ""} ${isLeaving ? "is-leaving" : ""}`}
            style={{ "--i": index, "--tilt": `${((index * 37) % 13) - 6}deg` }}
            onClick={onTap ? () => onTap(index) : undefined}
            aria-label={onTap ? (order ? `${order}번째` : `${object.name} 세기`) : undefined}
          >
            <img src={object.image} alt="" aria-hidden="true" />
            {order > 0 && <span className="count-badge">{onTap ? "✓" : order}</span>}
          </Tag>
        );
      })}
    </div>
  );
}

export function CountGame({ round, onCountTap, onAnswer }) {
  return (
    <>
      <div className="count-stage" aria-label={`${round.object.name} 세기`}>
        <ObjectPile
          count={round.count}
          object={round.object}
          className="count-field"
          counted={round.tapped}
          onTap={onCountTap}
        />
        <div className="count-meter" aria-hidden="true">
          <span>{round.tapped.length === round.count ? "다 세었어요" : "하나씩 눌러요"}</span>
        </div>
      </div>
      <OptionGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

function OrderGame({ round, onOrder }) {
  return (
    <>
      <div className="order-track" aria-label={`${round.selected.length}개 눌렀어요`}>
        {round.sequence.map((value) => {
          const done = round.selected.includes(value);
          const isNext = !round.feedback && value === round.next;
          return (
            <span
              key={value}
              className={`track-slot ${done ? toneClass(value) : ""} ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
            >
              {done ? value : isNext ? "?" : "–"}
            </span>
          );
        })}
      </div>
      <div className={`order-grid count-${round.sequence.length}`}>
        {round.options.map((value, index) => (
          <button
            key={value}
            className={`number-tile ${toneClass(value)} ${round.selected.includes(value) ? "selected" : ""} ${round.lastWrong === value && !round.feedback ? "is-wrong-try" : ""} ${tileState(value, round, round.next)}`}
            style={{ "--i": index }}
            onClick={() => onOrder(value)}
          >
            <span>{value}</span>
            {round.selected.includes(value) && <span className="tile-check"><CheckIcon /></span>}
          </button>
        ))}
      </div>
    </>
  );
}

function SequenceGame({ round, onPick, onStudy, onSay }) {
  return (
    <>
      <p aria-live="polite">
        {round.studying ? "왼쪽부터 읽어 봐. 글자를 누르면 소리가 나!" :
          round.feedback ? "순서를 모두 기억했어!" : `${round.cursor + 1}번째 글자는 뭘까?`}
      </p>
      {round.studying ? (
        <div className="order-track" aria-label="기억할 글자 순서">
          {round.sequence.map((letter, index) => (
            <button key={index} className="track-slot is-done n-7" onClick={() => onSay(letter)}>{letter}</button>
          ))}
        </div>
      ) : (
        <div className={`option-grid options-${round.options.length}`}>
          {round.options.map((letter) => (
            <button key={letter} className="number-tile n-7" disabled={Boolean(round.feedback)} onClick={() => onPick(letter)}>
              <span>{letter}</span>
            </button>
          ))}
        </div>
      )}
      {!round.feedback && <button className="back-button" onClick={onStudy}>
        {round.studying ? "다 외웠어!" : "다시 볼래"}
      </button>}
    </>
  );
}

function MemoryGame({ round, onMemory }) {
  // Number cards are tinted by their number; letter cards all share one tint so a
  // pair has to be read, not colour-matched.
  const letters = round.gameId === "h-memory";
  return (
    <div className={`memory-grid cards-${round.cards.length} ${letters ? "is-letters" : ""}`}>
      {round.cards.map((card, index) => {
        const visible = card.matched || round.flipped.includes(card.id);
        return (
          <button
            key={card.id}
            className={`memory-card ${letters ? "n-7" : toneClass(card.value)} ${visible ? "visible" : ""} ${card.matched ? "matched" : ""}`}
            style={{ "--i": index }}
            onClick={() => onMemory(card.id)}
            aria-label={visible ? `${card.say ?? card.value}` : "뒤집힌 카드"}
          >
            <span className="memory-inner">
              <span className="memory-face memory-back">
                <StarShape />
              </span>
              {letters ? (
                <span className={`memory-face memory-front ${card.emoji ? "has-picture" : ""} ${(card.text ?? "").length > 1 ? "is-word" : ""}`}>
                  {card.emoji && <i className="memory-emoji" aria-hidden="true">{card.emoji}</i>}
                  {card.text && <b>{card.text}</b>}
                </span>
              ) : (
                <span className="memory-face memory-front">{card.value}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CompareGame({ round, onAnswer }) {
  const question = round.showNumerals
    ? round.ask === "more" ? "더 큰 숫자는?" : "더 작은 숫자는?"
    : round.ask === "more" ? "더 많은 쪽은?" : "더 적은 쪽은?";
  const sides = [
    { side: "left", value: round.left, object: round.leftObject },
    { side: "right", value: round.right, object: round.rightObject }
  ];
  return (
    <>
      <div className={`question-banner ask-${round.ask}`}>
        <span className="question-icon">{round.ask === "more" ? "▲" : "▼"}</span>
        {question}
      </div>
      <div className="compare-stage">
        {sides.map(({ side, value, object }, index) => (
          <button
            key={side}
            className={`compare-side ${toneClass(value)} ${tileState(side, round, round.answer)}`}
            style={{ "--i": index }}
            onClick={() => onAnswer(side)}
            aria-label={round.showNumerals ? `${value}` : `${object.name} ${value}개`}
          >
            {round.showNumerals
              ? <span className="compare-number">{value}</span>
              : <ObjectPile count={value} object={object} className="compare-pile" />}
            {round.feedback && !round.showNumerals && <span className="compare-count">{value}</span>}
          </button>
        ))}
        <span className="compare-vs" aria-hidden="true">VS</span>
      </div>
    </>
  );
}

function MissingGame({ round, onAnswer }) {
  const filled = round.feedback?.correct;
  return (
    <>
      <div className="sequence-row" style={{ "--len": round.sequence.length }}>
        {round.sequence.map((value, index) => {
          const isBlank = index === round.blank;
          const step = round.sequence[1] - round.sequence[0];
          return (
            <span
              key={index}
              className={`sequence-chip ${toneClass(value)} ${isBlank ? "is-blank" : ""} ${isBlank && filled ? "is-filled" : ""}`}
              style={{ "--i": index }}
            >
              {isBlank && !filled ? "?" : value}
              {round.hint && index > 0 && (
                <i className="step-hint" style={{ "--i": index }}>{step > 0 ? `+${step}` : step}</i>
              )}
            </span>
          );
        })}
      </div>
      <OptionGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

export function AddGame({ round, onAnswer }) {
  const minus = round.op === "-";
  return (
    <>
      <div className={`math-stage ${minus ? "is-minus" : ""}`}>
        {minus ? (
          <ObjectPile count={round.a} object={round.object} className="math-pile" leaving={round.b} numberFrom={round.hint ? 1 : 0} />
        ) : (
          <>
            <ObjectPile count={round.a} object={round.object} className="math-pile" numberFrom={round.hint ? 1 : 0} />
            <span className="math-op">+</span>
            <ObjectPile count={round.b} object={round.object} className="math-pile pile-b" numberFrom={round.hint ? round.a + 1 : 0} />
          </>
        )}
      </div>
      <div className="equation" aria-label={`${round.a} ${minus ? "빼기" : "더하기"} ${round.b}`}>
        <span className={toneClass(round.a)}>{round.a}</span>
        <span className="eq-op">{minus ? "−" : "+"}</span>
        <span className={toneClass(round.b)}>{round.b}</span>
        <span className="eq-op">=</span>
        <span className={`eq-answer ${round.feedback?.correct ? `is-filled ${toneClass(round.answer)}` : ""}`}>
          {round.feedback?.correct ? round.answer : "?"}
        </span>
      </div>
      <OptionGrid round={round} onAnswer={onAnswer} />
    </>
  );
}

const balloonColors = ["#ff5c7a", "#3d8bff", "#36bf77", "#ffb21f", "#9b7bff", "#ff8a3d", "#1fb3cc", "#e35cd0"];

function BalloonGame({ round, onBalloon, onSpeak }) {
  const poppedTargets = round.popped.length;
  return (
    <>
      <div className="balloon-target">
        <button className="icon-button" onClick={onSpeak} aria-label="풍선 소리 다시 듣기"><SpeakerIcon /></button>
        <span className="target-copy">
          <strong>소리를 듣고 풍선을 터뜨려요</strong>
          <span className="target-dots">
            {Array.from({ length: round.goal }, (_, index) => (
              <i key={index} className={index < poppedTargets ? "is-done" : ""} />
            ))}
          </span>
        </span>
      </div>
      <div className={`balloon-sky ${round.feedback ? "is-paused" : ""}`}>
        <span className="sky-cloud sky-cloud-1" />
        <span className="sky-cloud sky-cloud-2" />
        {round.balloons.map((balloon, index) => {
          const popped = round.popped.includes(balloon.id);
          const wrong = round.wrong?.id === balloon.id;
          return (
            <span
              key={balloon.id}
              className={`balloon-rise sway-${balloon.sway}`}
              style={{
                left: `${balloon.x}%`,
                "--dur": `${balloon.duration}s`,
                "--delay": `${balloon.delay}s`
              }}
            >
              <button
                key={wrong ? round.wrong.key : "idle"}
                className={`balloon ${popped ? "is-popped" : ""} ${wrong ? "is-wrong" : ""}`}
                style={{ "--balloon": balloonColors[index % balloonColors.length] }}
                onClick={() => onBalloon(balloon.id)}
                disabled={popped}
                aria-label={`${balloon.value} 풍선`}
              >
                <span className="balloon-body">{balloon.value}</span>
                <span className="balloon-knot" />
                <span className="balloon-string" />
                {popped && (
                  <span className="balloon-burst" aria-hidden="true">
                    {Array.from({ length: 8 }, (_, burst) => <i key={burst} className={`p-${burst}`} />)}
                  </span>
                )}
              </button>
            </span>
          );
        })}
      </div>
    </>
  );
}
