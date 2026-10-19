#!/usr/bin/env python3
"""Record every phrase the app speaks with an open-source Korean voice.

Uses MeloTTS (MIT licence, https://github.com/myshell-ai/MeloTTS) with its Korean
speaker and writes public/voice/clips/*.mp3 plus public/voice/manifest.json. The app
plays these clips on any device (and offline); anything missing falls back to the
device's own voice.

Setup, once (Python 3.10 works best with MeloTTS's pinned PyTorch):
    pip install -r scripts/voice/requirements.txt
    python -m unidic download

Then:
    node scripts/voice/build-catalog.mjs     # list every phrase
    python scripts/voice/generate.py         # record what is not recorded yet

Network access needed while generating: pypi.org, download.pytorch.org,
huggingface.co (Korean BERT), myshell-public-repo-hosting.s3.amazonaws.com (voice
weights). Or run the "Generate voice pack" GitHub Action, which does all of this.
"""
import argparse
import hashlib
import json
import pathlib
import sys

import lameenc
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2]
PHRASES = ROOT / "scripts" / "voice" / "phrases.json"
OUT = ROOT / "public" / "voice"


def clip_path(text: str) -> str:
    return "clips/" + hashlib.sha1(text.encode("utf-8")).hexdigest()[:12] + ".mp3"


def tidy(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    """Trim silence at both ends (keeping a short pad) and normalise the peak."""
    level = np.abs(audio)
    threshold = max(level.max() * 0.02, 1e-4)
    loud = np.where(level > threshold)[0]
    if loud.size:
        pad = int(sample_rate * 0.04)
        audio = audio[max(0, loud[0] - pad): loud[-1] + pad]
    peak = np.abs(audio).max() or 1.0
    return audio * (0.89 / peak)


def to_mp3(audio: np.ndarray, sample_rate: int, kbps: int) -> bytes:
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes()
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(kbps)
    encoder.set_in_sample_rate(sample_rate)
    encoder.set_channels(1)
    encoder.set_quality(2)
    return encoder.encode(pcm) + encoder.flush()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--speed", type=float, default=0.92, help="speaking speed (1.0 = model default)")
    parser.add_argument("--device", default="auto", help="cpu, cuda, mps or auto")
    parser.add_argument("--kbps", type=int, default=48, help="mp3 bit rate")
    parser.add_argument("--force", action="store_true", help="re-record clips that already exist")
    parser.add_argument("--limit", type=int, default=0, help="only record the first N phrases (for a quick try)")
    args = parser.parse_args()

    from melo.api import TTS  # imported late so --help works without MeloTTS

    phrases = json.loads(PHRASES.read_text(encoding="utf-8"))
    if args.limit:
        phrases = phrases[: args.limit]

    model = TTS(language="KR", device=args.device)
    speaker = model.hps.data.spk2id["KR"]
    sample_rate = model.hps.data.sampling_rate

    (OUT / "clips").mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / "manifest.json"
    clips = {}
    if manifest_path.exists() and not args.force:
        clips = json.loads(manifest_path.read_text(encoding="utf-8")).get("clips", {})

    for index, text in enumerate(phrases, 1):
        relative = clip_path(text)
        target = OUT / relative
        if target.exists() and not args.force:
            clips[text] = relative
            continue
        audio = model.tts_to_file(text, speaker, None, speed=args.speed, quiet=True)
        target.write_bytes(to_mp3(tidy(np.asarray(audio, dtype=np.float32), sample_rate), sample_rate, args.kbps))
        clips[text] = relative
        print(f"[{index}/{len(phrases)}] {text}", flush=True)

    # Drop clips for phrases the app no longer says.
    wanted = set(json.loads(PHRASES.read_text(encoding="utf-8")))
    clips = {text: path for text, path in clips.items() if text in wanted}
    manifest = {"version": 1, "model": "MeloTTS 한국어 (MIT)", "clips": dict(sorted(clips.items()))}
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if not args.limit:
        keep = set(clips.values())
        for old in (OUT / "clips").glob("*.mp3"):
            if f"clips/{old.name}" not in keep:
                old.unlink()
    print(f"{len(clips)} clips → {manifest_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
