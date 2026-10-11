import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active'
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/accounts', { params: { search } });
      setAccounts(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/accounts', formData);
      setShowModal(false);
      setFormData({ company_name: '', industry: '', phone: '', email: '', address: '', status: 'Active' });
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer account?')) return;
    try {
      await apiClient.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>🏢 Customer Accounts</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage organizational customers, clients, and corporate relationships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Add Account
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Search accounts by company name, industry, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(30, 41, 59, 0.8)',
            color: '#fff'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading customer accounts...</div>
      ) : error ? (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '10px' }}>{error}</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>ID</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Company Name</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Industry</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Contact Info</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No customer accounts found.</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', color: '#6366f1', fontWeight: 700 }}>#{acc.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{acc.company_name}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{acc.industry || 'General'}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>
                      <div>📧 {acc.email || 'N/A'}</div>
                      <div>📞 {acc.phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: acc.status === 'Active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: acc.status === 'Active' ? '#4ade80' : '#f87171'
                      }}>
                        {acc.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Account Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '450px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Add New Account</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Company Name *"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
              <input
                type="text"
                placeholder="Industry (e.g. Technology, Logistics)"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', rows: 3 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
