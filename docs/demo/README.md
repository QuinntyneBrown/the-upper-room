# The Upper Room — demo video

A narrated, one-take walkthrough recorded against the real backend (no mocked product responses).

| Item | Value |
|------|-------|
| Video | `the-upper-room.webm` (VP8 + Opus, 1280×720, ~60 s, ~2.2 MB) |
| Poster | `the-upper-room-poster.png` |
| Narration | `the-upper-room-narration.md` (voice `en-US-AndrewMultilingualNeural`) |
| Lexicon | `pronunciations.json` |

## Chapters

1. **Sign in** — wrong password is rejected, then `admin@test.local` signs in through the PKCE flow and lands on the dashboard.
2. **Contacts** — open from the navigation drawer, search, create a contact.
3. **Events** — open from the drawer, create an event with **New event**.

## Re-record

```powershell
# backend (port 5255) and frontend (port 4300) running; seeded admin: admin@test.local / UpperRoomDev!42
python e2e/demo/synthesize.py                                  # clips + .demo-work/chapters.json
cd e2e; npx playwright test -c demo/playwright.demo.config.ts  # one take -> .demo-work/pw/**/video.webm
```

Then mux with ffmpeg: delay each `chapter-N.mp3` by the chapter start in `.demo-work/starts.json` (`adelay`), `amix`, and encode with `-c:v copy -c:a libopus`. The recording creates a contact and an event in the dev database.
