import React, { useEffect, useRef } from "react";

export default function MotionDotsCanvas({ count = 45, color = "rgba(56, 189, 248, 0.45)", lineDistance = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Inisialisasi titik-titik partikel (motion dots)
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      radius: Math.random() * 2.2 + 1.2,
      baseAlpha: Math.random() * 0.4 + 0.3,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      pulseAngle: Math.random() * Math.PI * 2,
    }));

    // Interactive mouse tracking
    let mouse = { x: null, y: null, radius: 140 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & Hubungkan Garis Halus Antar Dots (Constellation Effect)
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < lineDistance) {
            const alpha = (1 - dist / lineDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update dan Render Setiap Dot
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Pantulan di dinding layar
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        // Interaksi Gerak dengan Mouse (Gentle push)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            dot.x += (dx / dist) * force * 1.5;
            dot.y += (dy / dist) * force * 1.5;
          }
        }

        // Efek Pulsing Cahaya
        dot.pulseAngle += dot.pulseSpeed;
        const currentAlpha = dot.baseAlpha + Math.sin(dot.pulseAngle) * 0.2;

        // Gambar Titik Pendar
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(2, 132, 199, ${Math.max(0.1, currentAlpha)})`;
        ctx.fill();

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.04, currentAlpha * 0.35)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [count, color, lineDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="motion-dots-canvas"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
