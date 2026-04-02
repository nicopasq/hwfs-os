import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { SK } from '../constants';

const FORM_TYPES = [
  { key: "msa",        label: "Master Service Agreement", icon: "📋", desc: "Full legal contract" },
  { key: "sow",        label: "Scope of Work",            icon: "📝", desc: "Exhibit A — service scope matrix" },
  { key: "invoice",    label: "Invoice",                  icon: "🧾", desc: "Monthly billing document" },
  { key: "bid",        label: "Bid Sheet",                icon: "📊", desc: "Service proposal" },
  { key: "completion", label: "Completion Report",         icon: "✅", desc: "Post-service sign-off" },
];
const STATUS_COLORS = { draft: "yellow", complete: "green", sent: "purple" };

// ── Shared styles ────────────────────────────────────────────────────────────
const S = {
  mono: "'JetBrains Mono','Fira Code',monospace",
  serif: "'DM Serif Display',Georgia,serif",
  body: "'Outfit',sans-serif",
  forest: "#1A3C34", leaf: "#3A7D44", mint: "#A8D5BA", mintPale: "#E8F5EC",
  sage: "#5B8C7E", bark: "#3E4A47", barkLt: "#7A8B85", border: "#D5E5DC",
  borderLt: "#E8EFE9", cream: "#F7FAF8",
};

const footer = (
  <div style={{ marginTop: 48, paddingTop: 14, borderTop: "1px solid " + S.borderLt, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ fontSize: 10, color: S.mint, letterSpacing: "0.8px" }}>© 2026 HuronWest Facility Services LLC · huronwestfs.com</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: S.sage, fontWeight: 600 }}>
      <span style={{ color: S.leaf }}>🌿</span> Green Clean Certified
    </div>
  </div>
);

function Header({ title, refNum, date, subtitle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, borderBottom: "3px solid " + S.leaf, marginBottom: 28 }}>
      <div>
        <div style={{ fontFamily: S.serif, fontSize: 26, color: S.forest, lineHeight: 1.1 }}>HuronWest</div>
        <div style={{ fontSize: 11, color: S.sage, fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase" }}>Facility Services LLC</div>
        <div style={{ fontSize: 11, color: S.barkLt, marginTop: 8, lineHeight: 1.6 }}>Ann Arbor, Michigan · huronwestfs.com</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10, color: S.barkLt, textTransform: "uppercase", letterSpacing: "1.5px" }}>{subtitle || "Document"}</div>
        <div style={{ fontFamily: S.serif, fontSize: 17, color: S.forest, marginTop: 4 }}>{title}</div>
        <div style={{ fontSize: 11, color: S.sage, marginTop: 6, fontFamily: S.mono }}>{refNum}</div>
        <div style={{ fontSize: 11, color: S.barkLt, marginTop: 3 }}>Date: {date}</div>
      </div>
    </div>
  );
}

function SectionBar({ children }) {
  return <div style={{ background: S.forest, color: "#fff", padding: "8px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", borderRadius: 2, marginTop: 28, marginBottom: 14 }}>{children}</div>;
}

function SectionGreen({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: S.leaf, textTransform: "uppercase", letterSpacing: "2px", borderBottom: "2px solid " + S.mint, paddingBottom: 6, marginTop: 28, marginBottom: 14 }}>{children}</div>;
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + S.borderLt, fontSize: 13 }}>
      <span style={{ color: S.barkLt, fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: S.forest, fontFamily: S.mono }}>{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MSA — Multi-page legal contract
// ═════════════════════════════════════════════════════════════════════════════
function RenderMSA({ form, job, onUpdate }) {
  const wk = +job.wkRate || 0;
  const mo = wk * 4.33;
  const yr = wk * 52;
  const sow = job.scopeOfWork || [];
  const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3×/week", "2x_week": "2×/week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";

  const clause = (num, title, body) => (
    <div key={num} style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: S.forest, marginBottom: 8 }}>
        <span style={{ fontFamily: S.mono, color: S.leaf, marginRight: 8 }}>§{num}</span>{title}
      </div>
      <div style={{ fontSize: 13, color: S.bark, lineHeight: 1.8, paddingLeft: 28 }}>{body}</div>
    </div>
  );

  return (
    <div>
      <Header title="Master Service Agreement" refNum={"MSA-" + form.id.slice(0, 8).toUpperCase()} date={form.createdAt || td()} subtitle="Legal Contract" />

      {/* Parties */}
      <SectionBar>Parties to This Agreement</SectionBar>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 8 }}>
        <div style={{ padding: 16, background: S.mintPale, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: S.leaf, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Service Provider</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: S.forest }}>HuronWest Facility Services LLC</div>
          <div style={{ fontSize: 12, color: S.barkLt, marginTop: 4, lineHeight: 1.6 }}>Ann Arbor, Michigan<br/>EIN: _______________</div>
        </div>
        <div style={{ padding: 16, background: S.cream, border: "1px solid " + S.border, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: S.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Client</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: S.forest }}>{job.client || "________________"}</div>
          <div style={{ fontSize: 12, color: S.barkLt, marginTop: 4, lineHeight: 1.6 }}>Property: {job.name || "________________"}<br/>Address: {job.address || "________________"}</div>
        </div>
      </div>

      {/* Recitals */}
      <div style={{ padding: "14px 20px", background: S.cream, border: "1px solid " + S.borderLt, borderRadius: 4, marginTop: 16, marginBottom: 8, fontSize: 13, color: S.bark, lineHeight: 1.8, fontStyle: "italic" }}>
        <strong>WHEREAS,</strong> Provider is in the business of providing commercial janitorial and facility maintenance services; and <strong>WHEREAS,</strong> Client desires to engage Provider for the cleaning and maintenance of the above-referenced property; <strong>NOW, THEREFORE,</strong> in consideration of the mutual covenants contained herein, the parties agree as follows:
      </div>

      {/* Legal sections */}
      <SectionBar>Terms and Conditions</SectionBar>

      {clause(1, "Services & Scope", <>
        Provider shall furnish janitorial and facility maintenance services at the property described above, in accordance with the Scope of Work attached hereto as <strong>Exhibit A</strong> and incorporated by reference. Services shall be performed {schedLabel.toLowerCase()} beginning {job.start || "________________"}, at or around {job.serviceTime || "18:00"} hours.
      </>)}

      {clause(2, "Term & Renewal", <>
        This Agreement shall commence on <strong>{job.start || "________________"}</strong> for an initial term of twelve (12) months (the "Initial Term"). Upon expiration, this Agreement shall automatically renew for successive twelve-month periods unless either party provides written notice of non-renewal at least thirty (30) days prior to the end of the then-current term.
      </>)}

      {clause(3, "Compensation", <>
        Client shall pay Provider the following rates for services rendered:<br/><br/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, margin: "8px 0" }}>
          {[["Weekly Rate", fmtF(wk)], ["Monthly Rate", fmtF(mo)], ["Annual Rate", fmtF(yr)]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center", padding: "14px 10px", border: "1px solid " + S.border }}>
              <div style={{ fontSize: 10, color: S.barkLt, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: S.leaf, fontFamily: S.mono }}>{v}</div>
            </div>
          ))}
        </div>
        <br/>Payment is due within thirty (30) days of invoice date ("Net 30"). Late payments shall accrue interest at 1.5% per month. Monthly rate calculated as weekly rate × 4.33 (52 weeks ÷ 12 months).
        <div style={{ textAlign: "right", marginTop: 12, fontSize: 11, color: S.barkLt }}>Client initials: ________</div>
      </>)}

      {clause(4, "Insurance & Indemnification", <>
        Provider shall maintain, at its own expense, the following insurance coverage throughout the term of this Agreement:<br/>
        <div style={{ marginTop: 8 }}>
          {[["General Liability", "$1,000,000 per occurrence / $2,000,000 aggregate"],
            ["Automobile Liability", "$1,000,000 combined single limit"],
            ["Workers' Compensation", "As required by the State of Michigan"],
            ["Umbrella/Excess Liability", "$1,000,000"]
          ].map(([t, v]) => (
            <div key={t} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 12 }}>
              <span style={{ color: S.leaf, fontWeight: 700 }}>•</span>
              <span><strong>{t}:</strong> {v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>Provider shall indemnify and hold harmless Client from any claims arising out of Provider's negligence in performing services under this Agreement.</div>
      </>)}

      {clause(5, "Termination", <>
        <strong>For Cause:</strong> Either party may terminate this Agreement upon thirty (30) days' written notice if the other party materially breaches any provision and fails to cure such breach within thirty (30) days of receiving written notice thereof.<br/><br/>
        <strong>For Convenience:</strong> Either party may terminate this Agreement for any reason upon thirty (30) days' prior written notice to the other party. Provider shall be compensated for all services rendered through the effective date of termination.
      </>)}

      {clause(6, "Confidentiality", <>
        Each party agrees to maintain the confidentiality of the other party's proprietary information, including pricing, business practices, security protocols, and access codes. This obligation survives termination for a period of two (2) years.
      </>)}

      {clause(7, "Quality Standards", <>
        Provider is committed to environmentally responsible cleaning practices. All products used shall be <strong>EPA Safer Choice</strong> certified or equivalent. Provider guarantees a <strong>re-clean within 24 hours</strong> at no additional cost for any service that does not meet the quality standards outlined in Exhibit A. Cleaning equipment shall include HEPA-filtered vacuums rated at 99.97% particle capture.
      </>)}

      {clause(8, "Access & Security", <>
        Client shall provide Provider with reasonable access to the property, including keys, access fobs, and/or alarm codes as necessary. Provider shall maintain the security of all access credentials and shall not duplicate or distribute them without Client's prior written consent. Provider shall ensure all personnel follow Client's security protocols.
      </>)}

      {clause(9, "General Provisions", <>
        <strong>Independent Contractor:</strong> Provider is an independent contractor and nothing herein creates an employment, agency, or partnership relationship.<br/><br/>
        <strong>Non-Solicitation:</strong> During the term and for twelve (12) months thereafter, neither party shall solicit for hire any employee of the other party.<br/><br/>
        <strong>Force Majeure:</strong> Neither party shall be liable for delays caused by events beyond reasonable control, including natural disasters, pandemics, or government orders.<br/><br/>
        <strong>Governing Law:</strong> This Agreement shall be governed by the laws of the State of Michigan, Washtenaw County.<br/><br/>
        <strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions shall continue in full force and effect.<br/><br/>
        <strong>Amendments:</strong> This Agreement may only be modified in writing signed by both parties.<br/><br/>
        <strong>Entire Agreement:</strong> This Agreement, together with Exhibit A, constitutes the entire understanding between the parties and supersedes all prior agreements.
      </>)}

      {/* Signature block */}
      <SectionBar>Execution</SectionBar>
      <div style={{ fontSize: 13, color: S.bark, marginBottom: 20, lineHeight: 1.7 }}>
        <strong>IN WITNESS WHEREOF,</strong> the parties have executed this Master Service Agreement as of the date first written above.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        {[["HuronWest Facility Services LLC", "Provider"], [job.client || "Client", "Client"]].map(([name, role]) => (
          <div key={role}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.forest, marginBottom: 24 }}>{name}</div>
            <div style={{ borderBottom: "1px solid " + S.forest, marginBottom: 6 }} /><div style={{ fontSize: 11, color: S.barkLt, marginBottom: 20 }}>Signature</div>
            <div style={{ borderBottom: "1px solid " + S.border, marginBottom: 6 }} /><div style={{ fontSize: 11, color: S.barkLt, marginBottom: 20 }}>Printed Name & Title</div>
            <div style={{ borderBottom: "1px solid " + S.border, marginBottom: 6 }} /><div style={{ fontSize: 11, color: S.barkLt }}>Date</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, padding: "10px 14px", background: S.mintPale, borderRadius: 4, fontSize: 12, color: S.sage }}>
        <strong>Exhibit A</strong> — Scope of Work is attached and incorporated by reference. Generate the Scope of Work form for the full task matrix.
      </div>

      {/* Notes */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.leaf, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Internal Notes</div>
        <textarea style={{ width: "100%", minHeight: 60, padding: 12, border: "1px solid " + S.border, borderRadius: 4, fontSize: 13, fontFamily: S.body, color: S.forest, background: S.cream, resize: "vertical", outline: "none", boxSizing: "border-box" }}
          value={form.notes || ""} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Internal notes (not printed on final document)..." />
      </div>
      {footer}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SOW — Exhibit A task matrix
// ═════════════════════════════════════════════════════════════════════════════
function RenderSOW({ form, job, onUpdate }) {
  const sow = job.scopeOfWork || [];
  const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3×/week", "2x_week": "2×/week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";
  const areaIcons = { "Restrooms": "🚻", "Lobby": "🚪", "Common Areas": "🏢", "Kitchen": "🍽", "Break Room": "☕", "Office": "💼", "Hallways": "🚶", "Exterior": "🌿" };

  return (
    <div>
      <Header title="Scope of Work" refNum={"SOW-" + form.id.slice(0, 8).toUpperCase()} date={form.createdAt || td()} subtitle="Exhibit A" />
      <div style={{ padding: "10px 14px", background: S.mintPale, borderRadius: 4, marginBottom: 20, fontSize: 12, color: S.sage }}>
        Reference: Master Service Agreement for <strong>{job.name}</strong> — {job.client}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Row label="Property" value={job.name || "—"} /><Row label="Schedule" value={schedLabel} /><Row label="Service Time" value={job.serviceTime || "18:00"} />
      </div>

      <SectionGreen>Service Area Matrix</SectionGreen>
      {sow.length === 0 && <div style={{ padding: 24, textAlign: "center", color: S.barkLt, fontSize: 13 }}>No scope of work defined. Add areas and tasks in the Contracts tab.</div>}
      {sow.map((area, ai) => (
        <div key={ai} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: S.forest, color: "#fff", borderRadius: "4px 4px 0 0", fontSize: 13, fontWeight: 700 }}>
            <span>{areaIcons[area.area] || "📍"}</span>
            <span>{area.area || "Area " + (ai + 1)}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: S.mintPale }}>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: S.leaf, textTransform: "uppercase", letterSpacing: "1px", width: "60%" }}>Task Description</th>
                <th style={{ padding: "8px 14px", textAlign: "center", fontSize: 10, fontWeight: 700, color: S.leaf, textTransform: "uppercase", letterSpacing: "1px" }}>Frequency</th>
              </tr>
            </thead>
            <tbody>
              {(area.tasks || []).filter(t => t.trim()).map((task, ti) => (
                <tr key={ti} style={{ background: ti % 2 === 0 ? "#fff" : S.cream }}>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid " + S.borderLt, fontSize: 13, color: S.bark }}>
                    <span style={{ color: S.leaf, marginRight: 8 }}>•</span>{task}
                  </td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid " + S.borderLt, textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", background: S.leaf + "15", color: S.leaf, borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{schedLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <SectionGreen>Special Instructions</SectionGreen>
      <textarea style={{ width: "100%", minHeight: 80, padding: 12, border: "1px solid " + S.border, borderRadius: 4, fontSize: 13, fontFamily: S.body, color: S.forest, background: "#fff", resize: "vertical", outline: "none", boxSizing: "border-box" }}
        value={form.notes || ""} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Additional instructions, access notes, chemical restrictions..." />
      {footer}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// INVOICE — Financial document (1 page)
// ═════════════════════════════════════════════════════════════════════════════
function RenderInvoice({ form, job, onUpdate }) {
  const wk = +job.wkRate || 0;
  const mo = wk * 4.33;
  const taxRate = 0; // Most commercial janitorial is tax-exempt
  const tax = mo * taxRate;
  const total = mo + tax;
  const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3×/week", "2x_week": "2×/week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";
  const invNum = "INV-" + (form.createdAt || td()).replace(/-/g, "") + "-" + form.id.slice(0, 4).toUpperCase();

  const statusBadge = { draft: ["DRAFT", S.barkLt], complete: ["READY", S.leaf], sent: ["SENT", "#1565C0"] }[form.status] || ["DRAFT", S.barkLt];

  return (
    <div>
      {/* Custom invoice header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, borderBottom: "3px solid " + S.leaf, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: S.serif, fontSize: 26, color: S.forest }}>HuronWest</div>
          <div style={{ fontSize: 11, color: S.sage, fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase" }}>Facility Services LLC</div>
          <div style={{ fontSize: 11, color: S.barkLt, marginTop: 8, lineHeight: 1.6 }}>Ann Arbor, Michigan · huronwestfs.com</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: S.serif, fontSize: 28, color: S.forest, letterSpacing: "-0.5px" }}>INVOICE</div>
          <div style={{ display: "inline-block", padding: "3px 12px", background: statusBadge[1] + "18", color: statusBadge[1], borderRadius: 12, fontSize: 10, fontWeight: 700, letterSpacing: "1px", marginTop: 4 }}>{statusBadge[0]}</div>
        </div>
      </div>

      {/* Invoice details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, color: S.barkLt, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Bill To</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.forest }}>{job.client || "—"}</div>
          <div style={{ fontSize: 13, color: S.bark, marginTop: 4, lineHeight: 1.6 }}>Property: {job.name}<br/>{job.address || ""}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "6px 16px", justifyContent: "end", fontSize: 13 }}>
            <span style={{ color: S.barkLt }}>Invoice #</span><span style={{ fontFamily: S.mono, fontWeight: 700, color: S.forest }}>{invNum}</span>
            <span style={{ color: S.barkLt }}>Issue Date</span><span style={{ fontFamily: S.mono, color: S.forest }}>{form.createdAt || td()}</span>
            <span style={{ color: S.barkLt }}>Due Date</span><span style={{ fontFamily: S.mono, color: S.forest }}>Net 30</span>
            <span style={{ color: S.barkLt }}>PO #</span>
            <input style={{ fontFamily: S.mono, color: S.forest, border: "none", borderBottom: "1px solid " + S.border, background: "transparent", textAlign: "right", fontSize: 13, width: 100, outline: "none", padding: "2px 0" }}
              value={form.poNumber || ""} onChange={e => onUpdate({ poNumber: e.target.value })} placeholder="—" />
          </div>
        </div>
      </div>

      {/* Line items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ background: S.forest }}>
            {["Description", "Schedule", "Rate", "Amount"].map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: i >= 2 ? "right" : "left", fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "14px", borderBottom: "1px solid " + S.borderLt, fontWeight: 600, color: S.forest }}>Janitorial Services — {job.name}</td>
            <td style={{ padding: "14px", borderBottom: "1px solid " + S.borderLt, color: S.bark }}>{schedLabel}</td>
            <td style={{ padding: "14px", borderBottom: "1px solid " + S.borderLt, textAlign: "right", fontFamily: S.mono, color: S.bark }}>{fmtF(wk)}/wk</td>
            <td style={{ padding: "14px", borderBottom: "1px solid " + S.borderLt, textAlign: "right", fontFamily: S.mono, fontWeight: 700, color: S.forest }}>{fmtF(mo)}</td>
          </tr>
          <tr style={{ background: S.cream }}>
            <td colSpan={4} style={{ padding: "8px 14px", fontSize: 11, color: S.barkLt }}>
              {job.sf ? (+job.sf).toLocaleString() + " SF · " : ""}{job.tier || "Basic"} tier · Monthly billing (weekly rate × 4.33)
            </td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 260 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + S.borderLt, fontSize: 13 }}>
            <span style={{ color: S.barkLt }}>Subtotal</span><span style={{ fontFamily: S.mono, color: S.forest }}>{fmtF(mo)}</span>
          </div>
          {taxRate > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + S.borderLt, fontSize: 13 }}>
            <span style={{ color: S.barkLt }}>Sales Tax ({(taxRate * 100).toFixed(1)}%)</span><span style={{ fontFamily: S.mono, color: S.forest }}>{fmtF(tax)}</span>
          </div>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 13, borderTop: "2px solid " + S.forest }}>
            <span style={{ fontWeight: 700, color: S.forest, fontSize: 14 }}>Total Due</span>
            <span style={{ fontFamily: S.mono, fontWeight: 700, color: S.leaf, fontSize: 22 }}>{fmtF(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div style={{ marginTop: 28, padding: "16px 20px", background: S.mintPale, borderRadius: 4, border: "1px solid " + S.mint }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.leaf, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Payment Information</div>
        <div style={{ fontSize: 12, color: S.bark, lineHeight: 1.8 }}>
          Payment is due within 30 days of invoice date. Please make checks payable to <strong>HuronWest Facility Services LLC</strong>.<br/>
          For electronic payment, contact us at billing@huronwestfs.com.
        </div>
      </div>

      <textarea style={{ width: "100%", minHeight: 50, marginTop: 16, padding: 12, border: "1px solid " + S.border, borderRadius: 4, fontSize: 12, fontFamily: S.body, color: S.forest, background: S.cream, resize: "vertical", outline: "none", boxSizing: "border-box" }}
        value={form.notes || ""} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Additional billing notes..." />
      {footer}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BID SHEET — Sales proposal
// ═════════════════════════════════════════════════════════════════════════════
function RenderBid({ form, job, onUpdate }) {
  const wk = +job.wkRate || 0;
  const mo = wk * 4.33;
  const yr = wk * 52;
  const sow = job.scopeOfWork || [];
  const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3×/week", "2x_week": "2×/week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";

  return (
    <div>
      {/* Custom proposal header */}
      <div style={{ background: "linear-gradient(135deg, " + S.forest + " 0%, #2D5E51 100%)", padding: "32px 36px", borderRadius: "6px 6px 0 0", marginBottom: 0, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "3px", opacity: 0.7, marginBottom: 6 }}>Service Proposal</div>
            <div style={{ fontFamily: S.serif, fontSize: 28 }}>HuronWest</div>
            <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: "2px", textTransform: "uppercase" }}>Facility Services</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Prepared for</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{job.client || "Client"}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, fontFamily: S.mono }}>BID-{form.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </div>
      <div style={{ background: S.mint, padding: "8px 36px", fontSize: 12, color: S.forest, fontWeight: 600, borderRadius: "0 0 6px 6px", marginBottom: 24 }}>
        This proposal is valid for 30 days from {form.createdAt || td()}
      </div>

      {/* Property assessment */}
      <SectionGreen>Property Assessment</SectionGreen>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Row label="Property" value={job.name || "—"} /><Row label="Client" value={job.client || "—"} />
        <Row label="Square Footage" value={job.sf ? (+job.sf).toLocaleString() + " SF" : "—"} /><Row label="Service Tier" value={job.tier || "Basic"} />
      </div>

      {/* Pricing */}
      <SectionGreen>Proposed Pricing</SectionGreen>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderRadius: 4, overflow: "hidden", border: "2px solid " + S.leaf }}>
        {[["Weekly", fmtF(wk)], ["Monthly", fmtF(mo)], ["Annual", fmtF(yr)]].map(([l, v], i) => (
          <div key={l} style={{ textAlign: "center", padding: "18px 12px", background: i === 1 ? S.mintPale : "#fff", borderLeft: i > 0 ? "1px solid " + S.border : "none" }}>
            <div style={{ fontSize: 10, color: S.barkLt, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: i === 1 ? 26 : 20, fontWeight: 700, color: S.leaf, fontFamily: S.mono }}>{v}</div>
          </div>
        ))}
      </div>
      {job.sf > 0 && <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: S.barkLt }}>${(yr / job.sf).toFixed(2)}/SF/year · {schedLabel}</div>}

      {/* Proposed scope */}
      {sow.length > 0 && <>
        <SectionGreen>Proposed Scope of Work</SectionGreen>
        {sow.map((area, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: S.forest, padding: "8px 12px", background: S.mintPale, borderRadius: 4, marginBottom: 4 }}>{area.area}</div>
            {(area.tasks || []).filter(t => t.trim()).map((task, ti) => (
              <div key={ti} style={{ padding: "5px 12px 5px 24px", fontSize: 13, color: S.bark }}>
                <span style={{ color: S.leaf, fontWeight: 700, marginRight: 8 }}>•</span>{task}
              </div>
            ))}
          </div>
        ))}
      </>}

      {/* Why HuronWest */}
      <SectionGreen>Why HuronWest</SectionGreen>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["🌿 EPA Safer Choice", "All cleaning products are EPA Safer Choice certified — safer for occupants, staff, and the environment."],
          ["👤 Owner-Operated", "Direct oversight from company ownership. You're not a ticket number — you have a direct line to decision-makers."],
          ["🔬 HEPA Equipment", "All vacuums are HEPA-filtered (99.97% particle capture). Hospital-grade air quality after every service."],
          ["📋 Scope-Based Pricing", "Transparent pricing tied to a detailed scope of work. No surprises, no hidden fees."],
        ].map(([t, d]) => (
          <div key={t} style={{ padding: 14, background: S.cream, borderRadius: 4, border: "1px solid " + S.borderLt }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: S.forest, marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 12, color: S.bark, lineHeight: 1.6 }}>{d}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 28, padding: "20px 24px", background: S.mintPale, borderRadius: 6, border: "1px solid " + S.mint, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.forest, marginBottom: 6 }}>Ready to get started?</div>
        <div style={{ fontSize: 13, color: S.bark }}>
          Contact {job.crewLead || "our team"} · {job.crewEmail || "hello@huronwestfs.com"}
          {job.crewPhone ? " · " + job.crewPhone : ""}
        </div>
      </div>

      {/* Acceptance signature */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 13, color: S.bark, marginBottom: 20, lineHeight: 1.7 }}>
          By signing below, Client accepts this proposal and authorizes HuronWest Facility Services to begin services as described above.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          {["Client Acceptance", "HuronWest Facility Services"].map(p => (
            <div key={p}>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.forest, marginBottom: 28 }}>{p}</div>
              <div style={{ borderBottom: "1px solid " + S.forest, marginBottom: 6 }} /><div style={{ fontSize: 11, color: S.barkLt, marginBottom: 16 }}>Signature & Date</div>
              <div style={{ borderBottom: "1px solid " + S.border, marginBottom: 6 }} /><div style={{ fontSize: 11, color: S.barkLt }}>Printed Name & Title</div>
            </div>
          ))}
        </div>
      </div>

      <textarea style={{ width: "100%", minHeight: 50, marginTop: 20, padding: 12, border: "1px solid " + S.border, borderRadius: 4, fontSize: 12, fontFamily: S.body, color: S.forest, background: S.cream, resize: "vertical", outline: "none", boxSizing: "border-box" }}
        value={form.notes || ""} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Internal notes..." />
      {footer}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CCR — Job Completion Report (1 page, quick checklist)
// ═════════════════════════════════════════════════════════════════════════════
function RenderCCR({ form, job, onUpdate }) {
  const sow = job.scopeOfWork || [];
  const today = td();

  return (
    <div>
      <Header title="Job Completion Report" refNum={"CCR-" + form.id.slice(0, 8).toUpperCase()} date={form.completionDate || today} subtitle="Service Verification" />

      {/* Quick info bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0, border: "1px solid " + S.border, borderRadius: 4, marginBottom: 20 }}>
        {[["Property", job.name], ["Client", job.client], ["Crew Lead", job.crewLead || "—"],
          ["Date", <input key="d" type="date" value={form.completionDate || today} onChange={e => onUpdate({ completionDate: e.target.value })} style={{ border: "none", background: "transparent", fontFamily: S.mono, fontSize: 13, color: S.forest, outline: "none", width: "100%" }} />]
        ].map(([l, v], i) => (
          <div key={l} style={{ padding: "10px 14px", borderRight: i < 3 ? "1px solid " + S.borderLt : "none" }}>
            <div style={{ fontSize: 9, color: S.barkLt, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: S.forest }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Time */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[["Arrival Time", "arrivalTime"], ["Departure Time", "departureTime"], ["Total Hours", "totalHours"]].map(([l, k]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: S.barkLt, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{l}</div>
            <input type={k === "totalHours" ? "text" : "time"} style={{ width: "100%", padding: "8px 10px", border: "1px solid " + S.border, borderRadius: 4, fontFamily: S.mono, fontSize: 13, color: S.forest, background: "#fff", outline: "none", boxSizing: "border-box" }}
              value={form[k] || ""} onChange={e => onUpdate({ [k]: e.target.value })} placeholder={k === "totalHours" ? "e.g. 2.5" : ""} />
          </div>
        ))}
      </div>

      {/* Scope checklist */}
      {sow.length > 0 && <>
        <SectionGreen>Area Checklist</SectionGreen>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: S.forest }}>
              <th style={{ padding: "8px 14px", textAlign: "left", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Area / Task</th>
              <th style={{ padding: "8px 14px", textAlign: "center", color: "#fff", fontSize: 10, fontWeight: 700, width: 80 }}>Done</th>
              <th style={{ padding: "8px 14px", textAlign: "center", color: "#fff", fontSize: 10, fontWeight: 700, width: 80 }}>N/A</th>
            </tr>
          </thead>
          <tbody>
            {sow.map((area, ai) => [
              <tr key={"a" + ai} style={{ background: S.mintPale }}>
                <td colSpan={3} style={{ padding: "8px 14px", fontWeight: 700, fontSize: 13, color: S.forest }}>{area.area}</td>
              </tr>,
              ...(area.tasks || []).filter(t => t.trim()).map((task, ti) => (
                <tr key={"t" + ai + "-" + ti} style={{ background: ti % 2 === 0 ? "#fff" : S.cream }}>
                  <td style={{ padding: "7px 14px 7px 28px", borderBottom: "1px solid " + S.borderLt, fontSize: 13, color: S.bark }}>{task}</td>
                  <td style={{ padding: "7px 14px", borderBottom: "1px solid " + S.borderLt, textAlign: "center" }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "1.5px solid " + S.leaf, borderRadius: 2 }} />
                  </td>
                  <td style={{ padding: "7px 14px", borderBottom: "1px solid " + S.borderLt, textAlign: "center" }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "1.5px solid " + S.border, borderRadius: 2 }} />
                  </td>
                </tr>
              ))
            ])}
          </tbody>
        </table>
      </>}

      {/* Condition + supplies */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: S.barkLt, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Condition Notes / Issues Found</div>
          <textarea style={{ width: "100%", minHeight: 70, padding: 10, border: "1px solid " + S.border, borderRadius: 4, fontSize: 13, fontFamily: S.body, color: S.forest, background: "#fff", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            value={form.notes || ""} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Any issues, damage, or items needing attention..." />
        </div>
        <div>
          <div style={{ fontSize: 10, color: S.barkLt, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Supplies</div>
          <div style={{ padding: "12px 14px", border: "1px solid " + S.border, borderRadius: 4, background: "#fff" }}>
            {["Supplies restocked?", "Paper products refilled?", "Trash liners replaced?"].map(q => (
              <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13, color: S.bark }}>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid " + S.leaf, borderRadius: 2, flexShrink: 0 }} />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client sign-off */}
      <div style={{ marginTop: 24, padding: "16px 20px", border: "2px solid " + S.leaf, borderRadius: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: S.forest, marginBottom: 16 }}>Client Sign-Off</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {["Client Signature", "Printed Name", "Date"].map(l => (
            <div key={l}><div style={{ borderBottom: "1px solid " + S.forest, marginBottom: 4, height: 28 }} /><div style={{ fontSize: 11, color: S.barkLt }}>{l}</div></div>
          ))}
        </div>
      </div>
      {footer}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Form selector / dispatcher
// ═════════════════════════════════════════════════════════════════════════════
function FormDocument({ form, job, T, mono, onUpdate }) {
  if (!job) return <div style={{ padding: 40, textAlign: "center", color: T.td2 }}>Contract not found — it may have been deleted.</div>;
  const props = { form, job, onUpdate };
  switch (form.formType) {
    case "msa":        return <RenderMSA {...props} />;
    case "sow":        return <RenderSOW {...props} />;
    case "invoice":    return <RenderInvoice {...props} />;
    case "bid":        return <RenderBid {...props} />;
    case "completion": return <RenderCCR {...props} />;
    default:           return <div style={{ padding: 40, textAlign: "center", color: T.td2 }}>Unknown form type.</div>;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Print helper — generates per-type HTML
// ═════════════════════════════════════════════════════════════════════════════
function printForm(forms, jobs, formId) {
  const form = forms.find(f => f.id === formId);
  const job = jobs.find(j => j.id === form?.contractId);
  if (!form || !job) return;
  const w = window.open("", "_blank"); if (!w) return;

  const wk = +job.wkRate || 0, mo = wk * 4.33, yr = wk * 52;
  const schedLabel = { daily: "Daily (Mon–Fri)", "3x_week": "3×/week", "2x_week": "2×/week", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[job.schedule] || "Weekly";
  const sow = (job.scopeOfWork || []).filter(a => a.area?.trim());
  const ft = FORM_TYPES.find(f => f.key === form.formType);

  const css = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;font-size:13px;color:#1A3C34;padding:48px 56px;max-width:900px;margin:0 auto;line-height:1.6}
.sec-bar{background:#1A3C34;color:#fff;padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border-radius:2px;margin:28px 0 14px}
.sec-grn{font-size:11px;font-weight:700;color:#3A7D44;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #A8D5BA;padding-bottom:6px;margin:28px 0 14px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E8EFE9}.lbl{color:#7A8B85;font-weight:500}.val{font-weight:600;font-family:'JetBrains Mono',monospace}
table{width:100%;border-collapse:collapse}th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
td{padding:10px 14px;border-bottom:1px solid #E8EFE9;font-size:13px}
.footer{margin-top:48px;padding-top:14px;border-top:1px solid #E8EFE9;display:flex;justify-content:space-between;font-size:10px;color:#A8D5BA;letter-spacing:0.8px}
@media print{body{padding:24px 32px}.no-print{display:none!important}}`;

  const headerHtml = `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #3A7D44;margin-bottom:28px">
<div><div style="font-family:'DM Serif Display',serif;font-size:26px;color:#1A3C34">HuronWest</div><div style="font-size:11px;color:#5B8C7E;font-weight:600;letter-spacing:2.5px;text-transform:uppercase">Facility Services LLC</div><div style="font-size:11px;color:#7A8B85;margin-top:8px">Ann Arbor, Michigan · huronwestfs.com</div></div>
<div style="text-align:right"><div style="font-size:10px;color:#7A8B85;text-transform:uppercase;letter-spacing:1.5px">${ft?.label}</div><div style="font-family:'DM Serif Display',serif;font-size:17px;color:#1A3C34;margin-top:4px">${ft?.label}</div><div style="font-size:11px;color:#5B8C7E;margin-top:6px;font-family:'JetBrains Mono',monospace">${form.formType.toUpperCase()}-${form.id.slice(0,8).toUpperCase()}</div><div style="font-size:11px;color:#7A8B85;margin-top:3px">Date: ${form.createdAt}</div></div></div>`;

  const footerHtml = `<div class="footer"><span>© 2026 HuronWest Facility Services LLC · huronwestfs.com</span><span>🌿 Green Clean Certified</span></div>`;

  const sowHtml = sow.map(a => `<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:700;color:#1A3C34;padding:8px 12px;background:#E8F5EC;border-radius:4px;margin-bottom:4px">${a.area}</div>${(a.tasks||[]).filter(t=>t.trim()).map(t=>`<div style="padding:5px 12px 5px 24px;font-size:13px;color:#3E4A47"><span style="color:#3A7D44;font-weight:700">•</span> ${t}</div>`).join("")}</div>`).join("");

  const pricingHtml = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">${[["Weekly",fmtF(wk)],["Monthly",fmtF(mo)],["Annual",fmtF(yr)]].map(([l,v])=>`<div style="text-align:center;padding:16px 12px;border:1px solid #D5E5DC"><div style="font-size:10px;color:#7A8B85;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">${l}</div><div style="font-size:20px;font-weight:700;color:#3A7D44;font-family:'JetBrains Mono',monospace">${v}</div></div>`).join("")}</div>`;

  const sigHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:32px">${["HuronWest Facility Services",job.client||"Client"].map(p=>`<div><div style="font-size:12px;font-weight:600;color:#1A3C34;margin-bottom:28px">${p}</div><div style="border-bottom:1px solid #1A3C34;margin-bottom:6px"></div><div style="font-size:11px;color:#7A8B85;margin-bottom:16px">Signature & Date</div><div style="border-bottom:1px solid #D5E5DC;margin-bottom:6px"></div><div style="font-size:11px;color:#7A8B85">Printed Name & Title</div></div>`).join("")}</div>`;

  let body = "";
  if (form.formType === "msa") {
    body = `${headerHtml}<div class="sec-bar">Terms and Conditions</div>` +
      [`§1 Services & Scope — Provider shall furnish janitorial services at ${job.name} in accordance with the Scope of Work (Exhibit A). Services performed ${schedLabel.toLowerCase()} beginning ${job.start||"TBD"}.`,
       `§2 Term & Renewal — Initial term: 12 months from ${job.start||"TBD"}. Auto-renews unless 30 days written notice.`,
       `§3 Compensation`,`§4 Insurance — GL $1M/$2M, Auto $1M, WC per Michigan law, Umbrella $1M. Provider indemnifies Client.`,
       `§5 Termination — For cause: 30-day cure period. For convenience: 30 days written notice.`,
       `§6 Confidentiality — 2-year post-termination obligation.`,
       `§7 Quality — EPA Safer Choice products. HEPA vacuums. Re-clean guarantee within 24hrs.`,
       `§8 Access & Security — Client provides keys/codes. Provider maintains security protocols.`,
       `§9 General — Independent contractor. Non-solicitation 12mo. Michigan/Washtenaw County law. Severability. Entire agreement.`
      ].map((t,i) => i === 2 ? `<div style="margin-bottom:16px"><div style="font-size:14px;font-weight:700;color:#1A3C34;margin-bottom:8px"><span style="font-family:'JetBrains Mono',monospace;color:#3A7D44;margin-right:8px">§3</span>Compensation</div><div style="padding-left:28px">${pricingHtml}<div style="margin-top:8px;font-size:13px;color:#3E4A47">Payment due Net 30. Monthly = weekly × 4.33.</div></div></div>` : `<div style="margin-bottom:16px"><div style="font-size:13px;color:#3E4A47;line-height:1.8;padding-left:28px">${t}</div></div>`).join("") +
      `<div class="sec-bar">Execution</div>${sigHtml}${form.notes?`<div class="sec-grn" style="margin-top:24px">Notes</div><p style="white-space:pre-wrap">${form.notes}</p>`:""}${footerHtml}`;
  } else if (form.formType === "invoice") {
    const invNum = "INV-"+(form.createdAt||td()).replace(/-/g,"")+"-"+form.id.slice(0,4).toUpperCase();
    body = `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #3A7D44;margin-bottom:24px"><div><div style="font-family:'DM Serif Display',serif;font-size:26px;color:#1A3C34">HuronWest</div><div style="font-size:11px;color:#5B8C7E;font-weight:600;letter-spacing:2.5px;text-transform:uppercase">Facility Services LLC</div></div><div style="text-align:right"><div style="font-family:'DM Serif Display',serif;font-size:28px;color:#1A3C34">INVOICE</div></div></div>` +
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px"><div><div style="font-size:10px;color:#7A8B85;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">Bill To</div><div style="font-size:15px;font-weight:700">${job.client}</div><div style="font-size:13px;color:#3E4A47;margin-top:4px">Property: ${job.name}</div></div><div style="text-align:right"><div class="row"><span class="lbl">Invoice #</span><span class="val">${invNum}</span></div><div class="row"><span class="lbl">Date</span><span class="val">${form.createdAt}</span></div><div class="row"><span class="lbl">Due</span><span class="val">Net 30</span></div></div></div>` +
      `<table><thead><tr style="background:#1A3C34;color:#fff"><th>Description</th><th>Schedule</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody><tr><td style="font-weight:600">Janitorial Services — ${job.name}</td><td>${schedLabel}</td><td style="text-align:right;font-family:'JetBrains Mono',monospace">${fmtF(wk)}/wk</td><td style="text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700">${fmtF(mo)}</td></tr></tbody></table>` +
      `<div style="display:flex;justify-content:flex-end;margin-top:16px"><div style="width:240px"><div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #1A3C34"><span style="font-weight:700;font-size:14px">Total Due</span><span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#3A7D44;font-size:22px">${fmtF(mo)}</span></div></div></div>` +
      `<div style="margin-top:28px;padding:16px 20px;background:#E8F5EC;border-radius:4px"><div style="font-size:11px;font-weight:700;color:#3A7D44;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Payment Information</div><div style="font-size:12px;color:#3E4A47">Payment due within 30 days. Make checks payable to HuronWest Facility Services LLC.</div></div>${footerHtml}`;
  } else {
    body = `${headerHtml}<div class="row"><span class="lbl">Property</span><span class="val">${job.name}</span></div><div class="row"><span class="lbl">Client</span><span class="val">${job.client}</span></div><div class="row"><span class="lbl">Schedule</span><span class="val">${schedLabel}</span></div>${pricingHtml}<div class="sec-grn">Scope of Work</div>${sowHtml||"<p>No scope defined.</p>"}${form.notes?`<div class="sec-grn">Notes</div><p style="white-space:pre-wrap">${form.notes}</p>`:""}${sigHtml}${footerHtml}`;
  }

  w.document.write(`<!DOCTYPE html><html><head><title>${ft?.label} — ${job.name}</title><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>${body}</body></html>`);
  w.document.close(); setTimeout(() => w.print(), 600);
}

// ═════════════════════════════════════════════════════════════════════════════
// Main FormsTab
// ═════════════════════════════════════════════════════════════════════════════
export default function FormsTab({ data, upd, setData }) {
  const { T, ss, mono, font } = useApp();
  const [view, setView] = useState("list");
  const [newType, setNewType] = useState("msa");
  const [newContract, setNewContract] = useState("");

  const forms = data.formDrafts || [];
  const jobs  = data.jobs || [];

  const createForm = () => {
    if (!newContract) return;
    const form = { id: uid(), contractId: newContract, formType: newType, status: "draft", notes: "", createdAt: td(), updatedAt: td() };
    upd("formDrafts", [...forms, form]);
    setView(form.id);
  };
  const updateForm = (id, patch) => upd("formDrafts", forms.map(f => f.id === id ? { ...f, ...patch, updatedAt: td() } : f));
  const deleteForm = (id) => { upd("formDrafts", forms.filter(f => f.id !== id)); if (view === id) setView("list"); };
  const setStatus = (id, status) => updateForm(id, { status });

  const drafts   = forms.filter(f => f.status === "draft");
  const complete = forms.filter(f => f.status === "complete");
  const sent     = forms.filter(f => f.status === "sent");

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
          {[["Total Forms", forms.length, T.accent], ["Drafts", drafts.length, T.yellow], ["Complete", complete.length, T.green], ["Sent", sent.length, T.purple]].map(([l, v, c]) => (
            <div key={l} style={{ ...ss.card, textAlign: "center", marginBottom: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div>
              <div style={{ fontSize: 10, color: T.td2, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={ss.card}>
          <div style={ss.ch}><span>+ New Form</span><span style={{ fontSize: 10, color: T.td2 }}>Select type and contract — fields auto-fill</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 16 }}>
            {FORM_TYPES.map(ft => (
              <button key={ft.key} onClick={() => setNewType(ft.key)}
                style={{ padding: "14px 10px", background: newType === ft.key ? T.accent + "18" : T.card2, border: newType === ft.key ? "2px solid " + T.accent : "1px solid " + T.border2, borderRadius: 6, cursor: "pointer", textAlign: "center", transition: "all .15s" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{ft.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: newType === ft.key ? T.accent : T.text }}>{ft.label}</div>
                <div style={{ fontSize: 10, color: T.td2, marginTop: 2 }}>{ft.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.td2, marginBottom: 4 }}>Select Contract</div>
              <select style={ss.sel} value={newContract} onChange={e => setNewContract(e.target.value)}>
                <option value="">— Choose a contract —</option>
                {jobs.filter(j => j.active && !j.pipe).map(j => <option key={j.id} value={j.id}>{j.name} — {j.client} ({fmtF(j.wkRate)}/wk)</option>)}
                {jobs.filter(j => j.pipe).length > 0 && <option disabled>── Pipeline ──</option>}
                {jobs.filter(j => j.pipe).map(j => <option key={j.id} value={j.id}>{j.name} — {j.client} (Pipeline)</option>)}
              </select>
            </div>
            <button style={{ ...ss.btn, whiteSpace: "nowrap" }} onClick={createForm} disabled={!newContract}>Generate Form</button>
          </div>
        </div>

        {/* Form list */}
        {[["Drafts", drafts, "draft"], ["Completed", [...complete, ...sent], "done"]].map(([title, list, type]) =>
          list.length > 0 ? (
            <div key={title} style={ss.card}>
              <div style={ss.ch}><span>{title} ({list.length})</span></div>
              {list.map(f => {
                const job = jobs.find(j => j.id === f.contractId);
                const ft = FORM_TYPES.find(t => t.key === f.formType);
                const sc = STATUS_COLORS[f.status];
                return (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid " + T.border2, cursor: "pointer" }}
                    onClick={() => setView(f.id)} onMouseEnter={e => e.currentTarget.style.background = T.mintPale} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
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
          ) : null
        )}

        {forms.length === 0 && (
          <div style={{ ...ss.card, textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, color: T.border, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 18, color: T.ts, fontFamily: "'DM Serif Display',serif" }}>No forms yet</div>
            <div style={{ fontSize: 13, color: T.td2, marginTop: 6 }}>Select a form type and contract above to generate your first auto-filled document.</div>
          </div>
        )}
      </>
    );
  }

  // ── Form detail view ───────────────────────────────────────────────────────
  const form = forms.find(f => f.id === view);
  if (!form) { setView("list"); return null; }
  const job = jobs.find(j => j.id === form.contractId);
  const ft = FORM_TYPES.find(t => t.key === form.formType);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button style={ss.btnG} onClick={() => setView("list")}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{ft?.label}</div>
          <div style={{ fontSize: 12, color: T.td2 }}>{job?.name} — {job?.client} · {form.status.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {form.status === "draft" && <button style={{ ...ss.btn, background: T.green }} onClick={() => setStatus(form.id, "complete")}>Mark Complete</button>}
          {form.status === "complete" && <button style={{ ...ss.btn, background: T.purple }} onClick={() => setStatus(form.id, "sent")}>Mark Sent</button>}
          <button style={ss.btnG} onClick={() => printForm(forms, jobs, form.id)}>Print / PDF</button>
          <button style={ss.btnD} onClick={() => deleteForm(form.id)}>Delete</button>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid " + T.border, borderRadius: 6, padding: "48px 56px", maxWidth: 900, margin: "0 auto", boxShadow: "0 4px 20px rgba(26,60,52,0.08)", color: "#1A3C34", fontFamily: "'Outfit',sans-serif" }}>
        <FormDocument form={form} job={job} T={T} mono={mono} onUpdate={patch => updateForm(form.id, patch)} />
      </div>
    </>
  );
}
