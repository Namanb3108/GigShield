import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Aurora({
  colorStops = ["#F26522", "#C44E10", "#1A3557"],
  amplitude = 1.0,
  blend = 0.5,
  speed = 0.5,
  style = {},
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const colors = colorStops.map(hexToRgb);

    const draw = () => {
      timeRef.current += speed * 0.004;
      const t = timeRef.current;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      colors.forEach((color, i) => {
        const offset = (i / colors.length) * Math.PI * 2;
        const x = w * 0.5 + Math.sin(t + offset) * w * 0.35 * amplitude;
        const y = h * 0.5 + Math.cos(t * 0.8 + offset) * h * 0.3 * amplitude;
        const r = Math.max(w, h) * 0.7;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${0.55 * blend})`);
        grad.addColorStop(0.5, `rgba(${color[0]},${color[1]},${color[2]},${0.15 * blend})`);
        grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);

        ctx.globalCompositeOperation = i === 0 ? "source-over" : "screen";
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [colorStops, amplitude, blend, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
