import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { F, Badge } from '../components/ui';
import SelectOrOther from '../components/SelectOrOther';

const DF = { date: td(), client: "", type: "Floor Wax", sf: "", price: "", weeks: 4, done: false };

export default function SpecTab({ data, upd, E }) {
  const { T, ss } = useApp();
  const [f, setF] = useState(DF);

  const add = () => { if (!f.client || !f.price) return; upd("specJobs", [...(data.specJobs || []), { ...f, id: uid(), sf: +f.sf || 0, price: +f.price, weeks: +f.weeks || 4 }]); setF(DF); };
  const rm  = id => upd("specJobs", (data.specJobs || []).filter(s => s.id !== id));
  const tog = id => upd("specJobs", (data.specJobs || []).map(s => s.id === id ? { ...s, done: !s.done } : s));
  const active = (data.specJobs || []).filter(s => !s.done);

  return (
    <>
      <div style={ss.g4}>
        {[["Active", active.length, T.accent], ["Wkly Rev", fmtF(E.specRevW), T.green], ["Booked", fmtF((data.specJobs || []).reduce((s, j) => s + (+j.price || 0), 0)), T.purple], ["Done", (data.specJobs || []).filter(s => s.done).length, T.td2]].map(([l, v, c], i) =>
          <div key={i} style={{ ...ss.card, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 9, color: T.td2, textTransform: "uppercase", marginTop: 3 }}>{l}</div>
          </div>
        )}
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>+ Job</span><span style={{ fontSize: 10, color: T.td2 }}>Floor wax · Carpet · Post-con · Emergency</span></div>
        <div style={ss.g5}>
          <F l="Client"><input style={ss.inp} value={f.client} onChange={e => setF({ ...f, client: e.target.value })} /></F>
          <F l="Type">
            <SelectOrOther
              options={["Floor Wax", "Carpet Extract", "Post-Construction", "Emergency", "Pressure Wash", "Deep Clean"]}
              value={f.type}
              onChange={v => setF({ ...f, type: v })}
              style={ss.sel}
            />
          </F>
          <F l="SF"><input type="number" style={ss.inp} value={f.sf} onChange={e => setF({ ...f, sf: e.target.value })} /></F>
          <F l="Price"><input type="number" style={ss.inp} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></F>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <F l="Spread(wk)"><input type="number" style={{ ...ss.inp, width: 60 }} value={f.weeks} onChange={e => setF({ ...f, weeks: e.target.value })} /></F>
            <button style={ss.btn} onClick={add}>+ Add</button>
          </div>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Active ({active.length})</span></div>
        <table style={ss.tbl}>
          <thead><tr>{["Date", "Client", "Type", "Price", "$/wk", "", ""].map((h, i) => <th key={i} style={[3, 4].includes(i) ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
          <tbody>
            {active.map(s =>
              <tr key={s.id}>
                <td style={ss.td}>{s.date}</td>
                <td style={{ ...ss.td, fontWeight: 600 }}>{s.client}</td>
                <td style={ss.td}><Badge c={s.type === "Emergency" ? T.red : T.accent}>{s.type}</Badge></td>
                <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(s.price)}</td>
                <td style={{ ...ss.tdR, color: T.green }}>{fmtF(s.weeks > 0 ? s.price / s.weeks : 0)}</td>
                <td style={ss.td}><button style={ss.btnG} onClick={() => tog(s.id)}>✓</button></td>
                <td style={ss.td}><button style={ss.btnD} onClick={() => rm(s.id)}>✕</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Rate Card</span></div>
        <table style={ss.tbl}><tbody>
          {[["Floor Strip & Wax", "$" + data.S.specFloorSF + "/SF"], ["Carpet Extraction", "$" + data.S.specCarpetSF + "/SF"], ["Post-Construction", "$" + data.S.specPostConSF + "/SF"], ["Emergency", "$" + data.S.emergencyDispatch + " + $" + data.S.emergencyHr + "/hr"]].map(([l, r], i) =>
            <tr key={i}><td style={ss.td}>{l}</td><td style={{ ...ss.tdR, fontWeight: 700 }}>{r}</td></tr>
          )}
        </tbody></table>
      </div>
    </>
  );
}
