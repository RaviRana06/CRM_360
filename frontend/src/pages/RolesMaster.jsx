import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function RolesMaster() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/roles');
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>🛡️ Role & Permission Master (RBAC)</h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Dynamic Role-Based Access Control matrix & data scope management</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading RBAC roles matrix...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {roles.map((r) => (
            <div key={r.id} style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#6366f1' }}>{r.name}</h3>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 700 }}>
                  System Role
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>{r.description}</p>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 8px 0' }}>Assigned Modules & Scope:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '6px', fontSize: '0.75rem' }}>Leads (View, Create, Qualify)</span>
                  <span style={{ padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '6px', fontSize: '0.75rem' }}>Opportunities (Pipeline)</span>
                  <span style={{ padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '6px', fontSize: '0.75rem' }}>Accounts & Contacts</span>
                  <span style={{ padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '6px', fontSize: '0.75rem' }}>Tasks & Meetings</span>
                  <span style={{ padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '6px', fontSize: '0.75rem' }}>Geo Check-In</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
