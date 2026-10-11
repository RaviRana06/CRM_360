import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: '',
    email: '',
    phone: '',
    designation: '',
    account_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsData, accountsData] = await Promise.all([
        apiClient.get('/contacts', { params: { search } }),
        apiClient.get('/accounts')
      ]);
      setContacts(contactsData);
      setAccounts(accountsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        account_id: formData.account_id ? parseInt(formData.account_id) : null
      };
      await apiClient.post('/contacts', payload);
      setShowModal(false);
      setFormData({ contact_name: '', email: '', phone: '', designation: '', account_id: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create contact');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📇 Contacts Directory</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Key decision makers, corporate officers, and customer points of contact</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          + Add Contact
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search contacts by name, designation, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', marginBottom: '20px' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading contacts...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Contact Name</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Designation</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Email</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Phone</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No contacts found.</td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#f8fafc' }}>{c.contact_name}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{c.designation || 'Manager'}</td>
                    <td style={{ padding: '14px 18px', color: '#38bdf8' }}>{c.email || 'N/A'}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{c.phone || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                        Active
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
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Add New Contact</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Contact Name *" required value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <input type="text" placeholder="Designation (e.g. VP of Sales, Procurement Head)" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <input type="text" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              
              <select value={formData.account_id} onChange={(e) => setFormData({ ...formData, account_id: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                <option value="">-- Associate Customer Account --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.company_name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
