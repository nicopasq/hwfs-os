/**
 * Shared UI micro-components — HuronWest design system.
 * All read T/ss/font from AppContext via useApp().
 */
import { useApp } from '../context';
import { fmtF }   from '../utils';

// ── Toggle switch ─────────────────────────────────────────────────────────────
export function Tog({ v, onChange }) {
  const { T } = useApp();
  return (
    <button
      role="switch"
      aria-checked={v}
      style={{ width: 40, height: 22, borderRadius: 11, background: v ? T.accent : T.inpB, cursor: "pointer", position: "relative", transition: "background .2s", display: "inline-flex", alignItems: "center", border: "none", flexShrink: 0 }}
      onClick={() => onChange(!v)}
    >
      <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", position: "absolute", left: v ? 21 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

// ── Labelled form field wrapper ───────────────────────────────────────────────
export function F({ l, required, children }) {
  const { T, font } = useApp();
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: T.ts, fontWeight: 600, marginBottom: 5, display: "block", fontFamily: font }}>
        {l}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Status badge / pill ───────────────────────────────────────────────────────
// Use semantic color helpers for known statuses, or pass a raw color
const STATUS_COLORS = {
  active:    { bg: "#E8F5E9", text: "#2E7D32" },
  complete:  { bg: "#E8F5E9", text: "#2E7D32" },
  won:       { bg: "#E8F5E9", text: "#2E7D32" },
  scheduled: { bg: "#E8F5EC", text: "#1A3C34" },
  pending:   { bg: "#E8F5EC", text: "#1A3C34" },
  draft:     { bg: "#E2E8E4", text: "#5A6B64" },
  inprogress:{ bg: "#E3F2FD", text: "#1565C0" },
  overdue:   { bg: "#FFEBEE", text: "#C62828" },
  cancelled: { bg: "#FFEBEE", text: "#C62828" },
  low:       { bg: "#FFF9C4", text: "#F57F17" },
  warning:   { bg: "#FFF9C4", text: "#F57F17" },
};

export function Badge({ children, c, status }) {
  const { T } = useApp();
  const key = status?.toLowerCase().replace(/\s+/g, "");
  const semantic = STATUS_COLORS[key];
  const bg   = semantic ? semantic.bg   : (c ? c + "18" : T.accent + "18");
  const text = semantic ? semantic.text : (c || T.accent);
  return (
    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: bg, color: text, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Outfit',sans-serif" }}>
      {children}
    </span>
  );
}

// ── KPI metric card ───────────────────────────────────────────────────────────
export function M({ l, v, c, sub, onClick }) {
  const { T, ss, mono } = useApp();
  return (
    <div
      style={{ ...ss.card, textAlign: "center", cursor: onClick ? "pointer" : "default", transition: "box-shadow .2s, transform .2s" }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = T.shadowHover || "none"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = T.shadow || "none"; e.currentTarget.style.transform = "none"; }}}
    >
      {/* Optional icon circle */}
      <div style={{ width: 40, height: 40, borderRadius: 20, background: (c || T.accent) + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: c || T.accent, fontSize: 18 }}>◈</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: c || T.text, fontVariantNumeric: "tabular-nums", fontFamily: mono, lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: 11, color: T.td2, textTransform: "uppercase", marginTop: 6, letterSpacing: "1px" }}>{l}</div>
      {sub && <div style={{ fontSize: 12, color: T.ts, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ── Table row helpers (returned from a hook so they close over T/ss/nav) ──────
/**
 * PR  — P&L row:   PR(label, weeklyValue, options)
 * Sep — separator: Sep(label)
 * BR  — BS row:    BR(label, [v0,v1,v2,v3], options)
 *
 * options: { b: bold, i: indent, hl: row bg, lk: tab to nav on click, c: colour }
 */
export function useTableRows() {
  const { T, ss, nav, mono } = useApp();

  const PR = (l, v, o = {}) => (
    <tr
      style={{ background: o.hl || "transparent", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = T.mintPale || T.bg2}
      onMouseLeave={e => e.currentTarget.style.background = o.hl || "transparent"}
    >
      <td
        style={{ ...ss.td, fontWeight: o.b ? 700 : 400, paddingLeft: o.i ? 32 : 16, cursor: o.lk ? "pointer" : "default", color: o.lk ? T.accent : o.c || T.ts }}
        onClick={o.lk ? () => nav(o.lk) : undefined}
      >
        {o.lk ? "→ " : ""}{l}
      </td>
      <td style={{ ...ss.tdR, fontWeight: o.b ? 700 : 400, color: o.c || T.ts }}>{fmtF(v)}</td>
      <td style={{ ...ss.tdR, color: o.c || T.ts }}>{fmtF(v * 4.33)}</td>
      <td style={{ ...ss.tdR, fontWeight: o.b ? 700 : 400, color: o.c || T.ts }}>{fmtF(v * 52)}</td>
    </tr>
  );

  const Sep = (l) => (
    <tr>
      <td colSpan={4} style={{ ...ss.td, fontSize: 10, color: T.td2, fontWeight: 700, paddingTop: 16, paddingBottom: 4, textTransform: "uppercase", letterSpacing: "1.2px", background: T.bg2, borderBottom: "1px solid " + T.border }}>
        {l}
      </td>
    </tr>
  );

  const BR = (l, vs, o = {}) => (
    <tr
      style={{ background: o.hl || "transparent", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = T.mintPale || T.bg2}
      onMouseLeave={e => e.currentTarget.style.background = o.hl || "transparent"}
    >
      <td style={{ ...ss.td, fontWeight: o.b ? 700 : 400, paddingLeft: o.i ? 32 : 16, color: o.c || T.ts }}>{l}</td>
      {vs.map((v, idx) => (
        <td key={idx} style={{ ...ss.tdR, fontWeight: o.b ? 700 : 400, color: o.c || T.ts }}>{fmtF(v)}</td>
      ))}
    </tr>
  );

  return { PR, Sep, BR };
}
