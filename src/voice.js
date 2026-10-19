import { useEffect, useState } from "react";
import { PACK_VOICE, packCovers, playVoicePack, stopVoicePack } from "./voicePack";

// Higher score = more natural sounding. Downloaded "Premium/Enhanced" voices on
// iPad and "Natural/Online" voices on Edge are far better than the default ones.
function voiceScore(voice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (name.includes("premium") || name.includes("고품질")) score += 60;
  if (name.includes("enhanced") || name.includes("향상")) score += 45;
  if (name.includes("natural") || name.includes("neural")) score += 50;
  if (name.includes("online")) score += 20;
  if (name.includes("siri")) score += 40;
  if (name.includes("google")) score += 25;
  if (name.includes("yuna") || name.includes("유나")) score += 8;
  if (name.includes("sunhi") || name.includes("선희")) score += 6;
  if (name.includes("compact")) score -= 10;
  if (voice.localService) score += 2;
  return score;
}

export function qualityLabel(voice) {
  const score = voiceScore(voice);
  if (score >= 40) return "고음질";
  if (score >= 20) return "좋음";
  return "기본";
}

function hasSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function koreanVoices() {
  if (!hasSpeech()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang?.toLowerCase().replace("_", "-").startsWith("ko"))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

export function resolveVoice(voiceURI) {
  const voices = koreanVoices();
  if (voiceURI === PACK_VOICE) return voices[0] ?? null;
  return voices.find((voice) => voice.voiceURI === voiceURI) ?? voices[0] ?? null;
}

export function useKoreanVoices() {
  const [voices, setVoices] = useState(koreanVoices);
  useEffect(() => {
    if (!hasSpeech()) return undefined;
    const refresh = () => setVoices(koreanVoices());
    refresh();
    window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
    // Safari sometimes fills the list late without firing the event.
    const timer = window.setTimeout(refresh, 800);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", refresh);
      window.clearTimeout(timer);
    };
  }, []);
  return voices;
}

export const speechRates = {
  slow: 0.72,
  normal: 0.88,
  fast: 1.02
};

// The recorded voice pack is used when chosen (or by default when it exists) and it
// has every piece of the sentence; anything else falls back to the device voice.
export function speak(text, { voiceURI, rate = "normal", onStart, onEnd } = {}) {
  if (!text) return;
  const wantsPack = voiceURI === PACK_VOICE || !voiceURI;
  if (wantsPack && packCovers(text)) {
    if (hasSpeech()) window.speechSynthesis.cancel();
    playVoicePack(text, { rate, onStart, onEnd });
    return;
  }
  stopVoicePack();
  if (!hasSpeech()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = resolveVoice(voiceURI);
  utterance.lang = voice?.lang ?? "ko-KR";
  if (voice) utterance.voice = voice;
  utterance.rate = speechRates[rate] ?? speechRates.normal;
  utterance.pitch = 1.08;
  utterance.volume = 1;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  stopVoicePack();
  if (hasSpeech()) window.speechSynthesis.cancel();
}
