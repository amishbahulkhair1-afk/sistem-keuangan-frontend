import React, { useEffect, useRef } from "react";

export default function IslamicDesertCanvas({ theme = "light" }) {
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
    const targetInterval = isMobile ? 33.33 : 16.66; // 30 FPS on mobile, 60 FPS on desktop

    // ==========================================
    // 1. SIKLUS BADAI PASIR BERKALA (SANDSTORM CYCLE)
    // Siklus total 45 detik: 28 detik tenang, 5 detik transisi masuk, 8 detik puncak badai, 4 detik reda
    // ==========================================
    const SANDSTORM_CYCLE_FRAMES = 60 * 45; // ~45 detik @ 60fps
    const STORM_START = 60 * 25;
    const STORM_PEAK = 60 * 30;
    const STORM_END = 60 * 38;

    // ==========================================
    // 2. MATAHARI GURUN / BULAN SABIT SAHARA
    // ==========================================
    const celestial = {
      xRatio: 0.82,
      yRatio: 0.17,
      baseRadius: 40,
      glowRadius: 115
    };

    // Bintang Malam Gurun (Mode Gelap)
    const starsCount = isMobile ? 18 : 55;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.62),
      size: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.65 + 0.35,
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      twinkleOffset: Math.random() * Math.PI * 2
    }));

    // ==========================================
    // 3. AWAN LEMBUT GURUN (NATURAL DESERT CLOUDS)
    // ==========================================
    const clouds = isMobile
      ? [
          { x: width * 0.15, y: height * 0.11, scale: 1.15, speed: 0.22, alpha: isDark ? 0.28 : 0.60 },
          { x: width * 0.65, y: height * 0.09, scale: 1.05, speed: 0.18, alpha: isDark ? 0.22 : 0.50 }
        ]
      : [
          { x: width * 0.12, y: height * 0.11, scale: 1.35, speed: 0.22, alpha: isDark ? 0.28 : 0.60 },
          { x: width * 0.50, y: height * 0.07, scale: 1.05, speed: 0.18, alpha: isDark ? 0.22 : 0.50 },
          { x: width * 0.82, y: height * 0.18, scale: 1.50, speed: 0.26, alpha: isDark ? 0.30 : 0.55 }
        ];

    const drawDesertCloud = (cx, cy, scale, alpha, stormIntensity) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.arc(24, -8, 28, 0, Math.PI * 2);
      ctx.arc(52, -4, 22, 0, Math.PI * 2);
      ctx.arc(74, 4, 18, 0, Math.PI * 2);
      ctx.arc(36, 12, 22, 0, Math.PI * 2);
      ctx.closePath();

      const cloudAlpha = Math.max(0, alpha * (1 - stormIntensity * 0.6));
      if (isDark) {
        ctx.fillStyle = `rgba(148, 163, 184, ${cloudAlpha})`;
      } else {
        // Awan putih alami dengan sentuhan hangat fajar tipis
        const cg = ctx.createLinearGradient(0, -28, 0, 28);
        cg.addColorStop(0, `rgba(255, 255, 255, ${cloudAlpha * 0.95})`);
        cg.addColorStop(0.7, `rgba(254, 249, 195, ${cloudAlpha * 0.75})`);
        cg.addColorStop(1, `rgba(241, 245, 249, ${cloudAlpha * 0.65})`);
        ctx.fillStyle = cg;
      }
      ctx.fill();
      ctx.restore();
    };

    // ==========================================
    // 4. KAFILAH UNTA MELINTAS (WALKING CAMEL CARAVAN)
    // ==========================================
    const caravan = {
      x: -140,
      speed: 0.45,
      yBaseRatio: 0.78,
      legAngle: 0
    };

    const drawCamel = (cx, cy, scale, legCycle, facingRight = true) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(facingRight ? scale : -scale, scale);

      const camelCol = isDark ? "#1e293b" : "#78350f";

      ctx.fillStyle = camelCol;
      ctx.strokeStyle = camelCol;

      // 1. Badan & Punuk (Camel Hump)
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Punuk Unta (Hump)
      ctx.beginPath();
      ctx.arc(-2, -12, 10, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      // Barang Bawaan Kafilah (Saddle Bag)
      ctx.beginPath();
      ctx.rect(-10, -8, 16, 10);
      ctx.fillStyle = isDark ? "#334155" : "#92400e";
      ctx.fill();
      ctx.fillStyle = camelCol;

      // 2. Leher Melengkung & Kepala (Graceful S-curved Neck & Head)
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.quadraticCurveTo(24, -10, 26, -24);
      ctx.quadraticCurveTo(28, -28, 34, -26);
      ctx.lineTo(34, -22);
      ctx.quadraticCurveTo(24, -18, 18, 4);
      ctx.closePath();
      ctx.fill();

      // Telinga Mini
      ctx.beginPath();
      ctx.moveTo(26, -27);
      ctx.lineTo(28, -32);
      ctx.lineTo(30, -27);
      ctx.closePath();
      ctx.fill();

      // Ekor
      ctx.beginPath();
      ctx.moveTo(-18, 2);
      ctx.quadraticCurveTo(-24, 8, -22, 14);
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Kaki Berjalan Bersiklus (Animated Walking Legs)
      const legOffset1 = Math.sin(legCycle) * 7;
      const legOffset2 = Math.sin(legCycle + Math.PI) * 7;
      const legOffset3 = Math.sin(legCycle + Math.PI * 0.5) * 6;
      const legOffset4 = Math.sin(legCycle + Math.PI * 1.5) * 6;

      const drawLeg = (baseX, baseY, swing) => {
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX + swing * 0.5, baseY + 12);
        ctx.lineTo(baseX + swing, baseY + 24);
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.stroke();
      };

      // Kaki Belakang
      drawLeg(-12, 8, legOffset1);
      drawLeg(-6, 8, legOffset2);

      // Kaki Depan
      drawLeg(8, 8, legOffset3);
      drawLeg(14, 8, legOffset4);

      ctx.restore();
    };

    // ==========================================
    // 5. PARTIKEL DEBU & BUTIRAN BADAI PASIR (SAND PARTICLES)
    // ==========================================
    const sandParticlesCount = isMobile ? 30 : 130;
    const sandParticles = Array.from({ length: sandParticlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.random() * 2.0 + 1.0,
      vy: Math.random() * 0.4 - 0.2,
      size: Math.random() * 2.0 + 0.8,
      baseAlpha: Math.random() * 0.45 + 0.2,
      pulse: Math.random() * Math.PI * 2
    }));

    // Mouse Tracking
    let mouse = { x: null, y: null, radius: 160 };

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
    // 6. DRAW: LANGIT GURUN PASIR LEMBUT SEIMBANG (BALANCED NATURAL SKY)
    // ==========================================
    const drawDesertSky = (stormIntensity) => {
      ctx.save();
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.85);

      if (isDark) {
        // Langit Malam Gurun: Indigo pekat dengan bias senja tembaga lembut di ufuk
        skyGrad.addColorStop(0, "rgba(15, 23, 42, 0.95)");
        skyGrad.addColorStop(0.55, "rgba(30, 27, 75, 0.85)");
        skyGrad.addColorStop(0.85, "rgba(69, 26, 3, 0.55)");
        skyGrad.addColorStop(1, "rgba(120, 53, 15, 0.7)");
      } else {
        // Langit Siang Gurun Pasir Alami & Lembut:
        // Atas: Langit terang jernih lembut bergradasi hangat
        // Tengah: Semburat fajar keemasan lembut (tidak pekat kuning)
        // Ufuk: Kabut pasir gurun hangat menyatu dengan bukit pasir
        const stormExtra = stormIntensity * 0.25;
        skyGrad.addColorStop(0, `rgba(240, 249, 255, ${0.45 + stormExtra})`); // Lembut sejuk di langit atas
        skyGrad.addColorStop(0.40, `rgba(254, 243, 199, ${0.45 + stormExtra})`); // Sentuhan hangat fajar
        skyGrad.addColorStop(0.70, `rgba(253, 230, 138, ${0.40 + stormExtra})`); // Amber gurun lembut
        skyGrad.addColorStop(0.92, `rgba(251, 191, 36, ${0.45 + stormExtra})`); // Ufuk pasir hangat
        skyGrad.addColorStop(1, `rgba(245, 158, 11, 0.55)`); // Menyatu dengan punggung bukit pasir
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    // ==========================================
    // 7. DRAW: BUKIT PASIR BERGELOMBANG (ROLLING SAND DUNES)
    // ==========================================
    const drawDesertLandscape = (stormIntensity) => {
      const baseY = height;

      // --- LAYER 1: BUKIT PASIR JAUH (BACKGROUND DUNES) ---
      ctx.save();
      const dune1Grad = ctx.createLinearGradient(0, height * 0.60, 0, height);
      if (isDark) {
        dune1Grad.addColorStop(0, "rgba(30, 41, 59, 0.6)");
        dune1Grad.addColorStop(1, "rgba(15, 23, 42, 0.85)");
      } else {
        dune1Grad.addColorStop(0, "rgba(251, 191, 36, 0.55)");
        dune1Grad.addColorStop(1, "rgba(245, 158, 11, 0.65)");
      }
      ctx.fillStyle = dune1Grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(0, height * 0.71);
      ctx.bezierCurveTo(
        width * 0.28, height * 0.62,
        width * 0.52, height * 0.76,
        width * 0.78, height * 0.66
      );
      ctx.quadraticCurveTo(width * 0.90, height * 0.61, width, height * 0.68);
      ctx.lineTo(width, baseY);
      ctx.closePath();
      ctx.fill();

      // Puncak bukit pasir jauh berpendar
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.3)" : "rgba(254, 240, 138, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // --- SILUET MASJID OASE GURUN & MENARA DI PUNGGUNG BUKIT ---
      ctx.save();
      const mosqueX = width * 0.28;
      const mosqueY = height * 0.67;

      const mosqueGrad = ctx.createLinearGradient(0, mosqueY - 65, 0, mosqueY + 30);
      if (isDark) {
        mosqueGrad.addColorStop(0, "rgba(71, 85, 105, 0.65)");
        mosqueGrad.addColorStop(1, "rgba(30, 41, 59, 0.85)");
      } else {
        mosqueGrad.addColorStop(0, "rgba(180, 83, 9, 0.65)");
        mosqueGrad.addColorStop(1, "rgba(146, 64, 14, 0.8)");
      }
      ctx.fillStyle = mosqueGrad;

      // Kubah Utama Gurun (Persian Onion Dome)
      ctx.beginPath();
      ctx.moveTo(mosqueX - 32, mosqueY);
      ctx.bezierCurveTo(
        mosqueX - 36, mosqueY - 45,
        mosqueX - 10, mosqueY - 65,
        mosqueX, mosqueY - 70
      );
      ctx.bezierCurveTo(
        mosqueX + 10, mosqueY - 65,
        mosqueX + 36, mosqueY - 45,
        mosqueX + 32, mosqueY
      );
      ctx.closePath();
      ctx.fill();

      // Bulan Sabit Puncak Kubah
      ctx.beginPath();
      ctx.arc(mosqueX, mosqueY - 73, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#fbbf24" : "#fef08a";
      ctx.fill();
      ctx.fillStyle = mosqueGrad;

      // Kubah Kecil Samping
      ctx.beginPath();
      ctx.arc(mosqueX + 42, mosqueY - 12, 16, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      // Menara Gurun Kiri (Tinggi Ramping dengan Balkon Muadzin)
      ctx.beginPath();
      ctx.moveTo(mosqueX - 52, mosqueY + 5);
      ctx.lineTo(mosqueX - 52, mosqueY - 80);
      ctx.lineTo(mosqueX - 56, mosqueY - 80);
      ctx.lineTo(mosqueX - 56, mosqueY - 84);
      ctx.lineTo(mosqueX - 44, mosqueY - 84);
      ctx.lineTo(mosqueX - 44, mosqueY - 80);
      ctx.lineTo(mosqueX - 48, mosqueY - 80);
      ctx.lineTo(mosqueX - 48, mosqueY - 95);
      ctx.lineTo(mosqueX - 50, mosqueY - 102);
      ctx.lineTo(mosqueX - 52, mosqueY - 95);
      ctx.closePath();
      ctx.fill();

      // Menara Kanan
      ctx.beginPath();
      ctx.moveTo(mosqueX + 70, mosqueY + 5);
      ctx.lineTo(mosqueX + 70, mosqueY - 75);
      ctx.lineTo(mosqueX + 67, mosqueY - 75);
      ctx.lineTo(mosqueX + 67, mosqueY - 78);
      ctx.lineTo(mosqueX + 77, mosqueY - 78);
      ctx.lineTo(mosqueX + 77, mosqueY - 75);
      ctx.lineTo(mosqueX + 74, mosqueY - 75);
      ctx.lineTo(mosqueX + 74, mosqueY - 88);
      ctx.lineTo(mosqueX + 72, mosqueY - 94);
      ctx.closePath();
      ctx.fill();

      // Pohon Kurma Oase (Date Palms)
      const drawPalm = (tx, ty, scale, sway) => {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8 + sway * 12, -22, 6 + sway * 20, -45);
        ctx.strokeStyle = isDark ? "rgba(100, 116, 139, 0.75)" : "rgba(146, 64, 14, 0.85)";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        const topX = 6 + sway * 20;
        const topY = -45;
        const leaves = [-0.9, -0.5, -0.1, 0.3, 0.7, 1.1];
        leaves.forEach((ang) => {
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.quadraticCurveTo(
            topX + Math.sin(ang + sway) * 18,
            topY - Math.cos(ang) * 16,
            topX + Math.sin(ang + sway * 1.5) * 28,
            topY - Math.cos(ang) * 8
          );
          ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.7)" : "rgba(180, 83, 9, 0.95)";
          ctx.lineWidth = 2.2;
          ctx.stroke();
        });

        ctx.restore();
      };

      const palmSway = Math.sin(step * 0.03) * 0.08 + stormIntensity * 0.25;
      drawPalm(mosqueX - 80, mosqueY + 8, 1.0, palmSway);
      drawPalm(mosqueX - 105, mosqueY + 14, 0.8, palmSway * 1.2);
      drawPalm(mosqueX + 98, mosqueY + 10, 0.9, palmSway * 0.9);
      drawPalm(mosqueX + 120, mosqueY + 16, 0.75, palmSway * 1.1);

      ctx.restore();

      // --- LAYER 2: BUKIT PASIR TENGAH (MIDGROUND DUNES) ---
      ctx.save();
      const dune2Grad = ctx.createLinearGradient(0, height * 0.70, 0, height);
      if (isDark) {
        dune2Grad.addColorStop(0, "rgba(51, 65, 85, 0.75)");
        dune2Grad.addColorStop(1, "rgba(15, 23, 42, 0.92)");
      } else {
        dune2Grad.addColorStop(0, "rgba(245, 158, 11, 0.70)");
        dune2Grad.addColorStop(1, "rgba(217, 119, 6, 0.80)");
      }
      ctx.fillStyle = dune2Grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(0, height * 0.78);
      ctx.bezierCurveTo(
        width * 0.32, height * 0.72,
        width * 0.62, height * 0.83,
        width * 0.84, height * 0.75
      );
      ctx.quadraticCurveTo(width * 0.92, height * 0.72, width, height * 0.79);
      ctx.lineTo(width, baseY);
      ctx.closePath();
      ctx.fill();

      // Garis Puncak Bukit Pasir Berpendar Emas
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.35)" : "rgba(254, 240, 138, 0.75)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // --- RENDER KAFILAH UNTA DI ATAS BUKIT TENGAH ---
      caravan.x += caravan.speed * (1 + stormIntensity * 0.8);
      if (caravan.x > width + 240) {
        caravan.x = -180;
      }
      caravan.legAngle += 0.08;

      const camelBaseY = height * caravan.yBaseRatio + Math.sin(caravan.x * 0.003) * 16;
      drawCamel(caravan.x, camelBaseY, 1.05, caravan.legAngle);
      drawCamel(caravan.x - 55, camelBaseY + 4, 0.95, caravan.legAngle + 1.2);
      drawCamel(caravan.x - 105, camelBaseY + 7, 0.88, caravan.legAngle + 2.4);

      // Tali Penghubung Antar Unta
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(caravan.x - 14, camelBaseY - 2);
      ctx.quadraticCurveTo(caravan.x - 35, camelBaseY + 6, caravan.x - 46, camelBaseY + 2);
      ctx.moveTo(caravan.x - 69, camelBaseY + 2);
      ctx.quadraticCurveTo(caravan.x - 88, camelBaseY + 10, caravan.x - 96, camelBaseY + 5);
      ctx.strokeStyle = isDark ? "#475569" : "#92400e";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // --- LAYER 3: BUKIT PASIR DEPAN (FOREGROUND DUNES) ---
      ctx.save();
      const dune3Grad = ctx.createLinearGradient(0, height * 0.80, 0, height);
      if (isDark) {
        dune3Grad.addColorStop(0, "rgba(30, 41, 59, 0.92)");
        dune3Grad.addColorStop(1, "rgba(15, 23, 42, 0.98)");
      } else {
        dune3Grad.addColorStop(0, "rgba(217, 119, 6, 0.82)");
        dune3Grad.addColorStop(1, "rgba(180, 83, 9, 0.92)");
      }
      ctx.fillStyle = dune3Grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(0, height * 0.87);
      ctx.bezierCurveTo(
        width * 0.28, height * 0.81,
        width * 0.65, height * 0.91,
        width, height * 0.84
      );
      ctx.lineTo(width, baseY);
      ctx.closePath();
      ctx.fill();

      // Garis Puncak Pasir Depan
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.3)" : "rgba(253, 230, 138, 0.65)";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    };

    // ==========================================
    // 8. DRAW: EFEK BADAI PASIR DINAMIS (HABOOB / SIMOOM GUST)
    // ==========================================
    const drawSandstormOverlay = (stormIntensity) => {
      if (stormIntensity <= 0.01) return;

      ctx.save();
      // Kabut Debu Badai Pasir Lembut Alami
      const hazeGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isDark) {
        hazeGrad.addColorStop(0, `rgba(51, 65, 85, ${stormIntensity * 0.35})`);
        hazeGrad.addColorStop(1, `rgba(180, 83, 9, ${stormIntensity * 0.25})`);
      } else {
        hazeGrad.addColorStop(0, `rgba(254, 243, 199, ${stormIntensity * 0.35})`);
        hazeGrad.addColorStop(0.5, `rgba(251, 191, 36, ${stormIntensity * 0.30})`);
        hazeGrad.addColorStop(1, `rgba(217, 119, 6, ${stormIntensity * 0.38})`);
      }
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, width, height);

      // Garis Sapuan Angin Badai Pasir (Fast Sand Sweeps)
      ctx.strokeStyle = isDark ? `rgba(251, 191, 36, ${stormIntensity * 0.3})` : `rgba(254, 240, 138, ${stormIntensity * 0.45})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([40, 60]);

      for (let i = 0; i < 7; i++) {
        const lineY = height * (0.25 + i * 0.11) + Math.sin(step * 0.05 + i) * 15;
        ctx.beginPath();
        ctx.moveTo(-100, lineY);
        ctx.lineTo(width + 100, lineY - 30);
        ctx.stroke();
      }
      ctx.setLineDash([]);
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

      // Kalkulasi Intensitas Badai Pasir (0.0 sampai 1.0)
      const cycleStep = step % SANDSTORM_CYCLE_FRAMES;
      let stormIntensity = 0;
      if (cycleStep >= STORM_START && cycleStep < STORM_PEAK) {
        stormIntensity = (cycleStep - STORM_START) / (STORM_PEAK - STORM_START);
      } else if (cycleStep >= STORM_PEAK && cycleStep < STORM_END) {
        stormIntensity = 1.0 - ((cycleStep - STORM_PEAK) / (STORM_END - STORM_PEAK)) * 0.85;
      } else if (cycleStep >= STORM_END && cycleStep < STORM_END + 60 * 3) {
        stormIntensity = (1.0 - (cycleStep - STORM_END) / (60 * 3)) * 0.15;
      }

      // 1. Render Langit Gurun Alami & Seimbang (Tidak Menyilaukan)
      drawDesertSky(stormIntensity);

      // 2. Render Langit Malam (Bintang Mode Gelap)
      if (isDark) {
        stars.forEach((s) => {
          const alpha = (s.baseAlpha + Math.sin(step * s.twinkleSpeed + s.twinkleOffset) * 0.25) * (1 - stormIntensity * 0.8);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, alpha)})`;
          ctx.fill();
        });
      }

      // 3. Render Matahari Terik Gurun (Terang) / Bulan Sabit Sahara (Gelap)
      const celX = width * celestial.xRatio;
      const celY = height * celestial.yRatio;
      const pulse = Math.sin(step * 0.02) * 0.05 + 0.95;

      if (isDark) {
        ctx.save();
        ctx.translate(celX, celY);
        const moonGlow = ctx.createRadialGradient(0, 0, celestial.baseRadius * 0.5, 0, 0, celestial.glowRadius);
        moonGlow.addColorStop(0, "rgba(254, 240, 138, 0.5)");
        moonGlow.addColorStop(0.6, "rgba(251, 191, 36, 0.15)");
        moonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(0, 0, celestial.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, celestial.baseRadius * pulse, -Math.PI * 0.38, Math.PI * 0.85, false);
        ctx.arc(celestial.baseRadius * 0.42, -celestial.baseRadius * 0.22, celestial.baseRadius * 0.86, Math.PI * 0.72, -Math.PI * 0.32, true);
        ctx.closePath();
        ctx.fillStyle = "#fef08a";
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(celX, celY);
        const sunGlow = ctx.createRadialGradient(0, 0, celestial.baseRadius * 0.3, 0, 0, celestial.glowRadius * (1 + Math.sin(step * 0.02) * 0.1));
        sunGlow.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        sunGlow.addColorStop(0.25, "rgba(254, 240, 138, 0.65)");
        sunGlow.addColorStop(0.6, "rgba(251, 191, 36, 0.30)");
        sunGlow.addColorStop(0.85, "rgba(245, 158, 11, 0.12)");
        sunGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(0, 0, celestial.glowRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, celestial.baseRadius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Awan Gurun Lembut
      clouds.forEach((c) => {
        c.x += c.speed * (1 + stormIntensity * 1.5);
        if (c.x > width + 180) {
          c.x = -180;
          c.y = height * (0.05 + Math.random() * 0.16);
        }
        drawDesertCloud(c.x, c.y, c.scale, c.alpha, stormIntensity);
      });

      // 5. Render Bukit Pasir, Masjid Oase, dan Kafilah Unta
      drawDesertLandscape(stormIntensity);

      // 6. Render Partikel Debu Pasir Gurun & Badai Pasir (Sand Dust Particles)
      sandParticles.forEach((p) => {
        const speedBoost = 1 + stormIntensity * 4.5;
        p.x += p.vx * speedBoost;
        p.y += p.vy + (stormIntensity > 0.2 ? Math.sin(step * 0.1 + p.x) * 0.8 : 0);
        p.pulse += 0.03;

        if (p.x > width + 20) {
          p.x = -20;
          p.y = Math.random() * height;
        }
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * force * 2.2;
            p.y += (dy / dist) * force * 2.2;
          }
        }

        const alpha = (p.baseAlpha + Math.sin(p.pulse) * 0.15) * (1 + stormIntensity * 0.6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + stormIntensity * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(251, 191, 36, ${Math.min(1, alpha)})`
          : `rgba(217, 119, 6, ${Math.min(0.75, alpha)})`;
        ctx.fill();
      });

      // 7. Render Layer Badai Pasir
      drawSandstormOverlay(stormIntensity);
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
      className="islamic-desert-canvas"
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
