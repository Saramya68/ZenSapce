import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Activity } from 'lucide-react';
import GlassCard from './GlassCard';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { msg: text || `HTTP error! Status: ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.msg || 'Something went wrong');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      width: '100%',
      padding: '1rem'
    }}>
      <GlassCard 
        className="animate-fade-in" 
        glow={true} 
        glowColor="purple"
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--gradient-primary)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Activity size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
            {isLogin ? 'Welcome Back' : 'Create Sanctuary'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isLogin ? 'Step into your focused workspace' : 'Start tracking focus, habits, and tasks'}
          </p>
        </div>

        {/* Error box */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--accent-red)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username (Only for Sign Up) */}
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
              marginTop: '0.5rem', 
              width: '100%',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Auth Toggle */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <span>{isLogin ? "Don't have an account? " : 'Already registered? '}</span>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Auth;
