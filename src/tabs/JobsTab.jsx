import { useState } from 'react';
import { useApp } from '../context';
import { fmtF, pct, uid, td } from '../utils';
import { F, Tog, Badge } from '../components/ui';
import { TIERS, TK, SK } from '../constants';
import { publishPortal, isConnected } from '../firebase';

const DF = { name: "", client: "Thomson AAM", type: "Small Condo", tier: "Basic", sf: "", freq: 1, wkRate: "", hrsVis: "", mSup: 65, start: td(), active: true, pipe: false };

const PORTAL_BASE = window.location.origin + "/portal.html";
const WORKER_BASE = window.location.origin + "/worker.html";

export default function JobsTab({ data, upd, setData, E, visits = [] }) {
  const { T, ss, mono, font } = useApp();
  const [f, setF]         = useState(DF);
  const [expanded, setExpanded] = useState(null);
  const [copied,   setCopied]   = useState(null);
  const [copiedW,  setCopiedW]  = useState(null);
  const [publishing, setPublishing] = useState(null);

  const save = nd => { try { localStorage.setItem(SK, JSON.stringify(nd)); } catch(e) { console.warn(e); } };

  const ap = (sf, freq, tier) => { const r = TIERS[tier]?.rate || .10; return sf ? Math.round(+sf * r * (+freq || 1)) : ""; };

  const add = () => {
    if (!f.name || !f.wkRate) return;
    upd("jobs", [...data.jobs, { ...f, id: uid(), sf: +f.sf, wkRate: +f.wkRate, freq: +f.freq, hrsVis: +f.hrsVis, mSup: +f.mSup }]);
    setF(DF);
  };

  const rm = id => upd("jobs", data.jobs.filter(j => j.id !== id));

  const updJ = (id, patch) => {
    setData(prev => {
      const nd = { ...prev, jobs: prev.jobs.map(j => j.id === id ? { ...j, ...patch } : j) };
      save(nd);
      return nd;
    });
  };

  const buildLink = (base, jobId) => {
    let url = base + "?job=" + jobId;
    try {
      const raw = localStorage.getItem('hwfs-fb-config');
      if (raw) url += "&cfg=" + btoa(raw);
    } catch(e) {}
    return url;
  };

  const copyLink = (j) => {
    navigator.clipboard.writeText(buildLink(PORTAL_BASE, j.id)).then(() => {
      setCopied(j.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const copyWorkerLink = (j) => {
    navigator.clipboard.writeText(buildLink(WORKER_BASE, j.id)).then(() => {
      setCopiedW(j.id);
      setTimeout(() => setCopiedW(null), 2000);
    });
  };

  const publish = async (j) => {
    if (!isConnected()) { alert("Connect Firebase in Settings first."); return; }
    setPublishing(j.id);
    const portalData = {
      id:           j.id,
      propertyName: j.name,
      client:       j.client,
      tier:         j.tier,
      sf:           j.sf,
      freq:         j.freq,
      wkRate:       j.wkRate,
      start:        j.start,
      crewLead:     j.crewLead     || "",
      crewPhone:    j.crewPhone    || "",
      crewEmail:    j.crewEmail    || "",
      nextService:  j.nextService  || "",
      billingNotes: j.billingNotes || "",
      clientNotes:  j.clientNotes  || "",
      photos:       (j.photos || "").split("\n").map(u => u.trim()).filter(Boolean),
      portalEnabled: j.portalEnabled !== false,
      publishedAt:  new Date().toISOString(),
    };
    try {
      await publishPortal(j.id, portalData);
      updJ(j.id, { publishedAt: portalData.publishedAt });
      alert("Portal published! Share this link:\n" + PORTAL_BASE + "?job=" + j.id);
    } catch(e) {
      alert("Publish failed: " + e.message);
    }
    setPublishing(null);
  };

  return (
    <>
      {/* ── Add contract ──────────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Contract</span><span style={{ fontSize: 10, color: T.td2 }}>Auto: SF × tier × freq</span></div>
        <div style={ss.g5}>
          <F l="Property"><input style={ss.inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></F>
          <F l="Client">
            <select style={ss.sel} value={f.client} onChange={e => setF({ ...f, client: e.target.value })}>
              {["Thomson AAM", "McKinley", "Oxford", "Wickfield", "Baker Street", "Direct"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Tier">
            <select style={ss.sel} value={f.tier} onChange={e => { const t = e.target.value; setF({ ...f, tier: t, wkRate: ap(f.sf, f.freq, t) || f.wkRate }); }}>
              {TK.map(t => <option key={t}>{t}</option>)}
            </select>
          </F>
          <F l="SF"><input type="number" style={ss.inp} value={f.sf} onChange={e => setF({ ...f, sf: e.target.value, wkRate: ap(e.target.value, f.freq, f.tier) || f.wkRate })} /></F>
          <F l="$/wk"><input type="number" style={ss.inp} value={f.wkRate} onChange={e => setF({ ...f, wkRate: e.target.value })} /></F>
        </div>
        <div style={ss.g5}>
          <F l="Freq/wk"><input type="number" style={ss.inp} value={f.freq} onChange={e => setF({ ...f, freq: e.target.value })} /></F>
          <F l="Hrs/visit"><input type="number" step=".5" style={ss.inp} value={f.hrsVis} onChange={e => setF({ ...f, hrsVis: e.target.value })} /></F>
          <F l="Supply $/mo"><input type="number" style={ss.inp} value={f.mSup} onChange={e => setF({ ...f, mSup: e.target.value })} /></F>
          <F l="Start"><input type="date" style={ss.inp} value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></F>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <F l="Active"><Tog v={f.active} onChange={v => setF({ ...f, active: v })} /></F>
            <F l="Pipe"><Tog v={f.pipe} onChange={v => setF({ ...f, pipe: v })} /></F>
            <button style={ss.btn} onClick={add}>+ Add</button>
          </div>
        </div>
      </div>

      {/* ── Contracts table ───────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>Contracts ({data.jobs.length})</span></div>
        <div style={{ overflowX: "auto" }}>
          <table style={ss.tbl}>
            <thead>
              <tr>{["Property", "Client", "Tier", "SF", "Freq", "$/wk", "$/SF/yr", "Margin", "Status", "Portal", ""].map((h, i) =>
                <th key={i} style={[3, 5, 6, 7].includes(i) ? ss.thR : ss.th}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {data.jobs.map(j => {
                const yr    = (+j.wkRate || 0) * 52;
                const psfyr = j.sf ? yr / j.sf : 0;
                const hrs   = (+j.freq || 0) * (+j.hrsVis || 0);
                const lc    = hrs * 18 * 1.17;
                const sw    = (+j.mSup || 0) / 4.33;
                const gp    = (+j.wkRate || 0) - lc - sw;
                const gm    = (+j.wkRate || 0) > 0 ? gp / (+j.wkRate || 1) : 0;
                const tc    = TIERS[j.tier] || {};
                const isExp = expanded === j.id;

                return (
                  <>
                    <tr key={j.id} style={{ opacity: j.pipe ? .6 : 1, cursor: "pointer" }}
                      onClick={() => setExpanded(isExp ? null : j.id)}
                      onMouseEnter={e => e.currentTarget.style.background = T.mintPale}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...ss.td, fontWeight: 600 }}>
                        <span style={{ fontSize: 10, color: T.td2, marginRight: 6 }}>{isExp ? "▾" : "▸"}</span>{j.name}
                      </td>
                      <td style={ss.td}>{j.client}</td>
                      <td style={ss.td}><Badge c={tc.color || T.accent}>{j.tier || "Basic"}</Badge></td>
                      <td style={ss.tdR}>{j.sf ? j.sf.toLocaleString() : ""}</td>
                      <td style={ss.td}>{j.freq}x</td>
                      <td style={{ ...ss.tdR, fontWeight: 700 }}>{fmtF(j.wkRate)}</td>
                      <td style={ss.tdR}>{psfyr ? ("$" + psfyr.toFixed(2)) : ""}</td>
                      <td style={{ ...ss.tdR, fontWeight: 600, color: gm > .6 ? T.green : gm > .4 ? T.yellow : T.red }}>{pct(gm)}</td>
                      <td style={ss.td}>
                        {j.pipe ? <Badge c={T.purple}>PIPE</Badge> : j.active ? <Badge c={T.green}>ACTIVE</Badge> : <Badge c={T.red}>OFF</Badge>}
                      </td>
                      <td style={ss.td} onClick={e => e.stopPropagation()}>
                        {j.publishedAt
                          ? <Badge status="active">Live</Badge>
                          : <span style={{ fontSize: 11, color: T.td2 }}>—</span>
                        }
                      </td>
                      <td style={ss.td} onClick={e => e.stopPropagation()}>
                        <button style={ss.btnD} onClick={() => rm(j.id)}>✕</button>
                      </td>
                    </tr>

                    {/* ── Portal settings panel ── */}
                    {isExp && (
                      <tr key={j.id + "-portal"}>
                        <td colSpan={11} style={{ padding: 0, background: T.bg2, borderBottom: "2px solid " + T.border }}>
                          <div style={{ padding: "20px 24px" }}>

                            {/* Section header */}
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span>Client Portal Settings — {j.name}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, color: T.ts }}>Portal enabled</span>
                                <Tog v={j.portalEnabled !== false} onChange={v => updJ(j.id, { portalEnabled: v })} />
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                              {/* Crew info */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Crew Contact</div>
                                <F l="Crew Lead Name">
                                  <input style={ss.inp} value={j.crewLead || ""} onChange={e => updJ(j.id, { crewLead: e.target.value })} placeholder="e.g. Maria S." />
                                </F>
                                <F l="Phone">
                                  <input style={ss.inp} value={j.crewPhone || ""} onChange={e => updJ(j.id, { crewPhone: e.target.value })} placeholder="734-555-0123" />
                                </F>
                                <F l="Email">
                                  <input style={ss.inp} value={j.crewEmail || ""} onChange={e => updJ(j.id, { crewEmail: e.target.value })} placeholder="crew@huronwest.com" />
                                </F>
                              </div>

                              {/* Schedule */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Schedule & Billing</div>
                                <F l="Next Service Date">
                                  <input type="date" style={ss.inp} value={j.nextService || ""} onChange={e => updJ(j.id, { nextService: e.target.value })} />
                                </F>
                                <F l="Billing Notes (shown to client)">
                                  <input style={ss.inp} value={j.billingNotes || ""} onChange={e => updJ(j.id, { billingNotes: e.target.value })} placeholder="e.g. Net 30, invoiced 1st of month" />
                                </F>
                                <F l="Client-Visible Notes">
                                  <input style={ss.inp} value={j.clientNotes || ""} onChange={e => updJ(j.id, { clientNotes: e.target.value })} placeholder="e.g. Use side entrance, call on arrival" />
                                </F>
                              </div>

                              {/* Photos */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Service Photos</div>
                                <F l="Photo URLs (one per line)">
                                  <textarea
                                    style={{ ...ss.inp, height: 108, resize: "vertical", fontFamily: mono, fontSize: 11 }}
                                    value={j.photos || ""}
                                    onChange={e => updJ(j.id, { photos: e.target.value })}
                                    placeholder={"https://drive.google.com/...\nhttps://icloud.com/photos/..."}
                                  />
                                </F>
                                <div style={{ fontSize: 11, color: T.td2, marginTop: -8 }}>Paste direct image links from Google Drive, iCloud, Dropbox, etc.</div>
                              </div>
                            </div>

                            {/* Portal link & publish */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: "1px solid " + T.border, flexWrap: "wrap" }}>
                              <div style={{ flex: 1, minWidth: 180, background: T.card, border: "1px solid " + T.border, borderRadius: 4, padding: "8px 12px", fontFamily: mono, fontSize: 11, color: T.ts, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {PORTAL_BASE}?job={j.id}
                              </div>
                              <button style={{ ...ss.btnG, padding: "9px 16px", fontSize: 12, whiteSpace: "nowrap" }} onClick={() => copyLink(j)}>
                                {copied === j.id ? "✓ Copied!" : "📋 Client Link"}
                              </button>
                              <button style={{ ...ss.btnG, padding: "9px 16px", fontSize: 12, whiteSpace: "nowrap" }} onClick={() => copyWorkerLink(j)}>
                                {copiedW === j.id ? "✓ Copied!" : "📷 Worker Link"}
                              </button>
                              <button
                                style={{ ...ss.btn, padding: "9px 20px", fontSize: 12, whiteSpace: "nowrap", opacity: publishing === j.id ? .6 : 1 }}
                                onClick={() => publish(j)}
                                disabled={publishing === j.id}
                              >
                                {publishing === j.id ? "Publishing…" : j.publishedAt ? "↺ Re-publish" : "⇪ Publish Portal"}
                              </button>
                              {j.publishedAt && (
                                <span style={{ fontSize: 11, color: T.td2, whiteSpace: "nowrap" }}>Last published {new Date(j.publishedAt).toLocaleDateString()}</span>
                              )}
                            </div>

                            {/* Visit history */}
                            {(() => {
                              const jVisits = visits.filter(v => v.jobId === j.id);
                              return jVisits.length > 0 ? (
                                <div style={{ paddingTop: 18, marginTop: 6, borderTop: "1px solid " + T.border }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>
                                    Recent Visits ({jVisits.length})
                                  </div>
                                  {jVisits.slice(0, 5).map(v => (
                                    <div key={v.id} style={{ display: "flex", gap: 14, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid " + T.border2 }}>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{new Date(v.ts).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}</span>
                                          <span style={{ fontSize: 11, color: T.td2 }}>{v.crewLead} · {v.photoCount || (v.photos||[]).length} photos</span>
                                        </div>
                                        {v.note && <div style={{ fontSize: 12, color: T.ts, lineHeight: 1.5, marginBottom: 6 }}>{v.note}</div>}
                                        {(v.photos||[]).length > 0 && (
                                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                            {(v.photos||[]).slice(0,6).map((url, i) => (
                                              <img key={i} src={url} style={{ width: 56, height: 56, borderRadius: 4, objectFit: "cover", cursor: "pointer", border: "1px solid " + T.border }} onClick={() => window.open(url, "_blank")} />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
