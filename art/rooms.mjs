// Vector sources for the shop room backgrounds (1024×1536, portrait).
// The avatar stands bottom-centre, so the floor keeps a clear stage there
// and the theme lives on the walls, window and sides.

const W = 1024;
const H = 1536;
const HORIZON = 1060;

const svg = (body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}${commonDefs}</defs>${body}${vignette}</svg>`;

const commonDefs = `
  <radialGradient id="vig" cx="0.5" cy="0.55" r="0.75">
    <stop offset="0.6" stop-color="#3b2440" stop-opacity="0"/>
    <stop offset="1" stop-color="#3b2440" stop-opacity="0.28"/>
  </radialGradient>
  <radialGradient id="spot" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="goldv" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff2b0"/><stop offset="0.45" stop-color="#f7c948"/><stop offset="1" stop-color="#c98a12"/>
  </linearGradient>`;

const vignette = `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;

const linear = (id, stops, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</linearGradient>`;

const radial = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</radialGradient>`;

const sparkle = (x, y, r, color = "#ffffff", opacity = 1) =>
  `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${color}" opacity="${opacity}"/>`;

const starPath = (cx, cy, outer, inner) => {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}Z`;
};

const cloud = (x, y, s, fill = "#ffffff", opacity = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}"><path d="M-110 30 Q-120 -10 -80 -16 Q-74 -60 -26 -54 Q0 -92 46 -64 Q96 -70 96 -22 Q132 -14 120 30Z" fill="${fill}"/><path d="M-110 30 L120 30" stroke="${fill}" stroke-width="2"/></g>`;

// Wooden/tiled floor in perspective with a vanishing point above the centre.
function perspectiveFloor({ top, bottom, line, count = 12 }) {
  const vx = W / 2;
  const vy = 420;
  let lines = "";
  for (let i = -count; i <= count; i += 1) {
    const xTop = vx + i * 86;
    const k = (H - vy) / (HORIZON - vy);
    const xBottom = vx + (xTop - vx) * k;
    lines += `<line x1="${xTop}" y1="${HORIZON}" x2="${xBottom}" y2="${H}" stroke="${line}" stroke-width="3" opacity="0.55"/>`;
  }
  for (let j = 1; j < 7; j += 1) {
    const y = HORIZON + (H - HORIZON) * (j / 7) ** 1.6;
    lines += `<line x1="0" y1="${y.toFixed(0)}" x2="${W}" y2="${y.toFixed(0)}" stroke="${line}" stroke-width="2.5" opacity="0.35"/>`;
  }
  return `
    <linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
    <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floorg)"/>
    ${lines}`;
}

const baseboard = (color, shade) =>
  `<rect x="0" y="${HORIZON - 34}" width="${W}" height="40" fill="${color}"/><rect x="0" y="${HORIZON - 34}" width="${W}" height="8" fill="#ffffff" opacity="0.45"/><rect x="0" y="${HORIZON + 2}" width="${W}" height="10" fill="${shade}" opacity="0.35"/>`;

const rug = (c1, c2, trim = "#ffffff") => `
  <ellipse cx="512" cy="1330" rx="410" ry="120" fill="#000000" opacity="0.08"/>
  <ellipse cx="512" cy="1318" rx="400" ry="116" fill="${c1}"/>
  <ellipse cx="512" cy="1318" rx="350" ry="94" fill="none" stroke="${trim}" stroke-width="8" stroke-dasharray="2 18" stroke-linecap="round" opacity="0.9"/>
  <ellipse cx="512" cy="1318" rx="250" ry="62" fill="${c2}"/>
  <ellipse cx="460" cy="1296" rx="140" ry="22" fill="#ffffff" opacity="0.18"/>`;

// Arched window frame; `scene` is drawn clipped inside the glass.
function archWindow({ x, y, w, h, scene, frame = "#ffffff", frameShade = "#d9cbe0", id = "win", curtains }) {
  const r = w / 2;
  const glass = `M${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} L${x} ${y + h}Z`;
  const curtain = curtains
    ? `
      <path d="M${x - 70} ${y - 30} Q${x + 30} ${y + h * 0.45} ${x - 10} ${y + h + 60} L${x - 110} ${y + h + 60} Q${x - 120} ${y + h * 0.5} ${x - 110} ${y - 30}Z" fill="${curtains[0]}"/>
      <path d="M${x - 70} ${y - 30} Q${x + 30} ${y + h * 0.45} ${x - 10} ${y + h + 60}" fill="none" stroke="${curtains[1]}" stroke-width="10" opacity="0.6"/>
      <path d="M${x + w + 70} ${y - 30} Q${x + w - 30} ${y + h * 0.45} ${x + w + 10} ${y + h + 60} L${x + w + 110} ${y + h + 60} Q${x + w + 120} ${y + h * 0.5} ${x + w + 110} ${y - 30}Z" fill="${curtains[0]}"/>
      <path d="M${x + w + 70} ${y - 30} Q${x + w - 30} ${y + h * 0.45} ${x + w + 10} ${y + h + 60}" fill="none" stroke="${curtains[1]}" stroke-width="10" opacity="0.6"/>
      <rect x="${x - 140}" y="${y - 52}" width="${w + 280}" height="26" rx="13" fill="url(#goldv)"/>
      <circle cx="${x - 140}" cy="${y - 39}" r="20" fill="url(#goldv)"/><circle cx="${x + w + 140}" cy="${y - 39}" r="20" fill="url(#goldv)"/>`
    : "";
  return `
    <clipPath id="${id}"><path d="${glass}"/></clipPath>
    <path d="${glass}" fill="#cfe8ff" transform="translate(0 10)" opacity="0.4"/>
    <g clip-path="url(#${id})">${scene}
      <path d="M${x + w * 0.12} ${y + h} L${x + w * 0.45} ${y} L${x + w * 0.6} ${y} L${x + w * 0.27} ${y + h}Z" fill="#ffffff" opacity="0.16"/>
    </g>
    <path d="${glass}" fill="none" stroke="${frameShade}" stroke-width="40" transform="translate(0 6)"/>
    <path d="${glass}" fill="none" stroke="${frame}" stroke-width="34"/>
    <line x1="${x + r}" y1="${y + 10}" x2="${x + r}" y2="${y + h}" stroke="${frame}" stroke-width="16"/>
    <line x1="${x}" y1="${y + h * 0.58}" x2="${x + w}" y2="${y + h * 0.58}" stroke="${frame}" stroke-width="16"/>
    <rect x="${x - 40}" y="${y + h - 4}" width="${w + 80}" height="36" rx="12" fill="${frame}"/>
    <rect x="${x - 40}" y="${y + h + 26}" width="${w + 80}" height="10" rx="5" fill="${frameShade}"/>
    ${curtain}`;
}

const fairyLights = (y, color = "#fff2a8") => {
  let bulbs = "";
  for (let i = 0; i < 14; i += 1) {
    const x = 40 + i * 72;
    const sag = Math.sin((i / 13) * Math.PI) * 70;
    bulbs += `<circle cx="${x}" cy="${y + sag + 14}" r="28" fill="${color}" opacity="0.25"/><circle cx="${x}" cy="${y + sag + 14}" r="11" fill="${color}"/>`;
  }
  return `<path d="M0 ${y} Q512 ${y + 150} ${W} ${y}" fill="none" stroke="#5b4a7a" stroke-width="4" opacity="0.6"/>${bulbs}`;
};

// ---------------------------------------------------------------- rooms

export function roomCandy() {
  let stripes = "";
  for (let x = 0; x < W; x += 96) {
    stripes += `<rect x="${x}" y="0" width="48" height="${HORIZON}" fill="#ffd6e6"/>`;
  }
  let tiles = "";
  for (let r = 0; r < 8; r += 1) {
    for (let c = -6; c < 8; c += 1) {
      if ((r + c) % 2 === 0) continue;
      const y0 = HORIZON + (H - HORIZON) * (r / 8) ** 1.3;
      const y1 = HORIZON + (H - HORIZON) * ((r + 1) / 8) ** 1.3;
      const k0 = 1 + (r / 8) * 1.4;
      const k1 = 1 + ((r + 1) / 8) * 1.4;
      const x = (cx, k) => 512 + (cx - 512) * k;
      tiles += `<path d="M${x(c * 128, k0)} ${y0} L${x((c + 1) * 128, k0)} ${y0} L${x((c + 1) * 128, k1)} ${y1} L${x(c * 128, k1)} ${y1}Z" fill="#ffffff" opacity="0.75"/>`;
    }
  }
  const jar = (x, y, colors) => `
    <rect x="${x - 54}" y="${y - 12}" width="108" height="24" rx="10" fill="#ff8fb8"/>
    <path d="M${x - 62} ${y + 10} Q${x - 70} ${y + 150} ${x} ${y + 156} Q${x + 70} ${y + 150} ${x + 62} ${y + 10}Z" fill="#ffffff" opacity="0.55" stroke="#ffffff" stroke-width="5"/>
    ${colors.map((c, i) => `<circle cx="${x - 30 + (i % 3) * 30}" cy="${y + 120 - Math.floor(i / 3) * 30}" r="15" fill="${c}"/>`).join("")}
    <path d="M${x - 40} ${y + 30} Q${x - 46} ${y + 90} ${x - 30} ${y + 130}" stroke="#ffffff" stroke-width="8" fill="none" opacity="0.8" stroke-linecap="round"/>`;
  const lolly = (x, y, r, a, b) => `
    <rect x="${x - 8}" y="${y}" width="16" height="${HORIZON - y + 60}" rx="8" fill="#ffffff" stroke="#f0d6e2" stroke-width="3"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="${a}"/>
    <path d="M${x} ${y} m-${r * 0.1} 0 a${r * 0.1} ${r * 0.1} 0 1 1 ${r * 0.2} 0 a${r * 0.25} ${r * 0.25} 0 1 1 -${r * 0.45} 0 a${r * 0.42} ${r * 0.42} 0 1 1 ${r * 0.75} 0 a${r * 0.6} ${r * 0.6} 0 1 1 -${r * 1.08} 0 a${r * 0.78} ${r * 0.78} 0 1 1 ${r * 1.45} 0" fill="none" stroke="${b}" stroke-width="${r * 0.13}" stroke-linecap="round"/>
    <ellipse cx="${x - r * 0.4}" cy="${y - r * 0.45}" rx="${r * 0.25}" ry="${r * 0.12}" fill="#ffffff" opacity="0.7" transform="rotate(-35 ${x - r * 0.4} ${y - r * 0.45})"/>`;
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="#ffeaf2"/>
    ${stripes}
    <rect width="${W}" height="${HORIZON}" fill="url(#candyLight)"/>
    <path d="M0 0 L${W} 0 L${W} 130 Q${W - 64} 190 ${W - 128} 130 Q${W - 192} 190 ${W - 256} 130 Q${W - 320} 190 ${W - 384} 130 Q${W - 448} 190 ${W - 512} 130 Q${W - 576} 190 ${W - 640} 130 Q${W - 704} 190 ${W - 768} 130 Q${W - 832} 190 ${W - 896} 130 Q${W - 960} 190 ${W - 1024} 130Z" fill="#ff8fb8"/>
    <path d="M0 0 L${W} 0 L${W} 100 Q${W - 64} 160 ${W - 128} 100 Q${W - 192} 160 ${W - 256} 100 Q${W - 320} 160 ${W - 384} 100 Q${W - 448} 160 ${W - 512} 100 Q${W - 576} 160 ${W - 640} 100 Q${W - 704} 160 ${W - 768} 100 Q${W - 832} 160 ${W - 896} 100 Q${W - 960} 160 ${W - 1024} 100Z" fill="#ffffff"/>
    ${archWindow({ x: 352, y: 300, w: 320, h: 420, id: "cw", frame: "#ffffff", frameShade: "#f3bfd3", scene: `<rect x="352" y="300" width="320" height="420" fill="url(#candySky)"/>${cloud(440, 470, 0.7)}${cloud(600, 600, 0.55, "#ffe6f0")}<circle cx="600" cy="400" r="40" fill="#fff2a8"/>` })}
    <rect x="40" y="520" width="250" height="22" rx="8" fill="#ff8fb8"/><rect x="734" y="520" width="250" height="22" rx="8" fill="#ff8fb8"/>
    ${jar(110, 370, ["#ff5c7a", "#ffc93c", "#3d8bff", "#36bf77", "#9b7bff", "#ff8a3d"])}
    ${jar(224, 380, ["#3d8bff", "#ff8fb8", "#ffc93c", "#9b7bff", "#36bf77", "#ff5c7a"])}
    ${jar(800, 370, ["#36bf77", "#ff5c7a", "#9b7bff", "#ffc93c", "#3d8bff", "#ff8fb8"])}
    ${jar(914, 380, ["#ffc93c", "#9b7bff", "#ff5c7a", "#3d8bff", "#ff8a3d", "#36bf77"])}
    ${lolly(120, 800, 110, "#ff8fb8", "#ffffff")}
    ${lolly(904, 760, 120, "#9fd8ff", "#ffffff")}
    ${baseboard("#ff8fb8", "#c93a6c")}
    <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="#ffc6da"/>
    ${tiles}
    ${rug("#ff8fb8", "#ffd6e6")}
    ${sparkle(330, 240, 22)}${sparkle(700, 250, 18)}${sparkle(512, 840, 16, "#ffffff", 0.8)}
  `, `
    ${linear("candySky", [[0, "#ffd0e6"], [1, "#d6ecff"]])}
    ${radial("candyLight", [[0, "#ffffff", 0.6], [1, "#ffffff", 0]], 0.5, 0.35, 0.6)}`);
}

export function roomCloud() {
  let wallClouds = "";
  [[120, 220, 0.6], [880, 180, 0.5], [180, 640, 0.45], [860, 600, 0.55], [520, 140, 0.4], [80, 900, 0.4], [960, 920, 0.35]].forEach(([x, y, s]) => {
    wallClouds += cloud(x, y, s, "#ffffff", 0.7);
  });
  const hanging = (x, len, color) =>
    `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#ffffff" stroke-width="3"/><path d="${starPath(x, len + 30, 34, 15)}" fill="${color}" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>`;
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="url(#cloudWall)"/>
    ${wallClouds}
    <circle cx="512" cy="560" r="250" fill="#ffffff" opacity="0.6"/>
    <clipPath id="porth"><circle cx="512" cy="560" r="220"/></clipPath>
    <g clip-path="url(#porth)">
      <rect x="292" y="340" width="440" height="440" fill="url(#cloudSky)"/>
      <circle cx="590" cy="470" r="60" fill="#fff6c2"/><circle cx="590" cy="470" r="90" fill="#fff6c2" opacity="0.35"/>
      ${cloud(450, 620, 1)}${cloud(640, 700, 0.8)}${cloud(400, 470, 0.5, "#ffffff", 0.8)}
    </g>
    <circle cx="512" cy="560" r="220" fill="none" stroke="#ffffff" stroke-width="34"/>
    <circle cx="512" cy="560" r="244" fill="none" stroke="#bcdcfb" stroke-width="10"/>
    ${hanging(250, 220, "#ffd84a")}${hanging(330, 140, "#ff8fb8")}${hanging(700, 160, "#b49cff")}${hanging(780, 240, "#ffd84a")}
    ${baseboard("#ffffff", "#7fb0e6")}
    ${perspectiveFloor({ top: "#cfe5fb", bottom: "#a9cdf3", line: "#ffffff" })}
    <g opacity="0.95">
      <ellipse cx="512" cy="1330" rx="420" ry="120" fill="#000000" opacity="0.07"/>
      ${[-300, -150, 0, 150, 300].map((dx, i) => `<circle cx="${512 + dx}" cy="${1310 - (i % 2) * 30}" r="${120 - Math.abs(dx) * 0.12}" fill="#ffffff"/>`).join("")}
      <rect x="190" y="1300" width="644" height="100" rx="50" fill="#ffffff"/>
      <ellipse cx="420" cy="1250" rx="120" ry="26" fill="#eaf4ff"/>
    </g>
    <g transform="translate(150 1150)">
      <path d="M-60 0 Q-70 -60 -20 -66 Q0 -110 50 -80 Q100 -84 96 -30 Q120 -20 110 10Z" fill="#ffffff" stroke="#bcdcfb" stroke-width="8"/>
      <path d="M-10 -30 q10 -10 20 0 M30 -30 q10 -10 20 0" stroke="#5b4a7a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="-14" cy="-10" rx="10" ry="6" fill="#ffb3c8"/><ellipse cx="62" cy="-10" rx="10" ry="6" fill="#ffb3c8"/>
    </g>
    ${sparkle(240, 400, 20)}${sparkle(800, 420, 24)}${sparkle(900, 820, 16)}${sparkle(130, 520, 14)}
  `, `
    ${linear("cloudWall", [[0, "#a9d4ff"], [1, "#e6f3ff"]])}
    ${linear("cloudSky", [[0, "#7cc4ff"], [1, "#d7efff"]])}`);
}

export function roomMoon() {
  let stars = "";
  const pts = [[80, 120], [210, 260], [140, 520], [880, 140], [960, 380], [820, 300], [60, 760], [940, 700], [300, 120], [720, 110], [250, 880], [800, 860]];
  pts.forEach(([x, y], i) => {
    stars += i % 3 === 0 ? `<path d="${starPath(x, y, 16, 7)}" fill="#fff2a8"/>` : `<circle cx="${x}" cy="${y}" r="${3 + (i % 3)}" fill="#ffffff" opacity="0.9"/>`;
  });
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="url(#night)"/>
    ${stars}
    ${archWindow({
      x: 312, y: 260, w: 400, h: 560, id: "mw", frame: "#e9e0ff", frameShade: "#7d6bc4",
      curtains: ["#6a4bd6", "#9b7bff"],
      scene: `<rect x="312" y="260" width="400" height="560" fill="url(#nightSky)"/>
        <circle cx="560" cy="430" r="120" fill="#fff6c2" opacity="0.25"/>
        <circle cx="560" cy="430" r="82" fill="#fff6c2"/><circle cx="600" cy="400" r="72" fill="url(#nightSky)"/>
        ${sparkle(400, 360, 14, "#ffffff")}${sparkle(450, 520, 9, "#fff2a8")}${sparkle(650, 600, 11, "#ffffff")}
        <path d="M312 760 Q420 690 520 740 Q620 700 712 750 L712 820 L312 820Z" fill="#3a2f7a"/>`
    })}
    ${fairyLights(70, "#ffe48a")}
    ${baseboard("#8a74e0", "#2a1f5e")}
    ${perspectiveFloor({ top: "#7462c9", bottom: "#4b3c99", line: "#9d8ef0" })}
    ${rug("#b49cff", "#e2d6ff", "#fff2a8")}
    <g transform="translate(140 1080)">
      <circle cx="0" cy="0" r="74" fill="#fff6c2" opacity="0.25"/>
      <path d="M-40 60 L40 60 L26 -10 L-26 -10Z" fill="#ffd84a"/><rect x="-6" y="60" width="12" height="70" fill="#c9b6ff"/><ellipse cx="0" cy="134" rx="40" ry="12" fill="#c9b6ff"/>
    </g>
    ${sparkle(880, 1000, 18, "#fff2a8")}${sparkle(780, 940, 10)}
  `, `
    ${linear("night", [[0, "#2c2366"], [1, "#5a4bb0"]])}
    ${linear("nightSky", [[0, "#1b1650"], [1, "#4b3c99"]])}`);
}

export function roomOcean() {
  let bubbles = "";
  [[120, 300, 24], [160, 220, 14], [880, 420, 30], [920, 320, 16], [860, 260, 10], [210, 700, 18], [820, 760, 22], [520, 160, 14], [560, 110, 9]].forEach(([x, y, r]) => {
    bubbles += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="0.25" stroke="#ffffff" stroke-width="3"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#ffffff" opacity="0.8"/>`;
  });
  const weed = (x, h, color, flip = 1) =>
    `<path d="M${x} ${HORIZON + 60} C${x + 40 * flip} ${HORIZON - h * 0.3} ${x - 40 * flip} ${HORIZON - h * 0.6} ${x + 10 * flip} ${HORIZON - h} C${x + 50 * flip} ${HORIZON - h * 0.6} ${x + 10 * flip} ${HORIZON - h * 0.3} ${x + 30 * flip} ${HORIZON + 60}Z" fill="${color}"/>`;
  const fish = (x, y, s, c, flip = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})"><path d="M-50 0 Q0 -40 50 0 Q0 40 -50 0Z" fill="${c}"/><path d="M-46 0 L-80 -26 L-80 26Z" fill="${c}"/><circle cx="26" cy="-6" r="7" fill="#ffffff"/><circle cx="28" cy="-6" r="3.5" fill="#2e2a4f"/><path d="M-10 -26 Q0 0 -10 26" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.5"/></g>`;
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="url(#sea)"/>
    <path d="M0 80 L180 0 L280 0 L60 900Z M420 0 L520 0 L460 900 L330 900Z M760 0 L860 0 L980 900 L840 900Z" fill="#ffffff" opacity="0.08"/>
    ${bubbles}
    <circle cx="512" cy="560" r="236" fill="url(#goldv)"/>
    <clipPath id="port"><circle cx="512" cy="560" r="200"/></clipPath>
    <g clip-path="url(#port)">
      <rect x="300" y="350" width="430" height="430" fill="url(#deep)"/>
      ${fish(450, 500, 1, "#ffb347")}${fish(600, 610, 0.8, "#ff6f9f", -1)}${fish(470, 680, 0.6, "#ffd84a")}
      <circle cx="640" cy="460" r="10" fill="#ffffff" opacity="0.6"/><circle cx="660" cy="430" r="6" fill="#ffffff" opacity="0.6"/>
    </g>
    <circle cx="512" cy="560" r="200" fill="none" stroke="#c98a12" stroke-width="10"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<circle cx="${512 + 218 * Math.cos((a * Math.PI) / 180)}" cy="${560 + 218 * Math.sin((a * Math.PI) / 180)}" r="10" fill="#fff2b0" stroke="#b07a10" stroke-width="3"/>`).join("")}
    ${weed(60, 420, "#2bb39a")}${weed(130, 300, "#36bf77", -1)}${weed(900, 460, "#2bb39a", -1)}${weed(960, 320, "#36bf77")}
    ${fish(180, 880, 0.9, "#9b7bff")}${fish(860, 180, 0.7, "#ffd84a", -1)}
    <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#sand)"/>
    <path d="M0 ${HORIZON + 10} Q256 ${HORIZON - 30} 512 ${HORIZON + 10} Q768 ${HORIZON + 50} ${W} ${HORIZON}" fill="none" stroke="#fff3d6" stroke-width="14" opacity="0.8"/>
    ${rug("#7fd3e6", "#c9f1f7", "#ffffff")}
    <g transform="translate(150 1220)"><path d="M0 0 L-40 -50 Q0 -70 40 -50Z" fill="#ff9ebd"/>${[-30, -15, 0, 15, 30].map((a) => `<path d="M0 0 L${Math.sin((a * Math.PI) / 180) * 50} ${-Math.cos((a * Math.PI) / 180) * 56}" stroke="#ff6f9f" stroke-width="4"/>`).join("")}</g>
    <path d="${starPath(880, 1220, 46, 20)}" fill="#ff8a3d" stroke="#e35a42" stroke-width="5" stroke-linejoin="round"/>
    ${sparkle(300, 960, 14, "#ffffff", 0.9)}${sparkle(740, 990, 12, "#ffffff", 0.9)}
  `, `
    ${linear("sea", [[0, "#2aa3d6"], [1, "#8fe0f0"]])}
    ${linear("deep", [[0, "#1d6fb8"], [1, "#3fb7d9"]])}
    ${linear("sand", [[0, "#ffe4b0"], [1, "#f5c983"]])}`);
}

export function roomPicnic() {
  let flowers = "";
  [[90, 1180, "#ff6f9f"], [200, 1430, "#ffc93c"], [860, 1180, "#9b7bff"], [940, 1420, "#ff8a3d"], [60, 1380, "#ffffff"], [970, 1260, "#ff6f9f"], [300, 1500, "#ffffff"], [760, 1500, "#ffc93c"]].forEach(([x, y, c]) => {
    flowers += [0, 72, 144, 216, 288].map((a) => `<circle cx="${x + 14 * Math.cos((a * Math.PI) / 180)}" cy="${y + 14 * Math.sin((a * Math.PI) / 180)}" r="11" fill="${c}"/>`).join("") + `<circle cx="${x}" cy="${y}" r="8" fill="#ffd84a"/>`;
  });
  const tree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-16" y="0" width="32" height="140" rx="10" fill="#a0673a"/><circle cx="0" cy="-30" r="100" fill="#48b86a"/><circle cx="-60" cy="10" r="70" fill="#3fa75e"/><circle cx="60" cy="10" r="74" fill="#3fa75e"/><circle cx="-30" cy="-70" r="40" fill="#6fd28c" opacity="0.7"/>${[[-40, -10], [30, -50], [50, 30], [-60, 40]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="10" fill="#ff6f9f"/>`).join("")}</g>`;
  let gingham = "";
  for (let i = 0; i < 8; i += 1) {
    gingham += `<path d="M${260 + i * 64} 1180 L${200 + i * 82} 1500" stroke="#ff5c7a" stroke-width="26" opacity="0.55"/>`;
  }
  for (let j = 0; j < 5; j += 1) {
    const y = 1200 + j * 66;
    gingham += `<line x1="160" y1="${y}" x2="880" y2="${y}" stroke="#ff5c7a" stroke-width="22" opacity="0.45"/>`;
  }
  return svg(`
    <rect width="${W}" height="${HORIZON + 80}" fill="url(#day)"/>
    <circle cx="820" cy="210" r="150" fill="#fff6c2" opacity="0.35"/><circle cx="820" cy="210" r="90" fill="#ffe27a"/>
    ${cloud(220, 230, 1)}${cloud(560, 330, 0.7)}${cloud(900, 470, 0.55)}
    <path d="M0 860 Q260 700 520 840 Q760 960 ${W} 800 L${W} ${H} L0 ${H}Z" fill="#9ee2a9"/>
    <path d="M0 980 Q300 860 600 960 Q820 1030 ${W} 940 L${W} ${H} L0 ${H}Z" fill="#7ed191"/>
    ${tree(150, 820, 1.2)}${tree(900, 860, 0.95)}
    <path d="M0 1090 Q512 1020 ${W} 1090 L${W} ${H} L0 ${H}Z" fill="url(#grass)"/>
    <path d="M200 1170 L824 1170 L940 1520 L84 1520Z" fill="#ffffff"/>
    <clipPath id="cloth"><path d="M200 1170 L824 1170 L940 1520 L84 1520Z"/></clipPath>
    <g clip-path="url(#cloth)">${gingham}</g>
    <path d="M200 1170 L824 1170 L940 1520 L84 1520Z" fill="none" stroke="#ffffff" stroke-width="10"/>
    <g transform="translate(800 1150)"><path d="M-70 0 L70 0 L56 90 L-56 90Z" fill="#d99a52" stroke="#a0673a" stroke-width="6"/><path d="M-60 0 Q0 -90 60 0" fill="none" stroke="#a0673a" stroke-width="10"/><path d="M-66 30 L66 30 M-62 60 L62 60" stroke="#a0673a" stroke-width="4"/><circle cx="-24" cy="-6" r="20" fill="#ff5c7a"/><circle cx="18" cy="-10" r="18" fill="#ffc93c"/></g>
    ${flowers}
    <path d="M330 300 q20 -30 40 0 q20 -30 40 0" stroke="#5b4a7a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M640 200 q14 -22 28 0 q14 -22 28 0" stroke="#5b4a7a" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${sparkle(360, 520, 16)}
  `, `
    ${linear("day", [[0, "#7cc8ff"], [1, "#d8f0ff"]])}
    ${linear("grass", [[0, "#6cc77f"], [1, "#4aa864"]])}`);
}

export function roomRainbow() {
  const bands = ["#ff6f8f", "#ff9f5a", "#ffd84a", "#6fd28c", "#5ab8ff", "#9b7bff"];
  const arcs = bands.map((c, i) => {
    const r = 440 - i * 40;
    return `<path d="M${512 - r} 900 A${r} ${r} 0 0 1 ${512 + r} 900" fill="none" stroke="${c}" stroke-width="42"/>`;
  }).join("");
  let flowers = "";
  [[110, 1190], [240, 1450], [880, 1200], [800, 1460], [60, 1420], [960, 1350], [380, 1520], [660, 1520]].forEach(([x, y], i) => {
    const c = bands[i % bands.length];
    flowers += [0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="${x + 16 * Math.cos((a * Math.PI) / 180)}" cy="${y + 16 * Math.sin((a * Math.PI) / 180)}" rx="12" ry="12" fill="${c}"/>`).join("") + `<circle cx="${x}" cy="${y}" r="9" fill="#ffffff"/>`;
  });
  return svg(`
    <rect width="${W}" height="${HORIZON + 60}" fill="url(#pastel)"/>
    <circle cx="512" cy="900" r="520" fill="#ffffff" opacity="0.35"/>
    <g opacity="0.95">${arcs}</g>
    <path d="M${512 - 460} 900 A460 460 0 0 1 ${512 + 460} 900" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.6"/>
    ${cloud(120, 900, 1.4)}${cloud(900, 900, 1.4)}${cloud(200, 260, 0.6, "#ffffff", 0.9)}${cloud(820, 200, 0.7, "#ffffff", 0.9)}
    ${[[120, 140], [380, 90], [660, 120], [930, 330], [70, 500]].map(([x, y], i) => sparkle(x, y, 18 + (i % 2) * 8, i % 2 ? "#fff2a8" : "#ffffff")).join("")}
    <path d="M0 1000 Q512 930 ${W} 1000 L${W} ${H} L0 ${H}Z" fill="url(#meadow)"/>
    <path d="M0 1000 Q512 930 ${W} 1000" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.5"/>
    ${rug("#ffffff", "#fff0f6", "#ffb3cd")}
    ${flowers}
  `, `
    ${linear("pastel", [[0, "#ffe0f0"], [0.5, "#f2e6ff"], [1, "#d9f0ff"]])}
    ${linear("meadow", [[0, "#c9f2d3"], [1, "#9ee2b4"]])}`);
}

export function roomStage() {
  const folds = (x0, x1) => {
    let f = "";
    for (let x = x0; x < x1; x += 46) {
      f += `<rect x="${x}" y="0" width="22" height="${HORIZON}" fill="#ffffff" opacity="0.08"/><rect x="${x + 22}" y="0" width="10" height="${HORIZON}" fill="#000000" opacity="0.12"/>`;
    }
    return f;
  };
  let bulbs = "";
  for (let i = 0; i < 11; i += 1) {
    const x = 70 + i * 88;
    bulbs += `<circle cx="${x}" cy="${HORIZON + 30}" r="30" fill="#fff2a8" opacity="0.35"/><circle cx="${x}" cy="${HORIZON + 30}" r="13" fill="#fff6c2"/>`;
  }
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="#2a1f45"/>
    <rect x="220" y="160" width="584" height="${HORIZON - 160}" fill="url(#backdrop)"/>
    ${[[330, 300, 30], [700, 280, 36], [520, 420, 22], [400, 560, 18], [640, 600, 26], [300, 760, 16], [740, 800, 20]].map(([x, y, r], i) => `<path d="${starPath(x, y, r, r * 0.45)}" fill="${i % 2 ? "#fff2a8" : "#ffffff"}" opacity="0.85"/>`).join("")}
    <path d="M512 160 L300 ${HORIZON} L724 ${HORIZON}Z" fill="url(#beam)"/>
    <path d="M0 0 L300 0 Q260 520 300 ${HORIZON} L0 ${HORIZON}Z" fill="url(#velvet)"/>
    <path d="M${W} 0 L${W - 300} 0 Q${W - 260} 520 ${W - 300} ${HORIZON} L${W} ${HORIZON}Z" fill="url(#velvet)"/>
    <clipPath id="cl"><path d="M0 0 L300 0 Q260 520 300 ${HORIZON} L0 ${HORIZON}Z"/></clipPath>
    <clipPath id="cr"><path d="M${W} 0 L${W - 300} 0 Q${W - 260} 520 ${W - 300} ${HORIZON} L${W} ${HORIZON}Z"/></clipPath>
    <g clip-path="url(#cl)">${folds(0, 320)}</g><g clip-path="url(#cr)">${folds(W - 320, W)}</g>
    <path d="M300 640 Q200 700 150 640" stroke="url(#goldv)" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="150" cy="650" r="18" fill="url(#goldv)"/>
    <path d="M${W - 300} 640 Q${W - 200} 700 ${W - 150} 640" stroke="url(#goldv)" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="${W - 150}" cy="650" r="18" fill="url(#goldv)"/>
    <path d="M0 0 L${W} 0 L${W} 150 ${Array.from({ length: 8 }, (_, i) => `Q${W - 64 - i * 128} 230 ${W - 128 - i * 128} 150`).join(" ")}Z" fill="url(#velvet)"/>
    <path d="M0 150 ${Array.from({ length: 8 }, (_, i) => `Q${64 + i * 128} 230 ${128 + i * 128} 150`).join(" ")}" fill="none" stroke="url(#goldv)" stroke-width="12"/>
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="${64 + i * 128}" cy="${196}" r="12" fill="url(#goldv)"/>`).join("")}
    <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#boards)"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${HORIZON + 50 + i * 54}" x2="${W}" y2="${HORIZON + 50 + i * 54}" stroke="#8a4b25" stroke-width="3" opacity="0.4"/>`).join("")}
    <rect x="0" y="${HORIZON}" width="${W}" height="18" fill="url(#goldv)"/>
    ${bulbs}
    <ellipse cx="512" cy="1320" rx="360" ry="110" fill="url(#spot)"/>
    <path d="${starPath(512, 1320, 140, 60)}" fill="#ffd84a" opacity="0.35"/>
    ${sparkle(150, 900, 16, "#fff2a8")}${sparkle(880, 880, 20, "#fff2a8")}
  `, `
    ${linear("velvet", [[0, "#e0455f"], [1, "#9e1f3a"]], false)}
    ${linear("backdrop", [[0, "#3b2d73"], [1, "#6a4bd6"]])}
    ${linear("beam", [[0, "#fff6c2", 0.55], [1, "#fff6c2", 0.08]])}
    ${linear("boards", [[0, "#c9773d"], [1, "#9a5527"]])}`);
}

export function roomStudy() {
  let wallpaper = "";
  for (let y = 60; y < HORIZON; y += 120) {
    for (let x = (y / 120) % 2 ? 60 : 0; x < W; x += 120) {
      wallpaper += `<circle cx="${x}" cy="${y}" r="6" fill="#f3d9a6" opacity="0.8"/>`;
    }
  }
  const books = (x, y, colors) =>
    colors.map((c, i) => `<rect x="${x + i * 30}" y="${y - (i % 3 === 0 ? 96 : 84)}" width="26" height="${i % 3 === 0 ? 96 : 84}" rx="4" fill="${c}"/><rect x="${x + i * 30 + 4}" y="${y - 70}" width="18" height="6" fill="#ffffff" opacity="0.6"/>`).join("");
  const poster = (x, y, n, c) => `<rect x="${x}" y="${y}" width="120" height="140" rx="16" fill="#ffffff" stroke="#e8d3a8" stroke-width="6"/><text x="${x + 60}" y="${y + 108}" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="100" fill="${c}">${n}</text>`;
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="url(#cream)"/>
    ${wallpaper}
    ${archWindow({
      x: 362, y: 240, w: 300, h: 420, id: "sw", frame: "#ffffff", frameShade: "#e3c992",
      curtains: ["#7fcfa8", "#bff0d6"],
      scene: `<rect x="362" y="240" width="300" height="420" fill="url(#studySky)"/>${cloud(470, 400, 0.55)}<path d="M362 600 Q450 540 540 590 Q610 560 662 590 L662 660 L362 660Z" fill="#7ed191"/><circle cx="600" cy="330" r="34" fill="#ffe27a"/>`
    })}
    ${poster(70, 260, "1", "#ff5c7a")}${poster(110, 440, "2", "#3d8bff")}${poster(834, 280, "3", "#36bf77")}
    <rect x="740" y="470" width="250" height="560" rx="16" fill="#c98a52"/>
    <rect x="758" y="490" width="214" height="520" rx="10" fill="#a8693a"/>
    ${[640, 800, 960].map((y) => `<rect x="758" y="${y}" width="214" height="16" fill="#c98a52"/>`).join("")}
    ${books(770, 640, ["#ff6f9f", "#3d8bff", "#ffc93c", "#36bf77", "#9b7bff", "#ff8a3d"])}
    ${books(770, 800, ["#36bf77", "#ff8a3d", "#9b7bff", "#ff6f9f", "#ffc93c", "#3d8bff"])}
    <circle cx="820" cy="930" r="32" fill="#3d8bff"/><path d="M790 920 Q820 900 850 930" stroke="#36bf77" stroke-width="10" fill="none"/>
    <rect x="890" y="890" width="54" height="70" rx="6" fill="#ff6f9f"/>
    <g transform="translate(160 840)"><path d="M-60 0 L60 0 L40 -90 L-40 -90Z" fill="#ffd84a"/><path d="M-60 0 L60 0" stroke="#e5a100" stroke-width="6"/><rect x="-6" y="0" width="12" height="150" fill="#5b4a7a"/><ellipse cx="0" cy="150" rx="50" ry="14" fill="#5b4a7a"/><ellipse cx="0" cy="20" rx="120" ry="40" fill="#fff6c2" opacity="0.35"/></g>
    ${baseboard("#ffffff", "#a8693a")}
    ${perspectiveFloor({ top: "#e3b47c", bottom: "#c48a50", line: "#a8693a" })}
    ${rug("#7fcfa8", "#c8f0dc", "#ffffff")}
    ${sparkle(560, 190, 16, "#ffc93c")}
  `, `
    ${linear("cream", [[0, "#fff6e3"], [1, "#ffe9c2"]])}
    ${linear("studySky", [[0, "#8fd0ff"], [1, "#dff3ff"]])}`);
}

export function roomTreasure() {
  let coins = "";
  const pile = (cx, cy, w, h) => {
    let out = `<path d="M${cx - w} ${cy} Q${cx} ${cy - h * 2} ${cx + w} ${cy}Z" fill="#f2b400"/>`;
    for (let i = 0; i < 26; i += 1) {
      const t = i / 25;
      const x = cx - w + t * 2 * w + ((i * 37) % 23) - 11;
      const y = cy - Math.sin(t * Math.PI) * h * 1.4 + ((i * 53) % 30);
      out += `<ellipse cx="${x}" cy="${y}" rx="22" ry="11" fill="url(#goldv)" stroke="#b07a10" stroke-width="3"/>`;
    }
    return out;
  };
  coins += pile(150, 1180, 150, 90) + pile(880, 1200, 160, 80);
  const gem = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -30 L26 -8 L16 30 L-16 30 L-26 -8Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/><path d="M0 -30 L10 -6 L-10 -6Z" fill="#ffffff" opacity="0.6"/></g>`;
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="url(#vault)"/>
    ${Array.from({ length: 9 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<rect x="${c * 136 + (r % 2) * 68 - 40}" y="${r * 118}" width="128" height="110" rx="14" fill="#ffffff" opacity="0.06"/>`).join("")).join("")}
    <path d="M232 ${HORIZON} L232 520 A280 280 0 0 1 792 520 L792 ${HORIZON}Z" fill="#7a4a12" opacity="0.35"/>
    <path d="M262 ${HORIZON} L262 530 A250 250 0 0 1 762 530 L762 ${HORIZON}Z" fill="url(#glowArch)"/>
    <path d="M232 ${HORIZON} L232 520 A280 280 0 0 1 792 520 L792 ${HORIZON}" fill="none" stroke="url(#goldv)" stroke-width="30"/>
    ${[0, 30, 60, 90, 120, 150, 180].map((a) => `<circle cx="${512 - 280 * Math.cos((a * Math.PI) / 180)}" cy="${520 - 280 * Math.sin((a * Math.PI) / 180)}" r="14" fill="#ff5c7a" stroke="#fff2b0" stroke-width="4"/>`).join("")}
    <g transform="translate(512 820)">
      <rect x="-150" y="0" width="300" height="160" rx="18" fill="#b0652a" stroke="#6b3a12" stroke-width="8"/>
      <path d="M-150 10 Q0 -130 150 10Z" fill="#c9773d" stroke="#6b3a12" stroke-width="8"/>
      <path d="M-150 10 L150 10" stroke="url(#goldv)" stroke-width="22"/>
      <rect x="-120" y="0" width="20" height="160" fill="url(#goldv)"/><rect x="100" y="0" width="20" height="160" fill="url(#goldv)"/>
      <rect x="-26" y="-6" width="52" height="60" rx="10" fill="url(#goldv)" stroke="#b07a10" stroke-width="4"/><circle cx="0" cy="22" r="8" fill="#6b3a12"/>
      <ellipse cx="0" cy="-40" rx="200" ry="70" fill="#fff2a8" opacity="0.35"/>
    </g>
    ${gem(140, 420, 1.4, "#ff5c7a", "#c93a5b")}${gem(880, 380, 1.2, "#3d8bff", "#1e66d6")}${gem(900, 640, 1, "#36bf77", "#1f9658")}${gem(110, 660, 1.1, "#9b7bff", "#5a3bdb")}
    ${baseboard("#d9a441", "#7a4a12")}
    ${perspectiveFloor({ top: "#c98f3a", bottom: "#9a6420", line: "#7a4a12" })}
    ${rug("#c93a5b", "#ff7a93", "#ffd84a")}
    ${coins}
    ${[[220, 360], [800, 300], [512, 260], [330, 980], [700, 990]].map(([x, y], i) => sparkle(x, y, 20 + (i % 2) * 8, "#fff6c2")).join("")}
  `, `
    ${linear("vault", [[0, "#7a4a12"], [1, "#d39a3a"]])}
    ${radial("glowArch", [[0, "#fff2b0"], [0.6, "#ffcf5a"], [1, "#e09a2a"]], 0.5, 0.6, 0.7)}`);
}

export function roomWinter() {
  let flakes = "";
  [[90, 150], [200, 330], [80, 600], [930, 180], [860, 420], [960, 640], [320, 120], [700, 90], [180, 860], [870, 880]].forEach(([x, y], i) => {
    const r = 16 + (i % 3) * 6;
    flakes += `<g stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.9">${[0, 60, 120].map((a) => `<line x1="${x - r * Math.cos((a * Math.PI) / 180)}" y1="${y - r * Math.sin((a * Math.PI) / 180)}" x2="${x + r * Math.cos((a * Math.PI) / 180)}" y2="${y + r * Math.sin((a * Math.PI) / 180)}"/>`).join("")}</g>`;
  });
  const pine = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -150 L70 -40 L40 -40 L90 40 L-90 40 L-40 -40 L-70 -40Z" fill="#2f8f6a"/><path d="M0 -150 L30 -104 L-30 -104Z M-40 -40 L40 -40 L30 -24 L-30 -24Z" fill="#ffffff"/><rect x="-12" y="40" width="24" height="30" fill="#8a5a2b"/></g>`;
  return svg(`
    <rect width="${W}" height="${HORIZON}" fill="url(#frost)"/>
    ${flakes}
    ${archWindow({
      x: 312, y: 250, w: 400, h: 520, id: "ww", frame: "#ffffff", frameShade: "#a9c8e8",
      curtains: ["#7fb6ff", "#cfe4ff"],
      scene: `<rect x="312" y="250" width="400" height="520" fill="url(#snowSky)"/>
        ${pine(400, 640, 0.9)}${pine(640, 660, 1.1)}${pine(530, 620, 0.6)}
        <path d="M312 690 Q450 640 560 690 Q640 660 712 690 L712 770 L312 770Z" fill="#ffffff"/>
        <g transform="translate(470 690)"><circle cx="0" cy="0" r="40" fill="#ffffff"/><circle cx="0" cy="-56" r="28" fill="#ffffff"/><circle cx="-8" cy="-60" r="3" fill="#2e2a4f"/><circle cx="8" cy="-60" r="3" fill="#2e2a4f"/><path d="M0 -52 l16 4 l-16 4Z" fill="#ff8a3d"/><rect x="-22" y="-94" width="44" height="12" fill="#ff5c7a"/></g>
        ${[[350, 300], [420, 380], [600, 320], [680, 420], [520, 470], [380, 520]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffffff"/>`).join("")}`
    })}
    <g transform="translate(150 1000)">
      <rect x="-110" y="-260" width="220" height="260" rx="16" fill="#e8eef7"/>
      <rect x="-70" y="-160" width="140" height="160" rx="70" fill="#4a3a5c"/>
      <path d="M-50 0 Q-40 -90 0 -120 Q40 -90 50 0Z" fill="#ff8a3d"/><path d="M-26 0 Q-20 -60 0 -80 Q20 -60 26 0Z" fill="#ffd84a"/>
      <rect x="-130" y="-280" width="260" height="30" rx="10" fill="#ffffff"/>
      <ellipse cx="0" cy="-40" rx="120" ry="70" fill="#ffb347" opacity="0.25"/>
    </g>
    <g transform="translate(870 980)"><circle cx="0" cy="0" r="70" fill="#dff1ff" stroke="#ffffff" stroke-width="8"/>${pine(0, 20, 0.35)}<rect x="-56" y="56" width="112" height="34" rx="10" fill="#7fb6ff"/></g>
    ${baseboard("#ffffff", "#7fa8d6")}
    ${perspectiveFloor({ top: "#dbe9f7", bottom: "#b6cce6", line: "#ffffff" })}
    <g>
      <ellipse cx="512" cy="1330" rx="410" ry="120" fill="#000000" opacity="0.07"/>
      <path d="M512 1200 ${Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r = i % 2 ? 1 : 1.08;
        return `L${512 + 400 * r * Math.cos(a)} ${1318 + 116 * r * Math.sin(a)}`;
      }).join(" ")}Z" fill="#ffffff"/>
      <ellipse cx="512" cy="1318" rx="300" ry="82" fill="#f2f7ff"/>
    </g>
    ${sparkle(250, 1000, 14, "#ffffff")}${sparkle(780, 1040, 18, "#ffffff")}
  `, `
    ${linear("frost", [[0, "#bcdcfb"], [1, "#eef6ff"]])}
    ${linear("snowSky", [[0, "#8fb8e8"], [1, "#e3f0ff"]])}`);
}

export const roomArt = {
  "room-candy": roomCandy,
  "room-cloud": roomCloud,
  "room-moon": roomMoon,
  "room-ocean": roomOcean,
  "room-picnic": roomPicnic,
  "room-rainbow": roomRainbow,
  "room-stage": roomStage,
  "room-study": roomStudy,
  "room-treasure": roomTreasure,
  "room-winter": roomWinter
};
