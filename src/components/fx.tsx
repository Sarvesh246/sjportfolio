"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades/slides children in when they near the viewport. Content stays visible without JS or when already on screen. */
export const Reveal = ({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    setHidden(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHidden(false);
        io.disconnect();
      },
      { rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(36px)" : "none",
        transition: `opacity .9s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 1.1s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/** Counts from 0 up to `to` over 1.6s (ease-out-quart). Renders the final number on the server. */
export const CountUp = ({ to }: { to: number }) => {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!to || prefersReducedMotion()) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1600);
      setValue(Math.round(to * (1 - Math.pow(1 - k, 4))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);

  return <>{value.toLocaleString("en-US")}</>;
};

const GLYPHS = "!<>-_/[]{}=+*^?#01ABCDEFxz";

const scrambleFrame = (final: string, f: number) =>
  [...final].map((c, i) => (c === " " ? " " : f >= i * 0.7 + 8 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");

/** Text that resolves out of glyph noise, on mount (after `delay`) and/or when `hover` is true and the pointer enters `trigger`. */
export const Scramble = ({ text, delay, hover, trigger }: { text: string; delay?: number; hover?: boolean; trigger?: React.RefObject<HTMLElement | null> }) => {
  // null = at rest (show the real text); a string = mid-scramble frame.
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    let timer = 0;
    let busy = false;
    const play = () => {
      if (busy) return;
      busy = true;
      let f = 0;
      const tick = () => {
        if (f < text.length * 0.7 + 9) {
          setFrame(scrambleFrame(text, f++));
          raf = requestAnimationFrame(tick);
        } else {
          setFrame(null);
          busy = false;
        }
      };
      tick();
    };
    if (delay !== undefined) timer = window.setTimeout(play, delay);
    const el = hover ? trigger?.current : null;
    el?.addEventListener("pointerenter", play);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      el?.removeEventListener("pointerenter", play);
      setFrame(null);
    };
  }, [text, delay, hover, trigger]);

  return <span aria-label={text}><span aria-hidden="true">{frame ?? text}</span></span>;
};
