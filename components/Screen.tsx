"use client"

import { useState } from "react"
import { DecisionCard, OUTCOME_STYLE, type Review } from "./DecisionCard"
import { Segmented } from "./Segmented"
import { CHECKLIST, PHOTO_ITEMS, QUESTIONS } from "@/lib/questions"
import { evaluate, PRIORITY } from "@/lib/rules/evaluate"
import { SAMPLES } from "@/lib/samples"
import { answersSchema, checklistSchema, photoRatingsSchema } from "@/lib/schema"
import type { Answer, Answers, Checklist, Decision, Outcome, PhotoRating, PhotoRatings, Role } from "@/lib/types"

const ANSWER_OPTIONS = ["yes", "no", "unknown"] as const
const RATING_OPTIONS = ["ADEQUATE", "POOR"] as const
const ROLES: Role[] = ["consultant", "fellow", "nurse", "secretary"]

// Local date as YYYY-MM-DD.
function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function Row({ id, text, children }: { id?: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        {id && <span className="mr-1.5 font-mono text-xs text-slate-400">{id}</span>}
        {text}
      </p>
      {children}
    </div>
  )
}

export function Screen() {
  const [role, setRole] = useState<Role>("consultant")
  const [sampleId, setSampleId] = useState("")
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [checklist, setChecklist] = useState<Partial<Checklist>>({})
  const [ratings, setRatings] = useState<Partial<PhotoRatings>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof Answers, string>>>({})
  const [decision, setDecision] = useState<Decision | null>(null)
  const [review, setReview] = useState<Review>({ status: "proposal" })
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [overrideOutcome, setOverrideOutcome] = useState<Outcome>("BOOK_IN_PERSON")
  const [overrideReason, setOverrideReason] = useState("")

  const isConsultant = role === "consultant"

  // Any change makes the old card out of date.
  function clearDecision() {
    setDecision(null)
    setReview({ status: "proposal" })
    setOverrideOpen(false)
    setOverrideReason("")
  }
  function setAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setSampleId("")
    clearDecision()
  }
  function setCheck(key: keyof Checklist, value: Answer) {
    setChecklist((c) => ({ ...c, [key]: value }))
    setSampleId("")
    clearDecision()
  }
  function setRating(key: keyof PhotoRatings, value: PhotoRating) {
    setRatings((r) => ({ ...r, [key]: value }))
    setSampleId("")
    clearDecision()
  }
  function changeRole(next: Role) {
    setRole(next)
    if (next !== "consultant") setRatings({}) // only the consultant rates photos (AC2.1)
    clearDecision()
  }
  function loadSample(id: string) {
    setSampleId(id)
    const s = SAMPLES.find((x) => x.id === id)
    if (!s) return
    setRole(s.role)
    setAnswers(s.answers)
    setChecklist(s.checklist)
    setRatings(s.photoRatings ?? {})
    setErrors({})
    clearDecision()
  }
  function reset() {
    setSampleId("")
    setAnswers({})
    setChecklist({})
    setRatings({})
    setErrors({})
    clearDecision()
  }

  function runScreen() {
    const parsed = answersSchema.safeParse(answers)
    if (!parsed.success) {
      const next: Partial<Record<keyof Answers, string>> = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Answers] = issue.message
      setErrors(next)
      clearDecision()
      return
    }
    const rated = photoRatingsSchema.safeParse(ratings)
    setErrors({})
    setDecision(
      evaluate({
        answers: parsed.data,
        checklist: checklistSchema.parse(checklist),
        role,
        photoRatings: isConsultant && rated.success ? rated.data : null,
        today: todayIso(),
      }),
    )
    setReview({ status: "proposal" })
  }

  const missing = Object.keys(errors).filter((k) => errors[k as keyof Answers]).length
  const q3Unknown = answers.lastInPerson === "unknown"

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-4 pt-6">
        <div>
          <h1 className="text-2xl font-semibold text-teal-800">RheumRoute PH</h1>
          <p className="text-sm text-slate-500">Pre-booking screen for rheumatology teleconsults</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex flex-col">
            <span className="text-slate-500">Role (demo setting, not a login)</span>
            <select value={role} onChange={(e) => changeRole(e.target.value as Role)} className="mt-1 rounded border bg-white px-2 py-1.5 capitalize">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-slate-500">Load a sample case</span>
            <select value={sampleId} onChange={(e) => loadSample(e.target.value)} className="mt-1 rounded border bg-white px-2 py-1.5">
              <option value="">Choose…</option>
              {SAMPLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-6 lg:col-span-3">
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-1 font-semibold">Screening questions</h2>
            <p className="mb-2 text-xs text-slate-500">All 10 are required.</p>
            <div className="divide-y">
              {QUESTIONS.map((q) => (
                <div key={q.key}>
                  <Row id={q.id} text={q.text}>
                    {q.key === "lastInPerson" ? (
                      <div className={`flex shrink-0 items-center gap-2 rounded ${errors.lastInPerson ? "ring-2 ring-red-400 ring-offset-1" : ""}`}>
                        <input
                          type="date"
                          aria-label="Date of last in-person review"
                          value={q3Unknown ? "" : (answers.lastInPerson ?? "")}
                          disabled={q3Unknown}
                          onChange={(e) => setAnswer("lastInPerson", e.target.value)}
                          className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                        />
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={q3Unknown} onChange={(e) => setAnswer("lastInPerson", e.target.checked ? "unknown" : "")} />
                          unknown
                        </label>
                      </div>
                    ) : (
                      <Segmented
                        name={q.id}
                        options={ANSWER_OPTIONS}
                        value={answers[q.key] as Answer | undefined}
                        onChange={(v) => setAnswer(q.key, v)}
                        invalid={!!errors[q.key]}
                      />
                    )}
                  </Row>
                  {errors[q.key] && <p className="-mt-1 pb-2 text-xs text-red-600">{errors[q.key]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-1 font-semibold">Readiness checklist</h2>
            <p className="mb-2 text-xs text-slate-500">Never blocks a booking; only adds conditions. Unanswered or unknown counts as not done.</p>
            <div className="divide-y">
              {CHECKLIST.map((c) => (
                <Row key={c.key} id={c.id} text={c.text}>
                  <Segmented name={c.id} options={ANSWER_OPTIONS} value={checklist[c.key]} onChange={(v) => setCheck(c.key, v)} />
                </Row>
              ))}
            </div>
          </div>

          {checklist.photosSent === "yes" && (
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-1 font-semibold">Photo quality rating</h2>
              <p className="mb-2 text-xs text-slate-500">
                {isConsultant
                  ? "Rate all five items. Photos are viewed outside the app; the app never receives images."
                  : "Only the consultant can rate photos, so this screen will escalate to the consultant."}
              </p>
              <div className="divide-y">
                {PHOTO_ITEMS.map((p) => (
                  <Row key={p.key} text={p.text}>
                    <Segmented name={p.text} options={RATING_OPTIONS} value={ratings[p.key]} onChange={(v) => setRating(p.key, v)} disabled={!isConsultant} />
                  </Row>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={runScreen} className="rounded bg-teal-700 px-5 py-2.5 font-medium text-white hover:bg-teal-800">
              Run screen
            </button>
            <button type="button" onClick={reset} className="rounded border px-4 py-2.5 text-sm hover:bg-slate-100">
              Clear form
            </button>
            {missing > 0 && <p className="text-sm text-red-600">{missing} required {missing === 1 ? "answer is" : "answers are"} missing.</p>}
          </div>
        </section>

        <section className="space-y-4 self-start lg:sticky lg:top-4 lg:col-span-2">
          {!decision ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-slate-500">
              Fill in the form or load a sample case, then press <strong>Run screen</strong>.
            </div>
          ) : (
            <>
              <DecisionCard decision={decision} review={review} />

              {isConsultant ? (
                review.status === "proposal" && (
                  <div className="rounded-lg border bg-white p-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setReview({ status: "confirmed" })} className="rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800">
                        Confirm
                      </button>
                      <button type="button" onClick={() => setOverrideOpen((o) => !o)} className="rounded border px-4 py-2 hover:bg-slate-100">
                        Override…
                      </button>
                    </div>
                    {overrideOpen && (
                      <form
                        className="mt-3 space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (overrideReason.trim().length < 5) return
                          setReview({ status: "overridden", outcome: overrideOutcome, reason: overrideReason.trim() })
                          setOverrideOpen(false)
                        }}
                      >
                        <label className="block">
                          <span className="text-xs text-slate-500">New outcome</span>
                          <select value={overrideOutcome} onChange={(e) => setOverrideOutcome(e.target.value as Outcome)} className="mt-1 block w-full rounded border bg-white px-2 py-1.5">
                            {PRIORITY.filter((o) => o !== decision.outcome).map((o) => (
                              <option key={o} value={o}>
                                {OUTCOME_STYLE[o].label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-xs text-slate-500">Reason (required)</span>
                          <textarea
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            rows={2}
                            maxLength={500}
                            placeholder="e.g. known chronic headache, unchanged for years"
                            className="mt-1 block w-full rounded border p-2"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={overrideReason.trim().length < 5}
                          className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Save override
                        </button>
                      </form>
                    )}
                    <p className="mt-2 text-xs text-slate-500">Every outcome is a proposal until you confirm. Overrides need a written reason.</p>
                  </div>
                )
              ) : (
                review.status === "proposal" && (
                  <div className="rounded-lg border bg-white p-4 text-sm">
                    <button type="button" onClick={() => setReview({ status: "escalated" })} className="rounded bg-purple-700 px-4 py-2 text-white hover:bg-purple-800">
                      Escalate to consultant
                    </button>
                    <p className="mt-2 text-xs text-slate-500">Only the consultant can confirm or override.</p>
                  </div>
                )
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
