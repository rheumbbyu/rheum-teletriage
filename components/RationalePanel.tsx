"use client"

import { useState } from "react"
import type { RationaleRequest } from "@/lib/ai/rationale"
import { NOTES_MAX } from "@/lib/schema"
import type { AiRationale } from "@/lib/types"

type Result =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; rationale: AiRationale; notesWarning: boolean }
  | { status: "unavailable"; message: string; notesWarning: boolean }

// Consultant only. Shown under the decision card and never changes it (AC4.1).
export function RationalePanel({ request }: { request: Omit<RationaleRequest, "notes"> }) {
  const [notes, setNotes] = useState("")
  const [result, setResult] = useState<Result>({ status: "idle" })

  async function explain() {
    setResult({ status: "loading" })
    try {
      const res = await fetch("/api/rationale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, notes }),
      })
      const data = await res.json()
      if (res.ok && data.rationale) setResult({ status: "done", rationale: data.rationale, notesWarning: !!data.notesWarning })
      else setResult({ status: "unavailable", message: data.error ?? "rationale unavailable", notesWarning: !!data.notesWarning })
    } catch {
      setResult({ status: "unavailable", message: "rationale unavailable", notesWarning: false })
    }
  }

  const warning = (result.status === "done" || result.status === "unavailable") && result.notesWarning

  return (
    <div className="rounded-lg border bg-white p-4 text-sm">
      <h3 className="font-semibold">
        Guideline rationale <span className="text-xs font-normal text-slate-500">(Claude, consultant only)</span>
      </h3>
      <p className="mt-1 text-xs text-slate-500">Explains the outcome above using APLAR and UP MIU. It can suggest a stricter outcome, never a looser one, and never changes the card.</p>

      <label className="mt-3 block text-xs text-slate-500" htmlFor="notes">
        Consultant notes (optional, {notes.length}/{NOTES_MAX})
      </label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={NOTES_MAX}
        rows={2}
        placeholder="e.g. known chronic headache, stable for years. Synthetic data only."
        className="mt-1 block w-full rounded border p-2"
      />
      <button
        type="button"
        onClick={explain}
        disabled={result.status === "loading"}
        className="mt-2 rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:cursor-wait disabled:opacity-60"
      >
        {result.status === "loading" ? "Asking Claude…" : "Explain with Claude"}
      </button>

      {warning && (
        <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-amber-900">
          Your notes look like they try to change the outcome. Notes are treated as information only; the outcome comes from the rules.
        </p>
      )}

      {result.status === "unavailable" && <p className="mt-3 rounded bg-slate-100 px-3 py-2 text-slate-600">Rationale unavailable. The outcome and rules above still apply.</p>}

      {result.status === "done" && (
        <div className="mt-3 space-y-3">
          {result.rationale.suggestedOutcome === "STRICTER" && (
            <p className="rounded bg-red-50 px-3 py-2 text-red-800">
              <strong>Claude suggests a stricter outcome.</strong> {result.rationale.stricterReason}
            </p>
          )}
          <p>{result.rationale.rationale}</p>
          {result.rationale.citations.length > 0 && (
            <p className="flex flex-wrap gap-1">
              {result.rationale.citations.map((c) => (
                <span key={c} className="rounded bg-teal-50 px-1.5 py-0.5 text-xs text-teal-800">
                  {c}
                </span>
              ))}
            </p>
          )}
          {result.rationale.considerations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500">Considerations</h4>
              <ul className="ml-4 list-disc">
                {result.rationale.considerations.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {result.rationale.clarifyingQuestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500">Questions to ask</h4>
              <ul className="ml-4 list-disc">
                {result.rationale.clarifyingQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-400">AI-generated explanation. Check it against the guidelines; the consultant decides.</p>
        </div>
      )}
    </div>
  )
}
