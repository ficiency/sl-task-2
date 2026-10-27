import { useState } from 'react'
import { sameAssumptions } from './domain/calc.ts'
import type { Assumptions, MemoSnapshot, SourceTab } from './domain/types.ts'
import { northlineAssumptions } from './data/seed.ts'
import { buildMemo } from './memo/buildMemo.ts'
import { Banner } from './components/Banner.tsx'
import { DealView } from './pages/DealView.tsx'
import { DealsList } from './pages/DealsList.tsx'

type Tab = 'structure' | 'diligence' | 'memo'

export default function App() {
  const [view, setView] = useState<'list' | 'deal'>('list')
  const [tab, setTab] = useState<Tab>('structure')
  const [assumptions, setAssumptions] = useState<Assumptions>(() => structuredClone(northlineAssumptions))
  const [memo, setMemo] = useState<MemoSnapshot | null>(null)

  const stale = memo !== null && !sameAssumptions(memo.assumptions, assumptions)

  function jump(source: SourceTab) {
    if (source === 'overview') {
      document.getElementById('kpis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setTab(source)
    document.getElementById('deal-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function generate() {
    const snapshot = await buildMemo(assumptions)
    setMemo(snapshot)
    setTab('memo')
  }

  return (
    <div className="min-h-screen">
      <Banner />
      <main className="mx-auto max-w-6xl px-5 py-6">
        {view === 'list' ? (
          <DealsList onOpen={() => setView('deal')} />
        ) : (
          <DealView
            assumptions={assumptions}
            onAssumptions={setAssumptions}
            tab={tab}
            onTab={setTab}
            memo={memo}
            stale={stale}
            onGenerate={() => {
              void generate()
            }}
            onBack={() => setView('list')}
            onJump={jump}
          />
        )}
      </main>
    </div>
  )
}
