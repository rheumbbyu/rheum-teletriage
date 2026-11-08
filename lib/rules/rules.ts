// Rules R1–R15 from docs/spec.md §4. One function per rule; each returns a RuleHit or null.
// R7 and R11 are retired (merged into R5 and R9 in spec v0.6). Do not reuse them.

import type { Answers, RuleHit, ScreenInput } from "../types"
import { addMonths } from "./dates"

type Rule = (input: ScreenInput) => RuleHit | null

const hit = (rule: string, outcome: RuleHit["outcome"], reason: string): RuleHit => ({ rule, outcome, reason })

// Priority 1: EMERGENCY

export const r1: Rule = ({ answers }) =>
  answers.redFlag === "yes"
    ? hit("R1", "EMERGENCY", "Red flag present (chest pain, headache, seizure or fever). Emergencies need in-person care (UP MIU).")
    : null

// Priority 2: BOOK IN-PERSON

export const r3: Rule = ({ answers }) =>
  answers.knownPatient === "no"
    ? hit("R3", "BOOK_IN_PERSON", "New patient or no confirmed rheumatic diagnosis (APLAR Rec 2).")
    : null

export const r4: Rule = ({ answers, today }) => {
  if (answers.lastInPerson === "unknown") return null // handled by R10
  return addMonths(answers.lastInPerson, 12) < today
    ? hit("R4", "BOOK_IN_PERSON", "More than 12 months since last in-person review (APLAR Rec 1).")
    : null
}

export const r5: Rule = ({ answers }) =>
  answers.newSxFlare === "yes"
    ? hit("R5", "BOOK_IN_PERSON", "New or worsening symptoms, a flare, or told to come in person at a previous teleconsult (APLAR Recs 3, 6).")
    : null

export const r6: Rule = ({ answers }) =>
  answers.procedure === "yes"
    ? hit("R6", "BOOK_IN_PERSON", "Planned procedure such as joint injection, aspiration or biopsy (APLAR Rec 3).")
    : null

export const r9: Rule = ({ answers }) =>
  answers.videoExam === "no"
    ? hit("R9", "BOOK_IN_PERSON", "Cannot join by video or show joints and range of movement (UP MIU; clinic policy, stricter than APLAR Rec 5).")
    : null

export const r15: Rule = ({ role, checklist, photoRatings }) => {
  if (role !== "consultant" || checklist.photosSent !== "yes" || !photoRatings) return null
  const poor = Object.entries(photoRatings).filter(([, rating]) => rating === "POOR").map(([item]) => item)
  return poor.length
    ? hit("R15", "BOOK_IN_PERSON", `Photo rated POOR (${poor.join(", ")}); too poor to assess remotely (AC2.3).`)
    : null
}

// Priority 3: ESCALATE (or INCOMPLETE for the consultant)

export const r2: Rule = ({ answers }) =>
  answers.inPhilippines === "no"
    ? hit("R2", "ESCALATE", "Patient is outside the Philippines; licensure depends on the patient's country. Consultant decides.")
    : null

export const r8: Rule = ({ answers }) =>
  answers.recentHospital === "yes"
    ? hit("R8", "ESCALATE", "Recent hospitalisation or comorbidity needing hospital care; consultant decides (APLAR Rec 3).")
    : null

// Q1–Q8 are required; Q9 and Q10 unknown are handled by R13 and R12.
const REQUIRED: [keyof Answers, string][] = [
  ["inPhilippines", "Q1"],
  ["knownPatient", "Q2"],
  ["lastInPerson", "Q3"],
  ["identityConfirmed", "Q4"],
  ["redFlag", "Q5"],
  ["newSxFlare", "Q6"],
  ["procedure", "Q7"],
  ["recentHospital", "Q8"],
]

export const r10: Rule = ({ answers, role }) => {
  const unknown = REQUIRED.filter(([key]) => answers[key] === "unknown").map(([, id]) => id)
  if (!unknown.length) return null
  return role === "consultant"
    ? hit("R10", "INCOMPLETE", `Required answer unknown (${unknown.join(", ")}). Complete before deciding.`)
    : hit("R10", "ESCALATE", `Required answer unknown (${unknown.join(", ")}). Escalate to the consultant.`)
}

// AC2.2: photos sent must be rated by the consultant before a decision.
export const photosUnrated: Rule = ({ role, checklist, photoRatings }) => {
  if (checklist.photosSent !== "yes") return null
  if (role !== "consultant") return hit("AC2.2", "ESCALATE", "Photos were sent; the consultant must rate them.")
  return photoRatings ? null : hit("AC2.2", "INCOMPLETE", "Photos were sent; rate them before deciding.")
}

// Priority 4: INCOMPLETE

export const r12: Rule = ({ answers }) =>
  answers.consent !== "yes"
    ? hit("R12", "INCOMPLETE", "Consent not confirmed. Obtain and document consent (UP MIU; APLAR Rec 8).")
    : null

export const r13: Rule = ({ answers }) =>
  answers.videoExam === "unknown"
    ? hit("R13", "INCOMPLETE", "Video and virtual exam not confirmed. Confirm before booking (UP MIU).")
    : null

export const r14: Rule = ({ answers }) =>
  answers.identityConfirmed === "no"
    ? hit("R14", "INCOMPLETE", "Patient identity not confirmed. Confirm before booking (UP MIU).")
    : null

export const ALL_RULES: Rule[] = [r1, r3, r4, r5, r6, r9, r15, r2, r8, r10, photosUnrated, r12, r13, r14]
