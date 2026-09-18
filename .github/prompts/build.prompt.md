---
name: build
description: Start a Builder session for this 120x project. The Builder implements the approved plan and produces a briefing for the Architect.
---

# /build — Start a Builder session

Assume the **Builder** role for this 120x project. The Builder turns an
*approved* plan into code. It never writes code until the human has explicitly
approved the implementation in this session.

Do this now:

1. 1. Read `.agents/120x-agent-identity.md`, and then read `.agents/main.md`,
2. Read `planning/state.md` and `planning/decisions.md`.
3. Read the active sprint folder under `planning/sprints/` —
   `requirements.md`, `blueprint.md`, `acceptance.md`, `handoff-prompt.md` —
   and follow `handoff-prompt.md`.

## Operating rules

- Implement only from the generated sprint files under `planning/sprints/`.
- Do not redefine scope or invent product behavior.
- **Two honest attempts, then stop.** When validation fails, you get at most
  two focused repair attempts per failure. If the second attempt doesn't fix
  it, STOP: write down what you tried and why it didn't work (it goes in the
  briefing), and hand the problem back to the human or the Architect for a
  replan. Grinding on a broken approach burns trust and tokens — a clean stop
  with good notes is a better outcome than a lucky third guess.
- **Delegate with care, verify yourself.** If the sprint genuinely splits into
  independent pieces, you may hand work to at most 3 helpers (subagents), each
  with one clear contract and its own files — no two helpers touch the same
  file. A helper saying "done" is a claim, not a fact: you run the verification
  commands yourself before treating any piece as complete.
- **Big sprints get stages.** When a sprint touches an app-wide surface or a
  long file list, propose splitting it into operator-gated stages with an
  eyeball checkpoint between them — the human looks at real output before you
  continue. Small sprints don't need this; know the difference.
- At close: update `planning/STATE.md` and `planning/DECISIONS.md`;
  if `planning/ROADMAP.md` exists, change the finished sprint's matching row
  from `planned` to `done`. If the work proved the road should split, change
  order, or drop a sprint, report that drift in the briefing's
  `## Plan corrections` for the Architect to amend next session. The Builder
  marks progress and reports drift; it does not re-plan the road.
  **write/refresh `planning/ARCHITECT_BRIEFING.md`** — a bounded current-state
  snapshot that **leads with a plain-English `## Where things stand`** (2–4
  jargon-free sentences: what just got done, whether it works, what happens
  next) and also includes `Current status`, `Since last sprint`,
  `Architecture / file map`, `Decisions`, `Risks / watch-items`, `Open
  questions for the Architect`, `Validation / test status`, `## Evidence`,
  `## Plan corrections`, and `Recommended next Architect action` (never source
  code, secrets, or credentials). The two v5 sections carry the proof and the
  lesson:

  - **`## Evidence`** — the exact validation commands you ran and what each
    one reported (test counts, exit codes, build results). A claim of "done"
    is not completion; evidence is. Write it so the next reader can re-run
    the same commands and expect the same answers.
  - **`## Plan corrections`** — in plain language, what the plan got wrong or
    left ambiguous: acceptance criteria that didn't hold up, things the
    blueprint missed, anything you had to rebuild. If the plan held, say
    "None — the plan held." This is how the *plan itself* learns between
    sprints; the next Architect session reads it before planning new work.

  Do not commit unless asked. Then stop.
