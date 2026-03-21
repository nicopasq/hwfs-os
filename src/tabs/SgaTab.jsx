import { useState } from 'react';
import { useApp } from '../context';
import { fmtF } from '../utils';
import { SK } from '../constants';

export default function SgaTab({ data, setData, E }) {
  const { T, ss } = useApp();

  return (
    <div style={ss.card}>
      <div style={ss.ch}><span>SG&A Detail</span></div>
      <table style={ss.tbl}>
        <thead>
          <tr>
            <th style={ss.th}>Line Item</th>
            <th style={ss.thR}>Weekly</th>
            <th style={ss.thR}>Monthly</th>
            <th style={ss.thR}>Annual</th>
            <th style={{ ...ss.th, width: 180 }}>Edit Name</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(E.sgaDet).map(([k, v]) => {
            const nk = k.replace("W", "");
            return (
              <tr key={k}>
                <td style={{ ...ss.td, fontWeight: 600 }}>{data.sgaN[nk] || k}</td>
                <td style={ss.tdR}>{fmtF(v)}</td>
                <td style={ss.tdR}>{fmtF(v * 4.33)}</td>
                <td style={ss.tdR}>{fmtF(v * 52)}</td>
                <td style={ss.td}>
                  <input
                    style={{ ...ss.inp, fontSize: 11, padding: "3px 6px" }}
                    value={data.sgaN[nk] || ""}
                    onChange={e => {
                      const val = e.target.value;
                      const key = nk;
                      setData(prev => {
                        const nd = { ...prev, sgaN: { ...prev.sgaN, [key]: val } };
                        try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (err) { console.warn("Save failed", err); }
                        return nd;
                      });
                    }}
                  />
                </td>
              </tr>
            );
          })}
          <tr style={{ background: T.accent + "12" }}>
            <td style={{ ...ss.td, fontWeight: 700 }}>Total SG&A</td>
            <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(E.sgaW)}</td>
            <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(E.sgaW * 4.33)}</td>
            <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(E.sgaW * 52)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
