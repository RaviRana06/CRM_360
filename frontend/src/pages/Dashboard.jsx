import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { BarChart, DonutChart } from '../components/Charts';

export default function Dashboard({ user, onLogout, onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get('/reports/summary')
      .then(data => setStats(data))
      .catch(err => console.error("Failed to load dashboard metrics", err));
  }, []);

  const leadChartData = stats?.leads?.by_status ? Object.entries(stats.leads.by_status).map(([key, val]) => ({
    label: key,
    value: val
  })) : [
    { label: 'New', value: 4, color: '#6366f1' },
    { label: 'Contacted', value: 3, color: '#38bdf8' },
    { label: 'Qualified', value: 5, color: '#10b981' },
    { label: 'Disqualified', value: 1, color: '#ef4444' }
  ];

  const oppChartData = stats?.opportunities?.by_stage ? Object.entries(stats.opportunities.by_stage).map(([key, val]) => ({
    label: key,
    value: val,
    color: key === 'Won' ? '#10b981' : key === 'Lost' ? '#ef4444' : '#6366f1'
  })) : [
    { label: 'Opportunity', value: 2, color: '#6366f1' },
    { label: 'Proposal', value: 4, color: '#38bdf8' },
    { label: 'Negotiation', value: 3, color: '#f59e0b' },
    { label: 'Won', value: 5, color: '#10b981' }
  ];

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px' }}>
      {/* Top Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '20px',
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#818cf8',
            background: 'rgba(99, 102, 241, 0.2)',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            CRM 360 Workspace • MS SQL Server Connected
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#f8fafc' }}>
            Welcome back, {user?.first_name} {user?.last_name}!
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
            {user?.designation} • {user?.department} • Employee Code: <strong style={{ color: '#38bdf8' }}>{user?.employee_code}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigate && onNavigate('leads')}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            🎯 + New Lead
          </button>
          <button
            onClick={() => onNavigate && onNavigate('quotes')}
            style={{
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            📜 Create Quote
          </button>
        </div>
      </div>

      {/* Real-Time Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div onClick={() => onNavigate && onNavigate('leads')} style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>🎯 Total Leads</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>{stats?.leads?.total ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px' }}>Enquiries & Prospects</div>
        </div>

        <div onClick={() => onNavigate && onNavigate('opportunities')} style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>📈 Deals Pipeline Value</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>${(stats?.opportunities?.pipeline_revenue ?? 0).toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>{stats?.opportunities?.total ?? 0} Total Deals</div>
        </div>

        <div onClick={() => onNavigate && onNavigate('accounts')} style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>🏢 Customer Accounts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ade80' }}>{stats?.accounts?.total ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px' }}>Active Clients</div>
        </div>

        <div onClick={() => onNavigate && onNavigate('geo')} style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>📍 Geo Checked-In</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.geo?.active_checkins ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>{stats?.geo?.total_visits ?? 0} Total Visits Logged</div>
        </div>
      </div>

      {/* Visual Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <BarChart title="📊 Sales Deals by Pipeline Stage" data={oppChartData} height={200} />
        <DonutChart title="🎯 Lead Status Distribution" data={leadChartData} centerLabel="Leads" centerValue={stats?.leads?.total ?? 0} />
      </div>

      {/* Modules Quick Navigation */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
        CRM 360 System Overview & Modules
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {[
          { title: '🎯 Lead Management', desc: 'Lead qualification and conversion pipeline', tab: 'leads' },
          { title: '📈 Opportunity Pipeline', desc: 'Proposal, negotiation, and win/loss tracking', tab: 'opportunities' },
          { title: '📜 Quotations & Invoices', desc: 'Product catalogs, formal quotes, and billing', tab: 'quotes' },
          { title: '📦 Product Catalog', desc: 'Manage products, SKUs, and service rates', tab: 'products' },
          { title: '📁 Document Vault', desc: 'Upload contracts, NDAs, and customer files', tab: 'documents' },
          { title: '📍 Field Geo Tracking', desc: 'Browser Geolocation + OpenStreetMap Leaflet Map', tab: 'geo' },
          { title: '🏢 Accounts & Contacts', desc: 'Organizational customers and client directory', tab: 'accounts' },
          { title: '📊 Reports & Analytics', desc: 'Performance reports and CSV summary export', tab: 'reports' },
        ].map((m, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate && onNavigate(m.tab)}
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer'
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#f8fafc' }}>{m.title}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
