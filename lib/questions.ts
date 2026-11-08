// Question and checklist wording from docs/spec.md §2.

import type { Answers, Checklist, PhotoRatings } from "./types"

export const QUESTIONS: { key: keyof Answers; id: string; text: string }[] = [
  { key: "inPhilippines", id: "Q1", text: "Patient currently in the Philippines?" },
  { key: "knownPatient", id: "Q2", text: "Known patient at this clinic (seen in person by a rheumatologist), with a confirmed rheumatic diagnosis?" },
  { key: "lastInPerson", id: "Q3", text: "Date of last in-person rheumatology review" },
  { key: "identityConfirmed", id: "Q4", text: "Patient identity confirmed (name and birth date match; if a caregiver is booking, relationship noted)?" },
  { key: "redFlag", id: "Q5", text: "Any red flag: chest pain, headache, seizure or fever?" },
  { key: "newSxFlare", id: "Q6", text: "New or worsening symptoms, a flare, or told at a previous teleconsult to come in person?" },
  { key: "procedure", id: "Q7", text: "Planned procedure (joint injection or aspiration, biopsy)?" },
  { key: "recentHospital", id: "Q8", text: "Hospitalised recently, or a comorbidity needing hospital care?" },
  { key: "videoExam", id: "Q9", text: "Can join by video (device and stable internet) and show joints and range of movement, alone or with a helper?" },
  { key: "consent", id: "Q10", text: "Patient consents to teleconsult and understands its limits and data handling?" },
]

export const CHECKLIST: { key: keyof Checklist; id: string; text: string }[] = [
  { key: "backupPhone", id: "C1", text: "Backup phone number" },
  { key: "photosSent", id: "C2", text: "Photos of affected joints or skin sent ahead" },
  { key: "labsDone", id: "C3", text: "Monitoring labs done, if due" },
  { key: "questionnaireDone", id: "C4", text: "Symptom questionnaire (e.g. patient global, RAPID3) completed" },
  { key: "gpOrNursePresent", id: "C5", text: "GP or nurse able to join the call" },
]

export const PHOTO_ITEMS: { key: keyof PhotoRatings; text: string }[] = [
  { key: "colour", text: "Colour" },
  { key: "perspective", text: "Perspective (angle)" },
  { key: "clarity", text: "Clarity" },
  { key: "darkness", text: "Darkness" },
  { key: "brightness", text: "Brightness" },
]
