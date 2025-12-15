import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, Undo } from 'lucide-react';

interface CanvasDrawProps {
  onSave: (dataUri: string) => void;
}

export const CanvasDraw: React.FC<CanvasDrawProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4a044e');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath(); // Reset path
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex gap-2 mb-1 justify-center bg-white/90 p-2 rounded-full border border-gray-200 shadow-sm">
        <button 
          onClick={() => setTool('pen')} 
          className={`p-2 rounded-full transition-colors ${tool === 'pen' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Pencil size={18}/>
        </button>
        <button 
          onClick={() => setTool('eraser')} 
          className={`p-2 rounded-full transition-colors ${tool === 'eraser' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Eraser size={18}/>
        </button>
        <div className="w-[1px] bg-gray-300 mx-1"></div>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="w-8 h-8 cursor-pointer rounded-full overflow-hidden border-2 border-gray-200"
        />
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={lineWidth} 
          onChange={(e) => setLineWidth(Number(e.target.value))} 
          className="w-20 accent-black"
        />
        <div className="w-[1px] bg-gray-300 mx-1"></div>
        <button onClick={clearCanvas} className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-50"><Undo size={18}/></button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        className="flex-grow w-full bg-white rounded-lg cursor-crosshair touch-none"
      />
    </div>
  );
};