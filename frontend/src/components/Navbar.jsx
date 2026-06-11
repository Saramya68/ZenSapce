import React from 'react';
import { LogOut, User, Zap, Activity } from 'lucide-react';

const Navbar = ({ user, onLogout, totalFocusTime = 0 }) => {
  const formatHours = (mins) => {
    if (mins < 60) return `${mins}m`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs}h`;
  };

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 2rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-glass)',
      animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'var(--gradient-primary)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Activity size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--accent-purple)' }}>Zen</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Space</span>
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Flow State Sanctuary
          </span>
        </div>
      </div>

      {/* User Status and Actions */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Quick Stats badges */}
          <div style={{ display: 'flex', gap: '0.75rem' }} className="nav-badges-container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: 'var(--accent-cyan)'
            }}>
              <Zap size={14} fill="var(--accent-cyan)" />
              <span>Streak Board Active</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: 'var(--accent-violet)'
            }}>
              <User size={14} />
              <span>{user.username}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '24px', width: '1px', background: 'var(--glass-border)' }}></div>

          {/* Logout Action */}
          <button 
            onClick={onLogout} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
