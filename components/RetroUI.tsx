import React from 'react';
import { playRetroClick } from '../services/soundService';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const RetroWindow: React.FC<WindowProps> = ({ title, children, onClose, className = '', style }) => {
  return (
    <div 
      className={`bg-white/90 backdrop-blur-sm border-2 border-t-white border-l-white border-r-pink-300 border-b-pink-300 shadow-[8px_8px_0_rgba(244,114,182,0.3)] flex flex-col rounded-lg overflow-hidden ${className}`}
      style={style}
    >
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white px-3 py-2 flex justify-between items-center select-none shadow-sm">
        <span className="truncate mr-2 font-bold tracking-widest drop-shadow-md text-lg">✿ {title} ✿</span>
        {onClose && (
          <button 
            onClick={(e) => { e.stopPropagation(); playRetroClick(); onClose(); }}
            className="bg-white/20 hover:bg-white/40 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white/50 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      <div className="p-3 flex-grow overflow-auto relative bg-pink-50/50">
        {children}
      </div>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'neon';
}

export const RetroButton: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const baseStyles = "px-6 py-2 font-['VT323'] text-xl uppercase transition-all transform active:scale-95 rounded-full border-2";
  
  let colorStyles = "";
  if (variant === 'primary') {
    // Chic White/Pink
    colorStyles = "bg-white border-pink-300 text-pink-600 shadow-[4px_4px_0_#f472b6] hover:shadow-[6px_6px_0_#f472b6] hover:-translate-y-0.5";
  } else if (variant === 'danger') {
    // Soft Alert
    colorStyles = "bg-rose-400 border-white text-white shadow-[4px_4px_0_#fda4af] hover:bg-rose-500";
  } else if (variant === 'neon') {
    // Holo/Iridescent vibe
     colorStyles = "bg-white/80 backdrop-blur border-cyan-300 text-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:bg-cyan-50 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]";
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