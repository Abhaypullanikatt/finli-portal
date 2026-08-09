"use client";

import { useEffect, useRef } from "react";

const cards = [
  { className: "vision-card-understand", eyebrow: "Start with", icon: "01", title: "Understand", body: "See the why before you act." },
  { className: "vision-card-safety", eyebrow: "Build first", icon: "02", title: "Safety", body: "Create breathing room before pressure." },
  { className: "vision-card-focus", eyebrow: "At a time", icon: "→", title: "One clear move", body: "Not ten competing alerts." },
  { className: "vision-card-growth", eyebrow: "Explore at", icon: "03", title: "Your pace", body: "Grow when you feel ready." },
  { className: "vision-card-trust", eyebrow: "Always", icon: "✓", title: "No product pushing", body: "Context stays ahead of commission." },
];

export function VisionSplit() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stage = section.querySelector<HTMLElement>(".vision-stage");
    const center = section.querySelector<HTMLElement>(".vision-center");
    const items = Array.from(section.querySelectorAll<HTMLElement>(".vision-card"));
    if (!stage || !center || !items.length) return;

    let frame = 0;
    const rotations = [-7, 6, 5, -5, 2];

    const update = () => {
      frame = 0;
      if (window.innerWidth <= 620 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        items.forEach((item) => {
          item.style.transform = "none";
          item.style.opacity = "1";
          item.style.filter = "none";
        });
        center.style.opacity = "1";
        center.style.transform = "none";
        return;
      }

      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const raw = Math.min(1, Math.max(0, (14 - rect.top) / travel));
      const reveal = Math.min(1, Math.max(0, raw / .18));
      const splitInput = Math.min(1, Math.max(0, (raw - .12) / .88));
      const split = 1 - Math.pow(1 - splitInput, 3);
      const stageCenterX = stage.clientWidth / 2;
      const stageCenterY = stage.clientHeight / 2;

      items.forEach((item, index) => {
        const itemCenterX = item.offsetLeft + item.offsetWidth / 2;
        const itemCenterY = item.offsetTop + item.offsetHeight / 2;
        const gatheredX = stageCenterX - itemCenterX;
        const gatheredY = stageCenterY - itemCenterY;
        const remaining = 1 - split;
        const scale = .66 + split * .34;
        const rotation = (rotations[index] ?? 0) * remaining;

        item.style.transform = `translate3d(${gatheredX * remaining}px, ${gatheredY * remaining}px, 0) scale(${scale}) rotate(${rotation}deg)`;
        item.style.opacity = String(reveal * (.58 + split * .42));
        item.style.filter = `blur(${remaining * 1.8}px) saturate(${.72 + split * .28})`;
      });

      center.style.opacity = "1";
      center.style.transform = "none";
      section.style.setProperty("--vision-progress", String(raw));
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="vision-section" id="vision" ref={sectionRef}>
      <div className="vision-stage">
        <div className="vision-center">
          <p className="section-label">OUR VISION</p>
          <h2>Financial confidence should grow with you.</h2>
          <p>
            We’re building a future where understanding money feels ordinary—not
            intimidating, exclusive, or reserved for people who already know the language.
          </p>
        </div>

        {cards.map((card) => (
          <article className={`vision-card ${card.className}`} key={card.title}>
            <div><span>{card.eyebrow}</span><b>{card.icon}</b></div>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
          </article>
        ))}

        <div className="vision-progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
