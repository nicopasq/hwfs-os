import { useState, useEffect } from 'react';
import HexLogo from './HexLogo';
import { font } from '../constants';

export default function StartupScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  const [userId, setUserId] = useState("Director");

  // Auto-advance to "press any key" after splash
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 2400);
    return () => clearTimeout(t);
  }, []);

  // Any key/click advances to login
  useEffect(() => {
    if (phase !== 1) return;
    const h = () => setPhase(2);
    window.addEventListener("keydown", h);
    window.addEventListener("click", h);
    return () => { window.removeEventListener("keydown", h); window.removeEventListener("click", h); };
  }, [phase]);

  // Startup chime
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(523.25, ctx.currentTime);
      o.frequency.setValueAtTime(659.25, ctx.currentTime + .15);
      o.frequency.setValueAtTime(783.99, ctx.currentTime + .3);
      g.gain.setValueAtTime(.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 1.2);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 1.2);
    } catch (e) { /* audio not available */ }
  }, []);

  if (phase === 0) return (
    <div style={{ position: "fixed", inset: 0, background: "#040608", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ animation: "fadeIn 1.5s ease-in" }}><HexLogo size={80} /></div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#f0f4fa", fontFamily: font, letterSpacing: 6, marginTop: 20, animation: "fadeIn 2s ease-in", textTransform: "uppercase" }}>HuronWest</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#586880", fontFamily: font, letterSpacing: 8, marginTop: 6, animation: "fadeIn 2.5s ease-in", textTransform: "uppercase" }}>Facility Services</div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  if (phase === 1) return (
    <div style={{ position: "fixed", inset: 0, background: "#040608", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer" }}>
      <HexLogo size={64} />
      <div style={{ fontSize: 15, color: "#586880", fontFamily: font, letterSpacing: 3, marginTop: 24, animation: "blink 1.5s infinite" }}>PRESS ANY KEY TO CONTINUE</div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#040608ee", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: "#111824", border: "1px solid #2a3650", borderRadius: 12, padding: 40, width: 400, textAlign: "center", boxShadow: "0 20px 60px #00000080" }}>
        <HexLogo size={56} />
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f4fa", fontFamily: font, letterSpacing: 3, marginTop: 12 }}>HWFS OS</div>
        <div style={{ fontSize: 11, color: "#586880", fontFamily: font, marginBottom: 6 }}>v11.0 — Financial Operating System</div>
        <div style={{ fontSize: 10, color: "#4f8fff", fontFamily: font, marginBottom: 24, letterSpacing: 1 }}>HuronWest Facility Services LLC</div>
        <div style={{ textAlign: "left", marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: "#586880", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block", fontFamily: font }}>User ID</label>
          <input
            style={{ width: "100%", padding: "12px 16px", background: "#0e1420", border: "1px solid #243040", borderRadius: 6, color: "#f0f4fa", fontSize: 14, fontFamily: font, outline: "none", boxSizing: "border-box" }}
            value={userId}
            onChange={e => setUserId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onDone(userId)}
            autoFocus
          />
        </div>
        <button onClick={() => onDone(userId)} style={{ width: "100%", padding: "12px", background: "#4f8fff", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, letterSpacing: 1 }}>SIGN IN</button>
        <div style={{ fontSize: 9, color: "#3a4560", marginTop: 20, fontFamily: font }}>© 2026 HuronWest Enterprises LLC</div>
      </div>
    </div>
  );
}
