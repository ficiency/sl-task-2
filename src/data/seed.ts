import type {
  Assumptions,
  Condition,
  Deal,
  DocumentMeta,
  PipelineDeal,
  Risk,
  Security,
  Workstream,
} from '../domain/types.ts'

export const northlineDeal: Deal = {
  id: 'deal-northline',
  name: 'Northline Packaging',
  stage: 'Diligence',
  company: 'Northline Packaging',
  sponsor: 'Harbor Peak Partners',
  sector: 'Packaging',
  purpose: 'Fund the purchase of the company',
  team: [
    { name: 'Maya Chen', role: 'Vice President' },
    { name: 'Andre Walsh', role: 'Associate' },
    { name: 'Priya Shah', role: 'Analyst' },
  ],
}

export const northlineAssumptions: Assumptions = {
  baseEbitda: 40,
  purchaseMultiple: 9,
  sofr: 0.043,
  covenantCushion: 0.3,
  stress: -0.35,
  distressedMultiple: 6,
}

export const unitranche: Security = {
  id: 'sec-northline',
  dealId: northlineDeal.id,
  kind: 'Unitranche',
  lien: 'First lien',
  amount: 180,
  termYears: 6,
  spread: 0.0525,
  floor: 0.0075,
  oid: 0.02,
  callProtection: '102/101',
  collateral: 'all assets and cash flows of the company',
  paymentPriority: 'First lien. Paid before sponsor equity.',
}

export const workstreams: Workstream[] = [
  {
    id: 'ws-financial',
    dealId: northlineDeal.id,
    name: 'Financial',
    owner: 'Lena Ortiz',
    status: 'In progress',
  },
  {
    id: 'ws-legal',
    dealId: northlineDeal.id,
    name: 'Legal',
    owner: 'Jonah Klein',
    status: 'In progress',
  },
  {
    id: 'ws-commercial',
    dealId: northlineDeal.id,
    name: 'Commercial',
    owner: 'Priya Shah',
    status: 'Open items',
  },
]

export const documents: DocumentMeta[] = [
  { id: 'doc-qoe', workstreamId: 'ws-financial', name: 'Quality of earnings report', status: 'Received' },
  { id: 'doc-financials', workstreamId: 'ws-financial', name: 'Monthly financials', status: 'Received' },
  { id: 'doc-credit', workstreamId: 'ws-legal', name: 'Draft credit agreement', status: 'In review' },
  { id: 'doc-lien', workstreamId: 'ws-legal', name: 'Lien search', status: 'Ordered' },
  { id: 'doc-customers', workstreamId: 'ws-commercial', name: 'Customer sales schedule', status: 'Received' },
  { id: 'doc-mgmt', workstreamId: 'ws-commercial', name: 'Management presentation', status: 'Received' },
]

export const risks: Risk[] = [
  {
    id: 'risk-customer',
    dealId: northlineDeal.id,
    workstreamId: 'ws-commercial',
    fact: 'Top customer = 28% of sales',
    implication:
      'Losing or repricing that contract would drop cash flow, tighten interest coverage, and could push leverage through the proposed covenant.',
    mitigant: null,
    status: 'Open',
  },
  {
    id: 'risk-lien',
    dealId: northlineDeal.id,
    workstreamId: 'ws-legal',
    fact: "The seller's bank still has an all-asset lien on file.",
    implication: 'The fund would not have a clean first lien if that filing is still there at funding.',
    mitigant: 'Payoff and lien release are agreed and sit with the legal workstream as a closing deliverable.',
    status: 'Mitigated',
  },
  {
    id: 'risk-resin',
    dealId: northlineDeal.id,
    workstreamId: 'ws-financial',
    fact: 'Resin prices move working capital by a wide margin inside a year.',
    implication: 'A price spike can absorb cash that would otherwise cover interest.',
    mitigant: 'The company keeps a cash minimum at close, and recent swings were covered without new debt.',
    status: 'Mitigated',
  },
]

export const condition: Condition = {
  id: 'cond-customer',
  dealId: northlineDeal.id,
  riskId: 'risk-customer',
  text: "Executed multi-year extension of the top customer's supply agreement before funding",
  status: 'Open',
}

// Northline has no list size. The screen reads the loan amount instead.
export const pipeline: PipelineDeal[] = [
  { id: northlineDeal.id, name: northlineDeal.name, stage: northlineDeal.stage, openable: true },
  { id: 'deal-bright', name: 'BrightHarbor Clinics', stage: 'Screening', openable: false, listSize: 95 },
  { id: 'deal-kelso', name: 'Kelso Industrial Services', stage: 'Term sheet', openable: false, listSize: 220 },
  { id: 'deal-vanta', name: 'Vanta Software', stage: 'Diligence', openable: false, listSize: 140 },
  { id: 'deal-redline', name: 'Redline Logistics', stage: 'IC-ready', openable: false, listSize: 260 },
  { id: 'deal-oak', name: 'Oak and Iron Materials', stage: 'Screening', openable: false, listSize: 75 },
]
