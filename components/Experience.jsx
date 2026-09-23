"use client";

import { useEffect, useRef } from "react";

// Defer the 3D scene until the page has painted and the main thread is idle,
// so three.js never competes with LCP or the first interaction.
// Also wait until a robot anchor is meaningfully on screen: on phones the hero
// robot starts mostly below the fold, so three.js is only paid for once the
// visitor scrolls toward it (desktop/tablet see it immediately, nothing changes).
const VISIBLE_RATIO = 0.35;

function whenIdle(callback) {
  let idleId;
  let timeoutId;
  let observer;
  let cancelled = false;

  const runWhenIdle = () => {
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(callback, { timeout: 3000 });
    else timeoutId = window.setTimeout(callback, 200);
  };
  const waitForAnchor = () => {
    const anchors = document.querySelectorAll("[data-robot-anchor]");
    if (!anchors.length || !("IntersectionObserver" in window)) {
      runWhenIdle();
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.intersectionRatio >= VISIBLE_RATIO)) return;
        observer.disconnect();
        runWhenIdle();
      },
      { threshold: [VISIBLE_RATIO] },
    );
    anchors.forEach((anchor) => observer.observe(anchor));
  };
  const schedule = async () => {
    // Let the web fonts swap in first: the hero heading re-painting in its
    // final font is the LCP, and a long three.js task would push it back.
    await document.fonts?.ready;
    if (!cancelled) waitForAnchor();
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    observer?.disconnect();
    if (idleId) window.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

// Probe for hardware-accelerated WebGL before downloading three.js. Machines
// that would only get software rendering show the static poster instead.
function hasFastWebGL() {
  try {
    const probe = document.createElement("canvas");
    const options = { failIfMajorPerformanceCaveat: true };
    const gl = probe.getContext("webgl2", options) || probe.getContext("webgl", options);
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function Experience() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;

    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelectorAll(".nav-links a, .header-actions a");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const toggleNavigation = () => {
      const expanded = navToggle?.getAttribute("aria-expanded") === "true";
      navToggle?.setAttribute("aria-expanded", String(!expanded));
      document.body.classList.toggle("nav-open", !expanded);
    };
    const closeNavigation = () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        closeNavigation();
        navToggle?.focus();
      }
    };

    // Newsletter form has no backend yet: keep the email out of the URL and
    // confirm in place instead of reloading the page.
    const subscribeForm = document.querySelector(".subscribe");
    const subscribeStatus = document.querySelector(".subscribe-status");
    const handleSubscribe = (event) => {
      event.preventDefault();
      if (subscribeStatus) subscribeStatus.textContent = "Thanks for subscribing!";
      subscribeForm.reset();
    };

    navToggle?.addEventListener("click", toggleNavigation);
    navLinks.forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", handleKeyDown);
    subscribeForm?.addEventListener("submit", handleSubscribe);

    let cancelled = false;
    let disposeScene;
    const cancelIdle = whenIdle(async () => {
      if (!hasFastWebGL()) {
        document.body.dataset.robot = "fallback";
        return;
      }
      try {
        const { initRobotScene } = await import("../lib/robotScene");
        if (cancelled) return;
        disposeScene = initRobotScene({ stage, canvas, prefersReducedMotion });
      } catch {
        if (!cancelled) document.body.dataset.robot = "error";
      }
    });

    return () => {
      cancelled = true;
      cancelIdle();
      disposeScene?.();
      navToggle?.removeEventListener("click", toggleNavigation);
      navLinks.forEach((link) => link.removeEventListener("click", closeNavigation));
      document.removeEventListener("keydown", handleKeyDown);
      subscribeForm?.removeEventListener("submit", handleSubscribe);
      document.body.classList.remove("nav-open");
    };
  }, []);

  return (
    <div ref={stageRef} className="robot-stage" aria-hidden="true">
      <canvas ref={canvasRef} id="robot-canvas" />
    </div>
  );
}
