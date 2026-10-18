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
