"use client"

import type { Decision, Outcome } from "@/lib/types"

export const OUTCOME_STYLE: Record<Outcome, { label: string; header: string; border: string }> = {
  EMERGENCY: { label: "DECLINE → EMERGENCY", header: "bg-red-600", border: "border-red-300" },
  BOOK_IN_PERSON: { label: "DECLINE → BOOK IN-PERSON", header: "bg-orange-600", border: "border-orange-300" },
  ESCALATE: { label: "ESCALATE TO CONSULTANT", header: "bg-purple-700", border: "border-purple-300" },
  INCOMPLETE: { label: "INCOMPLETE", header: "bg-slate-600", border: "border-slate-300" },
  ACCEPT_WITH_CONDITIONS: { label: "ACCEPT WITH CONDITIONS", header: "bg-sky-700", border: "border-sky-300" },
  ACCEPT: { label: "ACCEPT", header: "bg-green-700", border: "border-green-300" },
}

// Neutral wording for staff to read to the patient; no clinical advice (AC5.4).
const SCRIPT_EMERGENCY =
  "Thank you for contacting the clinic. Based on what you have told us, please go to the nearest emergency room now. We are informing your doctor."
const SCRIPT_IN_PERSON =
  "Thank you for booking. Based on the clinic's teleconsult guidelines, your doctor needs to see you in person this time. We will help you book a clinic visit."

export type Review =
  | { status: "proposal" }
  | { status: "confirmed" }
  | { status: "overridden"; outcome: Outcome; reason: string }
  | { status: "escalated" }

export function DecisionCard({ decision, review }: { decision: Decision; review: Review }) {
  const shown = review.status === "overridden" ? review.outcome : decision.outcome
  const style = OUTCOME_STYLE[shown]
  const isAccept = shown === "ACCEPT" || shown === "ACCEPT_WITH_CONDITIONS"
  const ruleIds = decision.firedRules.map((h) => h.rule)

  return (
    <div className={`overflow-hidden rounded-lg border-2 bg-white text-sm ${style.border}`}>
      <div className={`${style.header} flex items-center justify-between gap-2 px-4 py-3 text-white`}>
        <span className="font-semibold">{style.label}</span>
        <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] tracking-wider">
          {review.status === "proposal" || review.status === "escalated" ? "PROPOSAL" : review.status === "confirmed" ? "CONFIRMED" : "OVERRIDDEN"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {review.status === "overridden" && decision.outcome === "EMERGENCY" && (
          <p className="rounded bg-red-50 px-3 py-2 font-semibold text-red-700">Red flag overridden by consultant.</p>
        )}
        {review.status === "overridden" && (
          <p className="rounded bg-amber-50 px-3 py-2 text-amber-900">
            <strong>Overridden</strong> from {OUTCOME_STYLE[decision.outcome].label}. Reason: {review.reason}
          </p>
        )}
        {review.status === "escalated" && (
          <p className="rounded bg-purple-50 px-3 py-2 text-purple-900">Escalated to the consultant for review.</p>
        )}

        {shown === "EMERGENCY" && <p className="font-semibold text-red-700">Direct the patient to the ER now. Notify the consultant now.</p>}

        {decision.firedRules.length > 0 && (
          <div>
            <h3 className="mb-1 font-semibold">Rules that fired</h3>
            <ul className="space-y-1">
              {decision.firedRules.map((h) => (
                <li key={h.rule} className="flex gap-2">
                  <span className="h-fit shrink-0 rounded bg-slate-100 px-1 font-mono text-xs">{h.rule}</span>
                  <span>{h.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ruleIds.includes("R3") && (
          <p className="text-slate-600">
            If the patient has a treating GP, a doctor-to-doctor consult can be considered for interim guidance and timing of the in-person visit (APLAR Rec 2).
          </p>
        )}

        {isAccept && decision.conditions.length > 0 && (
          <div>
            <h3 className="mb-1 font-semibold">Before the call</h3>
            <ul className="space-y-1">
              {decision.conditions.map((c) => (
                <li key={c} className="flex gap-2">
                  <input type="checkbox" className="mt-0.5" aria-label={c} />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isAccept && (
          <>
            {decision.eligibleUntil && (
              <p>
                <span className="font-semibold">Teleconsult-eligible until</span> {decision.eligibleUntil}
              </p>
            )}
            <p className="text-xs text-slate-500">
              Switch to in-person during the call if: new or unexplained symptoms, difficulty assessing, flare, or a communication gap (APLAR Rec 6).
            </p>
          </>
        )}

        {(shown === "EMERGENCY" || shown === "BOOK_IN_PERSON") && (
          <div className="rounded border bg-slate-50 p-3">
            <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Script for the patient</h3>
            <p>{shown === "EMERGENCY" ? SCRIPT_EMERGENCY : SCRIPT_IN_PERSON}</p>
          </div>
        )}
      </div>
    </div>
  )
}
