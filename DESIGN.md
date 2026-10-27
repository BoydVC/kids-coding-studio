# DESIGN.md — Kids Coding Studio

## Spark

Bookmark: [Inkwright announcement by @tinkerersanky](https://x.com/tinkerersanky/status/2114621309070262406)

> I’m building Inkwright: a coding studio where 9–13 year olds learn logic, AI, robotics, music and art by building their own stories with blocks.

Follow-on safety posts from the same thread (mirrored in public mirrors): AI off until a parent turns it on; on-device classifiers; every AI reply moderated; adversarial prompt battery.

This project is a **Boyd-household, local TokenMax build** shaped by that product idea — not a clone of Inkwright’s code or brand assets. We borrow the *studio + stories + multi-domain + parent-gated AI* shape and ground it in Char (~13) and Vic (~11).

## Who it is for

| Person | Role in product |
|---|---|
| Charlotte | Primary story / music / branch builder |
| Victor | Primary robot-sim / comic / pixel-art builder |
| Boyd & Miranda | Parent overview, AI gate, session glance |

## Who it is *not*

- **Not Char Tutor / Vic Tutor.** Those bots help with schoolwork, grades, and homework loops. This app never opens PowerSchool, never assigns worksheets, never grades essays. It is a *creative studio*.
- **Not an open chatbot.** Kids arrange blocks and craft prompts locally. There is no stranger chat and no outbound model call unless a parent later wires one (default: off).
- **Not a full Scratch/Blockly port.** Sequence lanes + typed block cards keep the build shippable on stdlib while still feeling like a studio floor, not a gradebook.

## Design principles

1. **Stories are the vehicle.** Domains (logic, art, music, robotics, AI craft) show up as blocks inside a narrative — Resnick’s Projects / Passion / Play, not drills.
2. **Two shelves, one house.** Char and Vic never share a project list. Parent overview reads both.
3. **Low floor, honest ceiling.** Vic can finish a three-panel comic; Char can add music cues and a third branch.
4. **Safety is a product surface.** Ask-a-Parent is one click away. Personal-data patterns fail closed. AI helper defaults off. Portable controls from Agent Brief Forge **brief-006** (craft≠companion; filters are layer-0; on-device before cloud) live in SAFETY.md + Parent overview — not legal advice.
5. **Warm studio, not purple neon SaaS.** Cream paper (`#fff8ef`), coral accent (`#e4572e`), teal secondary (`#2a9d8f`), Nunito, colored block chips, dashed lane tape, Play Story readout.

## Information architecture

```
Home → Kid shelf → Studio (tray | lanes | inspector)
     → Briefs library → start project for Char or Vic
     → Parent overview → AI toggle + per-kid glance
```

### Studio lanes

| Lane | Purpose |
|---|---|
| Setup | WHEN / SHOW / opening SAY |
| Path A | Main branch or choice 1 |
| Path B | Alternate branch or choice 2 |
| Wrap | END, sting, moral |

This is deliberately closer to interactive-fiction beats than to a free-canvas Blockly workspace — easier to parent-read, easier to demo.

## Block vocabulary

`WHEN · DO · IF · CHOICE · SAY · SHOW · PLAY · MOVE · ASK_AI · END`

- **SHOW / PLAY / MOVE** carry art, music, robotics-sim without extra apps.
- **ASK_AI** is prompt-craft literacy; blocked until parent enables; always locally safety-checked.
- **CHOICE + IF** teach branching without text syntax.

## Demo projects (preloaded)

1. **Char — Starlight Door** (`char-starlight`): two-door adventure with a chime on the silver path and a riddle on the oak path.
2. **Vic — Pixel Pet Fetch** (`vic-robot-pet`): hungry pet → eat → fetch ball → happy dance on a room grid.

## Success for a session

Kid opens shelf → plays demo or starts a brief → adds/edits ≥1 block → Play Story → Save → Parent overview shows updated session.

## Out of scope (v1)

- Real robot hardware, MIDI devices, cloud LLMs
- Accounts, internet multiplayer, marketplace publishing
- Replacing tutor bots or school portals
