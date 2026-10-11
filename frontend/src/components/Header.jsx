import React from 'react';
import { Activity, Bell, Sparkles } from 'lucide-react';

export default function Header({ activeTab, onOpenHealth }) {
  const titles = {
    dashboard: { title: 'Executive Dashboard', category: 'Overview' },
    leads: { title: 'Leads & Qualification', category: 'Sales Pipeline' },
    opportunities: { title: 'Deals & Opportunities Pipeline', category: 'Sales Pipeline' },
    quotes: { title: 'Commercial Proposals & Quotes', category: 'Sales Pipeline' },
    invoices: { title: 'Invoicing & Payments', category: 'Commerce & Billing' },
    products: { title: 'Product & Service Catalog', category: 'Commerce & Billing' },
    accounts: { title: 'Customer Accounts', category: 'Customer Directory' },
    contacts: { title: 'Contacts Directory', category: 'Customer Directory' },
    documents: { title: 'Document & Contract Vault', category: 'Customer Directory' },
    geo: { title: 'Field Force Geo Tracking', category: 'Field & Operations' },
    tasks: { title: 'Task Management', category: 'Field & Operations' },
    meetings: { title: 'Meeting Schedules', category: 'Field & Operations' },
    activities: { title: 'Sales Activity History', category: 'Field & Operations' },
    companies: { title: 'Company Master', category: 'Administration' },
    employees: { title: 'Employee Management', category: 'Administration' },
    roles: { title: 'Roles & RBAC Permissions', category: 'Administration' },
    reports: { title: 'Analytics & Reports', category: 'Administration' },
    audit: { title: 'System Audit Trail', category: 'Administration' },
    health: { title: 'System Health & Diagnostics', category: 'Diagnostics' },
  };

  const current = titles[activeTab] || { title: 'CRM 360 Workspace', category: 'CRM' };

  return (
    <header style={{
      height: '64px',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Breadcrumb & Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
          {current.category}
        </span>
        <span style={{ color: '#475569' }}>/</span>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
          {current.title}
        </h1>
      </div>

      {/* Right Tools & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Backend & SQL Server Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '5px 12px',
          borderRadius: '20px'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
            MS SQL Server Connected
          </span>
        </div>

        {/* Health Diagnostic Button */}
        <button
          onClick={onOpenHealth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#a5b4fc',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
        >
          <Activity size={14} />
          <span>System Health</span>
        </button>
      </div>
    </header>
  );
}
