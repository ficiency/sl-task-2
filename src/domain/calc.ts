import type { Assumptions, Security } from './types.ts'

export type CaseMetrics = {
  ebitda: number
  leverage: number
  cashInterest: number
  interestCoverage: number
  headroom: number
  covenantBreached: boolean
}

export type CreditMath = {
  purchasePrice: number
  sponsorEquity: number
  loanAmount: number
  closingLeverage: number
  baseRate: number
  coupon: number
  floorIsBinding: boolean
  cashInterest: number
  base: CaseMetrics
  covenantMax: number
  downside: CaseMetrics & {
    stressedEv: number
    recovery: number
  }
  netFunded: number
  sources: number
  uses: number
}

export function purchasePrice(baseEbitda: number, multiple: number): number {
  return baseEbitda * multiple
}

// Sponsor equity sits under the loan. The fund does not hold it.
export function sponsorEquity(price: number, loanAmount: number): number {
  return price - loanAmount
}

export function leverage(loanAmount: number, ebitda: number): number {
  return loanAmount / ebitda
}

export function baseRate(sofr: number, floor: number): number {
  return Math.max(sofr, floor)
}

export function couponRate(sofr: number, floor: number, spread: number): number {
  return baseRate(sofr, floor) + spread
}

// The floor matters only when SOFR is underneath it.
export function floorIsBinding(sofr: number, floor: number): boolean {
  return sofr < floor
}

export function cashInterest(loanAmount: number, coupon: number): number {
  return loanAmount * coupon
}

// EBITDA divided by cash interest. Principal is not in this ratio.
export function interestCoverage(ebitda: number, interest: number): number {
  return ebitda / interest
}

// Covenant level from an EBITDA cushion. A 30% cushion is leverage / 0.70, not leverage x 1.30.
export function proposedCovenantMaxLeverage(closingLeverage: number, cushion: number): number {
  return closingLeverage / (1 - cushion)
}

// Share of current EBITDA that can still be lost before the covenant breaks.
// A negative number means this case is already through the covenant.
export function headroom(currentLeverage: number, covenantMax: number): number {
  return 1 - currentLeverage / covenantMax
}

export function stressedEbitda(ebitda: number, stress: number): number {
  return ebitda * (1 + stress)
}

export function enterpriseValue(ebitda: number, multiple: number): number {
  return ebitda * multiple
}

// Value of the company in the bad case, divided into the loan, and never more than the loan.
// This leaves out the cost and the time of a workout.
export function recoveryRatio(stressedEv: number, loanAmount: number): number {
  return Math.min(stressedEv, loanAmount) / loanAmount
}

// Cash the fund wires. The borrower still owes the full face amount.
export function netFunded(loanAmount: number, oid: number): number {
  return loanAmount * (1 - oid)
}

export function computeCredit(assumptions: Assumptions, security: Security): CreditMath {
  const price = purchasePrice(assumptions.baseEbitda, assumptions.purchaseMultiple)
  const equity = sponsorEquity(price, security.amount)
  const closingLeverage = leverage(security.amount, assumptions.baseEbitda)
  const rate = baseRate(assumptions.sofr, security.floor)
  const coupon = couponRate(assumptions.sofr, security.floor, security.spread)
  const interest = cashInterest(security.amount, coupon)
  const covenantMax = proposedCovenantMaxLeverage(closingLeverage, assumptions.covenantCushion)
  const downEbitda = stressedEbitda(assumptions.baseEbitda, assumptions.stress)
  const downLeverage = leverage(security.amount, downEbitda)
  const stressedEv = enterpriseValue(downEbitda, assumptions.distressedMultiple)

  return {
    purchasePrice: price,
    sponsorEquity: equity,
    loanAmount: security.amount,
    closingLeverage,
    baseRate: rate,
    coupon,
    floorIsBinding: floorIsBinding(assumptions.sofr, security.floor),
    cashInterest: interest,
    covenantMax,
    netFunded: netFunded(security.amount, security.oid),
    sources: security.amount + equity,
    uses: price,
    base: {
      ebitda: assumptions.baseEbitda,
      leverage: closingLeverage,
      cashInterest: interest,
      interestCoverage: interestCoverage(assumptions.baseEbitda, interest),
      headroom: headroom(closingLeverage, covenantMax),
      covenantBreached: closingLeverage > covenantMax,
    },
    downside: {
      ebitda: downEbitda,
      leverage: downLeverage,
      cashInterest: interest,
      interestCoverage: interestCoverage(downEbitda, interest),
      headroom: headroom(downLeverage, covenantMax),
      covenantBreached: downLeverage > covenantMax,
      stressedEv,
      recovery: recoveryRatio(stressedEv, security.amount),
    },
  }
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(1)}x`
}

export function formatMoney(value: number): string {
  return `$${value.toFixed(1)}M`
}

export function formatRate(value: number): string {
  const percent = Math.round(value * 10000) / 100
  return `${percent.toFixed(2)}%`
}

export function formatHeadroom(value: number): string {
  const percent = Math.round(value * 1000) / 10
  return `${percent.toFixed(1)}%`
}

export function formatRecovery(ratio: number): string {
  return `${Math.round(ratio * 100)} cents`
}

export function floorSentence(sofr: number, floor: number): string {
  const sofrLabel = formatRate(sofr)
  const floorLabel = formatRate(floor)
  if (floorIsBinding(sofr, floor)) {
    return `SOFR ${sofrLabel} is below the ${floorLabel} floor, so the floor applies and the base rate is ${floorLabel}.`
  }
  return `SOFR ${sofrLabel} is above the ${floorLabel} floor, so the floor does not apply.`
}

export function sameAssumptions(left: Assumptions, right: Assumptions): boolean {
  return (
    left.baseEbitda === right.baseEbitda &&
    left.purchaseMultiple === right.purchaseMultiple &&
    left.sofr === right.sofr &&
    left.covenantCushion === right.covenantCushion &&
    left.stress === right.stress &&
    left.distressedMultiple === right.distressedMultiple
  )
}
