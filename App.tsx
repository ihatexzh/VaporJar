import React, { useState, useEffect, useRef } from 'react';
import { Settings, PenTool, Mic, Music, X, Sparkles, MessageCircle, Save, Heart } from 'lucide-react';
import { Memory, MemoryType, ShapeType, OracleResponse } from './types';
import { RetroWindow, RetroButton } from './components/RetroUI';
import { CanvasDraw } from './components/CanvasDraw';
import { AudioRecorder } from './components/AudioRecorder';
import { consultOracle } from './services/geminiService';
import { playPopSound, playSaveSound, playRetroClick } from './services/soundService';

// --- Background Component ---
const VaporBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
    <div className="vapor-grid opacity-40"></div>
    {/* Soft Aura Orbs */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-[pulse_8s_infinite]"></div>
    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-[pulse_10s_infinite_reverse]"></div>
    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-[bounce_15s_infinite]"></div>
    
    {/* Floating Elements */}
    <div className="absolute top-10 left-10 text-pink-400/50 font-['VT323'] text-2xl tracking-[0.5em] animate-pulse">LOADING...</div>
    <div className="absolute bottom-10 right-10 text-purple-400/30 font-['Zen_Tokyo_Zoo'] text-6xl opacity-50 rotate-[-5deg]">DREAMS</div>
  </div>
);

// --- Jar Component ---
interface JarProps {
  memoryCount: number;
  onShake: () => void;
  onClick: () => void;
  isShaking: boolean;
}

const Jar: React.FC<JarProps> = ({ memoryCount, onShake, onClick, isShaking }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const jarRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const shakeEnergy = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });

  // Mouse/Touch Drag Logic
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
    lastPos.current = { x: clientX, y: clientY };
    lastTime.current = Date.now();
    shakeEnergy.current = 0;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const now = Date.now();
    const dt = now - lastTime.current;
    
    // Update position immediately for responsiveness
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });

    if (dt > 0) {
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      
      // Calculate velocity
      const vx = dx / dt;
      const vy = dy / dt;
      velocityRef.current = { x: vx, y: vy };
      
      // Physics-based Tilt: Tilt based on horizontal velocity
      // Max tilt 20 degrees, smoothed
      const targetRotation = Math.max(-20, Math.min(20, vx * 10));
      setRotation(targetRotation);

      // Shake Detection Logic
      // We look for high instantaneous speed or rapid changes in direction
      const speed = Math.hypot(dx, dy);
      
      // Accumulate energy if moving fast
      if (speed > 10) { 
        shakeEnergy.current += speed;
      } else {
        // Decay energy if moving slow
        shakeEnergy.current = Math.max(0, shakeEnergy.current - 5);
      }

      // Trigger shake if energy threshold met
      if (shakeEnergy.current > 300 && !isShaking) {
        if (navigator.vibrate) {
            try { navigator.vibrate(50); } catch(e) {} 
        }
        onShake();
        shakeEnergy.current = 0; // Reset after trigger
      }

      lastPos.current = { x: clientX, y: clientY };
      lastTime.current = now;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setRotation(0); // Snap back to upright
    shakeEnergy.current = 0;
  };

  // Generate random pixel blobs (squares) inside the jar
  const renderMemories = () => {
    const blobs = [];
    // Limit visible blobs for performance
    const count = Math.min(memoryCount, 40); 
    for (let i = 0; i < count; i++) {
       const left = Math.random() * 80 + 10;
       const top = Math.random() * 80 + 10;
       // Pixel palette: Bright and cute
       const color = ['#ff7eb3', '#7afcff', '#feff9c', '#fff740', '#bd93f9'][Math.floor(Math.random() * 5)];
       const size = Math.random() * 1 + 0.5; // 0.5rem to 1.5rem
       blobs.push(
         <div 
           key={i}
           className="absolute rounded-none transition-all duration-1000 border border-black/20"
           style={{
             backgroundColor: color,
             left: `${left}%`,
             top: `${top}%`,
             width: `${size}rem`,
             height: `${size}rem`,
             transform: `translate(-50%, -50%) rotate(${Math.floor(Math.random() * 4) * 90}deg)`, // Rotate 0, 90, 180, 270 for pixel feel
             boxShadow: `2px 2px 0px rgba(0,0,0,0.1)`
           }}
         />
       );
    }
    return blobs;
  };

  const borderColor = '#2d1b4e'; // Dark Deep Purple for high contrast

  return (
    <div 
      className="absolute top-1/2 left-1/2 cursor-move z-20 touch-none"
      style={{ 
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Bouncy snapback
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      <div 
        ref={jarRef}
        onClick={onClick}
        className={`relative flex flex-col items-center transition-transform ${isShaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''} hover:scale-105 active:scale-95`}
      >
        {/* Pixel Lid */}
        <div 
           className="w-32 h-8 bg-pink-300 relative z-20"
           style={{ 
             border: `4px solid ${borderColor}`,
             boxShadow: `inset -4px -4px 0px rgba(0,0,0,0.1)`
           }}
        >
          {/* Lid Highlight */}
          <div className="absolute top-1 left-2 w-20 h-2 bg-white/60"></div>
        </div>

        {/* Pixel Neck */}
        <div 
           className="w-40 h-4 bg-blue-100/80 z-10"
           style={{ 
             borderLeft: `4px solid ${borderColor}`,
             borderRight: `4px solid ${borderColor}`,
           }}
        ></div>

        {/* Pixel Body */}
        <div 
           className="w-56 h-72 bg-blue-50/60 backdrop-blur-md relative overflow-hidden"
           style={{ 
             border: `4px solid ${borderColor}`,
             boxShadow: `8px 8px 0px rgba(45, 27, 78, 0.2)`
           }}
        >
          {/* Glass Highlights (Pixel Style) */}
          <div className="absolute top-4 right-4 w-4 h-24 bg-white/80"></div>
          <div className="absolute top-4 right-10 w-2 h-8 bg-white/60"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/60"></div>

          {/* Memories inside */}
          <div className="w-full h-full relative p-2">
             {renderMemories()}
          </div>

          {/* Liquid Level (Decoration) */}
          <div className="absolute bottom-0 left-0 w-full h-4 bg-pink-200/30 border-t-4 border-pink-300/50 pointer-events-none"></div>
        </div>

        {/* Pixel Label */}
        <div className="absolute bottom-12 bg-white px-3 py-1 border-4 border-dashed border-pink-400 shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
          <span className="text-pink-600 font-bold font-['VT323'] text-xl tracking-widest whitespace-nowrap uppercase">
             Memories: {memoryCount}
          </span>
        </div>
      </div>
      
      {/* Helper Text */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-[#2d1b4e] text-white font-['VT323'] text-lg px-4 py-1 border-2 border-white shadow-[4px_4px_0_#ff7eb3] whitespace-nowrap">
           DRAG TO SHAKE ✦ CLICK TO OPEN
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [mode, setMode] = useState<'IDLE' | 'CREATING' | 'VIEWING'>('IDLE');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [currentMemory, setCurrentMemory] = useState<Memory | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [oracleResult, setOracleResult] = useState<OracleResponse | null>(null);
  const [oracleLoading, setOracleLoading] = useState(false);

  // Creation State
  const [createType, setCreateType] = useState<MemoryType>(MemoryType.TEXT);
  const [textContent, setTextContent] = useState("");
  const [mediaContent, setMediaContent] = useState(""); // For drawing/audio
  const [selectedShape, setSelectedShape] = useState<ShapeType>(ShapeType.RECT);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('vaporjar_memories');
    if (saved) {
      setMemories(JSON.parse(saved));
    }
  }, []);

  const saveMemory = () => {
    if ((createType === MemoryType.TEXT && !textContent) || 
        (createType !== MemoryType.TEXT && !mediaContent)) return;

    playSaveSound();

    // Pastel backgrounds for memories
    const pastels = ['#fce7f3', '#e0e7ff', '#fae8ff', '#dcfce7', '#ffedd5'];
    
    const newMemory: Memory = {
      id: Date.now().toString(),
      type: createType,
      content: createType === MemoryType.TEXT ? textContent : mediaContent,
      timestamp: Date.now(),
      shape: selectedShape,
      styleColor: pastels[Math.floor(Math.random() * pastels.length)]
    };

    const updated = [...memories, newMemory];
    setMemories(updated);
    localStorage.setItem('vaporjar_memories', JSON.stringify(updated));
    setMode('IDLE');
    setTextContent("");
    setMediaContent("");
  };

  const popRandomMemory = () => {
    if (memories.length === 0) {
      alert("The jar is empty... create a memory first.");
      return;
    }
    
    setIsShaking(true);
    // Haptic feedback for the "pop"
    if (navigator.vibrate) {
        try { navigator.vibrate([30, 50, 30]); } catch(e) {}
    }

    setTimeout(() => {
      setIsShaking(false);
      playPopSound(); // Sound effect
      const randomIndex = Math.floor(Math.random() * memories.length);
      setCurrentMemory(memories[randomIndex]);
      setOracleResult(null); // Reset oracle
      setMode('VIEWING');
    }, 800);
  };

  const handleAskOracle = async () => {
    if (!currentMemory) return;
    setOracleLoading(true);
    const result = await consultOracle(currentMemory.content, currentMemory.type);
    setOracleResult(result);
    setOracleLoading(false);
  };

  const getShapeStyles = (shape: ShapeType) => {
    switch (shape) {
      case ShapeType.CIRCLE: return { borderRadius: '50%', aspectRatio: '1/1', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };
      case ShapeType.HEART: return {}; // Handled by container
      case ShapeType.STAR: return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', padding: '3rem', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' };
      default: return {};
    }
  };

  // Render content based on type
  const renderMemoryContent = (mem: Memory) => {
    let content;
    if (mem.type === MemoryType.TEXT) content = <p className="font-['VT323'] text-2xl leading-relaxed whitespace-pre-wrap text-center text-purple-900">{mem.content}</p>;
    else if (mem.type === MemoryType.DRAWING) content = <img src={mem.content} alt="Memory" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />;
    else if (mem.type === MemoryType.AUDIO) content = <audio controls src={mem.content} className="w-full mt-4" />;
    
    return (
      <div className="memory-glitch-wrapper w-full h-full flex items-center justify-center p-2 relative overflow-hidden">
         <div className="memory-scanline w-full"></div>
         {content}
      </div>
    );
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden text-slate-800 font-['VT323']">
      <div className="scanlines mix-blend-soft-light"></div>
      <div className="crt-flicker"></div>
      <VaporBackground />

      {/* Main UI */}
      {mode === 'IDLE' && (
        <>
          <div className="absolute top-6 right-6 z-30">
            <RetroButton onClick={() => setMode('CREATING')} variant="neon">
              <span className="flex items-center gap-2 tracking-wider"><Sparkles size={18}/> New Memory</span>
            </RetroButton>
          </div>
          
          <Jar 
            memoryCount={memories.length} 
            onShake={popRandomMemory} 
            onClick={popRandomMemory}
            isShaking={isShaking}
          />
        </>
      )}

      {/* Creator Modal */}
      {mode === 'CREATING' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-purple-900/10 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <RetroWindow 
            title="Design Your Memory" 
            onClose={() => setMode('IDLE')}
            className="w-full max-w-2xl h-[85vh] shadow-2xl"
          >
            <div className="flex flex-col h-full gap-4 p-2">
              {/* Type Selectors */}
              <div className="flex justify-center gap-4 border-b border-pink-200 pb-4">
                {[
                  { type: MemoryType.TEXT, icon: MessageCircle, label: 'Text' },
                  { type: MemoryType.DRAWING, icon: PenTool, label: 'Draw' },
                  { type: MemoryType.AUDIO, icon: Mic, label: 'Voice' }
                ].map((item) => (
                  <button 
                    key={item.type}
                    onClick={() => { playRetroClick(); setCreateType(item.type); }}
                    className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border-2 transition-all ${
                      createType === item.type 
                      ? 'bg-pink-100 border-pink-400 text-pink-600 shadow-inner scale-95' 
                      : 'bg-white border-white text-gray-400 hover:text-pink-400 hover:bg-pink-50'
                    }`}
                  >
                    <item.icon size={24}/>
                    <span className="text-lg">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Shape Selector */}
              <div className="flex items-center justify-center gap-4 bg-white/50 p-2 rounded-full border border-white mx-auto">
                <span className="text-pink-400 uppercase tracking-widest text-lg px-2">Shape:</span>
                {[ShapeType.RECT, ShapeType.CIRCLE, ShapeType.STAR].map(s => (
                  <button 
                    key={s}
                    onClick={() => { playRetroClick(); setSelectedShape(s);