import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'Call',
    subject: '',
    notes: ''
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/activities');
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/activities', formData);
      setShowModal(false);
      setFormData({ activity_type: 'Call', subject: '', notes: '' });
      fetchActivities();
    } catch (err) {
      alert('Failed to log activity');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📝 Sales Activity Log</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Record customer calls, emails, visits, notes, and follow-ups across CRM lifecycle</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          + Log New Activity
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading activity logs...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Type</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Subject</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Notes</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Logged Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No activity records found.</td></tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                        {act.activity_type === 'Call' && '📞 '}
                        {act.activity_type === 'Email' && '📧 '}
                        {act.activity_type === 'Visit' && '🚘 '}
                        {act.activity_type === 'Follow-up' && '⏰ '}
                        {act.activity_type === 'Note' && '📌 '}
                        {act.activity_type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{act.subject}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1', fontSize: '0.85rem' }}>{act.notes || 'N/A'}</td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(act.created_at).toLocaleString()}</td>
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
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Log Sales Activity</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Activity Type:</label>
              <select value={formData.activity_type} onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                <option value="Call">📞 Phone Call</option>
                <option value="Email">📧 Email Sent / Received</option>
                <option value="Visit">🚘 Customer On-site Visit</option>
                <option value="Follow-up">⏰ Follow-up Task</option>
                <option value="Note">📌 General Note</option>
              </select>

              <input type="text" placeholder="Subject / Summary *" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <textarea placeholder="Detailed notes & discussion summary..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
