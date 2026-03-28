export const SK    = "hwfs-v11";
export const font  = "'Outfit', sans-serif";
export const serif = "'DM Serif Display', Georgia, serif";
export const mono  = "'JetBrains Mono', 'Fira Code', monospace";

export const TIERS = {
  "Basic":        { rate: .10, churn: .12, color: "#22c992" },
  "Full-Service": { rate: .14, churn: .07, color: "#4f8fff" },
  "Premium":      { rate: .18, churn: .04, color: "#9070f0" },
  "Clinical":     { rate: .23, churn: .03, color: "#f0c040" },
};
export const TK = Object.keys(TIERS);

export const TABS = [
  { id: "dash",    l: "Dashboard",     i: "⬡" },
  { id: "crm",     l: "CRM & Pipeline",i: "⊙" },
  { id: "schedule",l: "Schedule",      i: "☰" },
  { id: "equip",   l: "Expenses",      i: "⚙" },
  { id: "jobs",    l: "Contracts",     i: "◈" },
  { id: "labor",   l: "Workforce",     i: "◎" },
  { id: "sga",     l: "SG&A",          i: "▥" },
  { id: "inv",     l: "Inventory",     i: "◐" },
  { id: "rev",     l: "Revenue",       i: "▰" },
  { id: "spec",    l: "Specialty Svc", i: "✦" },
  { id: "pnl",     l: "P&L",           i: "▦" },
  { id: "bs",      l: "Balance Sheet", i: "▣" },
  { id: "cf",      l: "Cash Flow",     i: "▤" },
  { id: "eq",      l: "Equity & Dist", i: "△" },
  { id: "comp",    l: "Compliance",    i: "◍" },
  { id: "inbox",    l: "Inbox",         i: "✉" },
  { id: "invoices", l: "Invoices",      i: "🧾" },
  { id: "actions", l: "Tasks",         i: "☑" },
  { id: "cfg",     l: "Settings",      i: "⊕" },
];

// ── Operating assumption defaults ────────────────────────────────────────────
export const DA = {
  galPerHr: .12, usagePct: .40, dilution: 30, sfPerHr: 2800, avgCostGal: 8.50,
  insBase: 85, insPer100k: 15, bond: 150, wcRate: .035, autoIns: 175,
  swept: 125, xero: 50, phone: 75, bankFees: 25, legalAnn: 2000, licAnn: 200,
  mktg: 250, vanOp: 300, vanLife: 7, eqRef: 75, conting: .02,
  salesTaxRate: .06, burden: .1235, uniformAnn: 120, trainAnn: 200, storage: 0,
};

// ── Settings defaults ─────────────────────────────────────────────────────────
export const DS = {
  name: "HuronWest Facility Services LLC", start: "2026-05-01",
  capHWE: 2100, capNico: 900, hweEq: .70, nicoEq: .30,
  loanRate: .07, taxRate: .226, reserve: 15000,
  bonusQ: 250, onboard: 500,
  nicoM1: 0, nicoM13: 3000, nicoStart: "2026-05-01",
  nicoVestPct: .15, nicoVestYrs: 4, nicoCliffYrs: 1,
  emergencyDispatch: 250, emergencyHr: 75,
  specFloorSF: .15, specCarpetSF: .25, specPostConSF: .20,
};

// ── SG&A label defaults ───────────────────────────────────────────────────────
export const DSGA = {
  ins: "GL Insurance", bond: "Bond", wc: "Workers Comp",
  swept: "Swept", xero: "Xero", phone: "Phone", mktg: "Marketing",
  eqRef: "Equip Refresh", auto: "Auto Insurance", bank: "Bank Fees",
  legal: "Legal/Acct", lic: "Licenses", uni: "Uniforms",
  train: "Training", stor: "Storage", rec: "Recurring", ct: "Contingency",
};

export const DEF = {
  expenses: [], jobs: [], workers: [], inventory: [], loans: [],
  actions: [], prospects: [], outreach: [], certs: [], specJobs: [], invoices: [],
  dark: false, userId: "Director", activityLog: [], lastSync: null, // light default
  pending: [], inbox: [], approvalThreshold: 500, requireDualApproval: true,
  postedExpenses: [], sgaN: { ...DSGA }, A: { ...DA }, S: { ...DS },
};

// ── Themes ────────────────────────────────────────────────────────────────────
// Dark theme: deep forest greens
export const dk = {
  bg:       "#0f1a18", bg2: "#162420", card: "#1a2926", card2: "#1f312e",
  border:   "#2a3e38", border2: "#335047",
  accent:   "#4CAF50", accentH: "#43A047",
  green:    "#4CAF50", red: "#ef5350", yellow: "#FFB300", orange: "#FF7043",
  purple:   "#42A5F5",
  text:     "#e4eeea", ts: "#9ab5ae", td2: "#577068",
  inp:      "#162420", inpB: "#2a3e38",
  side:     "#0c1614", headerBg: "#0c1614",
  shadow:   "none", shadowHover: "0 0 0 1px #2a3e38",
  mintPale: "#1f312e", mint: "#4CAF50", sage: "#5B8C7E",
  forestMid:"#1a2926", forestLt: "#224A40",
};

// Light theme: HuronWest forest green system
export const lt = {
  bg:       "#F0F4F1",   // --page-bg
  bg2:      "#F7FAF8",   // --cream
  card:     "#FFFFFF",
  card2:    "#F7FAF8",
  border:   "#D5E5DC",   // --border
  border2:  "#E8EFE9",   // --border-light
  accent:   "#3A7D44",   // --leaf
  accentH:  "#2E6B38",   // --leaf-hover
  green:    "#2E7D32",   // --success
  red:      "#C62828",   // --error
  yellow:   "#F57F17",   // --warning
  orange:   "#F57F17",
  purple:   "#1565C0",   // --info
  text:     "#1A3C34",   // --forest
  ts:       "#3E4A47",   // --bark
  td2:      "#7A8B85",   // --bark-light
  inp:      "#FFFFFF",
  inpB:     "#D5E5DC",
  side:     "#1A3C34",   // --sidebar-bg
  headerBg: "#1A3C34",   // --header-bg
  shadow:       "0 1px 3px rgba(26,60,52,0.06)",
  shadowHover:  "0 4px 12px rgba(26,60,52,0.08)",
  mintPale: "#E8F5EC",   // --mint-pale
  mint:     "#A8D5BA",   // --mint
  sage:     "#5B8C7E",   // --sage
  forestMid:"#224A40",   // --forest-mid
  forestLt: "#2D5E51",   // --forest-light
};
