import { CheckIcon, ChestIcon, PlayIcon, StarShape } from "./icons";
import { MISSION_REWARD, missionsDone, recentDays, stepDone } from "./learning";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 오늘의 공부: the day's steps in order, the next one highlighted, a stamp for each
// finished day, and the treasure chest at the end.
export function TodayPlan({ daily, reviewReady, stamps, today, onGo, onClaim }) {
  const ready = missionsDone(daily, reviewReady);
  const doneCount = daily.missions.filter((mission) => stepDone(mission, reviewReady)).length;
  const next = daily.missions.find((mission) => !stepDone(mission, reviewReady));
  const week = recentDays(7);

  return (
    <section className="plan-panel enter" style={{ "--i": 2 }} aria-label="오늘의 공부">
      <div className="plan-head">
        <strong>오늘의 공부</strong>
        <span>{doneCount} / {daily.missions.length}</span>
      </div>

      <ol className="plan-steps">
        {daily.missions.map((mission, index) => {
          const done = stepDone(mission, reviewReady);
          const skipped = done && mission.progress < mission.target;
          const isNext = mission === next;
          return (
            <li key={mission.type}>
              <button
                className={`plan-step ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
                onClick={() => onGo(mission.type)}
                disabled={skipped}
              >
                <span className="plan-num">{done ? <CheckIcon /> : index + 1}</span>
                <span className="plan-icon" aria-hidden="true">{mission.icon}</span>
                <span className="plan-text">
                  {mission.text}
                  {skipped && <small>배운 게 두 개 생기면 시작해요</small>}
                  {!done && mission.target > 1 && <small>{mission.progress} / {mission.target}</small>}
                </span>
                {isNext && <span className="plan-go"><PlayIcon /></span>}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="plan-foot">
        <div className="stamp-row" aria-label="공부 도장">
          {week.map((day) => {
            const stamped = stamps.includes(day);
            return (
              <span key={day} className={`stamp ${stamped ? "is-stamped" : ""} ${day === today ? "is-today" : ""}`}>
                <i>{stamped ? <StarShape /> : null}</i>
                <small>{day === today ? "오늘" : WEEKDAYS[new Date(`${day}T12:00:00`).getDay()]}</small>
              </span>
            );
          })}
        </div>
        <button
          className={`chest-button ${ready && !daily.claimed ? "is-ready" : ""} ${daily.claimed ? "is-open" : ""}`}
          onClick={(event) => onClaim(event.currentTarget)}
          disabled={!ready || daily.claimed}
          aria-label={daily.claimed ? "오늘 보물상자를 열었어요" : `보물상자 코인 ${MISSION_REWARD}개`}
        >
          <ChestIcon open={daily.claimed} />
          <span>{daily.claimed ? "내일 또!" : ready ? "열어봐!" : `+${MISSION_REWARD}`}</span>
        </button>
      </div>
    </section>
  );
}
