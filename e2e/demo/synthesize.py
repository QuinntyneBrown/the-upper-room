"""Synthesises one narration clip per chapter and writes chapters.json (durations in ms)."""
import asyncio, json, re, subprocess, sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[2]
DEMO = ROOT / "docs" / "demo"
WORK = ROOT / ".demo-work"
VOICE = "en-US-AndrewMultilingualNeural"


def chapters():
    text = (DEMO / "the-upper-room-narration.md").read_text(encoding="utf-8")
    lex = json.loads((DEMO / "pronunciations.json").read_text(encoding="utf-8"))
    parts = re.split(r"^## (.+)$", text, flags=re.M)[1:]
    for i in range(0, len(parts), 2):
        body = parts[i + 1].strip()
        for k, v in lex.items():
            body = body.replace(k, v)
        yield parts[i].strip(), body


def duration_ms(path: Path) -> int:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        text=True,
    )
    return int(float(out.strip()) * 1000)


async def main():
    WORK.mkdir(exist_ok=True)
    result = []
    for n, (title, body) in enumerate(chapters(), 1):
        mp3 = WORK / f"chapter-{n}.mp3"
        await edge_tts.Communicate(body, VOICE).save(str(mp3))
        result.append({"n": n, "title": title, "audio": mp3.name, "ms": duration_ms(mp3)})
    (WORK / "chapters.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


asyncio.run(main())
