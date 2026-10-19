// Plays pre-recorded speech clips (public/voice) made with an open-source TTS model,
// so the voice sounds the same on every device and works offline.
import { splitSpeech } from "./speech";

export const PACK_VOICE = "voice-pack";

// Recorded at normal speed; slow/fast use pitch-preserving playback rate.
const packRates = { slow: 0.85, normal: 1, fast: 1.18 };

let manifest = null;
let audio = null;
let queue = [];
let current = null;

function base() {
  return `${import.meta.env.BASE_URL ?? "./"}voice/`;
}

export async function loadVoicePack() {
  try {
    const response = await fetch(`${base()}manifest.json`, { cache: "no-cache" });
    if (!response.ok) return null;
    const data = await response.json();
    manifest = data?.clips ? data : null;
  } catch {
    manifest = null;
  }
  return manifest;
}

export function voicePackInfo() {
  return manifest ? { model: manifest.model, count: Object.keys(manifest.clips).length } : null;
}

export function packCovers(text) {
  if (!manifest || !text) return false;
  return splitSpeech(text).every((part) => manifest.clips[part]);
}

function player() {
  if (!audio && typeof Audio !== "undefined") {
    audio = new Audio();
    audio.preload = "auto";
  }
  return audio;
}

// iOS only lets an audio element play from a timer after it has played once
// inside a tap, so the first tap anywhere plays a silent moment.
export function unlockVoicePack() {
  const element = player();
  if (!element || element.dataset.unlocked) return;
  element.dataset.unlocked = "1";
  element.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
  element.play().catch(() => {});
}

export function stopVoicePack() {
  queue = [];
  if (current) current.onEnd?.();
  current = null;
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
  }
}

export function playVoicePack(text, { rate = "normal", onStart, onEnd } = {}) {
  stopVoicePack();
  const element = player();
  if (!element) return;
  queue = splitSpeech(text).map((part) => `${base()}${manifest.clips[part]}`);
  const job = { onEnd };
  current = job;
  let started = false;

  const next = () => {
    if (current !== job) return;
    const src = queue.shift();
    if (!src) {
      current = null;
      onEnd?.();
      return;
    }
    element.src = src;
    element.playbackRate = packRates[rate] ?? 1;
    element.preservesPitch = true;
    element.onended = next;
    element.onerror = next;
    element.play().then(() => {
      if (!started) {
        started = true;
        onStart?.();
      }
    }).catch(next);
  };
  next();
}
