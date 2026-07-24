import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Role } from '../context/AppContext';
import { LogIn, Sun, Moon } from 'lucide-react';
import belLogo from '../assets/BEL-Logo-PNG.png';

export const WelcomeScreen: React.FC = () => {
  const { theme, setTheme, setCurrentScreen, setCurrentRole, addNotification } = useApp();

  // State for login credentials
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    // Set the selected operator level role
    setCurrentRole(selectedRole);
    addNotification(`Authentication successful: Logged in as [${selectedRole}]`, 'success');

    // Proceed to product selection catalog
    setCurrentScreen('product-selection');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-on-surface-variant)',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        // High contrast dotted background grid using the updated color-dots variable
        backgroundImage: 'radial-gradient(var(--color-dots) 2px, transparent 2px)',
        backgroundSize: '24px 24px',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* Theme Toggle in Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 10
        }}
      >
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="btn btn-ghost"
          style={{
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon style={{ width: 18, height: 18, color: 'var(--color-surface-bright)' }} />
          ) : (
            <Sun style={{ width: 18, height: 18, color: 'var(--color-surface-bright)' }} />
          )}
        </button>
      </div>

      {/* Main Card Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          width: '100%',
          maxWidth: '480px',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--radius-sm)',
          padding: '48px 40px',
          position: 'relative',
          boxShadow: theme === 'dark' ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Sharp Corner Brackets for physical dashboard instrument style */}
        <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '12px', height: '12px', borderLeft: '3px solid var(--color-primary)', borderTop: '3px solid var(--color-primary)' }} />
        <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '12px', height: '12px', borderRight: '3px solid var(--color-primary)', borderTop: '3px solid var(--color-primary)' }} />
        <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '12px', height: '12px', borderLeft: '3px solid var(--color-primary)', borderBottom: '3px solid var(--color-primary)' }} />
        <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderRight: '3px solid var(--color-primary)', borderBottom: '3px solid var(--color-primary)' }} />

        {/* BEL Logo Section */}
        <div
          style={{
            width: 'calc(100% + 80px)', // Extends to card edges (40px padding on both sides)
            marginTop: '-48px',          // Remove top card padding
            marginLeft: '-40px',
            marginRight: '-40px',
            backgroundColor: '#ffffff',  // Always white
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <img
            src={belLogo}
            alt="BEL Logo"
            style={{
              width: '300px',
              height: '120px',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Title Container with hierarchy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {/* Sub-label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span
              className="text-s font-mono font-black uppercase tracking-widest text-primary-color"
            >
              Industry 4.0
            </span>
          </div>

          {/* Core Title (PMS Big) */}
          <h2
            className="text-3xl font-black uppercase tracking-wider text-bright"
            style={{
              lineHeight: '1.15',
              fontFamily: 'var(--font-display)',
              margin: 0
            }}
          >
            Product Management System
            <br />
          </h2>
        </div>

        {/* Login Form Console */}
        <form onSubmit={handleLoginSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', width: '100%' }}>
            <label className="text-micro font-mono uppercase font-black" style={{ color: 'var(--color-on-surface-variant)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
              placeholder="Operator ID / Admin ID"
              required
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', width: '100%' }}>
            <label className="text-micro font-mono uppercase font-black" style={{ color: 'var(--color-on-surface-variant)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
              placeholder="Security Key"
              required
            />
          </div>

          {/* Role Level Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', width: '100%' }}>
            <label className="text-micro font-mono uppercase font-black" style={{ color: 'var(--color-on-surface-variant)' }}>Access Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="select-field"
              style={{ width: '100%' }}
            >
              <option value="Admin">Admin (Main Demo View)</option>
              <option value="IGQA">IGQA Operator</option>
              <option value="Assembly">Assembly Operator</option>
              <option value="Testing">Testing Operator</option>
              <option value="Final QA">Final QA Lead</option>
            </select>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13px',
              marginTop: '12px'
            }}
          >
            <LogIn style={{ width: 16, height: 16 }} />
            <span>LOGIN</span>
          </button>
        </form>
      </div>
    </div>
  );
};
