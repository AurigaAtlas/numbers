import { useEffect } from "react";
import { CheckIcon, CrownIcon, ResetIcon, SpeakerIcon, StarShape } from "./icons";
import { qualityLabel, useKoreanVoices } from "./voice";

const rateOptions = [
  { id: "slow", label: "천천히" },
  { id: "normal", label: "보통" },
  { id: "fast", label: "빠르게" }
];

function prettyVoiceName(voice) {
  return voice.name
    .replace(/^Microsoft\s+/i, "")
    .replace(/\s*-\s*Korean.*$/i, "")
    .replace(/\(?Korean\s*\(Korea\)\)?/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isApplePlatform() {
  return /iPad|iPhone|Macintosh/.test(navigator.userAgent);
}

export function SettingsSheet({ settings, onChange, onPreview, onReset, onClose }) {
  const voices = useKoreanVoices();
  const selectedURI = settings.voiceURI ?? voices[0]?.voiceURI;
  const hasGreatVoice = voices.some((voice) => qualityLabel(voice) === "고음질");

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="설정"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-head">
          <h2>설정</h2>
          <button className="chunky-button sheet-done" onClick={onClose}>완료</button>
        </header>

        <div className="sheet-section">
          <h3>목소리</h3>
          {voices.length === 0 ? (
            <p className="sheet-note">이 기기에서 한국어 목소리를 찾지 못했어요.</p>
          ) : (
            <div className="voice-list">
              {voices.map((voice) => {
                const active = voice.voiceURI === selectedURI;
                const quality = qualityLabel(voice);
                return (
                  <button
                    key={voice.voiceURI}
                    className={`voice-option ${active ? "is-active" : ""}`}
                    onClick={() => {
                      onChange({ voiceURI: voice.voiceURI });
                      onPreview(voice.voiceURI);
                    }}
                  >
                    <span className="voice-radio">{active && <CheckIcon />}</span>
                    <span className="voice-name">{prettyVoiceName(voice)}</span>
                    <span className={`voice-quality q-${quality === "고음질" ? "great" : quality === "좋음" ? "good" : "basic"}`}>
                      {quality}
                    </span>
                    <span className="voice-play"><SpeakerIcon /></span>
                  </button>
                );
              })}
            </div>
          )}
          {!hasGreatVoice && (
            <div className="voice-tip">
              <strong>더 자연스러운 목소리 받기</strong>
              {isApplePlatform() ? (
                <p>
                  아이패드 <b>설정 → 손쉬운 사용 → 읽기 및 말하기 → 음성 → 한국어</b>에서
                  <b> 유나(고품질)</b> 같은 목소리를 내려받은 뒤 이 앱을 다시 열면 목록에 나타나요.
                </p>
              ) : (
                <p>
                  Microsoft Edge 브라우저에서는 <b>SunHi Online (Natural)</b> 같은 자연스러운 목소리를 바로 쓸 수 있어요.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="sheet-section">
          <h3>말 빠르기</h3>
          <div className="segmented">
            {rateOptions.map((option) => (
              <button
                key={option.id}
                className={settings.rate === option.id ? "active" : ""}
                onClick={() => {
                  onChange({ rate: option.id });
                  onPreview(undefined, option.id);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-section toggles">
          <label className="toggle-row">
            <span>
              <strong>칭찬 목소리</strong>
              <small>정답이면 칭찬하고, 틀리면 정답을 알려줘요</small>
            </span>
            <input
              type="checkbox"
              checked={settings.praiseVoice}
              onChange={(event) => onChange({ praiseVoice: event.target.checked })}
            />
            <i className="switch" aria-hidden="true" />
          </label>
          <label className="toggle-row">
            <span>
              <strong>효과음</strong>
              <small>버튼, 정답, 코인 소리</small>
            </span>
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(event) => onChange({ sound: event.target.checked })}
            />
            <i className="switch" aria-hidden="true" />
          </label>
        </div>

        <div className="sheet-section">
          <button className="reset-row" onClick={onReset}>
            <ResetIcon />
            코인·아이템·단계 처음으로 되돌리기
          </button>
        </div>
      </section>
    </div>
  );
}

export function LevelUpOverlay({ level, onClose }) {
  return (
    <div className="levelup-backdrop">
      <div className="levelup-card" role="dialog" aria-modal="true" aria-label="레벨 업">
        <div className="levelup-rays" aria-hidden="true" />
        <CrownIcon className="levelup-crown" />
        {Array.from({ length: 6 }, (_, index) => (
          <StarShape key={index} className={`levelup-star s-${index}`} />
        ))}
        <p className="levelup-kicker">레벨 업!</p>
        <h2>
          {level.id}단계 <span>{level.name}</span>
        </h2>
        <p className="levelup-copy">{level.perk}</p>
        <button className="chunky-button levelup-button" onClick={onClose}>좋아!</button>
      </div>
    </div>
  );
}
