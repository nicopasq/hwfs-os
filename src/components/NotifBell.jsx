import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';

export default function NotifBell({ notifs }) {
  const { T, ss } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasRed = notifs.some(n => n.type === "red");

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18, position: "relative", padding: "2px 6px", color: hasRed ? T.red : notifs.length > 0 ? T.yellow : T.td2 }}
      >
        🔔
        {notifs.length > 0 && (
          <span style={{ position: "absolute", top: -2, right: 0, background: hasRed ? T.red : T.yellow, color: "#fff", borderRadius: 8, fontSize: 9, fontWeight: 800, padding: "1px 5px", fontFamily: "'IBM Plex Sans',sans-serif" }}>
            {notifs.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: T.card, border: "1px solid " + T.border, borderRadius: 6, padding: 8, minWidth: 280, zIndex: 9999, boxShadow: "0 8px 24px #00000040" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.ts, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Notifications</div>
          {notifs.length === 0 && <div style={{ fontSize: 12, color: T.td2, padding: 8 }}>All clear ✔</div>}
          {notifs.map((n, i) => (
            <div key={i} style={{ padding: "6px 8px", borderBottom: "1px solid " + T.border, fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: n.type === "red" ? T.red : T.yellow, fontSize: 14 }}>{n.type === "red" ? "⚠" : "●"}</span>
              <span style={{ color: T.text }}>{n.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
