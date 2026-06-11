import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Radio, Activity } from 'lucide-react';
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

  const audioCtxRef = useRef(null);
  
  // Audio Node references
  const nodesRef = useRef({
    rainSource: null,
    rainGain: null,
    wavesSource: null,
    wavesGain: null,
    binauralOsc1: null,
    binauralOsc2: null,
    binauralGain: null
  });

  // Init Audio Context on first interaction
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Helper to generate white noise buffer
  const createNoiseBuffer = (ctx) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  };

  // Start Rain Synth
  const startRain = (ctx) => {
    const buffer = createNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to make it sound like rain (lowpass and highpass combo)
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.value = 1200;

    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = 200;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volumes.rain;

    source.connect(hpFilter);
    hpFilter.connect(lpFilter);
    lpFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();

    nodesRef.current.rainSource = source;
    nodesRef.current.rainGain = gainNode;
  };

  // Stop Rain Synth
  const stopRain = () => {
    if (nodesRef.current.rainSource) {
      try {
        nodesRef.current.rainSource.stop();
        nodesRef.current.rainSource.disconnect();
      } catch (e) {}
      nodesRef.current.rainSource = null;
    }
    nodesRef.current.rainGain = null;
  };

  // Start Waves Synth
  const startWaves = (ctx) => {
    const buffer = createNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter waves (lowpass sweep)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    // Create LFO to simulate ocean wave swelling (slow sweep)
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08; // 12.5 seconds per wave cycle
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200; // Sweep width +/- 200Hz

    const gainNode = ctx.createGain();
    gainNode.gain.value = volumes.waves;

    // Connect LFO modulation
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.start();
    source.start();

    nodesRef.current.wavesSource = source;
    nodesRef.current.wavesLfo = lfo;
    nodesRef.current.wavesGain = gainNode;
  };

  // Stop Waves Synth
  const stopWaves = () => {
    if (nodesRef.current.wavesSource) {
      try {
        nodesRef.current.wavesSource.stop();
        nodesRef.current.wavesSource.disconnect();
        nodesRef.current.wavesLfo.stop();
        nodesRef.current.wavesLfo.disconnect();
      } catch (e) {}
      nodesRef.current.wavesSource = null;
      nodesRef.current.wavesLfo = null;
    }
    nodesRef.current.wavesGain = null;
  };

  // Start Binaural beats Focus hum (detuned Left/Right channels)
  const startBinaural = (ctx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    
    osc1.type = 'sine';
    osc1.frequency.value = 100; // 100 Hz carrier frequency

    osc2.type = 'sine';
    osc2.frequency.value = 104; // 104 Hz for a 4 Hz (Theta) binaural beat difference

    // Panners to direct waves to specific ears
    const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volumes.binaural;

    if (panner1 && panner2) {
      panner1.pan.value = -1; // Left
      panner2.pan.value = 1; // Right

      osc1.connect(panner1);
      panner1.connect(gainNode);

      osc2.connect(panner2);
      panner2.connect(gainNode);
    } else {
      // Fallback if panners are not supported
      osc1.connect(gainNode);
      osc2.connect(gainNode);
    }

    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    nodesRef.current.binauralOsc1 = osc1;
    nodesRef.current.binauralOsc2 = osc2;
    nodesRef.current.binauralGain = gainNode;
  };

  // Stop Binaural
  const stopBinaural = () => {
    if (nodesRef.current.binauralOsc1 && nodesRef.current.binauralOsc2) {
      try {
        nodesRef.current.binauralOsc1.stop();
        nodesRef.current.binauralOsc2.stop();
        nodesRef.current.binauralOsc1.disconnect();
        nodesRef.current.binauralOsc2.disconnect();
      } catch (e) {}
      nodesRef.current.binauralOsc1 = null;
      nodesRef.current.binauralOsc2 = null;
    }
    nodesRef.current.binauralGain = null;
  };

  // Handle toggling sounds
  const handleToggle = (soundType) => {
    initAudioContext();
    const ctx = audioCtxRef.current;

    setIsPlaying(prev => {
      const nextState = { ...prev, [soundType]: !prev[soundType] };
      
      // Execute the audio action
      if (soundType === 'rain') {
        nextState.rain ? startRain(ctx) : stopRain();
      } else if (soundType === 'waves') {
        nextState.waves ? startWaves(ctx) : stopWaves();
      } else if (soundType === 'binaural') {
        nextState.binaural ? startBinaural(ctx) : stopBinaural();
      }

      return nextState;
    });
  };

  // Adjust volumes in real-time
  const handleVolumeChange = (soundType, value) => {
    const vol = parseFloat(value);
    setVolumes(prev => ({ ...prev, [soundType]: vol }));

    if (soundType === 'rain' && nodesRef.current.rainGain) {
      nodesRef.current.rainGain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
    } else if (soundType === 'waves' && nodesRef.current.wavesGain) {
      nodesRef.current.wavesGain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
    } else if (soundType === 'binaural' && nodesRef.current.binauralGain) {
      nodesRef.current.binauralGain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
    }
  };

  // Clean up nodes on unmount
  useEffect(() => {
    return () => {
      stopRain();
      stopWaves();
      stopBinaural();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

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
        
        {/* Active Synth Waves Indicator */}
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
