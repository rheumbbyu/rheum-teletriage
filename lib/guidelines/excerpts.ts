// Fixed guideline summaries Claude may cite (spec §5). Paraphrased, not quoted.
// APLAR = Ahmed et al., Int J Rheum Dis 2022;25:247–258, Table 1.
// UP MIU = UP Manila Medical Informatics Unit telemedicine guidance series, 2020.

export const EXCERPTS: Record<string, string> = {
  "APLAR overarching principle 2":
    "Rheumatologist and patient (or caregiver) should decide together before using telemedicine, with the patient understanding its benefits and limits.",
  "APLAR overarching principle 3":
    "The telemedicine modality should fit the patient: diagnosis, disease activity and severity, access to technology, and trained practitioners.",
  "APLAR Rec 1":
    "Any patient can be assessed for teleconsult follow-up; if suitable, teleconsults can be offered for up to 12 months before an in-person review.",
  "APLAR Rec 2":
    "For a new patient without a confirmed rheumatic diagnosis, telemedicine should be limited to guiding the treating practitioner on work-up, interim management and timing of an in-person rheumatology visit.",
  "APLAR Rec 3":
    "A pre-teleconsultation triage system may help bring forward in-person visits for patients unlikely to benefit from teleconsultation alone. Published services excluded patients with new complaints, planned procedures, or comorbidities needing hospital care.",
  "APLAR Rec 4":
    "When normal health services are disrupted, scheduled teleconsults are recommended over unsupervised medication changes.",
  "APLAR Rec 5":
    "Video consultation is conditionally recommended over telephone or asynchronous messaging.",
  "APLAR Rec 6":
    "An in-person visit should be booked as early as possible if there are unexplained symptoms, difficulty assessing the patient, or a communication gap during the teleconsult.",
  "APLAR Rec 7":
    "A teleconsult with a health professional trained in rheumatology examination, present with the patient, is preferred when feasible.",
  "APLAR Rec 8":
    "Patient data privacy, integrity and security should be protected according to local expectations and regulations.",
  "APLAR Rec 9":
    "Routine collection of patient-reported outcomes is suggested to support quality of care and may be used for pre-consultation triage.",
  "APLAR Rec 10":
    "Where treat-to-target is recommended for in-person care, a similar approach should be used in telemedicine.",
  "UP MIU":
    "Emergencies need in-person care. Identity cannot be verified by text and phone gives no visual cues, so video is preferred. Consent must be expressed for each teleconsult; implied consent is not recognised by the National Privacy Commission. The patient should be able to show the affected area, alone or with a helper. Specialty groups should define which patients can be prioritised for teleconsult.",
}

export const ALLOWED_CITATIONS = Object.keys(EXCERPTS)
