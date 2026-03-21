import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, pct, uid, td } from '../utils';
import { F, Badge } from '../components/ui';

const DF = { date: td(), ldr: "HWE", prin: "", purp: "", rep: 0 };

export default function EqTab({ data, upd, E }) {
  const { T, ss } = useApp();
  const [f, setF] = useState(DF);

  const add = () => { if (!f.prin) return; upd("loans", [...data.loans, { ...f, id: uid(), prin: +f.prin, rep: +f.rep || 0 }]); setF(DF); };
  const rm  = id => upd("loans", data.loans.filter(l => l.id !== id));

  return (
    <>
      <div style={ss.card}>
        <div style={ss.ch}><span>OA Article V — Distribution Waterfall (Annual)</span></div>
        <table style={ss.tbl}><tbody>
          {[
            ["Annual NOPAT",        E.nopatW * 52,                    T.green,  true],
            ["Reserve Deficit",     Math.max(0, data.S.reserve - E.cash), T.red],
            ["① Member Loan Repay", E.loanRepay,                      T.yellow],
            ["② Tax Distributions", E.taxDist],
            ["③ Preferred Return (7%)", E.prefReturn,                 T.accent],
            ["④ Return of Capital", E.capReturn],
            ["⑤ Residual → HWE (" + pct(data.S.hweEq) + ")", E.hweResidual, T.green, true],
            ["⑤ Residual → Nico (" + pct(data.S.nicoEq) + ")", E.nicoResidual, T.purple, true],
          ].map(([l, v, c, b], i) =>
            <tr key={i} style={{ background: b ? ((c || T.text) + "10") : "transparent" }}>
              <td style={{ ...ss.td, fontWeight: b ? 700 : 400 }}>{l}</td>
              <td style={{ ...ss.tdR, fontWeight: b ? 700 : 600, color: c || T.text }}>{fmtF(v)}</td>
            </tr>
          )}
        </tbody></table>
      </div>

      <div style={ss.g4}>
        {[
          { l: "HWE EQUITY",   v: pct(data.S.hweEq), c: T.accent, sub: fmtF(data.S.capHWE) },
          { l: "NICO VESTED",  v: pct(E.vestedPct), c: T.purple, sub: pct(data.S.nicoVestPct) + " target · " + E.yrsElapsed.toFixed(1) + "yr" },
          { l: "ANNUAL MOIC",  v: E.cap > 0 ? (E.nopatW * 52 / E.cap).toFixed(1) + "x" : "0x", c: T.green },
          { l: "PAYBACK",      v: E.nopatW > 0 ? Math.round(E.cap / (E.nopatW * 52) * 12) + " mo" : "—", c: T.yellow },
        ].map((m, i) =>
          <div key={i} style={{ ...ss.card, textAlign: "center", background: T.card2 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: m.c }}>{m.v}</div>
            <div style={{ fontSize: 9, color: T.td2, marginTop: 3 }}>{m.l}</div>
            {m.sub && <div style={{ fontSize: 11, color: T.ts, marginTop: 2 }}>{m.sub}</div>}
          </div>
        )}
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>+ Member Loan (Art IV, {(data.S.loanRate * 100).toFixed(0)}%)</span></div>
        <div style={ss.g4}>
          <F l="Date"><input type="date" style={ss.inp} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></F>
          <F l="Lender">
            <select style={ss.sel} value={f.ldr} onChange={e => setF({ ...f, ldr: e.target.value })}>
              {["HWE", "Nico", "Dad"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Principal"><input type="number" style={ss.inp} value={f.prin} onChange={e => setF({ ...f, prin: e.target.value })} /></F>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <F l="Purpose"><input style={ss.inp} value={f.purp} onChange={e => setF({ ...f, purp: e.target.value })} /></F>
            <button style={ss.btn} onClick={add}>+ Add</button>
          </div>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Loans</span><span style={{ color: T.yellow, fontWeight: 700 }}>Out: {fmtF(E.lOut)}</span></div>
        <table style={ss.tbl}>
          <thead><tr>{["Date", "Lender", "Principal", "Purpose", "Balance", "Interest", ""].map((h, i) => <th key={i} style={[2, 4, 5].includes(i) ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
          <tbody>
            {data.loans.map(l => {
              const d   = Math.max(0, (Date.now() - new Date(l.date)) / 864e5);
              const int = (l.prin - l.rep) * data.S.loanRate * (d / 365);
              return (
                <tr key={l.id}>
                  <td style={ss.td}>{l.date}</td>
                  <td style={ss.td}>{l.ldr}</td>
                  <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(l.prin)}</td>
                  <td style={ss.td}>{l.purp}</td>
                  <td style={{ ...ss.tdR, color: T.yellow, fontWeight: 700 }}>{fmtF(l.prin - l.rep)}</td>
                  <td style={{ ...ss.tdR, color: T.ts }}>{fmtF(int)}</td>
                  <td style={ss.td}><button style={ss.btnD} onClick={() => rm(l.id)}>✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
