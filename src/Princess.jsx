import { StarShape } from "./icons";
import { growthProgress, princessStages } from "./princess";

const BASE_BODY = "./assets/avatar-base-generated.webp";

const star = (cx, cy, r) => {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = ((-90 + i * 36) * Math.PI) / 180;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
};

const twinkle = (cx, cy, r, key) => (
  <path
    key={key}
    className="aura-twinkle"
    style={{ "--i": key }}
    d={`M${cx} ${cy - r} Q${cx + r * 0.2} ${cy - r * 0.2} ${cx + r} ${cy} Q${cx + r * 0.2} ${cy + r * 0.2} ${cx} ${cy + r} Q${cx - r * 0.2} ${cy + r * 0.2} ${cx - r} ${cy} Q${cx - r * 0.2} ${cy - r * 0.2} ${cx} ${cy - r}Z`}
    fill="#ffffff"
  />
);

// Built-in effect behind the doll for each stage, on the doll's own 320×400 canvas.
// Each stage keeps what came before and adds something, so growing is easy to see.
function AuraBack({ stage }) {
  if (stage < 2) return null;
  const rainbow = ["#ff8fa6", "#ffc46b", "#fff07a", "#8fe0a0", "#8fc8ff", "#c3a6ff"];
  return (
    <svg className={`avatar-aura aura-${stage}`} viewBox="0 0 320 400" aria-hidden="true">
      <defs>
        <radialGradient id={`aura-glow-${stage}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={stage >= 6 ? "#fff3b8" : "#ffe3f0"} stopOpacity="0.95" />
          <stop offset="0.6" stopColor={stage >= 6 ? "#ffd86b" : "#ffc4e0"} stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`aura-wing-${stage}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={stage >= 6 ? "#fff6c9" : "#ffffff"} stopOpacity="0.95" />
          <stop offset="1" stopColor={stage >= 6 ? "#ffc93c" : "#b7a0ff"} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {stage >= 6 && (
        <g className="aura-rays">
          {Array.from({ length: 12 }, (_, index) => (
            <path key={index} d="M160 190 L146 -40 L174 -40Z" fill="#ffe27a" opacity="0.5" transform={`rotate(${index * 30} 160 190)`} />
          ))}
        </g>
      )}

      {stage >= 4 && (
        <g className="aura-rainbow" fill="none" strokeLinecap="round">
          {rainbow.map((color, index) => (
            <path key={color} d={`M${22 + index * 9} 330 A${138 - index * 9} ${150 - index * 9} 0 0 1 ${298 - index * 9} 330`} stroke={color} strokeWidth="9" opacity="0.85" />
          ))}
        </g>
      )}

      <ellipse className="aura-glow" cx="160" cy="205" rx="150" ry="190" fill={`url(#aura-glow-${stage})`} />

      {stage >= 5 && (
        <g className="aura-wings">
          <path d="M150 170 C80 60 10 70 14 150 C16 196 70 214 150 200 C90 220 50 262 76 300 C104 336 146 280 152 220Z" fill={`url(#aura-wing-${stage})`} />
          <path d="M170 170 C240 60 310 70 306 150 C304 196 250 214 170 200 C230 220 270 262 244 300 C216 336 174 280 168 220Z" fill={`url(#aura-wing-${stage})`} />
        </g>
      )}

      {stage >= 5 && (
        <g className="aura-circle">
          <ellipse cx="160" cy="380" rx="118" ry="16" fill="none" stroke={stage >= 6 ? "#ffc93c" : "#b7a0ff"} strokeWidth="4" strokeDasharray="10 8" />
          <ellipse cx="160" cy="380" rx="92" ry="11" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
        </g>
      )}

      {stage >= 3 && (
        <g className="aura-stars">
          {[[36, 150], [58, 70], [118, 22], [202, 22], [262, 70], [284, 150]].map(([x, y], index) => (
            <polygon key={index} className="aura-star" style={{ "--i": index }} points={star(x, y, index % 2 ? 13 : 10)} fill={stage >= 6 ? "#ffd23f" : "#ffe27a"} stroke="#ffffff" strokeWidth="2" />
          ))}
        </g>
      )}

      {[[30, 250, 9], [290, 236, 8], [70, 330, 6], [256, 322, 7]].map(([x, y, r], index) => twinkle(x, y, r, index))}
    </svg>
  );
}

function AuraFront({ stage }) {
  if (stage < 6) return null;
  return (
    <svg className="avatar-front-fx" viewBox="0 0 320 400" aria-hidden="true">
      {[[52, 110, 7], [270, 128, 6], [40, 300, 5], [282, 290, 6], [160, 14, 6]].map(([x, y, r], index) => twinkle(x, y, r, index + 4))}
    </svg>
  );
}

// The dress-up doll: growth effect, body, then whatever is equipped.
export function PrincessDoll({ stage, items, bodyRef }) {
  const layers = [
    { id: "base", type: "base", image: stage.body ?? BASE_BODY },
    ...items.filter((item) => item.type !== "room")
  ];
  return (
    <div className="avatar-body" ref={bodyRef}>
      {stage.back ? <img className="avatar-aura is-art" src={stage.back} alt="" aria-hidden="true" /> : <AuraBack stage={stage.id} />}
      {layers.map((item) => (
        <img
          key={item.id}
          src={item.avatarImage ?? item.image}
          alt=""
          className={`avatar-layer layer-${item.type} avatar-item-${item.id}`}
          aria-hidden="true"
        />
      ))}
      {stage.front ? <img className="avatar-front-fx is-art" src={stage.front} alt="" aria-hidden="true" /> : <AuraFront stage={stage.id} />}
    </div>
  );
}

// Under the room: which princess she is now and how far the next one is.
export function GrowthChip({ stars }) {
  const { stage, next, left, percent } = growthProgress(stars);
  return (
    <div className={`growth-chip stage-${stage.id}`} aria-label={`${stage.name}, 성장 ${stage.id}단계`}>
      <span className="growth-badge"><StarShape /><b>{stage.id}</b></span>
      <span className="growth-copy">
        <strong key={stage.id}>{stage.name}</strong>
        <span className="growth-bar"><i style={{ width: `${percent}%` }} /></span>
      </span>
      <small>{next ? `${next.name}까지 별 ${left}개` : "다 자랐어요!"}</small>
    </div>
  );
}

// Shown at the moment she grows: the old princess flashes into the new one.
export function GrowthOverlay({ from, to, items, onClose }) {
  return (
    <div className="levelup-backdrop growth-backdrop">
      <div className="levelup-card growth-card" role="dialog" aria-modal="true" aria-label="공주가 자랐어요">
        <div className="levelup-rays" aria-hidden="true" />
        <p className="levelup-kicker">공주가 자랐어요!</p>
        <div className="growth-stage" style={{ "--from": from.scale, "--to": to.scale }}>
          <span className="growth-flash" aria-hidden="true" />
          <div className="avatar growth-doll">
            <PrincessDoll stage={to} items={items} />
          </div>
        </div>
        <p className="growth-names">
          <span>{from.name}</span>
          <i aria-hidden="true">→</i>
          <strong>{to.name}</strong>
        </p>
        <div className="growth-steps" aria-hidden="true">
          {princessStages.map((stage) => (
            <i key={stage.id} className={stage.id <= to.id ? "is-on" : ""} />
          ))}
        </div>
        <p className="levelup-copy">{to.perk}</p>
        <button className="chunky-button levelup-button" onClick={onClose}>좋아!</button>
      </div>
    </div>
  );
}
