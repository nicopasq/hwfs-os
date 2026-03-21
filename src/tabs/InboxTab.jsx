import { useApp } from '../context';
import { fmtF, uid, td } from '../utils';
import { Badge } from '../components/ui';
import { SK } from '../constants';
import { deleteIncoming } from '../firebase';

// ── Document type → badge colour / action label ───────────────────────────
const DOC_META = {
  MSA:      { color: '#1565C0', label: 'MSA',      action: 'Add to CRM',          icon: '📄' },
  BidSheet: { color: '#5B8C7E', label: 'Bid Sheet', action: 'Add to CRM',         icon: '🔍' },
  Invoice:  { color: '#3A7D44', label: 'Invoice',   action: 'Log to Activity',    icon: '🧾' },
  CCR:      { color: '#2E7D32', label: 'CCR',       action: 'Log Service',        icon: '✅' },
  ExhibitA: { color: '#6A1B9A', label: 'Exhibit A', action: 'Attach to Contract', icon: '📋' },
  Document: { color: '#7A8B85', label: 'Document',  action: 'Log to Activity',   icon: '📎' },
};

function fieldRow(label, value, T, mono) {
  if (!value) return null;
  return (
    <div key={label} style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid ' + T.border2 }}>
      <span style={{ fontSize: 11, color: T.td2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: 120 }}>{label}</span>
      <span style={{ fontSize: 13, color: T.ts, fontFamily: mono }}>{value}</span>
    </div>
  );
}

export default function InboxTab({ data, upd, setData, E, incomingDocs = [] }) {
  const { T, ss, mono, font } = useApp();
  const pending = data.pending || [];
  const posted  = data.postedExpenses || [];

  // ── Expense approve / reject ──────────────────────────────────────────────
  const approve = (item) => {
    const approved = { ...item, status: 'approved', approvedBy: data.userId, approvedAt: new Date().toISOString() };
    if (item.type === 'expense') {
      setData(prev => {
        const nd = {
          ...prev,
          expenses:       [...prev.expenses, approved],
          pending:        (prev.pending || []).filter(p => p.id !== item.id),
          postedExpenses: [...(prev.postedExpenses || []), approved],
          activityLog:    [{ id: uid(), ts: new Date().toISOString(), user: prev.userId, action: 'Approved expense', detail: item.desc + ' $' + item.amt }, ...(prev.activityLog || []).slice(0, 99)],
        };
        try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
        return nd;
      });
    }
  };

  const reject = (item) => {
    setData(prev => {
      const nd = {
        ...prev,
        pending:     (prev.pending || []).filter(p => p.id !== item.id),
        activityLog: [{ id: uid(), ts: new Date().toISOString(), user: prev.userId, action: 'Rejected', detail: item.desc }, ...(prev.activityLog || []).slice(0, 99)],
      };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
      return nd;
    });
  };

  // ── CSV bank import ───────────────────────────────────────────────────────
  const doCSV = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv';
    inp.onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const lines = ev.target.result.split('\n').filter(l => l.trim());
          if (lines.length < 2) { alert('CSV needs header + data rows'); return; }
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
          const dateIdx = headers.findIndex(h => h.includes('date'));
          const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('memo') || h.includes('name'));
          const amtIdx  = headers.findIndex(h => h.includes('amount') || h.includes('amt') || h.includes('total') || h.includes('debit'));
          const catIdx  = headers.findIndex(h => h.includes('cat') || h.includes('category') || h.includes('type'));
          if (descIdx === -1 || amtIdx === -1) { alert('CSV must have description and amount columns'); return; }
          const items = lines.slice(1).map(line => {
            const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
            const amt = Math.abs(parseFloat(cols[amtIdx]) || 0);
            if (amt === 0) return null;
            return { id: uid(), date: cols[dateIdx] || td(), desc: cols[descIdx] || 'Imported', amt, cat: cols[catIdx] || 'Misc', by: 'HWFS', cap: false, dep: false, life: 7, su: false, rec: false, rf: 'monthly', submittedBy: 'CSV Import', submittedAt: new Date().toISOString(), status: 'pending', type: 'expense' };
          }).filter(Boolean);
          if (items.length === 0) { alert('No valid rows found'); return; }
          setData(prev => {
            const nd = { ...prev, pending: [...(prev.pending || []), ...items] };
            try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
            return nd;
          });
          alert('Imported ' + items.length + ' items to approval queue');
        } catch (err) { alert('CSV error: ' + err.message); }
      };
      r.readAsText(f);
    };
    inp.click();
  };

  // ── Incoming document actions ─────────────────────────────────────────────
  const archiveDoc = (doc) => {
    deleteIncoming(doc.id);
    setData(prev => {
      const nd = { ...prev, activityLog: [{ id: uid(), ts: new Date().toISOString(), user: prev.userId, action: 'Archived document', detail: doc.title }, ...(prev.activityLog || []).slice(0, 99)] };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
      return nd;
    });
  };

  const convertToCRM = (doc) => {
    const f = doc.fields || {};
    const prospect = {
      id:       uid(),
      name:     f['client-name'] || f['property-name'] || doc.title,
      address:  f['property-address'] || f['client-address'] || '',
      contact:  f['client-name'] || '',
      stage:    doc.docType === 'BidSheet' ? 'Proposal' : 'Lead',
      notes:    'Imported from ' + doc.docType + ' — ' + new Date(doc.submittedAt).toLocaleDateString(),
      quote:    parseFloat((f['proposed-quote'] || '0').replace(/[$,]/g, '')) || 0,
      created:  doc.submittedAt,
    };
    setData(prev => {
      const nd = {
        ...prev,
        prospects:   [...(prev.prospects || []), prospect],
        activityLog: [{ id: uid(), ts: new Date().toISOString(), user: prev.userId, action: 'CRM lead created from ' + doc.docType, detail: prospect.name }, ...(prev.activityLog || []).slice(0, 99)],
      };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
      return nd;
    });
    deleteIncoming(doc.id);
  };

  const convertToContract = (doc) => {
    const f = doc.fields || {};
    const job = {
      id:      uid(),
      name:    f['property-name'] || f['client-name'] || doc.title,
      client:  f['client-name'] || '',
      address: f['property-address'] || '',
      start:   f['start-date'] || td(),
      end:     f['end-date'] || '',
      wkRate:  parseFloat((f['weekly-rate'] || '0').replace(/[$,]/g, '')) || 0,
      active:  true,
      pipe:    false,
      notes:   'Imported from ' + doc.docType + ' on ' + new Date(doc.submittedAt).toLocaleDateString(),
      hrsVis:  0, freq: 1, mSup: 0,
    };
    setData(prev => {
      const nd = {
        ...prev,
        jobs:        [...(prev.jobs || []), job],
        activityLog: [{ id: uid(), ts: new Date().toISOString(), user: prev.userId, action: 'Contract created from ' + doc.docType, detail: job.name }, ...(prev.activityLog || []).slice(0, 99)],
      };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
      return nd;
    });
    deleteIncoming(doc.id);
  };

  const logService = (doc) => {
    const f = doc.fields || {};
    setData(prev => {
      const nd = {
        ...prev,
        activityLog: [{
          id:     uid(),
          ts:     doc.submittedAt || new Date().toISOString(),
          user:   f['crew-lead'] || prev.userId,
          action: 'Service completed — ' + (f['service-type'] || 'Cleaning'),
          detail: (f['property-address'] || f['property-name'] || doc.title) + (f['notes'] ? ' | ' + f['notes'] : ''),
        }, ...(prev.activityLog || []).slice(0, 99)],
      };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
      return nd;
    });
    deleteIncoming(doc.id);
  };

  const logInvoice = (doc) => {
    const f = doc.fields || {};
    setData(prev => {
      const nd = {
        ...prev,
        activityLog: [{
          id:     uid(),
          ts:     new Date().toISOString(),
          user:   prev.userId,
          action: 'Invoice logged — #' + (f['invoice-number'] || '?'),
          detail: (f['client-name'] || doc.title) + ' — ' + (f['total-amount'] || ''),
        }, ...(prev.activityLog || []).slice(0, 99)],
      };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (e) { console.warn('Save failed', e); }
      return nd;
    });
    deleteIncoming(doc.id);
  };

  // ── Render incoming doc card ──────────────────────────────────────────────
  const renderDoc = (doc) => {
    const meta = DOC_META[doc.docType] || DOC_META.Document;
    const f = doc.fields || {};
    const fieldEntries = Object.entries(f).filter(([, v]) => v);

    return (
      <div key={doc.id} style={{ border: '1px solid ' + T.border, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        {/* Doc header */}
        <div style={{ background: T.bg2, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid ' + T.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{meta.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{doc.title}</div>
              <div style={{ fontSize: 11, color: T.td2, marginTop: 1 }}>
                Received {new Date(doc.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>
          <Badge status={doc.docType === 'MSA' ? 'scheduled' : doc.docType === 'Invoice' ? 'active' : doc.docType === 'CCR' ? 'complete' : 'pending'}>
            {meta.label}
          </Badge>
        </div>

        {/* Fields preview */}
        {fieldEntries.length > 0 && (
          <div style={{ padding: '12px 16px', background: T.card }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Captured Fields</div>
            {fieldEntries.slice(0, 6).map(([k, v]) =>
              fieldRow(k.replace(/-/g, ' '), v, T, mono)
            )}
            {fieldEntries.length > 6 && (
              <div style={{ fontSize: 11, color: T.td2, marginTop: 6 }}>+{fieldEntries.length - 6} more fields captured</div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ padding: '10px 16px', background: T.bg2, display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid ' + T.border }}>
          {(doc.docType === 'MSA' || doc.docType === 'BidSheet') && (
            <>
              <button style={{ ...ss.btn, padding: '6px 14px', fontSize: 12 }} onClick={() => convertToCRM(doc)}>+ Add to CRM</button>
              {doc.docType === 'MSA' && (
                <button style={{ ...ss.btnG, padding: '6px 14px', fontSize: 12 }} onClick={() => convertToContract(doc)}>+ Create Contract</button>
              )}
            </>
          )}
          {doc.docType === 'Invoice' && (
            <button style={{ ...ss.btn, padding: '6px 14px', fontSize: 12 }} onClick={() => logInvoice(doc)}>Log Invoice</button>
          )}
          {doc.docType === 'CCR' && (
            <button style={{ ...ss.btn, padding: '6px 14px', fontSize: 12 }} onClick={() => logService(doc)}>Log Service</button>
          )}
          {doc.docType === 'ExhibitA' && (
            <button style={{ ...ss.btn, padding: '6px 14px', fontSize: 12 }} onClick={() => logService(doc)}>Log to Activity</button>
          )}
          <button style={{ ...ss.btnD, padding: '6px 14px', fontSize: 12 }} onClick={() => archiveDoc(doc)}>Archive</button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Summary stats ─────────────────────────────────────────────────── */}
      <div style={ss.g3}>
        {[
          ['Incoming Docs',   incomingDocs.length,  T.purple],
          ['Expenses Pending', pending.length,        T.orange],
          ['Approved (All)',  posted.length,          T.green],
        ].map(([l, v, c], i) =>
          <div key={i} style={{ ...ss.card, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 9, color: T.td2, textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
          </div>
        )}
      </div>

      {/* ── Incoming Documents ────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}>
          <span>Incoming Documents ({incomingDocs.length})</span>
        </div>
        {incomingDocs.length === 0 ? (
          <div style={{ padding: '28px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: T.text, marginBottom: 4 }}>No documents waiting</div>
            <div style={{ fontSize: 13, color: T.td2, maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
              Open a HuronWest document in Chrome, fill it out, and click "Send to ERP" to see it here.
            </div>
          </div>
        ) : (
          incomingDocs
            .slice()
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .map(renderDoc)
        )}
      </div>

      {/* ── Expense Approval Queue ────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}>
          <span>Expense Approval Queue ({pending.length})</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={ss.btn} onClick={doCSV}>📄 Import CSV</button>
            {pending.length > 0 && <button style={{ ...ss.btn, background: T.green }} onClick={() => pending.forEach(item => approve(item))}>Approve All</button>}
          </div>
        </div>
        {pending.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: T.td2, fontSize: 13 }}>No items pending approval</div>}
        <table style={ss.tbl}>
          {pending.length > 0 && <thead><tr>{['Date', 'Description', 'Amount', 'Category', 'Submitted By', 'Time', '', ''].map((h, i) => <th key={i} style={i === 2 ? ss.thR : ss.th}>{h}</th>)}</tr></thead>}
          <tbody>
            {pending.map(item =>
              <tr key={item.id}>
                <td style={ss.td}>{item.date}</td>
                <td style={{ ...ss.td, fontWeight: 600 }}>{item.desc}</td>
                <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(item.amt)}</td>
                <td style={ss.td}><Badge>{item.cat || 'Misc'}</Badge></td>
                <td style={ss.td}>{item.submittedBy}</td>
                <td style={{ ...ss.td, fontSize: 11, color: T.td2 }}>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ''}</td>
                <td style={ss.td}><button style={{ ...ss.btn, padding: '4px 12px', fontSize: 11, background: T.green }} onClick={() => approve(item)}>✓ Approve</button></td>
                <td style={ss.td}><button style={ss.btnD} onClick={() => reject(item)}>✕</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────────*/}
      <div style={ss.card}>
        <div style={ss.ch}><span>Settings</span></div>
        <div style={ss.g3}>
          <div style={{ marginBottom: 6 }}>
            <label style={ss.lbl}>Auto-approve threshold ($)</label>
            <input type="number" style={ss.inp} value={data.approvalThreshold || 500} onChange={e => {
              const val = +e.target.value;
              setData(prev => {
                const nd = { ...prev, approvalThreshold: val };
                try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (er) { console.warn('Save failed', er); }
                return nd;
              });
            }} />
          </div>
          <div style={{ marginBottom: 6 }}>
            <label style={ss.lbl}>CSV Format Info</label>
            <div style={{ fontSize: 11, color: T.ts, padding: 8, background: T.bg2, borderRadius: 4 }}>CSV headers: date, description/memo, amount/debit, category (optional). Auto-maps common bank export formats.</div>
          </div>
        </div>
      </div>

      {/* ── Approval History ──────────────────────────────────────────────── */}
      {posted.length > 0 && (
        <div style={ss.card}>
          <div style={ss.ch}><span>Approval History ({posted.length})</span></div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table style={ss.tbl}>
              <thead><tr>{['Date', 'Description', 'Amount', 'Approved By', 'When'].map((h, i) => <th key={i} style={i === 2 ? ss.thR : ss.th}>{h}</th>)}</tr></thead>
              <tbody>
                {posted.slice().reverse().slice(0, 25).map(item =>
                  <tr key={item.id}>
                    <td style={ss.td}>{item.date}</td>
                    <td style={{ ...ss.td, fontWeight: 600 }}>{item.desc}</td>
                    <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(item.amt)}</td>
                    <td style={ss.td}><Badge c={T.green}>{item.approvedBy}</Badge></td>
                    <td style={{ ...ss.td, fontSize: 11, color: T.td2 }}>{item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : ''}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
