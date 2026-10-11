import React, { useState } from 'react';
import apiClient from '../api/client';

export default function Login({ onLoginSuccess }) {
  const [emailOrCode, setEmailOrCode] = useState('admin@crm360.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post('/auth/login', {
        email_or_code: emailOrCode,
        password: password
      });

      // Save token and user details to localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error("Login failed:", err);
      const detail = err.response?.data?.detail || "Invalid login credentials or backend unavailable.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--card-bg, #1e293b)',
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.5rem',
            color: '#fff',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            360
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>
            Welcome to CRM 360
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            Enter your credentials to access your workspace
          </p>
        </div>

        {/* Credentials Tip Card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '0.825rem',
          color: '#cbd5e1'
        }}>
          <div style={{ fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>💡 Initial System Admin Credentials:</div>
          <div><strong>Email / Code:</strong> <code>admin@crm360.com</code></div>
          <div><strong>Password:</strong> <code>Admin@123</code></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Email address or Employee Code
            </label>
            <input
              type="text"
              value={emailOrCode}
              onChange={(e) => setEmailOrCode(e.target.value)}
              placeholder="admin@crm360.com or EMP001"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Authenticating with MS SQL Server...' : 'Sign In to CRM 360'}
          </button>
        </form>
      </div>
    </div>
  );
}
