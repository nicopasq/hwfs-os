import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { F, Badge } from '../components/ui';
import { SK } from '../constants';

const STATUS_FLOW = ["Draft", "Sent", "Overdue", "Paid", "Void"];

function statusColor(T, status) {
  if (status === "Paid")    return T.green;
  if (status === "Overdue") return T.red;
  if (status === "Sent")    return T.purple;
  if (status === "Void")    return T.td2;
  return T.ts; // Draft
}

const DF = { number: "", client: "", property: "", amount: "", issueDate: td(), dueDate: "", status: "Draft", notes: "" };

export default function InvoicesTab({ data, setData }) {
  const { T, ss, mono } = useApp();
  const [f, setF] = useState(DF);
  const invoices = data.invoices || [];
  const today = td();

  const save = nd => {
    try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
  };

  // Auto-flag overdue on load
  const checkOverdue = (inv) =>
    inv.map(i => i.status === "Sent" && i.dueDate && i.dueDate < today ? { ...i, status: "Overdue" } : i);

  const addInvoice = () => {
    if (!f.number || !f.client || !f.amount) return;
    setData(prev => {
      const nd = { ...prev, invoices: [...checkOverdue(prev.invoices || []), { ...f, id: uid(), amount: parseFloat(f.amount) || 0 }] };
      save(nd);
      return nd;
    });
    setF({ ...DF, number: autoNextNumber(invoices) });
  };

  const updInv = (id, k, v) => {
    setData(prev => {
      const nd = { ...prev, invoices: checkOverdue(prev.invoices || []).map(i => i.id === id ? { ...i, [k]: v } : i) };
      save(nd);
      return nd;
    });
  };

  const markStatus = (id, status) => {
    setData(prev => {
      const now = new Date().toISOString();
      const nd = {
        ...prev,
        invoices: (prev.invoices || []).map(i => i.id === id ? { ...i, status, paidAt: status === "Paid" ? now : i.paidAt } : i),
        activityLog: [{ id: uid(), ts: now, user: prev.userId, action: "Invoice " + status.toLowerCase(), detail: "Invoice #" + ((prev.invoices || []).find(i => i.id === id)?.number || "") }, ...(prev.activityLog || []).slice(0, 99)],
      };
      save(nd);
      return nd;
    });
  };

  const rmInvoice = id => {
    setData(prev => {
      const nd = { ...prev, invoices: (prev.invoices || []).filter(i => i.id !== id) };
      save(nd);
      return nd;
    });
  };

  function autoNextNumber(existing) {
    const nums = existing.map(i => parseInt((i.number || "").replace(/\D/g, "")) || 0);
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return "HW-" + String(next).padStart(4, "0");
  }

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalOut   = invoices.filter(i => i.status === "Sent" || i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const totalPaid  = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const overdueList = invoices.filter(i => i.status === "Overdue");

  return (
    <>
      {/* ── Overdue alert banner ─────────────────────────────────────────── */}
      {overdueList.length > 0 && (
        <div style={{ background: T.red + "12", border: "1px solid " + T.red + "44", borderRadius: 4, padding: "14px 18px", marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
            ⚠ {overdueList.length} Overdue Invoice{overdueList.length > 1 ? "s" : ""} — {fmtF(totalOverdue)} outstanding
          </div>
          {overdueList.map(i => (
            <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
              <span style={{ fontSize: 13, color: T.text }}>
                <strong>#{i.number}</strong> · {i.client} · Due {i.dueDate}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontFamily: mono, fontWeight: 700, color: T.red, fontSize: 13 }}>{fmtF(i.amount)}</span>
                <button style={{ ...ss.btn, padding: "4px 12px", fontSize: 11, background: T.green }} onClick={() => markStatus(i.id, "Paid")}>Mark Paid</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI summary ──────────────────────────────────────────────────── */}
      <div style={ss.g4}>
        {[
          ["Outstanding", fmtF(totalOut),     T.purple,  invoices.filter(i => i.status === "Sent" || i.status === "Overdue").length + " invoices"],
          ["Overdue",     fmtF(totalOverdue),  T.red,     overdueList.length + " invoices"],
          ["Paid (All)",  fmtF(totalPaid),     T.green,   invoices.filter(i => i.status === "Paid").length + " invoices"],
          ["Total Billed", fmtF(invoices.reduce((s, i) => s + i.amount, 0)), T.accent, invoices.length + " total"],
        ].map(([l, v, c, sub]) => (
          <div key={l} style={{ ...ss.card, textAlign: "center", borderLeft: "3px solid " + c }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div>
            <div style={{ fontSize: 9, color: T.td2, textTransform: "uppercase", marginTop: 3, letterSpacing: "1px" }}>{l}</div>
            <div style={{ fontSize: 11, color: T.td2, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── New invoice form ──────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>+ New Invoice</span></div>
        <div style={ss.g4}>
          <F l="Invoice #"><input style={ss.inp} value={f.number} placeholder={autoNextNumber(invoices)} onChange={e => setF({ ...f, number: e.target.value })} /></F>
          <F l="Client"><input style={ss.inp} value={f.client} onChange={e => setF({ ...f, client: e.target.value })} /></F>
          <F l="Property / Service"><input style={ss.inp} value={f.property} onChange={e => setF({ ...f, property: e.target.value })} /></F>
          <F l="Amount ($)"><input type="number" style={ss.inp} value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></F>
        </div>
        <div style={ss.g4}>
          <F l="Issue Date"><input type="date" style={ss.inp} value={f.issueDate} onChange={e => setF({ ...f, issueDate: e.target.value })} /></F>
          <F l="Due Date"><input type="date" style={ss.inp} value={f.dueDate} onChange={e => setF({ ...f, dueDate: e.target.value })} /></F>
          <F l="Status">
            <select style={ss.sel} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
              {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button style={{ ...ss.btn, width: "100%" }} onClick={addInvoice}>+ Add Invoice</button>
          </div>
        </div>
      </div>

      {/* ── Invoice table ────────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>All Invoices ({invoices.length})</span></div>
        {invoices.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🧾</div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: T.text, marginBottom: 4 }}>No invoices yet</div>
            <div style={{ fontSize: 13, color: T.td2 }}>Add your first invoice above or send one from a document.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={ss.tbl}>
              <thead>
                <tr>
                  {["Invoice #", "Client", "Property", "Amount", "Issued", "Due", "Status", ""].map((h, i) =>
                    <th key={i} style={i === 3 ? ss.thR : ss.th}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoices.slice().sort((a, b) => b.issueDate?.localeCompare(a.issueDate)).map(inv => {
                  const c = statusColor(T, inv.status);
                  const isOverdue = inv.status === "Overdue";
                  return (
                    <tr key={inv.id}
                      style={{ background: isOverdue ? T.red + "06" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.mintPale}
                      onMouseLeave={e => e.currentTarget.style.background = isOverdue ? T.red + "06" : "transparent"}>
                      <td style={{ ...ss.td, fontWeight: 700, fontFamily: mono, fontSize: 12 }}>{inv.number}</td>
                      <td style={{ ...ss.td, fontWeight: 600 }}>{inv.client}</td>
                      <td style={ss.td}>{inv.property}</td>
                      <td style={{ ...ss.tdR, fontWeight: 700, color: c }}>{fmtF(inv.amount)}</td>
                      <td style={{ ...ss.td, fontSize: 12, color: T.td2 }}>{inv.issueDate}</td>
                      <td style={{ ...ss.td, fontSize: 12, color: isOverdue ? T.red : T.td2, fontWeight: isOverdue ? 700 : 400 }}>
                        {inv.dueDate || "—"}
                      </td>
                      <td style={ss.td}>
                        <select
                          style={{ ...ss.sel, padding: "3px 6px", fontSize: 11, color: c, borderColor: c + "44" }}
                          value={inv.status}
                          onChange={e => markStatus(inv.id, e.target.value)}
                        >
                          {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={ss.td}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {inv.status !== "Paid" && inv.status !== "Void" && (
                            <button style={{ ...ss.btn, padding: "4px 10px", fontSize: 11, background: T.green }}
                              onClick={() => markStatus(inv.id, "Paid")}>✓ Paid</button>
                          )}
                          <button style={ss.btnD} onClick={() => rmInvoice(inv.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
