# Spec: RheumRoute PH (v1)

> Status: v0.8, draft for review. Implements `02-PRD.md`.
> Citations: "APLAR Rec n" = Ahmed et al., *Int J Rheum Dis* 2022;25:247–258. "UP MIU" = UP Manila Medical Informatics Unit telemedicine guidance series, 2020.

## 1. Roles
| Role | Can run screen | Can rate photos | Sees AI rationale | Can confirm / override |
|---|---|---|---|---|
| Consultant | Yes | Yes | Yes | Yes (written reason required) |
| Fellow, Nurse, Secretary | Yes | No | No | No (escalate instead) |

Role choice is a demo setting, not access control (no login in v1); the UI says so.

## 2. Screening form (F1)
Ten questions decide the outcome. Each answer is `yes` / `no` / `unknown`, except Q3, which is a date or `unknown`.

| ID | Question | Answer |
|---|---|---|
| Q1 | Patient currently in the Philippines? | yes / no / unknown |
| Q2 | Known patient at this clinic (seen in person by a rheumatologist), with a confirmed rheumatic diagnosis? | yes / no / unknown |
| Q3 | Date of last in-person rheumatology review | date / unknown |
| Q4 | Patient identity confirmed (name and birth date match; if a caregiver is booking, relationship noted)? | yes / no / unknown |
| Q5 | Any red flag: chest pain, headache, seizure or fever? (v1 list; review with a second rheumatologist for v2, e.g. visual symptoms, hot swollen joint, breathlessness) | yes / no / unknown |
| Q6 | New or worsening symptoms, a flare, or told at a previous teleconsult to come in person? | yes / no / unknown |
| Q7 | Planned procedure (joint injection or aspiration, biopsy)? | yes / no / unknown |
| Q8 | Hospitalised recently, or a comorbidity needing hospital care? | yes / no / unknown |
| Q9 | Can join by video (video-capable device, stable internet about 2 Mbps) and show joints and range of movement, alone or with a helper? (UP MIU) | yes / no / unknown |
| Q10 | Patient consents to teleconsult and understands its limits and data handling? | yes / no / unknown |

**Readiness checklist.** These items never block a booking; they only add conditions to the card. Each is `yes` / `no` / `unknown`; `unknown` counts as not done.

| ID | Item |
|---|---|
| C1 | Backup phone number |
| C2 | Photos of affected joints or skin sent ahead |
| C3 | Monitoring labs done, if due |
| C4 | Symptom questionnaire (e.g. patient global, RAPID3) completed |
| C5 | GP or nurse able to join the call |

- AC1.1 Q1–Q10 are required. Checklist items are optional.
- AC1.2 A sample picker fills the form with any of the synthetic test cases in §8 (T1–T13).

## 3. Photo quality rating (F2)
Five items, each `ADEQUATE` / `POOR`: Colour, Perspective (angle), Clarity, Darkness, Brightness. Photos are viewed outside the app; the app never receives images.
- AC2.1 Rating fields are enabled only for the Consultant role.
- AC2.2 Non-consultant with C2 = yes → outcome includes ESCALATE (photos to rate).
- AC2.3 Any item rated `POOR` → BOOK IN-PERSON (R15).

## 4. Decision rules (F3)
Rules are pure functions in code. Outcomes in priority order; the highest matching outcome wins, and every rule that fired is listed.

| Priority | Outcome | Rules |
|---|---|---|
| 1 | **DECLINE → EMERGENCY** | R1: Q5 = yes, any red flag (UP MIU: emergencies are advised in-person care) |
| 2 | **DECLINE → BOOK IN-PERSON** | R3: Q2 = no (APLAR Rec 2) · R4: Q3 > 12 months ago (APLAR Rec 1) · R5: Q6 = yes (APLAR Recs 3, 6) · R6: Q7 = yes (APLAR Rec 3) · R9: Q9 = no, i.e. no video or cannot show joints (UP MIU; clinic policy, stricter than APLAR Rec 5, which conditionally prefers video; UP MIU: identity cannot be verified by text, no visual cues by phone) · R15: any photo item rated `POOR` by the consultant (AC2.3; photos too poor to assess remotely) |
| 3 | **ESCALATE TO CONSULTANT** | R2: Q1 = no (licensure depends on patient's country) · R8: Q8 = yes (recent hospitalisation or comorbidity needing hospital care; APLAR Rec 3 cites studies that excluded such patients, consultant decides) · R10: user is not consultant and any of Q1–Q8 = unknown · photos sent and not yet rated (AC2.2) |
| 4 | **INCOMPLETE** | User is consultant and any of Q1–Q8 = unknown · R12: Q10 = no or unknown, any role (AC3.2) · R13: Q9 = unknown, any role (confirm video and virtual exam before booking) · R14: Q4 = no, any role (confirm patient identity before booking; UP MIU) · consultant with C2 = yes and photos not yet rated (AC2.2) |
| 5 | **ACCEPT WITH CONDITIONS** | No rule above fired, Q10 = yes, and any of: C1 not done; C3 not done; C4 not done (APLAR Rec 9) |
| 6 | **ACCEPT** | No rule above fired, Q10 = yes, C1, C3 and C4 done, photos adequate if sent. C5 is added to the card as "if feasible" and never blocks ACCEPT (APLAR Rec 7) |

- Rule numbers R7 and R11 are retired: R7 (previous "needs in-person" flag) is merged into R5, and R11 (phone or text only) into R9.

- AC3.1 Q3 = 13 months ago → BOOK IN-PERSON, reason "R4: more than 12 months since last in-person review (APLAR Rec 1)".
- AC3.2 Consent = no or unknown → INCOMPLETE (R12), never ACCEPT; card shows "obtain and document consent". Consent is expressed for each teleconsult; implied consent is not recognised by the NPC (UP MIU; APLAR overarching principle 2, Rec 8).
- AC3.3 R3 fired → card says "if patient has treating GP, a doctor-to-doctor consult can be considered and timing of in-person visit" (APLAR Rec 2).
- AC3.4 Service disruption mode (APLAR Rec 4) is out of v1 and tracked as the v2 GitHub issue: a booking blocked only by R4 would become ACCEPT WITH CONDITIONS ("interim teleconsult; book in-person when services resume"), never changing any other rule.
- AC3.5 Unit tests cover every rule and rule precedence.

## 5. Guideline rationale (F4, AI)
Called only from the consultant view, after the code outcome is computed.

**Input to Claude** (server-side API route):
- structured form answers, photo ratings, code outcome, fired rule IDs;
- consultant notes (≤ 2,000 characters, fenced as data);
- fixed guideline excerpts (APLAR Recs 1–10 and relevant UP MIU statements), stored in the repo.

**Output** (validated with Zod):
```json
{
  "rationale": "string, plain language",
  "citations": ["APLAR Rec 1", "UP MIU"],
  "considerations": ["string"],
  "clarifyingQuestions": ["string"],
  "suggestedOutcome": "SAME | STRICTER",
  "stricterReason": "string | null"
}
```

- AC4.1 The code outcome is always shown first and is never changed by AI output.
- AC4.2 `suggestedOutcome` can only be `SAME` or `STRICTER`; any other value fails validation.
- AC4.3 Citations not in the supplied excerpts are removed.
- AC4.4 Schema failure or API error → "rationale unavailable"; outcome and rules still display.
- AC4.5 Notes over 2,000 characters are rejected before any AI call; text that tries to set an outcome is ignored and shown as a warning.

## 6. Decision card (F5)
- AC5.1 ACCEPT cards show "teleconsult-eligible until <Q3 + 12 months>" and fail-safe triggers for switching to in-person during the call: new or unexplained symptoms, difficulty assessing, flare, or a communication gap (APLAR Rec 6).
- AC5.2 ACCEPT WITH CONDITIONS cards list each condition as a checklist (new photos, labs, questionnaire, backup phone, GP or nurse to join if feasible, APLAR Rec 7).
- AC5.3 EMERGENCY cards also show "notify the consultant now".
- AC5.4 DECLINE cards include a short, neutral script staff can read to the patient; no clinical advice.
- AC5.5 Cards never show doses or treatment advice.

## 7. Confirmation and override (F6)
- AC6.1 Every card is labelled PROPOSAL until the consultant confirms.
- AC6.2 Non-consultants see "escalate to consultant" instead of override.
- AC6.3 Consultant can override any outcome, including EMERGENCY (e.g. a known chronic headache); any disagreement needs a written reason shown on the card. An overridden EMERGENCY card keeps a visible "red flag overridden by consultant" banner.
- AC6.4 Answers, ratings, notes and overrides live in the browser session only; nothing is stored on the server.

## 8. Test cases (synthetic)
| # | Case | Key answers | Expected |
|---|---|---|---|
| T1 | Stable RA follow-up | Q1, Q2, Q4, Q9, Q10 yes; Q3 = 5 months ago; Q5–Q8 no; C1–C4 done; photos adequate | ACCEPT |
| T2 | RA not seen for 2 years | Q3 = 26 months ago | BOOK IN-PERSON (R4) |
| T3 | PsA methotrexate refill, usual rheumatologist on leave | Q5 = yes (chest pain) | EMERGENCY (R1) |
| T4 | Older patient, severe OA, fused joints | Q9 = no (cannot show joints) | BOOK IN-PERSON (R9) |
| T5 | Known gout, knee pain, red swollen knee on photo | Q5 = yes (fever) | EMERGENCY (R1) |
| T6 | Nurse screen with last visit unknown | role = nurse, Q3 = unknown | ESCALATE (R10) |
| T7 | Stable patient, phone only | as T1 but Q9 = no (no video) | BOOK IN-PERSON (R9) |
| T8 | Precedence | R1 and R4 both fire | EMERGENCY, both rules listed |
| T9 | Recently discharged stable patient | as T1 but Q8 = yes | ESCALATE (R8) |
| T10 | Consent not yet obtained | as T1 but Q10 = unknown | INCOMPLETE (R12) |
| T11 | Video and virtual exam not confirmed | as T1 but Q9 = unknown | INCOMPLETE (R13) |
| T12 | Identity not confirmed | as T1 but Q4 = no | INCOMPLETE (R14) |
| T13 | Blurry joint photo | as T1 but consultant rates clarity `POOR` | BOOK IN-PERSON (R15) |


## 9. Non-functional
- Input validation: all form input validated with Zod on client and server.
- Secrets: `ANTHROPIC_API_KEY` in server environment variables only; never in client code or repo.
- Abuse and cost: rate limit per IP on the AI route; notes length cap.
- Privacy: banner "synthetic data only"; analytics record page views and outcome type only, never answers or notes.

## 10. Revision log
| Version | Date | Change |
|---|---|---|
| v0.1 | 2026-11-05 | First draft, moved from PRD |
| v0.2 | 2026-11-05 | No video (phone or text only) changed from a condition to a hard stop, new rule R11 → BOOK IN-PERSON; T7 updated |
| v0.3 | 2026-11-05 | Decisions: R8 moved from hard stop to ESCALATE (T9 added); disruption mode moved to v2; consultant may override EMERGENCY with written reason; red-flag list fixed at four for v1 |
| v0.4 | 2026-11-06 | Added R12 (consent not yes → INCOMPLETE) and R13 (video unknown → INCOMPLETE), closing a gap where no outcome matched; readiness `unknown` treated as not met; T10–T11 added; sample picker loads all test cases |
| v0.5 | 2026-11-06 | E6 changed from GP referral to patient identity check. R14 added. AC3.3 reworded. T12 added. |
| v0.6 | 2026-11-08 | Screening form cut from 22 items to 10 questions (Q1–Q10) plus a 5-item readiness checklist (C1–C5) by merging questions with the same outcome. R7 merged into R5, R11 into R9. R10 now covers Q1–Q8; R13 covers Q9 (video and virtual exam). C5 no longer blocks ACCEPT. Rules, ACs and tests renamed to the new IDs. |
| v0.7 | 2026-11-08 | Poor photo quality changed from a condition to a hard stop: new rule R15 (any photo item `POOR` → BOOK IN-PERSON), matching AC2.3; T13 added. |
| v0.8 | 2026-11-08 | Found while coding the rules: a consultant with photos sent but not rated → INCOMPLETE (rate before deciding). T6 may also list AC2.2 when photos were sent. |
