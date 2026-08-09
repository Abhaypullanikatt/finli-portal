"use client";

import { useEffect, useRef, useState } from "react";

const scenes = [
  { label: "Confirm", eyebrow: "01 · REVIEW FIRST", title: "Nothing counts until you say so." },
  { label: "Explain", eyebrow: "02 · PLAIN REASONS", title: "See why every next step appeared." },
  { label: "History", eyebrow: "03 · VISIBLE TRAIL", title: "Every important action, remembered." },
];

export function PrivacyShowcase() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(Boolean(entry?.isIntersecting));
    }, { threshold: 0.25 });

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % scenes.length), 4800);
    return () => window.clearTimeout(timer);
  }, [active, visible]);

  return (
    <div className={`privacy-showcase privacy-scene-${active}`} ref={rootRef}>
      <div className="privacy-stage" aria-live="polite">
        <div className="privacy-scene privacy-confirm" aria-hidden={active !== 0}>
          <div className="confirm-radar"><i /><i /><i /></div>
          <div className="confirm-card">
            <span className="confirm-icon">₹</span>
            <div><small>Expense proposal</small><strong>₹1,200 · Electricity</strong></div>
            <span className="confirm-status">Waiting for you</span>
            <div className="confirm-actions"><span>Review</span><b>Confirm ✓</b></div>
          </div>
          <div className="scene-chip chip-review">You see it first</div>
          <div className="scene-chip chip-saved">Saved only after approval</div>
        </div>

        <div className="privacy-scene privacy-explain" aria-hidden={active !== 1}>
          <svg className="reason-path" viewBox="0 0 460 320" aria-hidden="true"><path d="M55 245 C150 245 122 82 238 82 S320 230 408 150" /></svg>
          <span className="reason-node node-one">1.4×<small>month buffer</small></span>
          <span className="reason-node node-two">₹<small>your priority</small></span>
          <span className="reason-node node-three">✓<small>clear next step</small></span>
          <div className="reason-card"><small>WHY THIS APPEARED</small><strong>Build your safety buffer first.</strong><p>It protects your goals before you take on more risk.</p></div>
        </div>

        <div className="privacy-scene privacy-history" aria-hidden={active !== 2}>
          <div className="history-window">
            <div className="history-head"><span>Consent history</span><small>All activity</small></div>
            <div className="history-row"><i>✓</i><p><strong>Expense confirmed</strong><small>Electricity · ₹1,200</small></p><time>09:41</time></div>
            <div className="history-row"><i>↗</i><p><strong>Learning path opened</strong><small>Building a safety buffer</small></p><time>Yesterday</time></div>
            <div className="history-row"><i>✓</i><p><strong>Data permission reviewed</strong><small>No changes made</small></p><time>02 Aug</time></div>
          </div>
          <span className="history-stamp"><b>100%</b> visible</span>
        </div>

      </div>

      <div className="privacy-scene-copy" key={active}>
        <span>{scenes[active]!.eyebrow}</span>
        <strong>{scenes[active]!.title}</strong>
      </div>

      <div className="privacy-tabs" role="tablist" aria-label="Privacy principles">
        {scenes.map((scene, index) => (
          <button
            aria-selected={active === index}
            className={active === index ? "is-active" : ""}
            key={scene.label}
            onClick={() => setActive(index)}
            role="tab"
            type="button"
          >
            <span>{scene.label}</span><i key={active === index ? `active-${active}` : `idle-${index}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
