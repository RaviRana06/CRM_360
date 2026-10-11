import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const STAGES = [
  { key: 'Opportunity', label: '💡 Opportunity', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' },
  { key: 'Proposal', label: '📄 Proposal', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)' },
  { key: 'Negotiation', label: '🤝 Negotiation', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
  { key: 'Won', label: '🏆 Won', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
  { key: 'Lost', label: '❌ Lost', color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.15)' }
];

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(null); // holds target opp object
  const [lostReason, setLostReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create
  const [formData, setFormData] = useState({
    opportunity_name: '',
    customer_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    expected_value: '',
    probability: 50,
    stage: 'Opportunity',
    description: ''
  });

  useEffect(() => {
    fetchOpportunities();
  }, [searchQuery]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      let url = '/opportunities?';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      const data = await apiClient.get(url);
      setOpportunities(data || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (oppId, newStage) => {
    if (newStage === 'Lost') {
      const opp = opportunities.find(o => o.id === oppId);
      setShowLostModal(opp);
      return;
    }

    try {
      const res = await apiClient.patch(`/opportunities/${oppId}/stage`, { stage: newStage });
      alert(`🎉 ${res.message}`);
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update stage.");
    }
  };

  const handleLostSubmit = async (e) => {
    e.preventDefault();
    if (!showLostModal || !lostReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiClient.patch(`/opportunities/${showLostModal.id}/stage`, {
        stage: 'Lost',
        lost_reason: lostReason
      });
      alert(`Notice: ${res.message}`);
      setShowLostModal(null);
      setLostReason('');
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to mark deal as Lost.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cleanPayload = {};
      Object.keys(formData).forEach(k => {
        if (formData[k] !== '' && formData[k] !== null) {
          cleanPayload[k] = formData[k];
        }
      });
      if (cleanPayload.expected_value) {
        cleanPayload.expected_value = parseFloat(cleanPayload.expected_value);
      }
      if (cleanPayload.probability) {
        cleanPayload.probability = parseInt(cleanPayload.probability, 10);
      }

      await apiClient.post('/opportunities', cleanPayload);
      setShowCreateModal(false);
      setFormData({
        opportunity_name: '',
        customer_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        expected_value: '',
        probability: 50,
        stage: 'Opportunity',
        description: ''
      });
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create opportunity.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      await apiClient.delete(`/opportunities/${id}`);
      fetchOpportunities();
    } catch (err) {
      alert("Failed to delete deal.");
    }
  };

  // Calculations
  const totalPipelineValue = opportunities
    .filter(o => o.stage !== 'Lost')
    .reduce((sum, o) => sum + (o.expected_value || 0), 0);

  const weightedRevenue = opportunities
    .filter(o => o.stage !== 'Lost')
    .reduce((sum, o) => sum + ((o.expected_value || 0) * ((o.probability || 0) / 100)), 0);

  const wonDeals = opportunities.filter(o => o.stage === 'Won');
  const wonValue = wonDeals.reduce((sum, o) => sum + (o.expected_value || 0), 0);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            📈 Opportunity Pipeline & Stage Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Opportunity → Proposal → Negotiation → Won / Lost (Auto-creates Customer Accounts on Won deals).
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}
        >
          + Add Opportunity Deal
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>Total Active Pipeline</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            ${totalPipelineValue.toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>Weighted Expected Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            ${Math.round(weightedRevenue).toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Closed Won Deals ({wonDeals.length})</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            ${wonValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder="🔍 Search opportunities by deal name, customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            fontSize: '0.875rem',
            width: '300px',
            outline: 'none'
          }}
        />
      </div>

      {/* KANBAN PIPELINE COLUMNS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading Pipeline Deals from SQL Server...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '20px'
        }}>
          {STAGES.map((stg) => {
            const stageDeals = opportunities.filter(o => o.stage === stg.key);
            const stageTotalVal = stageDeals.reduce((sum, o) => sum + (o.expected_value || 0), 0);

            return (
              <div key={stg.key} style={{
                background: '#1e293b',
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${stg.color}30`,
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Column Header */}
                <div style={{
                  background: stg.bg,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: stg.color, fontSize: '0.9rem' }}>{stg.label}</span>
                    <span style={{ background: 'rgba(0, 0, 0, 0.3)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginTop: '4px' }}>
                    ${stageTotalVal.toLocaleString()}
                  </div>
                </div>

                {/* Deal Cards Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {stageDeals.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No deals in this stage</div>
                  ) : (
                    stageDeals.map((opp) => (
                      <div key={opp.id} style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '14px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                      }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '4px' }}>
                          {opp.opportunity_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '8px' }}>
                          🏢 {opp.customer_name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', margin: '8px 0', color: '#cbd5e1' }}>
                          <span>Val: <strong style={{ color: '#34d399' }}>${(opp.expected_value || 0).toLocaleString()}</strong></span>
                          <span>Prob: <strong style={{ color: '#fbbf24' }}>{opp.probability}%</strong></span>
                        </div>

                        {opp.lost_reason && (
                          <div style={{ fontSize: '0.75rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', marginBottom: '8px' }}>
                            Reason: {opp.lost_reason}
                          </div>
                        )}

                        {/* Stage Controls */}
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {opp.stage === 'Opportunity' && (
                            <button onClick={() => handleStageChange(opp.id, 'Proposal')} style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                              ➡️ Move to Proposal
                            </button>
                          )}
                          {opp.stage === 'Proposal' && (
                            <button onClick={() => handleStageChange(opp.id, 'Negotiation')} style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                              ➡️ Move to Negotiation
                            </button>
                          )}
                          {opp.stage !== 'Won' && opp.stage !== 'Lost' && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => handleStageChange(opp.id, 'Won')} style={{ flex: 1, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', borderRadius: '6px', padding: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                🏆 Mark Won
                              </button>
                              <button onClick={() => handleStageChange(opp.id, 'Lost')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '6px', padding: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                ❌ Lost
                              </button>
                            </div>
                          )}

                          <button onClick={() => handleDelete(opp.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'right', marginTop: '4px' }}>
                            Delete Deal
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '520px', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#f8fafc' }}>Create New Sales Opportunity</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Opportunity Deal Name *</label>
                <input required type="text" placeholder="e.g. Enterprise Cloud License Deal" value={formData.opportunity_name} onChange={e => setFormData({ ...formData, opportunity_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Customer / Company Name *</label>
                <input required type="text" placeholder="Acme International" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Expected Deal Value ($)</label>
                  <input type="number" placeholder="100000" value={formData.expected_value} onChange={e => setFormData({ ...formData, expected_value: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Initial Stage</label>
                  <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}>
                    <option value="Opportunity">Opportunity (50%)</option>
                    <option value="Proposal">Proposal (75%)</option>
                    <option value="Negotiation">Negotiation (90%)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 18px', background: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Create Deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK LOST MODAL */}
      {showLostModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#fca5a5' }}>❌ Mark Opportunity as Lost</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
              Please enter the Lost Reason for <strong>{showLostModal.opportunity_name}</strong>.
            </p>
            <form onSubmit={handleLostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Lost Reason *</label>
                <input required type="text" value={lostReason} onChange={e => setLostReason(e.target.value)} placeholder="e.g. Competitor pricing, Project cancelled, Requirement changed" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowLostModal(null)} style={{ padding: '10px 16px', background: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Confirm Mark Lost'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
