// Runs every rule and builds the Decision (docs/03-architecture.md §7).

import type { Decision, Outcome, ScreenInput } from "../types"
import { addMonths } from "./dates"
import { ALL_RULES } from "./rules"

// Highest priority first (spec §4).
export const PRIORITY: Outcome[] = [
  "EMERGENCY",
  "BOOK_IN_PERSON",
  "ESCALATE",
  "INCOMPLETE",
  "ACCEPT_WITH_CONDITIONS",
  "ACCEPT",
]

export function evaluate(input: ScreenInput): Decision {
  const firedRules = ALL_RULES.map((rule) => rule(input)).filter((h) => h !== null)
  firedRules.sort((a, b) => PRIORITY.indexOf(a.outcome) - PRIORITY.indexOf(b.outcome))

  const { lastInPerson } = input.answers
  const eligibleUntil = lastInPerson === "unknown" ? null : addMonths(lastInPerson, 12)

  if (firedRules.length) {
    return { outcome: firedRules[0].outcome, firedRules, conditions: [], eligibleUntil }
  }

  // No rule fired: the checklist decides between ACCEPT and ACCEPT WITH CONDITIONS.
  // "unknown" counts as not done.
  const { checklist } = input
  const conditions: string[] = []
  if (checklist.backupPhone !== "yes") conditions.push("Get a backup phone number.")
  if (checklist.labsDone !== "yes") conditions.push("Complete monitoring labs before the call, if due.")
  if (checklist.questionnaireDone !== "yes") conditions.push("Complete the symptom questionnaire (APLAR Rec 9).")
  const outcome: Outcome = conditions.length ? "ACCEPT_WITH_CONDITIONS" : "ACCEPT"

  // C5 never blocks ACCEPT (APLAR Rec 7).
  if (checklist.gpOrNursePresent !== "yes") conditions.push("GP or nurse to join the call, if feasible (APLAR Rec 7).")

  return { outcome, firedRules, conditions, eligibleUntil }
}
