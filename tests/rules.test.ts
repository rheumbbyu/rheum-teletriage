import { describe, expect, it } from "vitest"
import { addMonths, isIsoDate } from "../lib/rules/dates"
import { evaluate } from "../lib/rules/evaluate"
import { SAMPLES, SAMPLE_TODAY, type Sample } from "../lib/samples"
import type { ScreenInput } from "../lib/types"

const T1 = SAMPLES[0]

function input(s: Sample, changes: Partial<ScreenInput> = {}): ScreenInput {
  return { answers: s.answers, checklist: s.checklist, role: s.role, photoRatings: s.photoRatings, today: SAMPLE_TODAY, ...changes }
}
const firedIds = (s: ScreenInput) => evaluate(s).firedRules.map((h) => h.rule)

describe("spec §8 test cases", () => {
  it.each(SAMPLES.map((s) => [s.id, s] as const))("%s gives the expected outcome and rules", (_id, s) => {
    const decision = evaluate(input(s))
    expect(decision.outcome).toBe(s.expected.outcome)
    const fired = decision.firedRules.map((h) => h.rule)
    // Spec §8 lists the key rule; other rules may also fire (e.g. AC2.2 in T6), but T1 fires none.
    if (s.expected.rules.length === 0) expect(fired).toEqual([])
    for (const rule of s.expected.rules) expect(fired).toContain(rule)
  })
})

describe("precedence (T8)", () => {
  it("lists the highest-priority rule first and keeps every rule", () => {
    const t8 = SAMPLES.find((s) => s.id === "T8")!
    const decision = evaluate(input(t8))
    expect(decision.firedRules[0].rule).toBe("R1")
    expect(decision.firedRules.map((h) => h.rule)).toContain("R4")
  })
})

describe("R4: 12-month window (AC3.1)", () => {
  it("13 months ago books in person, with the APLAR Rec 1 reason", () => {
    const d = evaluate(input(T1, { answers: { ...T1.answers, lastInPerson: "2025-10-08" } }))
    expect(d.outcome).toBe("BOOK_IN_PERSON")
    expect(d.firedRules[0].reason).toContain("APLAR Rec 1")
  })
  it("exactly 12 months ago is still eligible", () => {
    expect(firedIds(input(T1, { answers: { ...T1.answers, lastInPerson: "2025-11-08" } }))).not.toContain("R4")
  })
  it("ACCEPT shows eligible-until date (AC5.1)", () => {
    expect(evaluate(input(T1)).eligibleUntil).toBe("2027-06-08")
  })
})

describe("unknown never passes", () => {
  it("consultant with a required unknown gets INCOMPLETE, not ESCALATE", () => {
    const d = evaluate(input(T1, { answers: { ...T1.answers, procedure: "unknown" } }))
    expect(d.outcome).toBe("INCOMPLETE")
    expect(d.firedRules[0].rule).toBe("R10")
  })
  it("consent = no is never ACCEPT (AC3.2)", () => {
    expect(evaluate(input(T1, { answers: { ...T1.answers, consent: "no" } })).outcome).toBe("INCOMPLETE")
  })
  it("no rule ever returns ACCEPT when any answer is unknown", () => {
    for (const key of Object.keys(T1.answers) as (keyof typeof T1.answers)[]) {
      for (const role of ["consultant", "nurse"] as const) {
        const d = evaluate(input(T1, { role, answers: { ...T1.answers, [key]: "unknown" } }))
        expect(d.outcome, `${key} unknown as ${role}`).not.toMatch(/^ACCEPT/)
      }
    }
  })
})

describe("individual rules", () => {
  it("R2: outside the Philippines escalates", () => {
    expect(evaluate(input(T1, { answers: { ...T1.answers, inPhilippines: "no" } })).outcome).toBe("ESCALATE")
  })
  it("R3: new patient books in person", () => {
    expect(firedIds(input(T1, { answers: { ...T1.answers, knownPatient: "no" } }))).toEqual(["R3"])
  })
  it("R5: new symptoms or flare books in person", () => {
    expect(firedIds(input(T1, { answers: { ...T1.answers, newSxFlare: "yes" } }))).toEqual(["R5"])
  })
  it("R6: planned procedure books in person", () => {
    expect(firedIds(input(T1, { answers: { ...T1.answers, procedure: "yes" } }))).toEqual(["R6"])
  })
})

describe("photos (AC2.2, AC2.3)", () => {
  it("nurse with photos sent escalates for rating", () => {
    const d = evaluate(input(T1, { role: "nurse", photoRatings: null }))
    expect(d.outcome).toBe("ESCALATE")
    expect(d.firedRules.map((h) => h.rule)).toEqual(["AC2.2"])
  })
  it("consultant with photos sent but not rated is INCOMPLETE", () => {
    expect(evaluate(input(T1, { photoRatings: null })).outcome).toBe("INCOMPLETE")
  })
  it("no photos sent needs no rating", () => {
    const d = evaluate(input(T1, { photoRatings: null, checklist: { ...T1.checklist, photosSent: "no" } }))
    expect(d.outcome).toBe("ACCEPT")
  })
})

describe("checklist conditions", () => {
  it("missing backup phone, labs or questionnaire gives ACCEPT WITH CONDITIONS", () => {
    const d = evaluate(input(T1, { checklist: { ...T1.checklist, backupPhone: "unknown", labsDone: "no" } }))
    expect(d.outcome).toBe("ACCEPT_WITH_CONDITIONS")
    expect(d.conditions.join(" ")).toMatch(/backup phone/)
    expect(d.conditions.join(" ")).toMatch(/labs/)
  })
  it("GP or nurse not joining never blocks ACCEPT (C5)", () => {
    const d = evaluate(input(T1))
    expect(d.outcome).toBe("ACCEPT")
    expect(d.conditions.join(" ")).toMatch(/if feasible/)
  })
})

describe("every reason has a citation or an action", () => {
  it("all fired rules across samples have a non-empty reason", () => {
    for (const s of SAMPLES) for (const h of evaluate(input(s)).firedRules) expect(h.reason.length).toBeGreaterThan(10)
  })
})

describe("dates", () => {
  it("adds months and clamps to month end", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28")
    expect(addMonths("2024-02-29", 12)).toBe("2025-02-28")
  })
  it("checks ISO dates", () => {
    expect(isIsoDate("2026-11-08")).toBe(true)
    expect(isIsoDate("2026-02-30")).toBe(false)
    expect(isIsoDate("08/11/2026")).toBe(false)
  })
})
