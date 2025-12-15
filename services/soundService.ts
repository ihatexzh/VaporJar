// Simple Web Audio API synth for VaporJar sound effects

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Helper to resume context if suspended (browser policy)
const resumeCtx = () => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(e => console.error(e));
  }
  return ctx;
};

export const playPopSound = () => {
  const ctx = resumeCtx();
  const t = ctx.currentTime;
  
  // A bubbly, rising "bloop"
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
  
  gain.gain.setValueAtTime(0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
};

export const playSaveSound = () => {
  const ctx = resumeCtx();
  const t = ctx.currentTime;
  
  // A dreamy, ethereal C Major 7 arpeggio (C, E, G, B)
  const notes = [523.25, 659.25, 783.99, 987.77]; 
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Mix of triangle (warm) and sine (pure)
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    const startTime = t + i * 0.1;
    const duration = 1.2;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Long Decay
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
};

export const playStartRecordSound = () => {
  const ctx = resumeCtx();
  const t = ctx.currentTime;
  
  // Rising synth sweep (Power Up)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.linearRampToValueAtTime(660, t + 0.2);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, t);
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.2);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.2);
};

export const playStopRecordSound = () => {
  const ctx = resumeCtx();
  const t = ctx.currentTime;
  
  // Falling synth sweep (Power Down)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(660, t);
  osc.frequency.linearRampToValueAtTime(220, t + 0.2);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, t);

  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.2);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.2);
};

export const playRetroClick = () => {
  const ctx = resumeCtx();
  const t = ctx.currentTime;
  
  // Short high-pitched square blip
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(1000, t);
  
  gain.gain.setValueAtTime(0.05, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
};