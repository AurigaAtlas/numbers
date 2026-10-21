import { useId } from "react";

// A small house drawn in SVG: cottage → two storeys → castle, plus decorations.
export function HouseArt({ level = 1, roof = "#ff6f9f", decor = [], className = "" }) {
  const has = (id) => decor.includes(id);
  const artId = useId().replaceAll(":", "");
  return (
    <svg className={`house-art ${className}`} viewBox="0 0 200 180" aria-hidden="true">
      <defs>
        <linearGradient id={`${artId}-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffdf3" />
          <stop offset="0.55" stopColor="#fff1d7" />
          <stop offset="1" stopColor="#e7c9ae" />
        </linearGradient>
        <linearGradient id={`${artId}-tower`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffaff" />
          <stop offset="0.65" stopColor="#eee0ff" />
          <stop offset="1" stopColor="#cbb9e5" />
        </linearGradient>
        <linearGradient id={`${artId}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#efffff" />
          <stop offset="0.5" stopColor="#9ad9f6" />
          <stop offset="1" stopColor="#6baddd" />
        </linearGradient>
        <filter id={`${artId}-shadow`} x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#685579" floodOpacity="0.22" />
        </filter>
      </defs>
      <ellipse cx="100" cy="168" rx="92" ry="10" fill="#5a3a5e" opacity="0.12" />
      {has("tree") && <image className="decor-pop" href="./assets/board/tree.webp" x="0" y="77" width="58" height="90" />}

      {level === 1 && (
        <g filter={`url(#${artId}-shadow)`}>
          <rect x="52" y="92" width="96" height="72" rx="6" fill={`url(#${artId}-wall)`} stroke="#e8c99a" strokeWidth="3" />
          <path d="M40 98 L100 44 L160 98Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M45 95 L100 48 L155 95" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="5" strokeLinecap="round" />
          <path d="M58 92 L100 54 L118 70" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
          <rect x="88" y="122" width="26" height="42" rx="10" fill="#c98a52" />
          <circle cx="108" cy="144" r="2.5" fill="#ffe27a" />
          <rect x="62" y="108" width="20" height="20" rx="4" fill={`url(#${artId}-glass)`} stroke="#ffffff" strokeWidth="3" />
          <rect x="120" y="108" width="20" height="20" rx="4" fill={`url(#${artId}-glass)`} stroke="#ffffff" strokeWidth="3" />
        </g>
      )}

      {level === 2 && (
        <g filter={`url(#${artId}-shadow)`}>
          <rect x="46" y="62" width="108" height="102" rx="6" fill={`url(#${artId}-wall)`} stroke="#e8c99a" strokeWidth="3" />
          <path d="M34 68 L100 14 L166 68Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M40 65 L100 19 L160 65" fill="none" stroke="#fff" strokeOpacity="0.42" strokeWidth="5" strokeLinecap="round" />
          <path d="M52 62 L100 24 L120 40" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
          <rect x="46" y="108" width="108" height="6" fill="#e8c99a" />
          {[58, 90, 122].map((x) => <rect key={x} x={x} y="78" width="20" height="20" rx="4" fill={`url(#${artId}-glass)`} stroke="#ffffff" strokeWidth="3" />)}
          <rect x="58" y="124" width="20" height="20" rx="4" fill={`url(#${artId}-glass)`} stroke="#ffffff" strokeWidth="3" />
          <rect x="122" y="124" width="20" height="20" rx="4" fill={`url(#${artId}-glass)`} stroke="#ffffff" strokeWidth="3" />
          <rect x="88" y="122" width="24" height="42" rx="10" fill="#c98a52" />
          <circle cx="106" cy="144" r="2.5" fill="#ffe27a" />
          <circle cx="100" cy="46" r="9" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />
        </g>
      )}

      {level >= 3 && (
        <g filter={`url(#${artId}-shadow)`}>
          <rect x="30" y="58" width="34" height="106" rx="4" fill={`url(#${artId}-tower)`} stroke="#d3c4f2" strokeWidth="3" />
          <rect x="136" y="58" width="34" height="106" rx="4" fill={`url(#${artId}-tower)`} stroke="#d3c4f2" strokeWidth="3" />
          <path d="M24 60 L47 14 L70 60Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M130 60 L153 14 L176 60Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <rect x="60" y="80" width="80" height="84" fill={`url(#${artId}-tower)`} stroke="#d3c4f2" strokeWidth="3" />
          {[60, 76, 92, 108, 124].map((x) => <rect key={x} x={x} y="68" width="12" height="14" rx="2" fill="#fbf6ff" stroke="#d3c4f2" strokeWidth="3" />)}
          <path d="M84 164 L84 132 Q100 112 116 132 L116 164Z" fill="#c98a52" />
          <rect x="40" y="86" width="14" height="20" rx="7" fill={`url(#${artId}-glass)`} />
          <rect x="146" y="86" width="14" height="20" rx="7" fill={`url(#${artId}-glass)`} />
          <circle cx="100" cy="100" r="10" fill={roof} />
          <path d="M100 93 l2.5 5 5.5.8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8z" fill="#fff6c2" />
        </g>
      )}

      {has("flag") && <image className="decor-pop" href="./assets/board/start.webp" x={level >= 3 ? "137" : "84"} y={level === 1 ? "9" : "-12"} width="38" height="58" />}
      {has("lights") && <image className="decor-pop" href="./assets/board/lights.webp" x="34" y={level >= 3 ? "61" : level === 2 ? "49" : "77"} width="132" height="43" />}
      {has("fence") && [0, 49, 98, 147].map((x) => <image key={x} className="decor-pop" href="./assets/board/fence.webp" x={x} y="136" width="53" height="40" />)}
      {has("flowers") && [30, 125].map((x) => <image key={x} className="decor-pop" href="./assets/board/flowers.webp" x={x} y="140" width="50" height="39" />)}
      {has("mailbox") && <image className="decor-pop" href="./assets/board/mailbox.webp" x="12" y="126" width="39" height="51" />}
      {has("dog") && <image className="decor-pop" href="./assets/board/dog.webp" x="145" y="130" width="43" height="45" />}
      {has("cat") && <image className="decor-pop" href="./assets/board/cat.webp" x={level >= 3 ? "81" : "116"} y={level === 1 ? "29" : level === 2 ? "8" : "44"} width="37" height="38" />}

    </svg>
  );
}
