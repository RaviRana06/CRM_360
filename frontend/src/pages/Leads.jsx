import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Target, UserPlus, PhoneCall, CheckCircle2, XCircle, Search, Trash2, ArrowUpRight, DollarSign, Mail, Phone, Building } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    lead_name: '',
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    lead_source: 'Website',
    estimated_budget: '',
    requirement: '',
    notes: ''
  });

  // Qualify & Disqualify Modals
  const [showQualifyModal, setShowQualifyModal] = useState(null);
  const [qualifyValue, setQualifyValue] = useState('');
  const [qualifyNotes, setQualifyNotes] = useState('');
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(null);
  const [disqualifyReason, setDisqualifyReason] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = '/leads';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data = await apiClient.get(url);
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads", err);
      showToast("Failed to load leads from database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, searchQuery]);

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

      if (cleanPayload.estimated_budget) {
        cleanPayload.estimated_budget = parseFloat(cleanPayload.estimated_budget);
      }

      await apiClient.post('/leads', cleanPayload);
      showToast("🎉 New lead captured successfully!", "success");
      setShowCreateModal(false);

      setFormData({
        lead_name: '',
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        lead_source: 'Website',
        estimated_budget: '',
        requirement: '',
        notes: ''
      });
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to create lead.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQualifySubmit = async (e) => {
    e.preventDefault();
    if (!showQualifyModal) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/leads/${showQualifyModal.id}/qualify`, {
        expected_value: qualifyValue ? parseFloat(qualifyValue) : showQualifyModal.estimated_budget,
        notes: qualifyNotes
      });
      showToast(`🎉 Lead converted to Opportunity #${res.opportunity_id}!`, "success");
      setShowQualifyModal(null);
      setQualifyValue('');
      setQualifyNotes('');
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to qualify lead.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisqualifySubmit = async (e) => {
    e.preventDefault();
    if (!showDisqualifyModal || !disqualifyReason.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/leads/${showDisqualifyModal.id}/disqualify`, {
        disqualification_reason: disqualifyReason
      });
      showToast("Lead marked as Disqualified", "info");
      setShowDisqualifyModal(null);
      setDisqualifyReason('');
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to disqualify lead.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await apiClient.delete(`/leads/${id}`);
      showToast("Lead record deleted", "success");
      fetchLeads();
    } catch (err) {
      showToast("Failed to delete lead.", "error");
    }
  };

  // Metrics calculation
  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === 'New').length;
  const contactedCount = leads.filter(l => l.status === 'Contacted').length;
  const qualifiedCount = leads.filter(l => l.status === 'Qualified').length;
  const disqualifiedCount = leads.filter(l => l.status === 'Disqualified').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', label: '🆕 New Enquiry' };
      case 'Contacted':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', label: '📞 Contacted' };
      case 'Qualified':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', label: '✨ Qualified (Deal)' };
      case 'Disqualified':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', label: '❌ Disqualified' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#cbd5e1', label: status };
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="animate-fade-in">
      {/* Page Title & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '6px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: '#818cf8', display: 'flex' }}>
              <Target size={22} />
            </span>
            Lead Management & Qualification
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Capture client inquiries, evaluate deal budgets, and convert qualified leads into the Opportunity pipeline.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.88rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus size={16} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Modern KPI Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {/* Total Leads */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(19, 29, 51, 0.8) 100%)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>Total Leads</span>
            <span style={{ padding: '4px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '6px', color: '#818cf8' }}>
              <Target size={14} />
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', margin: '8px 0 2px 0' }}>{totalCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>All Registered Enquiries</span>
        </div>

        {/* New Enquiries */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(19, 29, 51, 0.8) 100%)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>New Enquiries</span>
            <span style={{ padding: '4px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '6px', color: '#38bdf8' }}>
              <UserPlus size={14} />
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#38bdf8', margin: '8px 0 2px 0' }}>{newCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Awaiting initial contact</span>
        </div>

        {/* In Contact */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(19, 29, 51, 0.8) 100%)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>In Contact</span>
            <span style={{ padding: '4px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '6px', color: '#fbbf24' }}>
              <PhoneCall size={14} />
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fbbf24', margin: '8px 0 2px 0' }}>{contactedCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>In discussion / follow-up</span>
        </div>

        {/* Qualified */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(19, 29, 51, 0.8) 100%)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Qualified Deals</span>
            <span style={{ padding: '4px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: '#34d399' }}>
              <CheckCircle2 size={14} />
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34d399', margin: '8px 0 2px 0' }}>{qualifiedCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Converted into Pipeline</span>
        </div>

        {/* Disqualified */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(19, 29, 51, 0.8) 100%)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Disqualified</span>
            <span style={{ padding: '4px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#f87171' }}>
              <XCircle size={14} />
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f87171', margin: '8px 0 2px 0' }}>{disqualifiedCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Not a budget / scope fit</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{
        background: '#131d33',
        padding: '14px 20px',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['', 'New', 'Contacted', 'Qualified', 'Disqualified'].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? '#6366f1' : 'rgba(15, 23, 42, 0.6)',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 14px 8px 36px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '0.84rem',
              width: '280px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Professional Table View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Fetching leads from Microsoft SQL Server...
        </div>
      ) : leads.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#131d33',
          borderRadius: '16px',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          color: '#94a3b8'
        }}>
          <div style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '6px' }}>📭 No leads matching your criteria</div>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Click below to create a new customer inquiry.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ marginTop: '16px', background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Create New Lead
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#131d33', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 20px' }}>Lead & Company</th>
                <th style={{ padding: '14px 20px' }}>Contact Info</th>
                <th style={{ padding: '14px 20px' }}>Source</th>
                <th style={{ padding: '14px 20px' }}>Budget</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const badge = getStatusBadge(lead.status);
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    {/* Lead Title & Company */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.92rem' }}>{lead.lead_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} />
                        <span>{lead.company_name || 'Direct Individual'}</span>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{lead.contact_name || 'N/A'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '8px' }}>
                        {lead.email && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Mail size={11} /> {lead.email}</span>}
                        {lead.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Phone size={11} /> {lead.phone}</span>}
                      </div>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 500 }}>
                        {lead.lead_source}
                      </span>
                    </td>

                    {/* Budget */}
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#34d399', fontSize: '0.92rem' }}>
                      ${lead.estimated_budget ? lead.estimated_budget.toLocaleString() : '0'}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: badge.bg,
                        border: badge.border,
                        color: badge.color,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'inline-block'
                      }}>
                        {badge.label}
                      </span>
                      {lead.disqualification_reason && (
                        <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '4px' }}>
                          Reason: {lead.disqualification_reason}
                        </div>
                      )}
                    </td>

                    {/* Sleek Action Buttons */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {lead.status !== 'Qualified' && lead.status !== 'Disqualified' && (
                          <>
                            <button
                              onClick={() => {
                                setShowQualifyModal(lead);
                                setQualifyValue(lead.estimated_budget || '');
                              }}
                              title="Qualify and convert to Opportunity"
                              style={{
                                padding: '5px 10px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s'
                              }}
                            >
                              <ArrowUpRight size={13} />
                              <span>Qualify</span>
                            </button>
                            <button
                              onClick={() => setShowDisqualifyModal(lead)}
                              title="Disqualify lead with reason"
                              style={{
                                padding: '5px 10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#f87171',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <XCircle size={13} />
                              <span>Disqualify</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(lead.id)}
                          title="Delete Lead"
                          style={{
                            padding: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#f87171';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#131d33', width: '100%', maxWidth: '580px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800 }}>➕ Add New Customer Lead</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Lead Title / Requirement *</label>
                <input type="text" required value={formData.lead_name} onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Company Name</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Person</label>
                  <input type="text" value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Lead Source</label>
                  <select value={formData.lead_source} onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }}>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Exhibition">Exhibition / Event</option>
                    <option value="Cold Call">Cold Outreach</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Estimated Budget ($)</label>
                  <input type="number" value={formData.estimated_budget} onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Create Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Qualify Modal */}
      {showQualifyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#131d33', width: '100%', maxWidth: '480px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#34d399', fontWeight: 800 }}>✨ Qualify Lead into Opportunity</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0' }}>This will mark the lead as Qualified and convert it into a pipeline Deal.</p>
            <form onSubmit={handleQualifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Expected Deal Value ($)</label>
                <input type="number" required value={qualifyValue} onChange={(e) => setQualifyValue(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Qualification Notes</label>
                <textarea rows="3" value={qualifyNotes} onChange={(e) => setQualifyNotes(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowQualifyModal(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Convert to Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disqualify Modal */}
      {showDisqualifyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#131d33', width: '100%', maxWidth: '440px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#f87171', fontWeight: 800 }}>❌ Disqualify Lead</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 14px 0' }}>Please record the reason for disqualification.</p>
            <form onSubmit={handleDisqualifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Reason</label>
                <select required value={disqualifyReason} onChange={(e) => setDisqualifyReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120', color: '#fff' }}>
                  <option value="">Select reason...</option>
                  <option value="Budget too low">Budget too low</option>
                  <option value="No timeline / not interested">No timeline / not interested</option>
                  <option value="Competitor chosen">Competitor chosen</option>
                  <option value="Out of scope requirements">Out of scope requirements</option>
                  <option value="Spam / Invalid contact">Spam / Invalid contact</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowDisqualifyModal(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Confirm Disqualification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
