import { computeCredit, floorSentence, formatMoney, formatMultiple, formatRate } from '../domain/calc.ts'
import type { Assumptions } from '../domain/types.ts'
import { unitranche } from '../data/seed.ts'

type StructurePanelProps = {
  assumptions: Assumptions
}

export function StructurePanel({ assumptions }: StructurePanelProps) {
  const math = computeCredit(assumptions, unitranche)
  const total = math.purchasePrice || 1
  const loanShare = (math.loanAmount / total) * 100
  const equityShare = (math.sponsorEquity / total) * 100

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Capital structure</h2>
        <p className="mt-1 text-xs text-muted">The loan is paid first. Sponsor equity is the cushion under it, not an instrument of the fund.</p>
        <div className="mt-4 grid gap-2">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Unitranche · first lien</span>
              <span>{formatMoney(math.loanAmount)}</span>
            </div>
            <div className="h-8 overflow-hidden rounded bg-paper">
              <div className="h-full bg-pine" style={{ width: `${loanShare}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Sponsor equity · cushion, paid after the loan</span>
              <span>{formatMoney(math.sponsorEquity)}</span>
            </div>
            <div className="h-8 overflow-hidden rounded bg-paper">
              <div className="h-full bg-brass/80" style={{ width: `${equityShare}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Instrument terms</h2>
        <p className="mt-1 text-xs font-medium text-brass">All terms below are illustrative / synthetic.</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Term label="Instrument" value={`${unitranche.kind}, ${unitranche.lien.toLowerCase()}`} />
          <Term label="Amount" value={formatMoney(math.loanAmount)} />
          <Term label="Tenor" value={`${unitranche.termYears} years`} />
          <Term label="Coupon" value={`${formatRate(math.coupon)} (SOFR + ${formatRate(unitranche.spread)})`} />
          <Term label="Floor" value={formatRate(unitranche.floor)} />
          <Term label="OID" value={formatRate(unitranche.oid)} />
          <Term label="Net funded" value={formatMoney(math.netFunded)} />
          <Term label="Call protection" value={unitranche.callProtection} />
          <Term label="Collateral" value={unitranche.collateral} />
          <Term label="Payment order" value={unitranche.paymentPriority} />
        </dl>
        <p className="mt-4 text-sm">{floorSentence(assumptions.sofr, unitranche.floor)}</p>
        <p className="mt-2 text-sm text-muted">
          OID of {formatRate(unitranche.oid)} means the fund wires {formatMoney(math.netFunded)} for {formatMoney(math.loanAmount)} of face amount. OID does not enter the coupon.
        </p>
      </section>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-sm font-semibold">Sources and uses</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs text-muted uppercase">
            <tr>
              <th className="py-1 font-medium"> </th>
              <th className="py-1 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Unitranche face" amount={math.loanAmount} />
            <Row label="Sponsor equity" amount={math.sponsorEquity} />
            <Row label="Total sources" amount={math.sources} strong />
            <Row label="Purchase price" amount={math.uses} />
            <Row label="Entry multiple" amountLabel={formatMultiple(assumptions.purchaseMultiple)} />
            <Row label="Total uses" amount={math.uses} strong />
          </tbody>
        </table>
        <p className="mt-3 text-sm text-muted">
          Fees and OID are left out of this table. At {formatRate(unitranche.oid)} OID the fund wires {formatMoney(math.netFunded)} for {formatMoney(math.loanAmount)} of face amount.
        </p>
      </section>
    </div>
  )
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Row({ label, amount, amountLabel, strong }: { label: string; amount?: number; amountLabel?: string; strong?: boolean }) {
  return (
    <tr className={strong ? 'border-t border-line font-semibold' : ''}>
      <td className="py-1.5">{label}</td>
      <td className="py-1.5">{amountLabel ?? (amount === undefined ? '' : formatMoney(amount))}</td>
    </tr>
  )
}
