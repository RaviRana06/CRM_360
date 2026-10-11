import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Activity, Database, Server, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function HealthCheck() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get('/health');
      setHealthData(data);
    } catch (err) {
      setError(err.message || 'Failed to reach FastAPI backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ borderRadius: '16px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: '#6366f1' }}>
              <Activity size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>System Health Verification</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '2px' }}>
                Phase 1: Verifying FastAPI Backend & MS SQL Server Connectivity
              </p>
            </div>
          </div>
          <button onClick={fetchHealth} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {loading ? 'Testing...' : 'Re-test Connection'}
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <XCircle size={24} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#f43f5e', margin: 0, fontWeight: 600 }}>Backend Connection Failed</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px', margin: 0 }}>{error}</p>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
                Make sure the FastAPI server is running at <code>http://localhost:8000</code>.
              </div>
            </div>
          </div>
        )}

        {healthData && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* FastAPI Service Status Card */}
            <div style={{
              background: 'var(--bg-dark)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Server size={22} color="#06b6d4" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>FastAPI Backend</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>{healthData.service}</p>
                </div>
              </div>
              <span className={`badge ${healthData.status === 'online' ? 'badge-success' : 'badge-danger'}`}>
                {healthData.status === 'online' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {healthData.status.toUpperCase()}
              </span>
            </div>

            {/* MS SQL Server Status Card */}
            <div style={{
              background: 'var(--bg-dark)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Database size={22} color="#6366f1" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Database Server</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                    {healthData.database?.type}
                  </p>
                </div>
              </div>
              <span className={`badge ${healthData.database?.status === 'connected' ? 'badge-success' : 'badge-warning'}`}>
                {healthData.database?.status === 'connected' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {healthData.database?.status?.toUpperCase()}
              </span>
            </div>

            {/* Detailed Log Info */}
            <div style={{
              background: 'var(--bg-dark)',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Status Log & Connection Details:</div>
              <code style={{ color: '#10b981', wordBreak: 'break-all' }}>
                {healthData.database?.details || 'No details reported.'}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
