import { documents, risks, workstreams, condition } from '../data/seed.ts'

export function DiligencePanel() {
  const linkedRisk = risks.find((risk) => risk.id === condition.riskId)

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Workstreams</h2>
        <p className="mt-1 text-xs text-muted">Documents are names and status only. The files themselves are not here.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {workstreams.map((stream) => (
            <article key={stream.id} className="rounded border border-line p-3">
              <h3 className="font-medium">{stream.name}</h3>
              <p className="mt-1 text-xs text-muted">{stream.owner}</p>
              <p className="text-xs text-pine">{stream.status}</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {documents
                  .filter((document) => document.workstreamId === stream.id)
                  .map((document) => (
                    <li key={document.id} className="flex items-start justify-between gap-3">
                      <span>{document.name}</span>
                      <span className="shrink-0 text-xs text-muted">{document.status}</span>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Risks</h2>
        <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs text-muted uppercase">
            <tr>
              <th className="py-2 pr-3 font-medium">Fact</th>
              <th className="py-2 pr-3 font-medium">Implication for the loan</th>
              <th className="py-2 pr-3 font-medium">Mitigant</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => {
              const open = risk.status === 'Open'
              return (
                <tr key={risk.id} className={open ? 'bg-warn-soft' : 'border-t border-line'}>
                  <td className="py-3 pr-3 align-top font-medium">{risk.fact}</td>
                  <td className="py-3 pr-3 align-top">{risk.implication}</td>
                  <td className="py-3 pr-3 align-top">{risk.mitigant ?? 'Not closed'}</td>
                  <td className="py-3 align-top">
                    <span className={open ? 'rounded bg-warn px-2 py-0.5 text-xs font-semibold text-white' : 'text-pine'}>
                      {risk.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Conditions precedent</h2>
        <p className="mt-3 text-sm">{condition.text}</p>
        <p className="mt-2 text-sm text-muted">
          Status: {condition.status}. Linked to the open risk: {linkedRisk?.fact}.
        </p>
      </section>
    </div>
  )
}
