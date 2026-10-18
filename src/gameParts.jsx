import { SpeakerIcon } from "./icons";

export function tileState(value, round, answer) {
  const feedback = round.feedback;
  if (!feedback) {
    // After a first mistake the wrong pick (and one more) are crossed out.
    if (round.eliminated?.includes(value)) return value === round.lastWrong ? "is-out is-wrong-try" : "is-out";
    return "";
  }
  if (value === feedback.picked) return feedback.correct ? "is-correct" : "is-wrong";
  if (!feedback.correct && value === answer) return "is-answer";
  return "is-dim";
}

export function VoiceStage({ speaking, onSpeak, title }) {
  return (
    <div className={`voice-stage ${speaking ? "is-speaking" : ""}`}>
      <button className="speaker-button" onClick={onSpeak} aria-label="다시 듣기">
        <span className="speaker-ring ring-1" />
        <span className="speaker-ring ring-2" />
        <span className="speaker-ring ring-3" />
        <span className="speaker-core"><SpeakerIcon /></span>
      </button>
      <div className="voice-copy">
        <div className="eq" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => <i key={index} style={{ "--i": index }} />)}
        </div>
        <strong>{title}</strong>
        <span>스피커를 누르면 다시 들려줘요</span>
      </div>
    </div>
  );
}
