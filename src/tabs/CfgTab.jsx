import { useState } from 'react';
import { useApp } from '../context';
import { F } from '../components/ui';
import { SK, TIERS, TK } from '../constants';
import {
  loadFirebaseConfig, connectFirebase, subscribeFirebase, subscribeIncoming,
  subscribeMessages, subscribeVisits, clearFirebaseConfig,
} from '../firebase';

export default function CfgTab({ data, updS, updA, setData, fbStatus, setFbStatus, mergeRemote, onIncoming, onMessages, onVisits }) {
  const { T, ss } = useApp();

  const [cfgText, setCfgText] = useState(() => {
    const saved = loadFirebaseConfig();
    return saved ? JSON.stringify(saved, null, 2) : '';
  });

  const handleConnect = () => {
    try {
      const cfg = JSON.parse(cfgText.trim());
      const result = connectFirebase(cfg);
      if (result.ok) {
        setFbStatus('connected');
        subscribeFirebase(mergeRemote);
        subscribeIncoming(docs => onIncoming && onIncoming(docs));
        subscribeMessages(msgs => onMessages && onMessages(msgs));
        subscribeVisits(vs => onVisits && onVisits(vs));
      } else {
        alert('Firebase connection failed:\n' + result.error);
        setFbStatus('error');
      }
    } catch (e) {
      alert('Invalid JSON — check your config:\n' + e.message);
    }
  };

  const handleDisconnect = () => {
    clearFirebaseConfig();
    setFbStatus('idle');
    setCfgText('');
  };

  const statusColor  = fbStatus === 'connected' ? T.green : fbStatus === 'error' ? T.red : T.td2;
  const statusLabel  = fbStatus === 'connected' ? 'Live — syncing' : fbStatus === 'error' ? 'Connection error' : 'Not connected';

  return (
    <>
      <div style={ss.g2}>
        <div style={ss.card}>
          <div style={ss.ch}><span>Company</span></div>
          <F l="Name"><input style={ss.inp} value={data.S.name} onChange={e => updS("name", e.target.value)} /></F>
          <F l="Start"><input type="date" style={ss.inp} value={data.S.start} onChange={e => updS("start", e.target.value)} /></F>
          <div style={ss.g2}>
            <F l="HWE Cap"><input type="number" style={ss.inp} value={data.S.capHWE} onChange={e => updS("capHWE", +e.target.value)} /></F>
            <F l="Nico Cap"><input type="number" style={ss.inp} value={data.S.capNico} onChange={e => updS("capNico", +e.target.value)} /></F>
          </div>
          <div style={ss.g2}>
            <F l="HWE Eq %"><input type="number" step=".01" style={ss.inp} value={data.S.hweEq} onChange={e => updS("hweEq", +e.target.value)} /></F>
            <F l="Nico Eq %"><input type="number" step=".01" style={ss.inp} value={data.S.nicoEq} onChange={e => updS("nicoEq", +e.target.value)} /></F>
          </div>
        </div>

        <div style={ss.card}>
          <div style={ss.ch}><span>Tax & Finance</span></div>
          <F l="Tax Rate"><input type="number" step=".001" style={ss.inp} value={data.S.taxRate} onChange={e => updS("taxRate", +e.target.value)} /></F>
          <F l="Loan Rate"><input type="number" step=".01"  style={ss.inp} value={data.S.loanRate} onChange={e => updS("loanRate", +e.target.value)} /></F>
          <F l="Min Reserve"><input type="number" style={ss.inp} value={data.S.reserve} onChange={e => updS("reserve", +e.target.value)} /></F>
          <div style={ss.g2}>
            <F l="Bonus/Qtr"><input type="number" style={ss.inp} value={data.S.bonusQ} onChange={e => updS("bonusQ", +e.target.value)} /></F>
            <F l="Onboard $"><input type="number"  style={ss.inp} value={data.S.onboard} onChange={e => updS("onboard", +e.target.value)} /></F>
          </div>
        </div>
      </div>

      <div style={ss.g2}>
        <div style={ss.card}>
          <div style={ss.ch}><span>Nico Comp & Vesting</span></div>
          <div style={ss.g2}>
            <F l="M1-12 $/mo"><input type="number" style={ss.inp} value={data.S.nicoM1}  onChange={e => updS("nicoM1",  +e.target.value)} /></F>
            <F l="M13+ $/mo"> <input type="number" style={ss.inp} value={data.S.nicoM13} onChange={e => updS("nicoM13", +e.target.value)} /></F>
          </div>
          <F l="Start"><input type="date" style={ss.inp} value={data.S.nicoStart} onChange={e => updS("nicoStart", e.target.value)} /></F>
          <div style={ss.g3}>
            <F l="Vest %">  <input type="number" step=".01" style={ss.inp} value={data.S.nicoVestPct}  onChange={e => updS("nicoVestPct",  +e.target.value)} /></F>
            <F l="Vest Yrs"><input type="number"            style={ss.inp} value={data.S.nicoVestYrs}  onChange={e => updS("nicoVestYrs",  +e.target.value)} /></F>
            <F l="Cliff">   <input type="number"            style={ss.inp} value={data.S.nicoCliffYrs} onChange={e => updS("nicoCliffYrs", +e.target.value)} /></F>
          </div>
        </div>

        <div style={ss.card}>
          <div style={ss.ch}><span>Specialty Rates</span></div>
          <div style={ss.g2}>
            <F l="Floor $/SF">    <input type="number" step=".01" style={ss.inp} value={data.S.specFloorSF}  onChange={e => updS("specFloorSF",  +e.target.value)} /></F>
            <F l="Carpet $/SF">   <input type="number" step=".01" style={ss.inp} value={data.S.specCarpetSF} onChange={e => updS("specCarpetSF", +e.target.value)} /></F>
          </div>
          <div style={ss.g2}>
            <F l="Post-Con $/SF"> <input type="number" step=".01" style={ss.inp} value={data.S.specPostConSF}      onChange={e => updS("specPostConSF",      +e.target.value)} /></F>
            <F l="Emergency $">   <input type="number"            style={ss.inp} value={data.S.emergencyDispatch}  onChange={e => updS("emergencyDispatch",  +e.target.value)} /></F>
          </div>
          <F l="Emergency $/hr"><input type="number" style={ss.inp} value={data.S.emergencyHr} onChange={e => updS("emergencyHr", +e.target.value)} /></F>
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Operating Assumptions</span></div>
        <div style={ss.g4}>
          {[
            ["insBase","Ins Base $/mo"],["insPer100k","Ins/$100K"],["bond","Bond (ann)"],["autoIns","Auto $/van/mo"],
            ["swept","Swept $/mo"],["xero","Xero $/mo"],["phone","Phone $/mo"],["bankFees","Bank $/mo"],
            ["mktg","Mktg $/mo"],["legalAnn","Legal (ann)"],["licAnn","Lic (ann)"],["vanOp","Van Ops $/mo"],
            ["eqRef","Eq Refresh $/mo"],["conting","Contingency %"],["burden","Burden %"],["wcRate","WC %"],
            ["uniformAnn","Uni $/yr"],["trainAnn","Train $/yr"],["storage","Storage $/mo"],["salesTaxRate","Sales Tax %"],
          ].map(([k, l]) =>
            <F key={k} l={l}>
              <input type="number" step={["conting","burden","wcRate"].includes(k) ? ".001" : "1"} style={ss.inp} value={data.A[k]} onChange={e => updA(k, +e.target.value)} />
            </F>
          )}
        </div>
      </div>

      {/* ── Firebase Sync ─────────────────────────────────────────────────── */}
      <div style={ss.card}>
        <div style={ss.ch}>
          <span>🔗 Firebase Sync</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, boxShadow: fbStatus === 'connected' ? "0 0 6px " + T.green : "none" }} />
            <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: T.ts, lineHeight: 1.7, marginBottom: 12 }}>
          Paste your Firebase config to enable real-time sync between Rob and Nico on any device.<br />
          <span style={{ color: T.td2, fontSize: 11 }}>
            Firebase Console → Project Settings → Your Apps → Config object
          </span>
        </div>

        <textarea
          style={{ ...ss.inp, height: 130, resize: "vertical", fontFamily: "monospace", fontSize: 11, lineHeight: 1.5 }}
          placeholder={'{\n  "apiKey": "AIza...",\n  "authDomain": "project.firebaseapp.com",\n  "databaseURL": "https://project-default-rtdb.firebaseio.com",\n  "projectId": "project",\n  "storageBucket": "project.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}'}
          value={cfgText}
          onChange={e => setCfgText(e.target.value)}
          spellCheck={false}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <button style={ss.btn} onClick={handleConnect}>
            {fbStatus === 'connected' ? 'Reconnect' : 'Connect'}
          </button>
          {fbStatus === 'connected' && (
            <button style={ss.btnD} onClick={handleDisconnect}>Disconnect</button>
          )}
          {fbStatus === 'connected' && (
            <span style={{ fontSize: 11, color: T.green, marginLeft: 4 }}>
              ✓ Changes sync automatically to all users
            </span>
          )}
        </div>

        <div style={{ marginTop: 12, padding: "8px 10px", background: T.bg2, borderRadius: 5, fontSize: 11, color: T.td2 }}>
          <strong style={{ color: T.ts }}>Storage key:</strong> {SK} &nbsp;|&nbsp;
          <strong style={{ color: T.ts }}>Data size:</strong> {(JSON.stringify(data).length / 1024).toFixed(1)} KB &nbsp;|&nbsp;
          <strong style={{ color: T.ts }}>Version:</strong> v11.0
        </div>
      </div>

      <div style={ss.card}>
        <div style={ss.ch}><span>Tier Rates</span></div>
        <table style={ss.tbl}><tbody>
          {TK.map(k => {
            const t = TIERS[k];
            return (
              <tr key={k}>
                <td style={ss.td}><span style={ss.tag(t.color)}>{k}</span></td>
                <td style={{ ...ss.tdR, fontWeight: 700 }}>${t.rate.toFixed(2)}/SF</td>
                <td style={ss.tdR}>{(t.churn * 100).toFixed(0)}% churn</td>
              </tr>
            );
          })}
        </tbody></table>
      </div>
    </>
  );
}
