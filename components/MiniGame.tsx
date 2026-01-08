
import React, { useEffect, useRef, useState } from 'react';

const MiniGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [wave, setWave] = useState(1);
  const requestRef = useRef<number>(null);

  const state = useRef({
    paddle: { x: 0, w: 120, h: 12 },
    ball: { x: 0, y: 0, dx: 3, dy: -3, r: 7 },
    bricks: [] as { x: number; y: number; w: number; h: number; active: boolean; color: string }[],
    width: 0,
    height: 380,
    score: 0,
    wave: 1,
    baseSpeed: 3.5,
  });

  const spawnMarketBricks = () => {
    const s = state.current;
    const brickW = 75;
    const brickH = 22;
    const padding = 12;
    const rows = 3 + Math.min(s.wave - 1, 3);
    const cols = Math.floor((s.width - 40) / (brickW + padding));
    const offset = (s.width - (cols * (brickW + padding) - padding)) / 2;
    
    const palette = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b'];
    s.bricks = [];

    for (let r = 0; r < rows; r++) {
      const rowColor = palette[r % palette.length];
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.1) { // 10% chance of empty slot for variety
          s.bricks.push({
            x: offset + c * (brickW + padding),
            y: 60 + r * (brickH + padding),
            w: brickW,
            h: brickH,
            active: true,
            color: rowColor
          });
        }
      }
    }
  };

  const reset = (isNewGame = true) => {
    const s = state.current;
    if (isNewGame) {
      s.score = 0;
      s.wave = 1;
      s.baseSpeed = 3.5;
      setScore(0);
      setWave(1);
    }
    
    s.ball = { 
      x: s.width / 2, 
      y: s.height - 60, 
      dx: s.baseSpeed * (Math.random() > 0.5 ? 1 : -1), 
      dy: -s.baseSpeed, 
      r: 7 
    };
    s.paddle.x = (s.width - s.paddle.w) / 2;
    
    spawnMarketBricks();
    setIsGameOver(false);
    setIsStarted(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 380;
        state.current.width = canvas.width;
        state.current.height = canvas.height;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      if (!isStarted || isGameOver) {
        draw(ctx);
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const s = state.current;

      // Ball movement
      s.ball.x += s.ball.dx;
      s.ball.y += s.ball.dy;

      // Wall bounce
      if (s.ball.x + s.ball.r > s.width || s.ball.x - s.ball.r < 0) s.ball.dx *= -1;
      if (s.ball.y - s.ball.r < 0) s.ball.dy *= -1;

      // Paddle bounce
      const paddleTop = s.height - 30;
      if (s.ball.y + s.ball.r > paddleTop && s.ball.y - s.ball.r < paddleTop + s.paddle.h) {
        if (s.ball.x > s.paddle.x && s.ball.x < s.paddle.x + s.paddle.w) {
          // Calculate hit angle based on where it hit the paddle
          const hitPos = (s.ball.x - (s.paddle.x + s.paddle.w / 2)) / (s.paddle.w / 2);
          const currentSpeed = Math.sqrt(s.ball.dx * s.ball.dx + s.ball.dy * s.ball.dy);
          
          s.ball.dy = -Math.abs(s.ball.dy); // Ensure it goes up
          s.ball.dx = hitPos * currentSpeed * 0.8; // Change horizontal angle
          
          // Difficulty increase: subtle speed up on every paddle hit
          s.ball.dx *= 1.015;
          s.ball.dy *= 1.015;
          s.ball.y = paddleTop - s.ball.r; 
        }
      }

      // Die condition: ball falls below paddle
      if (s.ball.y - s.ball.r > s.height) {
        setIsGameOver(true);
        if (s.score > highScore) setHighScore(s.score);
      }

      // Brick collision
      let activeBricks = 0;
      for (let i = 0; i < s.bricks.length; i++) {
        const b = s.bricks[i];
        if (!b.active) continue;
        activeBricks++;

        if (
          s.ball.x + s.ball.r > b.x && 
          s.ball.x - s.ball.r < b.x + b.w && 
          s.ball.y + s.ball.r > b.y && 
          s.ball.y - s.ball.r < b.y + b.h
        ) {
          s.ball.dy *= -1;
          b.active = false;
          s.score += 100;
          setScore(s.score);
          activeBricks--;
        }
      }

      // New Wave condition
      if (activeBricks === 0 && s.bricks.length > 0) {
        s.wave += 1;
        setWave(s.wave);
        s.baseSpeed += 0.5; // New waves start faster
        spawnMarketBricks();
        // Reset ball position for new wave
        s.ball.y = s.height - 60;
        s.ball.dy = -s.baseSpeed;
      }

      draw(ctx);
      requestRef.current = requestAnimationFrame(loop);
    };

    const draw = (c: CanvasRenderingContext2D) => {
      const s = state.current;
      c.clearRect(0, 0, s.width, s.height);

      // Bricks
      s.bricks.forEach(b => {
        if (b.active) {
          c.fillStyle = b.color;
          c.shadowBlur = 4;
          c.shadowColor = b.color;
          c.beginPath(); 
          c.roundRect(b.x, b.y, b.w, b.h, 4); 
          c.fill();
        }
      });
      c.shadowBlur = 0;

      // Paddle
      c.fillStyle = '#3b82f6';
      c.shadowBlur = 15; c.shadowColor = '#3b82f6';
      c.beginPath(); 
      c.roundRect(s.paddle.x, s.height - 30, s.paddle.w, s.paddle.h, 6); 
      c.fill();
      c.shadowBlur = 0;

      // Ball
      c.fillStyle = '#ffffff';
      c.beginPath(); 
      c.arc(s.ball.x, s.ball.y, s.ball.r, 0, Math.PI * 2); 
      c.fill();
      
      // Bottom Warning Gradient
      const grad = c.createLinearGradient(0, s.height - 10, 0, s.height);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      c.fillStyle = grad;
      c.fillRect(0, s.height - 10, s.width, 10);
    };

    const handleInput = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      state.current.paddle.x = Math.max(0, Math.min(state.current.width - state.current.paddle.w, mouseX - state.current.paddle.w / 2));
    };

    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      state.current.paddle.x = Math.max(0, Math.min(state.current.width - state.current.paddle.w, touchX - state.current.paddle.w / 2));
    };

    canvas.addEventListener('mousemove', handleInput);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleInput);
      canvas.removeEventListener('touchmove', handleTouch);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStarted, isGameOver]);

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-2xl p-1 mt-6">
      {/* HUD Overlay */}
      <div className="absolute top-8 left-10 z-10 pointer-events-none flex items-end gap-6">
        <div>
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Market Valuation</div>
          <div className="text-4xl font-black text-white tracking-tighter">${score.toLocaleString()}</div>
        </div>
        <div className="pb-1">
          <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Fiscal Quarter</div>
          <div className="text-sm font-black text-blue-400">Q{wave}</div>
        </div>
      </div>
      
      <div className="absolute top-8 right-10 z-10 text-right pointer-events-none">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Portfolio Record</div>
        <div className="text-xl font-bold text-slate-300 tracking-tight">${highScore.toLocaleString()}</div>
      </div>

      <canvas 
        ref={canvasRef} 
        className="w-full h-[380px] block cursor-none touch-none"
      />

      {!isStarted && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/20 rotate-3">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-4">Market Breakout PRO</h4>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-10 max-w-sm leading-relaxed">Protect the barrier. Clear the hurdles. <br/>Maximize your deal flow.</p>
          <button 
            onClick={() => reset(true)} 
            className="px-12 py-5 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Commence Trading
          </button>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="text-rose-500 mb-6">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          </div>
          <h4 className="text-white font-black text-3xl uppercase tracking-tighter mb-2">Market Liquidation</h4>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">You failed to capture the deal. <br/>Asset value: <span className="text-emerald-400">${score.toLocaleString()}</span></p>
          <div className="flex gap-4">
            <button 
              onClick={() => reset(true)} 
              className="px-10 py-5 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-lg hover:bg-slate-50 transition-all"
            >
              Re-Invest (Restart)
            </button>
          </div>
        </div>
      )}
      
      {/* Controls Guide */}
      {!isGameOver && isStarted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] opacity-50">Slide to control paddle</div>
        </div>
      )}
    </div>
  );
};

export default MiniGame;
