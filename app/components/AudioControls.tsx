"use client";

import { useEffect, useRef, useState } from "react";

const tracks = [
  "https://files.catbox.moe/4e75y2.mp3",
  "https://files.catbox.moe/gyhnmf.mp3",
  "https://files.catbox.moe/i0zvrf.mp3",
];

export function AudioControls() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const playTrack = async (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setTrack(index);
    audio.src = tracks[index];
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const next = () => {
    let candidate = Math.floor(Math.random() * tracks.length);
    if (tracks.length > 1 && candidate === track) candidate = (candidate + 1) % tracks.length;
    void playTrack(candidate);
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src) {
      await playTrack(Math.floor(Math.random() * tracks.length));
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  useEffect(() => {
    const enter = () => {
      if (!audioRef.current?.src) void playTrack(Math.floor(Math.random() * tracks.length));
    };
    window.addEventListener("justwats:enter", enter);
    return () => window.removeEventListener("justwats:enter", enter);
  });

  return (
    <div className="audio-control">
      <audio ref={audioRef} onEnded={next} preload="none" />
      <button
        type="button"
        className="audio-primary"
        onClick={() => void toggle()}
        aria-label={playing ? "Pause ambient audio" : "Play ambient audio"}
      >
        {playing ? "Pause music" : "Play music"}
      </button>
      <button
        type="button"
        className="audio-disclosure"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label="Audio settings"
      >
        +
      </button>
      {expanded && (
        <div className="audio-panel">
          <button type="button" onClick={next}>Shuffle</button>
          <label>
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="0.45"
              onChange={(event) => {
                if (audioRef.current) audioRef.current.volume = Number(event.target.value);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
