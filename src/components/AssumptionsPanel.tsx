import { useEffect, useRef, useState } from 'react'
import type { Assumptions } from '../domain/types.ts'

type AssumptionsPanelProps = {
  assumptions: Assumptions
  onChange: (next: Assumptions) => void
}

type Draft = {
  sofr: string
  stress: string
  cushion: string
  multiple: string
}

function percentText(value: number): string {
  return (Math.round(value * 10000) / 100).toFixed(2)
}

export function AssumptionsPanel({ assumptions, onChange }: AssumptionsPanelProps) {
  const [draft, setDraft] = useState<Draft>({
    sofr: percentText(assumptions.sofr),
    stress: percentText(assumptions.stress),
    cushion: percentText(assumptions.covenantCushion),
    multiple: assumptions.distressedMultiple.toFixed(1),
  })
  const [invalid, setInvalid] = useState<Partial<Record<keyof Draft, boolean>>>({})
  const assumptionsRef = useRef(assumptions)
  const timers = useRef<Partial<Record<keyof Draft, ReturnType<typeof setTimeout>>>>({})

  useEffect(() => {
    assumptionsRef.current = assumptions
  })

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of Object.values(pending)) {
        if (timer !== undefined) clearTimeout(timer)
      }
    }
  }, [])

  const ranges = {
    sofr: { min: 0, max: 15 },
    stress: { min: -80, max: 0 },
    multiple: { min: 1, max: 15 },
    cushion: { min: 5, max: 60 },
  } as const

  function readNumber(raw: string): number | null {
    if (raw.trim() === '' || raw === '-' || raw === '.' || raw === '-.') return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  }

  function round6(value: number): number {
    return Math.round(value * 1e6) / 1e6
  }

  function inRange(key: keyof Draft, value: number): boolean {
    return value >= ranges[key].min && value <= ranges[key].max
  }

  function markInvalid(key: keyof Draft, bad: boolean) {
    setInvalid((prev) => ({ ...prev, [key]: bad }))
  }

  function lastValidText(key: keyof Draft): string {
    if (key === 'sofr') return percentText(assumptions.sofr)
    if (key === 'stress') return percentText(assumptions.stress)
    if (key === 'cushion') return percentText(assumptions.covenantCushion)
    return assumptions.distressedMultiple.toFixed(1)
  }

  function clearTimer(key: keyof Draft) {
    const timer = timers.current[key]
    if (timer === undefined) return
    clearTimeout(timer)
    delete timers.current[key]
  }

  function applyField(key: keyof Draft, value: number) {
    const current = assumptionsRef.current
    const next =
      key === 'sofr'
        ? { ...current, sofr: value }
        : key === 'stress'
          ? { ...current, stress: value }
          : key === 'cushion'
            ? { ...current, covenantCushion: value }
            : { ...current, distressedMultiple: value }
    assumptionsRef.current = next
    onChange(next)
  }

  function storedValue(key: keyof Draft, typed: number): number {
    return round6(key === 'multiple' ? typed : typed / 100)
  }

  function edit(key: keyof Draft, raw: string) {
    setDraft((prev) => ({ ...prev, [key]: raw }))
    clearTimer(key)
    const typed = readNumber(raw)
    if (typed === null || !inRange(key, typed)) {
      markInvalid(key, typed !== null)
      return
    }
    markInvalid(key, false)
    const value = storedValue(key, typed)
    timers.current[key] = setTimeout(() => {
      delete timers.current[key]
      applyField(key, value)
    }, 400)
  }

  function finish(key: keyof Draft, raw: string) {
    clearTimer(key)
    const typed = readNumber(raw)
    if (typed !== null && inRange(key, typed)) {
      applyField(key, storedValue(key, typed))
      return
    }
    setDraft((prev) => ({ ...prev, [key]: lastValidText(key) }))
    markInvalid(key, false)
  }

  return (
    <aside className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Assumptions</h2>
      <p className="mt-1 text-xs text-muted">Edits recalculate the file. They do not rewrite a memo already generated.</p>

      <label className="mt-4 block text-xs text-muted">
        SOFR (%)
        <input
          className="mt-1 w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink"
          inputMode="decimal"
          value={draft.sofr}
          onChange={(event) => {
            edit('sofr', event.target.value)
          }}
          onBlur={(event) => finish('sofr', event.currentTarget.value)}
        />
        {invalid.sofr ? <span className="mt-1 block">Out of range (0 to 15).</span> : null}
        <span className="mt-1 block">Illustrative assumption. No source.</span>
      </label>

      <label className="mt-3 block text-xs text-muted">
        Stress (%)
        <input
          className="mt-1 w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink"
          inputMode="decimal"
          value={draft.stress}
          onChange={(event) => {
            edit('stress', event.target.value)
          }}
          onBlur={(event) => finish('stress', event.currentTarget.value)}
        />
        {invalid.stress ? <span className="mt-1 block">Out of range (-80 to 0).</span> : null}
        <span className="mt-1 block">Percent change in EBITDA for the downside case.</span>
      </label>

      <label className="mt-3 block text-xs text-muted">
        Distressed multiple (x)
        <input
          className="mt-1 w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink"
          inputMode="decimal"
          value={draft.multiple}
          onChange={(event) => {
            edit('multiple', event.target.value)
          }}
          onBlur={(event) => finish('multiple', event.currentTarget.value)}
        />
        {invalid.multiple ? <span className="mt-1 block">Out of range (1 to 15).</span> : null}
        <span className="mt-1 block">Illustrative assumption. No source.</span>
      </label>

      <label className="mt-3 block text-xs text-muted">
        Covenant cushion (%)
        <input
          className="mt-1 w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink"
          inputMode="decimal"
          value={draft.cushion}
          onChange={(event) => {
            edit('cushion', event.target.value)
          }}
          onBlur={(event) => finish('cushion', event.currentTarget.value)}
        />
        {invalid.cushion ? <span className="mt-1 block">Out of range (5 to 60).</span> : null}
        <span className="mt-1 block">The cushion this fund proposes. Not a market rule.</span>
      </label>
    </aside>
  )
}
