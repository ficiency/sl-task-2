-- Reference schema for a production store.
-- This file is not executed by the demo.
--
-- Derived figures are never stored.
-- Purchase price, sponsor equity, leverage, cash interest, interest coverage,
-- the covenant level, headroom, the downside case, recovery, and sources and
-- uses are computed from assumptions and the security whenever a screen opens.
--
-- memo_versions is different: it stores a photo taken when someone generates
-- a memo. Those copied figures belong to that document. They are not the live record.

CREATE TABLE deals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  -- Filled only for pipeline rows that have no security.
  -- Northline's size on the list is the unitranche amount, not a second number here.
  list_size_musd REAL,
  company TEXT,
  sponsor TEXT,
  sector TEXT,
  purpose TEXT,
  team_json TEXT,
  openable INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE assumptions (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL UNIQUE REFERENCES deals(id),
  base_ebitda_musd REAL NOT NULL,
  purchase_multiple REAL NOT NULL,
  sofr REAL NOT NULL,
  covenant_cushion REAL NOT NULL,
  stress REAL NOT NULL,
  distressed_multiple REAL NOT NULL
);

CREATE TABLE securities (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL REFERENCES deals(id),
  kind TEXT NOT NULL,
  lien TEXT NOT NULL,
  amount_musd REAL NOT NULL,
  term_years INTEGER NOT NULL,
  spread REAL NOT NULL,
  floor REAL NOT NULL,
  oid REAL NOT NULL,
  call_protection TEXT NOT NULL,
  collateral TEXT NOT NULL,
  payment_priority TEXT NOT NULL
);

CREATE TABLE dd_workstreams (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL REFERENCES deals(id),
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE dd_documents (
  id TEXT PRIMARY KEY,
  workstream_id TEXT NOT NULL REFERENCES dd_workstreams(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE risks (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL REFERENCES deals(id),
  workstream_id TEXT NOT NULL REFERENCES dd_workstreams(id),
  fact TEXT NOT NULL,
  implication TEXT NOT NULL,
  mitigant TEXT,
  status TEXT NOT NULL
);

CREATE TABLE conditions (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL REFERENCES deals(id),
  risk_id TEXT NOT NULL REFERENCES risks(id),
  text TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE memo_versions (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL REFERENCES deals(id),
  generated_at TEXT NOT NULL,
  assumptions_json TEXT NOT NULL,
  figures_json TEXT NOT NULL,
  narrative_json TEXT NOT NULL
);
