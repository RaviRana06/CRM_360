import React from 'react';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  FileText,
  Receipt,
  Package,
  FolderArchive,
  Building2,
  Contact,
  MapPin,
  CheckSquare,
  Calendar,
  History,
  Building,
  Users,
  ShieldCheck,
  BarChart3,
  ScrollText,
  LogOut,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, user, onLogout }) {
  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'SALES & PIPELINE',
      items: [
        { id: 'leads', label: 'Leads', icon: Target },
        { id: 'opportunities', label: 'Pipeline Deals', icon: TrendingUp },
        { id: 'quotes', label: 'Quotations', icon: FileText }
      ]
    },
    {
      title: 'COMMERCE & BILLING',
      items: [
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'products', label: 'Product Catalog', icon: Package }
      ]
    },
    {
      title: 'CUSTOMER DIRECTORY',
      items: [
        { id: 'accounts', label: 'Accounts', icon: Building2 },
        { id: 'contacts', label: 'Contacts', icon: Contact },
        { id: 'documents', label: 'Document Vault', icon: FolderArchive }
      ]
    },
    {
      title: 'FIELD & OPERATIONS',
      items: [
        { id: 'geo', label: 'Geo Tracking', icon: MapPin },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'meetings', label: 'Meetings', icon: Calendar },
        { id: 'activities', label: 'Activity Logs', icon: History }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'companies', label: 'Companies', icon: Building },
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
        { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'audit', label: 'Audit Trail', icon: ScrollText }
      ]
    }
  ];

  const getInitials = (first, last) => {
    return `${(first || 'U')[0]}${(last || 'S')[0]}`.toUpperCase();
  };

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'linear-gradient(180deg, #0d1527 0%, #0f172a 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      userSelect: 'none'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px 16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.05rem',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          360
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.3px' }}>
              CRM 360
            </h2>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              PRO
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            Enterprise Edition
          </span>
        </div>
      </div>

      {/* Navigation Menu Groups (Scrollable) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }} className="custom-sidebar-scroll">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: '#64748b',
              padding: '0 10px 6px 10px',
              letterSpacing: '0.08em'
            }}>
              {group.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.08) 100%)'
                        : 'transparent',
                      color: isActive ? '#818cf8' : '#94a3b8',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <Icon size={16} color={isActive ? '#818cf8' : '#64748b'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile & Footer Area */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0
            }}>
              {user ? getInitials(user.first_name, user.last_name) : 'AD'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {user?.role || 'Administrator'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
