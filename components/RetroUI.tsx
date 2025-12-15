import React from 'react';
import { playRetroClick } from '../services/soundService';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'pastel' | 'cyber';
}

export const RetroWindow: React.FC<WindowProps> = ({ title, children, onClose, className = '', style, variant = 'pastel' }) => {
  const isCyber = variant === 'cyber';

  // Pastel styles (Original)
  const pastelContainer = "bg-white/90 backdrop-blur-sm border-2 border-t-white border-l-white border-r-pink-300 border-b-pink-300 shadow-[8px_8px_0_rgba(244,114,182,0.3)] rounded-lg";
  const pastelTitleBar = "bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white";
  const pastelContent = "bg-pink-50/50";
  const pastelCloseBtn = "bg-white/20 hover:bg-white/40 text-white w-6 h-6 rounded-full border border-white/50";

  // Cyber styles (Y2K / Neon)
  const cyberContainer = "bg-slate-900/95 backdrop-blur-md border-[3px] border-t-cyan-300 border-l-cyan-300 border-r-fuchsia-600 border-b-fuchsia-600 shadow-[0_0_0_1px_rgba(0,0,0,1),8px_8px_0_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.3)] rounded-none";
  const cyberTitleBar = "bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-cyan-300 border-b-2 border-cyan-500/50 tracking-[0.2em]";
  const cyberContent = "bg-[#050505] text-cyan-100";
  const cyberCloseBtn = "bg-red-900/80 hover:bg-red-600 text-red-200 border border-red-500 w-6 h-6 flex items-center justify-center shadow-[0_0_5px_red]";

  return (
    <div 
      className={`${isCyber ? cyberContainer : pastelContainer} flex flex-col overflow-hidden ${className}`}
      style={style}
    >
      <div className={`${isCyber ? cyberTitleBar : pastelTitleBar} px-3 py-2 flex justify-between items-center select-none shadow-sm relative overflow-hidden`}>
        {isCyber && (
           // Scanline overlay for title bar
           <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:4px_100%] pointer-events-none opacity-20"></div>
        )}
        <span className="truncate mr-2 font-bold drop-shadow-md text-lg z-10 flex items-center gap-2">
           {isCyber && <span className="w-2 h-2 bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></span>}
           {isCyber ? title.toUpperCase() : `✿ ${title} ✿`}
        </span>
        {onClose && (
          <button 
            onClick={(e) => { e.stopPropagation(); playRetroClick(); onClose(); }}
            className={`flex items-center justify-center text-xs transition-colors ${isCyber ? cyberCloseBtn : pastelCloseBtn}`}
          >
            {isCyber ? 'X' : '✕'}
          </button>
        )}
      </div>
      <div className={`p-3 flex-grow overflow-auto relative ${isCyber ? cyberContent : pastelContent}`}>
        {isCyber && (
           // CRT Grid Background for content
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-30 z-0"></div>
        )}
        <div className="relative z-10 h-full flex flex-col">
           {children}
        </div>
      </div>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'neon' | 'cyber' | 'cyber-action';
}

export const RetroButton: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const baseStyles = "px-6 py-2 font-['VT323'] text-xl uppercase transition-all transform active:scale-95 border-2 flex items-center justify-center";
  
  let colorStyles = "";
  if (variant === 'primary') {
    colorStyles = "bg-white border-pink-300 text-pink-600 shadow-[4px_4px_0_#f472b6] hover:shadow-[6px_6px_0_#f472b6] hover:-translate-y-0.5 rounded-full";
  } else if (variant === 'danger') {
    colorStyles = "bg-rose-400 border-white text-white shadow-[4px_4px_0_#fda4af] hover:bg-rose-500 rounded-full";
  } else if (variant === 'neon') {
     colorStyles = "bg-white/80 backdrop-blur border-cyan-300 text-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:bg-cyan-50 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] rounded-full";
  } else if (variant === 'cyber') {
     // Matrix/Hacker button
     colorStyles = "bg-black border-green-500 text-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)] hover:bg-green-900/20 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] rounded-none font-bold tracking-wider";
  } else if (variant === 'cyber-action') {
     // High contrast action button
     colorStyles = "bg-fuchsia-600 border-fuchsia-400 text-white shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:bg-fuchsia-500 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(0,0,0,0.5)] rounded-none";
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playRetroClick();
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className={`${baseStyles} ${colorStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};