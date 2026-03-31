import { useState, useMemo } from 'react';
import { useApp } from '../context';
import { fmtF, uid } from '../utils';
import { SK } from '../constants';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LABEL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6am – 7pm

const MULTI_DAY_MAP = { "daily": [1,2,3,4,5], "5x_week": [1,2,3,4,5], "4x_week": [1,2,4,5], "3x_week": [1,3,5], "2x_week": [1,4] };
// Legacy: numeric freq → days
const AUTO_DAYS_MAP = { 5: [1,2,3,4,5], 4: [1,2,4,5], 3: [1,3,5], 2: [1,4] };

const EVENT_COLORS = ['#3A7D44', '#4f8fff', '#9070f0', '#f0c040', '#FF7043', '#42A5F5', '#ef5350', '#26a69a'];

function dateStr(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfWeek(d) { const r = new Date(d); r.setDate(r.getDate() - r.getDay()); return r; }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function sameDay(a, b) { return dateStr(a) === dateStr(b); }

export default function ScheduleTab({ data, upd, setData }) {
  const { T, ss, mono, isMobile } = useApp();
  const [view, setView] = useState('week'); // 'week' | 'month'
  const [anchor, setAnchor] = useState(new Date());
  const [showAdd, setShowAdd] = useState(null); // date string for add modal
  const [editEvt, setEditEvt] = useState(null); // event being edited
  const [form, setForm] = useState({ title: '', time: '09:00', duration: 60, color: EVENT_COLORS[0], notes: '', jobId: '' });

  const today = new Date();
  const todayStr = dateStr(today);
  const activeJobs = useMemo(() => data.jobs.filter(j => j.active && !j.pipe), [data.jobs]);
  const jobIds = useMemo(() => new Set(data.jobs.map(j => j.id)), [data.jobs]);
  // Filter out custom events whose linked job was deleted
  const events = useMemo(() => (data.calendarEvents || []).filter(e => !e.jobId || jobIds.has(e.jobId)), [data.calendarEvents, jobIds]);

  // ── Auto-generated recurring service events ──────────────────────────
  const recurringEvents = useMemo(() => {
    const result = [];
    const wStart = startOfWeek(view === 'week' ? anchor : startOfMonth(anchor));
    const range = view === 'week' ? 7 : 42;
    for (let i = 0; i < range; i++) {
      const d = addDays(wStart, i);
      const dow = d.getDay();
      const ds = dateStr(d);
      activeJobs.forEach((j, ji) => {
        const sched = j.schedule || 'weekly';
        // Derive service day-of-week from start date (for weekly/biweekly/monthly)
        const startDow = j.start ? new Date(j.start + 'T12:00:00').getDay() : 1;

        let show = false;
        if (MULTI_DAY_MAP[sched]) {
          // Multi-day schedules: daily, 2x, 3x, etc.
          show = (j.serviceDays ? j.serviceDays.map(s => DAYS_SHORT.indexOf(s)) : MULTI_DAY_MAP[sched]).includes(dow);
        } else if (sched === 'weekly') {
          show = dow === startDow;
        } else if (sched === 'biweekly') {
          if (dow === startDow && j.start) {
            const startDate = new Date(j.start + 'T12:00:00');
            const diffWeeks = Math.round((d - startDate) / (7 * 86400000));
            show = diffWeeks >= 0 && diffWeeks % 2 === 0;
          }
        } else if (sched === 'monthly') {
          const startDay = j.start ? new Date(j.start + 'T12:00:00').getDate() : 1;
          show = d.getDate() === startDay;
        } else {
          // Legacy: numeric freq without schedule field
          const autoDays = AUTO_DAYS_MAP[j.freq] || [startDow];
          show = autoDays.includes(dow);
        }

        if (show) {
          result.push({
            id: '_svc_' + j.id + '_' + ds,
            date: ds,
            title: j.name,
            time: j.serviceTime || '18:00',
            duration: (j.hrsVis || 1) * 60,
            color: EVENT_COLORS[ji % EVENT_COLORS.length],
            notes: j.client || '',
            jobId: j.id,
            auto: true,
            category: 'service',
          });
        }
      });
    }
    return result;
  }, [activeJobs, anchor, view]);

  // ── Linked events from other tabs ────────────────────────────────────
  const linkedEvents = useMemo(() => {
    const result = [];

    // CRM follow-ups
    (data.prospects || []).forEach(p => {
      if (p.followUp && p.stage !== 'Won' && p.stage !== 'Lost') {
        result.push({
          id: '_fu_' + p.id, date: p.followUp, title: 'Follow-up: ' + p.name,
          time: '09:00', duration: 30, color: '#f0c040', notes: p.stage + (p.contact ? ' · ' + p.contact : ''),
          auto: true, category: 'follow-up',
        });
      }
    });

    // Task due dates
    (data.actions || []).forEach(a => {
      if (a.due && !a.done) {
        result.push({
          id: '_task_' + a.id, date: a.due, title: a.text,
          time: '08:00', duration: 30, color: a.priority === 'Critical' ? '#ef5350' : a.priority === 'High' ? '#FF7043' : '#42A5F5',
          notes: a.priority + ' · ' + (a.assignee || ''), auto: true, category: 'task',
        });
      }
    });

    // Specialty jobs
    (data.specJobs || []).forEach(s => {
      if (s.date && !s.done) {
        result.push({
          id: '_spec_' + s.id, date: s.date, title: (s.type || 'Specialty') + ': ' + (s.client || ''),
          time: '10:00', duration: 120, color: '#9070f0', notes: s.sf ? s.sf + ' SF' : '',
          auto: true, category: 'specialty',
        });
      }
    });

    // Contract start dates (upcoming only)
    data.jobs.forEach(j => {
      if (j.start && j.start >= todayStr) {
        result.push({
          id: '_start_' + j.id, date: j.start, title: 'Contract Start: ' + j.name,
          time: '08:00', duration: 60, color: '#26a69a', notes: j.client || '',
          auto: true, category: 'start',
        });
      }
    });

    return result;
  }, [data.prospects, data.actions, data.specJobs, data.jobs, todayStr]);

  const allEvents = useMemo(() => [...recurringEvents, ...linkedEvents, ...events], [recurringEvents, linkedEvents, events]);

  const eventsForDate = (ds) => allEvents.filter(e => e.date === ds);

  // ── CRUD ─────────────────────────────────────────────────────────────
  const save = (nd) => { try { localStorage.setItem(SK, JSON.stringify(nd)); } catch {} };

  const addEvent = () => {
    if (!form.title) return;
    const evt = { ...form, id: uid(), date: showAdd, duration: +form.duration || 60 };
    setData(prev => {
      const nd = { ...prev, calendarEvents: [...(prev.calendarEvents || []), evt] };
      save(nd); return nd;
    });
    setShowAdd(null);
    setForm({ title: '', time: '09:00', duration: 60, color: EVENT_COLORS[0], notes: '', jobId: '' });
  };

  const updateEvent = () => {
    if (!editEvt || !form.title) return;
    setData(prev => {
      const nd = { ...prev, calendarEvents: (prev.calendarEvents || []).map(e => e.id === editEvt.id ? { ...e, ...form, duration: +form.duration || 60 } : e) };
      save(nd); return nd;
    });
    setEditEvt(null);
  };

  const deleteEvent = (id) => {
    setData(prev => {
      const nd = { ...prev, calendarEvents: (prev.calendarEvents || []).filter(e => e.id !== id) };
      save(nd); return nd;
    });
    setEditEvt(null);
  };

  const openAdd = (ds) => {
    setForm({ title: '', time: '09:00', duration: 60, color: EVENT_COLORS[0], notes: '', jobId: '' });
    setShowAdd(ds);
    setEditEvt(null);
  };

  const openEdit = (evt) => {
    if (evt.auto) return; // can't edit auto events
    setForm({ title: evt.title, time: evt.time, duration: evt.duration, color: evt.color, notes: evt.notes || '', jobId: evt.jobId || '' });
    setEditEvt(evt);
    setShowAdd(null);
  };

  // ── Navigation ───────────────────────────────────────────────────────
  const goToday = () => setAnchor(new Date());
  const goPrev = () => setAnchor(prev => addDays(prev, view === 'week' ? -7 : -30));
  const goNext = () => setAnchor(prev => addDays(prev, view === 'week' ? 7 : 30));

  const weekStart = startOfWeek(anchor);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(anchor);
  const monthGridStart = startOfWeek(monthStart);
  const monthDates = Array.from({ length: 42 }, (_, i) => addDays(monthGridStart, i));

  const headerLabel = view === 'week'
    ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Stats ────────────────────────────────────────────────────────────
  const weekEvents = weekDates.map(d => eventsForDate(dateStr(d)));
  const totalWeekVisits = weekEvents.reduce((s, evts) => s + evts.length, 0);

  // ── Styles ───────────────────────────────────────────────────────────
  const navBtn = { background: "transparent", border: "1px solid " + T.border, borderRadius: 4, color: T.ts, fontSize: 16, cursor: "pointer", padding: "4px 12px", fontFamily: "inherit" };
  const viewBtn = (active) => ({ background: active ? T.accent : "transparent", border: "1px solid " + (active ? T.accent : T.border), borderRadius: 4, color: active ? "#fff" : T.ts, fontSize: 12, cursor: "pointer", padding: "6px 14px", fontWeight: active ? 700 : 500, fontFamily: "inherit", transition: "all .15s" });

  // ── Event pill renderer ──────────────────────────────────────────────
  const EventPill = ({ evt, compact }) => (
    <div
      onClick={(e) => { e.stopPropagation(); openEdit(evt); }}
      style={{
        background: evt.color + "22", borderLeft: "3px solid " + evt.color,
        borderRadius: 3, padding: compact ? "2px 6px" : "4px 8px",
        marginBottom: 2, cursor: evt.auto ? "default" : "pointer",
        fontSize: compact ? 10 : 11, color: T.text, lineHeight: 1.3,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}
      title={evt.title + (evt.notes ? '\n' + evt.notes : '')}
    >
      {!compact && <span style={{ fontWeight: 600, marginRight: 4, color: evt.color, fontSize: 10 }}>{evt.time}</span>}
      <span style={{ fontWeight: 600 }}>{evt.title}</span>
      {evt.category && <span style={{ fontSize: 8, color: T.td2, marginLeft: 4, textTransform: "uppercase" }}>{evt.category === 'service' ? '' : evt.category}</span>}
    </div>
  );

  // ── Modal ────────────────────────────────────────────────────────────
  const modalOpen = showAdd || editEvt;
  const modalTitle = editEvt ? 'Edit Event' : 'New Event';
  const modalDate = editEvt ? editEvt.date : showAdd;
  const modalSubmit = editEvt ? updateEvent : addEvent;

  return (
    <>
      {/* ── Summary + Nav ──────────────────────────────────────────── */}
      <div style={{ ...ss.card, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goPrev} style={navBtn}>‹</button>
          <button onClick={goToday} style={{ ...navBtn, fontSize: 12, fontWeight: 600 }}>Today</button>
          <button onClick={goNext} style={navBtn}>›</button>
          <span style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: T.text, marginLeft: 8 }}>{headerLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: T.td2, marginRight: 8 }}>{totalWeekVisits} events this week</span>
          <button onClick={() => setView('week')} style={viewBtn(view === 'week')}>Week</button>
          <button onClick={() => setView('month')} style={viewBtn(view === 'month')}>Month</button>
        </div>
      </div>

      {/* ── WEEK VIEW ──────────────────────────────────────────────── */}
      {view === 'week' && (
        <div style={ss.card}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "60px repeat(7, 1fr)", gap: 0, borderTop: "1px solid " + T.border }}>
            {/* Header row */}
            {!isMobile && <div style={{ borderBottom: "1px solid " + T.border, borderRight: "1px solid " + T.border, padding: 6 }} />}
            {weekDates.map((d, i) => {
              const isToday = sameDay(d, today);
              const ds = dateStr(d);
              const dayEvts = eventsForDate(ds);
              return isMobile ? (
                /* ── Mobile: stacked day cards ── */
                <div key={i} style={{ borderBottom: "1px solid " + T.border, padding: 12, background: isToday ? T.accent + "0c" : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isToday ? T.accent : T.ts }}>{DAYS_LABEL[d.getDay()]}</span>
                      <span style={{ fontSize: 12, color: T.td2, marginLeft: 8 }}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      {isToday && <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, marginLeft: 6, textTransform: "uppercase" }}>Today</span>}
                    </div>
                    <button onClick={() => openAdd(ds)} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 4, fontSize: 18, width: 28, height: 28, cursor: "pointer", lineHeight: 1 }}>+</button>
                  </div>
                  {dayEvts.length === 0
                    ? <div style={{ fontSize: 11, color: T.td2, fontStyle: "italic" }}>No events</div>
                    : dayEvts.sort((a, b) => a.time.localeCompare(b.time)).map(evt => <EventPill key={evt.id} evt={evt} />)
                  }
                </div>
              ) : (
                /* ── Desktop: column header ── */
                <div key={i} style={{ borderBottom: "1px solid " + T.border, borderRight: i < 6 ? "1px solid " + T.border : "none", padding: "8px 6px", textAlign: "center", background: isToday ? T.accent + "0c" : "transparent" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? T.accent : T.td2, textTransform: "uppercase" }}>{DAYS_SHORT[d.getDay()]}</div>
                  <div style={{ fontSize: 18, fontWeight: isToday ? 800 : 500, color: isToday ? T.accent : T.text, fontFamily: mono }}>{d.getDate()}</div>
                </div>
              );
            })}

            {/* Desktop time grid */}
            {!isMobile && HOURS.map(hr => (
              <div key={hr} style={{ display: "contents" }}>
                <div style={{ borderRight: "1px solid " + T.border, borderBottom: "1px solid " + T.border + "60", padding: "4px 6px", fontSize: 10, color: T.td2, textAlign: "right", fontFamily: mono }}>
                  {hr > 12 ? (hr - 12) + 'p' : hr + 'a'}
                </div>
                {weekDates.map((d, i) => {
                  const ds = dateStr(d);
                  const hourEvts = eventsForDate(ds).filter(e => {
                    const h = parseInt(e.time?.split(':')[0] || '0');
                    return h === hr;
                  });
                  const isToday = sameDay(d, today);
                  return (
                    <div
                      key={i}
                      onClick={() => { setForm(f => ({ ...f, time: String(hr).padStart(2, '0') + ':00' })); openAdd(ds); }}
                      style={{
                        borderBottom: "1px solid " + T.border + "60",
                        borderRight: i < 6 ? "1px solid " + T.border + "40" : "none",
                        minHeight: 40, padding: "2px 3px", cursor: "pointer",
                        background: isToday ? T.accent + "06" : "transparent",
                        transition: "background .1s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.accent + "10"}
                      onMouseLeave={e => e.currentTarget.style.background = isToday ? T.accent + "06" : "transparent"}
                    >
                      {hourEvts.map(evt => <EventPill key={evt.id} evt={evt} />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MONTH VIEW ─────────────────────────────────────────────── */}
      {view === 'month' && (
        <div style={ss.card}>
          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0, borderBottom: "1px solid " + T.border }}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{ padding: "8px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: T.td2, textTransform: "uppercase" }}>{isMobile ? d[0] : d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
            {monthDates.map((d, i) => {
              const ds = dateStr(d);
              const isCurrentMonth = d.getMonth() === anchor.getMonth();
              const isToday = sameDay(d, today);
              const dayEvts = eventsForDate(ds);
              return (
                <div
                  key={i}
                  onClick={() => openAdd(ds)}
                  style={{
                    minHeight: isMobile ? 52 : 90, padding: isMobile ? 3 : 6,
                    borderBottom: "1px solid " + T.border + "60",
                    borderRight: (i % 7) < 6 ? "1px solid " + T.border + "40" : "none",
                    background: isToday ? T.accent + "0c" : !isCurrentMonth ? T.bg2 : "transparent",
                    cursor: "pointer", transition: "background .1s",
                    opacity: isCurrentMonth ? 1 : 0.4,
                  }}
                  onMouseEnter={e => { if (isCurrentMonth) e.currentTarget.style.background = T.accent + "10"; }}
                  onMouseLeave={e => e.currentTarget.style.background = isToday ? T.accent + "0c" : !isCurrentMonth ? T.bg2 : "transparent"}
                >
                  <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: isToday ? 800 : 500, color: isToday ? T.accent : T.text, fontFamily: mono, marginBottom: 2 }}>
                    {d.getDate()}
                  </div>
                  {dayEvts.slice(0, isMobile ? 2 : 3).map(evt => <EventPill key={evt.id} evt={evt} compact />)}
                  {dayEvts.length > (isMobile ? 2 : 3) && (
                    <div style={{ fontSize: 9, color: T.td2, fontWeight: 600, paddingLeft: 6 }}>+{dayEvts.length - (isMobile ? 2 : 3)} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Upcoming today / this week ──────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}><span>Today's Schedule — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span></div>
        {(() => {
          const todayEvts = eventsForDate(todayStr).sort((a, b) => a.time.localeCompare(b.time));
          if (!todayEvts.length) return <div style={{ padding: "16px 0", textAlign: "center", color: T.td2, fontSize: 13 }}>No events scheduled for today.</div>;
          return todayEvts.map(evt => (
            <div key={evt.id} onClick={() => openEdit(evt)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + T.border, cursor: evt.auto ? "default" : "pointer" }}>
              <div style={{ width: 4, height: 36, borderRadius: 2, background: evt.color, flexShrink: 0 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: evt.color, fontFamily: mono, width: 50, flexShrink: 0 }}>{evt.time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{evt.title}</div>
                {evt.notes && <div style={{ fontSize: 11, color: T.td2 }}>{evt.notes}</div>}
              </div>
              <div style={{ fontSize: 11, color: T.td2 }}>{evt.duration}min</div>
              {evt.category && <span style={{ fontSize: 9, color: evt.color, background: evt.color + "18", padding: "2px 6px", borderRadius: 8, fontWeight: 600, textTransform: "uppercase" }}>{evt.category}</span>}
            </div>
          ));
        })()}
      </div>

      {/* ── Add / Edit Modal ───────────────────────────────────────── */}
      {modalOpen && (
        <>
          <div onClick={() => { setShowAdd(null); setEditEvt(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            background: T.card, border: "1px solid " + T.border, borderRadius: 8,
            padding: isMobile ? 20 : 28, width: isMobile ? "92vw" : 420, maxHeight: "90vh", overflowY: "auto",
            zIndex: 501, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{modalTitle}</div>
                <div style={{ fontSize: 12, color: T.td2 }}>{modalDate && new Date(modalDate + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
              <button onClick={() => { setShowAdd(null); setEditEvt(null); }} style={{ background: "none", border: "none", color: T.td2, fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={ss.lbl}>Title</label>
              <input style={ss.inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Site walkthrough, Supply pickup" autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={ss.lbl}>Time</label>
                <input type="time" style={ss.inp} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <label style={ss.lbl}>Duration (min)</label>
                <input type="number" style={ss.inp} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={ss.lbl}>Link to Contract (optional)</label>
              <select style={ss.sel} value={form.jobId} onChange={e => setForm(f => ({ ...f, jobId: e.target.value }))}>
                <option value="">— None —</option>
                {activeJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={ss.lbl}>Color</label>
              <div style={{ display: "flex", gap: 6 }}>
                {EVENT_COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                      border: form.color === c ? "3px solid " + T.text : "3px solid transparent",
                      transition: "border .15s",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={ss.lbl}>Notes</label>
              <textarea style={{ ...ss.inp, minHeight: 60, resize: "vertical" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional details…" />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={modalSubmit} style={{ ...ss.btn, flex: 1 }}>{editEvt ? 'Save Changes' : 'Add Event'}</button>
              {editEvt && (
                <button onClick={() => deleteEvent(editEvt.id)} style={{ ...ss.btnD }}>Delete</button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
