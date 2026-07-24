import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Role } from '../context/AppContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  User, 
  Check, 
  LogOut,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentScreen,
    currentRole,
    setCurrentRole,
    theme,
    setTheme,
    products,
    selectedProductId,
    selectedSerial,
    selectedModuleId,
    notifications,
    resolveNotification,
    addNotification,
    setCurrentScreen
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const roles: Role[] = ['Admin', 'IGQA', 'Assembly', 'Testing', 'Final QA'];

  // Current active product object
  const activeProduct = products.find(p => p.id === selectedProductId);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'welcome': return 'Welcome Screen';
      case 'product-selection': return 'Product Management System (PMS)';
      case 'dashboard': return 'Product Dashboard';
      case 'workspace': {
        const activeService = activeProduct?.services.find(s => s.serialNumber === selectedSerial);
        const activeModule  = activeService?.modules.find(m => m.id === selectedModuleId);
        return activeModule ? activeModule.name : 'Module Workspace';
      }
      case 'stage-detail': return 'Stage Workspace / Upload';
      case 'qa-review': return 'QA Approvals Desk';
      case 'admin-master': return 'Master Configuration';
      case 'reports': return 'Reports & Analytics';
      default: return 'PMS Dashboard';
    }
  };

  const unreadCount = notifications.filter(n => !n.resolved).length;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderBottom: '1px solid var(--color-outline-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-page-px)',
        zIndex: 5
      }}
    >
      {/* Page Title & Context Selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentScreen !== 'welcome' && currentScreen !== 'product-selection' && currentScreen !== 'dashboard' && (
          <button
            onClick={() => {
              if (currentScreen === 'workspace') {
                setCurrentScreen('dashboard');
              } else if (currentScreen === 'stage-detail') {
                setCurrentScreen('workspace');
              } else if (currentScreen === 'qa-review' || currentScreen === 'admin-master' || currentScreen === 'reports') {
                setCurrentScreen('dashboard');
              }
            }}
            className="btn btn-ghost"
            style={{ padding: 6, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', marginRight: 4 }}
            title="Go Back"
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
        )}

        {/* Clean Breadcrumb and Title Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentScreen !== 'welcome' && currentScreen !== 'product-selection' && activeProduct && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              <span>Products</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span>{activeProduct.name}</span>
              {selectedSerial && (
                <>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span style={{
                    backgroundColor: 'rgba(56,189,248,0.08)',
                    color: 'var(--color-primary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(56,189,248,0.15)',
                    fontSize: 8,
                    fontWeight: 900
                  }}>
                    {selectedSerial}
                  </span>
                </>
              )}
              {currentScreen === 'workspace' && (
                <>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span>Module Workspace</span>
                </>
              )}
            </div>
          )}
          <h1 className="text-xl font-black uppercase tracking-wider" style={{ margin: 0, lineHeight: 1.1 }}>
            {getScreenTitle()}
          </h1>
        </div>
      </div>

      {/* Toolbar & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-on-surface-variant)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon style={{ width: 18, height: 18 }} /> : <Sun style={{ width: 18, height: 18 }} />}
        </button>

        {/* Notifications Popover Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-on-surface-variant)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              position: 'relative'
            }}
          >
            <Bell style={{ width: 18, height: 18 }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-status-critical-txt)'
                }}
              />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifPopover && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '320px',
                backgroundColor: 'var(--color-surface-container)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 100
              }}
            >
              <div className="flex-between" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
                <span className="text-xs font-black uppercase tracking-wider text-bright">Alarms & Events</span>
                {unreadCount > 0 && (
                  <span className="text-nano font-mono" style={{ padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-status-critical-txt)', borderRadius: '2px' }}>
                    {unreadCount} Alerts
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div className="text-xs text-center" style={{ padding: '20px 0' }}>No active notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '8px',
                        backgroundColor: notif.resolved ? 'transparent' : 'var(--color-surface-container-low)',
                        borderLeft: `3px solid ${
                          notif.type === 'error' 
                            ? 'var(--color-status-critical-txt)' 
                            : notif.type === 'warning' 
                              ? 'var(--color-status-pending-txt)' 
                              : notif.type === 'success' 
                                ? 'var(--color-tertiary)' 
                                : 'var(--color-primary)'
                        }`,
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        opacity: notif.resolved ? 0.6 : 1
                      }}
                    >
                      <div className="flex-between">
                        <span className="text-nano font-mono">{notif.timestamp}</span>
                        {!notif.resolved && (
                          <button
                            onClick={() => resolveNotification(notif.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-tertiary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Acknowledge Alert"
                          >
                            <Check style={{ width: 12, height: 12 }} />
                          </button>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-surface-bright)', lineHeight: '1.3' }}>
                        {notif.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="btn btn-ghost"
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User style={{ width: 14, height: 14 }} />
            <span>ROLE: {currentRole}</span>
            <ChevronDown style={{ width: 12, height: 12 }} />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                backgroundColor: 'var(--color-surface-container)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                width: '180px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100
              }}
            >
              <div 
                style={{ 
                  padding: '8px 12px', 
                  borderBottom: '1px solid var(--color-outline-variant)',
                  color: 'var(--color-on-surface-variant)'
                }}
                className="text-micro font-black uppercase tracking-wider"
              >
                Switch Login Level
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setShowRoleDropdown(false);
                    addNotification(`Access Level updated: Switched role to [${r}].`, 'info');
                  }}
                  style={{
                    padding: '10px 12px',
                    width: '100%',
                    background: currentRole === r ? 'var(--color-surface-container-highest)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: currentRole === r ? 'var(--color-primary)' : 'var(--color-surface-bright)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                  className="sidebar-link"
                >
                  {r}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: '4px' }}>
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    setCurrentScreen('welcome');
                  }}
                  style={{
                    padding: '8px 8px',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--color-status-critical-txt)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 900
                  }}
                  className="sidebar-link"
                >
                  <LogOut style={{ width: 12, height: 12 }} />
                  LOGOUT
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};
