import React, { useEffect, useRef } from "react";

export default function IslamicLandscapeCanvas({ theme = "light" }) {
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

    const isDark = theme === "dark";
    let step = 0;
    const isMobile = typeof window !== "undefined" && (window.innerWidth <= 800 || "ontouchstart" in window);
    let lastTime = performance.now();
    const targetInterval = isMobile ? 33.33 : 16.66;

    // ==========================================
    // 1. MATAHARI PAGI / BULAN SABIT (CELESTIAL)
    // ==========================================
    const celestial = {
      xRatio: 0.82,
      yRatio: 0.18,
      baseRadius: 38,
      glowRadius: 110,
      raysCount: 12
    };

    // Bintang Malam (Mode Gelap)
    const starsCount = isMobile ? 16 : 48;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65),
      size: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      twinkleOffset: Math.random() * Math.PI * 2
    }));

    // ==========================================
    // 2. AWAN MENGAMBANG VOLUMETRIK (DRIFTING CLOUDS)
    // ==========================================
    const clouds = isMobile
      ? [
          { x: width * 0.10, y: height * 0.12, scale: 1.15, speed: 0.22, alpha: isDark ? 0.32 : 0.65 },
          { x: width * 0.60, y: height * 0.10, scale: 1.25, speed: 0.25, alpha: isDark ? 0.30 : 0.58 }
        ]
      : [
          { x: width * 0.10, y: height * 0.12, scale: 1.25, speed: 0.26, alpha: isDark ? 0.32 : 0.65 },
          { x: width * 0.42, y: height * 0.08, scale: 0.95, speed: 0.20, alpha: isDark ? 0.25 : 0.52 },
          { x: width * 0.68, y: height * 0.20, scale: 1.40, speed: 0.30, alpha: isDark ? 0.30 : 0.58 },
          { x: width * 0.92, y: height * 0.14, scale: 0.85, speed: 0.18, alpha: isDark ? 0.22 : 0.48 },
        ];

    const drawFluffyCloud = (cx, cy, scale, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Bayangan bawah awan halus
      ctx.beginPath();
      ctx.arc(0, 4, 22, 0, Math.PI * 2);
      ctx.arc(20, -6, 26, 0, Math.PI * 2);
      ctx.arc(44, -2, 22, 0, Math.PI * 2);
      ctx.arc(62, 6, 18, 0, Math.PI * 2);
      ctx.arc(32, 14, 20, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.18)" : "rgba(203, 213, 225, 0.28)";
      ctx.fill();

      // Badan awan utama
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.arc(20, -10, 26, 0, Math.PI * 2);
      ctx.arc(44, -6, 22, 0, Math.PI * 2);
      ctx.arc(62, 2, 18, 0, Math.PI * 2);
      ctx.arc(32, 10, 20, 0, Math.PI * 2);
      ctx.closePath();

      const cloudGrad = ctx.createLinearGradient(0, -30, 0, 30);
      if (isDark) {
        cloudGrad.addColorStop(0, `rgba(148, 163, 184, ${alpha})`);
        cloudGrad.addColorStop(1, `rgba(71, 85, 105, ${alpha * 0.8})`);
      } else {
        cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        cloudGrad.addColorStop(0.6, `rgba(254, 249, 195, ${alpha * 0.85})`); // Sentuhan keemasan mentari pagi
        cloudGrad.addColorStop(1, `rgba(241, 245, 249, ${alpha * 0.75})`);
      }
      ctx.fillStyle = cloudGrad;
      ctx.fill();

      ctx.restore();
    };

    // ==========================================
    // 3. KAWANAN BURUNG TERBANG (BIRDS SOARING)
    // ==========================================
    const birds = Array.from({ length: 6 }, (_, i) => ({
      x: width * 0.12 + i * 32 + (Math.random() - 0.5) * 25,
      y: height * 0.24 + (i % 3) * 16 + Math.random() * 12,
      speed: 0.9 + Math.random() * 0.3,
      wingCycle: Math.random() * Math.PI * 2,
      wingSpeed: 0.08 + Math.random() * 0.025,
      size: 11 + (i % 3) * 2.5
    }));

    const drawBird = (bx, by, size, wingAngle) => {
      ctx.save();
      ctx.translate(bx, by);

      const wingY = Math.sin(wingAngle) * (size * 0.55);

      ctx.beginPath();
      ctx.moveTo(-size, wingY);
      ctx.quadraticCurveTo(-size * 0.4, -size * 0.38, 0, 0);
      ctx.quadraticCurveTo(size * 0.4, -size * 0.38, size, wingY);
      ctx.quadraticCurveTo(0, size * 0.18, -size, wingY);

      ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.45)" : "rgba(4, 120, 87, 0.5)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.restore();
    };

    // ==========================================
    // 4. PARTIKEL CAHAYA EMBUN / ANGIN PAGI
    // ==========================================
    const particlesCount = isMobile ? 12 : 32;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.random() * 0.5 + 0.25, // Melayang ditiup angin ke kanan
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.2 + 1.0,
      baseAlpha: Math.random() * 0.45 + 0.25,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      color: Math.random() > 0.4 ? "gold" : "emerald"
    }));

    // Mouse Tracking
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

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    // ==========================================
    // 5. DRAW: MATAHARI BERSINAR & RAYS (SIANG)
    // ==========================================
    const drawSun = (cx, cy, radius, pulse) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Pendar Cahaya Besar (Aura Matahari)
      const sunHalo = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 3.2);
      sunHalo.addColorStop(0, "rgba(254, 240, 138, 0.65)");
      sunHalo.addColorStop(0.3, "rgba(251, 191, 36, 0.35)");
      sunHalo.addColorStop(0.6, "rgba(245, 158, 11, 0.12)");
      sunHalo.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = sunHalo;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Sinar Matahari Memancar (Sunbeams / Crepuscular Rays)
      ctx.save();
      ctx.rotate(step * 0.003);
      for (let i = 0; i < celestial.raysCount; i++) {
        const ang = (i * Math.PI * 2) / celestial.raysCount;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (radius * 1.1), Math.sin(ang) * (radius * 1.1));
        ctx.lineTo(Math.cos(ang) * (radius * 2.5 + Math.sin(step * 0.04 + i) * 8), Math.sin(ang) * (radius * 2.5 + Math.sin(step * 0.04 + i) * 8));
        ctx.strokeStyle = `rgba(253, 224, 71, ${0.28 + Math.sin(step * 0.03 + i) * 0.12})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      ctx.restore();

      // Bola Inti Matahari Keemasan
      const sunCore = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
      sunCore.addColorStop(0, "#ffffff");
      sunCore.addColorStop(0.4, "#fef08a");
      sunCore.addColorStop(0.8, "#f59e0b");
      sunCore.addColorStop(1, "#d97706");
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // ==========================================
    // 6. DRAW: BULAN SABIT BERCAHAYA (MALAM)
    // ==========================================
    const drawMoon = (cx, cy, radius, pulse) => {
      ctx.save();
      ctx.translate(cx, cy);

      const moonGlow = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 2.8);
      moonGlow.addColorStop(0, "rgba(254, 240, 138, 0.45)");
      moonGlow.addColorStop(0.5, "rgba(52, 211, 153, 0.15)");
      moonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Bulan Sabit
      ctx.beginPath();
      ctx.arc(0, 0, radius * pulse, -Math.PI * 0.38, Math.PI * 0.85, false);
      ctx.arc(radius * 0.42, -radius * 0.22, radius * 0.86, Math.PI * 0.72, -Math.PI * 0.32, true);
      ctx.closePath();

      const crescentGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      crescentGrad.addColorStop(0, "#fef08a");
      crescentGrad.addColorStop(0.6, "#fbbf24");
      crescentGrad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = crescentGrad;
      ctx.fill();

      ctx.restore();
    };

    // ==========================================
    // 7. DRAW: PERBUKITAN HIJAU BERLAPIS & KUBAH MASJID (LANDSCAPE HILLS)
    // ==========================================
    const drawRollingHillsAndMosque = () => {
      const baseY = height;

      // --- LAYER 1: BUKIT JAUH (BACKGROUND HILLS) ---
      ctx.save();
      const hill1Grad = ctx.createLinearGradient(0, height * 0.65, 0, height);
      if (isDark) {
        hill1Grad.addColorStop(0, "rgba(4, 120, 87, 0.15)");
        hill1Grad.addColorStop(1, "rgba(6, 78, 59, 0.35)");
      } else {
        hill1Grad.addColorStop(0, "rgba(110, 231, 183, 0.25)");
        hill1Grad.addColorStop(1, "rgba(52, 211, 153, 0.35)");
      }
      ctx.fillStyle = hill1Grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(0, height * 0.72);
      ctx.bezierCurveTo(
        width * 0.25, height * 0.64,
        width * 0.55, height * 0.78,
        width * 0.80, height * 0.68
      );
      ctx.quadraticCurveTo(width * 0.92, height * 0.63, width, height * 0.70);
      ctx.lineTo(width, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // --- SILUET KUBAH & MENARA MASJID DI ATAS BUKIT TENGAH ---
      ctx.save();
      const mosqueX = width * 0.36;
      const mosqueY = height * 0.70;

      const mosqueGrad = ctx.createLinearGradient(0, mosqueY - 60, 0, mosqueY + 40);
      if (isDark) {
        mosqueGrad.addColorStop(0, "rgba(52, 211, 153, 0.45)");
        mosqueGrad.addColorStop(1, "rgba(6, 78, 59, 0.65)");
      } else {
        mosqueGrad.addColorStop(0, "rgba(5, 150, 105, 0.45)");
        mosqueGrad.addColorStop(1, "rgba(4, 120, 87, 0.55)");
      }
      ctx.fillStyle = mosqueGrad;

      // Kubah Akbar Masjid di Puncak Bukit
      ctx.beginPath();
      ctx.moveTo(mosqueX - 35, mosqueY);
      ctx.bezierCurveTo(
        mosqueX - 30, mosqueY - 55,
        mosqueX + 30, mosqueY - 55,
        mosqueX + 35, mosqueY
      );
      ctx.closePath();
      ctx.fill();

      // Puncak Kubah (Bulan Sabit Mini / Makuta Emas)
      ctx.beginPath();
      ctx.arc(mosqueX, mosqueY - 58, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#fbbf24" : "#f59e0b";
      ctx.fill();

      // Menara Masjid Kiri (Ramping)
      ctx.fillStyle = mosqueGrad;
      ctx.beginPath();
      ctx.moveTo(mosqueX - 60, mosqueY + 5);
      ctx.lineTo(mosqueX - 60, mosqueY - 75);
      ctx.lineTo(mosqueX - 58, mosqueY - 88);
      ctx.lineTo(mosqueX - 56, mosqueY - 75);
      ctx.lineTo(mosqueX - 56, mosqueY + 5);
      ctx.closePath();
      ctx.fill();

      // Menara Masjid Kanan (Ramping)
      ctx.beginPath();
      ctx.moveTo(mosqueX + 56, mosqueY + 5);
      ctx.lineTo(mosqueX + 56, mosqueY - 75);
      ctx.lineTo(mosqueX + 58, mosqueY - 88);
      ctx.lineTo(mosqueX + 60, mosqueY - 75);
      ctx.lineTo(mosqueX + 60, mosqueY + 5);
      ctx.closePath();
      ctx.fill();

      // Siluet Pohon Kurma / Palem di Lereng Bukit
      const drawPalmTree = (tx, ty, scale) => {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);

        // Batang Lengkung
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(6, -20, 4, -40);
        ctx.strokeStyle = isDark ? "rgba(16, 185, 129, 0.45)" : "rgba(4, 120, 87, 0.55)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Daun Palem Melengkung
        const leafAngles = [-0.6, -0.2, 0.2, 0.6, -1.0, 1.0];
        leafAngles.forEach((ang) => {
          ctx.beginPath();
          ctx.moveTo(4, -40);
          ctx.quadraticCurveTo(
            4 + Math.sin(ang) * 16,
            -40 - Math.cos(ang) * 14,
            4 + Math.sin(ang) * 26,
            -40 - Math.cos(ang) * 8
          );
          ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.55)" : "rgba(5, 150, 105, 0.65)";
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        ctx.restore();
      };

      drawPalmTree(mosqueX - 85, mosqueY + 12, 0.9);
      drawPalmTree(mosqueX - 110, mosqueY + 18, 0.7);
      drawPalmTree(mosqueX + 85, mosqueY + 15, 0.85);

      ctx.restore();

      // --- LAYER 2: BUKIT TENGAH (MIDGROUND HILLS) ---
      ctx.save();
      const hill2Grad = ctx.createLinearGradient(0, height * 0.74, 0, height);
      if (isDark) {
        hill2Grad.addColorStop(0, "rgba(6, 78, 59, 0.35)");
        hill2Grad.addColorStop(1, "rgba(2, 44, 34, 0.6)");
      } else {
        hill2Grad.addColorStop(0, "rgba(52, 211, 153, 0.45)");
        hill2Grad.addColorStop(1, "rgba(16, 185, 129, 0.55)");
      }
      ctx.fillStyle = hill2Grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(0, height * 0.80);
      ctx.bezierCurveTo(
        width * 0.30, height * 0.74,
        width * 0.60, height * 0.86,
        width * 0.85, height * 0.78
      );
      ctx.quadraticCurveTo(width * 0.94, height * 0.75, width, height * 0.82);
      ctx.lineTo(width, baseY);
      ctx.closePath();
      ctx.fill();

      // Garis Aksen Emas Lembut di Punggung Bukit Tengah
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.22)" : "rgba(254, 240, 138, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // --- LAYER 3: BUKIT DEPAN (FOREGROUND HILLS) ---
      ctx.save();
      const hill3Grad = ctx.createLinearGradient(0, height * 0.84, 0, height);
      if (isDark) {
        hill3Grad.addColorStop(0, "rgba(2, 44, 34, 0.55)");
        hill3Grad.addColorStop(1, "rgba(2, 44, 34, 0.85)");
      } else {
        hill3Grad.addColorStop(0, "rgba(16, 185, 129, 0.55)");
        hill3Grad.addColorStop(1, "rgba(5, 150, 105, 0.75)");
      }
      ctx.fillStyle = hill3Grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(0, height * 0.89);
      ctx.bezierCurveTo(
        width * 0.25, height * 0.83,
        width * 0.65, height * 0.92,
        width, height * 0.85
      );
      ctx.lineTo(width, baseY);
      ctx.closePath();
      ctx.fill();

      // Garis Aksen Embun Pagi di Bukit Depan
      ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.3)" : "rgba(167, 243, 208, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    // ==========================================
    // MAIN ANIMATION LOOP
    // ==========================================
    const render = (time) => {
      animationFrameId = requestAnimationFrame(render);
      if (time && time - lastTime < targetInterval) {
        return;
      }
      if (time) {
        lastTime = time - ((time - lastTime) % targetInterval);
      }

      ctx.clearRect(0, 0, width, height);
      step++;

      // 1. Render Langit Malam (Bintang Mode Gelap)
      if (isDark) {
        stars.forEach((s) => {
          const alpha = s.baseAlpha + Math.sin(step * s.twinkleSpeed + s.twinkleOffset) * 0.25;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, alpha)})`;
          ctx.fill();
        });
      }

      // 2. Render Matahari Pagi (Terang) / Bulan Sabit (Gelap)
      const celX = width * celestial.xRatio;
      const celY = height * celestial.yRatio;
      const pulse = Math.sin(step * 0.02) * 0.05 + 0.95;

      if (isDark) {
        drawMoon(celX, celY, celestial.baseRadius, pulse);
      } else {
        drawSun(celX, celY, celestial.baseRadius, pulse);
      }

      // 3. Render Awan Fluffy Mengambang Dinamis
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > width + 180) {
          c.x = -180;
          c.y = height * (0.06 + Math.random() * 0.16);
        }
        drawFluffyCloud(c.x, c.y, c.scale, c.alpha);
      });

      // 4. Render Perbukitan Hijau Berlapis & Siluet Kubah Masjid Latee
      drawRollingHillsAndMosque();

      // 5. Render Kawanan Burung Melintas Anggun
      birds.forEach((b) => {
        b.x += b.speed;
        b.wingCycle += b.wingSpeed;

        if (b.x > width + 50) {
          b.x = -50;
          b.y = height * (0.16 + Math.random() * 0.18);
        }

        drawBird(b.x, b.y, b.size, b.wingCycle);
      });

      // 6. Render Partikel Cahaya Pagi / Embun Melayang
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x > width + 10) {
          p.x = -10;
          p.y = Math.random() * height;
        }
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Mouse push
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }

        const alpha = p.baseAlpha + Math.sin(p.pulse) * 0.18;
        const col = p.color === "gold"
          ? (isDark ? `rgba(251, 191, 36, ${alpha})` : `rgba(245, 158, 11, ${alpha * 0.85})`)
          : (isDark ? `rgba(52, 211, 153, ${alpha})` : `rgba(5, 150, 105, ${alpha * 0.85})`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (!isMobile) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="islamic-landscape-canvas"
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
