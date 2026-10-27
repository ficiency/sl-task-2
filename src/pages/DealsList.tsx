import { formatMoney } from '../domain/calc.ts'
import { pipeline, unitranche } from '../data/seed.ts'

type DealsListProps = {
  onOpen: () => void
}

export function DealsList({ onOpen }: DealsListProps) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.16em] text-pine uppercase">Private credit</p>
      <h1 className="mt-1 font-serif text-3xl text-ink">Deal pipeline</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        One live file. The other rows are context for the list and do not open.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {pipeline.map((row) => {
              const size = row.openable ? unitranche.amount : row.listSize
              return (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">
                    {row.openable ? (
                      <button type="button" className="text-pine underline-offset-2 hover:underline" onClick={onOpen}>
                        {row.name}
                      </button>
                    ) : (
                      <span className="text-muted">{row.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{row.stage}</td>
                  <td className="px-4 py-3">{size === undefined ? '—' : formatMoney(size)}</td>
                  <td className="px-4 py-3 text-muted">
                    {row.openable ? 'Open' : 'Context only'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
