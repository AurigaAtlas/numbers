// Vector sources for shop accessories and small UI art.
// Each export returns an SVG string. Run `node art/render.mjs` to rasterize.

const gold = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff2b0"/>
    <stop offset="0.45" stop-color="#f7c948"/>
    <stop offset="1" stop-color="#c98a12"/>
  </linearGradient>`;

const sparkle = (x, y, r, color = "#fff6c2") =>
  `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${color}"/>`;

const starPath = (cx, cy, outer, inner, points = 5, rotate = -90) => {
  const pts = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((rotate + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}Z`;
};

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;

const shadow = (cx, cy, rx, ry, o = 0.18) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#5a3a5e" opacity="${o}"/>`;

export function cloudCushion() {
  const blobs = [
    [170, 255, 88], [262, 205, 108], [352, 250, 88], [118, 318, 62], [404, 318, 62]
  ];
  const shapes = (attrs) =>
    blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${attrs}/>`).join("") +
    `<rect x="118" y="270" width="286" height="110" rx="55" ${attrs}/>`;
  return svg(512, 512, `
    <defs>
      <radialGradient id="cc" cx="0.38" cy="0.3" r="0.8">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.55" stop-color="#eef7ff"/>
        <stop offset="1" stop-color="#bcdcfb"/>
      </radialGradient>
      ${gold("ccg")}
    </defs>
    ${shadow(262, 418, 178, 24)}
    <g>${shapes('fill="#8dbdf0" stroke="#8dbdf0" stroke-width="18" stroke-linejoin="round"')}</g>
    <g>${shapes('fill="url(#cc)"')}</g>
    <path d="M150 352 Q140 300 178 290 Q170 222 236 214 Q262 150 318 196 Q370 192 372 250 Q412 262 398 330" fill="none" stroke="#a9cdf3" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/>
    <ellipse cx="205" cy="190" rx="52" ry="24" fill="#ffffff" opacity="0.8" transform="rotate(-18 205 190)"/>
    <path d="M216 300 q14 -16 28 0" fill="none" stroke="#5b4a7a" stroke-width="7" stroke-linecap="round"/>
    <path d="M282 300 q14 -16 28 0" fill="none" stroke="#5b4a7a" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="206" cy="324" rx="18" ry="11" fill="#ffb3c8" opacity="0.85"/>
    <ellipse cx="320" cy="324" rx="18" ry="11" fill="#ffb3c8" opacity="0.85"/>
    <path d="M250 322 q13 12 26 0" fill="none" stroke="#5b4a7a" stroke-width="6" stroke-linecap="round"/>
    <g>
      <path d="M86 352 l-22 46 l14 0 l-6 34" stroke="url(#ccg)" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="88" cy="350" r="15" fill="url(#ccg)" stroke="#c98a12" stroke-width="3"/>
      <path d="M436 352 l22 46 l-14 0 l6 34" stroke="url(#ccg)" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="434" cy="350" r="15" fill="url(#ccg)" stroke="#c98a12" stroke-width="3"/>
    </g>
    <path d="${starPath(262, 128, 26, 11)}" fill="url(#ccg)" stroke="#c98a12" stroke-width="3" stroke-linejoin="round"/>
    ${sparkle(118, 160, 18)}${sparkle(410, 168, 14, "#ffffff")}${sparkle(438, 236, 9)}
  `);
}

function rose(cx, cy, r, light, mid, dark, id) {
  return `
    <radialGradient id="${id}" cx="0.4" cy="0.35" r="0.75">
      <stop offset="0" stop-color="${light}"/><stop offset="0.6" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </radialGradient>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" stroke="${dark}" stroke-width="3"/>
    <path d="M${cx - r * 0.55} ${cy + r * 0.1} Q${cx - r * 0.5} ${cy - r * 0.6} ${cx + r * 0.1} ${cy - r * 0.55} Q${cx + r * 0.65} ${cy - r * 0.4} ${cx + r * 0.55} ${cy + r * 0.15}" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    <path d="M${cx - r * 0.28} ${cy + r * 0.05} Q${cx - r * 0.2} ${cy - r * 0.32} ${cx + r * 0.12} ${cy - r * 0.25} Q${cx + r * 0.35} ${cy - r * 0.1} ${cx + r * 0.22} ${cy + r * 0.18} Q${cx} ${cy + r * 0.35} ${cx - r * 0.12} ${cy + r * 0.12}" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round" opacity="0.75"/>
    <path d="M${cx - r * 0.75} ${cy + r * 0.35} Q${cx} ${cy + r * 0.95} ${cx + r * 0.75} ${cy + r * 0.35}" fill="none" stroke="${dark}" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>`;
}

function daisy(cx, cy, r, petal = "#ffffff", center = "#ffc93c") {
  let petals = "";
  for (let i = 0; i < 12; i += 1) {
    petals += `<ellipse cx="${cx}" cy="${cy - r * 0.62}" rx="${r * 0.2}" ry="${r * 0.45}" fill="${petal}" stroke="#e7dcef" stroke-width="2" transform="rotate(${i * 30} ${cx} ${cy})"/>`;
  }
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${center}" stroke="#e5a100" stroke-width="3"/><circle cx="${cx - r * 0.08}" cy="${cy - r * 0.08}" r="${r * 0.1}" fill="#fff3b0"/>`;
}

const leaf = (x, y, len, angle, color = "#48b86a", dark = "#2e8a4c") =>
  `<g transform="rotate(${angle} ${x} ${y})"><path d="M${x} ${y} Q${x + len * 0.5} ${y - len * 0.32} ${x + len} ${y} Q${x + len * 0.5} ${y + len * 0.32} ${x} ${y}Z" fill="${color}" stroke="${dark}" stroke-width="3"/><path d="M${x + 4} ${y} L${x + len - 8} ${y}" stroke="${dark}" stroke-width="2.5" opacity="0.6"/></g>`;

export function flowerBouquet() {
  return svg(512, 512, `
    <defs>
      <linearGradient id="fbp" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ffc2d6"/><stop offset="0.5" stop-color="#ffe3ec"/><stop offset="1" stop-color="#ff9ebd"/>
      </linearGradient>
      <linearGradient id="fbl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#d9c8ff"/><stop offset="1" stop-color="#b79cff"/>
      </linearGradient>
      <linearGradient id="fbr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff7aa8"/><stop offset="1" stop-color="#e0457c"/>
      </linearGradient>
    </defs>
    ${shadow(256, 480, 70, 12)}
    <path d="M118 230 L394 230 L270 478 L242 478Z" fill="url(#fbl)" stroke="#9479e6" stroke-width="5" stroke-linejoin="round"/>
    ${leaf(150, 230, 90, -150)}${leaf(362, 230, 90, -30)}${leaf(200, 160, 80, -120)}${leaf(316, 160, 80, -60)}${leaf(256, 140, 70, -90, "#5cc77d")}
    ${rose(196, 200, 46, "#ffd0dc", "#ff6f9f", "#c93a6c", "r1")}
    ${rose(318, 196, 48, "#ffe6b8", "#ffb347", "#d9821a", "r2")}
    ${rose(258, 148, 44, "#ffd6e6", "#ff8fb8", "#d0507f", "r3")}
    ${daisy(150, 270, 40)}${daisy(366, 262, 38)}
    ${daisy(262, 232, 30, "#fff4fb", "#ff8a3d")}
    <circle cx="214" cy="108" r="13" fill="#7fb6ff" stroke="#3d8bff" stroke-width="3"/><circle cx="214" cy="108" r="4" fill="#fff6c2"/>
    <circle cx="306" cy="100" r="12" fill="#b99cff" stroke="#7655e6" stroke-width="3"/><circle cx="306" cy="100" r="4" fill="#fff6c2"/>
    <circle cx="372" cy="156" r="11" fill="#7fb6ff" stroke="#3d8bff" stroke-width="3"/><circle cx="372" cy="156" r="4" fill="#fff6c2"/>
    <path d="M140 262 L372 262 L268 478 L244 478Z" fill="url(#fbp)" stroke="#e7759d" stroke-width="5" stroke-linejoin="round"/>
    <path d="M140 262 Q200 286 256 266 Q314 286 372 262" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    <path d="M196 290 L250 470" stroke="#ffffff" stroke-width="6" opacity="0.45" stroke-linecap="round"/>
    <g transform="translate(256 372)">
      <path d="M0 0 C-30 -40 -86 -30 -74 6 C-64 34 -24 22 0 0Z" fill="url(#fbr)" stroke="#b8305f" stroke-width="4"/>
      <path d="M0 0 C30 -40 86 -30 74 6 C64 34 24 22 0 0Z" fill="url(#fbr)" stroke="#b8305f" stroke-width="4"/>
      <path d="M-6 6 L-34 74 L-16 66 L-4 82Z" fill="#e0457c" stroke="#b8305f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M6 6 L34 74 L16 66 L4 82Z" fill="#e0457c" stroke="#b8305f" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="0" cy="2" rx="15" ry="13" fill="#ff7aa8" stroke="#b8305f" stroke-width="4"/>
      <ellipse cx="-44" cy="-8" rx="16" ry="6" fill="#ffffff" opacity="0.55" transform="rotate(-20 -44 -8)"/>
    </g>
    ${sparkle(110, 130, 16)}${sparkle(420, 110, 18)}${sparkle(410, 330, 10, "#ffffff")}
  `);
}

export function gemNecklace() {
  const pearls = [];
  const N = 19;
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const x = (1 - t) ** 2 * 96 + 2 * (1 - t) * t * 256 + t ** 2 * 416;
    const y = (1 - t) ** 2 * 96 + 2 * (1 - t) * t * 430 + t ** 2 * 96;
    if (Math.abs(x - 256) < 26) continue;
    pearls.push([x, y]);
  }
  return svg(512, 512, `
    <defs>
      <radialGradient id="pe" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f6eef8"/><stop offset="1" stop-color="#c9b6d9"/>
      </radialGradient>
      ${gold("ng")}
      <linearGradient id="gm1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe2ff"/><stop offset="1" stop-color="#2e7fe0"/></linearGradient>
      <linearGradient id="gm2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8f4ff"/><stop offset="1" stop-color="#6cc0ff"/></linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#bfe6ff" stop-opacity="0.9"/><stop offset="1" stop-color="#bfe6ff" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M96 96 Q256 430 416 96" fill="none" stroke="#d9b24a" stroke-width="4"/>
    ${pearls.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" r="15" fill="#8a6f99" opacity="0.25"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="url(#pe)" stroke="#bda7cf" stroke-width="2"/><circle cx="${(x - 5).toFixed(1)}" cy="${(y - 5).toFixed(1)}" r="4" fill="#ffffff"/>`).join("")}
    <circle cx="256" cy="380" r="120" fill="url(#glow)"/>
    <path d="M232 258 Q256 236 280 258 L272 290 L240 290Z" fill="url(#ng)" stroke="#b07a10" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="256" cy="262" r="9" fill="#ff6f9f" stroke="#c93a6c" stroke-width="3"/>
    <path d="M256 286 L322 330 L306 404 L256 452 L206 404 L190 330Z" fill="url(#ng)" stroke="#b07a10" stroke-width="5" stroke-linejoin="round"/>
    <path d="M256 300 L308 334 L295 398 L256 436 L217 398 L204 334Z" fill="url(#gm1)"/>
    <path d="M256 300 L308 334 L256 352Z" fill="#c6eeff"/>
    <path d="M256 300 L204 334 L256 352Z" fill="#8fd6ff"/>
    <path d="M204 334 L217 398 L256 352Z" fill="#4aa3f0"/>
    <path d="M308 334 L295 398 L256 352Z" fill="#79c2ff"/>
    <path d="M217 398 L256 436 L256 352Z" fill="#2f86e0"/>
    <path d="M295 398 L256 436 L256 352Z" fill="#1f6cc8"/>
    <path d="M230 330 L256 316 L262 336 Z" fill="#ffffff" opacity="0.85"/>
    ${sparkle(296, 322, 16, "#ffffff")}${sparkle(150, 210, 14)}${sparkle(372, 214, 12)}${sparkle(214, 444, 10, "#ffffff")}
  `);
}

export function magicBook() {
  return svg(512, 512, `
    <defs>
      <linearGradient id="bc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b7bff"/><stop offset="1" stop-color="#5a3bdb"/></linearGradient>
      <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf5"/><stop offset="1" stop-color="#f3e6c8"/></linearGradient>
      <radialGradient id="mg" cx="0.5" cy="0.75" r="0.6"><stop offset="0" stop-color="#fff3a8" stop-opacity="0.95"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
      ${gold("bg")}
    </defs>
    ${shadow(256, 452, 190, 22)}
    <path d="M62 222 Q160 196 256 232 Q352 196 450 222 L450 420 Q352 396 256 432 Q160 396 62 420Z" fill="url(#bc)" stroke="#4325b8" stroke-width="6" stroke-linejoin="round"/>
    <path d="M82 214 Q166 190 254 226 L254 412 Q166 380 82 400Z" fill="#eadcb9"/>
    <path d="M430 214 Q346 190 258 226 L258 412 Q346 380 430 400Z" fill="#eadcb9"/>
    <path d="M90 204 Q168 178 254 216 L254 404 Q168 370 90 390Z" fill="url(#pg)" stroke="#d6c193" stroke-width="3"/>
    <path d="M422 204 Q344 178 258 216 L258 404 Q344 370 422 390Z" fill="url(#pg)" stroke="#d6c193" stroke-width="3"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M118 ${250 + i * 26} Q170 ${236 + i * 26} 228 ${258 + i * 26}" stroke="#cdb98c" stroke-width="5" fill="none" stroke-linecap="round" opacity="${i === 2 ? 0 : 0.8}"/>`).join("")}
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M284 ${258 + i * 26} Q342 ${236 + i * 26} 394 ${250 + i * 26}" stroke="#cdb98c" stroke-width="5" fill="none" stroke-linecap="round" opacity="${i === 1 ? 0 : 0.8}"/>`).join("")}
    <path d="M150 300 a20 20 0 1 1 40 0" stroke="#ff8fb8" stroke-width="6" fill="none"/>
    <path d="${starPath(340, 290, 18, 8)}" fill="#ffc93c"/>
    <path d="M256 214 L256 420" stroke="#c9b383" stroke-width="4"/>
    <path d="M246 404 L246 478 L256 466 L266 478 L266 404Z" fill="#ff5c7a" stroke="#c93a5b" stroke-width="3" stroke-linejoin="round"/>
    <path d="M62 222 l26 -6 l0 26Z M450 222 l-26 -6 l0 26Z M62 420 l26 2 l0 -26Z M450 420 l-26 2 l0 -26Z" fill="url(#bg)" stroke="#b07a10" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="256" cy="170" rx="150" ry="120" fill="url(#mg)"/>
    <path d="${starPath(256, 120, 40, 17)}" fill="url(#bg)" stroke="#c98a12" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(176, 70, 18, 8)}" fill="#ff8fb8" stroke="#d0507f" stroke-width="3" stroke-linejoin="round"/>
    <path d="${starPath(344, 64, 22, 9)}" fill="#7fb6ff" stroke="#3d8bff" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="206" cy="150" r="7" fill="#ffffff"/><circle cx="312" cy="138" r="6" fill="#fff6c2"/><circle cx="292" cy="180" r="5" fill="#ffffff"/><circle cx="216" cy="188" r="4" fill="#fff6c2"/>
    ${sparkle(132, 140, 16)}${sparkle(396, 150, 18)}${sparkle(256, 30, 12, "#ffffff")}
  `);
}

export function moonLantern() {
  return svg(512, 512, `
    <defs>
      ${gold("lg")}
      <radialGradient id="lw" cx="0.5" cy="0.45" r="0.65"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.5" stop-color="#ffe27a"/><stop offset="1" stop-color="#f5a93b"/></radialGradient>
      <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.85"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
      <linearGradient id="ls" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    </defs>
    <circle cx="256" cy="268" r="190" fill="url(#halo)"/>
    <circle cx="256" cy="62" r="28" fill="none" stroke="url(#lg)" stroke-width="12"/>
    <path d="M176 152 Q256 64 336 152Z" fill="url(#lg)" stroke="#b07a10" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="256" cy="96" r="12" fill="#ff6f9f" stroke="#c93a6c" stroke-width="3"/>
    <rect x="166" y="148" width="180" height="26" rx="12" fill="url(#lg)" stroke="#b07a10" stroke-width="5"/>
    <rect x="186" y="172" width="140" height="190" rx="40" fill="url(#lw)" stroke="#d48a12" stroke-width="6"/>
    <path d="M286 214 a54 54 0 1 0 0 104 a42 42 0 1 1 0 -104Z" fill="#fffdf2" stroke="#f0b53c" stroke-width="3"/>
    <path d="${starPath(298, 228, 10, 4)}" fill="#ffffff"/><path d="${starPath(306, 300, 7, 3)}" fill="#ffffff"/>
    <rect x="200" y="186" width="22" height="160" rx="11" fill="url(#ls)"/>
    <path d="M226 172 L226 362 M286 172 L286 362" stroke="#e1a12e" stroke-width="5" opacity="0.55"/>
    <rect x="166" y="358" width="180" height="26" rx="12" fill="url(#lg)" stroke="#b07a10" stroke-width="5"/>
    <path d="M206 384 Q256 432 306 384Z" fill="url(#lg)" stroke="#b07a10" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="256" cy="414" r="10" fill="url(#lg)" stroke="#b07a10" stroke-width="4"/>
    <path d="M256 424 L256 448" stroke="#ff6f9f" stroke-width="8" stroke-linecap="round"/>
    <path d="M244 448 L240 492 M250 448 L250 496 M256 448 L256 498 M262 448 L262 496 M268 448 L272 492" stroke="#ff8fb8" stroke-width="5" stroke-linecap="round"/>
    <rect x="240" y="440" width="32" height="14" rx="7" fill="url(#lg)" stroke="#b07a10" stroke-width="3"/>
    ${sparkle(118, 170, 18)}${sparkle(400, 220, 16)}${sparkle(388, 120, 10, "#ffffff")}${sparkle(120, 330, 10, "#ffffff")}
  `);
}

export function musicMic() {
  let mesh = "";
  for (let i = -6; i <= 6; i += 1) {
    mesh += `<path d="M${180 + i * 22} 70 L${340 + i * 22} 270" stroke="#ffffff" stroke-width="3" opacity="0.35"/>`;
    mesh += `<path d="M${332 - i * 22} 70 L${172 - i * 22} 270" stroke="#a8436f" stroke-width="3" opacity="0.25"/>`;
  }
  const note = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="40" rx="16" ry="12" transform="rotate(-20 0 40)"/><rect x="11" y="-14" width="7" height="56" rx="3"/><path d="M14 -14 Q40 -6 36 22 Q30 4 16 2Z"/></g>`;
  return svg(512, 512, `
    <defs>
      <radialGradient id="mh" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#ffe6f0"/><stop offset="0.55" stop-color="#ff9ec4"/><stop offset="1" stop-color="#c9518a"/></radialGradient>
      <linearGradient id="mb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2ecff"/><stop offset="0.45" stop-color="#ffffff"/><stop offset="1" stop-color="#cfc2ef"/></linearGradient>
      ${gold("mgd")}
      <clipPath id="mc"><circle cx="256" cy="168" r="86"/></clipPath>
    </defs>
    ${shadow(256, 486, 50, 10)}
    <path d="M214 262 L298 262 L278 462 Q256 478 234 462Z" fill="url(#mb)" stroke="#9c8bcf" stroke-width="5" stroke-linejoin="round"/>
    <path d="M228 278 L238 450" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
    <path d="M256 322 c-14 -18 -38 -2 -24 18 l24 22 l24 -22 c14 -20 -10 -36 -24 -18Z" fill="#ff5c7a" stroke="#c93a5b" stroke-width="4"/>
    <circle cx="246" cy="332" r="5" fill="#ffffff" opacity="0.85"/>
    <rect x="230" y="440" width="52" height="22" rx="10" fill="url(#mgd)" stroke="#b07a10" stroke-width="4"/>
    <circle cx="256" cy="168" r="86" fill="url(#mh)" stroke="#b74378" stroke-width="6"/>
    <g clip-path="url(#mc)">${mesh}</g>
    <ellipse cx="226" cy="128" rx="30" ry="18" fill="#ffffff" opacity="0.7" transform="rotate(-30 226 128)"/>
    <ellipse cx="256" cy="252" rx="78" ry="20" fill="url(#mgd)" stroke="#b07a10" stroke-width="5"/>
    <path d="M190 248 Q256 264 322 248" stroke="#fff2b0" stroke-width="4" fill="none" opacity="0.8"/>
    ${note(92, 190, 1.4, "#9b7bff")}${note(380, 110, 1.1, "#3d8bff")}${note(396, 300, 1.2, "#ff8a3d")}
    ${sparkle(130, 100, 18)}${sparkle(420, 220, 12, "#ffffff")}${sparkle(130, 340, 12)}
  `);
}

export function ribbonUmbrella() {
  const top = [256, 96];
  const xs = [56, 156, 256, 356, 456];
  const baseY = (x) => 268 - Math.abs(x - 256) * 0.06;
  let panels = "";
  let lace = "";
  for (let i = 0; i < xs.length - 1; i += 1) {
    const a = xs[i];
    const b = xs[i + 1];
    const mid = (a + b) / 2;
    const fill = i % 2 === 0 ? "url(#up)" : "url(#uw)";
    panels += `<path d="M${top[0]} ${top[1]} Q${(a + top[0]) / 2 - 20} ${top[1] + 40} ${a} ${baseY(a)} Q${mid} ${baseY(mid) + 46} ${b} ${baseY(b)} Q${(b + top[0]) / 2 + 20} ${top[1] + 40} ${top[0]} ${top[1]}Z" fill="${fill}" stroke="#d94f84" stroke-width="5" stroke-linejoin="round"/>`;
    for (let k = 1; k < 6; k += 1) {
      const t = k / 6;
      const x = (1 - t) ** 2 * a + 2 * (1 - t) * t * mid + t ** 2 * b;
      const y = (1 - t) ** 2 * baseY(a) + 2 * (1 - t) * t * (baseY(mid) + 46) + t ** 2 * baseY(b);
      lace += `<circle cx="${x.toFixed(1)}" cy="${(y + 9).toFixed(1)}" r="8" fill="#ffffff" stroke="#f3b8cd" stroke-width="2"/>`;
    }
  }
  return svg(512, 512, `
    <defs>
      <linearGradient id="up" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3cd"/><stop offset="1" stop-color="#ff6f9f"/></linearGradient>
      <linearGradient id="uw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe3ee"/></linearGradient>
      <linearGradient id="uh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c98a12"/><stop offset="0.5" stop-color="#ffe08a"/><stop offset="1" stop-color="#c98a12"/></linearGradient>
      ${gold("ug")}
    </defs>
    ${shadow(256, 490, 60, 10)}
    <path d="M256 250 L256 430 Q256 478 296 478 Q330 478 330 446" fill="none" stroke="#b07a10" stroke-width="20" stroke-linecap="round"/>
    <path d="M256 250 L256 430 Q256 478 296 478 Q330 478 330 446" fill="none" stroke="url(#uh)" stroke-width="13" stroke-linecap="round"/>
    ${lace}
    ${panels}
    <path d="M150 150 Q190 112 236 104" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.7"/>
    <circle cx="256" cy="84" r="16" fill="url(#ug)" stroke="#b07a10" stroke-width="4"/>
    <g transform="translate(256 292)">
      <path d="M0 0 C-24 -34 -70 -24 -60 6 C-52 28 -20 18 0 0Z" fill="#9b7bff" stroke="#6a4bd6" stroke-width="4"/>
      <path d="M0 0 C24 -34 70 -24 60 6 C52 28 20 18 0 0Z" fill="#9b7bff" stroke="#6a4bd6" stroke-width="4"/>
      <path d="M-4 6 L-24 58 L-10 52 L-2 66Z M4 6 L24 58 L10 52 L2 66Z" fill="#8a68f5" stroke="#6a4bd6" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="0" cy="2" r="12" fill="#b49cff" stroke="#6a4bd6" stroke-width="4"/>
    </g>
    ${sparkle(86, 110, 18)}${sparkle(440, 120, 14, "#ffffff")}${sparkle(436, 340, 12)}
  `);
}

export function sparkleShield() {
  const shield = "M256 56 C326 92 380 96 420 98 C422 272 362 386 256 456 C150 386 90 272 92 98 C132 96 186 92 256 56Z";
  const inner = "M256 92 C314 120 358 126 388 128 C386 268 338 360 256 418 C174 360 126 268 124 128 C154 126 198 120 256 92Z";
  const rivets = [[256, 76], [150, 106], [362, 106], [110, 200], [402, 200], [150, 330], [362, 330], [256, 432]];
  return svg(512, 512, `
    <defs>
      ${gold("sg")}
      <linearGradient id="sb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9d8ff"/><stop offset="0.5" stop-color="#6ea8ff"/><stop offset="1" stop-color="#7a5ce6"/></linearGradient>
      <linearGradient id="ss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd0e2"/><stop offset="1" stop-color="#ff5c94"/></linearGradient>
      <clipPath id="sc"><path d="${inner}"/></clipPath>
    </defs>
    ${shadow(256, 478, 120, 16)}
    <path d="${shield}" fill="url(#sg)" stroke="#a8730c" stroke-width="7" stroke-linejoin="round"/>
    <path d="${inner}" fill="url(#sb)" stroke="#4c6fd6" stroke-width="5"/>
    <g clip-path="url(#sc)">
      <path d="M100 60 L250 60 L120 300 L60 300Z" fill="#ffffff" opacity="0.28"/>
      <path d="M256 92 L256 420" stroke="#ffffff" stroke-width="5" opacity="0.35"/>
      <path d="M120 250 L392 250" stroke="#ffffff" stroke-width="5" opacity="0.25"/>
    </g>
    ${rivets.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff4c2" stroke="#b07a10" stroke-width="3"/>`).join("")}
    <path d="${starPath(256, 250, 92, 40)}" fill="url(#ss)" stroke="#c93a6c" stroke-width="6" stroke-linejoin="round"/>
    <path d="${starPath(256, 250, 50, 22)}" fill="#ffe3ee" opacity="0.9"/>
    <path d="M226 210 L252 196 L248 222Z" fill="#ffffff"/>
    ${sparkle(108, 72, 20)}${sparkle(420, 400, 16)}${sparkle(410, 60, 12, "#ffffff")}
  `);
}

export function countStar() {
  return svg(256, 256, `
    <defs>
      <linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="0.55" stop-color="#ffc62e"/><stop offset="1" stop-color="#f29a00"/></linearGradient>
      <linearGradient id="st2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbd0"/><stop offset="1" stop-color="#ffd84a"/></linearGradient>
    </defs>
    <path d="${starPath(128, 136, 112, 52)}" fill="#d98200" opacity="0.35" transform="translate(0 8)"/>
    <path d="${starPath(128, 132, 112, 52)}" fill="url(#st)" stroke="#d98200" stroke-width="8" stroke-linejoin="round"/>
    <path d="${starPath(128, 136, 62, 30)}" fill="url(#st2)" opacity="0.8"/>
    <ellipse cx="96" cy="86" rx="20" ry="11" fill="#ffffff" opacity="0.85" transform="rotate(-35 96 86)"/>
    <circle cx="108" cy="140" r="9" fill="#7a4a00"/><circle cx="148" cy="140" r="9" fill="#7a4a00"/>
    <circle cx="105" cy="137" r="3" fill="#ffffff"/><circle cx="145" cy="137" r="3" fill="#ffffff"/>
    <ellipse cx="94" cy="160" rx="10" ry="6" fill="#ff8a6a" opacity="0.6"/><ellipse cx="162" cy="160" rx="10" ry="6" fill="#ff8a6a" opacity="0.6"/>
    <path d="M118 160 q10 10 20 0" fill="none" stroke="#7a4a00" stroke-width="5" stroke-linecap="round"/>
  `);
}

export function gameFind() {
  return svg(256, 256, `
    <defs>
      <linearGradient id="cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe9f0"/></linearGradient>
      <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a86"/><stop offset="1" stop-color="#e35a42"/></linearGradient>
      <linearGradient id="hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc93c"/><stop offset="1" stop-color="#e5a100"/></linearGradient>
      <radialGradient id="lens" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9f1ff"/></radialGradient>
    </defs>
    <ellipse cx="128" cy="236" rx="80" ry="10" fill="#5a3a5e" opacity="0.15"/>
    <path d="M40 92 q-22 30 0 60" stroke="#9b7bff" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M18 76 q-34 46 0 92" stroke="#c7b6ff" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M168 176 L222 230" stroke="#b07a10" stroke-width="30" stroke-linecap="round"/>
    <path d="M168 176 L222 230" stroke="url(#hd)" stroke-width="22" stroke-linecap="round"/>
    <circle cx="124" cy="120" r="78" fill="url(#rim)" stroke="#c4462f" stroke-width="5"/>
    <circle cx="124" cy="120" r="60" fill="url(#lens)" stroke="#c4462f" stroke-width="4"/>
    <text x="124" y="150" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="88" fill="#3d8bff" stroke="#1e66d6" stroke-width="3">7</text>
    <path d="M86 84 a52 52 0 0 1 34 -20" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="${starPath(212, 44, 26, 11)}" fill="#ffc93c" stroke="#e5a100" stroke-width="4" stroke-linejoin="round"/>
    ${sparkle(230, 110, 12, "#ff8fb8")}
  `);
}

export const shopItemArt = {
  "cloud-cushion": cloudCushion,
  "flower-bouquet": flowerBouquet,
  "gem-necklace": gemNecklace,
  "magic-book": magicBook,
  "moon-lantern": moonLantern,
  "music-mic": musicMic,
  "ribbon-umbrella": ribbonUmbrella,
  "sparkle-shield": sparkleShield
};

// Home-screen icon: a smiling star over number beads, full-bleed so it also works as a maskable icon.
export function appIcon() {
  const beads = [["#ff8fab", 156], ["#7cc6ff", 256], ["#8ee08a", 356]]
    .map(([color, x]) => `
      <circle cx="${x}" cy="400" r="34" fill="${color}"/>
      <circle cx="${x - 10}" cy="388" r="10" fill="#fff" opacity="0.55"/>`)
    .join("");
  return svg(512, 512, `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffd3e2"/>
        <stop offset="1" stop-color="#ffe9b8"/>
      </linearGradient>
      ${gold("star")}
    </defs>
    <rect width="512" height="512" fill="url(#bg)"/>
    <circle cx="256" cy="230" r="150" fill="#fff" opacity="0.5"/>
    <rect x="110" y="392" width="292" height="16" rx="8" fill="#c98a6a" opacity="0.35"/>
    ${beads}
    <path d="${starPath(256, 222, 132, 62)}" fill="url(#star)" stroke="#e0a21c" stroke-width="10" stroke-linejoin="round"/>
    <circle cx="222" cy="220" r="12" fill="#5a3a5e"/>
    <circle cx="290" cy="220" r="12" fill="#5a3a5e"/>
    <circle cx="226" cy="215" r="4" fill="#fff"/>
    <circle cx="294" cy="215" r="4" fill="#fff"/>
    <path d="M232 250 Q256 272 280 250" fill="none" stroke="#5a3a5e" stroke-width="9" stroke-linecap="round"/>
    <circle cx="200" cy="248" r="13" fill="#ff8fab" opacity="0.6"/>
    <circle cx="312" cy="248" r="13" fill="#ff8fab" opacity="0.6"/>
    ${sparkle(118, 120, 22)}
    ${sparkle(400, 104, 16)}
    ${sparkle(414, 300, 12, "#ffffff")}`);
}
