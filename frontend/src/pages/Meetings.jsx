import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    meeting_date: new Date().toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '11:00 AM',
    location: '',
    participants: '',
    description: ''
  });

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/meetings');
      setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        meeting_date: new Date(formData.meeting_date).toISOString()
      };
      await apiClient.post('/meetings', payload);
      setShowModal(false);
      setFormData({ subject: '', meeting_date: new Date().toISOString().split('T')[0], start_time: '10:00 AM', end_time: '11:00 AM', location: '', participants: '', description: '' });
      fetchMeetings();
    } catch (err) {
      alert('Failed to schedule meeting');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📅 Client Meetings</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Schedule, organize, and monitor customer discussions and product presentations</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          + Schedule Meeting
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading scheduled meetings...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Subject</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Date & Time</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Location</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Participants</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No meetings scheduled.</td></tr>
              ) : (
                meetings.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{m.subject}</td>
                    <td style={{ padding: '14px 18px', color: '#38bdf8', fontSize: '0.85rem' }}>
                      📅 {new Date(m.meeting_date).toLocaleDateString()} ({m.start_time} - {m.end_time})
                    </td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>📍 {m.location || 'Online Zoom/Teams'}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1', fontSize: '0.85rem' }}>👥 {m.participants || 'Team'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                        {m.status}
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
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Schedule Meeting</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Meeting Subject *" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" required value={formData.meeting_date} onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                <input type="text" placeholder="Start Time (10:00 AM)" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              </div>

              <input type="text" placeholder="Location / Virtual Link" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <input type="text" placeholder="Participants (Emails / Names)" value={formData.participants} onChange={(e) => setFormData({ ...formData, participants: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <textarea placeholder="Agenda & meeting description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
