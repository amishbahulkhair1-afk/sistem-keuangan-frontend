import React, { useEffect, useRef } from "react";

export default function WaveCanvas() {
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

    // Definisi 4 layer gelombang multi-warna (Sky Blue Palette)
    const waves = [
      {
        frequency: 0.0035,
        amplitude: 55,
        speed: 0.018,
        offset: 0,
        baseY: 0.68,
        colorStart: "rgba(56, 189, 248, 0.28)", // sky-400
        colorEnd: "rgba(14, 165, 233, 0.05)"
      },
      {
        frequency: 0.0048,
        amplitude: 45,
        speed: -0.014,
        offset: 2,
        baseY: 0.74,
        colorStart: "rgba(2, 132, 199, 0.22)", // sky-600
        colorEnd: "rgba(56, 189, 248, 0.03)"
      },
      {
        frequency: 0.0062,
        amplitude: 65,
        speed: 0.022,
        offset: 4,
        baseY: 0.80,
        colorStart: "rgba(125, 211, 252, 0.35)", // sky-300
        colorEnd: "rgba(186, 230, 253, 0.06)"
      },
      {
        frequency: 0.0028,
        amplitude: 40,
        speed: -0.011,
        offset: 1,
        baseY: 0.86,
        colorStart: "rgba(3, 105, 161, 0.20)", // sky-700
        colorEnd: "rgba(2, 132, 199, 0.02)"
      }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 1;

      waves.forEach((w) => {
        ctx.beginPath();
        const startY = height * w.baseY;
        ctx.moveTo(0, height);
        ctx.lineTo(0, startY);

        for (let x = 0; x <= width; x += 6) {
          // Kombinasi sin + cos untuk fluiditas gelombang organik alami
          const y =
            startY +
            Math.sin(x * w.frequency + step * w.speed + w.offset) * w.amplitude +
            Math.cos(x * w.frequency * 0.6 + step * (w.speed * 0.7)) * (w.amplitude * 0.35);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Linear gradient vertikal dari puncak gelombang ke bawah
        const gradient = ctx.createLinearGradient(0, startY - w.amplitude, 0, height);
        gradient.addColorStop(0, w.colorStart);
        gradient.addColorStop(1, w.colorEnd);

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="wave-canvas"
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
