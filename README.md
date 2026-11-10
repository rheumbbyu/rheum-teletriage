# RheumRoute PH

[![CI](https://github.com/rheumbbyu/rheum-teletriage/actions/workflows/ci.yml/badge.svg)](https://github.com/rheumbbyu/rheum-teletriage/actions/workflows/ci.yml)

A pre-booking screen for Philippine rheumatology teleconsults. Clinic staff answer 10 questions, and fixed rules based on the APLAR 2022 telemedicine recommendations decide whether a booking can go ahead as a teleconsult or the patient must be seen in person. For the consultant, Claude explains the decision with guideline citations.

> [!WARNING]
> **Class exercise only. Not for use with real patients.**
>
> This project was built as a graded mini project for a course. It is a learning prototype, not a medical device, and it has not been clinically validated or reviewed for safety, privacy or regulatory compliance.
>
> - Do **not** enter real patient names, details, photos or any identifiable information. Use the synthetic sample cases only.
> - Do **not** use its output to make real booking, triage or treatment decisions.
> - In an emergency, patients should go to the nearest emergency room.
>
> The screening rules reflect one fellow's reading of the guidelines and have not been reviewed by a clinical governance body. Guidelines may be updated in the future

**Live demo:** https://rheum-teletriage.vercel.app (synthetic data only)

## What it does

- **Screening form:** 10 required questions, a 5-item readiness checklist, and a photo-quality rating that only the consultant can fill in. Sample cases T1–T13 can be loaded from a dropdown.
- **Rules decide:** 13 active rules (R1–R15; R7 and R11 retired) return one of six outcomes: EMERGENCY, BOOK IN-PERSON, ESCALATE, INCOMPLETE, ACCEPT WITH CONDITIONS or ACCEPT. Every rule that fires is listed with its citation.
- **Decision card:** outcome, reasons, conditions to complete before the call, a "teleconsult-eligible until" date, and a neutral script staff can read to the patient.
- **Consultant has the final say:** every card is a proposal until the consultant confirms it. Overrides need a written reason. Other roles can only escalate.
- **AI explains, never decides:** the consultant can ask Claude for a plain-language rationale. Claude may suggest a stricter outcome but never a looser one, and its answer never changes the card.

## Design principles

1. **Code decides, AI explains.** The outcome comes only from pure rule functions in `lib/rules/`.
2. **When in doubt, choose in-person.**
3. **Unknown never passes.** A required "unknown" answer never leads to ACCEPT.
4. **The consultant has the final say.**
5. **No patient data stored.** No database, no photo upload, nothing saved on the server.

## Run it locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The screening rules work without any key. To turn on the Claude rationale, create a file named `.env.local` in the project folder:

```
ANTHROPIC_API_KEY=your-key-from-console.anthropic.com
```

`.env.local` is git-ignored and must never be committed.

## Checks

```bash
npm run lint        # code style
npm run typecheck   # types
npm test            # 44 Vitest tests, including spec test cases T1–T13
npm run build       # production build
```

GitHub Actions runs all four on every push and pull request. The AI tests use fake Claude answers, so CI needs no API key.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Zod · Claude via the Anthropic TypeScript SDK · Vitest · GitHub Actions · Vercel

## Project structure

```
app/page.tsx                 the screen
app/api/rationale/route.ts   server route that asks Claude for the rationale
components/                  form, decision card, rationale panel
lib/rules/                   R1–R15 as pure functions, and evaluate()
lib/schema.ts                Zod validation for all input
lib/guidelines/excerpts.ts   paraphrased APLAR / UP MIU summaries Claude may cite
lib/samples.ts               synthetic test cases T1–T13
tests/                       Vitest tests
docs/                        idea validation, PRD, spec, architecture
mockup/                      early clickable mockup
```

## Documentation

| Document | What it covers |
|---|---|
| [Idea validation](docs/01-idea-validation.md) | Problem, users, evidence, why now |
| [PRD](docs/02-PRD.md) | Goals, features, scope, risks |
| [Spec](docs/spec.md) | Questions, rules, acceptance criteria, test cases |
| [Architecture](docs/03-architecture.md) | Data model, data flow, rules engine, AI endpoint, security |
| [CLAUDE.md](CLAUDE.md) / [.cursorrules](.cursorrules) | Instructions for AI coding assistants |

## Safety and privacy

- The API key lives only in server environment variables, never in the browser or the repository.
- The server recomputes the decision itself, so the browser cannot send a different outcome.
- Claude's answer is checked: only SAME or STRICTER is accepted, and citations outside the supplied excerpts are removed. If anything fails, the card shows "rationale unavailable" and the rules still apply. It is better to err on the side of caution even though this is only a class experiment. 
- Consultant notes are capped at 2,000 characters and passed to Claude as data, not instructions.
- Requests to the AI route are limited to 5 per minute per IP, and the Anthropic account has a monthly spend limit.
- Analytics, if enabled, record page views and outcome type only.

Because anything sent to the AI route leaves the clinic's control, the app is for synthetic data only (Data Privacy Act of 2012, RA 10173).

## Guideline sources

- Ahmed S, et al. APLAR recommendations on the practice of telemedicine in rheumatology. *Int J Rheum Dis* 2022;25:247–258. doi:10.1111/1756-185X.14286 (I am a co-author of these guidelines)
- UP Manila Medical Informatics Unit. Telemedicine guidance series, 2020. (I am a co-author of these guidelines)
- Guidelines can be updated in v2 (add ACR or EULAR or if APLAR updates)

The excerpts in `lib/guidelines/excerpts.ts` are short paraphrases written for this project, not quotations. The source PDFs are not included in this repository.

## Roadmap (v2 ideas)

Not built yet. Any clinical change goes into `docs/spec.md` and its revision log first.

**Guidelines and AI**
- Add more guideline summaries Claude may cite (e.g. ACR, EULAR, Philippine Rheumatology Association, DOH), keeping the rule that Claude cites only the supplied excerpts. The consultant still has the final say for accountability, since AI cannot be held responsible for actual medical decisions. 
- Shorten the Claude rationale; it currently runs past the 120-word target.

**Access and equity**
- Assisted video: the patient joins from a barangay health center or rural health unit, with a health worker to help with the exam (APLAR Rec 7).
- Service-disruption mode for typhoons and floods: allow a scheduled interim teleconsult for stable patients, booking in-person when services resume (APLAR Rec 4).
- Filipino version of the screen.

**Clinical rules**
- Review the red-flag list with a second rheumatologist (e.g. visual symptoms, hot swollen joint, breathlessness).
- Hint at Q3 to check the last in-person date in the EMR, since the 12-month rule depends on it.

**Engineering**
- Make Vercel publish only after CI passes.
- Override log, reviewed periodically to improve the rules and for clinical discussion, not necessarily to validate the app. This needs storage, so it also needs privacy work.

## Author

Lisa Traboco, rheumatology consultant. Health Informatics Specialist. Built for class on Gen/Agentic AI with help from Claude Code.
