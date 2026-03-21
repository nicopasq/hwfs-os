import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid } from '../utils';
import { F, Badge } from '../components/ui';

const DF = { name: "", cat: "Chemical", uc: "", qty: "", usePW: "", reorderAt: 2 };

export default function InvTab({ data, upd, updA, E }) {
  const { T, ss } = useApp();
  const [f, setF] = useState(DF);

  const add = () => { if (!f.name) return; upd("inventory", [...data.inventory, { ...f, id: uid(), uc: +f.uc || 0, qty: +f.qty || 0 }]); setF(DF); };
  const rm  = id => upd("inventory", data.inventory.filter(i => i.id !== id));

  return (
    <>
      <div style={ss.card}>
        <div style={ss.ch}><span>Consumption</span></div>
        <div style={ss.g4}>
          <F l="Gal/Hr"><input type="number" step=".01" style={ss.inp} value={data.A.galPerHr}  onChange={e => updA("galPerHr",  +e.target.value)} /></F>
          <F l="Usage %"><input type="number" step=".01" style={ss.inp} value={data.A.usagePct} onChange={e => updA("usagePct",  +e.target.value)} /></F>
          <F l="Dilution (x:1)"><input type="number" style={ss.inp} value={data.A.dilution}     onChange={e => updA("dilution",  +e.target.value)} /></F>
          <F l="SF/Hr"><input type="number" style={ss.inp} value={data.A.sfPerHr}               onChange={e => updA("sfPerHr",   +e.target.value)} /></F>
        </div>
        <div style={{ fontSize: 11, color: T.ts, marginTop: 4 }}>Est weekly: {E.estGalWk.toFixed(2)} gal conc from {E.mhW.toFixed(1)} man-hrs</div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>+ Item</span></div>
        <div style={ss.g4}>
          <F l="Product"><input style={ss.inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></F>
          <F l="Cat">
            <select style={ss.sel} value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })}>
              {["Chemical", "Paper", "Equipment", "Microfiber", "Trash", "PPE"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Unit $"><input type="number" step=".01" style={ss.inp} value={f.uc} onChange={e => setF({ ...f, uc: e.target.value })} /></F>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <F l="Qty"><input type="number" style={ss.inp} value={f.qty} onChange={e => setF({ ...f, qty: e.target.value })} /></F>
            <button style={ss.btn} onClick={add}>+</button>
          </div>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}>
          <span>Stock ({data.inventory.length})</span>
          <span style={{ fontSize: 11 }}>{fmtF(E.invVal)} · {E.supW > 0 ? (E.invVal / E.supW).toFixed(1) : "0"} wk cover</span>
        </div>
        <table style={ss.tbl}>
          <thead><tr>{["Product", "Cat", "$", "Qty", "Value", ""].map((h, i) => <th key={i} style={[2, 3, 4].includes(i) ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
          <tbody>
            {data.inventory.map(i =>
              <tr key={i.id}>
                <td style={{ ...ss.td, fontWeight: 600 }}>{i.name}</td>
                <td style={ss.td}><Badge>{i.cat}</Badge></td>
                <td style={ss.tdR}>${(+i.uc).toFixed(2)}</td>
                <td style={ss.tdR}>{i.qty}</td>
                <td style={{ ...ss.tdR, fontWeight: 600 }}>{fmtF((+i.uc) * (+i.qty))}</td>
                <td style={ss.td}><button style={ss.btnD} onClick={() => rm(i.id)}>✕</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
