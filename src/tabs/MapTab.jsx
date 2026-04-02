import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context';
import { fmtF } from '../utils';

// ── Geocode an address using Nominatim (free OSM service) ────────────────────
const geocodeCache = {};
async function geocode(address) {
  if (!address) return null;
  if (geocodeCache[address]) return geocodeCache[address];
  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ q: address, format: "json", limit: "1" }),
      { headers: { "User-Agent": "HuronWestERP/1.0" } }
    );
    const data = await r.json();
    if (data && data[0]) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[address] = coords;
      return coords;
    }
  } catch (e) { console.warn("Geocode failed:", address, e); }
  return null;
}

// ── Custom green pin SVG ─────────────────────────────────────────────────────
function createPinIcon(L) {
  return L.divIcon({
    className: "",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
    html: `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#3A7D44"/>
      <path d="M16 2C8.27 2 2 8.27 2 16c0 10.5 14 24.5 14 24.5S30 26.5 30 16C30 8.27 23.73 2 16 2z" fill="#4CAF50"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <circle cx="16" cy="16" r="4" fill="#3A7D44"/>
    </svg>`,
  });
}

export default function MapTab({ data, upd }) {
  const { T, ss, mono, font, nav } = useApp();
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [pins, setPins]       = useState([]);
  const [leaflet, setLeaflet] = useState(null);

  const jobs = (data.jobs || []).filter(j => j.active && !j.pipe);

  // Load Leaflet dynamically
  useEffect(() => {
    let cancelled = false;
    async function loadLeaflet() {
      // Add Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      try {
        const L = await import("leaflet");
        if (!cancelled) setLeaflet(L.default || L);
      } catch (e) {
        console.warn("Failed to load Leaflet:", e);
      }
    }
    loadLeaflet();
    return () => { cancelled = true; };
  }, []);

  // Geocode all jobs
  useEffect(() => {
    let cancelled = false;
    async function doGeocode() {
      setLoading(true);
      const results = [];
      for (const j of jobs) {
        // Try stored coordinates first
        if (j.lat && j.lng) {
          results.push({ job: j, lat: j.lat, lng: j.lng });
          continue;
        }
        // Try geocoding the address fields
        const addr = j.address || j.name || "";
        if (!addr) continue;
        const coords = await geocode(addr + ", Michigan");
        if (coords && !cancelled) {
          results.push({ job: j, ...coords });
          // Cache coordinates on the job
          if (upd) {
            const updated = (data.jobs || []).map(jj =>
              jj.id === j.id ? { ...jj, lat: coords.lat, lng: coords.lng } : jj
            );
            // Don't call upd here to avoid infinite loop — just cache in memory
            geocodeCache[j.id] = coords;
          }
        }
        // Rate limit: 1 request per second for Nominatim
        await new Promise(r => setTimeout(r, 1100));
      }
      if (!cancelled) {
        setPins(results);
        setLoading(false);
      }
    }
    doGeocode();
    return () => { cancelled = true; };
  }, [jobs.length]);

  // Initialize / update map
  useEffect(() => {
    const L = leaflet;
    if (!L || !mapRef.current) return;

    // Create map if not exists
    if (!mapInst.current) {
      mapInst.current = L.map(mapRef.current, {
        center: [42.28, -83.74], // Ann Arbor default
        zoom: 11,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInst.current);
    }

    const map = mapInst.current;
    const icon = createPinIcon(L);

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Add pins
    pins.forEach(p => {
      const schedLabel = { daily: "Daily", "3x_week": "3×/wk", "2x_week": "2×/wk", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[p.job.schedule] || "Weekly";
      const popup = L.popup({ maxWidth: 280, className: "hwfs-popup" }).setContent(`
        <div style="font-family:'Outfit',sans-serif;padding:4px">
          <div style="font-size:15px;font-weight:700;color:#1A3C34;margin-bottom:4px">${p.job.name}</div>
          <div style="font-size:12px;color:#7A8B85;margin-bottom:8px">${p.job.client || ""}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
            <div><span style="color:#7A8B85">Rate:</span> <strong style="color:#3A7D44">${fmtF(p.job.wkRate)}/wk</strong></div>
            <div><span style="color:#7A8B85">Tier:</span> <strong>${p.job.tier || "Basic"}</strong></div>
            <div><span style="color:#7A8B85">Schedule:</span> <strong>${schedLabel}</strong></div>
            <div><span style="color:#7A8B85">SF:</span> <strong>${p.job.sf ? (+p.job.sf).toLocaleString() : "—"}</strong></div>
          </div>
        </div>
      `);
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(popup);
      markersRef.current.push(marker);
    });

    // Fit bounds if we have pins
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [leaflet, pins]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: T.text }}>Job Sites</div>
          <div style={{ fontSize: 13, color: T.td2, marginTop: 2 }}>{pins.length} of {jobs.length} contracts mapped</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={ss.btnG} onClick={() => nav("jobs")}>View Contracts →</button>
        </div>
      </div>

      {/* Map container */}
      <div style={{
        ...ss.card,
        padding: 0,
        overflow: "hidden",
        marginBottom: 16,
        position: "relative",
        height: 520,
      }}>
        {loading && (
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: T.card, border: "1px solid " + T.border, borderRadius: 20, padding: "6px 18px", fontSize: 12, color: T.td2, boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
            Geocoding addresses...
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Job site list */}
      <div style={ss.card}>
        <div style={ss.ch}><span>All Job Sites ({jobs.length})</span></div>
        <table style={ss.tbl}>
          <thead>
            <tr>{["Property", "Client", "Rate", "Schedule", "Mapped"].map((h, i) =>
              <th key={i} style={i === 2 ? ss.thR : ss.th}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {jobs.map(j => {
              const mapped = pins.some(p => p.job.id === j.id);
              const schedLabel = { daily: "Daily", "3x_week": "3×/wk", "2x_week": "2×/wk", weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" }[j.schedule] || "Weekly";
              return (
                <tr key={j.id} style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.mintPale}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => {
                    const pin = pins.find(p => p.job.id === j.id);
                    if (pin && mapInst.current) {
                      mapInst.current.setView([pin.lat, pin.lng], 16, { animate: true });
                      const marker = markersRef.current[pins.indexOf(pin)];
                      if (marker) marker.openPopup();
                    }
                  }}
                >
                  <td style={{ ...ss.td, fontWeight: 600 }}>{j.name}</td>
                  <td style={ss.td}>{j.client}</td>
                  <td style={{ ...ss.tdR, fontWeight: 600 }}>{fmtF(j.wkRate)}</td>
                  <td style={ss.td}>{schedLabel}</td>
                  <td style={ss.td}>
                    <span style={{ color: mapped ? T.green : T.td2, fontWeight: 600, fontSize: 12 }}>
                      {mapped ? "✓ Yes" : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: T.td2, fontSize: 14 }}>
            No active contracts. Add contracts in the Contracts tab to see them on the map.
          </div>
        )}
      </div>
    </>
  );
}
