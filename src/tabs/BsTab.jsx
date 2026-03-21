import { useApp } from '../context';
import { useTableRows } from '../components/ui';

export default function BsTab({ data, E }) {
  const { T, ss } = useApp();
  const { BR } = useTableRows();

  const ocf = E.nopatW + E.deprW;

  return (
    <div style={ss.card}>
      <div style={ss.ch}><span>Balance Sheet</span></div>
      <table style={ss.tbl}>
        <thead><tr><th style={ss.th}></th><th style={ss.thR}>Today</th><th style={ss.thR}>+1 Wk</th><th style={ss.thR}>+1 Mo</th><th style={ss.thR}>+1 Yr</th></tr></thead>
        <tbody>
          <tr><td style={{ ...ss.td, fontWeight: 700, color: T.accent }} colSpan={5}>ASSETS</td></tr>
          {BR("Cash",       [E.cash, E.cash + ocf, E.cash + ocf * 4.33, E.cash + ocf * 52], { i: true, c: T.green })}
          {BR("Equipment",  [E.capEx, E.capEx - E.deprW, E.capEx - E.deprW * 4.33, E.capEx - E.deprW * 52], { i: true })}
          {BR("Inventory",  [E.invVal, E.invVal - E.supW, E.invVal - E.supW * 4.33, Math.max(0, E.invVal - E.supW * 52)], { i: true })}
          {BR("Total Assets", [
            E.cash + E.capEx + E.invVal,
            E.cash + ocf + E.capEx - E.deprW + E.invVal - E.supW,
            E.cash + ocf * 4.33 + E.capEx - E.deprW * 4.33 + E.invVal - E.supW * 4.33,
            E.cash + ocf * 52 + E.capEx - E.deprW * 52 + Math.max(0, E.invVal - E.supW * 52),
          ], { b: true, hl: T.accent + "10" })}

          <tr><td style={{ ...ss.td, fontWeight: 700, color: T.red }} colSpan={5}>LIABILITIES</td></tr>
          {BR("Member Loans", [E.lOut, E.lOut, E.lOut, E.lOut], { i: true })}
          {BR("Tax Payable",  [0, E.taxW, E.taxW * 4.33, E.taxW * 52], { i: true })}

          <tr><td style={{ ...ss.td, fontWeight: 700, color: T.green }} colSpan={5}>EQUITY</td></tr>
          {BR("HWE Capital",  [data.S.capHWE, data.S.capHWE, data.S.capHWE, data.S.capHWE], { i: true })}
          {BR("Nico PI",      [data.S.capNico, data.S.capNico, data.S.capNico, data.S.capNico], { i: true })}
          {BR("Retained",     [0, E.nopatW, E.nopatW * 4.33, E.nopatW * 52], { i: true, c: T.green })}
          {BR("Total Equity", [E.cap, E.cap + E.nopatW, E.cap + E.nopatW * 4.33, E.cap + E.nopatW * 52], { b: true, hl: T.green + "10" })}
        </tbody>
      </table>
    </div>
  );
}
