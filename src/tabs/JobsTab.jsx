import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, pct, uid, td } from '../utils';
import { F, Tog, Badge } from '../components/ui';
import { TIERS, TK } from '../constants';

const DF = { name: "", client: "Thomson AAM", type: "Small Condo", tier: "Basic", sf: "", freq: 1, wkRate: "", hrsVis: "", mSup: 65, start: td(), active: true, pipe: false };

export default function JobsTab({ data, upd, E }) {
  const { T, ss } = useApp();
  const [f, setF] = useState(DF);

  const ap = (sf, freq, tier) => { const r = TIERS[tier]?.rate || .10; return sf ? Math.round(+sf * r * (+freq || 1)) : ""; };
  const add = () => {
    if (!f.name || !f.wkRate) return;
    upd("jobs", [...data.jobs, { ...f, id: uid(), sf: +f.sf, wkRate: +f.wkRate, freq: +f.freq, hrsVis: +f.hrsVis, mSup: +f.mSup }]);
    setF(DF);
  };
  const rm = id => upd("jobs", data.jobs.filter(j => j.id !== id));

  return (
    <>
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Contract</span><span style={{ fontSize: 10, color: T.td2 }}>Auto: SF × tier × freq</span></div>
        <div style={ss.g5}>
          <F l="Property"><input style={ss.inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></F>
          <F l="Client">
            <select style={ss.sel} value={f.client} onChange={e => setF({ ...f, client: e.target.value })}>
              {["Thomson AAM", "McKinley", "Oxford", "Wickfield", "Baker Street", "Direct"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Tier">
            <select style={ss.sel} value={f.tier} onChange={e => { const t = e.target.value; setF({ ...f, tier: t, wkRate: ap(f.sf, f.freq, t) || f.wkRate }); }}>
              {TK.map(t => <option key={t}>{t}</option>)}
            </select>
          </F>
          <F l="SF"><input type="number" style={ss.inp} value={f.sf} onChange={e => setF({ ...f, sf: e.target.value, wkRate: ap(e.target.value, f.freq, f.tier) || f.wkRate })} /></F>
          <F l="$/wk"><input type="number" style={ss.inp} value={f.wkRate} onChange={e => setF({ ...f, wkRate: e.target.value })} /></F>
        </div>
        <div style={ss.g5}>
          <F l="Freq/wk"><input type="number" style={ss.inp} value={f.freq} onChange={e => setF({ ...f, freq: e.target.value })} /></F>
          <F l="Hrs/visit"><input type="number" step=".5" style={ss.inp} value={f.hrsVis} onChange={e => setF({ ...f, hrsVis: e.target.value })} /></F>
          <F l="Supply $/mo"><input type="number" style={ss.inp} value={f.mSup} onChange={e => setF({ ...f, mSup: e.target.value })} /></F>
          <F l="Start"><input type="date" style={ss.inp} value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></F>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <F l="Active"><Tog v={f.active} onChange={v => setF({ ...f, active: v })} /></F>
            <F l="Pipe"><Tog v={f.pipe} onChange={v => setF({ ...f, pipe: v })} /></F>
            <button style={ss.btn} onClick={add}>+ Add</button>
          </div>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Contracts ({data.jobs.length})</span></div>
        <div style={{ overflowX: "auto" }}>
          <table style={ss.tbl}>
            <thead><tr>{["Property", "Client", "Tier", "SF", "Freq", "$/wk", "$/SF/yr", "Margin", "Status", ""].map((h, i) => <th key={i} style={[3, 5, 6, 7].includes(i) ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.jobs.map(j => {
                const yr   = (+j.wkRate || 0) * 52;
                const psfyr = j.sf ? yr / j.sf : 0;
                const hrs  = (+j.freq || 0) * (+j.hrsVis || 0);
                const lc   = hrs * 18 * 1.17;
                const sw   = (+j.mSup || 0) / 4.33;
                const gp   = (+j.wkRate || 0) - lc - sw;
                const gm   = (+j.wkRate || 0) > 0 ? gp / (+j.wkRate || 1) : 0;
                const tc   = TIERS[j.tier] || {};
                return (
                  <tr key={j.id} style={{ opacity: j.pipe ? .6 : 1 }}>
                    <td style={{ ...ss.td, fontWeight: 600 }}>{j.name}</td>
                    <td style={ss.td}>{j.client}</td>
                    <td style={ss.td}><Badge c={tc.color || T.accent}>{j.tier || "Basic"}</Badge></td>
                    <td style={ss.tdR}>{j.sf ? j.sf.toLocaleString() : ""}</td>
                    <td style={ss.td}>{j.freq}x</td>
                    <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(j.wkRate)}</td>
                    <td style={ss.tdR}>{psfyr ? ("$" + psfyr.toFixed(2)) : ""}</td>
                    <td style={{ ...ss.tdR, fontWeight: 600, color: gm > .6 ? T.green : gm > .4 ? T.yellow : T.red }}>{pct(gm)}</td>
                    <td style={ss.td}>
                      {j.pipe ? <Badge c={T.purple}>PIPE</Badge> : j.active ? <Badge c={T.green}>ACTIVE</Badge> : <Badge c={T.red}>OFF</Badge>}
                    </td>
                    <td style={ss.td}><button style={ss.btnD} onClick={() => rm(j.id)}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
