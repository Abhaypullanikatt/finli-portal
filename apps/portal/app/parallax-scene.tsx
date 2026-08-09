"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const buildContourPath = (seed: number) => {
  const pointCount = 28;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2 - Math.PI / 2;
    const drift = seed * 0.34;
    const radiusX = 452
      + Math.sin(angle * 5 + drift) * 21
      + Math.cos(angle * 3 - drift) * 12;
    const radiusY = 398
      + Math.sin(angle * 4 - drift) * 17
      + Math.cos(angle * 6 + drift) * 8;

    return {
      x: 500 + Math.cos(angle) * radiusX + Math.sin(drift) * 9,
      y: 500 + Math.sin(angle) * radiusY + Math.cos(drift) * 7,
    };
  });

  const commands = points.map((point, index) => {
    const previous = points[(index - 1 + pointCount) % pointCount]!;
    const next = points[(index + 1) % pointCount]!;
    const afterNext = points[(index + 2) % pointCount]!;
    const controlOne = {
      x: point.x + (next.x - previous.x) / 6,
      y: point.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (afterNext.x - point.x) / 6,
      y: next.y - (afterNext.y - point.y) / 6,
    };

    return `C ${controlOne.x.toFixed(2)},${controlOne.y.toFixed(2)} ${controlTwo.x.toFixed(2)},${controlTwo.y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
  });

  return `M ${points[0]!.x.toFixed(2)},${points[0]!.y.toFixed(2)} ${commands.join(" ")} Z`;
};

const rings = Array.from({ length: 26 }, (_, index) => ({
  rotation: index * 2.6,
  tone: index === 12 ? "lime" : index % 2 === 0 ? "green" : "parchment",
  path: buildContourPath(index + 1),
}));

const milestones = [
  { className: "scroll-float-safety", start: 0.14, icon: "✓", label: "Safety fund", value: "On track" },
  { className: "scroll-float-plan", start: 0.33, icon: "68%", label: "Monthly plan", value: "Clear" },
  { className: "scroll-float-buffer", start: 0.51, icon: "₹", label: "Next priority", value: "Build a buffer" },
  { className: "scroll-float-learn", start: 0.69, icon: "✦", label: "Next lesson", value: "Buffer basics" },
  { className: "scroll-float-review", start: 0.84, icon: "↗", label: "Weekly review", value: "Ready" },
];

export function ParallaxScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const floatRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ringRefs = useRef<Array<SVGPathElement | null>>([]);
  const targetProgress = useRef(0);
  const renderedProgress = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    section.dataset.reducedMotion = String(reducedMotion.matches);
    if (reducedMotion.matches) return;

    let frame = 0;
    let visible = false;

    const scheduleRender = () => {
      if (!frame && visible) frame = window.requestAnimationFrame(render);
    };

    const updateTarget = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      targetProgress.current = clamp(-rect.top / travel);
      scheduleRender();
    };

    const render = () => {
      frame = 0;
      const delta = targetProgress.current - renderedProgress.current;
      renderedProgress.current += delta * 0.18;
      if (Math.abs(delta) < 0.0002) renderedProgress.current = targetProgress.current;
      const progress = renderedProgress.current;
      const tunnelProgress = ease(clamp(progress / 0.78));
      const tunnelScale = 0.96 + tunnelProgress * 0.12;
      const tunnelOpacity = 1 - ease(clamp((progress - 0.69) / 0.16));
      const introOpacity = 1 - ease(clamp((progress - 0.05) / 0.2));
      const washOpacity = ease(clamp((progress - 0.88) / 0.12));
      const finalOpacity = ease(clamp((progress - 0.93) / 0.07));

      section.style.setProperty("--tunnel-scale", tunnelScale.toFixed(4));
      section.style.setProperty("--tunnel-rotate", `${(progress * 6).toFixed(3)}deg`);
      section.style.setProperty("--tunnel-opacity", tunnelOpacity.toFixed(4));
      section.style.setProperty("--intro-opacity", introOpacity.toFixed(4));
      section.style.setProperty("--intro-scale", (1 + progress * 0.32).toFixed(4));
      section.style.setProperty("--wash-opacity", washOpacity.toFixed(4));
      section.style.setProperty("--final-opacity", finalOpacity.toFixed(4));
      section.style.setProperty("--final-y", `${((1 - finalOpacity) * 32).toFixed(2)}px`);
      section.style.setProperty("--scroll-progress", progress.toFixed(4));

      const ringTravel = tunnelProgress * 15;
      ringRefs.current.forEach((element, index) => {
        if (!element) return;
        const phase = (index + ringTravel) % rings.length;
        const depth = phase / (rings.length - 1);
        const scale = 0.112 * Math.pow(1.095, phase);
        const edgeFade = 1 - ease(clamp((depth - 0.9) / 0.1));
        const centerFade = ease(clamp(phase / 1.4));
        element.style.opacity = (edgeFade * centerFade).toFixed(4);
        element.style.transform = `rotate(${(rings[index]!.rotation + progress * 5).toFixed(3)}deg) scale(${scale.toFixed(5)})`;
      });

      floatRefs.current.forEach((element) => {
        if (!element) return;
        const start = Number(element.dataset.start ?? 0);
        const local = clamp((progress - start) / 0.28);
        const visibility = Math.sin(local * Math.PI);
        const direction = Number(element.dataset.direction ?? 1);
        const scale = 0.52 + ease(local) * 1.42;
        const x = direction * (80 - local * 190);
        const y = (0.5 - local) * 120;

        element.style.opacity = visibility.toFixed(4);
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${(direction * (8 - local * 17)).toFixed(2)}deg)`;
      });

      if (visible && renderedProgress.current !== targetProgress.current) scheduleRender();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) {
        updateTarget();
        scheduleRender();
      }
    }, { rootMargin: "20% 0px" });

    observer.observe(section);
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, []);

  return (
    <section className="scroll-parallax" id="clarity" ref={sectionRef}>
      <div className="scroll-sticky">
        <div className="scroll-wash" aria-hidden="true" />

        <svg className="scroll-tunnel" viewBox="0 0 1000 1000" aria-hidden="true">
          <defs>
            <linearGradient id="scroll-band-green" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#275e49" />
              <stop offset="0.48" stopColor="#164536" />
              <stop offset="1" stopColor="#0c3027" />
            </linearGradient>
            <linearGradient id="scroll-band-parchment" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f1eedc" />
              <stop offset="0.52" stopColor="#dedfca" />
              <stop offset="1" stopColor="#bfcbb9" />
            </linearGradient>
            <linearGradient id="scroll-band-lime" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#dcf88f" />
              <stop offset="0.5" stopColor="#c9f36a" />
              <stop offset="1" stopColor="#91bc4e" />
            </linearGradient>
          </defs>
          {rings.map((ring, index) => (
            <path
              className={`scroll-ring scroll-ring-${ring.tone}`}
              d={ring.path}
              fill="none"
              key={index}
              ref={(element) => { ringRefs.current[index] = element; }}
              stroke={`url(#scroll-band-${ring.tone})`}
              style={{
                "--ring-rotation": `${ring.rotation}deg`,
                "--ring-index": index,
              } as CSSProperties}
            />
          ))}
        </svg>

        <div className="scroll-intro">
          <p className="section-label">CLARITY, WITH DEPTH</p>
          <h2>Your money has <em className="editorial-word">layers.</em><br />Your next step doesn’t have to.</h2>
          <p>Scroll to move through the noise.</p>
          <span className="scroll-cue" aria-hidden="true"><i /></span>
        </div>

        {milestones.map((milestone, index) => (
          <div
            className={`scroll-float ${milestone.className}`}
            ref={(element) => { floatRefs.current[index] = element; }}
            data-start={milestone.start}
            data-direction={index % 2 === 0 ? 1 : -1}
            key={milestone.label}
            aria-hidden="true"
          >
            <span>{milestone.icon}</span>
            <small>{milestone.label}</small>
            <strong>{milestone.value}</strong>
          </div>
        ))}

        <div className="scroll-final">
          <p className="section-label">WHAT REMAINS</p>
          <h2>One <em className="editorial-word">clear</em> move.</h2>
          <p>Visible, explainable, and yours to choose.</p>
        </div>

        <div className="scroll-progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
