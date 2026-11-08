import { Screen } from "@/components/Screen"

export default function Home() {
  return (
    <main className="flex-1">
      <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
        <strong>Synthetic data only. Not for clinical use.</strong> Nothing you enter is saved.
      </div>
      <Screen />
    </main>
  )
}
