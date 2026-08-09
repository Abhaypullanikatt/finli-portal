"use client";

import { useEffect, useRef } from "react";

const SOURCE_WIDTH = 1672;
const SOURCE_HEIGHT = 944;
const RIBBON_START_X = 1030;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function RibbonWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const ribbons = new Image();
    ribbons.src = "/hero-concepts/15-financial-ribbons-layer-v10.png";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let hoveredStrength = 1;
    let ready = false;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas.height = Math.max(1, Math.round(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = false;
    };

    const render = (time = 0) => {
      if (!ready) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);

      const scale = Math.max(width / SOURCE_WIDTH, height / SOURCE_HEIGHT);
      const drawWidth = SOURCE_WIDTH * scale;
      const drawHeight = SOURCE_HEIGHT * scale;
      const originX = (width - drawWidth) / 2;
      const originY = (height - drawHeight) / 2;
      const reduced = reducedMotion.matches;
      const hero = canvas.closest(".hero-shell");
      const targetStrength = hero?.matches(":hover, :focus-within") ? 1.22 : 1;
      hoveredStrength += (targetStrength - hoveredStrength) * 0.035;

      const sourceSlice = Math.max(2, Math.round(3 / scale));
      for (let sourceX = RIBBON_START_X; sourceX < SOURCE_WIDTH; sourceX += sourceSlice) {
        const isWindsock = sourceX < 1200;
        const anchorFade = isWindsock
          ? clamp((sourceX - 1050) / 135)
          : clamp((SOURCE_WIDTH - sourceX) / 430);
        const primaryWave = Math.sin(time * 0.0017 + sourceX * 0.024);
        const secondaryWave = Math.sin(time * 0.00105 + sourceX * 0.011 + 1.8);
        const offsetY = reduced
          ? 0
          : (primaryWave * 3.1 + secondaryWave * 1.15) * anchorFade * hoveredStrength;
        const destinationX = originX + sourceX * scale;
        const destinationWidth = sourceSlice * scale + 1;

        context.drawImage(
          ribbons,
          sourceX,
          0,
          sourceSlice,
          SOURCE_HEIGHT,
          destinationX,
          Math.round(originY + offsetY),
          destinationWidth,
          drawHeight,
        );
      }

      if (!reduced) frame = window.requestAnimationFrame(render);
    };

    const start = () => {
      ready = true;
      resize();
      window.cancelAnimationFrame(frame);
      render();
    };

    ribbons.addEventListener("load", start);
    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion.matches) render();
    });
    observer.observe(canvas);

    return () => {
      ribbons.removeEventListener("load", start);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-ribbons" aria-hidden="true" />;
}
