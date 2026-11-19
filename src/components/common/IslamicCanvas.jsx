import React, { useEffect, useRef } from "react";
import vectorImgSrc from "../../assets/vector.png";

export default function IslamicCanvas({ theme = "light" }) {
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

    // Load vector.png image
    const bgImage = new Image();
    bgImage.src = vectorImgSrc;
    let imageLoaded = false;
    bgImage.onload = () => {
      imageLoaded = true;
    };

    // ==========================================
    // 1. BINTANG MALAM (DARK MODE CELESTIAL)
    // ==========================================
    const starsCount = isMobile ? 16 : 50;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.55),
      size: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.6 + 0.25,
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      twinkleOffset: Math.random() * Math.PI * 2
    }));

    // ==========================================
    // 2. AWAN MENGAMBANG DINAMIS (DRIFTING CLOUDS)
    // ==========================================
    const clouds = isMobile
      ? [
          { x: width * 0.1, y: height * 0.08, scale: 1.1, speed: 0.2, alpha: isDark ? 0.25 : 0.65 },
          { x: width * 0.6, y: height * 0.12, scale: 1.2, speed: 0.24, alpha: isDark ? 0.28 : 0.60 }
        ]
      : [
          { x: width * 0.05, y: height * 0.08, scale: 1.15, speed: 0.22, alpha: isDark ? 0.25 : 0.65 },
          { x: width * 0.38, y: height * 0.05, scale: 0.85, speed: 0.16, alpha: isDark ? 0.20 : 0.55 },
          { x: width * 0.65, y: height * 0.14, scale: 1.35, speed: 0.26, alpha: isDark ? 0.28 : 0.60 },
          { x: width * 0.90, y: height * 0.09, scale: 0.95, speed: 0.18, alpha: isDark ? 0.18 : 0.50 }
        ];

    const drawFluffyCloud = (cx, cy, scale, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.arc(20, -8, 26, 0, Math.PI * 2);
      ctx.arc(44, -4, 22, 0, Math.PI * 2);
      ctx.arc(62, 3, 18, 0, Math.PI * 2);
      ctx.arc(32, 10, 20, 0, Math.PI * 2);
      ctx.closePath();

      const cloudGrad = ctx.createLinearGradient(0, -25, 0, 25);
      if (isDark) {
        cloudGrad.addColorStop(0, `rgba(148, 163, 184, ${alpha * 0.7})`);
        cloudGrad.addColorStop(1, `rgba(51, 65, 85, ${alpha * 0.4})`);
      } else {
        cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        cloudGrad.addColorStop(0.7, `rgba(240, 249, 255, ${alpha * 0.8})`);
        cloudGrad.addColorStop(1, `rgba(224, 242, 254, ${alpha * 0.5})`);
      }
      ctx.fillStyle = cloudGrad;
      ctx.fill();

      ctx.restore();
    };

    // ==========================================
    // 3. DAUN RINDANG MELAYANG (DRIFTING LEAVES)
    // ==========================================
    const leavesCount = isMobile ? 6 : 18;
    const leaves = Array.from({ length: leavesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 6 + 7,
      vx: Math.random() * 0.4 + 0.2,
      vy: Math.random() * 0.5 + 0.35,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.03 + 0.015,
      color: isDark
        ? Math.random() > 0.5 ? "#065f46" : "#047857"
        : Math.random() > 0.5 ? "#15803d" : "#16a34a"
    }));

    const drawLeaf = (lx, ly, size, rot, color) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);

      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.6, -size * 0.2, 0, size);
      ctx.quadraticCurveTo(-size * 0.6, -size * 0.2, 0, -size);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.globalAlpha = isDark ? 0.6 : 0.75;
      ctx.fill();

      // Tangkai daun
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.strokeStyle = isDark ? "#064e3b" : "#166534";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };

    // ==========================================
    // 4. PARTIKEL CAHAYA NUR / BARAKAH / KUNANG-KUNANG
    // ==========================================
    const particleCount = isMobile ? 12 : 36;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.15),
      radius: Math.random() * 2.2 + 1.0,
      baseAlpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.012,
      colorType: Math.random() > 0.45 ? "gold" : "cyan"
    }));

    // ==========================================
    // 5. DRAW: BULAN SABIT ELEGAN (DARK MODE)
    // ==========================================
    const drawCrescentMoon = (cx, cy, radius, pulse) => {
      ctx.save();
      ctx.translate(cx, cy);

      const moonGlow = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius * 2.8);
      moonGlow.addColorStop(0, "rgba(254, 240, 138, 0.45)");
      moonGlow.addColorStop(0.5, "rgba(56, 189, 248, 0.15)");
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

      // Bintang Kejora
      const starX = radius * 0.55;
      const starY = -radius * 0.15;
      const starR = radius * 0.26;

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x1 = starX + Math.cos(angle) * starR;
        const y1 = starY + Math.sin(angle) * starR;
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);

        const innerAngle = angle + Math.PI / 5;
        const x2 = starX + Math.cos(innerAngle) * (starR * 0.42);
        const y2 = starY + Math.sin(innerAngle) * (starR * 0.42);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fillStyle = "#fef08a";
      ctx.fill();

      ctx.restore();
    };

    // ==========================================
    // 6. DRAW: SINAR MENTARI PAGI (LIGHT MODE)
    // ==========================================
    const drawSunGlow = (cx, cy, radius) => {
      ctx.save();
      ctx.translate(cx, cy);

      const sunAura = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 3.5);
      sunAura.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      sunAura.addColorStop(0.3, "rgba(254, 240, 138, 0.25)");
      sunAura.addColorStop(0.6, "rgba(251, 191, 36, 0.08)");
      sunAura.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = sunAura;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Sinar Crepuscular
      ctx.save();
      ctx.rotate(step * 0.002);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (radius * 0.8), Math.sin(ang) * (radius * 0.8));
        ctx.lineTo(
          Math.cos(ang) * (radius * 2.8 + Math.sin(step * 0.03 + i) * 10),
          Math.sin(ang) * (radius * 2.8 + Math.sin(step * 0.03 + i) * 10)
        );
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.18 + Math.sin(step * 0.02 + i) * 0.08})`;
        ctx.lineWidth = 3.5;
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();
    };

    // ==========================================
    // 7. RENDER VECTOR ARTWORK (PESANTREN LATEE)
    // ==========================================
    const drawVectorArtwork = () => {
      if (!imageLoaded || !bgImage.complete || bgImage.naturalWidth === 0) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (isDark) {
          bgGrad.addColorStop(0, "#091124");
          bgGrad.addColorStop(1, "#0f172a");
        } else {
          bgGrad.addColorStop(0, "#bae6fd");
          bgGrad.addColorStop(1, "#e0f2fe");
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        return;
      }

      const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      const canvasRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      // Cover scaling dengan ground alignment
      if (canvasRatio > imgRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = height - drawHeight;
      } else {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) * 0.5;
        offsetY = 0;
      }

      ctx.save();
      ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);

      if (isDark) {
        ctx.fillStyle = "rgba(10, 20, 42, 0.72)";
        ctx.fillRect(0, 0, width, height);

        const moonLight = ctx.createRadialGradient(
          width * 0.8,
          height * 0.15,
          10,
          width * 0.8,
          height * 0.15,
          width * 0.9
        );
        moonLight.addColorStop(0, "rgba(186, 230, 253, 0.18)");
        moonLight.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
        moonLight.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = moonLight;
        ctx.fillRect(0, 0, width, height);

        const winGlow = ctx.createRadialGradient(
          width * 0.55,
          height * 0.65,
          10,
          width * 0.55,
          height * 0.65,
          width * 0.45
        );
        winGlow.addColorStop(0, "rgba(251, 191, 36, 0.22)");
        winGlow.addColorStop(0.6, "rgba(245, 158, 11, 0.08)");
        winGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = winGlow;
        ctx.fillRect(0, 0, width, height);
      } else {
        const lightBloom = ctx.createLinearGradient(0, 0, 0, height);
        lightBloom.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        lightBloom.addColorStop(0.5, "rgba(255, 255, 255, 0.0)");
        lightBloom.addColorStop(1, "rgba(255, 255, 255, 0.10)");
        ctx.fillStyle = lightBloom;
        ctx.fillRect(0, 0, width, height);
      }

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

      // 1. Render Artwork Utama (Pesantren Latee dari vector.png)
      drawVectorArtwork();

      // 2. Render Bintang & Bulan Sabit (Jika Mode Gelap)
      if (isDark) {
        stars.forEach((s) => {
          const alpha = s.baseAlpha + Math.sin(step * s.twinkleSpeed + s.twinkleOffset) * 0.25;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, alpha)})`;
          ctx.fill();
        });

        const moonX = width * 0.82;
        const moonY = height * 0.15;
        const moonPulse = Math.sin(step * 0.02) * 0.04 + 0.96;
        drawCrescentMoon(moonX, moonY, Math.min(width * 0.038, 36), moonPulse);
      } else {
        const sunX = width * 0.85;
        const sunY = height * 0.12;
        drawSunGlow(sunX, sunY, Math.min(width * 0.04, 40));
      }

      // 3. Render Awan Fluffy Mengambang di Langit
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > width + 180) {
          c.x = -180;
          c.y = height * (0.04 + Math.random() * 0.14);
        }
        drawFluffyCloud(c.x, c.y, c.scale, c.alpha);
      });

      // 4. Render Daun Melayang Tertiup Angin dari Pepohonan
      leaves.forEach((l) => {
        l.x += l.vx;
        l.y += l.vy;
        l.rot += l.rotSpeed;
        l.swing += l.swingSpeed;
        const dynamicX = l.x + Math.sin(l.swing) * 1.5;

        if (l.y > height + 20) {
          l.y = -20;
          l.x = Math.random() * width;
        }
        if (l.x > width + 20) {
          l.x = -20;
          l.y = Math.random() * height;
        }

        drawLeaf(dynamicX, l.y, l.size, l.rot, l.color);
      });

      // 5. Render Partikel Barakah / Nur / Kunang-kunang Melayang
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const alpha = p.baseAlpha + Math.sin(p.pulse) * 0.2;
        const color = isDark
          ? p.colorType === "gold"
            ? `rgba(254, 240, 138, ${Math.max(0, alpha)})`
            : `rgba(56, 189, 248, ${Math.max(0, alpha)})`
          : p.colorType === "gold"
            ? `rgba(251, 191, 36, ${Math.max(0, alpha * 0.85)})`
            : `rgba(14, 165, 233, ${Math.max(0, alpha * 0.75)})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="islamic-canvas"
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
