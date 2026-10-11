import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function EmployeeMaster() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Sales',
    designation: 'Sales Representative',
    role_id: '',
    password: 'Password@123'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, roleData] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get('/roles')
      ]);
      setEmployees(empData);
      setRoles(roleData);
      if (roleData.length > 0 && !formData.role_id) {
        setFormData(prev => ({ ...prev, role_id: roleData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        role_id: parseInt(formData.role_id)
      };
      await apiClient.post('/employees', payload);
      setShowModal(false);
      setFormData({ employee_code: '', first_name: '', last_name: '', email: '', phone: '', department: 'Sales', designation: 'Sales Representative', role_id: roles[0]?.id || 1, password: 'Password@123' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create employee');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>👥 Employee Master</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage team members, staff accounts, designations, and dynamic RBAC roles</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          + Add Employee
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading employees...</div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Code</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Employee Name</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Email</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Department / Designation</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Assigned RBAC Role</th>
                <th style={{ padding: '14px 18px', color: '#94a3b8' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 18px', color: '#6366f1', fontWeight: 700 }}>{emp.employee_code}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700 }}>{emp.first_name} {emp.last_name}</td>
                  <td style={{ padding: '14px 18px', color: '#38bdf8' }}>{emp.email}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <div>{emp.designation || 'Staff'}</div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.department || 'General'}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700 }}>
                      🛡️ Role #{emp.role_id}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: emp.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: emp.is_active ? '#4ade80' : '#f87171' }}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '480px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Add New Employee</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Emp Code (EMP002) *" required value={formData.employee_code} onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                <input type="email" placeholder="Work Email *" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="First Name *" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                <input type="text" placeholder="Last Name *" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                <input type="text" placeholder="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
              </div>

              <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Assign System RBAC Role:</label>
              <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.description}</option>
                ))}
              </select>

              <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Initial Login Password:</label>
              <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#334155', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
