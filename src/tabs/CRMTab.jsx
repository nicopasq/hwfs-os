import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { F, Badge } from '../components/ui';

const STAGES = ["Lead", "Contact Made", "Walkthrough", "Proposal", "Trial", "Won", "Lost"];

export default function CRMTab({ data, upd, E }) {
  const { T, ss } = useApp();

  const SC = {
    "Lead": T.td2, "Contact Made": T.accent, "Walkthrough": T.purple,
    "Proposal": T.orange, "Trial": T.yellow, "Won": T.green, "Lost": T.red,
  };

  const [f, setF] = useState({ name: "", contact: "", phone: "", vertical: "Dental", sf: "", stage: "Lead", notes: "", client: "", estWkRate: "", date: td() });
  const [oF, setOF] = useState({ date: td(), type: "Walk-in", notes: "" });

  const add  = () => { if (!f.name) return; upd("prospects", [...data.prospects, { ...f, id: uid(), sf: +f.sf || 0, estWkRate: +f.estWkRate || 0 }]); setF({ ...f, name: "", contact: "", phone: "", notes: "", sf: "", estWkRate: "" }); };
  const rm   = id => upd("prospects", data.prospects.filter(p => p.id !== id));
  const updP = (id, k, v) => upd("prospects", data.prospects.map(p => p.id === id ? { ...p, [k]: v } : p));
  const addO = () => { upd("outreach", [...(data.outreach || []), { ...oF, id: uid() }]); setOF({ ...oF, notes: "" }); };

  return (
    <>
      {/* Stage pipeline */}
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

      {/* Add prospect */}
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Prospect</span></div>
        <div style={ss.g5}>
          <F l="Business"><input style={ss.inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></F>
          <F l="Contact"><input style={ss.inp} value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} /></F>
          <F l="Phone"><input style={ss.inp} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></F>
          <F l="Vertical">
            <select style={ss.sel} value={f.vertical} onChange={e => setF({ ...f, vertical: e.target.value })}>
              {["Dental", "Medical", "HOA/PM", "Office", "Industrial", "Other"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Est $/wk"><input type="number" style={ss.inp} value={f.estWkRate} onChange={e => setF({ ...f, estWkRate: e.target.value })} /></F>
        </div>
        <button style={ss.btn} onClick={add}>+ Add</button>
      </div>

      {/* Prospects table */}
      <div style={ss.card}>
        <div style={ss.ch}><span>Prospects ({data.prospects.length})</span></div>
        <div style={{ overflowX: "auto" }}>
          <table style={ss.tbl}>
            <thead><tr>{["Business", "Vertical", "Contact", "Est $/wk", "Stage", ""].map((h, i) => <th key={i} style={i === 3 ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.prospects.map(p =>
                <tr key={p.id}>
                  <td style={{ ...ss.td, fontWeight: 600 }}>{p.name}</td>
                  <td style={ss.td}><Badge c={T.accent}>{p.vertical}</Badge></td>
                  <td style={ss.td}>{p.contact}</td>
                  <td style={{ ...ss.tdR, fontWeight: 600 }}>{p.estWkRate ? fmtF(p.estWkRate) : ""}</td>
                  <td style={ss.td}>
                    <select style={{ ...ss.sel, padding: "3px 5px", fontSize: 11 }} value={p.stage} onChange={e => updP(p.id, "stage", e.target.value)}>
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={ss.td}><button style={ss.btnD} onClick={() => rm(p.id)}>✕</button></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={ss.g2}>
        {/* Add outreach */}
        <div style={ss.card}>
          <div style={ss.ch}><span>+ Outreach</span></div>
          <div style={ss.g2}>
            <F l="Date"><input type="date" style={ss.inp} value={oF.date} onChange={e => setOF({ ...oF, date: e.target.value })} /></F>
            <F l="Type">
              <select style={ss.sel} value={oF.type} onChange={e => setOF({ ...oF, type: e.target.value })}>
                {["Walk-in", "Call", "LinkedIn", "Email", "Referral Ask", "Site Walk", "LSA Callback", "Proposal", "Follow-up"].map(v => <option key={v}>{v}</option>)}
              </select>
            </F>
          </div>
          <F l="Notes"><input style={ss.inp} value={oF.notes} onChange={e => setOF({ ...oF, notes: e.target.value })} onKeyDown={e => e.key === "Enter" && addO()} /></F>
          <button style={ss.btn} onClick={addO}>+ Log</button>
        </div>

        {/* KPIs */}
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
