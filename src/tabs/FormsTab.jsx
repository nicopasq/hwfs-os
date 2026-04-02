import { useState, useMemo } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { SK } from '../constants';

// ── Form type definitions with field mappings ────────────────────────────────
const FORM_TYPES = [
  { key: "msa",        label: "Master Service Agreement", icon: "📋", desc: "Full contract between HuronWest and client" },
  { key: "sow",        label: "Scope of Work",            icon: "📝", desc: "Detailed area-by-area service scope" },
  { key: "invoice",    label: "Invoice",                  icon: "🧾", desc: "Billing document for services rendered" },
  { key: "bid",        label: "Bid Sheet",                icon: "📊", desc: "Service proposal with pricing" },
  { key: "completion", label: "Job Completion Report",     icon: "✅", desc: "Post-service sign-off document" },
];

const STATUS_COLORS = { draft: "yellow", complete: "green", sent: "purple" };

// ── Render a professional form document ──────────────────────────────────────
function FormDocument({ form, job, T, mono, onUpdate }) {
  if (!job) return <div style={{ padding: 40, textAlign: "center", color: T.td2 }}>Contract not found — it may have been deleted.</div>;

  const monthlyRate = (+job.wkRate || 0) * 4.33;
  const annualRate  = (+job.wkRate || 0) * 52;
  const sow = job.scopeOfWork || [];
  const today = td();
  const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3× per week", "2x_week": "2× per week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";

  const HS = { fontFamily: "'DM Serif Display',Georgia,serif", color: "#1A3C34" };
  const SEC = { fontSize: 11, fontWeight: 700, color: "#3A7D44", textTransform: "uppercase", letterSpacing: "2px", borderBottom: "2px solid #A8D5BA", paddingBottom: 6, marginBottom: 16, marginTop: 28 };
  const ROW = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E8EFE9", fontSize: 13 };
  const LBL = { color: "#7A8B85", fontWeight: 500 };
  const VAL = { fontWeight: 600, color: "#1A3C34", fontFamily: mono };

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, borderBottom: "3px solid #3A7D44", marginBottom: 24 }}>
      <div>
        <div style={{ ...HS, fontSize: 24, lineHeight: 1.2 }}>HuronWest</div>
        <div style={{ fontSize: 11, color: "#5B8C7E", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Facility Services LLC</div>
        <div style={{ fontSize: 11, color: "#7A8B85", marginTop: 8, lineHeight: 1.6 }}>
          Ann Arbor, Michigan<br/>
          huronwestfs.com
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10, color: "#7A8B85", textTransform: "uppercase", letterSpacing: "1.5px" }}>Document</div>
        <div style={{ ...HS, fontSize: 16, marginTop: 4 }}>{FORM_TYPES.find(f => f.key === form.formType)?.label}</div>
        <div style={{ fontSize: 11, color: "#5B8C7E", marginTop: 4, fontFamily: mono }}>#{form.id.slice(0, 8).toUpperCase()}</div>
        <div style={{ fontSize: 11, color: "#7A8B85", marginTop: 4 }}>Date: {form.createdAt || today}</div>
      </div>
    </div>
  );

  const clientSection = (
    <>
      <div style={SEC}>Client Information</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
        <div>
          <div style={ROW}><span style={LBL}>Client</span><span style={VAL}>{job.client || "—"}</span></div>
          <div style={ROW}><span style={LBL}>Property</span><span style={VAL}>{job.name || "—"}</span></div>
        </div>
        <div>
          <div style={ROW}><span style={LBL}>Square Footage</span><span style={VAL}>{job.sf ? (+job.sf).toLocaleString() + " SF" : "—"}</span></div>
          <div style={ROW}><span style={LBL}>Service Tier</span><span style={VAL}>{job.tier || "Basic"}</span></div>
        </div>
      </div>
    </>
  );

  const pricingSection = (
    <>
      <div style={SEC}>Pricing</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {[["Weekly Rate", fmtF(job.wkRate)], ["Monthly Rate", fmtF(monthlyRate)], ["Annual Rate", fmtF(annualRate)]].map(([l, v]) => (
          <div key={l} style={{ textAlign: "center", padding: "16px 12px", border: "1px solid #D5E5DC" }}>
            <div style={{ fontSize: 10, color: "#7A8B85", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#3A7D44", fontFamily: mono }}>{v}</div>
          </div>
        ))}
      </div>
      {job.sf > 0 && (
        <div style={{ ...ROW, marginTop: 8 }}>
          <span style={LBL}>Rate per SF / Year</span>
          <span style={VAL}>${(annualRate / job.sf).toFixed(2)}</span>
        </div>
      )}
    </>
  );

  const scheduleSection = (
    <>
      <div style={SEC}>Service Schedule</div>
      <div style={ROW}><span style={LBL}>Frequency</span><span style={VAL}>{schedLabel}</span></div>
      <div style={ROW}><span style={LBL}>Service Time</span><span style={VAL}>{job.serviceTime || "18:00"}</span></div>
      <div style={ROW}><span style={LBL}>Start Date</span><span style={VAL}>{job.start || "—"}</span></div>
    </>
  );

  const sowSection = sow.length > 0 ? (
    <>
      <div style={SEC}>Scope of Work</div>
      {sow.map((area, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A3C34", padding: "8px 12px", background: "#E8F5EC", borderRadius: 4, marginBottom: 6 }}>
            {area.area || "Area " + (i + 1)}
          </div>
          {(area.tasks || []).filter(t => t.trim()).map((task, ti) => (
            <div key={ti} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 12px 6px 24px", fontSize: 13, color: "#3E4A47" }}>
              <span style={{ color: "#A8D5BA", fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{task}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  ) : null;

  const notesSection = (
    <>
      <div style={SEC}>Notes</div>
      <textarea
        style={{ width: "100%", minHeight: 80, padding: 12, border: "1px solid #D5E5DC", borderRadius: 4, fontSize: 13, fontFamily: "'Outfit',sans-serif", color: "#1A3C34", background: "#F7FAF8", resize: "vertical", outline: "none", boxSizing: "border-box" }}
        value={form.notes || ""}
        onChange={e => onUpdate({ notes: e.target.value })}
        placeholder="Add notes, terms, or additional details..."
      />
    </>
  );

  const signatureSection = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 40, paddingTop: 20, borderTop: "1px solid #D5E5DC" }}>
      {["HuronWest Facility Services", job.client || "Client"].map(party => (
        <div key={party}>
          <div style={{ fontSize: 12, color: "#7A8B85", marginBottom: 40 }}>Authorized Representative — {party}</div>
          <div style={{ borderBottom: "1px solid #1A3C34", marginBottom: 6 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A8B85" }}>
            <span>Signature</span><span>Date</span>
          </div>
        </div>
      ))}
    </div>
  );

  const footer = (
    <div style={{ marginTop: 40, paddingTop: 12, borderTop: "1px solid #E8EFE9", textAlign: "center", fontSize: 10, color: "#A8D5BA", letterSpacing: "1px" }}>
      CONFIDENTIAL — HuronWest Facility Services LLC — {new Date().getFullYear()}
    </div>
  );

  // ── Form-type-specific rendering ───────────────────────────────────────────
  if (form.formType === "msa") return <div>{header}{clientSection}{scheduleSection}{pricingSection}{sowSection}{notesSection}{signatureSection}{footer}</div>;
  if (form.formType === "sow") return <div>{header}{clientSection}{scheduleSection}{sowSection}{notesSection}{footer}</div>;
  if (form.formType === "invoice") {
    const invoiceNum = "INV-" + (form.createdAt || today).replace(/-/g, "") + "-" + form.id.slice(0, 4).toUpperCase();
    return (
      <div>
        {header}
        <div style={SEC}>Bill To</div>
        <div style={ROW}><span style={LBL}>Client</span><span style={VAL}>{job.client || "—"}</span></div>
        <div style={ROW}><span style={LBL}>Property</span><span style={VAL}>{job.name || "—"}</span></div>
        <div style={{ ...SEC, marginTop: 24 }}>Invoice Details</div>
        <div style={ROW}><span style={LBL}>Invoice #</span><span style={VAL}>{invoiceNum}</span></div>
        <div style={ROW}><span style={LBL}>Date</span><span style={VAL}>{form.createdAt || today}</span></div>
        <div style={ROW}><span style={LBL}>Due Date</span><span style={VAL}>{form.dueDate || "Net 30"}</span></div>
        <div style={{ ...SEC, marginTop: 24 }}>Line Items</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#E8F5EC" }}>
              {["Description", "Schedule", "Rate", "Amount"].map((h, i) => (
                <th key={i} style={{ padding: "10px 12px", textAlign: i >= 2 ? "right" : "left", fontSize: 10, fontWeight: 700, color: "#3A7D44", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px", borderBottom: "1px solid #E8EFE9", fontWeight: 600 }}>Janitorial Services — {job.name}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #E8EFE9" }}>{schedLabel}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #E8EFE9", textAlign: "right", fontFamily: mono }}>{fmtF(job.wkRate)}/wk</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #E8EFE9", textAlign: "right", fontFamily: mono, fontWeight: 700 }}>{fmtF(monthlyRate)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <div style={{ width: 220 }}>
            <div style={{ ...ROW, fontWeight: 700 }}><span>Total Due</span><span style={{ fontSize: 18, color: "#3A7D44", fontFamily: mono }}>{fmtF(monthlyRate)}</span></div>
          </div>
        </div>
        {notesSection}
        {footer}
      </div>
    );
  }
  if (form.formType === "bid") return (
    <div>
      {header}
      <div style={{ background: "#E8F5EC", borderRadius: 6, padding: "16px 20px", marginBottom: 16, border: "1px solid #A8D5BA" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#3A7D44" }}>Service Proposal</div>
        <div style={{ fontSize: 12, color: "#5B8C7E", marginTop: 4 }}>Prepared for {job.client || "Client"} — Valid for 30 days from {form.createdAt || today}</div>
      </div>
      {clientSection}
      {pricingSection}
      {scheduleSection}
      {sowSection}
      {notesSection}
      {signatureSection}
      {footer}
    </div>
  );
  if (form.formType === "completion") return (
    <div>
      {header}
      {clientSection}
      <div style={SEC}>Service Completion</div>
      <div style={ROW}><span style={LBL}>Completion Date</span>
        <input type="date" value={form.completionDate || today} onChange={e => onUpdate({ completionDate: e.target.value })}
          style={{ border: "1px solid #D5E5DC", borderRadius: 4, padding: "4px 8px", fontSize: 13, fontFamily: mono, color: "#1A3C34" }} />
      </div>
      <div style={ROW}><span style={LBL}>Crew Lead</span><span style={VAL}>{job.crewLead || "—"}</span></div>
      {sow.length > 0 && (
        <>
          <div style={SEC}>Scope Checklist</div>
          {sow.map((area, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A3C34", marginBottom: 4 }}>{area.area}</div>
              {(area.tasks || []).filter(t => t.trim()).map((task, ti) => (
                <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 4px 16px", fontSize: 13 }}>
                  <span style={{ width: 14, height: 14, border: "1.5px solid #3A7D44", borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ color: "#3E4A47" }}>{task}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
      {notesSection}
      {signatureSection}
      {footer}
    </div>
  );

  return <div>{header}<div style={{ color: T.td2, padding: 40, textAlign: "center" }}>Unknown form type</div>{footer}</div>;
}

// ═════════════════════════════════════════════════════════════════════════════
export default function FormsTab({ data, upd, setData }) {
  const { T, ss, mono, font } = useApp();
  const [view, setView] = useState("list"); // "list" | "new" | formId
  const [newType, setNewType] = useState("msa");
  const [newContract, setNewContract] = useState("");

  const forms = data.formDrafts || [];
  const jobs  = data.jobs || [];

  const save = nd => { try { localStorage.setItem(SK, JSON.stringify(nd)); } catch(e) { console.warn(e); } };

  const createForm = () => {
    if (!newContract) return;
    const form = {
      id: uid(),
      contractId: newContract,
      formType: newType,
      status: "draft",
      notes: "",
      createdAt: td(),
      updatedAt: td(),
    };
    upd("formDrafts", [...forms, form]);
    setView(form.id);
  };

  const updateForm = (id, patch) => {
    upd("formDrafts", forms.map(f => f.id === id ? { ...f, ...patch, updatedAt: td() } : f));
  };

  const deleteForm = (id) => {
    upd("formDrafts", forms.filter(f => f.id !== id));
    if (view === id) setView("list");
  };

  const setStatus = (id, status) => {
    updateForm(id, { status });
  };

  const printForm = (formId) => {
    const form = forms.find(f => f.id === formId);
    const job = jobs.find(j => j.id === form?.contractId);
    if (!form || !job) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const ft = FORM_TYPES.find(f => f.key === form.formType);
    const monthlyRate = (+job.wkRate || 0) * 4.33;
    const annualRate  = (+job.wkRate || 0) * 52;
    const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3× per week", "2x_week": "2× per week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";
    const sow = (job.scopeOfWork || []).filter(a => a.area?.trim());

    const sowHtml = sow.length > 0 ? sow.map(a =>
      `<div style="margin-bottom:14px"><div style="font-size:14px;font-weight:700;color:#1A3C34;padding:8px 12px;background:#E8F5EC;border-radius:4px;margin-bottom:4px">${a.area}</div>${(a.tasks||[]).filter(t=>t.trim()).map(t=>`<div style="padding:5px 12px 5px 24px;font-size:13px;color:#3E4A47"><span style="color:#A8D5BA;font-weight:700">•</span> ${t}</div>`).join("")}</div>`
    ).join("") : "<p style='color:#7A8B85'>No scope of work defined.</p>";

    w.document.write(`<!DOCTYPE html><html><head><title>${ft?.label} — ${job.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;font-size:13px;color:#1A3C34;padding:48px 56px;max-width:900px;margin:0 auto;line-height:1.6}
.sec{font-size:11px;font-weight:700;color:#3A7D44;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #A8D5BA;padding-bottom:6px;margin:28px 0 16px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E8EFE9}.lbl{color:#7A8B85;font-weight:500}.val{font-weight:600;font-family:'JetBrains Mono',monospace}
@media print{body{padding:24px}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #3A7D44;margin-bottom:24px">
<div><div style="font-family:'DM Serif Display',serif;font-size:24px;color:#1A3C34">HuronWest</div><div style="font-size:11px;color:#5B8C7E;font-weight:600;letter-spacing:2px;text-transform:uppercase">Facility Services LLC</div><div style="font-size:11px;color:#7A8B85;margin-top:8px;line-height:1.6">Ann Arbor, Michigan<br/>huronwestfs.com</div></div>
<div style="text-align:right"><div style="font-size:10px;color:#7A8B85;text-transform:uppercase;letter-spacing:1.5px">Document</div><div style="font-family:'DM Serif Display',serif;font-size:16px;margin-top:4px">${ft?.label}</div><div style="font-size:11px;color:#5B8C7E;margin-top:4px;font-family:'JetBrains Mono',monospace">#${form.id.slice(0,8).toUpperCase()}</div><div style="font-size:11px;color:#7A8B85;margin-top:4px">Date: ${form.createdAt}</div></div></div>
<div class="sec">Client Information</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div><div class="row"><span class="lbl">Client</span><span class="val">${job.client||"—"}</span></div><div class="row"><span class="lbl">Property</span><span class="val">${job.name||"—"}</span></div></div>
<div><div class="row"><span class="lbl">Square Footage</span><span class="val">${job.sf?(+job.sf).toLocaleString()+" SF":"—"}</span></div><div class="row"><span class="lbl">Service Tier</span><span class="val">${job.tier||"Basic"}</span></div></div></div>
<div class="sec">Service Schedule</div>
<div class="row"><span class="lbl">Frequency</span><span class="val">${schedLabel}</span></div>
<div class="row"><span class="lbl">Service Time</span><span class="val">${job.serviceTime||"18:00"}</span></div>
<div class="row"><span class="lbl">Start Date</span><span class="val">${job.start||"—"}</span></div>
<div class="sec">Pricing</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr">
${[["Weekly Rate",fmtF(job.wkRate)],["Monthly Rate",fmtF(monthlyRate)],["Annual Rate",fmtF(annualRate)]].map(([l,v])=>`<div style="text-align:center;padding:16px 12px;border:1px solid #D5E5DC"><div style="font-size:10px;color:#7A8B85;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">${l}</div><div style="font-size:20px;font-weight:700;color:#3A7D44;font-family:'JetBrains Mono',monospace">${v}</div></div>`).join("")}
</div>
<div class="sec">Scope of Work</div>${sowHtml}
${form.notes?`<div class="sec">Notes</div><p style="white-space:pre-wrap">${form.notes}</p>`:""}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;padding-top:20px;border-top:1px solid #D5E5DC">
${["HuronWest Facility Services",job.client||"Client"].map(p=>`<div><div style="font-size:12px;color:#7A8B85;margin-bottom:40px">Authorized Representative — ${p}</div><div style="border-bottom:1px solid #1A3C34;margin-bottom:6px"></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#7A8B85"><span>Signature</span><span>Date</span></div></div>`).join("")}
</div>
<div style="margin-top:40px;padding-top:12px;border-top:1px solid #E8EFE9;text-align:center;font-size:10px;color:#A8D5BA;letter-spacing:1px">CONFIDENTIAL — HuronWest Facility Services LLC — ${new Date().getFullYear()}</div>
</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  // ── Computed stats ─────────────────────────────────────────────────────────
  const drafts   = forms.filter(f => f.status === "draft");
  const complete = forms.filter(f => f.status === "complete");
  const sent     = forms.filter(f => f.status === "sent");

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === "list" || view === "new") {
    return (
      <>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
          {[
            ["Total Forms", forms.length, T.accent],
            ["Drafts",      drafts.length, T.yellow],
            ["Complete",    complete.length, T.green],
            ["Sent",        sent.length, T.purple],
          ].map(([l, v, c]) => (
            <div key={l} style={{ ...ss.card, textAlign: "center", marginBottom: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div>
              <div style={{ fontSize: 10, color: T.td2, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* New form panel */}
        <div style={ss.card}>
          <div style={ss.ch}>
            <span>+ New Form</span>
            <span style={{ fontSize: 10, color: T.td2 }}>Select type and contract — fields auto-fill</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 16 }}>
            {FORM_TYPES.map(ft => (
              <button key={ft.key}
                onClick={() => setNewType(ft.key)}
                style={{
                  padding: "14px 10px",
                  background: newType === ft.key ? T.accent + "18" : T.card2,
                  border: newType === ft.key ? "2px solid " + T.accent : "1px solid " + T.border2,
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all .15s",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{ft.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: newType === ft.key ? T.accent : T.text }}>{ft.label}</div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.td2, marginBottom: 4 }}>Select Contract</div>
              <select style={ss.sel} value={newContract} onChange={e => setNewContract(e.target.value)}>
                <option value="">— Choose a contract —</option>
                {jobs.filter(j => j.active && !j.pipe).map(j => (
                  <option key={j.id} value={j.id}>{j.name} — {j.client} ({fmtF(j.wkRate)}/wk)</option>
                ))}
                {jobs.filter(j => j.pipe).length > 0 && <option disabled>── Pipeline ──</option>}
                {jobs.filter(j => j.pipe).map(j => (
                  <option key={j.id} value={j.id}>{j.name} — {j.client} (Pipeline)</option>
                ))}
              </select>
            </div>
            <button style={{ ...ss.btn, whiteSpace: "nowrap" }} onClick={createForm} disabled={!newContract}>
              Generate Form
            </button>
          </div>
        </div>

        {/* Drafts */}
        {drafts.length > 0 && (
          <div style={ss.card}>
            <div style={ss.ch}><span>Drafts ({drafts.length})</span></div>
            {drafts.map(f => {
              const job = jobs.find(j => j.id === f.contractId);
              const ft = FORM_TYPES.find(t => t.key === f.formType);
              return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid " + T.border2, cursor: "pointer" }}
                  onClick={() => setView(f.id)}
                  onMouseEnter={e => e.currentTarget.style.background = T.mintPale}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontSize: 22, width: 40, textAlign: "center" }}>{ft?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{ft?.label}</div>
                    <div style={{ fontSize: 12, color: T.td2, marginTop: 2 }}>{job?.name || "Unknown"} — {job?.client || "?"} · Created {f.createdAt}</div>
                  </div>
                  <div style={{ padding: "3px 10px", background: T.yellow + "20", color: T.yellow, borderRadius: 12, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Draft</div>
                  <button style={{ ...ss.btnD, padding: "4px 10px", fontSize: 11 }} onClick={e => { e.stopPropagation(); deleteForm(f.id); }}>✕</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Complete + Sent */}
        {(complete.length > 0 || sent.length > 0) && (
          <div style={ss.card}>
            <div style={ss.ch}><span>Completed ({complete.length + sent.length})</span></div>
            {[...complete, ...sent].map(f => {
              const job = jobs.find(j => j.id === f.contractId);
              const ft = FORM_TYPES.find(t => t.key === f.formType);
              const sc = STATUS_COLORS[f.status];
              return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid " + T.border2, cursor: "pointer" }}
                  onClick={() => setView(f.id)}
                  onMouseEnter={e => e.currentTarget.style.background = T.mintPale}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontSize: 22, width: 40, textAlign: "center" }}>{ft?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{ft?.label}</div>
                    <div style={{ fontSize: 12, color: T.td2, marginTop: 2 }}>{job?.name || "Unknown"} — {job?.client || "?"} · {f.updatedAt || f.createdAt}</div>
                  </div>
                  <div style={{ padding: "3px 10px", background: T[sc] + "20", color: T[sc], borderRadius: 12, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{f.status}</div>
                  <button style={{ ...ss.btnD, padding: "4px 10px", fontSize: 11 }} onClick={e => { e.stopPropagation(); deleteForm(f.id); }}>✕</button>
                </div>
              );
            })}
          </div>
        )}

        {forms.length === 0 && (
          <div style={{ ...ss.card, textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, color: T.border, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 18, color: T.ts, fontFamily: "'DM Serif Display',serif" }}>No forms yet</div>
            <div style={{ fontSize: 13, color: T.td2, marginTop: 6 }}>Select a form type and contract above to generate your first auto-filled form.</div>
          </div>
        )}
      </>
    );
  }

  // ── Form detail/edit view ──────────────────────────────────────────────────
  const form = forms.find(f => f.id === view);
  if (!form) { setView("list"); return null; }
  const job = jobs.find(j => j.id === form.contractId);
  const ft = FORM_TYPES.find(t => t.key === form.formType);

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button style={ss.btnG} onClick={() => setView("list")}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{ft?.label}</div>
          <div style={{ fontSize: 12, color: T.td2 }}>{job?.name} — {job?.client} · {form.status.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {form.status === "draft" && (
            <button style={{ ...ss.btn, background: T.green }} onClick={() => setStatus(form.id, "complete")}>Mark Complete</button>
          )}
          {form.status === "complete" && (
            <button style={{ ...ss.btn, background: T.purple }} onClick={() => setStatus(form.id, "sent")}>Mark Sent</button>
          )}
          <button style={ss.btnG} onClick={() => printForm(form.id)}>Print / PDF</button>
          <button style={ss.btnD} onClick={() => deleteForm(form.id)}>Delete</button>
        </div>
      </div>

      {/* Document preview */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid " + T.border,
        borderRadius: 6,
        padding: "48px 56px",
        maxWidth: 900,
        margin: "0 auto",
        boxShadow: "0 4px 20px rgba(26,60,52,0.08)",
        color: "#1A3C34",
        fontFamily: "'Outfit',sans-serif",
      }}>
        <FormDocument
          form={form}
          job={job}
          T={T}
          mono={mono}
          onUpdate={patch => updateForm(form.id, patch)}
        />
      </div>
    </>
  );
}
