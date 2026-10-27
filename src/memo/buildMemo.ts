import { computeCredit, floorSentence, formatHeadroom, formatMoney, formatMultiple, formatRate, formatRecovery } from '../domain/calc.ts'
import type { Assumptions, Figure, MemoSnapshot, SourceTab } from '../domain/types.ts'
import { condition, risks, unitranche } from '../data/seed.ts'
import { templateNarrative } from './narrative.ts'

function figure(id: string, label: string, value: number, display: string, sourceTab: SourceTab): Figure {
  return { id, label, value, display, sourceTab }
}

export function buildFigures(assumptions: Assumptions): Figure[] {
  const math = computeCredit(assumptions, unitranche)
  const openRisk = risks.find((risk) => risk.id === condition.riskId)

  return [
    figure('recommendation', 'Recommendation', 1, 'Approve with conditions', 'overview'),
    figure('instrument', 'Instrument', math.loanAmount, unitranche.kind, 'structure'),
    figure('lien', 'Lien', 1, unitranche.lien, 'structure'),
    figure('loanAmount', 'Loan amount', math.loanAmount, formatMoney(math.loanAmount), 'structure'),
    figure('tenor', 'Tenor', unitranche.termYears, `${unitranche.termYears} years`, 'structure'),
    figure('coupon', 'Coupon', math.coupon, formatRate(math.coupon), 'structure'),
    figure('baseRate', 'Base rate', math.baseRate, formatRate(math.baseRate), 'structure'),
    figure('spread', 'Spread', unitranche.spread, formatRate(unitranche.spread), 'structure'),
    figure('cashInterest', 'Cash interest', math.cashInterest, formatMoney(math.cashInterest), 'structure'),
    figure('floorNote', 'Floor', math.floorIsBinding ? 1 : 0, floorSentence(assumptions.sofr, unitranche.floor), 'structure'),
    figure('oid', 'OID', unitranche.oid, formatRate(unitranche.oid), 'structure'),
    figure('netFunded', 'Net funded', math.netFunded, formatMoney(math.netFunded), 'structure'),
    figure('callProtection', 'Call protection', 0, unitranche.callProtection, 'structure'),
    figure('collateral', 'Collateral', 0, unitranche.collateral, 'structure'),
    figure('baseEbitda', 'Base-case EBITDA', math.base.ebitda, formatMoney(math.base.ebitda), 'overview'),
    figure('leverageClose', 'Leverage at close', math.base.leverage, formatMultiple(math.base.leverage), 'overview'),
    figure('covenantMax', 'Proposed max leverage', math.covenantMax, formatMultiple(math.covenantMax), 'overview'),
    figure('headroomClose', 'Headroom at close', math.base.headroom, formatHeadroom(math.base.headroom), 'overview'),
    figure('coverageClose', 'Interest coverage', math.base.interestCoverage, formatMultiple(math.base.interestCoverage), 'overview'),
    figure('stressedEbitda', 'Downside EBITDA', math.downside.ebitda, formatMoney(math.downside.ebitda), 'overview'),
    figure('leverageDown', 'Downside leverage', math.downside.leverage, formatMultiple(math.downside.leverage), 'overview'),
    figure('coverageDown', 'Downside interest coverage', math.downside.interestCoverage, formatMultiple(math.downside.interestCoverage), 'overview'),
    figure('headroomDown', 'Downside headroom', math.downside.headroom, formatHeadroom(math.downside.headroom), 'overview'),
    figure('stress', 'Stress', assumptions.stress, formatHeadroom(assumptions.stress), 'overview'),
    figure('distressedMultiple', 'Distressed multiple', assumptions.distressedMultiple, formatMultiple(assumptions.distressedMultiple), 'overview'),
    figure('purchaseMultiple', 'Entry multiple', assumptions.purchaseMultiple, formatMultiple(assumptions.purchaseMultiple), 'structure'),
    figure('stressedEv', 'Downside enterprise value', math.downside.stressedEv, formatMoney(math.downside.stressedEv), 'overview'),
    figure('recovery', 'Recovery', math.downside.recovery, formatRecovery(math.downside.recovery), 'overview'),
    figure('condition', 'Condition precedent', 1, condition.text, 'diligence'),
    figure('linkedRisk', 'Linked risk', 1, openRisk?.fact ?? '', 'diligence'),
    figure('purchasePrice', 'Purchase price', math.purchasePrice, formatMoney(math.purchasePrice), 'structure'),
    figure('sponsorEquity', 'Sponsor equity', math.sponsorEquity, formatMoney(math.sponsorEquity), 'structure'),
  ]
}

const sectionFigureIds = {
  recommendation: [],
  loanTerms: ['instrument', 'lien', 'loanAmount', 'tenor', 'coupon', 'baseRate', 'spread', 'cashInterest', 'floorNote', 'oid', 'netFunded', 'callProtection', 'collateral', 'purchasePrice', 'sponsorEquity'],
  creditMetrics: ['baseEbitda', 'leverageClose', 'covenantMax', 'headroomClose', 'coverageClose', 'stressedEbitda', 'leverageDown', 'coverageDown', 'headroomDown'],
  downsideAndRecovery: ['stress', 'distressedMultiple', 'purchaseMultiple', 'stressedEv', 'recovery'],
  keyRisks: ['linkedRisk'],
  conditions: ['condition', 'linkedRisk'],
} as const

export type MemoSectionKey = keyof typeof sectionFigureIds

export function figuresForSection(figures: Figure[], section: MemoSectionKey): Figure[] {
  const ids = new Set<string>(sectionFigureIds[section])
  return figures.filter((item) => ids.has(item.id))
}

// Builds a memo photo from the current assumptions. The photo is a copy.
export async function buildMemo(assumptions: Assumptions): Promise<MemoSnapshot> {
  const copiedAssumptions = structuredClone(assumptions)
  const figures = buildFigures(copiedAssumptions)
  const narrative = await templateNarrative.generate(structuredClone(figures), structuredClone(risks))

  return {
    generatedAt: new Date().toISOString(),
    assumptions: structuredClone(copiedAssumptions),
    figures: structuredClone(figures),
    narrative,
  }
}
