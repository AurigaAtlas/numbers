import { BackIcon, CheckIcon, CoinIcon, SpeakerIcon, StarShape } from "./icons";
import { VoiceStage, tileState } from "./gameParts";
import { HangulBuild, HangulListen, HangulPicture, HangulTrace } from "./hangulGames";
import { toneClass } from "./rounds";

export function GameScreen({
  game,
  round,
  level,
  reward,
  speaking,
  onBack,
  onSpeak,
  onAnswer,
  onCountTap,
  onOrder,
  onMemory,
  onBalloon,
  onTraced
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
            <span className={`level-pill level-${level.id}`}>{level.id}단계 {level.name}</span>
            <span className="eyebrow-text">{game.subtitle}</span>
          </p>
        </div>
        {onSpeak && game.id !== "find" && game.id !== "h-listen" && (
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

      <div className="round" key={round.id}>
        {game.id === "find" && <FindGame round={round} speaking={speaking} onSpeak={onSpeak} onAnswer={onAnswer} />}
        {game.id === "count" && <CountGame round={round} onCountTap={onCountTap} onAnswer={onAnswer} />}
        {game.id === "order" && <OrderGame round={round} onOrder={onOrder} />}
        {game.id === "memory" && <MemoryGame round={round} onMemory={onMemory} />}
        {game.id === "compare" && <CompareGame round={round} onAnswer={onAnswer} />}
        {game.id === "missing" && <MissingGame round={round} onAnswer={onAnswer} />}
        {game.id === "add" && <AddGame round={round} onAnswer={onAnswer} />}
        {game.id === "balloon" && <BalloonGame round={round} onBalloon={onBalloon} />}
        {game.id === "h-listen" && <HangulListen round={round} speaking={speaking} onSpeak={onSpeak} onAnswer={onAnswer} />}
        {game.id === "h-picture" && <HangulPicture round={round} onAnswer={onAnswer} />}
        {game.id === "h-build" && <HangulBuild round={round} onAnswer={onAnswer} />}
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
          onClick={() => onAnswer(value)}
        >
          <span>{value}</span>
        </button>
      ))}
    </div>
  );
}

function FindGame({ round, speaking, onSpeak, onAnswer }) {
  return (
    <>
      <VoiceStage speaking={speaking} onSpeak={onSpeak} title="잘 듣고 숫자를 찾아요" />
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
            className={`count-object ${order ? `is-counted ${toneClass(order)}` : ""} ${isLeaving ? "is-leaving" : ""}`}
            style={{ "--i": index, "--tilt": `${((index * 37) % 13) - 6}deg` }}
            onClick={onTap ? () => onTap(index) : undefined}
            aria-label={onTap ? (order ? `${order}번째` : `${object.name} 세기`) : undefined}
          >
            <img src={object.image} alt="" aria-hidden="true" />
            {order > 0 && <span className="count-badge">{order}</span>}
          </Tag>
        );
      })}
    </div>
  );
}

function CountGame({ round, onCountTap, onAnswer }) {
  return (
    <>
      <div className="count-stage" aria-label={`${round.object.name} ${round.count}개`}>
        <ObjectPile
          count={round.count}
          object={round.object}
          className="count-field"
          counted={round.tapped}
          onTap={onCountTap}
        />
        <div className="count-meter" aria-hidden="true">
          <span>센 개수</span>
          <strong key={round.tapped.length}>{round.tapped.length}</strong>
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
              className={`track-slot ${toneClass(value)} ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
            >
              {value}
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

function MemoryGame({ round, onMemory }) {
  return (
    <div className={`memory-grid cards-${round.cards.length}`}>
      {round.cards.map((card, index) => {
        const visible = card.matched || round.flipped.includes(card.id);
        return (
          <button
            key={card.id}
            className={`memory-card ${toneClass(card.value)} ${visible ? "visible" : ""} ${card.matched ? "matched" : ""}`}
            style={{ "--i": index }}
            onClick={() => onMemory(card.id)}
            aria-label={visible ? `${card.value}` : "뒤집힌 카드"}
          >
            <span className="memory-inner">
              <span className="memory-face memory-back">
                <StarShape />
              </span>
              <span className="memory-face memory-front">{card.value}</span>
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

function AddGame({ round, onAnswer }) {
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

function BalloonGame({ round, onBalloon }) {
  const poppedTargets = round.popped.length;
  return (
    <>
      <div className="balloon-target">
        <span className={`target-number ${toneClass(round.target)}`}>{round.target}</span>
        <span className="target-copy">
          <strong>풍선을 찾아 터뜨려요</strong>
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
