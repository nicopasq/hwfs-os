/**
 * App.jsx — Main application shell
 *
 * Fixes applied here:
 *  - proj12: specRevW was double-counted (added to rev which already included it)
 *  - doDigest: now passed as a prop to MenuBar (was missing → ReferenceError)
 *  - Empty catch blocks: now log console.warn instead of silently swallowing errors
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

import { AppContext }     from './context';
import { SK, TABS, DA, DS, DSGA, DEF, dk, lt, font, serif, TIERS, TK } from './constants';
import { uid, td, fmtF, fmt, pct } from './utils';

import HexLogo        from './components/HexLogo';
import Clock          from './components/Clock';
import MenuBar        from './components/MenuBar';
import NotifBell      from './components/NotifBell';
import StartupScreen  from './components/StartupScreen';

import DashTab   from './tabs/DashTab';
import PnlTab    from './tabs/PnlTab';
import BsTab     from './tabs/BsTab';
import CfTab     from './tabs/CfTab';
import SgaTab    from './tabs/SgaTab';
import RevTab    from './tabs/RevTab';
import InboxTab     from './tabs/InboxTab';
import InvoicesTab  from './tabs/InvoicesTab';
import CRMTab    from './tabs/CRMTab';
import EquipTab  from './tabs/EquipTab';
import JobsTab   from './tabs/JobsTab';
import LaborTab  from './tabs/LaborTab';
import InvTab    from './tabs/InvTab';
import SpecTab   from './tabs/SpecTab';
import EqTab     from './tabs/EqTab';
import CompTab   from './tabs/CompTab';
import ActTab    from './tabs/ActTab';
import CfgTab    from './tabs/CfgTab';

import {
  loadFirebaseConfig, connectFirebase, subscribeFirebase, subscribeIncoming,
  subscribeMessages, pushFirebase, disconnect as fbDisconnect, isConnected,
} from './firebase';

// ── localStorage helpers ──────────────────────────────────────────────────────
function persist(data) {
  try { localStorage.setItem(SK, JSON.stringify(data)); }
  catch (e) { console.warn("localStorage save failed:", e); }
  if (isConnected()) pushFirebase(data).catch(() => {});
}

export default function App() {
  const [booted,   setBooted]   = useState(false);
  const [tab,      setTab]      = useState("dash");
  const [data,     setData]     = useState(DEF);
  const [ok,       setOk]       = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [fbStatus,       setFbStatus]      = useState('idle'); // 'idle' | 'connected' | 'error'
  const [incomingDocs,   setIncomingDocs]  = useState([]);
  const [clientMessages, setClientMessages] = useState([]);

  const mergeRemote = remote => setData(() => ({
    ...DEF, ...remote,
    A: { ...DA, ...(remote.A || {}) },
    S: { ...DS, ...(remote.S || {}) },
    sgaN:      { ...DSGA, ...(remote.sgaN || {}) },
    prospects: remote.prospects || [],
    outreach:  remote.outreach  || [],
    certs:     remote.certs     || [],
    specJobs:  remote.specJobs  || [],
  }));

  // Load from localStorage once + auto-connect Firebase if config saved
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) {
        const p = JSON.parse(raw);
        setData({
          ...DEF, ...p,
          A: { ...DA, ...(p.A || {}) },
          S: { ...DS, ...(p.S || {}) },
          sgaN:     { ...DSGA, ...(p.sgaN || {}) },
          prospects: p.prospects || [],
          outreach:  p.outreach  || [],
          certs:     p.certs     || [],
          specJobs:  p.specJobs  || [],
        });
      }
    } catch (e) { console.warn("Failed to load saved data:", e); }

    // Auto-connect Firebase if a config was previously saved
    const fbCfg = loadFirebaseConfig();
    if (fbCfg) {
      const result = connectFirebase(fbCfg);
      if (result.ok) {
        setFbStatus('connected');
        subscribeFirebase(mergeRemote);
        subscribeIncoming(docs => setIncomingDocs(docs));
        subscribeMessages(msgs => setClientMessages(msgs));
      } else {
        setFbStatus('error');
      }
    }

    setOk(true);
    return () => fbDisconnect();
  }, []);

  // ── State updaters ──────────────────────────────────────────────────────────
  const save = useCallback(nd => { setData(nd); persist(nd); }, []);

  const upd = useCallback((k, v) => {
    setData(prev => { const nd = { ...prev, [k]: v }; persist(nd); return nd; });
  }, []);

  const updS = useCallback((k, v) => {
    setData(prev => { const nd = { ...prev, S: { ...prev.S, [k]: v } }; persist(nd); return nd; });
  }, []);

  const updA = useCallback((k, v) => {
    setData(prev => { const nd = { ...prev, A: { ...prev.A, [k]: v } }; persist(nd); return nd; });
  }, []);

  const nav = useCallback(t => setTab(t), []);

  const togTheme = useCallback(() => {
    setData(prev => { const nd = { ...prev, dark: !prev.dark }; persist(nd); return nd; });
  }, []);

  // ── Theme & computed styles ───────────────────────────────────────────────
  const dark = data.dark !== false;
  const T    = dark ? dk : lt;

  const mono = "'JetBrains Mono','Fira Code',monospace";
  const ss = useMemo(() => ({
    // ── Inputs ──────────────────────────────────────────────────────────────
    inp:  { width: "100%", padding: "10px 14px", background: T.inp, border: "1px solid " + T.inpB, borderRadius: 4, color: T.text, fontSize: 14, fontFamily: font, boxSizing: "border-box", outline: "none", transition: "border-color .15s, box-shadow .15s, background .15s" },
    sel:  { width: "100%", padding: "10px 14px", background: T.inp, border: "1px solid " + T.inpB, borderRadius: 4, color: T.text, fontSize: 14, fontFamily: font, boxSizing: "border-box", transition: "border-color .15s" },
    // ── Buttons ─────────────────────────────────────────────────────────────
    btn:  { padding: "10px 20px", background: T.accent, color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, textTransform: "uppercase", letterSpacing: "1px", transition: "background .15s" },
    btnD: { padding: "8px 16px", background: "transparent", color: T.red, border: "1px solid " + T.red + "44", borderRadius: 4, fontSize: 13, cursor: "pointer", fontFamily: font, fontWeight: 600, transition: "background .15s" },
    btnG: { padding: "8px 16px", background: "transparent", color: T.accent, border: "1px solid " + T.border, borderRadius: 4, fontSize: 13, cursor: "pointer", fontFamily: font, fontWeight: 500, transition: "background .15s, border-color .15s" },
    // ── Cards ────────────────────────────────────────────────────────────────
    card: { background: T.card, border: "1px solid " + T.border2, borderRadius: 4, padding: 24, marginBottom: 12, boxShadow: T.shadow || "none" },
    ch:   { fontSize: 10, fontWeight: 600, color: T.td2, marginBottom: 14, textTransform: "uppercase", letterSpacing: "1.5px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    // ── Tables ───────────────────────────────────────────────────────────────
    tbl:  { width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font },
    th:   { textAlign: "left",  padding: "12px 16px", background: T.side, color: "#fff", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700 },
    thR:  { textAlign: "right", padding: "12px 16px", background: T.side, color: "#fff", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700 },
    td:   { padding: "10px 16px", borderBottom: "1px solid " + T.border2, fontSize: 13, color: T.ts },
    tdR:  { padding: "10px 16px", borderBottom: "1px solid " + T.border2, textAlign: "right", fontSize: 13, fontVariantNumeric: "tabular-nums", color: T.ts, fontFamily: mono },
    // ── Labels & tags ────────────────────────────────────────────────────────
    lbl:  { fontSize: 12, color: T.ts, fontWeight: 600, marginBottom: 4, display: "block" },
    tag:  c => ({ display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: c + "18", color: c, textTransform: "uppercase", letterSpacing: "0.5px" }),
    // ── Grids ────────────────────────────────────────────────────────────────
    g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
    g4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
    g5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 },
    g6: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 },
    g7: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 16 },
  }), [T]);

  // ── Financial engine ──────────────────────────────────────────────────────
  const E = useMemo(() => {
    const aj  = data.jobs.filter(j => j.active && !j.pipe);
    const aw  = data.workers.filter(w => w.active);
    const wR  = aj.reduce((s, j) => s + (+j.wkRate || 0), 0);
    const mR  = wR * 4.33; const yR = wR * 52;
    const mhW = aj.reduce((s, j) => s + (+j.freq || 0) * (+j.hrsVis || 0), 0);
    const lCap = aw.reduce((s, w) => s + (+w.hpw || 0), 0);
    const util = lCap > 0 ? mhW / lCap : 0;
    const wWage = aw.reduce((s, w) => s + (+w.rate || 0) * (+w.hpw || 0), 0);
    const A = data.A; const S = data.S;
    const wBurd = wWage * A.burden; const wWC = wWage * A.wcRate;
    const wBon  = aw.length * (S.bonusQ / 13);
    const wLab  = wWage + wBurd + wWC + wBon;
    const supW  = aj.reduce((s, j) => s + (+j.mSup || 0) / 4.33, 0);
    const recW  = data.expenses.filter(e => e.rec && !e.cap).reduce((s, e) => {
      const a = +e.amt || 0; const f = e.rf;
      return s + (f === "weekly" ? a : f === "monthly" ? a / 4.33 : f === "quarterly" ? a / 13 : a / 52);
    }, 0);
    const vans = data.expenses.filter(e => e.cat === "Vehicle" && e.cap).length;
    const vanW = vans * (A.vanOp / 4.33);
    const cogsW = wLab + supW + vanW;
    const gpW   = wR - cogsW; const gpM = wR > 0 ? gpW / wR : 0;
    const specRevW = (data.specJobs || []).filter(s => !s.done).reduce((sum, s) => sum + (+s.price || 0) / (+s.weeks || 4), 0);
    const insW  = (A.insBase + A.insPer100k * ((yR + specRevW * 52) / 1e5)) / 4.33;
    const bondW = A.bond / 52; const autoW = vans * (A.autoIns / 4.33);
    const swpW  = A.swept / 4.33; const xerW = A.xero / 4.33; const phW = A.phone / 4.33;
    const mkW   = A.mktg / 4.33; const eqW  = A.eqRef / 4.33; const bankW = A.bankFees / 4.33;
    const legalW = A.legalAnn / 52; const licW = A.licAnn / 52;
    const uniW   = aw.length * A.uniformAnn / 52; const trainW = aw.length * A.trainAnn / 52;
    const storW  = A.storage / 4.33; const ctW = (wR + specRevW) * A.conting;
    const sgaW   = insW + bondW + wWC + autoW + swpW + xerW + phW + mkW + eqW + bankW + legalW + licW + uniW + trainW + storW + recW + ctW;
    const sgaDet = { insW, bondW, wcW: wWC, autoW, swpW, xerW, phW, mkW, eqW, bankW, legalW, licW, uniW, trainW, storW, recW, ctW };
    const deprW  = data.expenses.filter(e => e.dep).reduce((s, e) => s + (+e.amt || 0) / (+e.life || 7) / 52, 0);
    const totalWR = wR + specRevW;
    const ebitdaW = gpW + specRevW - sgaW;
    const ebitW   = ebitdaW - deprW;
    const taxW    = Math.max(0, ebitW * S.taxRate);
    const nopatW  = ebitW - taxW;
    const stUp    = data.expenses.filter(e => e.su).reduce((s, e) => s + (+e.amt || 0), 0);
    const capEx   = data.expenses.filter(e => e.cap).reduce((s, e) => s + (+e.amt || 0), 0);
    const lOut    = data.loans.reduce((s, l) => s + (+l.prin || 0) - (+l.rep || 0), 0);
    const lTot    = data.loans.reduce((s, l) => s + (+l.prin || 0), 0);
    const cap     = +S.capHWE + +S.capNico;
    const cash    = cap + lTot - stUp - capEx;
    const invVal  = data.inventory.reduce((s, i) => s + (+i.uc || 0) * (+i.qty || 0), 0);
    const estGalWk = mhW * A.galPerHr;
    const pipeN   = data.jobs.filter(j => j.pipe).length;
    const pipeRev = data.jobs.filter(j => j.pipe).reduce((s, j) => s + (+j.wkRate || 0), 0);
    const moStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const moOut   = (data.outreach || []).filter(o => o.date >= moStart);
    const prospTotal = data.prospects.length;
    const prospHot   = data.prospects.filter(p => p.stage === "Proposal" || p.stage === "Trial").length;
    const prospWon   = data.prospects.filter(p => p.stage === "Won").length;

    // Nico vesting
    const startDate  = new Date(S.nicoStart || S.start);
    const yrsElapsed = Math.max(0, (Date.now() - startDate) / (365.25 * 864e5));
    const vestYrs    = S.nicoVestYrs || 4;
    const vestedPct  = yrsElapsed < (S.nicoCliffYrs || 1) ? 0
      : Math.min(S.nicoVestPct || .15, (vestYrs > 0 ? yrsElapsed / vestYrs : 0) * (S.nicoVestPct || .15));

    // Distribution waterfall (annual)
    const annNOPAT   = nopatW * 52;
    const reserveDef = Math.max(0, S.reserve - cash);
    const postReserve = Math.max(0, annNOPAT - reserveDef);
    const loanRepay   = Math.min(postReserve, Math.max(0, lOut));
    const afterLoan   = postReserve - loanRepay;
    const taxDist     = taxW * 52;
    const afterTax    = Math.max(0, afterLoan - taxDist);
    const prefReturn  = Math.min(afterTax, cap * .07);
    const afterPref   = afterTax - prefReturn;
    const capReturn   = Math.min(afterPref, cap);
    const afterCapRet = afterPref - capReturn;
    const hweResidual = afterCapRet * S.hweEq;
    const nicoResidual = afterCapRet * S.nicoEq;

    // 12-month projection
    // FIXED: previously ebitda and gp double-counted specRevW because rev = totalWR*4.33
    // already includes specRevW. Removed the extra +specRevW*4.33.
    const proj12 = Array.from({ length: 12 }, (_, i) => {
      const rev    = totalWR * 4.33;   // totalWR = wR + specRevW — already combined
      const cogs   = cogsW  * 4.33;
      const sga    = sgaW   * 4.33;
      const dep    = deprW  * 4.33;
      const gp     = rev - cogs;       // FIXED: was rev - cogs + specRevW*4.33
      const ebitda = rev - cogs - sga; // FIXED: was rev + specRevW*4.33 - cogs - sga
      return { m: i + 1, rev, gp, sga, ebitda, nopat: Math.max(0, (ebitda - dep) * (1 - S.taxRate)) };
    });

    // Cash flow
    const ocf = nopatW + deprW;
    const fcf = ocf - eqW - taxW;

    // Notifications
    const notifs = [];
    const overdueTasks = data.actions.filter(a => !a.done && a.due && a.due < td());
    if (overdueTasks.length > 0) notifs.push({ type: "red",    msg: overdueTasks.length + " overdue task" + (overdueTasks.length > 1 ? "s" : "") });
    if (cash < S.reserve)        notifs.push({ type: "red",    msg: "Cash " + fmtF(cash) + " below $" + S.reserve.toLocaleString() + " reserve" });
    if (invVal > 0 && supW > 0 && invVal / supW < 3) notifs.push({ type: "yellow", msg: "Inventory cover under 3 weeks" });
    if (util > .92)              notifs.push({ type: "yellow", msg: "Utilization " + pct(util) + " — near max capacity" });
    const staleProspects = data.prospects.filter(p => p.stage !== "Won" && p.stage !== "Lost" && p.date && (Date.now() - new Date(p.date)) > 30 * 864e5);
    if (staleProspects.length > 0) notifs.push({ type: "yellow", msg: staleProspects.length + " prospect" + (staleProspects.length > 1 ? "s" : "") + " stale (30+ days)" });
    const pendingCount = (data.pending || []).length;
    if (pendingCount > 0)        notifs.push({ type: "yellow", msg: pendingCount + " item" + (pendingCount > 1 ? "s" : "") + " awaiting approval" });
    if (moOut.length < 20 && new Date().getDate() > 7) notifs.push({ type: "yellow", msg: "Only " + moOut.length + " outreach touches this month (target: 80)" });

    return {
      nj: aj.length, nw: aw.length, pipeN, pipeRev, wR, mR, yR, totalWR, mhW, lCap, util,
      wWage, wBurd, wWC, wBon, wLab, supW, vanW, recW, cogsW, gpW, gpM,
      sgaW, sgaDet, deprW, ebitdaW, ebitW, taxW, nopatW, stUp, capEx, lOut, lTot,
      cap, cash, vans, invVal, estGalWk, specRevW, prospTotal, prospHot, prospWon,
      outreachCount: moOut.length, proposalsSent: moOut.filter(o => o.type === "Proposal").length,
      vestedPct, yrsElapsed, loanRepay, taxDist, prefReturn, capReturn, hweResidual, nicoResidual,
      proj12, ocf, fcf,
      insW, bondW, autoW, swpW, xerW, phW, mkW, eqW, bankW, legalW, licW, uniW, trainW, storW, ctW,
      notifs,
    };
  }, [data]);

  // ── Export / Import / PDF / Digest ─────────────────────────────────────────
  const doExport = () => {
    try {
      const json = localStorage.getItem(SK) || JSON.stringify(data, null, 2);
      const b = new Blob([json], { type: "application/json" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a"); a.href = u; a.download = "HWFS_Backup_" + td() + ".json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(u), 100);
    } catch (e) { alert("Export failed: " + e.message); }
  };

  const doImport = () => {
    const mode = confirm("MERGE with current data?\n\nOK = Merge (combines records)\nCancel = Replace (overwrites everything)");
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json";
    inp.onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const imp = JSON.parse(ev.target.result);
          if (!mode) {
            const nd = { ...DEF, ...imp, A: { ...DA, ...(imp.A || {}) }, S: { ...DS, ...(imp.S || {}) } };
            setData(nd); persist(nd); return;
          }
          const mergeArr = (a, b) => { const ids = new Set(a.map(x => x.id)); return [...a, ...(b || []).filter(x => !ids.has(x.id))]; };
          const merged = {
            ...data,
            expenses: mergeArr(data.expenses, imp.expenses), jobs: mergeArr(data.jobs, imp.jobs),
            workers:  mergeArr(data.workers,  imp.workers),  inventory: mergeArr(data.inventory, imp.inventory),
            loans:    mergeArr(data.loans,     imp.loans),    actions:   mergeArr(data.actions,   imp.actions),
            prospects: mergeArr(data.prospects, imp.prospects), outreach: mergeArr(data.outreach || [], imp.outreach),
            certs:    mergeArr(data.certs || [], imp.certs), specJobs: mergeArr(data.specJobs || [], imp.specJobs),
            activityLog: mergeArr(data.activityLog || [], imp.activityLog || []).sort((a, b) => b.ts?.localeCompare(a.ts)).slice(0, 100),
            lastSync: new Date().toISOString(),
            A: { ...data.A, ...(imp.A || {}) }, S: { ...data.S, ...(imp.S || {}) },
          };
          setData(merged); persist(merged);
          alert("Merged " + Object.keys(imp).length + " fields. Combined records deduplicated by ID.");
        } catch (err) { alert("Import failed: " + err.message); }
      };
      r.readAsText(f);
    };
    inp.click();
  };

  const doPDF = () => {
    const w = window.open("", "_blank"); if (!w) return; const d = td();
    const row = (l, wk, mo, yr, b) => `<tr style="background:${b ? "#f0f4ff" : "transparent"}"><td style="padding:5px 10px;border-bottom:1px solid #ddd;font-weight:${b ? 700 : 400}">${l}</td><td style="padding:5px 10px;border-bottom:1px solid #ddd;text-align:right;font-weight:${b ? 700 : 400}">${fmtF(wk)}</td><td style="padding:5px 10px;border-bottom:1px solid #ddd;text-align:right">${fmtF(mo)}</td><td style="padding:5px 10px;border-bottom:1px solid #ddd;text-align:right;font-weight:${b ? 700 : 400}">${fmtF(yr)}</td></tr>`;
    const openTasks = data.actions.filter(a => !a.done);
    const taskHtml = openTasks.slice(0, 10).map(a => `<tr><td style="padding:4px 10px;border-bottom:1px solid #eee;font-weight:${a.priority === "Critical" ? 700 : 400}">${a.text}</td><td style="padding:4px 10px;border-bottom:1px solid #eee;text-align:center">${a.priority}</td><td style="padding:4px 10px;border-bottom:1px solid #eee">${a.assignee}</td><td style="padding:4px 10px;border-bottom:1px solid #eee">${a.due || "—"}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>HWFS Financial Update ${d}</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:#1a2030;padding:40px;max-width:860px;margin:0 auto}h1{font-size:20px;margin-bottom:4px}h2{font-size:14px;margin:18px 0 6px;border-bottom:2px solid #2060d0;padding-bottom:3px;text-transform:uppercase;letter-spacing:1px}table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px}th{text-align:left;padding:5px 10px;border-bottom:2px solid #333;font-size:9px;text-transform:uppercase;letter-spacing:.5px}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px}.m{text-align:center;border:1px solid #ddd;border-radius:6px;padding:10px}.m .v{font-size:18px;font-weight:700}.m .l{font-size:8px;text-transform:uppercase;color:#666;margin-top:2px}@media print{body{padding:20px}}</style></head><body><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;border-bottom:3px solid #2060d0;padding-bottom:10px"><div><h1>⬡ HuronWest Facility Services</h1><div style="color:#666;font-size:11px">Financial Update — ${d}</div></div><div style="text-align:right"><div style="font-size:10px;color:#666">HWFS_FU_${d}</div><div style="font-size:10px;color:#666">${data.S.name}</div></div></div><div class="g3"><div class="m"><div class="v" style="color:#2060d0">${E.nj}</div><div class="l">Active Contracts</div></div><div class="m"><div class="v" style="color:#0a8a5a">${fmtF(E.totalWR)}/wk</div><div class="l">Revenue</div></div><div class="m"><div class="v" style="color:${E.ebitdaW >= 0 ? "#0a8a5a" : "#d03030"}">${fmtF(E.ebitdaW)}/wk</div><div class="l">EBITDA</div></div></div><h2>Income Statement</h2><table><thead><tr><th></th><th style="text-align:right">Weekly</th><th style="text-align:right">Monthly</th><th style="text-align:right">Annual</th></tr></thead><tbody>${row("Revenue", E.totalWR, E.totalWR * 4.33, E.totalWR * 52, true)}${row("COGS", E.cogsW, E.cogsW * 4.33, E.cogsW * 52)}${row("Gross Profit", E.gpW + E.specRevW, (E.gpW + E.specRevW) * 4.33, (E.gpW + E.specRevW) * 52, true)}${row("SG&A", E.sgaW, E.sgaW * 4.33, E.sgaW * 52)}${row("EBITDA", E.ebitdaW, E.ebitdaW * 4.33, E.ebitdaW * 52, true)}${row("NOPAT", E.nopatW, E.nopatW * 4.33, E.nopatW * 52, true)}</tbody></table>${openTasks.length > 0 ? `<h2>Open Tasks (${openTasks.length})</h2><table><thead><tr><th>Task</th><th style="text-align:center">Priority</th><th>Assigned</th><th>Due</th></tr></thead><tbody>${taskHtml}</tbody></table>` : ""}<div style="margin-top:24px;padding-top:10px;border-top:1px solid #ddd;font-size:9px;color:#999;text-align:center">Confidential — HuronWest Facility Services LLC — ${new Date().toLocaleDateString()}</div></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 500);
  };

  const doDigest = () => {
    const w = window.open("", "_blank"); if (!w) return; const d = td();
    const weekAgo     = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
    const recentAct   = (data.activityLog || []).filter(a => a.ts >= weekAgo);
    const openTasks   = data.actions.filter(a => !a.done);
    const weekOutreach = (data.outreach || []).filter(o => o.date >= weekAgo);
    w.document.write(`<!DOCTYPE html><html><head><title>HWFS Weekly Digest ${d}</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:#1a2030;padding:40px;max-width:800px;margin:0 auto}h1{font-size:18px;margin-bottom:4px}h2{font-size:13px;margin:16px 0 6px;border-bottom:2px solid #2060d0;padding-bottom:3px;text-transform:uppercase;letter-spacing:1px}table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11px}td,th{padding:4px 10px;border-bottom:1px solid #eee;text-align:left}th{font-size:9px;text-transform:uppercase;border-bottom:2px solid #333}.kpi{display:inline-block;text-align:center;border:1px solid #ddd;border-radius:6px;padding:10px 16px;margin:4px}.kpi .v{font-size:18px;font-weight:700}.kpi .l{font-size:8px;text-transform:uppercase;color:#666}@media print{body{padding:20px}}</style></head><body><div style="border-bottom:3px solid #2060d0;padding-bottom:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-end"><div><h1>⬡ HWFS Weekly Digest</h1><div style="color:#666">Week ending ${d}</div></div><div style="text-align:right;font-size:10px;color:#666">Generated ${new Date().toLocaleString()}</div></div><div style="margin-bottom:16px"><span class="kpi"><span class="v" style="color:#2060d0">${E.nj}</span><br/><span class="l">Contracts</span></span><span class="kpi"><span class="v" style="color:#0a8a5a">${fmtF(E.totalWR)}/wk</span><br/><span class="l">Revenue</span></span><span class="kpi"><span class="v" style="color:${E.ebitdaW >= 0 ? "#0a8a5a" : "#d03030"}">${fmtF(E.ebitdaW)}/wk</span><br/><span class="l">EBITDA</span></span><span class="kpi"><span class="v">${pct(E.util)}</span><br/><span class="l">Util</span></span><span class="kpi"><span class="v">${fmt(E.cash)}</span><br/><span class="l">Cash</span></span></div><h2>This Week's Activity (${recentAct.length} events)</h2><table><thead><tr><th>Time</th><th>User</th><th>Action</th></tr></thead><tbody>${recentAct.slice(0, 20).map(a => "<tr><td>" + new Date(a.ts).toLocaleDateString() + "</td><td style='font-weight:600'>" + a.user + "</td><td>" + a.action + (a.detail ? ": " + a.detail : "") + "</td></tr>").join("")}${recentAct.length === 0 ? "<tr><td colspan=3 style='color:#999'>No logged activity this week</td></tr>" : ""}</tbody></table><h2>Open Tasks (${openTasks.length})</h2><table><thead><tr><th>Task</th><th>Priority</th><th>Assigned</th><th>Due</th></tr></thead><tbody>${openTasks.slice(0, 15).map(a => "<tr><td" + (a.priority === "Critical" ? " style='font-weight:700;color:#d03030'" : "") + ">" + a.text + "</td><td>" + a.priority + "</td><td>" + a.assignee + "</td><td>" + (a.due || "—") + "</td></tr>").join("")}</tbody></table><div style="margin-top:20px;padding-top:8px;border-top:1px solid #ddd;font-size:9px;color:#999;text-align:center">Confidential — ${data.S.name} — Weekly Digest</div></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 500);
  };

  // ── Loading / boot gates ────────────────────────────────────────────────────
  if (!ok) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4F1" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, color: "#1A3C34", marginBottom: 12, fontFamily: "'DM Serif Display',serif" }}>HuronWest</div>
        <div style={{ fontSize: 13, color: "#7A8B85", fontFamily: "'Outfit',sans-serif" }}>Loading your workspace…</div>
      </div>
    </div>
  );

  if (!booted) return (
    <StartupScreen onDone={userId => {
      setData(prev => { const nd = { ...prev, userId: userId || "Director" }; persist(nd); return nd; });
      setBooted(true);
    }} />
  );

  const sW = sideOpen ? 240 : 64;

  const contextValue = { T, ss, font, serif, mono: "'JetBrains Mono','Fira Code',monospace", nav };

  // ── Shared tab props ────────────────────────────────────────────────────────
  const tabProps = { data, upd, updS, updA, setData, save, E, fbStatus, setFbStatus, mergeRemote };

  return (
    <AppContext.Provider value={contextValue}>
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: font, fontSize: 14, display: "flex" }}>

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setSideOpen(true)}
          onMouseLeave={() => setSideOpen(false)}
          style={{ width: sW, minHeight: "100vh", background: "#1A3C34", transition: "width .2s", overflow: "hidden", flexShrink: 0, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", zIndex: 200 }}
        >
          {/* Logo */}
          <div style={{ padding: sideOpen ? "20px" : "16px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: sideOpen ? "flex-start" : "center", gap: 10, paddingLeft: sideOpen ? 20 : 0 }}>
            <HexLogo size={sideOpen ? 26 : 22} color="#A8D5BA" />
            {sideOpen && (
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: font, letterSpacing: "-0.3px" }}>
                  Huron<span style={{ color: "#A8D5BA" }}>West</span>
                </div>
                <div style={{ fontSize: 9, color: "#5B8C7E", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 1 }}>ERP v11</div>
              </div>
            )}
          </div>

          {/* Nav items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const ct = t.id === "inbox" ? (data.pending || []).length : t.id === "crm" ? data.prospects.length : t.id === "jobs" ? data.jobs.length : t.id === "labor" ? data.workers.length : t.id === "actions" ? data.actions.filter(a => !a.done).length : t.id === "inv" ? data.inventory.length : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, height: 40, background: isActive ? "#2D5E51" : "transparent", border: "none", borderLeft: isActive ? "3px solid #A8D5BA" : "3px solid transparent", color: isActive ? "#fff" : "#9ab5ae", fontFamily: font, fontSize: 14, fontWeight: isActive ? 600 : 400, cursor: "pointer", textAlign: "left", justifyContent: sideOpen ? "flex-start" : "center", paddingLeft: sideOpen ? (isActive ? 17 : 20) : 0, transition: "background .15s" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#224A40"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0, color: isActive ? "#A8D5BA" : "#5B8C7E" }}>{t.i}</span>
                  {sideOpen && <>
                    <span style={{ whiteSpace: "nowrap", flex: 1 }}>{t.l}</span>
                    {ct > 0 && <span style={{ background: t.id === "inbox" ? "#C62828" : "rgba(168,213,186,0.18)", color: t.id === "inbox" ? "#fff" : "#A8D5BA", borderRadius: 8, fontSize: 9, fontWeight: 700, padding: "1px 6px", marginRight: 12 }}>{ct}</span>}
                  </>}
                </button>
              );
            })}
          </div>

          {/* Bottom */}
          <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={togTheme} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: 7, cursor: "pointer", color: "#9ab5ae", fontFamily: font, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {dark ? "☀" : "◑"}{sideOpen && (dark ? " Light Mode" : " Dark Mode")}
            </button>
            {sideOpen && <div style={{ fontSize: 10, color: "#5B8C7E", textAlign: "center", marginTop: 8 }}>{data.userId}{data.lastSync && (" · synced " + new Date(data.lastSync).toLocaleDateString())}</div>}
          </div>
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Header bar — forest dark */}
          <div style={{ background: "#1A3C34", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#fff", fontFamily: font }}>Welcome, <strong>{data.userId}</strong></span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>|</span>
              <span style={{ fontWeight: 600, color: "#A8D5BA", fontFamily: font, fontSize: 14 }}>{TABS.find(t => t.id === tab)?.l}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: font }}>{E.nj} active · {E.pipeN} pipeline</span>
              <span style={{ fontSize: 13, color: "#A8D5BA", fontWeight: 600, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{fmtF(E.wR)}/wk</span>
              <span style={{ fontSize: 13, color: E.ebitdaW >= 0 ? "#A8D5BA" : "#ef9090", fontWeight: 600, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{fmtF(E.ebitdaW)} EBITDA</span>
              <MenuBar doExport={doExport} doImport={doImport} doPDF={doPDF} doDigest={doDigest} />
              {(data.pending || []).length > 0 && (
                <button style={{ background: "rgba(245,127,23,0.18)", border: "1px solid rgba(245,127,23,0.4)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", color: "#FFB74D", fontFamily: font, fontSize: 12, fontWeight: 500 }} onClick={() => setTab("inbox")}>
                  {(data.pending || []).length} pending
                </button>
              )}
              <NotifBell notifs={E.notifs || []} />
              <Clock />
              <button
                onClick={() => { setData(prev => { const nd = { ...prev, lastSync: new Date().toISOString() }; persist(nd); return nd; }); setBooted(false); }}
                style={{ background: "rgba(198,40,40,0.15)", border: "1px solid rgba(198,40,40,0.35)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", color: "#ef9090", fontFamily: font, fontSize: 12, fontWeight: 500 }}
              >Log Off</button>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ padding: "28px 32px", flex: 1, overflowY: "auto", background: T.bg }}>
            {tab === "dash"    && <DashTab  data={data} E={E} />}
            {tab === "pnl"     && <PnlTab   data={data} E={E} />}
            {tab === "bs"      && <BsTab    data={data} E={E} />}
            {tab === "cf"      && <CfTab    data={data} E={E} />}
            {tab === "sga"     && <SgaTab   data={data} setData={setData} E={E} />}
            {tab === "rev"     && <RevTab   data={data} E={E} />}
            {tab === "inbox"    && <InboxTab    data={data} upd={upd} setData={setData} E={E} incomingDocs={incomingDocs} clientMessages={clientMessages} />}
            {tab === "invoices" && <InvoicesTab data={data} setData={setData} />}
            {tab === "crm"     && <CRMTab   data={data} upd={upd} setData={setData} E={E} />}
            {tab === "equip"   && <EquipTab data={data} upd={upd} setData={setData} E={E} />}
            {tab === "jobs"    && <JobsTab  data={data} upd={upd} setData={setData} E={E} />}
            {tab === "labor"   && <LaborTab data={data} upd={upd} E={E} />}
            {tab === "inv"     && <InvTab   data={data} upd={upd} updA={updA} E={E} />}
            {tab === "spec"    && <SpecTab  data={data} upd={upd} E={E} />}
            {tab === "eq"      && <EqTab    data={data} upd={upd} E={E} />}
            {tab === "comp"    && <CompTab  data={data} upd={upd} />}
            {tab === "actions" && <ActTab   data={data} upd={upd} setData={setData} />}
            {tab === "cfg"     && <CfgTab   data={data} updS={updS} updA={updA} setData={setData} fbStatus={fbStatus} setFbStatus={setFbStatus} mergeRemote={mergeRemote} onIncoming={docs => setIncomingDocs(docs)} onMessages={msgs => setClientMessages(msgs)} />}
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}
