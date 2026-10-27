# Kids Coding Studio

Inkwright-shaped creative coding studio for **Charlotte Boyd (~13, 8th)** and **Victor Boyd (~11, 6th)**. They learn logic, AI prompt craft, robotics sims, music, and art by building their own stories with blocks — **not** a homework tutor clone (Char Tutor / Vic Tutor stay separate).

Inspired by [@tinkerersanky on Inkwright](https://x.com/tinkerersanky/status/2114621309070262406): *a coding studio where 9–13 year olds learn logic, AI, robotics, music and art by building their own stories with blocks.*

## 2-minute how-to (Boyd)

1. From this folder: `./run.sh`
2. Open **http://127.0.0.1:4331/** in a browser on the box / tunnel you use.
3. Pick **Char** or **Vic** → open the preloaded demo (`Starlight Door` / `Pixel Pet Fetch`) or hit **Briefs**.
4. In the studio: click chips in the **Block tray**, drag between Setup / Path A / Path B / Wrap, edit lines in the inspector, **Play Story**, then **Save**.
5. Open **Parent** for both kids’ active project, last session, and suggested next. AI helper stays **off** until you enable it there.

Smoke: `./run.sh test`

Stop: `./run.sh stop`

## What you get

| Piece | Detail |
|---|---|
| Port | `127.0.0.1:4331` |
| Profiles | Char + Vic, separate shelves |
| Briefs | 10 starters (logic, story, art, music, robotics, AI) |
| Builder | Structured cards + sequence lanes (studio feel, not a spreadsheet) |
| Parent page | `#/parent` overview |
| Safety | Local filters, no external chat, Ask-a-Parent escape — see `SAFETY.md` |
| Demos | `char-starlight`, `vic-robot-pet` preloaded |

## Layout

```
kids-coding-studio/
  run.sh              start / stop / test
  server.py           stdlib HTTP + JSON API
  README.md DESIGN.md SAFETY.md RESEARCH.md
  data/state.json     profiles, briefs, projects
  data/briefs.json    brief library (source)
  data/demos/         polished demo snapshots
  web/                index.html · app.css · app.js
  tests/smoke_test.py
```

## API (local)

- `GET /healthz` — liveness
- `GET /api/state` — full state
- `GET /api/briefs` · `/api/parent/overview` · `/api/kids/{char|vic}/projects`
- `POST /api/safety/check` · `/api/projects/save` · `/api/projects/new` · `/api/session/touch` · `/api/parent/ai-toggle`

## Notes

- Python 3 stdlib only. No cloud agents. No kpdlawgroup. No on-demand.
- Data persists in `data/state.json` on the shared box.
- See `DESIGN.md` for product framing vs tutor bots; `RESEARCH.md` for citations.
