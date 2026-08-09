"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smootherStep = (value: number) => {
  const progress = clamp(value);
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
};

const phase = (progress: number, start: number, end: number) =>
  smootherStep((progress - start) / (end - start));

export function FinancialStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const targetProgress = useRef(0);
  const renderedProgress = useRef(0);
  const progressVelocity = useRef(0);
  const stepVisibility = useRef<number[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.dataset.reducedMotion = "true";
      return;
    }

    let frame = 0;
    let running = true;
    let previousTime = performance.now();

    const updateTarget = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      targetProgress.current = clamp(-rect.top / travel);
    };

    const render = (time: number) => {
      if (!running) return;

      const delta = Math.min(Math.max((time - previousTime) / 1000, 0), 1 / 30);
      previousTime = time;

      // A critically damped spring keeps the motion continuous across trackpads,
      // mouse wheels and different refresh rates without introducing overshoot.
      const displacement = targetProgress.current - renderedProgress.current;
      progressVelocity.current += displacement * 115 * delta;
      progressVelocity.current *= Math.exp(-22 * delta);
      renderedProgress.current = clamp(
        renderedProgress.current + progressVelocity.current * delta,
      );

      if (Math.abs(displacement) < 0.00005 && Math.abs(progressVelocity.current) < 0.00005) {
        renderedProgress.current = targetProgress.current;
        progressVelocity.current = 0;
      }

      const progress = renderedProgress.current;
      // Match the reference's accordion construction: the anchor cards open
      // first, then every missing row unfolds inside the resulting space at
      // its final position. Nothing travels out from behind another card.
      const anchors = phase(progress, 0.02, 0.62);
      const companionReveal = Math.min(phase(progress, 0.12, 0.38), anchors);
      const pictureReveal = Math.min(phase(progress, 0.2, 0.46), anchors);
      const signalsReveal = Math.min(phase(progress, 0.28, 0.54), anchors);

      section.style.setProperty("--stack-progress", progress.toFixed(4));
      section.style.setProperty("--stack-rotate", `${(-5 + phase(progress, 0.03, 0.8) * 3).toFixed(3)}deg`);
      section.style.setProperty("--goals-y", `${(-120 * anchors).toFixed(2)}px`);
      section.style.setProperty("--confirm-y", `${(232 * anchors).toFixed(2)}px`);
      section.style.setProperty("--companion-y", `${(45.5 * (1 - anchors)).toFixed(2)}px`);
      section.style.setProperty("--picture-y", `${(-74.5 * (1 - anchors)).toFixed(2)}px`);
      section.style.setProperty("--signals-y", `${(-177.5 * (1 - anchors)).toFixed(2)}px`);
      section.style.setProperty("--companion-opacity", companionReveal.toFixed(4));
      section.style.setProperty("--picture-opacity", pictureReveal.toFixed(4));
      section.style.setProperty("--modules-opacity", signalsReveal.toFixed(4));
      section.style.setProperty("--companion-clip", `${((1 - companionReveal) * 50).toFixed(2)}%`);
      section.style.setProperty("--picture-clip", `${((1 - pictureReveal) * 50).toFixed(2)}%`);
      section.style.setProperty("--signals-clip", `${((1 - signalsReveal) * 50).toFixed(2)}%`);

      section.querySelectorAll<HTMLElement>(".stack-step").forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - window.innerHeight / 2);
        const targetVisibility = clamp(1 - distance / (window.innerHeight * 0.82));
        const previousVisibility = stepVisibility.current[index] ?? targetVisibility;
        const visibility = previousVisibility +
          (targetVisibility - previousVisibility) * (1 - Math.exp(-12 * delta));
        stepVisibility.current[index] = visibility;
        step.style.setProperty("--step-opacity", (0.35 + visibility * 0.65).toFixed(4));
        step.style.setProperty("--step-y", `${((1 - visibility) * 34).toFixed(2)}px`);
      });

      frame = window.requestAnimationFrame(render);
    };

    updateTarget();
    frame = window.requestAnimationFrame(render);
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, []);

  return (
    <section className="stack-section" id="stack" ref={sectionRef}>
      <div className="stack-layout">
        <div className="stack-narrative">
          <article className="stack-step">
            <div className="stack-step-heading"><span>01</span><p>A calmer layer</p></div>
            <div className="stack-story-card">
            <p>THE CALM LAYER</p>
            <h2>Between your money and your next move.</h2>
            <span>Finli turns scattered money signals into context you can understand.</span>
            </div>
          </article>
          <article className="stack-step">
            <div className="stack-step-heading"><span>02</span><p>Context, connected</p></div>
            <div className="stack-story-card">
            <p>THE CONTEXT LAYER</p>
            <h2>Every signal, one understandable picture.</h2>
            <span>Income, spending, your safety fund and goals are considered together—not in isolation.</span>
            </div>
          </article>
          <article className="stack-step">
            <div className="stack-step-heading"><span>03</span><p>Always in your control</p></div>
            <div className="stack-story-card">
            <p>THE CONTROL LAYER</p>
            <h2>You see it. You review it. You decide.</h2>
            <span>The companion explains what it noticed. Important actions always wait for you.</span>
            </div>
          </article>
        </div>

        <div className="stack-visual" aria-label="An exploded diagram showing how Finli organizes financial context">
          <div className="stack-mobile-intro">
            <span>HOW FINLI HELPS</span>
            <strong>Your money, connected clearly.</strong>
            <p>From what matters to you, to a next step you control.</p>
          </div>
          <div className="stack-axis" aria-hidden="true" />
          <div className="stack-assembly">
            <div className="stack-plane stack-goals">
              <div><small>01</small><strong>Your goals</strong><span>Priorities, pace and consent.</span></div>
              <b>YOU</b>
            </div>

            <div className="stack-plane stack-companion">
              <div><small>02</small><strong>Finli</strong><span>Connects context and explains the next step.</span></div>
              <div className="stack-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            </div>

            <div className="stack-plane stack-picture">
              <div><small>03</small><strong>Your money picture</strong><span>Income, spending, buffer and goals—together.</span></div>
              <b>LIVE</b>
            </div>

            <div className="stack-plane stack-signals">
              <div className="signal-tile"><b>₹</b><small>Income</small></div>
              <div className="signal-tile"><b>↘</b><small>Spending</small></div>
              <div className="signal-tile"><b>✓</b><small>Safety</small></div>
              <div className="signal-tile"><b>◎</b><small>Goals</small></div>
              <div className="signal-tile"><b>?</b><small>Learn</small></div>
            </div>

            <div className="stack-plane stack-confirm">
              <div><small>04</small><strong>You confirm</strong><span>No important move happens invisibly.</span></div>
              <b>IN CONTROL</b>
            </div>
          </div>
          <div className="stack-caption"><span>SCROLL TO ASSEMBLE</span><i /></div>
        </div>
      </div>
    </section>
  );
}
