import React, { useEffect, useRef, useState } from 'react';

interface SoundWaveCursorProps {
  intensity?: number;
  speed?: number;
  size?: number;
  waveCount?: number;
  colors?: string[];
  blur?: number;
  glow?: number;
  sensitivity?: number;
}

export const SoundWaveCursor: React.FC<SoundWaveCursorProps> = ({
  intensity = 1,
  speed = 1,
  size = 40,
  waveCount = 3,
  colors = ['#7C3AED', '#38BDF8', '#22D3EE'],
  blur = 4,
  glow = 15,
  sensitivity = 0.15
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, velocity: 0 });
  const easedMouse = useRef({ x: 0, y: 0 });
  const waves = useRef<Array<{ r: number; opacity: number; color: string; speed: number }>>([]);
  const requestRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      // Calculate velocity
      const dx = mouse.current.x - mouse.current.lastX;
      const dy = mouse.current.y - mouse.current.lastY;
      mouse.current.velocity = Math.sqrt(dx * dx + dy * dy);
      
      mouse.current.lastX = mouse.current.x;
      mouse.current.lastY = mouse.current.y;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const createWave = (v: number) => {
      const colorIndex = Math.floor(Math.random() * colors.length);
      waves.current.push({
        r: 5,
        opacity: 0.6 + (v * 0.02),
        color: colors[colorIndex],
        speed: (2 + (v * 0.2)) * speed
      });
      
      if (waves.current.length > waveCount * 4) {
        waves.current.shift();
      }
    };

    let lastWaveTime = 0;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Easing for mouse position
      easedMouse.current.x += (mouse.current.x - easedMouse.current.x) * sensitivity;
      easedMouse.current.y += (mouse.current.y - easedMouse.current.y) * sensitivity;

      const v = mouse.current.velocity;
      
      // Decay velocity
      mouse.current.velocity *= 0.95;

      // Spawn waves based on velocity + idle pulse
      const waveInterval = Math.max(50, 200 - v * 5);
      if (time - lastWaveTime > waveInterval) {
        createWave(v);
        lastWaveTime = time;
      }

      // Draw Waves
      waves.current.forEach((wave, index) => {
        wave.r += wave.speed;
        wave.opacity *= 0.96;

        if (wave.opacity < 0.01) {
          waves.current.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(easedMouse.current.x, easedMouse.current.y, wave.r, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = wave.opacity * intensity;
        
        // Add glow
        ctx.shadowBlur = glow;
        ctx.shadowColor = wave.color;
        
        ctx.stroke();
      });

      // Draw central "energy core"
      const corePulse = Math.sin(time * 0.01) * 3;
      const coreSize = (size / 4) + (v * 0.1) + corePulse;
      
      const gradient = ctx.createRadialGradient(
        easedMouse.current.x, easedMouse.current.y, 0,
        easedMouse.current.x, easedMouse.current.y, coreSize * 2
      );
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1] + '88');
      gradient.addColorStop(1, 'transparent');

      ctx.shadowBlur = glow * 2;
      ctx.shadowColor = colors[0];
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(easedMouse.current.x, easedMouse.current.y, coreSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw frequency bars around the cursor
      const barCount = 12;
      const radius = coreSize + 10 + (v * 0.2);
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 + (time * 0.002);
        const barLen = 4 + Math.random() * (6 + v * 0.5);
        
        const x1 = easedMouse.current.x + Math.cos(angle) * radius;
        const y1 = easedMouse.current.y + Math.sin(angle) * radius;
        const x2 = easedMouse.current.x + Math.cos(angle) * (radius + barLen);
        const y2 = easedMouse.current.y + Math.sin(angle) * (radius + barLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = colors[Math.min(i, colors.length - 1)];
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [intensity, speed, size, waveCount, colors, glow, sensitivity, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ filter: `blur(${blur}px)` }}
    />
  );
};
