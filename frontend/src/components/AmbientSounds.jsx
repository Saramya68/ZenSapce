import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Radio } from 'lucide-react';
import GlassCard from './GlassCard';

const AmbientSounds = () => {
  const [isPlaying, setIsPlaying] = useState({
    rain: false,
    waves: false,
    binaural: false
  });
  const [volumes, setVolumes] = useState({
    rain: 0.5,
    waves: 0.5,
    binaural: 0.3
  });

  // Reference to standard HTML5 Audio elements
  const audioRefs = useRef({
    rain: new Audio('https://assets.mixkit.co/active_storage/sfx/2433/2433-600.wav'),
    waves: new Audio('https://assets.mixkit.co/active_storage/sfx/1188/1188-600.wav'),
    binaural: new Audio('https://assets.mixkit.co/active_storage/sfx/2566/2566-600.wav')
  });

  // Configure loops and cleanup on mount/unmount
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.loop = true;
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
    };
  }, []);

  // Handle toggling sound files
  const handleToggle = (soundType) => {
    const audio = audioRefs.current[soundType];
    if (!audio) return;

    setIsPlaying(prev => {
      const nextState = !prev[soundType];
      if (nextState) {
        audio.volume = volumes[soundType];
        audio.play().catch(e => console.log('Audio playback delayed:', e));
      } else {
        audio.pause();
      }
      return { ...prev, [soundType]: nextState };
    });
  };

  // Adjust volumes in real-time
  const handleVolumeChange = (soundType, value) => {
    const vol = parseFloat(value);
    setVolumes(prev => ({ ...prev, [soundType]: vol }));

    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.volume = vol;
    }
  };

  const soundsList = [
    { id: 'rain', label: 'Celestial Rain', icon: <CloudRain size={18} color="var(--accent-purple)" />, color: 'var(--accent-purple)' },
    { id: 'waves', label: 'Cosmic Waves', icon: <Waves size={18} color="var(--accent-cyan)" />, color: 'var(--accent-cyan)' },
    { id: 'binaural', label: 'Binaural Focus', icon: <Radio size={18} color="var(--accent-pink)" />, color: 'var(--accent-pink)' }
  ];

  const hasActiveSound = isPlaying.rain || isPlaying.waves || isPlaying.binaural;

  return (
    <GlassCard padding="1.25rem" glow={hasActiveSound} glowColor="cyan">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Volume2 size={20} className="glow-text-cyan" color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Ambient Sounds</h2>
        </div>
        
        {/* Active Wave Animation Indicator */}
        {hasActiveSound ? (
          <div className="sound-waves">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <VolumeX size={16} color="var(--text-muted)" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {soundsList.map(sound => {
          const active = isPlaying[sound.id];
          return (
            <div 
              key={sound.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: active ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.15)',
                border: '1px solid',
                borderColor: active ? sound.color : 'var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)'
              }}
            >
              {/* Play Toggle Button & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '45%' }}>
                <button
                  onClick={() => handleToggle(sound.id)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: active ? sound.color : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: active ? '#000' : 'var(--text-secondary)',
                    transition: 'var(--transition-fast)'
                  }}
                  title={active ? 'Pause sound' : 'Play sound'}
                >
                  {sound.icon}
                </button>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'var(--text-secondary)'
                }}>
                  {sound.label}
                </span>
              </div>

              {/* Volume Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '50%' }}>
                <VolumeX size={12} color="var(--text-muted)" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes[sound.id]}
                  onChange={(e) => handleVolumeChange(sound.id, e.target.value)}
                  disabled={!active}
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    accentColor: active ? sound.color : 'var(--text-muted)',
                    cursor: active ? 'pointer' : 'not-allowed',
                    padding: 0
                  }}
                />
                <Volume2 size={12} color="var(--text-secondary)" />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default AmbientSounds;
