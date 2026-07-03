import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Screen } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Layers, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, currentRole } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roleRestricted: false },
    { id: 'workspace', label: 'Module Workspace', icon: Layers, roleRestricted: false },
    { id: 'qa-review', label: 'QA Review Panel', icon: ClipboardCheck, roleRestricted: false },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roleRestricted: false },
  ];

  const adminItems = [
    { id: 'admin-master', label: 'Admin Configuration', icon: Settings, roleRestricted: true }
  ];

  const handleNavClick = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 64 },
  };

  return (
    <motion.div
      className="theme-dark" // The sidebar is always dark in the Prometrix style for high-tech instrumentation look
      animate={collapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderRight: '1px solid var(--color-outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 10,
        position: 'relative'
      }}
    >
      {/* Brand Header */}
      <div 
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-outline-variant)',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck style={{ color: 'var(--color-primary)', width: 24, height: 24 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="text-base font-black uppercase tracking-widest text-bright"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                PROMETRIX <span style={{ color: 'var(--color-primary)' }}>PMS</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Group: Main */}
      <div style={{ padding: '24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-micro font-black uppercase tracking-widest"
              style={{ padding: '0 20px 8px 20px', color: 'var(--color-on-surface-variant)' }}
            >
              Main Workspace
            </motion.div>
          )}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id || (item.id === 'workspace' && currentScreen === 'stage-detail');
              
              // QA Panel highlights to direct attention if user is Final QA
              const isHighlightQA = item.id === 'qa-review' && currentRole === 'Final QA';

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id as Screen)}
                    style={{
                      width: '100%',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 20px',
                      background: isActive ? 'var(--color-surface-container)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      color: isActive ? 'var(--color-surface-bright)' : 'var(--color-on-surface-variant)',
                      position: 'relative',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    className="sidebar-link"
                  >
                    <Icon 
                      style={{ 
                        width: 18, 
                        height: 18, 
                        minWidth: 18,
                        color: isActive 
                          ? 'var(--color-primary)' 
                          : isHighlightQA 
                            ? 'var(--color-status-pending-txt)' 
                            : 'var(--color-on-surface-variant)' 
                      }} 
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="text-sm font-medium"
                          style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}
                        >
                          {item.label}
                          {isHighlightQA && (
                            <span 
                              style={{ 
                                marginLeft: '6px', 
                                display: 'inline-block', 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '999px',
                                backgroundColor: 'var(--color-status-pending-txt)'
                              }} 
                            />
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Navigation Group: Administration */}
        <div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-micro font-black uppercase tracking-widest"
              style={{ padding: '0 20px 8px 20px', color: 'var(--color-on-surface-variant)' }}
            >
              Administration
            </motion.div>
          )}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {adminItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              // Only highlight if role matches or admin
              const isDisabled = currentRole !== 'Admin';

              return (
                <li key={item.id}>
                  <button
                    onClick={() => !isDisabled && handleNavClick(item.id as Screen)}
                    disabled={isDisabled}
                    style={{
                      width: '100%',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 20px',
                      background: isActive ? 'var(--color-surface-container)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      color: isActive 
                        ? 'var(--color-surface-bright)' 
                        : isDisabled 
                          ? 'rgba(156, 163, 175, 0.25)' 
                          : 'var(--color-on-surface-variant)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    className="sidebar-link"
                  >
                    <Icon style={{ width: 18, height: 18, minWidth: 18, color: isActive ? 'var(--color-primary)' : 'inherit' }} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="text-sm font-medium"
                          style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}
                        >
                          {item.label}
                          {isDisabled && (
                            <span 
                              className="text-nano font-mono uppercase" 
                              style={{ 
                                marginLeft: '8px', 
                                padding: '2px 4px', 
                                border: '1px solid rgba(156,163,175,0.15)',
                                color: 'rgba(156, 163, 175, 0.4)',
                                borderRadius: '2px'
                              }}
                            >
                              Lock
                            </span>
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div 
        style={{
          borderTop: '1px solid var(--color-outline-variant)',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '0 16px'
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-on-surface-variant)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          className="sidebar-link"
        >
          {collapsed ? <ChevronRight style={{ width: 18, height: 18 }} /> : <ChevronLeft style={{ width: 18, height: 18 }} />}
        </button>
      </div>
    </motion.div>
  );
};
