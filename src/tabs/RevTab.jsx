import { useApp } from '../context';
import { fmtF, pct } from '../utils';
import { Badge } from '../components/ui';
import { TIERS } from '../constants';

export default function RevTab({ data, E }) {
  const { T, ss } = useApp();

  const aj = data.jobs.filter(j => j.active && !j.pipe);
  const byClient = {};
  aj.forEach(j => {
    const c = j.client || "Other";
    if (!byClient[c]) byClient[c] = { wkRev: 0, n: 0, sf: 0 };
    byClient[c].wkRev += (+j.wkRate || 0);
    byClient[c].n++;
    byClient[c].sf += (+j.sf || 0);
  });
  const byTier = {};
  aj.forEach(j => {
    const t = j.tier || "Basic";
    if (!byTier[t]) byTier[t] = { wkRev: 0, n: 0 };
    byTier[t].wkRev += (+j.wkRate || 0);
    byTier[t].n++;
  });
  const maxR = Math.max(1, ...Object.values(byClient).map(c => c.wkRev));

  return (
    <div style={ss.card}>
      <div style={ss.ch}><span>Consolidated Revenue</span></div>

      <div style={ss.g4}>
        {[["Recurring/Wk", fmtF(E.wR), T.green], ["Specialty/Wk", fmtF(E.specRevW), T.purple], ["Total/Wk", fmtF(E.totalWR), T.accent], ["Annual", fmtF(E.totalWR * 52), T.yellow]].map(([l, v, c], i) =>
          <div key={i} style={{ ...ss.card, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 9, color: T.td2, textTransform: "uppercase", marginTop: 3 }}>{l}</div>
          </div>
        )}
      </div>

      <div style={ss.g2}>
        <div style={ss.card}>
          <div style={ss.ch}><span>By Client</span></div>
          <table style={ss.tbl}>
            <thead><tr><th style={ss.th}>Client</th><th style={ss.thR}>#</th><th style={ss.thR}>SF</th><th style={ss.thR}>$/Wk</th><th style={{ ...ss.th, width: 100 }}>Share</th></tr></thead>
            <tbody>
              {Object.entries(byClient).sort((a, b) => b[1].wkRev - a[1].wkRev).map(([c, d]) =>
                <tr key={c}>
                  <td style={{ ...ss.td, fontWeight: 600 }}>{c}</td>
                  <td style={ss.tdR}>{d.n}</td>
                  <td style={ss.tdR}>{d.sf.toLocaleString()}</td>
                  <td style={{ ...ss.tdR, fontWeight: 700, color: T.green }}>{fmtF(d.wkRev)}</td>
                  <td style={ss.td}>
                    <div style={{ height: 12, background: T.bg2, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: (d.wkRev / maxR * 100) + "%", background: T.accent, borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={ss.card}>
          <div style={ss.ch}><span>By Tier</span></div>
          <table style={ss.tbl}>
            <thead><tr><th style={ss.th}>Tier</th><th style={ss.thR}>#</th><th style={ss.thR}>$/Wk</th><th style={ss.thR}>% of Total</th></tr></thead>
            <tbody>
              {Object.entries(byTier).sort((a, b) => b[1].wkRev - a[1].wkRev).map(([t, d]) =>
                <tr key={t}>
                  <td style={ss.td}><Badge c={TIERS[t]?.color || T.accent}>{t}</Badge></td>
                  <td style={ss.tdR}>{d.n}</td>
                  <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(d.wkRev)}</td>
                  <td style={ss.tdR}>{pct(E.wR > 0 ? d.wkRev / E.wR : 0)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
