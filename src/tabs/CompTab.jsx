import { useState } from 'react';
import { useApp } from '../context';
import { uid, td } from '../utils';
import { F, Badge } from '../components/ui';

const CTS = ["OSHA BBP/HazCom", "CMI Basic", "CIMS-GB", "CPR", "Drug Screen", "BG Check"];

export default function CompTab({ data, upd }) {
  const { T, ss } = useApp();
  const df = { worker: "", cert: "OSHA BBP/HazCom", date: td() };
  const [f, setF] = useState(df);

  const add = () => { if (!f.worker) return; upd("certs", [...(data.certs || []), { ...f, id: uid(), status: "Completed" }]); setF(df); };
  const rm  = id => upd("certs", (data.certs || []).filter(c => c.id !== id));

  return (
    <>
      <div style={ss.g3}>
        {[
          { c: "OSHA BBP/HazCom", t: "Pre-medical",  cost: "$300–500",  i: "🛡" },
          { c: "CMI Basic",       t: "Month 3",       cost: "$800–1,200",i: "📋" },
          { c: "CIMS-GB",         t: "Month 10–14",   cost: "$5–7K",     i: "🏅" },
        ].map((m, i) => {
          const has = (data.certs || []).some(c => c.cert === m.c);
          return (
            <div key={i} style={{ ...ss.card, border: "1px solid " + (has ? T.green : T.border) }}>
              <span style={{ fontSize: 24 }}>{m.i}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: has ? T.green : T.text, marginTop: 4 }}>{m.c}</div>
              <div style={{ fontSize: 11, color: T.ts }}>Target: {m.t} · {m.cost}</div>
              <div style={{ marginTop: 6 }}><Badge c={has ? T.green : T.yellow}>{has ? "DONE" : "PENDING"}</Badge></div>
            </div>
          );
        })}
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>+ Cert</span></div>
        <div style={ss.g3}>
          <F l="Worker">
            <select style={ss.sel} value={f.worker} onChange={e => setF({ ...f, worker: e.target.value })}>
              <option value="">—</option>
              {data.workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              <option>Company-wide</option>
            </select>
          </F>
          <F l="Cert">
            <select style={ss.sel} value={f.cert} onChange={e => setF({ ...f, cert: e.target.value })}>
              {CTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </F>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <F l="Date"><input type="date" style={ss.inp} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></F>
            <button style={ss.btn} onClick={add}>+ Log</button>
          </div>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Log ({(data.certs || []).length})</span></div>
        <table style={ss.tbl}>
          <thead><tr>{["Worker", "Cert", "Date", ""].map((h, i) => <th key={i} style={ss.th}>{h}</th>)}</tr></thead>
          <tbody>
            {(data.certs || []).map(c =>
              <tr key={c.id}>
                <td style={{ ...ss.td, fontWeight: 600 }}>{c.worker}</td>
                <td style={ss.td}><Badge c={T.accent}>{c.cert}</Badge></td>
                <td style={ss.td}>{c.date}</td>
                <td style={ss.td}><button style={ss.btnD} onClick={() => rm(c.id)}>✕</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Matrix</span></div>
        <table style={ss.tbl}>
          <thead>
            <tr>
              <th style={ss.th}>Worker</th>
              {CTS.map(c => <th key={c} style={{ ...ss.th, fontSize: 8, textAlign: "center" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.workers.map(w =>
              <tr key={w.id}>
                <td style={{ ...ss.td, fontWeight: 600 }}>{w.name}</td>
                {CTS.map(c => {
                  const has = (data.certs || []).some(ce => ce.worker === w.name && ce.cert === c);
                  return <td key={c} style={{ ...ss.td, textAlign: "center", color: has ? T.green : T.td2 }}>{has ? "✓" : "—"}</td>;
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
