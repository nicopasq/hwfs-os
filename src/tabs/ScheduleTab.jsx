import { useMemo } from 'react';
import { useApp } from '../context';
import { fmtF } from '../utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AUTO_DAYS = {
  1: ['Mon'],
  2: ['Mon', 'Thu'],
  3: ['Mon', 'Wed', 'Fri'],
  4: ['Mon', 'Tue', 'Thu', 'Fri'],
  5: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  6: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  7: DAYS,
};

export default function ScheduleTab({ data, upd }) {
  const { T, ss, mono } = useApp();

  const activeJobs = useMemo(() => data.jobs.filter(j => j.active && !j.pipe), [data.jobs]);

  const getServiceDays = (j) => j.serviceDays || AUTO_DAYS[j.freq] || [];

  const toggleDay = (jobId, day) => {
    upd("jobs", data.jobs.map(j => {
      if (j.id !== jobId) return j;
      const cur = j.serviceDays || AUTO_DAYS[j.freq] || [];
      const has = cur.includes(day);
      return { ...j, serviceDays: has ? cur.filter(d => d !== day) : [...cur, day] };
    }));
  };

  const resetToAuto = (jobId) => {
    upd("jobs", data.jobs.map(j => {
      if (j.id !== jobId) return j;
      const { serviceDays, ...rest } = j;
      return rest;
    }));
  };

  // ── Summary stats ──────────────────────────────────────────────────
  const dayCounts = useMemo(() => {
    const counts = {};
    DAYS.forEach(d => { counts[d] = 0; });
    activeJobs.forEach(j => {
      getServiceDays(j).forEach(d => { counts[d]++; });
    });
    return counts;
  }, [activeJobs, data.jobs]);

  const totalVisitsWeek = Object.values(dayCounts).reduce((s, c) => s + c, 0);

  const dayHours = useMemo(() => {
    const hrs = {};
    DAYS.forEach(d => { hrs[d] = 0; });
    activeJobs.forEach(j => {
      getServiceDays(j).forEach(d => { hrs[d] += (+j.hrsVis || 0); });
    });
    return hrs;
  }, [activeJobs, data.jobs]);

  const dayRevenue = useMemo(() => {
    const rev = {};
    DAYS.forEach(d => { rev[d] = 0; });
    activeJobs.forEach(j => {
      const days = getServiceDays(j);
      if (days.length === 0) return;
      const perVisit = (+j.wkRate || 0) / days.length;
      days.forEach(d => { rev[d] += perVisit; });
    });
    return rev;
  }, [activeJobs, data.jobs]);

  const busiest = DAYS.reduce((a, b) => dayCounts[a] >= dayCounts[b] ? a : b);
  const lightest = DAYS.reduce((a, b) => dayCounts[a] <= dayCounts[b] ? a : b);

  return (
    <>
      {/* ── Summary cards ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 4 }}>
        {[
          ["Weekly Visits", totalVisitsWeek, T.accent],
          ["Active Contracts", activeJobs.length, T.purple],
          ["Busiest Day", `${busiest} (${dayCounts[busiest]})`, T.orange],
          ["Lightest Day", `${lightest} (${dayCounts[lightest]})`, T.green],
        ].map(([label, val, color], i) => (
          <div key={i} style={{ ...ss.card, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: T.td2, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: mono }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── Day-by-day overview bar ────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>Day Overview</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {DAYS.map(d => {
            const pct = dayCounts[busiest] > 0 ? (dayCounts[d] / dayCounts[busiest]) * 100 : 0;
            const isWeekend = d === 'Sat' || d === 'Sun';
            return (
              <div key={d} style={{ textAlign: "center", padding: "10px 4px", background: isWeekend ? T.bg2 : "transparent", borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isWeekend ? T.td2 : T.text, marginBottom: 8 }}>{d}</div>
                <div style={{ height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
                  <div style={{
                    width: 28, borderRadius: "4px 4px 0 0",
                    height: `${Math.max(pct, 4)}%`,
                    background: dayCounts[d] === 0 ? T.border : `${T.accent}cc`,
                    transition: "height .3s",
                  }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: mono }}>{dayCounts[d]}</div>
                <div style={{ fontSize: 10, color: T.td2, marginTop: 2 }}>visits</div>
                <div style={{ fontSize: 11, color: T.ts, fontFamily: mono, marginTop: 4 }}>{(dayHours[d]).toFixed(1)}h</div>
                <div style={{ fontSize: 11, color: T.green, fontFamily: mono, marginTop: 2 }}>{fmtF(dayRevenue[d])}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Schedule grid ──────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}>
          <span>Weekly Schedule ({activeJobs.length} contracts)</span>
          <span style={{ fontSize: 11, color: T.td2, fontWeight: 400 }}>Click cells to toggle · colored = scheduled</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...ss.tbl, tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ ...ss.th, width: 180, textAlign: "left" }}>Contract</th>
                <th style={{ ...ss.th, width: 80, textAlign: "right" }}>$/wk</th>
                <th style={{ ...ss.th, width: 50, textAlign: "center" }}>Freq</th>
                {DAYS.map(d => (
                  <th key={d} style={{ ...ss.th, width: 70, textAlign: "center" }}>
                    {d}
                    <div style={{ fontSize: 9, fontWeight: 400, color: T.td2 }}>{dayCounts[d]}</div>
                  </th>
                ))}
                <th style={{ ...ss.th, width: 60, textAlign: "center" }}>Reset</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: 30, textAlign: "center", color: T.td2 }}>No active contracts. Add contracts in the Contracts tab.</td></tr>
              ) : (
                activeJobs.map(j => {
                  const days = getServiceDays(j);
                  const isCustom = !!j.serviceDays;
                  return (
                    <tr key={j.id}>
                      <td style={{ ...ss.td, fontWeight: 600, fontSize: 13 }}>
                        {j.name}
                        {j.client && <div style={{ fontSize: 10, color: T.td2, fontWeight: 400 }}>{j.client}</div>}
                      </td>
                      <td style={{ ...ss.tdR, fontFamily: mono, fontSize: 12, fontWeight: 600 }}>{fmtF(j.wkRate)}</td>
                      <td style={{ ...ss.td, textAlign: "center", fontSize: 12 }}>{j.freq}x</td>
                      {DAYS.map(d => {
                        const active = days.includes(d);
                        return (
                          <td key={d} style={{ ...ss.td, textAlign: "center", padding: 0 }}>
                            <button
                              onClick={() => toggleDay(j.id, d)}
                              style={{
                                width: "100%", height: 36, border: "none", cursor: "pointer",
                                background: active ? T.accent + "30" : "transparent",
                                borderRadius: 0, transition: "background .15s",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.accent + "12"; }}
                              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                            >
                              {active && (
                                <div style={{
                                  width: 10, height: 10, borderRadius: "50%",
                                  background: T.accent,
                                  boxShadow: `0 0 6px ${T.accent}60`,
                                }} />
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{ ...ss.td, textAlign: "center", padding: 4 }}>
                        {isCustom && (
                          <button
                            onClick={() => resetToAuto(j.id)}
                            title="Reset to auto-fill from frequency"
                            style={{ ...ss.btnD, fontSize: 10, padding: "3px 8px" }}
                          >↺</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Daily breakdown ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {DAYS.map(d => {
          const jobsForDay = activeJobs.filter(j => getServiceDays(j).includes(d));
          const isWeekend = d === 'Sat' || d === 'Sun';
          return (
            <div key={d} style={{ ...ss.card, opacity: jobsForDay.length === 0 ? 0.5 : 1 }}>
              <div style={ss.ch}>
                <span>{d}{isWeekend ? " (weekend)" : ""}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: mono }}>{jobsForDay.length}</span>
              </div>
              {jobsForDay.length === 0 ? (
                <div style={{ padding: "12px 0", textAlign: "center", color: T.td2, fontSize: 12 }}>No visits</div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {jobsForDay.map(j => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid " + T.border }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{j.name}</div>
                        {j.hrsVis > 0 && <div style={{ fontSize: 10, color: T.td2 }}>{j.hrsVis}h/visit</div>}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: mono, color: T.green, fontWeight: 600 }}>
                        {j.wkRate && getServiceDays(j).length > 0 ? fmtF(j.wkRate / getServiceDays(j).length) : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8, padding: "6px 0", borderTop: "1px solid " + T.border, display: "flex", justifyContent: "space-between", fontSize: 11, color: T.ts }}>
                <span>{dayHours[d].toFixed(1)}h total</span>
                <span style={{ fontFamily: mono, fontWeight: 600, color: T.green }}>{fmtF(dayRevenue[d])}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
