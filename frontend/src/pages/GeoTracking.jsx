import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';

export default function GeoTracking() {
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'map' | 'visits'
  const [visits, setVisits] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [purpose, setPurpose] = useState('Client Demo & Visit');
  const [remarks, setRemarks] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  const fetchGeoData = async () => {
    try {
      const [vData, locData] = await Promise.all([
        apiClient.get('/geo/visits'),
        apiClient.get('/geo/live-locations')
      ]);
      setVisits(vData);
      setLiveLocations(locData);
      
      // Check if current user has an active checked-in visit
      const active = vData.find(v => v.status === 'Checked-In');
      setActiveCheckIn(active || null);
    } catch (err) {
      console.error("Failed to load geo tracking data", err);
    }
  };

  useEffect(() => {
    fetchGeoData();
    // Get initial current location from Browser Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation warning:", err.message),
        { enableHighAccuracy: true }
      );
    }

    // Connect WebSocket for real-time live location broadcasts
    let ws;
    try {
      ws = new WebSocket('ws://localhost:8000/ws/geo');
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'LOCATION_UPDATE') {
            setLiveLocations((prev) => [msg, ...prev.filter(l => l.employee_name !== msg.employee_name)]);
          }
        } catch (e) {
          console.error("WS error:", e);
        }
      };
    } catch (err) {
      console.warn("WebSocket connect notice:", err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Initialize & Render Leaflet Map using OpenStreetMap tiles (100% Free)
  useEffect(() => {
    if (activeTab === 'map' && mapContainerRef.current && window.L) {
      if (!leafletMapRef.current) {
        const centerLat = currentCoords?.lat || 28.6139; // Default to New Delhi or user position
        const centerLng = currentCoords?.lng || 77.2090;

        const map = window.L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);
        
        // OpenStreetMap Tile Layer (Free, Open-Source)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;
      // Clear existing markers if any
      map.eachLayer((layer) => {
        if (layer instanceof window.L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add Live Employee Location Markers
      liveLocations.forEach((loc) => {
        if (loc.latitude && loc.longitude) {
          const markerColor = loc.status === 'Checked-In' ? '#22c55e' : '#64748b';
          const popupContent = `
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #1e293b; font-size: 1rem;">👤 ${loc.employee_name}</strong><br/>
              <span style="font-size: 0.8rem; color: ${markerColor}; font-weight: bold;">Status: ${loc.status}</span><br/>
              <span style="font-size: 0.85rem; color: #475569;">📍 ${loc.address || 'GPS Coordinates'}</span><br/>
              <small style="color: #64748b;">Updated: ${new Date(loc.updated_at).toLocaleTimeString()}</small>
            </div>
          `;

          const customIcon = window.L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          window.L.marker([loc.latitude, loc.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent);
        }
      });
    }
  }, [activeTab, liveLocations, currentCoords]);

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Browser Geolocation API is not supported by your browser.");
      return;
    }

    setLocLoading(true);
    setActionMessage("Acquiring GPS location from Browser Geolocation API...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentCoords({ lat, lng });

        try {
          const res = await apiClient.post('/geo/checkin', {
            latitude: lat,
            longitude: lng,
            purpose: purpose,
            remarks: remarks
          });
          setActionMessage(`✅ Checked-in successfully at Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          setRemarks('');
          fetchGeoData();
        } catch (err) {
          setActionMessage("❌ Check-in failed: " + (err.response?.data?.detail || err.message));
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setLocLoading(false);
        setActionMessage("❌ Geolocation Permission Denied or Timeout: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;

    setLocLoading(true);
    setActionMessage("Acquiring GPS location for check-out...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          await apiClient.post('/geo/checkout', {
            visit_id: activeCheckIn.id,
            latitude: lat,
            longitude: lng,
            remarks: "Completed visit"
          });
          setActionMessage("✅ Checked-out successfully!");
          fetchGeoData();
        } catch (err) {
          setActionMessage("❌ Check-out failed: " + (err.response?.data?.detail || err.message));
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setLocLoading(false);
        setActionMessage("❌ Geolocation Error: " + error.message);
      }
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📍 Field Geo Tracking & Check-In</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Browser Geolocation API + Free OpenStreetMap Leaflet Map Integration
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('checkin')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'checkin' ? '#6366f1' : 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            ⚡ Check-In / Out
          </button>
          <button
            onClick={() => setActiveTab('map')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'map' ? '#6366f1' : 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            🗺️ Live Employee Map
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'visits' ? '#6366f1' : 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            📋 Visit History
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#fff', fontWeight: 600 }}>
          {actionMessage}
        </div>
      )}

      {/* Tab 1: Check-In / Check-Out Form */}
      {activeTab === 'checkin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#6366f1' }}>Current Visit Check-In</h3>
            
            {activeCheckIn ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 800 }}>● Currently Checked-In</span>
                <p style={{ margin: '8px 0 4px 0', fontWeight: 700 }}>Purpose: {activeCheckIn.purpose}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>Check-in time: {new Date(activeCheckIn.check_in_time).toLocaleTimeString()}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>GPS: {activeCheckIn.check_in_latitude.toFixed(4)}, {activeCheckIn.check_in_longitude.toFixed(4)}</p>

                <button
                  onClick={handleCheckOut}
                  disabled={locLoading}
                  style={{ marginTop: '16px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  {locLoading ? "Processing GPS Check-Out..." : "🔴 Perform Check-Out"}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Visit Purpose:</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Sales Demo, Contract Signing"
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                />

                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Visit Remarks & Notes:</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Notes about location or client discussion..."
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                />

                <button
                  onClick={handleCheckIn}
                  disabled={locLoading}
                  style={{ padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                >
                  {locLoading ? "Fetching GPS Location..." : "🟢 Check-In Now (Browser Geolocation)"}
                </button>
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#38bdf8' }}>GPS & Map Provider Information</h3>
            <ul style={{ paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8', fontSize: '0.9rem' }}>
              <li><strong>Map Engine:</strong> Leaflet JS v1.9.4 (Open-Source)</li>
              <li><strong>Map Tiles:</strong> OpenStreetMap Contributors</li>
              <li><strong>Location Sensor:</strong> W3C Browser Geolocation API</li>
              <li><strong>Cost:</strong> 100% Free / Zero Third-Party Paid API Dependency</li>
              <li><strong>Database Storage:</strong> Lat/Lng stored directly in Microsoft SQL Server</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Leaflet + OpenStreetMap Live Location Map */}
      {activeTab === 'map' && (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🗺️ Live Employee Check-In Map (OpenStreetMap)</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Green marker = Currently Checked-In</span>
          </div>
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '520px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}
          />
        </div>
      )}

      {/* Tab 3: Visit History Log */}
      {activeTab === 'visits' && (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Visit ID</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Employee ID</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Purpose</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Check-In Coordinates</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Check-In Time</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No visit records logged.</td></tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', color: '#6366f1', fontWeight: 700 }}>#VIS-{v.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>Employee #{v.employee_id}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{v.purpose}</td>
                    <td style={{ padding: '14px 18px', color: '#38bdf8', fontSize: '0.85rem' }}>
                      📍 {v.check_in_latitude.toFixed(4)}, {v.check_in_longitude.toFixed(4)}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(v.check_in_time).toLocaleString()}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: v.status === 'Checked-In' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)', color: v.status === 'Checked-In' ? '#4ade80' : '#94a3b8' }}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
