import { computeCredit, formatHeadroom, formatMoney, formatMultiple, formatRecovery } from '../domain/calc.ts'
import type { Assumptions, MemoSnapshot, SourceTab } from '../domain/types.ts'
import { northlineDeal, unitranche } from '../data/seed.ts'
import { AssumptionsPanel } from '../components/AssumptionsPanel.tsx'
import { DiligencePanel } from '../components/DiligencePanel.tsx'
import { MemoPanel } from '../components/MemoPanel.tsx'
import { StructurePanel } from '../components/StructurePanel.tsx'

type Tab = 'structure' | 'diligence' | 'memo'

type DealViewProps = {
  assumptions: Assumptions
  onAssumptions: (next: Assumptions) => void
  tab: Tab
  onTab: (tab: Tab) => void
  memo: MemoSnapshot | null
  stale: boolean
  onGenerate: () => void
  onBack: () => void
  onJump: (source: SourceTab) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'structure', label: 'Structure' },
  { id: 'diligence', label: 'Diligence' },
  { id: 'memo', label: 'IC memo' },
]

export function DealView({
  assumptions,
  onAssumptions,
  tab,
  onTab,
  memo,
  stale,
  onGenerate,
  onBack,
  onJump,
}: DealViewProps) {
  const math = computeCredit(assumptions, unitranche)
  const deal = northlineDeal

  return (
    <div>
      <button type="button" className="text-sm text-pine hover:underline" onClick={onBack}>
        All deals
      </button>
      <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-pine uppercase">{deal.stage}</p>
      <h1 className="mt-1 font-serif text-3xl">{deal.name}</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        {deal.sponsor} is buying the company. This fund would lend. It would not own the equity.
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Company" value={deal.company} />
        <Fact label="Sponsor" value={deal.sponsor} />
        <Fact label="Sector" value={deal.sector} />
        <Fact label="Purpose" value={deal.purpose} />
      </dl>
      <p className="mt-3 text-sm">
        Team: {deal.team.map((person) => `${person.name}, ${person.role}`).join(' · ')}
      </p>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[1fr_16rem]">
        <div id="kpis" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Kpi label="Base-case EBITDA" value={formatMoney(math.base.ebitda)} />
          <Kpi label="Leverage at close" value={formatMultiple(math.base.leverage)} />
          <Kpi label="Interest coverage" value={formatMultiple(math.base.interestCoverage)} />
          <Kpi label="Proposed max-leverage covenant" value={formatMultiple(math.covenantMax)} />
          <div className="rounded-lg border border-line bg-card p-3 sm:col-span-2">
            <div className="tip">
              <p className="text-xs text-muted">
                Headroom{' '}
                <button type="button" className="text-pine">
                  What this means
                </button>
              </p>
              <p className="tip-box">
                Share of current EBITDA that can be lost before the covenant breaks. At close this equals the cushion this fund proposes, because the covenant is set from that cushion. A negative number means the case is already through the covenant.
              </p>
            </div>
            <p className="mt-1 text-lg font-semibold">At close {formatHeadroom(math.base.headroom)}</p>
            <p className={`text-sm ${math.downside.headroom < 0 ? 'text-warn' : 'text-pine'}`}>
              Downside {formatHeadroom(math.downside.headroom)}
              {math.downside.covenantBreached
                ? ` · leverage ${formatMultiple(math.downside.leverage)} breaks ${formatMultiple(math.covenantMax)}`
                : ` · leverage ${formatMultiple(math.downside.leverage)} is inside the covenant`}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 sm:col-span-2 xl:col-span-3">
            <p className="text-xs text-muted">Downside case</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <Mini label="EBITDA" value={formatMoney(math.downside.ebitda)} />
              <Mini label="Leverage" value={formatMultiple(math.downside.leverage)} />
              <Mini label="Interest coverage" value={formatMultiple(math.downside.interestCoverage)} />
              <Mini label="Distressed multiple" value={formatMultiple(assumptions.distressedMultiple)} />
              <Mini label="Stressed enterprise value" value={formatMoney(math.downside.stressedEv)} />
              <Mini label="Recovery" value={formatRecovery(math.downside.recovery)} />
            </div>
            <p className="mt-2 text-xs text-muted">Recovery leaves out workout costs and timing.</p>
          </div>
        </div>
        <AssumptionsPanel assumptions={assumptions} onChange={onAssumptions} />
      </div>

      <div id="deal-tabs" className="mt-6">
        <div className="flex gap-2 border-b border-line">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`px-3 py-2 text-sm ${tab === item.id ? 'border-b-2 border-pine font-semibold text-pine' : 'text-muted'}`}
              onClick={() => onTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="pt-4">
          {tab === 'structure' && <StructurePanel assumptions={assumptions} />}
          {tab === 'diligence' && <DiligencePanel />}
          {tab === 'memo' && <MemoPanel memo={memo} stale={stale} onGenerate={onGenerate} onJump={onJump} />}
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-card px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}
