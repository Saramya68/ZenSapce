import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award, CheckCircle, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import GlassCard from './GlassCard';

const PomodoroTimer = ({ onSessionComplete }) => {
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [category, setCategory] = useState('Coding');
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  const timerRef = useRef(null);
  
  // Timer settings in seconds
  const settings = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  // SVG Progress Ring calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const maxSeconds = settings[mode];
  const progressPercent = ((maxSeconds - timeLeft) / maxSeconds) * 100;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Handle timer ticks
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  // Reset timer on mode change
  useEffect(() => {
    setIsRunning(false);
    setTimeLeft(settings[mode]);
  }, [mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode]);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play alert sound using browser Synth API if possible, or HTML5 Audio
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio feedback could not be played automatically:', e);
    }

    // Trigger fireworks confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a78bfa', '#06b6d4', '#ec4899']
    });

    if (mode === 'focus') {
      setTodayCompletedCount(prev => prev + 1);
      // Notify parent to log the focus session in the database
      onSessionComplete({
        duration: Math.round(settings.focus / 60),
        category
      });
      // Automatically switch to short break
      setMode('shortBreak');
    } else {
      // Switch back to focus
      setMode('focus');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getModeGradient = () => {
    if (mode === 'focus') return 'var(--gradient-pomo)';
    return 'var(--gradient-rest)';
  };

  return (
    <GlassCard padding="1.5rem" glow={isRunning} glowColor={mode === 'focus' ? 'pink' : 'cyan'}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        
        {/* Toggle Mode Buttons */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '0.25rem',
          borderRadius: '9999px',
          border: '1px solid var(--glass-border)',
          width: '100%'
        }}>
          {['focus', 'shortBreak', 'longBreak'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                borderRadius: '9999px',
                border: 'none',
                background: mode === m ? getModeGradient() : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'capitalize'
              }}
            >
              {m === 'shortBreak' ? 'Short Break' : m === 'longBreak' ? 'Long Break' : 'Focus'}
            </button>
          ))}
        </div>

        {/* Circular Countdown Progress */}
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0.5rem 0' }}>
          <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="8"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={mode === 'focus' ? 'url(#pomoGradient)' : 'url(#restGradient)'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease' }}
            />
            {/* Gradients */}
            <defs>
              <linearGradient id="pomoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Inner Text Timer */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: '#fff',
              lineHeight: 1
            }}>
              {formatTime(timeLeft)}
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '5px'
            }}>
              {mode === 'focus' ? 'Flowing' : 'Resting'}
            </span>
          </div>
        </div>

        {/* Category selector for focus sessions */}
        {mode === 'focus' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Focus Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ 
                fontSize: '0.8rem', 
                padding: '0.4rem 0.75rem', 
                textAlign: 'center',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '8px'
              }}
            >
              <option value="Coding">💻 Coding</option>
              <option value="Design">🎨 Design</option>
              <option value="Planning">📅 Planning</option>
              <option value="Learning">📚 Learning</option>
              <option value="Review">🔍 Review</option>
              <option value="Other">⚙️ Other</option>
            </select>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
          <button 
            onClick={resetTimer} 
            className="btn-icon" 
            style={{ width: '40px', height: '40px' }}
            title="Reset timer"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={toggleTimer}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              border: 'none',
              background: getModeGradient(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)',
              transform: isRunning ? 'scale(0.95)' : 'scale(1)',
              transition: 'var(--transition-fast)'
            }}
          >
            {isRunning ? <Pause size={22} color="#fff" /> : <Play size={22} color="#fff" style={{ marginLeft: '4px' }} />}
          </button>

          <div 
            className="btn-icon" 
            style={{ width: '40px', height: '40px', color: todayCompletedCount > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}
            title={`Completed ${todayCompletedCount} sessions today`}
          >
            <Flame size={20} fill={todayCompletedCount > 0 ? 'var(--accent-yellow)' : 'none'} />
          </div>
        </div>

        {/* Daily Session Counter Footer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          fontSize: '0.8rem', 
          color: 'var(--text-secondary)',
          marginTop: '0.5rem'
        }}>
          <Award size={14} color="var(--accent-violet)" />
          <span>Completed today: <strong>{todayCompletedCount}</strong></span>
        </div>

      </div>
    </GlassCard>
  );
};

export default PomodoroTimer;
