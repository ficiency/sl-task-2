import type { Figure, NarrativeSections, Risk } from '../domain/types.ts'

// Sentence shells. Numbers are filled in from the calculated figures.
// A model provider would implement NarrativeProvider and read the provider name
// from an environment variable. This demo ships only the template, so the app
// runs with no key. Do not add a network call here.
export const narrativeTemplates = {
  recommendation:
    '{{recommendation}}. The loan is approved only if the open condition is met before funding.',
  loanTerms:
    'The fund would provide a {{lien}} {{instrument}} of {{loanAmount}} for {{tenor}}. The coupon is {{coupon}}, which is {{baseRate}} plus a spread of {{spread}}. Cash interest is {{cashInterest}}. {{floorNote}} OID is {{oid}}, so the fund wires {{netFunded}} against a face amount of {{loanAmount}}. Call protection is {{callProtection}}. Collateral is {{collateral}}.',
  creditMetrics:
    'Base-case EBITDA is {{baseEbitda}}. Leverage at close is {{leverageClose}} against a proposed maximum of {{covenantMax}}. Headroom at close is {{headroomClose}}. Interest coverage is {{coverageClose}}. In the downside, EBITDA is {{stressedEbitda}}, leverage is {{leverageDown}}, interest coverage is {{coverageDown}}, and headroom is {{headroomDown}}.',
  downsideAndRecovery:
    'The stress applied is {{stress}}. The distressed multiple on screen is {{distressedMultiple}}, set against an entry multiple of {{purchaseMultiple}}. Enterprise value in that case is {{stressedEv}}. Recovery is {{recovery}} on the dollar: that enterprise value divided into the loan, capped at the loan amount. The unitranche is first lien and is paid before the sponsor equity, so the equity absorbs the first loss. This recovery leaves out the cost and the time of a workout.',
  breachNote: 'The covenant breach in the downside is an early-warning trigger, not a verdict on the base case.',
  noBreachNote: 'The downside case stays inside the proposed covenant.',
  riskLine: '{{fact}} Implication for the loan: {{implication}} Mitigant: {{mitigant}} Status: {{status}}.',
  conditions: 'Condition precedent: {{condition}}. It is linked to this open item: {{linkedRisk}}.',
} as const

export interface NarrativeProvider {
  generate(figures: Figure[], risks: Risk[]): Promise<NarrativeSections>
}

function figureText(figures: Figure[], id: string): string {
  return figures.find((figure) => figure.id === id)?.display ?? ''
}

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => values[key] ?? '')
}

function sentence(text: string): string {
  const trimmed = text.trim().replace(/\.+$/, '')
  return trimmed === '' ? '.' : `${trimmed}.`
}

export function renderNarrative(figures: Figure[], risks: Risk[]): NarrativeSections {
  const values = Object.fromEntries(figures.map((figure) => [figure.id, figure.display]))
  if (values.lien) values.lien = values.lien.toLowerCase()
  if (values.instrument) values.instrument = values.instrument.toLowerCase()
  const headroomDown = figures.find((figure) => figure.id === 'headroomDown')
  const downsideNote = (headroomDown?.value ?? 0) < 0 ? narrativeTemplates.breachNote : narrativeTemplates.noBreachNote
  const openFirst = [...risks].sort((left, right) => {
    if (left.status === right.status) return 0
    return left.status === 'Open' ? -1 : 1
  })
  const riskLines = openFirst.map((risk) =>
    fillTemplate(narrativeTemplates.riskLine, {
      fact: sentence(risk.fact),
      implication: sentence(risk.implication),
      mitigant: sentence(risk.mitigant ?? 'Not closed'),
      status: risk.status,
    }),
  )
  const openRisk = risks.find((risk) => risk.status === 'Open')
  const risksText = riskLines.join('\n')

  return {
    recommendation: fillTemplate(narrativeTemplates.recommendation, values),
    loanTerms: fillTemplate(narrativeTemplates.loanTerms, values),
    creditMetrics: fillTemplate(narrativeTemplates.creditMetrics, values),
    downsideAndRecovery: `${fillTemplate(narrativeTemplates.downsideAndRecovery, values)} ${downsideNote}`,
    keyRisks: openRisk ? `An item is still open and is named here. ${risksText}` : risksText,
    conditions: fillTemplate(narrativeTemplates.conditions, {
      ...values,
      linkedRisk: openRisk?.fact ?? figureText(figures, 'linkedRisk'),
    }),
  }
}

export const templateNarrative: NarrativeProvider = {
  async generate(figures, risks) {
    return renderNarrative(figures, risks)
  },
}
