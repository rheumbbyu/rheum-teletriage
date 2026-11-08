# PRD: RheumRoute PH (v1)

> One page. Synthetic or de-identified data only. Not for clinical use.
> Detailed rules, acceptance criteria and test cases: see `spec.md`. Evidence: see `01-idea-validation.md`.

## 1. Problem
Teleconsult bookings in Philippine rheumatology clinics are accepted without a consistent eligibility check. Patients who need in-person care (not seen in person for over 12 months, new and undiagnosed, red-flag symptoms, unable to do a virtual physical exam) end up in teleconsult slots, wasting the slot and delaying care. APLAR (2022) gives clear criteria and UP MIU (2020) asks specialty groups to define which patients suit teleconsult, but no screening tool or Philippine telerheumatology guidance exists.

## 2. Target users
- **Rheumatology consultant:** makes the final decision; rates submitted photos; can override with a written reason.
- **Rheumatology fellow, nurse, clinic secretary:** run the screen; escalate unclear cases to the consultant; cannot override.

## 3. Goals and success metrics
| Goal | Metric (v1 target) |
|---|---|
| Never accept a booking that fails a hard stop | 100% of hard-stop test cases return DECLINE |
| Unclear cases always reach the consultant | 100% of non-consultant screens with any Unknown return ESCALATE |
| AI never loosens a rule outcome | 0 test cases where AI output changes or loosens the code outcome |
| Fast and usable | Screen completed in < 2 min; 3 of 3 test users (≥ 1 nurse or secretary) finish without help |
| Fewer conversions (post-v1) | No published Philippine rate exists (`01-idea-validation.md` Step 3c). After v1, measure the clinic's baseline of teleconsults converted to in-person, then set a reduction target |

## 4. Features
| # | Feature | Summary |
|---|---|---|
| F1 | Screening form | 10 fixed screening questions plus a 5-item readiness checklist; sample picker loads the synthetic test cases in `spec.md` §8 |
| F2 | Photo quality rating | Consultant rates photos on colour, perspective, clarity, darkness, brightness; app never receives images |
| F3 | Decision rules (code) | Guideline-anchored rules return EMERGENCY, BOOK IN-PERSON, ESCALATE, INCOMPLETE, ACCEPT WITH CONDITIONS or ACCEPT |
| F4 | Guideline rationale (AI) | Claude explains the outcome from the consultant's input and APLAR / UP MIU excerpts; may suggest stricter, never looser |
| F5 | Decision card | Outcome, rules fired with citations, conditions checklist, "eligible until" date, neutral script for declines |
| F6 | Confirmation and override | Every outcome is a proposal until the consultant confirms; overrides need a written reason |

## 5. Scope
- **In v1:** F1–F6, English UI, deployed web app, usage analytics (no patient content).
- **Out of v1:** login, database, saved screens, AI pre-fill from messages, AI photo analysis, photo upload, calendar or EHR integration, patient-facing screening, treatment advice, new-patient teleconsults, automatic learning from overrides.
- **v2 ideas:** saved override log reviewed to update rules by hand; service disruption mode; patient pre-booking questionnaire; clinic rules editor; Filipino UI.

## 6. Key risks
| Risk | Mitigation |
|---|---|
| Unsafe teleconsult accepted | Hard stops in code; Unknown never passes; consultant confirms every outcome |
| AI loosens or invents | Code outcome fixed and shown first; citations limited to supplied excerpts |
| Real patient data entered | Banner; no storage; no photo upload; Data Privacy Act of 2012 |
| Secrets or prompt injection | API key in server env vars only; notes fenced as data; length caps |

**Stack:** Next.js + Tailwind, Claude via the Anthropic TypeScript SDK, Zod, Vitest, GitHub Actions, Vercel.
