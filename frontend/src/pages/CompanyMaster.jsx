import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function CompanyMaster() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', address: '', phone: '', email: '', status: 'Active' });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/companies');
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/companies', formData);
      setShowModal(false);
      setFormData({ company_name: '', address: '', phone: '', email: '', status: 'Active' });
      fetchCompanies();
    } catch (err) {
      alert('Failed to save company entity');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>🏛️ Company Master</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Enterprise corporate entities and organizational parent companies</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          + Add Company Entity
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading company master records...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Company ID</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Company Name</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Contact Email</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Phone</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No companies found.</td></tr>
              ) : (
                companies.map((cmp) => (
                  <tr key={cmp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', color: '#6366f1', fontWeight: 700 }}>CMP-{cmp.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{cmp.company_name}</td>
                    <td style={{ padding: '14px 18px', color: '#38bdf8' }}>{cmp.email || 'N/A'}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{cmp.phone || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                        {cmp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '450px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Add Company Entity</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Company Name *" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <input type="email" placeholder="Corporate Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <input type="text" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <textarea placeholder="Headquarters Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
