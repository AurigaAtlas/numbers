// A small house drawn in SVG: cottage → two storeys → castle, plus decorations.
export function HouseArt({ level = 1, roof = "#ff6f9f", decor = [], className = "" }) {
  const has = (id) => decor.includes(id);
  return (
    <svg className={`house-art ${className}`} viewBox="0 0 200 180" aria-hidden="true">
      <ellipse cx="100" cy="168" rx="92" ry="10" fill="#5a3a5e" opacity="0.12" />
      {has("tree") && (
        <g className="decor-pop">
          <rect x="16" y="112" width="10" height="50" rx="4" fill="#a0673a" />
          <circle cx="21" cy="104" r="22" fill="#48b86a" />
          <circle cx="13" cy="114" r="13" fill="#3fa75e" />
          <circle cx="15" cy="98" r="6" fill="#6fd28c" />
        </g>
      )}

      {level === 1 && (
        <g>
          <rect x="52" y="92" width="96" height="72" rx="6" fill="#fff4e0" stroke="#e8c99a" strokeWidth="3" />
          <path d="M40 98 L100 44 L160 98Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M58 92 L100 54 L118 70" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
          <rect x="88" y="122" width="26" height="42" rx="10" fill="#c98a52" />
          <circle cx="108" cy="144" r="2.5" fill="#ffe27a" />
          <rect x="62" y="108" width="20" height="20" rx="4" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />
          <rect x="120" y="108" width="20" height="20" rx="4" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />
        </g>
      )}

      {level === 2 && (
        <g>
          <rect x="46" y="62" width="108" height="102" rx="6" fill="#fff4e0" stroke="#e8c99a" strokeWidth="3" />
          <path d="M34 68 L100 14 L166 68Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M52 62 L100 24 L120 40" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
          <rect x="46" y="108" width="108" height="6" fill="#e8c99a" />
          {[58, 90, 122].map((x) => <rect key={x} x={x} y="78" width="20" height="20" rx="4" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />)}
          <rect x="58" y="124" width="20" height="20" rx="4" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />
          <rect x="122" y="124" width="20" height="20" rx="4" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />
          <rect x="88" y="122" width="24" height="42" rx="10" fill="#c98a52" />
          <circle cx="106" cy="144" r="2.5" fill="#ffe27a" />
          <circle cx="100" cy="46" r="9" fill="#bfe6ff" stroke="#ffffff" strokeWidth="3" />
        </g>
      )}

      {level >= 3 && (
        <g>
          <rect x="30" y="58" width="34" height="106" rx="4" fill="#f2e9ff" stroke="#d3c4f2" strokeWidth="3" />
          <rect x="136" y="58" width="34" height="106" rx="4" fill="#f2e9ff" stroke="#d3c4f2" strokeWidth="3" />
          <path d="M24 60 L47 14 L70 60Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M130 60 L153 14 L176 60Z" fill={roof} stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinejoin="round" />
          <rect x="60" y="80" width="80" height="84" fill="#fbf6ff" stroke="#d3c4f2" strokeWidth="3" />
          {[60, 76, 92, 108, 124].map((x) => <rect key={x} x={x} y="68" width="12" height="14" rx="2" fill="#fbf6ff" stroke="#d3c4f2" strokeWidth="3" />)}
          <path d="M84 164 L84 132 Q100 112 116 132 L116 164Z" fill="#c98a52" />
          <rect x="40" y="86" width="14" height="20" rx="7" fill="#bfe6ff" />
          <rect x="146" y="86" width="14" height="20" rx="7" fill="#bfe6ff" />
          <circle cx="100" cy="100" r="10" fill={roof} />
          <path d="M100 93 l2.5 5 5.5.8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8z" fill="#fff6c2" />
        </g>
      )}

      {has("flag") && (
        <g className="decor-pop">
          <line x1={level >= 3 ? 153 : 100} y1={level === 1 ? 46 : 16} x2={level >= 3 ? 153 : 100} y2={level === 1 ? 14 : -14} stroke="#8a6f99" strokeWidth="3" />
          <path d={`M${level >= 3 ? 153 : 100} ${level === 1 ? 14 : -14} l26 8 l-26 8z`} fill="#ff5c7a" />
        </g>
      )}
      {has("lights") && (
        <g className="decor-pop">
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            const x = level >= 3 ? 64 + t * 72 : 44 + t * 112;
            const y = level >= 3 ? 80 : level === 2 ? 66 - Math.sin(t * Math.PI) * 6 : 96 - Math.sin(t * Math.PI) * 6;
            return <circle key={i} cx={x} cy={y} r="4" fill={i % 2 ? "#fff2a8" : "#ffd84a"} className="twinkle-dot" style={{ animationDelay: `${i * 0.15}s` }} />;
          })}
        </g>
      )}
      {has("fence") && (
        <g className="decor-pop">
          <rect x="8" y="150" width="184" height="6" rx="3" fill="#e8d3b3" />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${12 + i * 16} 172 L${12 + i * 16} 144 L${17 + i * 16} 138 L${22 + i * 16} 144 L${22 + i * 16} 172Z`} fill="#ffffff" stroke="#e8d3b3" strokeWidth="2" />
          )).filter((_, i) => i < 4 || i > 7)}
        </g>
      )}
      {has("flowers") && (
        <g className="decor-pop">
          {[[60, 166, "#ff6f9f"], [72, 170, "#ffc93c"], [130, 168, "#9b7bff"], [142, 164, "#ff6f9f"], [152, 170, "#ffc93c"]].map(([x, y, c], i) => (
            <g key={i}>
              <circle cx={x} cy={y - 6} r="3" fill={c} />
              <circle cx={x + 4} cy={y - 3} r="3" fill={c} />
              <circle cx={x - 4} cy={y - 3} r="3" fill={c} />
              <circle cx={x} cy={y - 3} r="2" fill="#fff6c2" />
            </g>
          ))}
        </g>
      )}
      {has("mailbox") && <text className="decor-pop" x="30" y="170" fontSize="26">📮</text>}
      {has("dog") && <text className="decor-pop" x="150" y="172" fontSize="30">🐶</text>}
      {has("cat") && <text className="decor-pop" x={level >= 3 ? 86 : 118} y={level === 1 ? 50 : level === 2 ? 30 : 64} fontSize="24">🐱</text>}
    </svg>
  );
}
