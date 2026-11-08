# CLAUDE.md: RheumRoute PH

Pre-booking screen for Philippine rheumatology teleconsults. Staff answer 10 questions; rules in code decide whether the booking is accepted as a teleconsult or the patient must be seen in person. Claude only explains the decision for the consultant.

**Synthetic or de-identified data only. Not for clinical use.**

## Read these first
- `docs/02-PRD.md`: goals, features F1–F6, scope
- `docs/spec.md`: questions Q1–Q10, checklist C1–C5, rules R1–R15, acceptance criteria (AC), test cases T1–T13. **The spec is the source of truth.**
- `docs/03-architecture.md`: types (§5), data flow (§6), rules engine (§7), AI endpoint (§8), security (§9)
- `mockup/index.html`: clickable layout mockup

## Stack
Next.js (App Router) + TypeScript + Tailwind · Zod · Claude via Vercel AI SDK · Vitest · GitHub Actions · Vercel

## Commands
```bash
npm run dev        # run locally
npm run lint
npm run typecheck
npm test           # Vitest
npm run build
```
Run lint, typecheck and tests before every commit.

## Folder structure
```
app/page.tsx                 # the screen
app/api/rationale/route.ts   # server route that calls Claude
lib/rules/                   # R1–R15 as pure functions
lib/schema.ts                # Zod schemas
lib/guidelines/              # fixed APLAR / UP MIU excerpts
components/                  # form, checklist, photo rating, decision card
tests/                       # T1–T13 and AI checks
```

## Rules that must never be broken
1. **Code decides, AI explains.** The outcome comes only from `lib/rules/`. AI output can never change `Decision.outcome` (AC4.1).
2. **AI can only be stricter.** `suggestedOutcome` is `"SAME"` or `"STRICTER"`; anything else fails validation (AC4.2).
3. **Unknown never passes.** A required `unknown` answer never leads to ACCEPT (R10, R12, R13).
4. **The consultant has the final say.** Every card is a PROPOSAL until the consultant confirms; overrides need a written reason (AC6.1, AC6.3).
5. **No patient data stored.** No database, no file or photo upload, no logging of answers or notes. State lives in the browser session only (AC6.4).

## Coding conventions
- Use the types in `docs/03-architecture.md` §5 exactly (`Answers`, `Checklist`, `PhotoRatings`, `RuleHit`, `Decision`, `AiRationale`). Do not rename fields.
- `lib/rules/` is pure: no React, no `fetch`, no dates from the system clock inside rules (pass "today" in so tests are repeatable).
- One function per rule, named after the rule (`r4`), returning `RuleHit | null`. Every `RuleHit.reason` includes its citation, e.g. "(APLAR Rec 1)".
- Validate all input with Zod on both client and server.
- Rule numbers R7 and R11 are retired; do not reuse them.
- Keep UI text plain and short; cards never show doses or treatment advice (AC5.5).

## Testing
- Every rule and every test case T1–T13 in `docs/spec.md` §8 has a Vitest test. Add a test whenever a rule changes.
- Never call the real Claude API in tests; use fake responses (valid, invalid, "LOOSER", made-up citation).

## Secrets and AI
- `ANTHROPIC_API_KEY` is read only in `app/api/rationale/route.ts`, from environment variables. Never put it in client code, tests or the repo. `.env*` files are git-ignored.
- Consultant notes go to Claude inside `<notes>` tags, labelled as data. Reject notes over 2,000 characters before calling Claude.
- Claude may only cite the excerpts in `lib/guidelines/`; remove any other citation.

## When the spec and code disagree
Stop and ask. Do not change a clinical rule, its outcome or its citation without updating `docs/spec.md` (and its revision log) first.
