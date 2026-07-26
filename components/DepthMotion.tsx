"use client";

import { useEffect } from "react";

/**
 * Pointer-driven depth for the library page.
 *
 * This only ever writes CSS custom properties (--tilt-*, --glare-*) and a
 * transform on the hero's decorative layers. Every resting pose, entrance
 * animation and reduced-motion rule lives in globals.css, so if this never
 * runs the page is simply the flat version it was before.
 */
export function DepthMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];

    // ---- hero: layers parallax, video card tilts toward the pointer ----
    const hero = document.querySelector<HTMLElement>(".hero");
    if (hero) {
      const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]"));
      const card = hero.querySelector<HTMLElement>(".video-card");
      let raf = 0;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      const frame = () => {
        raf = 0;
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        for (const layer of layers) {
          const depth = Number(layer.dataset.depth) || 10;
          layer.style.transform = `translate3d(${-currentX * depth}px, ${
            -currentY * depth
          }px, 0)`;
        }
        if (card) {
          card.style.setProperty("--tilt-y", `${currentX * 10}deg`);
          card.style.setProperty("--tilt-x", `${-currentY * 8}deg`);
        }

        if (Math.abs(targetX - currentX) > 0.0005 || Math.abs(targetY - currentY) > 0.0005) {
          raf = requestAnimationFrame(frame);
        }
      };
      const queue = () => {
        if (!raf) raf = requestAnimationFrame(frame);
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        targetX = x - 0.5;
        targetY = y - 0.5;
        card?.style.setProperty("--glare-x", `${x * 100}%`);
        card?.style.setProperty("--glare-y", `${y * 100}%`);
        queue();
      };
      const onLeave = () => {
        targetX = 0;
        targetY = 0;
        queue();
      };

      hero.addEventListener("pointermove", onMove, { passive: true });
      hero.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
        if (raf) cancelAnimationFrame(raf);
      });
    }

    // ---- resource cards ----
    // Delegated, because the grid re-renders when "Click to see more" is
    // pressed and when the card/list toggle changes.
    let hovered: HTMLElement | null = null;
    const clearHovered = () => {
      hovered?.style.removeProperty("--tilt-x");
      hovered?.style.removeProperty("--tilt-y");
      hovered = null;
    };

    const onDocMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>(".resource-card") ?? null;

      if (hovered && hovered !== card) clearHovered();
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--tilt-y", `${(x - 0.5) * 9}deg`);
      card.style.setProperty("--tilt-x", `${-(y - 0.5) * 9}deg`);
      hovered = card;
    };

    document.addEventListener("pointermove", onDocMove, { passive: true });
    cleanups.push(() => {
      document.removeEventListener("pointermove", onDocMove);
      clearHovered();
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
