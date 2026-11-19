import React, { useEffect, useRef } from "react";

export default function GeometricCanvas({ count = 22 }) {
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

    // Jenis bentuk geometris 3D & 2D modern
    const shapeTypes = [
      "cube3d",     // Kubus isometrik 3D transparan
      "octagon",    // Bintang segi delapan / Octagon Islami modern
      "diamond",    // Berlian / Rhombus melayang
      "ring",       // Cincin berongga ganda (Torus)
      "triangle3d", // Segitiga prisma melayang
      "hexagon"     // Heksagon bergradien
    ];

    // Inisialisasi partikel geometri
    const shapes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 32 + 20, // 20px - 52px
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.012,
      type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      alpha: Math.random() * 0.25 + 0.15,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    }));

    // Interactive mouse tracking
    let mouse = { x: null, y: null, radius: 150 };

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

    // Helper: Menggambar Kubus Isometrik 3D
    const drawIsometricCube = (cx, cy, size, angle, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const r = size * 0.55;
      const h = r * 0.866; // cos(30 deg)

      // Sisi Atas (Top)
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(h, -r * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(-h, -r * 0.5);
      ctx.closePath();
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.85})`; // sky-200
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 1.5})`;
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();

      // Sisi Kiri (Left)
      ctx.beginPath();
      ctx.moveTo(-h, -r * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-h, r * 0.5);
      ctx.closePath();
      ctx.fillStyle = `rgba(2, 132, 199, ${alpha * 0.55})`; // sky-600
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 1.2})`;
      ctx.fill();
      ctx.stroke();

      // Sisi Kanan (Right)
      ctx.beginPath();
      ctx.moveTo(h, -r * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(h, r * 0.5);
      ctx.closePath();
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.65})`; // sky-400
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 1.2})`;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Menggambar Octagon / Islamic 8-Point Geometric Star
    const drawOctagonStar = (cx, cy, size, angle, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const s = size * 0.45;
      // Kotak 1
      ctx.beginPath();
      ctx.rect(-s, -s, s * 2, s * 2);
      ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 1.4})`;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.5})`;
      ctx.fill();
      ctx.stroke();

      // Kotak 2 (Rotate 45 deg)
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.rect(-s, -s, s * 2, s * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 1.4})`;
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.4})`;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Menggambar Diamond / Rhombus
    const drawDiamond = (cx, cy, size, angle, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const w = size * 0.45;
      const h = size * 0.75;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(w, 0);
      ctx.lineTo(0, h);
      ctx.lineTo(-w, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.6})`;
      ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 1.3})`;
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // Helper: Menggambar Ring Ganda
    const drawRing = (cx, cy, size, angle, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 1.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.5})`;
      ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 1.1})`;
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // Helper: Hexagon
    const drawHexagon = (cx, cy, size, angle, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const r = size * 0.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.5})`;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 1.4})`;
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      shapes.forEach((s) => {
        // Gerakan melayang
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotationSpeed;
        s.pulse += s.pulseSpeed;

        // Pantulan di dinding layar
        if (s.x < -s.size) s.x = width + s.size;
        if (s.x > width + s.size) s.x = -s.size;
        if (s.y < -s.size) s.y = height + s.size;
        if (s.y > height + s.size) s.y = -s.size;

        // Mouse gentle repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            s.x += (dx / dist) * force * 1.8;
            s.y += (dy / dist) * force * 1.8;
          }
        }

        const dynamicAlpha = s.alpha + Math.sin(s.pulse) * 0.08;

        // Gambar bentuk sesuai tipe
        switch (s.type) {
          case "cube3d":
            drawIsometricCube(s.x, s.y, s.size, s.rotation, dynamicAlpha);
            break;
          case "octagon":
            drawOctagonStar(s.x, s.y, s.size, s.rotation, dynamicAlpha);
            break;
          case "diamond":
            drawDiamond(s.x, s.y, s.size, s.rotation, dynamicAlpha);
            break;
          case "ring":
            drawRing(s.x, s.y, s.size, s.rotation, dynamicAlpha);
            break;
          case "hexagon":
          default:
            drawHexagon(s.x, s.y, s.size, s.rotation, dynamicAlpha);
            break;
        }
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
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="geometric-canvas"
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
