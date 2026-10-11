import React, { useState, useEffect } from 'react';
import HealthCheck from './pages/HealthCheck';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Opportunities from './pages/Opportunities';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import CompanyMaster from './pages/CompanyMaster';
import EmployeeMaster from './pages/EmployeeMaster';
import RolesMaster from './pages/RolesMaster';
import Activities from './pages/Activities';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import GeoTracking from './pages/GeoTracking';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Products from './pages/Products';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Documents from './pages/Documents';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setActiveTab('dashboard');
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('login');
  };

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', display: 'flex' }}>
        {/* If Not Logged In, Render Center Login Screen */}
        {!user || activeTab === 'login' ? (
          <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveTab('health')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#a5b4fc',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ⚡ System Diagnostics
              </button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeTab === 'health' ? (
                <div style={{ width: '100%', maxWidth: '850px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <button onClick={() => setActiveTab('login')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
                      ← Back to Login
                    </button>
                  </div>
                  <HealthCheck />
                </div>
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )}
            </div>
          </div>
        ) : (
          /* Enterprise App Layout: Fixed Sidebar + Content Area */
          <>
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
            />

            <div style={{
              marginLeft: '260px',
              width: 'calc(100% - 260px)',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#0b1120'
            }}>
              <Header
                activeTab={activeTab}
                onOpenHealth={() => setActiveTab('health')}
              />

              <main style={{
                flex: 1,
                padding: '24px 32px',
                maxWidth: '1600px',
                width: '100%',
                margin: '0 auto'
              }}>
                {activeTab === 'dashboard' && <Dashboard user={user} onLogout={handleLogout} onNavigate={setActiveTab} />}
                {activeTab === 'leads' && <Leads />}
                {activeTab === 'opportunities' && <Opportunities />}
                {activeTab === 'quotes' && <Quotes />}
                {activeTab === 'invoices' && <Invoices />}
                {activeTab === 'products' && <Products />}
                {activeTab === 'documents' && <Documents />}
                {activeTab === 'accounts' && <Accounts />}
                {activeTab === 'contacts' && <Contacts />}
                {activeTab === 'geo' && <GeoTracking />}
                {activeTab === 'tasks' && <Tasks />}
                {activeTab === 'meetings' && <Meetings />}
                {activeTab === 'activities' && <Activities />}
                {activeTab === 'companies' && <CompanyMaster />}
                {activeTab === 'employees' && <EmployeeMaster />}
                {activeTab === 'roles' && <RolesMaster />}
                {activeTab === 'reports' && <Reports />}
                {activeTab === 'audit' && <AuditLogs />}
                {activeTab === 'health' && (
                  <div>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600, marginBottom: '14px' }}
                    >
                      ← Back to Dashboard
                    </button>
                    <HealthCheck />
                  </div>
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </ToastProvider>
  );
}
