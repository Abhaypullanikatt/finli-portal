"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      overscroll: true,
      autoResize: true,
      respectReducedMotion: true,
      prevent: (node) =>
        Boolean(
          node.closest(
            "[data-lenis-prevent], dialog, [role='dialog'], textarea, select, [contenteditable='true']",
          ),
        ),
    });

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const source = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href^='#']")
        : null;
      const hash = source?.hash;
      if (!hash) return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -12,
        lerp: 0.085,
        immediate: lenis.prefersReducedMotion,
        onComplete: () => {
          if (window.location.hash !== hash) window.history.pushState(null, "", hash);
        },
      });
    };

    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      lenis.destroy();
    };
  }, []);

  return null;
}
