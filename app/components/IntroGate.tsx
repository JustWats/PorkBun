"use client";

import { useEffect, useRef, useState } from "react";

export function IntroGate() {
  const [open, setOpen] = useState(true);
  const [offset, setOffset] = useState(0);
  const startRef = useRef<number | null>(null);

  const enter = () => {
    setOpen(false);
    window.dispatchEvent(new Event("justwats:enter"));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    startRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (startRef.current === null) return;
    setOffset(Math.max(0, startRef.current - event.clientY));
  };

  const onPointerUp = () => {
    if (offset > 90) enter();
    else setOffset(0);
    startRef.current = null;
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="intro-gate"
      role="dialog"
      aria-modal="true"
      aria-label="Enter Payload"
      style={{ transform: `translateY(-${offset}px)`, opacity: 1 - offset / 500 }}
    >
      <button className="intro-center" type="button" onClick={enter}>
        <img
          src="https://raw.githubusercontent.com/JustWats/PorkBun/main/images/raven-logo.png"
          alt=""
        />
        <span>Resources for cybersecurity</span>
      </button>
      <button
        className="unlock"
        type="button"
        onClick={enter}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <i aria-hidden="true" />
        <span>Drag up to unlock</span>
      </button>
    </div>
  );
}
