// Synthetic test cases T1–T13 from docs/spec.md §8. Used by the tests and the sample picker (AC1.2).

import type { Answers, Checklist, Outcome, PhotoRatings, Role } from "./types"

export const SAMPLE_TODAY = "2026-11-08"

export type Sample = {
  id: string
  name: string
  role: Role
  answers: Answers
  checklist: Checklist
  photoRatings: PhotoRatings | null
  expected: { outcome: Outcome; rules: string[] }
}

// T1: stable RA follow-up. Other cases change only what the spec lists.
const T1_ANSWERS: Answers = {
  inPhilippines: "yes",
  knownPatient: "yes",
  lastInPerson: "2026-06-08", // 5 months ago
  identityConfirmed: "yes",
  redFlag: "no",
  newSxFlare: "no",
  procedure: "no",
  recentHospital: "no",
  videoExam: "yes",
  consent: "yes",
}
const T1_CHECKLIST: Checklist = {
  backupPhone: "yes",
  photosSent: "yes",
  labsDone: "yes",
  questionnaireDone: "yes",
  gpOrNursePresent: "no",
}
const ADEQUATE: PhotoRatings = {
  colour: "ADEQUATE",
  perspective: "ADEQUATE",
  clarity: "ADEQUATE",
  darkness: "ADEQUATE",
  brightness: "ADEQUATE",
}

function sample(
  id: string,
  name: string,
  expected: Sample["expected"],
  changes: { answers?: Partial<Answers>; role?: Role; photoRatings?: Partial<PhotoRatings> } = {},
): Sample {
  return {
    id,
    name,
    role: changes.role ?? "consultant",
    answers: { ...T1_ANSWERS, ...changes.answers },
    checklist: { ...T1_CHECKLIST },
    // Only the consultant can rate photos (AC2.1).
    photoRatings: changes.role && changes.role !== "consultant" ? null : { ...ADEQUATE, ...changes.photoRatings },
    expected,
  }
}

export const SAMPLES: Sample[] = [
  sample("T1", "Stable RA follow-up", { outcome: "ACCEPT", rules: [] }),
  sample("T2", "RA not seen for 2 years", { outcome: "BOOK_IN_PERSON", rules: ["R4"] }, { answers: { lastInPerson: "2024-09-08" } }),
  sample("T3", "PsA methotrexate refill, chest pain", { outcome: "EMERGENCY", rules: ["R1"] }, { answers: { redFlag: "yes" } }),
  sample("T4", "Older patient, severe OA, fused joints", { outcome: "BOOK_IN_PERSON", rules: ["R9"] }, { answers: { videoExam: "no" } }),
  sample("T5", "Known gout, red swollen knee, fever", { outcome: "EMERGENCY", rules: ["R1"] }, { answers: { redFlag: "yes" } }),
  sample("T6", "Nurse screen, last visit unknown", { outcome: "ESCALATE", rules: ["R10"] }, { answers: { lastInPerson: "unknown" }, role: "nurse" }),
  sample("T7", "Stable patient, phone only", { outcome: "BOOK_IN_PERSON", rules: ["R9"] }, { answers: { videoExam: "no" } }),
  sample("T8", "Precedence: red flag and 26 months", { outcome: "EMERGENCY", rules: ["R1", "R4"] }, { answers: { redFlag: "yes", lastInPerson: "2024-09-08" } }),
  sample("T9", "Recently discharged stable patient", { outcome: "ESCALATE", rules: ["R8"] }, { answers: { recentHospital: "yes" } }),
  sample("T10", "Consent not yet obtained", { outcome: "INCOMPLETE", rules: ["R12"] }, { answers: { consent: "unknown" } }),
  sample("T11", "Video and virtual exam not confirmed", { outcome: "INCOMPLETE", rules: ["R13"] }, { answers: { videoExam: "unknown" } }),
  sample("T12", "Identity not confirmed", { outcome: "INCOMPLETE", rules: ["R14"] }, { answers: { identityConfirmed: "no" } }),
  sample("T13", "Blurry joint photo", { outcome: "BOOK_IN_PERSON", rules: ["R15"] }, { photoRatings: { clarity: "POOR" } }),
]
