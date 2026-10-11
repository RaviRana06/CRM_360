import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/audit');
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📜 System Audit Trail</h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Real-time system security, record mutation history, and compliance logging</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading audit trail records...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Timestamp</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>User</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Action</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Module</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Details / Value</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No audit logs recorded yet.</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(l.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>👤 {l.user_name || 'System'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#38bdf8', fontWeight: 600 }}>{l.module}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1', fontSize: '0.85rem' }}>{l.new_value || l.old_value || `Record #${l.record_id}`}</td>
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
