import React, { useRef, useEffect, useState } from 'react';

export const InteractiveCanvas = ({ type, config }) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = 400;
      draw(ctx, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [type, config]);

  const draw = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    // Fallback/placeholder drawings based on type
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#1e293b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    
    if (type === 'angle') {
      ctx.beginPath();
      ctx.moveTo(width/2, height/2);
      ctx.lineTo(width/2 + 100, height/2);
      ctx.moveTo(width/2, height/2);
      ctx.lineTo(width/2 + 70, height/2 - 70);
      ctx.stroke();
      ctx.fillText('Interactive Angle Visualization', width/2, height/2 + 50);
    } else if (type === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(width/2, height/2 - 50);
      ctx.lineTo(width/2 + 50, height/2 + 50);
      ctx.lineTo(width/2 - 50, height/2 + 50);
      ctx.closePath();
      ctx.stroke();
      ctx.fillText('Interactive Triangle Visualization', width/2, height/2 + 80);
    } else {
      ctx.fillText(`Interactive Canvas: ${type}`, width/2, height/2);
    }
  };

  return (
    <div className="w-full my-8 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm z-10">
        Interactive Canvas
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full h-[400px] cursor-pointer touch-none"
      />
    </div>
  );
};
export default InteractiveCanvas;
