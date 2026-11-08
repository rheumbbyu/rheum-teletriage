// Types from docs/03-architecture.md §5. Do not rename fields.

export type Answer = "yes" | "no" | "unknown"
export type Role = "consultant" | "fellow" | "nurse" | "secretary"
export type Outcome =
  | "EMERGENCY"
  | "BOOK_IN_PERSON"
  | "ESCALATE"
  | "INCOMPLETE"
  | "ACCEPT_WITH_CONDITIONS"
  | "ACCEPT"

export type PhotoRating = "ADEQUATE" | "POOR"
export type PhotoRatings = {
  colour: PhotoRating
  perspective: PhotoRating
  clarity: PhotoRating
  darkness: PhotoRating
  brightness: PhotoRating
}

export type RuleHit = {
  rule: string
  outcome: Outcome
  reason: string
}

export type Decision = {
  outcome: Outcome
  firedRules: RuleHit[]
  conditions: string[]
  eligibleUntil: string | null // null when the last in-person date is unknown
}

export type AiRationale = {
  rationale: string
  citations: string[]
  considerations: string[]
  clarifyingQuestions: string[]
  suggestedOutcome: "SAME" | "STRICTER"
  stricterReason: string | null
}

// Q1–Q10 (spec §2)
export type Answers = {
  inPhilippines: Answer // Q1
  knownPatient: Answer // Q2
  lastInPerson: string | "unknown" // Q3, date as YYYY-MM-DD
  identityConfirmed: Answer // Q4
  redFlag: Answer // Q5
  newSxFlare: Answer // Q6
  procedure: Answer // Q7
  recentHospital: Answer // Q8
  videoExam: Answer // Q9
  consent: Answer // Q10
}

// C1–C5 (spec §2)
export type Checklist = {
  backupPhone: Answer // C1
  photosSent: Answer // C2
  labsDone: Answer // C3
  questionnaireDone: Answer // C4
  gpOrNursePresent: Answer // C5
}

export type ScreenInput = {
  answers: Answers
  checklist: Checklist
  role: Role
  photoRatings: PhotoRatings | null // null = not rated yet
  today: string // YYYY-MM-DD, passed in so tests are repeatable
}
