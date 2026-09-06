"use client";

import { useEffect, useRef } from "react";

const words = ["Built", "to", "help", "with", "real", "money,", "carefully."];

export function ScrollWordReveal() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(".privacy-word"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const render = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(window.innerHeight * 0.6, rect.height + 220);
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.82 - rect.top) / travel));

      items.forEach((item, index) => {
        const stagger = index * 0.09;
        const local = reduced ? 1 : Math.max(0, Math.min(1, (progress - stagger) / 0.42));
        item.style.opacity = (0.16 + local * 0.84).toFixed(3);
        item.style.transform = `translate3d(0, ${((1 - local) * 24).toFixed(2)}px, 0) scale(${(0.96 + local * 0.04).toFixed(3)})`;
        item.style.filter = `blur(${((1 - local) * 4).toFixed(2)}px)`;
      });
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={rootRef} className="privacy-word-reveal" aria-hidden="true">
      {words.map((word, index) => (
        <span
          className={`privacy-word${index === words.length - 1 ? " editorial-word" : ""}`}
          key={word}
        >
          {word}{index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
