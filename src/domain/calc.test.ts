import { describe, expect, it } from 'vitest'
import { buildMemo } from '../memo/buildMemo.ts'
import { narrativeTemplates } from '../memo/narrative.ts'
import {
  baseRate,
  cashInterest,
  computeCredit,
  couponRate,
  floorIsBinding,
  headroom,
  interestCoverage,
  leverage,
  netFunded,
  proposedCovenantMaxLeverage,
  purchasePrice,
  recoveryRatio,
  sponsorEquity,
  stressedEbitda,
} from './calc.ts'
import { northlineAssumptions, unitranche } from '../data/seed.ts'

const loan = 180
const ebitda = 40
const sofr = 0.043
const floor = 0.0075
const spread = 0.0525
const cushion = 0.3

describe('credit math', () => {
  it('prices the purchase, the equity cushion, and closing leverage', () => {
    expect(purchasePrice(ebitda, 9)).toBe(360)
    expect(sponsorEquity(360, loan)).toBe(180)
    expect(leverage(loan, ebitda)).toBe(4.5)
  })

  it('prices the coupon from SOFR plus spread, and keeps OID out of it', () => {
    expect(couponRate(sofr, floor, spread)).toBeCloseTo(0.0955, 4)
    expect(cashInterest(loan, 0.0955)).toBeCloseTo(17.19)
    expect(interestCoverage(ebitda, 17.19)).toBeCloseTo(2.33, 2)
    expect(netFunded(loan, 0.02)).toBeCloseTo(176.4)
  })

  it('sets the covenant from the EBITDA cushion, not from leverage times 1.30', () => {
    const max = proposedCovenantMaxLeverage(4.5, cushion)
    expect(max).toBeCloseTo(6.43, 2)
    expect(max).not.toBeCloseTo(4.5 * 1.3, 2)
    expect(headroom(4.5, max)).toBeCloseTo(0.3, 2)
  })

  it('shows a broken covenant and high recovery when EBITDA falls 35%', () => {
    const downEbitda = stressedEbitda(ebitda, -0.35)
    const downLeverage = leverage(loan, downEbitda)
    const max = proposedCovenantMaxLeverage(4.5, cushion)
    expect(downEbitda).toBeCloseTo(26)
    expect(downLeverage).toBeCloseTo(6.92, 2)
    expect(interestCoverage(downEbitda, 17.19)).toBeCloseTo(1.51, 2)
    expect(headroom(downLeverage, max)).toBeCloseTo(-0.077, 3)
    expect(downLeverage > max).toBe(true)
    expect(recoveryRatio(downEbitda * 6, loan)).toBeCloseTo(0.867, 3)
  })

  it('lets the floor bind only when SOFR is underneath it', () => {
    expect(floorIsBinding(0.043, floor)).toBe(false)
    expect(baseRate(0.043, floor)).toBeCloseTo(0.043)
    expect(floorIsBinding(0.005, floor)).toBe(true)
    expect(baseRate(0.005, floor)).toBeCloseTo(0.0075)
  })

  it('matches the seeded Northline case', () => {
    const math = computeCredit(northlineAssumptions, unitranche)
    expect(math.purchasePrice).toBe(360)
    expect(math.sponsorEquity).toBe(180)
    expect(math.sources).toBe(360)
    expect(math.uses).toBe(360)
    expect(math.base.leverage).toBe(4.5)
    expect(math.base.headroom).toBeCloseTo(0.3, 2)
    expect(math.downside.covenantBreached).toBe(true)
    expect(math.downside.recovery).toBeCloseTo(0.867, 3)
    expect(math.netFunded).toBeCloseTo(176.4)
  })
})

describe('memo photo', () => {
  it('keeps narrative templates free of hard-coded digits', () => {
    for (const template of Object.values(narrativeTemplates)) {
      const withoutPlaceholders = template.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '')
      expect(withoutPlaceholders).not.toMatch(/\d/)
    }
  })

  it('builds a memo whose sentences are closed and cite the open risk', async () => {
    const snapshot = await buildMemo(structuredClone(northlineAssumptions))
    const text = Object.values(snapshot.narrative).join('\n')
    expect(text).not.toContain('{{')
    expect(text).not.toContain('  ')
    expect(text).not.toContain(' .')
    expect(text).not.toContain('..')
    expect(snapshot.narrative.keyRisks).toContain('Top customer = 28% of sales.')
    expect(snapshot.narrative.keyRisks).toContain('Mitigant: Not closed.')
  })

  it('calls a downside breach an early warning and a mild downside inside the covenant', async () => {
    const breached = await buildMemo(structuredClone(northlineAssumptions))
    expect(breached.narrative.downsideAndRecovery).toContain('early-warning trigger')

    const inside = await buildMemo({ ...northlineAssumptions, stress: -0.05 })
    expect(inside.narrative.downsideAndRecovery).not.toContain('early-warning trigger')
    expect(inside.narrative.downsideAndRecovery).toContain('stays inside the proposed covenant')
  })

  it('does not change an existing memo when assumptions change', async () => {
    const assumptions = structuredClone(northlineAssumptions)
    const snapshot = await buildMemo(assumptions)
    assumptions.sofr = 0.2
    assumptions.stress = -0.1
    assumptions.covenantCushion = 0.5
    expect(snapshot.assumptions.sofr).toBeCloseTo(0.043)
    expect(snapshot.assumptions.stress).toBeCloseTo(-0.35)
    expect(snapshot.assumptions.covenantCushion).toBeCloseTo(0.3)
    expect(snapshot.assumptions).not.toBe(assumptions)
  })
})
