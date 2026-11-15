// Plays pre-recorded speech clips (public/voice) made with an open-source TTS model,
// so the voice sounds the same on every device and works offline.
import { splitSpeech } from "./speech";

export const PACK_VOICE = "voice-pack";

// Recorded at normal speed; slow/fast use pitch-preserving playback rate.
const packRates = { slow: 0.85, normal: 1, fast: 1.18 };
// A clip that is not ready by then is spoken by the device voice instead of staying silent.
const LOAD_TIMEOUT_MS = 2500;
const MAX_LOADED = 600;
// A twentieth of a second of silence, used to unlock playback inside a tap.
const SILENCE = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

let manifest = null;
let audio = null;
let current = null; // the sentence being loaded or played
let unlocked = false;
let unlocking = null;
// Clips are downloaded whole and kept in memory, so a sentence plays without waiting
// on the network between its pieces. Map order doubles as least-recently-used order.
const loaded = new Map();

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

function loadClip(part) {
  const url = `${base()}${manifest.clips[part]}`;
  let clip = loaded.get(url);
  if (clip) {
    loaded.delete(url);
    loaded.set(url, clip);
    return clip;
  }
  clip = fetch(url).then(async (response) => {
    if (!response.ok) throw new Error(`voice clip ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob.type.startsWith("audio/") ? blob : new Blob([blob], { type: "audio/mpeg" }));
  });
  // A failed download is forgotten so the next attempt can try again.
  clip.catch(() => loaded.delete(url));
  loaded.set(url, clip);
  if (loaded.size > MAX_LOADED) {
    const [oldest, old] = loaded.entries().next().value;
    loaded.delete(oldest);
    old.then((objectUrl) => URL.revokeObjectURL(objectUrl)).catch(() => {});
  }
  return clip;
}

// Downloads the clips for sentences that are about to be spoken.
export function prepareVoicePack(texts) {
  for (const text of [].concat(texts)) {
    if (packCovers(text)) splitSpeech(text).forEach((part) => loadClip(part).catch(() => {}));
  }
}

function player() {
  if (!audio && typeof Audio !== "undefined") {
    audio = new Audio();
    audio.preload = "auto";
  }
  return audio;
}

// Browsers only let an audio element play from a timer after it has played once inside
// a tap. Called on every tap until it has worked; a touch only counts once the finger lifts.
export function unlockVoicePack() {
  const element = player();
  if (!element || unlocked || unlocking) return;
  // A sentence already on the audio element must not be cut off by the silent clip.
  if (current?.started) {
    if (current.playing) unlocked = true;
    return;
  }
  element.src = SILENCE;
  unlocking = element.play()
    .then(() => {
      unlocked = true;
    })
    .catch(() => {})
    .finally(() => {
      unlocking = null;
    });
}

export function stopVoicePack() {
  const job = current;
  current = null;
  if (job) job.onEnd?.();
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    if (!unlocking) audio.pause();
  }
}

// Plays the sentence piece by piece. `onFail` is called instead of `onEnd` when the
// clips cannot be loaded or played, so the caller can fall back to the device voice.
export function playVoicePack(text, { rate = "normal", onStart, onEnd, onFail } = {}) {
  stopVoicePack();
  const element = player();
  if (!element) {
    onFail?.();
    return;
  }
  const job = { onEnd, started: false, playing: false };
  current = job;
  const fail = () => {
    if (current !== job) return;
    current = null;
    element.onended = null;
    element.onerror = null;
    onFail?.();
  };

  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("voice clips timed out")), LOAD_TIMEOUT_MS));
  Promise.race([Promise.all(splitSpeech(text).map(loadClip)), timeout])
    .then(async (urls) => {
      if (unlocking) await unlocking;
      if (current !== job) return;
      let index = 0;
      const next = () => {
        if (current !== job) return;
        if (index >= urls.length) {
          current = null;
          element.onended = null;
          element.onerror = null;
          onEnd?.();
          return;
        }
        const piece = index;
        index += 1;
        job.started = true;
        // Whichever of "ended", "error" or a rejected play() comes first moves on, once.
        const once = (callback) => () => {
          if (current === job && index === piece + 1) callback();
        };
        element.onended = once(next);
        element.onerror = once(fail);
        element.src = urls[piece];
        // Safari resets the rate when the source changes unless the default is set too.
        element.defaultPlaybackRate = packRates[rate] ?? 1;
        element.playbackRate = packRates[rate] ?? 1;
        element.preservesPitch = true;
        element.play().then(() => {
          if (current !== job) return;
          unlocked = true;
          if (!job.playing) {
            job.playing = true;
            onStart?.();
          }
        }).catch(once(fail));
      };
      next();
    })
    .catch(fail);
}
