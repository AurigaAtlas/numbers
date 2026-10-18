import { CheckIcon, ChestIcon } from "./icons";
import { MISSION_REWARD, missionsDone } from "./learning";

export function MissionPanel({ daily, onClaim }) {
  const ready = missionsDone(daily);
  const doneCount = daily.missions.filter((mission) => mission.progress >= mission.target).length;
  return (
    <section className="mission-panel enter" style={{ "--i": 2 }} aria-label="오늘의 미션">
      <div className="mission-body">
        <div className="mission-head">
          <strong>오늘의 미션</strong>
          <span>{doneCount} / {daily.missions.length}</span>
        </div>
        <div className="mission-list">
          {daily.missions.map((mission) => {
            const done = mission.progress >= mission.target;
            return (
              <div key={`${mission.type}-${mission.target}`} className={`mission ${done ? "is-done" : ""}`}>
                <span className="mission-icon" aria-hidden="true">{done ? <CheckIcon /> : mission.icon}</span>
                <span className="mission-text">
                  {mission.text}
                  <i className="mission-bar"><b style={{ width: `${(mission.progress / mission.target) * 100}%` }} /></i>
                </span>
              </div>
            );
          })}
        </div>
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
    </section>
  );
}
