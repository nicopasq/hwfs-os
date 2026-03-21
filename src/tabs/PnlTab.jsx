import { useApp } from '../context';
import { pct } from '../utils';
import { useTableRows } from '../components/ui';

export default function PnlTab({ data, E }) {
  const { T, ss } = useApp();
  const { PR, Sep } = useTableRows();

  return (
    <div style={ss.card}>
      <div style={ss.ch}><span>Income Statement</span><span style={{ fontSize: 10, color: T.td2 }}>↕ Items · → Periods</span></div>
      <table style={ss.tbl}>
        <thead><tr><th style={ss.th}></th><th style={ss.thR}>Weekly</th><th style={ss.thR}>Monthly</th><th style={ss.thR}>Annual</th></tr></thead>
        <tbody>
          {PR("Revenue (Recurring)", E.wR,        { b: true, hl: T.green  + "12", c: T.green })}
          {PR("Revenue (Specialty)", E.specRevW,  { i: true, lk: "spec",  c: T.green })}
          {PR("Total Revenue",       E.totalWR,   { b: true, c: T.green })}
          {Sep("COST OF SERVICES")}
          {PR("Crew Wages",    E.wWage, { i: true, lk: "labor" })}
          {PR("Payroll Burden",E.wBurd, { i: true })}
          {PR("Workers Comp",  E.wWC,   { i: true })}
          {PR("Bonus",         E.wBon,  { i: true })}
          {PR("Supplies",      E.supW,  { i: true, lk: "inv" })}
          {PR("Van Ops",       E.vanW,  { i: true })}
          {PR("Total COGS",    E.cogsW, { b: true })}
          {PR("GROSS PROFIT",  E.gpW + E.specRevW, { b: true, hl: T.accent + "12", c: E.gpW >= 0 ? T.green : T.red })}
          <tr><td style={{ ...ss.td, fontSize: 11, color: T.td2 }} colSpan={4}>
            Gross Margin: {pct(E.totalWR > 0 ? (E.gpW + E.specRevW) / E.totalWR : 0)}
          </td></tr>
          {Sep("SG&A")}
          {Object.entries(E.sgaDet).map(([k, v]) => {
            const nk = k.replace("W", "");
            return PR(data.sgaN[nk] || k, v, { i: true });
          })}
          {PR("Total SG&A", E.sgaW,    { b: true, lk: "sga" })}
          {PR("EBITDA",     E.ebitdaW, { b: true, hl: (E.ebitdaW >= 0 ? T.green : T.red) + "20", c: E.ebitdaW >= 0 ? T.green : T.red })}
          {PR("Depreciation",E.deprW,  { i: true })}
          {PR("EBIT",        E.ebitW,  { b: true })}
          {PR("Tax (" + (data.S.taxRate * 100).toFixed(1) + "%)", E.taxW, { i: true })}
          {PR("NOPAT",       E.nopatW, { b: true, hl: T.accent + "20", c: T.accent })}
        </tbody>
      </table>
    </div>
  );
}
