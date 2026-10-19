const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true
};

export function CoinIcon({ className = "coin-icon" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#E8A500" />
      <circle cx="16" cy="14.6" r="12.6" fill="#FFD23F" />
      <circle cx="16" cy="14.6" r="8.6" fill="none" stroke="#F0AE00" strokeWidth="2" />
      <path d="M16 9.6l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#FFF3B8" />
      <ellipse cx="10.5" cy="8.6" rx="3" ry="1.6" fill="#FFF8D6" opacity="0.8" transform="rotate(-35 10.5 8.6)" />
    </svg>
  );
}

export function StarShape({ className, filled = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartShape({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.5S3 15 3 8.8A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 9 2.2C21 15 12 20.5 12 20.5z" fill="currentColor" />
    </svg>
  );
}

export function CloudShape({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true">
      <path
        d="M24 56h74a20 20 0 0 0 1-40 26 26 0 0 0-49-6 18 18 0 0 0-28 14A16 16 0 0 0 24 56z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SpeakerIcon() {
  return (
    <svg {...base}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18.3 6.5a7.6 7.6 0 0 1 0 11" />
    </svg>
  );
}

export function SoundOffIcon() {
  return (
    <svg {...base}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg {...base}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg {...base} strokeWidth="3">
      <path d="M14.5 5.5L8 12l6.5 6.5" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg {...base}>
      <path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z" fill="currentColor" />
    </svg>
  );
}

export function GiftIcon() {
  return (
    <svg {...base} strokeWidth="2.2">
      <rect x="3.5" y="10" width="17" height="10.5" rx="2" fill="currentColor" fillOpacity="0.25" />
      <rect className="gift-lid" x="2.5" y="6.8" width="19" height="4" rx="1.6" fill="currentColor" fillOpacity="0.35" />
      <path d="M12 6.8v13.7" />
      <path d="M12 6.8C10.5 3.5 6.5 3.6 7.4 5.6 8 6.8 12 6.8 12 6.8zM12 6.8c1.5-3.3 5.5-3.2 4.6-1.2-.6 1.2-4.6 1.2-4.6 1.2z" />
    </svg>
  );
}

export function BagIcon() {
  return (
    <svg {...base} strokeWidth="2.2">
      <path d="M5 8h14l-1.2 12a1.6 1.6 0 0 1-1.6 1.5H7.8a1.6 1.6 0 0 1-1.6-1.5z" fill="currentColor" fillOpacity="0.25" />
      <path d="M8.8 10V6.8a3.2 3.2 0 0 1 6.4 0V10" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...base} strokeWidth="3.4">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5c1 3.6 5.8 6 5.8 11.3A5.8 5.8 0 0 1 6.2 14c0-2.7 1.6-4.3 2.6-5.3.2 1.9 1 2.9 2 3.3-.5-3.4.2-6.4 1.2-9.5z" fill="#FF7A3D" />
      <path d="M12 12.2c.7 1.6 2.6 2.6 2.6 4.8a2.6 2.6 0 0 1-5.2 0c0-1.3.8-2.1 1.3-2.5.1.8.5 1.2.9 1.4-.2-1.3.1-2.6.4-3.7z" fill="#FFD23F" />
    </svg>
  );
}

export function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h10v5.2a5 5 0 0 1-10 0z" fill="#FFC62E" />
      <path d="M7 5H4.2a3.3 3.3 0 0 0 3.6 4.4M17 5h2.8a3.3 3.3 0 0 1-3.6 4.4" fill="none" stroke="#E8A500" strokeWidth="1.8" />
      <path d="M10.6 13.4h2.8l.5 3.6h-3.8z" fill="#E8A500" />
      <rect x="7.5" y="17" width="9" height="3.5" rx="1.2" fill="#C98F00" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...base} strokeWidth="2.4">
      <rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="currentColor" fillOpacity="0.25" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg {...base} strokeWidth="2.2">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2L5.5 5.5" />
      <circle cx="12" cy="12" r="6.6" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg {...base} strokeWidth="2.4">
      <path d="M4 20h16" />
      <rect x="5.5" y="11" width="3.4" height="6.5" rx="1.2" fill="currentColor" fillOpacity="0.25" />
      <rect x="10.3" y="6" width="3.4" height="11.5" rx="1.2" fill="currentColor" fillOpacity="0.25" />
      <rect x="15.1" y="9" width="3.4" height="8.5" rx="1.2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

export function CrownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 48" aria-hidden="true">
      <path d="M6 14l13 12 13-20 13 20 13-12-5 28H11z" fill="#ffc62e" stroke="#e5a100" strokeWidth="3" strokeLinejoin="round" />
      <rect x="11" y="38" width="42" height="7" rx="3" fill="#e5a100" />
      <circle cx="32" cy="6" r="4.5" fill="#ff5c7a" />
      <circle cx="6" cy="14" r="4" fill="#3d8bff" />
      <circle cx="58" cy="14" r="4" fill="#36bf77" />
      <circle cx="32" cy="29" r="4" fill="#fff6c2" />
    </svg>
  );
}

export function CompareArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 58l-11 22h22z" fill="#e5a100" />
      <g transform="rotate(-12 50 56)">
        <rect x="8" y="52" width="84" height="8" rx="4" fill="#ffc62e" />
        <circle cx="20" cy="44" r="8" fill="#ff5c7a" />
        <circle cx="34" cy="44" r="8" fill="#ff8a3d" />
        <circle cx="27" cy="31" r="8" fill="#ff5c7a" />
        <circle cx="76" cy="44" r="8" fill="#3d8bff" />
      </g>
      <rect x="30" y="80" width="40" height="7" rx="3.5" fill="#c98f00" />
    </svg>
  );
}

export function MissingArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="4" y="34" width="28" height="32" rx="9" fill="#ff5c7a" />
      <text x="18" y="58" textAnchor="middle" fontSize="20" fill="#fff" fontFamily="Jua, sans-serif">1</text>
      <rect className="missing-art-q" x="36" y="28" width="28" height="38" rx="9" fill="#fff" stroke="#e35cd0" strokeWidth="4" strokeDasharray="6 4" />
      <text x="50" y="56" textAnchor="middle" fontSize="22" fill="#e35cd0" fontFamily="Jua, sans-serif">?</text>
      <rect x="68" y="34" width="28" height="32" rx="9" fill="#f2b100" />
      <text x="82" y="58" textAnchor="middle" fontSize="20" fill="#fff" fontFamily="Jua, sans-serif">3</text>
    </svg>
  );
}

export function MathArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="16" cy="40" r="11" fill="#ff5c7a" />
      <circle cx="30" cy="58" r="11" fill="#ff5c7a" />
      <path d="M16 29c1-5 4-7 7-7" stroke="#1f9658" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="44" y="45" width="14" height="5" rx="2.5" fill="#14a38b" />
      <rect x="48.5" y="40.5" width="5" height="14" rx="2.5" fill="#14a38b" />
      <circle cx="78" cy="48" r="11" fill="#ff5c7a" />
      <path d="M78 37c1-5 4-7 7-7" stroke="#1f9658" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="20" y="78" width="60" height="12" rx="6" fill="#14a38b" opacity="0.25" />
    </svg>
  );
}

export function BalloonArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M28 58c0 12 6 18 2 34M52 48c0 14-2 24 2 44M76 60c0 10-4 18 0 32" stroke="#b9b6cc" strokeWidth="2" fill="none" />
      <ellipse cx="28" cy="40" rx="15" ry="18" fill="#3d8bff" />
      <ellipse cx="52" cy="28" rx="16" ry="19" fill="#ff5c7a" />
      <ellipse cx="76" cy="42" rx="15" ry="18" fill="#36bf77" />
      <text x="52" y="35" textAnchor="middle" fontSize="18" fill="#fff" fontFamily="Jua, sans-serif">5</text>
      <ellipse cx="46" cy="20" rx="4" ry="6" fill="#fff" opacity="0.45" />
      <ellipse cx="23" cy="33" rx="3.5" ry="5" fill="#fff" opacity="0.45" />
      <ellipse cx="71" cy="35" rx="3.5" ry="5" fill="#fff" opacity="0.45" />
    </svg>
  );
}

const artFont = { fontFamily: "Jua, 'Apple SD Gothic Neo', sans-serif" };

export function HListenArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="34" y="20" width="56" height="60" rx="16" fill="#ff7e67" />
      <rect x="34" y="20" width="56" height="54" rx="16" fill="#ff9a86" />
      <text x="62" y="62" textAnchor="middle" fontSize="40" fill="#fff" style={artFont}>ㄱ</text>
      <path d="M22 38 q-8 12 0 24" stroke="#9b7bff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M12 30 q-14 20 0 40" stroke="#c7b6ff" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function HPictureArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="34" cy="44" r="22" fill="#ff5c7a" />
      <path d="M34 24 q2 -10 10 -12" stroke="#1f9658" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="27" cy="36" rx="6" ry="4" fill="#fff" opacity="0.6" />
      <rect x="52" y="48" width="40" height="40" rx="12" fill="#36bf77" />
      <text x="72" y="78" textAnchor="middle" fontSize="28" fill="#fff" style={artFont}>사</text>
    </svg>
  );
}

export function HBuildArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="4" y="14" width="34" height="34" rx="10" fill="#3d8bff" />
      <text x="21" y="40" textAnchor="middle" fontSize="24" fill="#fff" style={artFont}>ㄴ</text>
      <rect x="62" y="14" width="34" height="34" rx="10" fill="#ffc62e" />
      <text x="79" y="40" textAnchor="middle" fontSize="24" fill="#fff" style={artFont}>ㅏ</text>
      <path d="M40 31 h20" stroke="#6e6a8e" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 21 v20" stroke="#6e6a8e" strokeWidth="5" strokeLinecap="round" />
      <rect x="28" y="56" width="44" height="40" rx="12" fill="#ff6f9f" />
      <text x="50" y="86" textAnchor="middle" fontSize="28" fill="#fff" style={artFont}>나</text>
    </svg>
  );
}

export function HTraceArt() {
  return (
    <svg className="game-svg" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="8" y="10" width="70" height="80" rx="14" fill="#fff" stroke="#d8cdfb" strokeWidth="4" />
      <text x="43" y="70" textAnchor="middle" fontSize="54" fill="#ece6ff" stroke="#b49cff" strokeWidth="1.5" strokeDasharray="3 3" style={artFont}>ㄱ</text>
      <path d="M24 30 H56 V62" stroke="#9b7bff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(35 74 66)">
        <rect x="66" y="38" width="16" height="44" rx="4" fill="#ffc62e" />
        <rect x="66" y="38" width="16" height="10" rx="4" fill="#ff8fb8" />
        <path d="M66 82 L74 96 L82 82Z" fill="#f6d7a7" />
        <path d="M71.5 91 L74 96 L76.5 91Z" fill="#5b4a7a" />
      </g>
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg {...base} strokeWidth="2.2">
      <path d="M12 6.5C10 5 6.5 4.5 3.5 5v13c3-.5 6.5 0 8.5 1.5 2-1.5 5.5-2 8.5-1.5V5c-3-.5-6.5 0-8.5 1.5z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

export function ChestIcon({ open = false }) {
  return (
    <svg className="chest-icon" viewBox="0 0 64 56" aria-hidden="true">
      <rect x="6" y="24" width="52" height="28" rx="6" fill="#c9773d" stroke="#7a3f12" strokeWidth="3" />
      <rect x="6" y="34" width="52" height="5" fill="#f7c948" />
      <rect x="27" y="28" width="10" height="13" rx="3" fill="#f7c948" stroke="#b07a10" strokeWidth="2" />
      {open ? (
        <>
          <ellipse cx="32" cy="24" rx="24" ry="8" fill="#ffe27a" />
          <circle cx="24" cy="21" r="4" fill="#ffc62e" stroke="#e5a100" strokeWidth="1.5" />
          <circle cx="36" cy="19" r="4" fill="#ffc62e" stroke="#e5a100" strokeWidth="1.5" />
          <circle cx="30" cy="24" r="4" fill="#ffc62e" stroke="#e5a100" strokeWidth="1.5" />
          <path d="M8 22 L14 4 L56 4 L58 22Z" fill="#b0652a" stroke="#7a3f12" strokeWidth="3" strokeLinejoin="round" />
        </>
      ) : (
        <path className="chest-lid" d="M6 26 Q6 8 32 8 Q58 8 58 26Z" fill="#b0652a" stroke="#7a3f12" strokeWidth="3" strokeLinejoin="round" />
      )}
    </svg>
  );
}
