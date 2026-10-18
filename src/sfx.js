// Tiny synthesized sound effects (no audio files needed).
let context = null;
let enabled = true;

function audio() {
  if (!enabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) context = new AudioContextClass();
  if (context.state === "suspended") context.resume();
  return context;
}

function tone(frequency, { at = 0, duration = 0.14, type = "sine", gain = 0.16, slideTo } = {}) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + at;
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

export const sfx = {
  setEnabled(value) {
    enabled = value;
  },
  tap() {
    tone(660, { duration: 0.07, type: "triangle", gain: 0.1 });
  },
  pop() {
    tone(520, { duration: 0.13, slideTo: 900, gain: 0.14 });
  },
  count(step) {
    tone(392 * 2 ** (((step - 1) * 2) / 12), { duration: 0.18, type: "triangle", gain: 0.15 });
  },
  flip() {
    tone(440, { duration: 0.09, type: "triangle", slideTo: 700, gain: 0.09 });
  },
  correct() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      tone(frequency, { at: index * 0.09, duration: 0.24, type: "triangle", gain: 0.15 });
    });
  },
  wrong() {
    tone(330, { duration: 0.18, type: "square", gain: 0.05, slideTo: 250 });
    tone(247, { at: 0.16, duration: 0.26, type: "square", gain: 0.05, slideTo: 196 });
  },
  coin() {
    tone(988, { duration: 0.07, type: "square", gain: 0.035 });
    tone(1319, { at: 0.06, duration: 0.16, type: "square", gain: 0.035 });
  },
  buy() {
    [784, 988, 1175, 1568].forEach((frequency, index) => {
      tone(frequency, { at: index * 0.07, duration: 0.18, type: "triangle", gain: 0.13 });
    });
  }
};
