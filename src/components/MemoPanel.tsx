import type { Figure, MemoSnapshot, NarrativeSections, SourceTab } from '../domain/types.ts'
import { figuresForSection, type MemoSectionKey } from '../memo/buildMemo.ts'

type MemoPanelProps = {
  memo: MemoSnapshot | null
  stale: boolean
  onGenerate: () => void
  onJump: (source: SourceTab) => void
}

const sections: { key: MemoSectionKey; title: string; body: keyof NarrativeSections }[] = [
  { key: 'recommendation', title: 'Recommendation', body: 'recommendation' },
  { key: 'loanTerms', title: 'Loan terms', body: 'loanTerms' },
  { key: 'creditMetrics', title: 'Credit metrics', body: 'creditMetrics' },
  { key: 'downsideAndRecovery', title: 'Downside and recovery', body: 'downsideAndRecovery' },
  { key: 'keyRisks', title: 'Key risks and mitigants', body: 'keyRisks' },
  { key: 'conditions', title: 'Conditions precedent', body: 'conditions' },
]

const tabLabel: Record<SourceTab, string> = {
  overview: 'Overview',
  structure: 'Structure',
  diligence: 'Diligence',
}

export function MemoPanel({ memo, stale, onGenerate, onJump }: MemoPanelProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="rounded bg-pine px-4 py-2 text-sm font-semibold text-white" onClick={onGenerate}>
          Generate IC memo
        </button>
        {stale && (
          <p className="rounded bg-warn-soft px-3 py-1.5 text-sm font-medium text-warn">
            stale: assumptions changed, regenerate
          </p>
        )}
      </div>

      {memo === null ? (
        <p className="text-sm text-muted">The memo is a photo of the file at the moment you generate it.</p>
      ) : (
        <article className="rounded-lg border border-line bg-card p-4">
          <p className="text-xs text-muted">Generated {new Date(memo.generatedAt).toLocaleString()}</p>
          <div className="mt-4 grid gap-6">
            {sections.map((section) => (
              <section key={section.key}>
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 whitespace-pre-line">{memo.narrative[section.body]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {figuresForSection(memo.figures, section.key).map((item) => (
                    <FigureChip key={`${section.key}-${item.id}`} figure={item} onJump={onJump} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      )}
    </div>
  )
}

function FigureChip({ figure, onJump }: { figure: Figure; onJump: (source: SourceTab) => void }) {
  return (
    <button
      type="button"
      className="max-w-xs rounded border border-line bg-paper px-2 py-1 text-left text-xs hover:border-pine"
      onClick={() => onJump(figure.sourceTab)}
    >
      <span className="block text-muted">{figure.label}</span>
      <span className="font-medium text-ink">{figure.display}</span>
      <span className="mt-0.5 block text-pine">{tabLabel[figure.sourceTab]}</span>
    </button>
  )
}
