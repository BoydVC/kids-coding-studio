# RESEARCH.md — Kids Coding Studio

Public references that shaped the Boyd household Kids Coding Studio (Inkwright-shaped, ages ~9–13). Compiled Mon Oct 26, 2026 (America/New_York). All links are public; this file is not legal advice.

## 1. Why this product exists

Boyd bookmarked [@tinkerersanky’s Inkwright post](https://x.com/tinkerersanky/status/2114621309070262406): a coding studio where **9–13 year olds learn logic, AI, robotics, music and art by building their own stories with blocks**. Mirror summaries of the same thread emphasize parent-gated AI, on-device classifiers, and adversarial prompt testing before a child sees model output.

Jim · Interests (burn-night snapshot Oct 20–26) ranked a **kids coding studio bot** as one of three ambitious TokenMax builds for Char (~13) and Vic (~11), distinct from tutor bots.

This research desk answers three design questions:

1. Does block-based learning actually help middle-schoolers?
2. Why lead with *stories* instead of drills?
3. What makes kid-facing AI tools safer?

## 2. Block-based learning in middle school

### 2.1 Meta-analytic signal

Yu, Yu, and Li (2025), *Effects of Block-Based Visual Programming on K-12 Students’ Learning Outcomes*, Journal of Educational Computing Research (online 2024-10-29; issue March 2025):

- First meta-analysis of block-based visual programming (BVP) across 29 independent experiments (42 effect sizes, 2000–2023).
- Overall learning effect: **SMD = 0.769** (upper-medium), 95% CI [0.554, 0.984].
- Effects larger for **junior high**, **novices**, tools like **Scratch / ScratchJr / Alice / App Inventor**, and **project-based / game-based** pedagogies.
- Link: https://journals.sagepub.com/doi/10.1177/07356331241293163

Implication for us: Char (8th) and Vic (6th) sit in the band where BVP shows stronger effects, especially when the unit of work is a *project*, not a worksheet.

### 2.2 Scratch + game design in middle school

Action research with Code.org-style block curriculum (Education and Information Technologies, published 2024-09-17), *Computational thinking with game design: An action research study with middle school students*:

- Mixed-methods; pre/post on CT skills.
- Statistically significant gains in **algorithmic thinking, debugging, and pattern recognition**; abstraction gains not significant.
- Attitudes improved directionally; qualitative themes stressed **game-based learning**, **collaboration for debugging**, and a balance of **structure + creative freedom**.
- DOI: https://doi.org/10.1007/s10639-024-13010-5

A 2025 quasi-experiment (*Enhancing Logic and Algorithm Learning Outcomes through Game-Based Learning with Scratch*, Informatics Education and Learning Technologies) with **108 seventh graders**:

- GBL-Scratch experimental group mean 75.70 → 84.11 vs teacher-centered 59.26 → 65.74 (p < 0.05).
- USE questionnaire showed usefulness / ease / ease-of-learning driving satisfaction.
- Link: https://doi.org/10.23917/ieltech.16290

Pan et al. (2024), *Enhancing middle school students’ computational thinking competency through game-based learning*, ETR&D:

- Open-access development article on CT competency, self-efficacy, and engagement in gameplay.
- Notes block-based environments (e.g. Scratch) as established CT platforms alongside robotics and game-based learning.
- Link: https://link.springer.com/article/10.1007/s11423-024-10400-x

Secondary-school PBL + Scratch (Journal of Systems and Software, 2025) with 52 seventh graders found PBL improved CT skills and that instructor-selected teams produced more qualified projects even when self-selected teams felt higher cohesion — useful reminder that **light structure around creative work** helps.

- ACM: https://dl.acm.org/doi/10.1016/j.jss.2025.112535

### 2.3 Takeaway for Kids Coding Studio

- Prefer **project briefs with checklists** over open void.
- Keep a **low floor** (Vic’s three-panel comic) and a **honest ceiling** (Char’s branched + scored story).
- Treat debugging as social/parent-visible (“Play Story” readout), not a hidden stack trace.

## 3. Story-driven coding

### 3.1 Constructionism and Scratch’s Four P’s

Mitchel Resnick, *Give P’s a Chance: Projects, Peers, Passion, Play* (Constructionism 2014):

- Scratch designed so kids create **interactive stories, games, animations** — media-centric on purpose.
- Four P’s: Projects, Peers, Passion, Play — aligned with Papert’s constructionism.
- PDF: https://web.media.mit.edu/~mres/papers/constructionism-2014.pdf

Brennan & Resnick (2012), *New frameworks for studying and assessing the development of computational thinking* (MIT Media Lab):

- CT as **concepts, practices, perspectives** emerging from designing interactive media in Scratch.
- Assessment via portfolios, artifact interviews, design scenarios — not multiple-choice only.
- https://www.media.mit.edu/publications/new-frameworks-for-studying-and-assessing-the-development-of-computational-thinking/

Resnick, *Mother’s Day, Warrior Cats, and Digital Fluency* — stories from the Scratch community arguing kids must **write** with digital media, not only “read”/consume:

- https://web.media.mit.edu/~mres/papers/mothers-day-warrior-cats.pdf

Related: *From storytelling to story making* (MIT Media Lab) on children creating stories with tangible computational media — storytelling as making, not only narration.

- https://www.media.mit.edu/publications/from-storytelling-to-story-making-children-creating-stories-with-tangible-computational-media/

### 3.2 Contemporary story-coding products (market context)

These are references for *shape*, not dependencies:

- **TheCodeTale** — story-driven blocks → Python/AI for ages 6–14; claims CSTA alignment. https://www.thecodetale.com/
- **CodeMonkey Coding Adventure** — story challenges, ages ~8–12, text-based path after blocks. https://www.codemonkey.com/courses/coding-adventure/
- **Black Rocket — Code Your Own Adventure** — branching interactive stories, ages 8–11 and 11–14. https://blackrocket.com/course/code-your-own/
- **Python Quest** — age-banded story quests (Explorer / Adventurer / Hacker). https://pythonquestkids.com/learn

### 3.3 Takeaway

Leading with **story branches + panels** matches both the Inkwright spark and decades of Scratch research: kids persist when the artifact is personally meaningful. Our lanes (Setup / Path A / Path B / Wrap) are a lightweight interactive-fiction scaffold on that tradition.

## 4. What makes kid AI tools safer

### 4.1 Regulatory / standards baselines (U.S. + UK + UNICEF)

**COPPA (U.S.)** — 16 CFR Part 312; FTC six-step compliance plan:

- Operators of child-directed services (or with actual knowledge of child users) must give notice, obtain verifiable parental consent before collecting personal information, allow parental review/deletion, minimize data, and protect confidentiality.
- https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312

**ICO Age Appropriate Design Code (UK “Children’s Code”)**:

- High-privacy defaults; data minimization; geolocation off by default; children’s data not usually shared.
- https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/

**UNICEF Innocenti — Guidance on AI and Children (v3) checklist**:

- Safety across the AI lifecycle; transparency that the child is talking to an AI; avoid anthropomorphism; age-appropriate language; child-rights impact thinking.
- https://www.unicef.org/innocenti/media/11996/file/UNICEF-Innocenti-Guidance-on-AI-

**ITU / partners Joint Statement on AI and the Rights of the Child (2025)**:

- Prevent AI-enabled exploitation and harmful content; privacy-by-design; caution on AI that mimics human interaction and fosters unhealthy attachment; human oversight.
- https://www.itu.int/dms_pub/itu-d/opb/str/D-STR-CYB_JOINT-2025-PDF-E.pdf

### 4.2 Product patterns we copied into SAFETY.md

| Pattern | Source spirit | Studio behavior |
|---|---|---|
| Parental gate for AI | Inkwright thread; COPPA consent vibe | AI helper default OFF; Parent page toggle |
| No personal data fishing | COPPA minimize; ICO high privacy | Regex fail-closed on identity probes |
| Disclose “this is a tool” | UNICEF transparency | ASK_AI labeled as local craft; no pretend friend |
| Escape hatch | Child-rights practice | Persistent **Ask a Parent** control |
| Local-first | Data minimization | `127.0.0.1` only; no third-party scripts |

### 4.3 Adversarial mindset

Inkwright’s public notes claim a **50-prompt adversarial battery** before child-visible replies. Our v1 equivalent is narrower but real: server-side `safety_check` on every save, client-side check button, and smoke tests that assert personal asks fail while story craft passes.

## 5. How this differs from tutor bots (research framing)

Homework tutors optimize for **curriculum coverage and feedback loops**. Studio tools optimize for **expressive projects and CT perspectives** (Brennan & Resnick). Mixing them confuses the kid (“am I being graded?”) and the parent (“is this school?”).

Therefore Kids Coding Studio:

- Never claims standards grades or PowerSchool hooks.
- Shows **parent blurbs** on briefs instead of rubrics.
- Measures session success as **blocks played + checklist ticks**, not quiz scores.

## 6. Design decisions locked from the literature

1. **Blocks + projects + stories** — Yu et al. moderators; Resnick Four P’s.
2. **Middle-school age band** — strongest BVP effects in junior high / novices.
3. **Light structure (briefs, lanes, checklists)** — mirrors PBL findings that structure raises artifact quality.
4. **Parent-visible shelf** — supports Peers/Passion at household scale without opening a public social network (avoids COPPA social-graph complexity).
5. **AI as craft, not companion** — UNICEF / ITU caution on attachment; Inkwright parent gate.

## 7. Open questions for a later pass

- Should Play Story gain a tiny on-canvas stage (sprites) or stay textual for parent skim?
- When/if a local model is wired, reuse the same safety_check and keep cloud off by default.
- Multiplayer remix between Char and Vic (Peers) without creating an internet community.

## 8. Citation list (compact)

1. Yu, Yu, Li (2025) — BVP meta-analysis — https://journals.sagepub.com/doi/10.1177/07356331241293163
2. CT + game design middle school (2024) — https://doi.org/10.1007/s10639-024-13010-5
3. Scratch GBL quasi-experiment (2025) — https://doi.org/10.23917/ieltech.16290
4. Pan et al. ETR&D GBL CT (2024) — https://link.springer.com/article/10.1007/s11423-024-10400-x
5. PBL Scratch JSS (2025) — https://dl.acm.org/doi/10.1016/j.jss.2025.112535
6. Resnick Four P’s (2014) — https://web.media.mit.edu/~mres/papers/constructionism-2014.pdf
7. Brennan & Resnick CT frameworks (2012) — https://www.media.mit.edu/publications/new-frameworks-for-studying-and-assessing-the-development-of-computational-thinking/
8. Resnick digital fluency stories — https://web.media.mit.edu/~mres/papers/mothers-day-warrior-cats.pdf
9. Storytelling → story making (MIT) — https://www.media.mit.edu/publications/from-storytelling-to-story-making-children-creating-stories-with-tangible-computational-media/
10. FTC COPPA plan — https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
11. eCFR 16 CFR 312 — https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312
12. ICO Children’s Code — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
13. UNICEF AI & Children checklist — https://www.unicef.org/innocenti/media/11996/file/UNICEF-Innocenti-Guidance-on-AI-
14. ITU Joint Statement AI & Rights of the Child (2025) — https://www.itu.int/dms_pub/itu-d/opb/str/D-STR-CYB_JOINT-2025-PDF-E.pdf
15. Inkwright spark post — https://x.com/tinkerersanky/status/2114621309070262406
16. TheCodeTale — https://www.thecodetale.com/
17. CodeMonkey Coding Adventure — https://www.codemonkey.com/courses/coding-adventure/
18. Black Rocket adventure coding — https://blackrocket.com/course/code-your-own/

## 9. Bottom line

Block-based, story-first studios are on solid empirical ground for Char and Vic’s ages. Safety for kid AI is mostly about **defaults, minimization, disclosure, and parent agency** — not about bolting a chatbot onto a worksheet. Kids Coding Studio ships as a local studio that respects that research and stays out of the tutor-bots’ lane.
