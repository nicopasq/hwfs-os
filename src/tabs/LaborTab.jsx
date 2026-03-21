import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { F, Tog, Badge } from '../components/ui';

const DF = { name: "", role: "Cleaner", rate: 16, hpw: 25, active: true, start: td(), ft: false, pri: 1 };

export default function LaborTab({ data, upd, E }) {
  const { T, ss } = useApp();
  const [f, setF] = useState(DF);

  const add = () => { if (!f.name) return; upd("workers", [...data.workers, { ...f, id: uid(), rate: +f.rate, hpw: +f.hpw }]); setF(DF); };
  const rm  = id => upd("workers", data.workers.filter(w => w.id !== id));
  const tog = (id, k) => upd("workers", data.workers.map(w => w.id === id ? { ...w, [k]: !w[k] } : w));

  return (
    <>
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Worker</span></div>
        <div style={ss.g5}>
          <F l="Name"><input style={ss.inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></F>
          <F l="Role">
            <select style={ss.sel} value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
              {["Cleaner", "Lead", "Supervisor", "Ops Director"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="$/hr"><input type="number" style={ss.inp} value={f.rate} onChange={e => setF({ ...f, rate: e.target.value })} /></F>
          <F l="Hrs/wk"><input type="number" style={ss.inp} value={f.hpw} onChange={e => setF({ ...f, hpw: e.target.value })} /></F>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <F l="Active"><Tog v={f.active} onChange={v => setF({ ...f, active: v })} /></F>
            <F l="FT"><Tog v={f.ft} onChange={v => setF({ ...f, ft: v })} /></F>
            <button style={ss.btn} onClick={add}>+ Add</button>
          </div>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Workforce</span></div>
        <table style={ss.tbl}>
          <thead><tr>{["Name", "Role", "$/hr", "Hrs/wk", "Weekly", "Loaded", "FT", "Active", ""].map((h, i) => <th key={i} style={[2, 3, 4, 5].includes(i) ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
          <tbody>
            {data.workers.map(w => {
              const base   = (+w.rate) * (+w.hpw);
              const loaded = base * (1 + data.A.burden + data.A.wcRate);
              return (
                <tr key={w.id}>
                  <td style={{ ...ss.td, fontWeight: 600 }}>{w.name}<br /><span style={{ fontSize: 10, color: T.td2 }}>{w.start}</span></td>
                  <td style={ss.td}><Badge>{w.role}</Badge></td>
                  <td style={ss.tdR}>${(+w.rate).toFixed(2)}</td>
                  <td style={ss.tdR}>{w.hpw}</td>
                  <td style={ss.tdR}>{fmtF(base)}</td>
                  <td style={{ ...ss.tdR, fontWeight: 600 }}>{fmtF(loaded)}</td>
                  <td style={ss.td}><Tog v={w.ft}     onChange={() => tog(w.id, "ft")} /></td>
                  <td style={ss.td}><Tog v={w.active} onChange={() => tog(w.id, "active")} /></td>
                  <td style={ss.td}><button style={ss.btnD} onClick={() => rm(w.id)}>✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={ss.g4}>
        {[["Wages", E.wWage, T.accent], ["Burden", E.wBurd], ["WC", E.wWC, T.yellow], ["Total Labor", E.wLab, T.red]].map(([l, v, c], i) =>
          <div key={i} style={{ ...ss.card, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c || T.text }}>{fmtF(v)}</div>
            <div style={{ fontSize: 9, color: T.td2, textTransform: "uppercase", marginTop: 3 }}>{l}</div>
          </div>
        )}
      </div>
    </>
  );
}
