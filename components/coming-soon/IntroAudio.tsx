"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function IntroAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [needsPlayback, setNeedsPlayback] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let active = true;
    audio.muted = false;
    function stopListening() {
      document.removeEventListener("pointerdown", retryPlayback);
      document.removeEventListener("keydown", retryPlayback);
    }
    function retryPlayback(event: Event) {
      if (event.target instanceof Element && event.target.closest(".intro-audio-toggle")) return;
      if (event instanceof KeyboardEvent && ["Tab", "Shift", "Control", "Alt", "Meta", "Escape"].includes(event.key)) return;
      if (!audio || audio.muted || !audio.paused || audio.ended) return;
      void audio.play().catch(() => { if (active) setNeedsPlayback(true); });
    }
    // Retry blocked audible autoplay on the first interaction, without overriding the mute button.
    document.addEventListener("pointerdown", retryPlayback, { passive: true });
    document.addEventListener("keydown", retryPlayback);
    audio.addEventListener("playing", stopListening);
    void audio.play().catch(() => { if (active) setNeedsPlayback(true); });
    return () => { active = false; stopListening(); audio.removeEventListener("playing", stopListening); audio.pause(); };
  }, []);

  function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = needsPlayback ? false : !audio.muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
    if (audio.paused && !nextMuted) {
      void audio.play().catch(() => setNeedsPlayback(true));
    }
  }

  const label = unavailable ? "Intro audio unavailable" : needsPlayback ? "Play intro audio" : muted ? "Unmute intro audio" : "Mute intro audio";

  return <>
    <audio ref={audioRef} src="/Audio/Intro.mp3" autoPlay preload="auto" onPlay={() => setNeedsPlayback(false)} onPause={() => setNeedsPlayback(true)} onEnded={() => setNeedsPlayback(true)} onError={() => setUnavailable(true)}/>
    <button className="icon-button intro-audio-toggle" type="button" aria-label={label} title={label} aria-pressed={muted} disabled={unavailable} onClick={toggleSound}>
      {muted || needsPlayback || unavailable ? <VolumeX size={20} aria-hidden="true"/> : <Volume2 size={20} aria-hidden="true"/>}
    </button>
  </>;
}
