import { useApp } from '../context';
import { useTableRows } from '../components/ui';

export default function CfTab({ data, E }) {
  const { ss } = useApp();
  const { PR, Sep } = useTableRows();

  const ocf = E.nopatW + E.deprW;
  const fcf = ocf - E.eqW - E.taxW;

  return (
    <div style={ss.card}>
      <div style={ss.ch}><span>Cash Flow</span></div>
      <table style={ss.tbl}>
        <thead><tr><th style={ss.th}></th><th style={ss.thR}>Weekly</th><th style={ss.thR}>Monthly</th><th style={ss.thR}>Annual</th></tr></thead>
        <tbody>
          {Sep("OPERATING")}
          {PR("NOPAT",        E.nopatW, { i: true, lk: "pnl" })}
          {PR("+ Depreciation",E.deprW, { i: true })}
          {PR("Operating CF", ocf,      { b: true, hl: (ocf >= 0 ? "#22c992" : "#f0524e") + "12", c: ocf >= 0 ? "#22c992" : "#f0524e" })}
          {Sep("INVESTING")}
          {PR("Equip Refresh", -E.eqW,  { i: true })}
          {Sep("FINANCING")}
          {PR("Tax Dist",      -E.taxW, { i: true })}
          {E.lOut > 0 && PR("Loan Interest", -(E.lOut * data.S.loanRate / 52), { i: true })}
          {PR("FREE CASH FLOW", fcf,    { b: true, hl: "#4f8fff15", c: "#4f8fff" })}
          {Sep("BALANCE")}
          {PR("Beginning",    E.cash,   { i: true })}
          {PR("+ FCF",        fcf,      { i: true, c: "#22c992" })}
          {PR("Ending",       E.cash + fcf, { b: true, c: "#22c992", hl: "#22c99212" })}
        </tbody>
      </table>
    </div>
  );
}
