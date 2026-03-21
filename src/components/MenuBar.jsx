import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';

export default function MenuBar({ doExport, doImport, doPDF, doDigest }) {
  const { T, font } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { l: "Export Backup (.json)", fn: doExport },
    { l: "Import Backup (.json)", fn: doImport },
    { l: "---" },
    { l: "Print / Save as PDF",   fn: doPDF },
    { l: "---" },
    { l: "Weekly Digest",         fn: doDigest },
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ padding: "5px 14px", background: open ? "rgba(168,213,186,0.15)" : "transparent", border: "1px solid rgba(255,255,255,0.18)", color: open ? "#A8D5BA" : "rgba(255,255,255,0.65)", fontFamily: font, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 4, transition: "all .15s" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        File {open ? "▴" : "▾"}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", border: "1px solid #D5E5DC", borderRadius: 4, padding: "4px 0", minWidth: 220, zIndex: 9999, boxShadow: "0 8px 24px rgba(26,60,52,0.15)" }}>
          {items.map((item, i) =>
            item.l === "---"
              ? <div key={i} style={{ borderTop: "1px solid #E8EFE9", margin: "4px 0" }} />
              : <button
                  key={i}
                  onMouseDown={() => { item.fn(); setOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "9px 16px", background: "transparent", border: "none", color: "#3E4A47", fontFamily: font, fontSize: 13, cursor: "pointer", textAlign: "left", transition: "background .12s" }}
                  onMouseEnter={e => e.target.style.background = "#E8F5EC"}
                  onMouseLeave={e => e.target.style.background = "transparent"}
                >
                  {item.l}
                </button>
          )}
        </div>
      )}
    </div>
  );
}
