// Zod schemas for form input (spec §9). The same schemas run on the browser and the server.

import { z } from "zod"
import { isIsoDate } from "./rules/dates"

const answer = z.enum(["yes", "no", "unknown"], { error: "Required" })
const rating = z.enum(["ADEQUATE", "POOR"], { error: "Required" })

export const roleSchema = z.enum(["consultant", "fellow", "nurse", "secretary"])

export const answersSchema = z.object({
  inPhilippines: answer,
  knownPatient: answer,
  lastInPerson: z.union([z.literal("unknown"), z.string().refine(isIsoDate, "Enter a valid date")], { error: "Required" }),
  identityConfirmed: answer,
  redFlag: answer,
  newSxFlare: answer,
  procedure: answer,
  recentHospital: answer,
  videoExam: answer,
  consent: answer,
})

// Checklist items are optional (AC1.1); unanswered counts as "unknown", i.e. not done.
export const checklistSchema = z.object({
  backupPhone: answer.default("unknown"),
  photosSent: answer.default("unknown"),
  labsDone: answer.default("unknown"),
  questionnaireDone: answer.default("unknown"),
  gpOrNursePresent: answer.default("unknown"),
})

export const photoRatingsSchema = z.object({
  colour: rating,
  perspective: rating,
  clarity: rating,
  darkness: rating,
  brightness: rating,
})

export const NOTES_MAX = 2000
export const notesSchema = z.string().max(NOTES_MAX, `Notes must be ${NOTES_MAX} characters or fewer`)
