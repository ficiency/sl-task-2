export type DealStage = 'Screening' | 'Term sheet' | 'Diligence' | 'IC-ready'

export type TeamMember = {
  name: string
  role: string
}

export type Deal = {
  id: string
  name: string
  stage: DealStage
  company: string
  sponsor: string
  sector: string
  purpose: string
  team: TeamMember[]
}

// A row on the pipeline list. Context rows store a size. Northline does not.
export type PipelineDeal = {
  id: string
  name: string
  stage: DealStage
  openable: boolean
  listSize?: number
}

export type Assumptions = {
  baseEbitda: number
  purchaseMultiple: number
  sofr: number
  covenantCushion: number
  stress: number
  distressedMultiple: number
}

export type Security = {
  id: string
  dealId: string
  kind: 'Unitranche'
  lien: 'First lien'
  amount: number
  termYears: number
  spread: number
  floor: number
  oid: number
  callProtection: string
  collateral: string
  paymentPriority: string
}

export type Workstream = {
  id: string
  dealId: string
  name: 'Financial' | 'Legal' | 'Commercial'
  owner: string
  status: string
}

export type DocumentMeta = {
  id: string
  workstreamId: string
  name: string
  status: string
}

export type RiskStatus = 'Open' | 'Mitigated'

export type Risk = {
  id: string
  dealId: string
  workstreamId: string
  fact: string
  implication: string
  mitigant: string | null
  status: RiskStatus
}

export type Condition = {
  id: string
  dealId: string
  riskId: string
  text: string
  status: string
}

export type SourceTab = 'overview' | 'structure' | 'diligence'

export type Figure = {
  id: string
  label: string
  value: number
  display: string
  sourceTab: SourceTab
}

export type NarrativeSections = {
  recommendation: string
  loanTerms: string
  creditMetrics: string
  downsideAndRecovery: string
  keyRisks: string
  conditions: string
}

// A photo of the memo. Later edits to the assumptions must not change it.
export type MemoSnapshot = {
  generatedAt: string
  assumptions: Assumptions
  figures: Figure[]
  narrative: NarrativeSections
}
