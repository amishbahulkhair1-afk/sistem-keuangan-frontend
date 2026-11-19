import React, { useEffect, useRef } from "react";

export default function LivingSkyWaveCanvas({ theme = "light" }) {
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

    let step = 0;
    const isDark = theme === "dark";

    // ==========================================
    // 1. LAYER GELOMBANG LAUT (WAVES)
    // Sesuai Tema: Terang (Cyan/Sky Light) vs Gelap (Deep Ocean Navy / Sapphire)
    // ==========================================
    const waves = [
      {
        frequency: 0.0032,
        amplitude: 45,
        speed: 0.015,
        offset: 0,
        baseY: 0.74,
        colorStart: isDark ? "rgba(14, 165, 233, 0.22)" : "rgba(56, 189, 248, 0.28)",
        colorEnd: isDark ? "rgba(3, 105, 161, 0.03)" : "rgba(14, 165, 233, 0.05)"
      },
      {
        frequency: 0.0045,
        amplitude: 38,
        speed: -0.012,
        offset: 2.2,
        baseY: 0.80,
        colorStart: isDark ? "rgba(2, 132, 199, 0.28)" : "rgba(2, 132, 199, 0.22)",
        colorEnd: isDark ? "rgba(12, 74, 110, 0.03)" : "rgba(56, 189, 248, 0.03)"
      },
      {
        frequency: 0.0055,
        amplitude: 52,
        speed: 0.018,
        offset: 4.1,
        baseY: 0.86,
        colorStart: isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(125, 211, 252, 0.32)",
        colorEnd: isDark ? "rgba(15, 23, 42, 0.04)" : "rgba(186, 230, 253, 0.06)"
      }
    ];

    // ==========================================
    // 2. CELESTIAL BODY: MATAHARI (TERANG) / BULAN SABIT (GELAP)
    // ==========================================
    const celestial = {
      xRatio: 0.86,
      yRatio: 0.16,
      baseRadius: 36,
      glowRadius: 85,
      pulse: 0
    };

    // Bintang Malam (Khusus Mode Gelap)
    const nightStars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65),
      size: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.04 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2
    }));

    // ==========================================
    // 3. AWAN MENGAMBANG (DRIFTING CLOUDS)
    // ==========================================
    const clouds = [
      { x: width * 0.12, y: height * 0.12, scale: 1.1, speed: 0.28, alpha: isDark ? 0.28 : 0.55 },
      { x: width * 0.48, y: height * 0.08, scale: 0.85, speed: 0.22, alpha: isDark ? 0.22 : 0.45 },
      { x: width * 0.72, y: height * 0.22, scale: 1.25, speed: 0.32, alpha: isDark ? 0.25 : 0.50 },
      { x: width * 0.95, y: height * 0.15, scale: 0.75, speed: 0.18, alpha: isDark ? 0.20 : 0.40 },
    ];

    const drawCloud = (cx, cy, scale, alpha, isRainy = false) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.arc(18, -10, 26, 0, Math.PI * 2);
      ctx.arc(42, -6, 20, 0, Math.PI * 2);
      ctx.arc(58, 2, 16, 0, Math.PI * 2);
      ctx.arc(28, 10, 18, 0, Math.PI * 2);
      ctx.closePath();

      if (isRainy) {
        ctx.fillStyle = isDark ? `rgba(71, 85, 105, ${alpha * 0.85})` : `rgba(148, 163, 184, ${alpha * 0.85})`;
      } else {
        ctx.fillStyle = isDark ? `rgba(148, 163, 184, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      }
      ctx.fill();
      ctx.restore();
    };

    // ==========================================
    // 4. KELOMPOK BURUNG / BURUNG MALAM (BIRDS)
    // ==========================================
    const birds = Array.from({ length: 5 }, (_, i) => ({
      x: width * 0.15 + i * 28 + (Math.random() - 0.5) * 20,
      y: height * 0.22 + (i % 2) * 14 + Math.random() * 10,
      speed: 0.85 + Math.random() * 0.25,
      wingCycle: Math.random() * Math.PI * 2,
      wingSpeed: 0.08 + Math.random() * 0.03,
      size: 11 + (i % 3) * 2
    }));

    const drawBird = (bx, by, size, wingAngle) => {
      ctx.save();
      ctx.translate(bx, by);

      const wingY = Math.sin(wingAngle) * (size * 0.5);

      ctx.beginPath();
      ctx.moveTo(-size, wingY);
      ctx.quadraticCurveTo(-size * 0.4, -size * 0.35, 0, 0);
      ctx.quadraticCurveTo(size * 0.4, -size * 0.35, size, wingY);
      ctx.quadraticCurveTo(0, size * 0.15, -size, wingY);

      ctx.strokeStyle = isDark ? "rgba(125, 211, 252, 0.4)" : "rgba(3, 105, 161, 0.45)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.restore();
    };

    // ==========================================
    // 5. PERAHU LAYAR MELINTAS TIAP 30 DETIK (SAILING BOAT)
    // ==========================================
    const BOAT_CYCLE = 30; // 30 Detik
    const BOAT_TRAVEL_TIME = 18; // 18 Detik waktu melintas layar

    const drawSailBoat = (bx, by, bobbingAngle) => {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(bobbingAngle);

      // Lambung Kapal
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(24, 0);
      ctx.lineTo(16, 11);
      ctx.lineTo(-14, 11);
      ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.75)";
      ctx.fill();

      // Garis Aksen Lambung
      ctx.beginPath();
      ctx.moveTo(-18, 2);
      ctx.lineTo(22, 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tiang Layar
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -28);
      ctx.strokeStyle = isDark ? "rgba(148, 163, 184, 0.85)" : "rgba(30, 41, 59, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Layar Utama Kanan
      ctx.beginPath();
      ctx.moveTo(1, -26);
      ctx.lineTo(16, -5);
      ctx.lineTo(1, -5);
      ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(224, 242, 254, 0.85)" : "rgba(255, 255, 255, 0.92)";
      ctx.shadowColor = "rgba(56, 189, 248, 0.35)";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Layar Depan Kiri
      ctx.beginPath();
      ctx.moveTo(-2, -22);
      ctx.lineTo(-13, -5);
      ctx.lineTo(-2, -5);
      ctx.closePath();
      ctx.fillStyle = "rgba(186, 230, 253, 0.85)";
      ctx.fill();

      // Bendera Kecil di Puncak Tiang
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(-8, -25);
      ctx.lineTo(0, -22);
      ctx.closePath();
      ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
      ctx.fill();

      // Riak Air Di Bawah Perahu
      ctx.beginPath();
      ctx.arc(-16, 7, 5, 0, Math.PI);
      ctx.arc(8, 7, 4, 0, Math.PI);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Lampu Lentera Kapal (Khusus Mode Gelap)
      if (isDark) {
        ctx.beginPath();
        ctx.arc(-10, -2, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    };

    // ==========================================
    // 6. SIKLUS HUJAN BERKALA (RAIN CYCLE: 2 MENIT)
    // ==========================================
    const CYCLE_DURATION = 120;
    const RAIN_DURATION = 24;
    const startTime = Date.now();

    const rainDrops = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 18 + 12,
      speed: Math.random() * 8 + 10,
      alpha: Math.random() * 0.35 + 0.2
    }));

    const ripples = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 1;

      const elapsedTotalSec = (Date.now() - startTime) / 1000;

      // Hitung posisi siklus hujan 2 menit
      const rainElapsed = elapsedTotalSec % CYCLE_DURATION;
      const isRaining = rainElapsed > (CYCLE_DURATION - RAIN_DURATION);
      
      let rainIntensity = 0;
      if (isRaining) {
        const rainTime = rainElapsed - (CYCLE_DURATION - RAIN_DURATION);
        if (rainTime < 4) {
          rainIntensity = rainTime / 4;
        } else if (rainTime > RAIN_DURATION - 4) {
          rainIntensity = (RAIN_DURATION - rainTime) / 4;
        } else {
          rainIntensity = 1;
        }
      }

      // --------------------------------------------------
      // A. RENDER BINTANG MALAM (KHUSUS MODE GELAP)
      // --------------------------------------------------
      if (isDark) {
        nightStars.forEach((star) => {
          const tw = Math.sin(step * star.twinkleSpeed + star.twinkleOffset);
          const starAlpha = Math.max(0.1, star.baseAlpha + tw * 0.25) * (1 - rainIntensity * 0.8);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${starAlpha})`;
          ctx.fill();
        });
      }

      // --------------------------------------------------
      // B. RENDER MATAHARI / BULAN SABIT (SUN / MOON)
      // --------------------------------------------------
      const cX = width * celestial.xRatio;
      const cY = height * celestial.yRatio;
      celestial.pulse += 0.025;
      const cAlpha = Math.max(0.15, (1 - rainIntensity * 0.75));

      if (isDark) {
        // MODE GELAP: BULAN SABIT BERSINAR LEMBUT (CRESCENT MOON)
        const moonGlow = ctx.createRadialGradient(cX, cY, celestial.baseRadius * 0.5, cX, cY, celestial.glowRadius * 0.9);
        moonGlow.addColorStop(0, `rgba(186, 230, 253, ${0.4 * cAlpha})`);
        moonGlow.addColorStop(0.6, `rgba(56, 189, 248, ${0.15 * cAlpha})`);
        moonGlow.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(cX, cY, celestial.glowRadius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = moonGlow;
        ctx.fill();

        // Bulan Sabit
        ctx.save();
        ctx.translate(cX, cY);
        ctx.rotate(-Math.PI / 6);
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0.2 * Math.PI, 1.8 * Math.PI, false);
        ctx.bezierCurveTo(8, -18, 8, 18, 26 * Math.cos(0.2 * Math.PI), 26 * Math.sin(0.2 * Math.PI));
        ctx.closePath();
        ctx.fillStyle = `rgba(240, 249, 255, ${0.92 * cAlpha})`;
        ctx.shadowColor = "rgba(186, 230, 253, 0.7)";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        // MODE TERANG: MATAHARI BERSINAR (SUN)
        const sunGlow = ctx.createRadialGradient(cX, cY, celestial.baseRadius * 0.6, cX, cY, celestial.glowRadius + Math.sin(celestial.pulse) * 8);
        sunGlow.addColorStop(0, `rgba(253, 224, 71, ${0.45 * cAlpha})`);
        sunGlow.addColorStop(0.5, `rgba(56, 189, 248, ${0.25 * cAlpha})`);
        sunGlow.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(cX, cY, celestial.glowRadius + Math.sin(celestial.pulse) * 8, 0, Math.PI * 2);
        ctx.fillStyle = sunGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cX, cY, celestial.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${0.85 * cAlpha})`;
        ctx.shadowColor = "rgba(250, 204, 21, 0.45)";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --------------------------------------------------
      // C. RENDER AWAN (CLOUDS)
      // --------------------------------------------------
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > width + 120) {
          c.x = -120;
          c.y = height * (0.06 + Math.random() * 0.18);
        }
        drawCloud(c.x, c.y, c.scale, c.alpha, rainIntensity > 0.3);
      });

      // --------------------------------------------------
      // D. RENDER BURUNG (BIRDS)
      // --------------------------------------------------
      birds.forEach((b) => {
        b.x += b.speed;
        b.wingCycle += b.wingSpeed;

        if (b.x > width + 40) {
          b.x = -40;
          b.y = height * (0.12 + Math.random() * 0.18);
        }

        const currentY = b.y + (rainIntensity * 25);
        drawBird(b.x, currentY, b.size, b.wingCycle);
      });

      // --------------------------------------------------
      // E. RENDER GELOMBANG AIR LAUT LAYER 1 (BELAKANG)
      // --------------------------------------------------
      const w1 = waves[0];
      ctx.beginPath();
      const startY1 = height * w1.baseY;
      ctx.moveTo(0, height);
      ctx.lineTo(0, startY1);
      for (let x = 0; x <= width; x += 6) {
        const y =
          startY1 +
          Math.sin(x * w1.frequency + step * w1.speed + w1.offset) * w1.amplitude +
          Math.cos(x * w1.frequency * 0.6 + step * (w1.speed * 0.7)) * (w1.amplitude * 0.35);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const grad1 = ctx.createLinearGradient(0, startY1 - w1.amplitude, 0, height);
      grad1.addColorStop(0, w1.colorStart);
      grad1.addColorStop(1, w1.colorEnd);
      ctx.fillStyle = grad1;
      ctx.fill();

      // --------------------------------------------------
      // F. RENDER PERAHU LAYAR (TIAP 30 DETIK)
      // --------------------------------------------------
      const boatElapsed = elapsedTotalSec % BOAT_CYCLE;
      if (boatElapsed < BOAT_TRAVEL_TIME) {
        const boatProgress = boatElapsed / BOAT_TRAVEL_TIME;
        const boatX = -60 + boatProgress * (width + 120);

        const waveAtBoat =
          Math.sin(boatX * w1.frequency + step * w1.speed + w1.offset) * w1.amplitude +
          Math.cos(boatX * w1.frequency * 0.6 + step * (w1.speed * 0.7)) * (w1.amplitude * 0.35);
        const boatY = startY1 + waveAtBoat - 4;

        const bobbing = Math.sin(step * 0.06) * 0.09;
        drawSailBoat(boatX, boatY, bobbing);
      }

      // --------------------------------------------------
      // G. RENDER GELOMBANG AIR LAUT LAYER 2 & 3 (DEPAN)
      // --------------------------------------------------
      for (let wi = 1; wi < waves.length; wi++) {
        const w = waves[wi];
        ctx.beginPath();
        const startY = height * w.baseY;
        ctx.moveTo(0, height);
        ctx.lineTo(0, startY);

        for (let x = 0; x <= width; x += 6) {
          const y =
            startY +
            Math.sin(x * w.frequency + step * w.speed + w.offset) * w.amplitude +
            Math.cos(x * w.frequency * 0.6 + step * (w.speed * 0.7)) * (w.amplitude * 0.35);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, startY - w.amplitude, 0, height);
        gradient.addColorStop(0, w.colorStart);
        gradient.addColorStop(1, w.colorEnd);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // --------------------------------------------------
      // H. RENDER HUJAN BERKALA (RAIN & RIPPLES)
      // --------------------------------------------------
      if (rainIntensity > 0.05) {
        ctx.fillStyle = isDark
          ? `rgba(15, 23, 42, ${0.15 * rainIntensity})`
          : `rgba(186, 230, 253, ${0.08 * rainIntensity})`;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = isDark
          ? `rgba(125, 211, 252, ${0.6 * rainIntensity})`
          : `rgba(56, 189, 248, ${0.5 * rainIntensity})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();

        rainDrops.forEach((drop) => {
          drop.y += drop.speed;
          drop.x -= 1.8;

          if (drop.y > height) {
            if (Math.random() < 0.25 && ripples.length < 15) {
              ripples.push({
                x: drop.x,
                y: height * 0.76 + Math.random() * (height * 0.2),
                radius: 1,
                maxRadius: Math.random() * 16 + 8,
                alpha: 0.6 * rainIntensity
              });
            }
            drop.y = -drop.len;
            drop.x = Math.random() * (width + 50);
          }

          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2.5, drop.y + drop.len);
        });

        ctx.stroke();

        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 0.5;
          r.alpha -= 0.015;

          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 2, r.radius, 0, 0, Math.PI * 2);
          ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${r.alpha})` : `rgba(125, 211, 252, ${r.alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="living-sky-wave-canvas"
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
