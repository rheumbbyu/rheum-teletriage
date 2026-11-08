// Date helpers for YYYY-MM-DD strings. Pure: no system clock.

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value + "T00:00:00Z")
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

// Adds whole months; clamps to the last day of the month (2026-01-31 + 1 → 2026-02-28).
export function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split("-").map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}
