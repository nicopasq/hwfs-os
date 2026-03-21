/**
 * EquipTab — Expense register
 *
 * BUG FIX: Table header had "Rcpt" column (11 cols) but table body had
 * no corresponding cell (10 cells), causing column misalignment.
 * Fixed by adding a receipt download link cell in each row.
 */
import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { F, Tog, Badge } from '../components/ui';
import { SK } from '../constants';

const CATS  = ["Equipment", "Supplies", "Insurance", "Software", "Vehicle", "Legal", "Marketing", "Misc"];
const PAYERS = ["HWE", "Nico", "HWFS"];
const DF = { date: td(), desc: "", amt: "", cat: "Equipment", by: "HWE", cap: false, dep: false, life: 7, su: false, rec: false, rf: "monthly" };

export default function EquipTab({ data, upd, setData, E }) {
  const { T, ss } = useApp();
  const [f, setF] = useState(DF);

  const add = () => {
    if (!f.desc || !f.amt) return;
    const item = { ...f, id: uid(), amt: +f.amt, submittedBy: data.userId || "Director", submittedAt: new Date().toISOString(), status: "approved" };
    setData(prev => {
      const threshold = prev.approvalThreshold || 500;
      const nd = +f.amt <= threshold
        ? { ...prev, expenses: [...prev.expenses, item] }
        : { ...prev, pending: [...(prev.pending || []), { ...item, type: "expense", status: "pending" }] };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn("Save failed", e); }
      return nd;
    });
    setF(DF);
  };

  const rm  = id => upd("expenses", data.expenses.filter(e => e.id !== id));
  const tog = (id, k) => upd("expenses", data.expenses.map(e => e.id === id ? { ...e, [k]: !e[k] } : e));

  const updField = (eid, field, value) => {
    setData(prev => {
      const nd = { ...prev, expenses: prev.expenses.map(x => x.id === eid ? { ...x, [field]: value } : x) };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (er) { console.warn("Save failed", er); }
      return nd;
    });
  };

  return (
    <>
      {/* Add form */}
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Expense</span></div>
        <div style={ss.g5}>
          <F l="Date"><input type="date" style={ss.inp} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></F>
          <F l="Description"><input style={ss.inp} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} /></F>
          <F l="Amount"><input type="number" style={ss.inp} value={f.amt} onChange={e => setF({ ...f, amt: e.target.value })} /></F>
          <F l="Category">
            <select style={ss.sel} value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })}>
              {CATS.map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Paid By">
            <select style={ss.sel} value={f.by} onChange={e => setF({ ...f, by: e.target.value })}>
              {PAYERS.map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
          <F l="Receipt">
            <label style={{ ...ss.btnG, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span>{f.rcptName || "Upload"}</span>
              <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0];
                if (!file || file.size > 2e6) return;
                const r = new FileReader();
                r.onload = ev => setF({ ...f, receipt: ev.target.result, rcptName: file.name });
                r.readAsDataURL(file);
              }} />
            </label>
          </F>
          <F l="Startup"><Tog v={f.su}  onChange={v => setF({ ...f, su: v })} /></F>
          <F l="CapEx">  <Tog v={f.cap} onChange={v => setF({ ...f, cap: v })} /></F>
          <F l="Depr">   <Tog v={f.dep} onChange={v => setF({ ...f, dep: v })} /></F>
          {f.dep && <F l="Life(yr)"><input type="number" style={{ ...ss.inp, width: 55 }} value={f.life} onChange={e => setF({ ...f, life: e.target.value })} /></F>}
          <F l="Recurring"><Tog v={f.rec} onChange={v => setF({ ...f, rec: v })} /></F>
          {f.rec && (
            <F l="Freq">
              <select style={{ ...ss.sel, width: 90 }} value={f.rf} onChange={e => setF({ ...f, rf: e.target.value })}>
                {["weekly", "monthly", "quarterly", "annual"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </F>
          )}
          <div style={{ marginLeft: "auto" }}><button style={ss.btn} onClick={add}>+ Add</button></div>
        </div>
      </div>

      {/* Register table */}
      <div style={ss.card}>
        <div style={ss.ch}><span>Register ({data.expenses.length})</span></div>
        <div style={{ overflowX: "auto" }}>
          <table style={ss.tbl}>
            <thead>
              <tr>
                {["Date", "Description", "Amt", "Cat", "By", "SU", "Cap", "Dep", "Rec", "Rcpt", ""].map((h, i) =>
                  <th key={i} style={i === 2 ? ss.thR : ss.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.expenses.map(e =>
                <tr key={e.id}>
                  <td style={ss.td}>
                    <input type="date" style={{ ...ss.inp, padding: "2px 4px", fontSize: 11, width: 108 }} value={e.date || ""}
                      onChange={ev => updField(e.id, "date", ev.target.value)} />
                  </td>
                  <td style={ss.td}>
                    <input style={{ ...ss.inp, padding: "2px 4px", fontSize: 11, fontWeight: 600 }} value={e.desc || ""}
                      onChange={ev => updField(e.id, "desc", ev.target.value)} />
                  </td>
                  <td style={ss.td}>
                    <input type="number" style={{ ...ss.inp, padding: "2px 4px", fontSize: 11, fontWeight: 700, textAlign: "right", width: 75 }} value={e.amt || ""}
                      onChange={ev => updField(e.id, "amt", +ev.target.value)} />
                  </td>
                  <td style={ss.td}>
                    <select style={{ ...ss.sel, padding: "2px 4px", fontSize: 10 }} value={e.cat || "Misc"}
                      onChange={ev => updField(e.id, "cat", ev.target.value)}>
                      {CATS.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </td>
                  <td style={ss.td}>
                    <select style={{ ...ss.sel, padding: "2px 4px", fontSize: 10 }} value={e.by || "HWE"}
                      onChange={ev => updField(e.id, "by", ev.target.value)}>
                      {PAYERS.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </td>
                  <td style={ss.td}><Tog v={e.su}  onChange={() => tog(e.id, "su")} /></td>
                  <td style={ss.td}><Tog v={e.cap} onChange={() => tog(e.id, "cap")} /></td>
                  <td style={ss.td}><Tog v={e.dep} onChange={() => tog(e.id, "dep")} /></td>
                  <td style={ss.td}>{e.rec ? <Badge c={T.purple}>{e.rf}</Badge> : "—"}</td>
                  {/* FIXED: receipt cell now present to match header */}
                  <td style={ss.td}>
                    {e.receipt
                      ? <a href={e.receipt} download={e.rcptName || "receipt"} style={{ color: T.accent, fontSize: 13 }}>📎</a>
                      : <span style={{ color: T.td2 }}>—</span>
                    }
                  </td>
                  <td style={ss.td}><button style={ss.btnD} onClick={() => rm(e.id)}>✕</button></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={ss.g4}>
        {[["Startup", E.stUp, T.yellow], ["CapEx", E.capEx, T.accent], ["Wk Depr", E.deprW], ["Wk Recur", E.recW, T.purple]].map(([l, v, c], i) =>
          <div key={i} style={{ ...ss.card, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c || T.text }}>{fmtF(v)}</div>
            <div style={{ fontSize: 9, color: T.td2, textTransform: "uppercase", marginTop: 3 }}>{l}</div>
          </div>
        )}
      </div>
    </>
  );
}
