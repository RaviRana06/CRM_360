import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', status: 'Pending' });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/tasks', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending' });
      fetchTasks();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiClient.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>✅ Task Management</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Track action items, follow-up deadlines, and completion statuses</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          + Create Task
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading task list...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Title</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Description</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Priority</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No tasks assigned.</td></tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: t.status === 'Completed' ? '#94a3b8' : '#f8fafc', textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1', fontSize: '0.85rem' }}>{t.description || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: t.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: t.priority === 'High' ? '#f87171' : '#facc15'
                      }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: t.status === 'Completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: t.status === 'Completed' ? '#4ade80' : '#818cf8'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {t.status !== 'Completed' ? (
                        <button onClick={() => handleStatusChange(t.id, 'Completed')} style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Mark Done
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Finished</span>
                      )}
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
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Create New Task</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Task Title *" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              <textarea placeholder="Description & requirements..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Priority Level:</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
