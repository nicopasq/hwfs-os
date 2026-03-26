import { useApp } from '../context';
import { fmtF, fmt, pct, td } from '../utils';

// ── KPI hero card ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon, trend, onClick }) {
  const { T, mono } = useApp();
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid " + T.border2,
        borderLeft: "3px solid " + color,
        borderRadius: 4,
        padding: "20px 24px",
        cursor: onClick ? "pointer" : "default",
        boxShadow: T.shadow || "none",
        transition: "box-shadow .2s, transform .2s",
      }}
      onMouseEnter={e => { if (!onClick) return; e.currentTarget.style.boxShadow = T.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { if (!onClick) return; e.currentTarget.style.boxShadow = T.shadow || "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.td2, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: color, fontFamily: mono, lineHeight: 1, letterSpacing: "-0.5px" }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 12, color: T.td2, marginTop: 8, lineHeight: 1.4 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: color, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <span style={{ color: trend >= 0 ? T.green : T.red, fontWeight: 600 }}>{trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%</span>
          <span style={{ color: T.td2 }}>vs last period</span>
        </div>
      )}
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data: proj, T }) {
  const H = 140, W = 26, gap = 10, LP = 48;
  const maxRev = Math.max(...proj.map(p => p.rev), 1);
  const maxE   = Math.max(...proj.map(p => Math.abs(p.ebitda)), 1);
  const totalW = LP + proj.length * (W + gap);
  const fmtK = v => {
    const abs = Math.abs(v);
    const str = abs >= 1000 ? (abs / 1000).toFixed(1) + 'k' : Math.round(abs).toString();
    return (v < 0 ? '-$' : '$') + str;
  };
  const yTicks = [0, 0.5, 1.0];
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${H + 46}`} style={{ overflow: "visible", display: "block" }}>
      {/* Y-axis scale lines + revenue labels */}
      {yTicks.map(t => {
        const y = H - t * H;
        return (
          <g key={t}>
            <line x1={LP} y1={y} x2={totalW} y2={y}
              stroke={t === 0 ? "#D5E5DC" : "#EAF0EA"} strokeWidth={1}
              strokeDasharray={t === 0 ? undefined : "3,3"} />
            <text x={LP - 5} y={y + 3} textAnchor="end" fill="#9aab9e"
              fontSize={8} fontFamily="'JetBrains Mono',monospace">
              {fmtK(t * maxRev)}
            </text>
          </g>
        );
      })}

      {proj.map((p, i) => {
        const x   = LP + i * (W + gap);
        const rh  = (p.rev / maxRev) * H;
        const eh  = Math.max(3, (Math.abs(p.ebitda) / maxE) * (H * 0.7));
        const pos = p.ebitda >= 0;
        return (
          <g key={i}>
            {i % 2 === 0 && <rect x={x - gap / 2} y={0} width={W + gap} height={H} fill="#F0F4F1" opacity={0.6} />}
            {/* Revenue bar (faint background) */}
            <rect x={x} y={H - rh} width={W} height={rh} fill="#3A7D44" opacity={0.12} rx={2} />
            {/* EBITDA bar */}
            <rect x={x + 5} y={pos ? H - eh : H} width={W - 10} height={eh}
              fill={pos ? "#2E7D32" : "#C62828"} opacity={0.85} rx={2} />
            {/* Month label */}
            <text x={x + W / 2} y={H + 14} textAnchor="middle"
              fill="#7A8B85" fontSize={9} fontFamily="Outfit,sans-serif">M{p.m}</text>
            {/* EBITDA dollar value */}
            <text x={x + W / 2} y={H + 30} textAnchor="middle"
              fill={pos ? "#2E7D32" : "#C62828"} fontSize={7.5}
              fontFamily="'JetBrains Mono',monospace" fontWeight="600">
              {fmtK(p.ebitda)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Utilization ring ───────────────────────────────────────────────────────────
function UtilRing({ util, T }) {
  const r = 48, cx = 60, cy = 60;
  const circ  = 2 * Math.PI * r;
  const dash  = Math.min(util, 1) * circ;
  const color = util > .92 ? T.red : util > .75 ? T.yellow : T.green;
  return (
    <svg width={120} height={120} style={{ display: "block", margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={9} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize={20} fontWeight={600}
        fontFamily="'JetBrains Mono','Fira Code',monospace">{(util * 100).toFixed(0)}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#7A8B85" fontSize={9} fontFamily="Outfit,sans-serif">UTILIZATION</text>
    </svg>
  );
}

// ── Pipeline funnel ────────────────────────────────────────────────────────────
function PipelineBar({ prospects, T }) {
  const STAGES = ["Lead", "Contact Made", "Walkthrough", "Proposal", "Trial", "Won"];
  const SC = { "Lead": T.td2, "Contact Made": T.accent, "Walkthrough": T.purple, "Proposal": T.yellow, "Trial": T.accent, "Won": T.green };
  const total = prospects.length || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 14, background: T.border2, gap: 1 }}>
        {STAGES.map(s => {
          const n = prospects.filter(p => p.stage === s).length;
          return n > 0 ? <div key={s} style={{ flex: n / total, background: SC[s], transition: "flex .4s ease", opacity: 0.85 }} title={`${s}: ${n}`} /> : null;
        })}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {STAGES.map(s => {
          const n = prospects.filter(p => p.stage === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: SC[s] }} />
              <span style={{ color: T.td2 }}>{s}</span>
              <span style={{ fontWeight: 600, color: n > 0 ? SC[s] : T.td2, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Small stat cell ───────────────────────────────────────────────────────────
function StatCell({ label, value, color, T, mono }) {
  return (
    <div style={{ padding: "10px 14px", background: "#F7FAF8", borderRadius: 4, border: "1px solid #E8EFE9" }}>
      <div style={{ fontSize: 10, color: "#7A8B85", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || "#1A3C34", fontFamily: mono }}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function DashTab({ data, E }) {
  const { T, ss, nav, mono, serif } = useApp();

  const ebitdaMargin = E.totalWR > 0 ? E.ebitdaW / E.totalWR : 0;
  const grossMargin  = E.totalWR > 0 ? (E.gpW + E.specRevW) / E.totalWR : 0;
  const today        = td();
  const openTasks    = data.actions.filter(a => !a.done);
  const critTasks    = openTasks.filter(a => a.priority === "Critical" || a.priority === "High");
  const overdueTasks = openTasks.filter(a => a.due && a.due < today);
  const dueFollowUps = (data.prospects || []).filter(p => p.followUp && p.followUp <= today && p.stage !== "Won" && p.stage !== "Lost");
  const overdueInvoices = (data.invoices || []).filter(i => i.status === "Overdue");
  const overdueInvoiceAmt = overdueInvoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 28, color: "#1A3C34", fontFamily: "'DM Serif Display',Georgia,serif", lineHeight: 1.1 }}>
            {data.S.name || "HuronWest Facility Services"}
          </div>
          <div style={{ fontSize: 13, color: "#7A8B85", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            ["Annual Revenue", fmtF(E.totalWR * 52), T.green],
            ["EBITDA Margin",  pct(ebitdaMargin),     E.ebitdaW >= 0 ? T.accent : T.red],
            ["Active Team",    E.nw + " workers",     T.ts],
          ].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: T.td2, textTransform: "uppercase", letterSpacing: "1.2px" }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c, fontFamily: mono, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Alert banners ───────────────────────────────────────────────────── */}
      {(dueFollowUps.length > 0 || overdueInvoices.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dueFollowUps.length > 0 && (
            <div style={{ background: T.yellow + "18", border: "1px solid " + T.yellow + "55", borderRadius: 4, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onClick={() => nav("crm")} onMouseEnter={e => e.currentTarget.style.cursor = "pointer"}>
              <div>
                <span style={{ fontWeight: 700, color: T.yellow, fontSize: 13 }}>⏰ {dueFollowUps.length} follow-up{dueFollowUps.length > 1 ? "s" : ""} due</span>
                <span style={{ color: T.td2, fontSize: 12, marginLeft: 10 }}>{dueFollowUps.map(p => p.name).join(", ")}</span>
              </div>
              <span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>→ Go to CRM</span>
            </div>
          )}
          {overdueInvoices.length > 0 && (
            <div style={{ background: T.red + "10", border: "1px solid " + T.red + "44", borderRadius: 4, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onClick={() => nav("invoices")} onMouseEnter={e => e.currentTarget.style.cursor = "pointer"}>
              <div>
                <span style={{ fontWeight: 700, color: T.red, fontSize: 13 }}>⚠ {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""}</span>
                <span style={{ color: T.td2, fontSize: 12, marginLeft: 10 }}>{fmtF(overdueInvoiceAmt)} outstanding</span>
              </div>
              <span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>→ Go to Invoices</span>
            </div>
          )}
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <KpiCard
          label="Weekly Revenue"
          value={fmt(E.totalWR)}
          sub={fmtF(E.totalWR * 52) + " annualized"}
          color={T.green}
          icon="↑"
          onClick={() => nav("pnl")}
        />
        <KpiCard
          label="EBITDA / Week"
          value={fmt(E.ebitdaW)}
          sub={pct(ebitdaMargin) + " margin · " + pct(grossMargin) + " gross"}
          color={E.ebitdaW >= 0 ? T.accent : T.red}
          icon={E.ebitdaW >= 0 ? "↗" : "↘"}
          onClick={() => nav("pnl")}
        />
        <KpiCard
          label="Active Contracts"
          value={E.nj}
          sub={E.pipeN + " in pipeline · " + E.prospHot + " hot"}
          color={T.purple}
          icon="◈"
          onClick={() => nav("jobs")}
        />
        <KpiCard
          label="Cash Position"
          value={fmt(E.cash)}
          sub={E.cash >= data.S.reserve ? "Above reserve" : "Below reserve ⚠"}
          color={E.cash >= data.S.reserve ? T.green : T.red}
          icon="⬡"
          onClick={() => nav("bs")}
        />
      </div>

      {/* ── Chart + Pipeline ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 20 }}>

        <div style={{ ...ss.card, marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>12-Month Projection</div>
              <div style={{ fontSize: 13, color: T.td2, marginTop: 3 }}>Revenue vs EBITDA run-rate</div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {[["Revenue", "#3A7D44", "0.12"], ["EBITDA", "#2E7D32", "0.8"]].map(([l, c, o]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.td2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 1, background: c, opacity: +o, display: "inline-block" }} />{l}
                </span>
              ))}
            </div>
          </div>
          <BarChart data={E.proj12} T={T} />
          <div style={{ display: "flex", paddingTop: 16, borderTop: "1px solid " + T.border2, marginTop: 12 }}>
            {[
              ["Yr Revenue",    fmtF(E.totalWR * 52),  T.green],
              ["Yr EBITDA",     fmtF(E.ebitdaW * 52),  E.ebitdaW >= 0 ? T.accent : T.red],
              ["Gross Margin",  pct(grossMargin),        T.ts],
              ["EBITDA Margin", pct(ebitdaMargin),       T.ts],
            ].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: T.td2, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c, marginTop: 3, fontFamily: mono }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...ss.card, marginBottom: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>CRM Pipeline</div>
            <button style={ss.btnG} onClick={() => nav("crm")}
              onMouseEnter={e => { e.currentTarget.style.background = T.mintPale; e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}
            >View all →</button>
          </div>
          <PipelineBar prospects={data.prospects} T={T} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatCell label="Prospects"   value={E.prospTotal}    color={T.accent}  T={T} mono={mono} />
            <StatCell label="Hot"         value={E.prospHot}      color={T.yellow}  T={T} mono={mono} />
            <StatCell label="Won"         value={E.prospWon}      color={T.green}   T={T} mono={mono} />
            <StatCell label="Outreach/Mo" value={E.outreachCount} color={E.outreachCount >= 80 ? T.green : T.yellow} T={T} mono={mono} />
          </div>
          {E.pipeRev > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 4, border: "1px solid " + T.border, background: "#F7FAF8" }}>
              <div style={{ fontSize: 10, color: T.td2, textTransform: "uppercase", letterSpacing: "1.2px" }}>Pipeline Value</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: T.accent, fontFamily: mono, marginTop: 4 }}>
                {fmtF(E.pipeRev)}<span style={{ fontSize: 12, fontWeight: 400, fontFamily: "'Outfit',sans-serif" }}>/wk</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── P&L + Workforce + Tasks ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* Weekly P&L */}
        <div style={{ ...ss.card, marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Weekly P&L</div>
            <button style={ss.btnG} onClick={() => nav("pnl")}
              onMouseEnter={e => { e.currentTarget.style.background = T.mintPale; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >Full view →</button>
          </div>
          {[
            { l: "Revenue",      v: E.totalWR,          c: T.green,  bar: 1.0,  bold: true },
            { l: "− COGS",       v: E.cogsW,            c: T.red,    bar: E.cogsW / (E.totalWR || 1) },
            { l: "Gross Profit", v: E.gpW + E.specRevW, c: T.accent, bar: (E.gpW + E.specRevW) / (E.totalWR || 1), bold: true },
            { l: "− SG&A",       v: E.sgaW,             c: T.yellow, bar: E.sgaW / (E.totalWR || 1) },
            { l: "EBITDA",       v: E.ebitdaW,          c: E.ebitdaW >= 0 ? T.green : T.red, bar: Math.abs(E.ebitdaW) / (E.totalWR || 1), bold: true },
            { l: "NOPAT",        v: E.nopatW,           c: T.accent, bar: Math.abs(E.nopatW) / (E.totalWR || 1), bold: true },
          ].map(({ l, v, c, bar, bold }) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: bold ? T.text : T.ts, fontWeight: bold ? 600 : 400 }}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: bold ? 600 : 500, color: c, fontFamily: mono }}>{fmtF(Math.abs(v))}</span>
              </div>
              <div style={{ height: bold ? 5 : 3, background: T.border2, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: (Math.min(bar, 1) * 100) + "%", background: c, borderRadius: 3, opacity: bold ? 1 : .5, transition: "width .5s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Workforce */}
        <div style={{ ...ss.card, marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Workforce</div>
            <button style={ss.btnG} onClick={() => nav("labor")}
              onMouseEnter={e => { e.currentTarget.style.background = T.mintPale; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >Manage →</button>
          </div>
          <UtilRing util={E.util} T={T} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
            <StatCell label="Workers"  value={E.nw}                            color={T.accent} T={T} mono={mono} />
            <StatCell label="Hrs/Wk"   value={E.mhW.toFixed(0) + "h"}          color={T.ts}     T={T} mono={mono} />
            <StatCell label="Capacity" value={E.lCap + "h"}                    color={T.ts}     T={T} mono={mono} />
            <StatCell label="Spare"    value={(E.lCap - E.mhW).toFixed(0)+"h"} color={E.lCap - E.mhW > 10 ? T.green : T.red} T={T} mono={mono} />
          </div>
          {E.util > .85 && (
            <div style={{ marginTop: 14, padding: "8px 14px", background: "#FFEBEE", border: "1px solid rgba(198,40,40,0.2)", borderRadius: 4, fontSize: 12, color: T.red }}>
              Near capacity — consider hiring
            </div>
          )}
        </div>

        {/* Tasks */}
        <div style={{ ...ss.card, marginBottom: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Open Tasks</div>
            <button style={ss.btnG} onClick={() => nav("actions")}
              onMouseEnter={e => { e.currentTarget.style.background = T.mintPale; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >All →</button>
          </div>

          {/* Summary badges */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              ["Critical", openTasks.filter(a => a.priority === "Critical").length, T.red, "#FFEBEE"],
              ["High",     openTasks.filter(a => a.priority === "High").length,     T.yellow, "#FFF9C4"],
              ["Overdue",  overdueTasks.length,                                     T.red, "#FFEBEE"],
            ].map(([l, n, c, bg]) =>
              n > 0 ? (
                <div key={l} style={{ padding: "3px 10px", background: bg, border: "1px solid " + c + "30", borderRadius: 12, fontSize: 11, fontWeight: 600, color: c, textTransform: "uppercase", letterSpacing: "0.5px" }}>{n} {l}</div>
              ) : null
            )}
            {critTasks.length === 0 && overdueTasks.length === 0 && (
              <div style={{ padding: "3px 10px", background: "#E8F5E9", border: "1px solid rgba(46,125,50,0.2)", borderRadius: 12, fontSize: 11, fontWeight: 600, color: T.green, textTransform: "uppercase", letterSpacing: "0.5px" }}>All clear</div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", maxHeight: 220 }}>
            {critTasks.slice(0, 7).map(a => (
              <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid " + T.border2, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 2, minHeight: 32, borderRadius: 2, background: a.priority === "Critical" ? T.red : T.yellow, flexShrink: 0, marginTop: 2, alignSelf: "stretch" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: T.td2, marginTop: 3 }}>{a.assignee}{a.due ? " · due " + a.due : ""}</div>
                </div>
              </div>
            ))}
            {critTasks.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8, color: T.border2 }}>✓</div>
                <div style={{ fontSize: 14, color: T.td2, fontFamily: "'DM Serif Display',serif" }}>No critical tasks</div>
                <div style={{ fontSize: 12, color: T.td2, marginTop: 4 }}>You're all caught up</div>
              </div>
            )}
          </div>
          {openTasks.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: T.td2, textAlign: "center" }}>{openTasks.length} total open</div>
          )}
        </div>
      </div>

      {/* ── Activity + Equity ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>

        <div style={{ ...ss.card, marginBottom: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 20 }}>Recent Activity</div>
          {(data.activityLog || []).length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div style={{ fontSize: 40, color: T.border, marginBottom: 12 }}>◎</div>
              <div style={{ fontSize: 16, color: T.ts, fontFamily: "'DM Serif Display',serif" }}>No activity yet</div>
              <div style={{ fontSize: 13, color: T.td2, marginTop: 6 }}>Changes you and your team make will appear here</div>
            </div>
          )}
          {(data.activityLog || []).slice(0, 6).map((a, i) => (
            <div key={a.id || i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid " + T.border2, alignItems: "flex-start", transition: "background .15s" }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: T.mintPale, border: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: T.accent, flexShrink: 0 }}>
                {(a.user || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: T.text }}>{a.user}</span>
                  <span style={{ color: T.ts }}> {a.action}</span>
                  {a.detail && <span style={{ color: T.td2 }}>: {a.detail}</span>}
                </div>
                <div style={{ fontSize: 11, color: T.td2, marginTop: 2 }}>
                  {new Date(a.ts).toLocaleDateString()} · {new Date(a.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...ss.card, marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Equity Snapshot</div>
            <button style={ss.btnG} onClick={() => nav("eq")}
              onMouseEnter={e => { e.currentTarget.style.background = T.mintPale; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >Full →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            <StatCell label="MOIC"        value={E.cap > 0 ? (E.nopatW * 52 / E.cap).toFixed(1) + "x" : "0x"} color={T.accent} T={T} mono={mono} />
            <StatCell label="Payback"     value={E.nopatW > 0 ? Math.round(E.cap / (E.nopatW * 52) * 12) + " mo" : "—"}          color={T.ts}     T={T} mono={mono} />
            <StatCell label="HWE Equity"  value={pct(data.S.hweEq)}                                             color={T.accent} T={T} mono={mono} />
            <StatCell label="Nico Vested" value={pct(E.vestedPct)}                                              color={T.purple} T={T} mono={mono} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Annual Distribution</div>
          {[
            ["Loan Repay", E.loanRepay,    T.yellow],
            ["Tax Dist",   E.taxDist,      T.td2],
            ["Pref 7%",    E.prefReturn,   T.accent],
            ["HWE",        E.hweResidual,  T.green],
            ["Nico",       E.nicoResidual, T.purple],
          ].map(([l, v, c]) => {
            const total = (E.loanRepay + E.taxDist + E.prefReturn + E.hweResidual + E.nicoResidual) || 1;
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: T.ts, width: 68, flexShrink: 0 }}>{l}</div>
                <div style={{ flex: 1, height: 5, background: T.border2, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (v / total * 100) + "%", background: c, borderRadius: 3, transition: "width .5s ease" }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: c, width: 55, textAlign: "right", fontFamily: mono }}>{fmtF(v)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
