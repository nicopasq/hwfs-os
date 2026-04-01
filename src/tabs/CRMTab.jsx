import { useState, Fragment } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { F, Badge } from '../components/ui';
import SelectOrOther from '../components/SelectOrOther';
import { SK } from '../constants';

const STAGES = ["Lead", "Contact Made", "Walkthrough", "Proposal", "Trial", "Won", "Lost"];

export default function CRMTab({ data, upd, setData, E }) {
  const { T, ss, font, mono } = useApp();
  const [f, setF] = useState({ name: "", contact: "", phone: "", vertical: "Dental", sf: "", stage: "Lead", notes: "", client: "", estWkRate: "", date: td(), followUp: "" });
  const [oF, setOF] = useState({ date: td(), type: "Walk-in", notes: "" });
  const [expanded, setExpanded] = useState(null);

  const SC = {
    "Lead": T.td2, "Contact Made": T.accent, "Walkthrough": T.purple,
    "Proposal": T.orange, "Trial": T.yellow, "Won": T.green, "Lost": T.red,
  };

  const today = td();

  const save = nd => {
    try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
  };

  const add  = () => {
    if (!f.name) return;
    upd("prospects", [...data.prospects, { ...f, id: uid(), sf: +f.sf || 0, estWkRate: +f.estWkRate || 0 }]);
    setF({ ...f, name: "", contact: "", phone: "", notes: "", sf: "", estWkRate: "", followUp: "" });
  };
  const rm   = id => upd("prospects", data.prospects.filter(p => p.id !== id));
  const updP = (id, k, v) => upd("prospects", data.prospects.map(p => p.id === id ? { ...p, [k]: v } : p));
  const addO = () => { upd("outreach", [...(data.outreach || []), { ...oF, id: uid() }]); setOF({ ...oF, notes: "" }); };

  // ── Bid → Contract conversion ─────────────────────────────────────────────
  const convertToContract = (p) => {
    const job = {
      id:      uid(),
      name:    p.name,
      client:  p.contact || p.name,
      tier:    "Basic",
      sf:      p.sf || 0,
      schedule: "weekly",
      freq:    1,
      wkRate:  p.estWkRate || 0,
      hrsVis:  0,
      mSup:    65,
      start:   today,
      serviceTime: "18:00",
      active:  true,
      pipe:    false,
      scopeOfWork: [],
      notes:   "Converted from CRM — " + today,
    };
    setData(prev => {
      const nd = {
        ...prev,
        jobs:        [...prev.jobs, job],
        prospects:   prev.prospects.map(pr => pr.id === p.id ? { ...pr, stage: "Won" } : pr),
        activityLog: [{ id: uid(), ts: new Date().toISOString(), user: prev.userId, action: "Contract created from bid", detail: p.name + " — " + fmtF(p.estWkRate) + "/wk" }, ...(prev.activityLog || []).slice(0, 99)],
      };
      save(nd);
      return nd;
    });
  };

  // ── Follow-up alerts ──────────────────────────────────────────────────────
  const dueFollowUps = (data.prospects || []).filter(p =>
    p.followUp && p.followUp <= today && p.stage !== "Won" && p.stage !== "Lost"
  );

  return (
    <>
      {/* ── Follow-up alerts ──────────────────────────────────────────────── */}
      {dueFollowUps.length > 0 && (
        <div style={{ background: T.yellow + "18", border: "1px solid " + T.yellow + "44", borderRadius: 4, padding: "14px 18px", marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.yellow, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
            ⏰ {dueFollowUps.length} Follow-up{dueFollowUps.length > 1 ? "s" : ""} Due
          </div>
          {dueFollowUps.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + T.yellow + "22" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{p.name}</span>
                <span style={{ fontSize: 12, color: T.td2, marginLeft: 10 }}>{p.stage} · Due {p.followUp}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ ...ss.btn, padding: "4px 12px", fontSize: 11, background: T.accent }} onClick={() => updP(p.id, "followUp", "")}>✓ Done</button>
                <button style={{ ...ss.btnG, padding: "4px 12px", fontSize: 11 }} onClick={() => {
                  const d = new Date(today + 'T12:00:00'); d.setDate(d.getDate() + 3);
                  updP(p.id, "followUp", d.toISOString().slice(0, 10));
                }}>+3 days</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Stage pipeline ────────────────────────────────────────────────── */}
      <div style={{ ...ss.card, display: "flex", gap: 4 }}>
        {STAGES.filter(s => s !== "Lost").map(s => {
          const c = data.prospects.filter(p => p.stage === s).length;
          return (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ padding: 8, background: SC[s] + "20", borderRadius: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: SC[s] }}>{c}</div>
              </div>
              <div style={{ fontSize: 9, color: T.ts, marginTop: 2, textTransform: "uppercase" }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* ── Add prospect ──────────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Prospect</span></div>
        <div style={ss.g5}>
          <F l="Business"><input style={ss.inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></F>
          <F l="Contact"><input style={ss.inp} value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} /></F>
          <F l="Phone"><input style={ss.inp} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></F>
          <F l="Vertical">
            <SelectOrOther
              options={["Dental", "Medical", "HOA/PM", "Office", "Industrial"]}
              value={f.vertical}
              onChange={v => setF({ ...f, vertical: v })}
              style={ss.sel}
            />
          </F>
          <F l="Est $/wk"><input type="number" style={ss.inp} value={f.estWkRate} onChange={e => setF({ ...f, estWkRate: e.target.value })} /></F>
        </div>
        <div style={ss.g3}>
          <F l="Follow-up Date"><input type="date" style={ss.inp} value={f.followUp} onChange={e => setF({ ...f, followUp: e.target.value })} /></F>
          <F l="Stage">
            <select style={ss.sel} value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button style={{ ...ss.btn, width: "100%" }} onClick={add}>+ Add Prospect</button>
          </div>
        </div>
      </div>

      {/* ── Prospects table ───────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>Prospects ({data.prospects.length})</span></div>
        <div style={{ overflowX: "auto" }}>
          <table style={ss.tbl}>
            <thead><tr>{["Business", "Vertical", "Contact", "Est $/wk", "Follow-up", "Stage", ""].map((h, i) => <th key={i} style={i === 3 ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.prospects.map(p => {
                const followUpOverdue = p.followUp && p.followUp <= today && p.stage !== "Won" && p.stage !== "Lost";
                const isExpanded = expanded === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr style={{ cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : p.id)}
                      onMouseEnter={e => e.currentTarget.style.background = T.mintPale}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...ss.td, fontWeight: 600 }}>{p.name}</td>
                      <td style={ss.td}><Badge c={T.accent}>{p.vertical}</Badge></td>
                      <td style={ss.td}>{p.contact}</td>
                      <td style={{ ...ss.tdR, fontWeight: 600 }}>{p.estWkRate ? fmtF(p.estWkRate) : ""}</td>
                      <td style={ss.td}>
                        {p.followUp
                          ? <span style={{ color: followUpOverdue ? T.red : T.ts, fontWeight: followUpOverdue ? 700 : 400, fontFamily: mono, fontSize: 12 }}>
                              {followUpOverdue ? "⚠ " : ""}{p.followUp}
                            </span>
                          : <span style={{ color: T.td2, fontSize: 11 }}>—</span>
                        }
                      </td>
                      <td style={ss.td}>
                        <select style={{ ...ss.sel, padding: "3px 5px", fontSize: 11 }} value={p.stage}
                          onChange={e => { e.stopPropagation(); updP(p.id, "stage", e.target.value); }}
                          onClick={e => e.stopPropagation()}>
                          {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={ss.td}><button style={ss.btnD} onClick={e => { e.stopPropagation(); rm(p.id); }}>✕</button></td>
                    </tr>
                    {isExpanded && (
                      <tr key={p.id + "-exp"}>
                        <td colSpan={7} style={{ padding: "12px 16px", background: T.bg2, borderBottom: "1px solid " + T.border }}>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ fontSize: 11, color: T.td2, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Follow-up Date</div>
                              <input type="date" style={{ ...ss.inp, fontSize: 12 }} value={p.followUp || ""} onChange={e => updP(p.id, "followUp", e.target.value)} />
                            </div>
                            <div style={{ flex: 2, minWidth: 200 }}>
                              <div style={{ fontSize: 11, color: T.td2, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
                              <input style={{ ...ss.inp, fontSize: 12 }} value={p.notes || ""} onChange={e => updP(p.id, "notes", e.target.value)} placeholder="Add notes..." />
                            </div>
                            {(p.stage === "Proposal" || p.stage === "Trial" || p.stage === "Won") && (
                              <div style={{ display: "flex", alignItems: "flex-end" }}>
                                <button
                                  style={{ ...ss.btn, background: T.green, fontSize: 12, padding: "10px 16px", whiteSpace: "nowrap" }}
                                  onClick={() => convertToContract(p)}
                                >
                                  ✓ Convert to Contract
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={ss.g2}>
        {/* ── Add outreach ─────────────────────────────────────────────────── */}
        <div style={ss.card}>
          <div style={ss.ch}><span>+ Outreach</span></div>
          <div style={ss.g2}>
            <F l="Date"><input type="date" style={ss.inp} value={oF.date} onChange={e => setOF({ ...oF, date: e.target.value })} /></F>
            <F l="Type">
              <SelectOrOther
                options={["Walk-in", "Call", "LinkedIn", "Email", "Referral Ask", "Site Walk", "LSA Callback", "Proposal", "Follow-up"]}
                value={oF.type}
                onChange={v => setOF({ ...oF, type: v })}
                style={ss.sel}
              />
            </F>
          </div>
          <F l="Notes"><input style={ss.inp} value={oF.notes} onChange={e => setOF({ ...oF, notes: e.target.value })} onKeyDown={e => e.key === "Enter" && addO()} /></F>
          <button style={ss.btn} onClick={addO}>+ Log</button>
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────────── */}
        <div style={ss.card}>
          <div style={ss.ch}><span>KPIs</span></div>
          <table style={ss.tbl}><tbody>
            {[["Touches", E.outreachCount, 80], ["Proposals", E.proposalsSent, 7], ["Won", E.prospWon, 2]].map(([l, a, target], i) =>
              <tr key={i}>
                <td style={ss.td}>{l}</td>
                <td style={{ ...ss.tdR, fontWeight: 700 }}>{a}/{target}</td>
                <td style={ss.td}><Badge c={a >= target ? T.green : a >= target * .6 ? T.yellow : T.red}>{a >= target ? "OK" : "BEHIND"}</Badge></td>
              </tr>
            )}
          </tbody></table>
        </div>
      </div>
    </>
  );
}
