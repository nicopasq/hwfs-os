import { useState } from 'react';
import { useApp } from '../context';
import { uid, td } from '../utils';
import { F, Tog, Badge } from '../components/ui';
import { SK } from '../constants';

export default function ActTab({ data, upd, setData }) {
  const { T, ss } = useApp();
  const [f, setF] = useState({ text: "", priority: "Medium", due: "", assignee: "Rob" });

  const add = () => { if (!f.text) return; upd("actions", [...data.actions, { ...f, id: uid(), done: false, created: td() }]); setF({ ...f, text: "", due: "" }); };
  const rm  = id => upd("actions", data.actions.filter(a => a.id !== id));
  const tog = id => upd("actions", data.actions.map(a => a.id === id ? { ...a, done: !a.done } : a));

  const updField = (aid, field, value) => {
    setData(prev => {
      const nd = { ...prev, actions: prev.actions.map(x => x.id === aid ? { ...x, [field]: value } : x) };
      try { localStorage.setItem(SK, JSON.stringify(nd)); } catch (er) { console.warn("Save failed", er); }
      return nd;
    });
  };

  const open = data.actions.filter(a => !a.done);
  const done = data.actions.filter(a => a.done);

  return (
    <>
      <div style={ss.card}>
        <div style={ss.ch}><span>+ Task</span></div>
        <div style={ss.g4}>
          <F l="Task"><input style={ss.inp} value={f.text} onChange={e => setF({ ...f, text: e.target.value })} onKeyDown={e => e.key === "Enter" && add()} /></F>
          <F l="Priority">
            <select style={ss.sel} value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>
              {["Critical", "High", "Medium", "Low"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F l="Due"><input type="date" style={ss.inp} value={f.due} onChange={e => setF({ ...f, due: e.target.value })} /></F>
          <F l="Who">
            <select style={ss.sel} value={f.assignee} onChange={e => setF({ ...f, assignee: e.target.value })}>
              {["Rob", "Nico", "Both"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
        </div>
        <button style={ss.btn} onClick={add}>+ Add</button>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Open ({open.length})</span></div>
        <table style={ss.tbl}>
          <thead><tr>{["✓", "Task", "Priority", "Due", "Who", ""].map((h, i) => <th key={i} style={ss.th}>{h}</th>)}</tr></thead>
          <tbody>
            {open.map(a =>
              <tr key={a.id}>
                <td style={ss.td}><Tog v={a.done} onChange={() => tog(a.id)} /></td>
                <td style={ss.td}>
                  <input style={{ ...ss.inp, padding: "2px 4px", fontSize: 11, fontWeight: 600 }} value={a.text || ""}
                    onChange={ev => updField(a.id, "text", ev.target.value)} />
                </td>
                <td style={ss.td}>
                  <select style={{ ...ss.sel, padding: "2px 4px", fontSize: 10 }} value={a.priority}
                    onChange={ev => updField(a.id, "priority", ev.target.value)}>
                    {["Critical", "High", "Medium", "Low"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </td>
                <td style={ss.td}>
                  <input type="date" style={{ ...ss.inp, padding: "2px 4px", fontSize: 10 }} value={a.due || ""}
                    onChange={ev => updField(a.id, "due", ev.target.value)} />
                </td>
                <td style={ss.td}>
                  <select style={{ ...ss.sel, padding: "2px 4px", fontSize: 10 }} value={a.assignee || "Rob"}
                    onChange={ev => updField(a.id, "assignee", ev.target.value)}>
                    {["Rob", "Nico", "Both"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </td>
                <td style={ss.td}><button style={ss.btnD} onClick={() => rm(a.id)}>✕</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {done.length > 0 && (
        <div style={ss.card}>
          <div style={ss.ch}><span>Done ({done.length})</span></div>
          <table style={ss.tbl}><tbody>
            {done.map(a =>
              <tr key={a.id} style={{ opacity: .4 }}>
                <td style={ss.td}><Tog v={a.done} onChange={() => tog(a.id)} /></td>
                <td style={{ ...ss.td, textDecoration: "line-through" }}>{a.text}</td>
                <td style={ss.td}>{a.due}</td>
                <td style={ss.td}>{a.assignee}</td>
                <td style={ss.td}><button style={ss.btnD} onClick={() => rm(a.id)}>✕</button></td>
              </tr>
            )}
          </tbody></table>
        </div>
      )}
    </>
  );
}
