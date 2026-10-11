import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { BarChart, DonutChart } from '../components/Charts';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/reports/summary');
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reports) return;
    const csvRows = [
      ["Category", "Metric", "Value"],
      ["Leads", "Total Leads", reports.leads.total],
      ["Opportunities", "Total Deals", reports.opportunities.total],
      ["Opportunities", "Pipeline Revenue ($)", reports.opportunities.pipeline_revenue],
      ["Opportunities", "Won Revenue ($)", reports.opportunities.won_revenue],
      ["Accounts", "Total Customers", reports.accounts.total],
      ["Geo Tracking", "Total Visits Logged", reports.geo.total_visits]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CRM_360_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const leadChartData = reports?.leads?.by_status ? Object.entries(reports.leads.by_status).map(([key, val]) => ({
    label: key,
    value: val
  })) : [];

  const oppStageData = reports?.opportunities?.by_stage ? Object.entries(reports.opportunities.by_stage).map(([key, val]) => ({
    label: key,
    value: val,
    color: key === 'Won' ? '#10b981' : key === 'Lost' ? '#ef4444' : '#6366f1'
  })) : [];

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📊 System Analytics & Reports</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Comprehensive sales performance breakdown, conversion rates, and CSV data export</p>
        </div>
        <button
          onClick={handleExportCSV}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          📥 Export CSV Summary
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Generating analytics reports...</div>
      ) : !reports ? (
        <div style={{ textAlign: 'center', color: '#f87171' }}>Failed to load report data.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Visual Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
            <BarChart title="📈 Deals Pipeline Distribution" data={oppStageData} height={200} />
            <DonutChart title="🎯 Lead Acquisition Breakdown" data={leadChartData} centerLabel="Leads" centerValue={reports.leads.total} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Revenue & Pipeline Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#6366f1' }}>💰 Revenue Summary</h3>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Active Pipeline Revenue:</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>${reports.opportunities.pipeline_revenue.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Closed Won Revenue:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>${reports.opportunities.won_revenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Lead Qualification Summary */}
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f59e0b' }}>🎯 Lead Breakdown</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>
                <span style={{ color: '#cbd5e1' }}>Total Enquiries:</span>
                <strong style={{ color: '#fff' }}>{reports.leads.total}</strong>
              </div>
              {Object.entries(reports.leads.by_status).map(([st, count]) => (
                <div key={st} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Status: {st}</span>
                  <span style={{ fontWeight: 700, color: '#818cf8' }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Productivity & Geo */}
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#10b981' }}>⚡ Field & Operational Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>
                <span style={{ color: '#cbd5e1' }}>Total Accounts:</span>
                <strong style={{ color: '#fff' }}>{reports.accounts.total}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>
                <span style={{ color: '#cbd5e1' }}>Total Geo Visits Logged:</span>
                <strong style={{ color: '#38bdf8' }}>{reports.geo.total_visits}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#cbd5e1' }}>Currently Checked-In:</span>
                <strong style={{ color: '#4ade80' }}>{reports.geo.active_checkins}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
