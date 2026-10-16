"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const opusSource = "/Audio/intro-optimized.ogg";
const mp3Source = "/Audio/intro-compat.mp3";

export function IntroAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const active = useRef(false);
  const fallback = useRef(false);
  const [needsPlayback, setNeedsPlayback] = useState(true);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const play = useCallback((useFallback = false) => {
    const audio = audioRef.current;
    if (!audio || !active.current) return;
    if (useFallback || !audio.getAttribute("src")) {
      fallback.current = useFallback || !audio.canPlayType('audio/ogg; codecs="opus"');
      audio.src = fallback.current ? mp3Source : opusSource;
    }
    audio.volume = 0.18;
    setUnavailable(false);
    setLoading(true);
    void audio.play().catch(() => {
      if (!active.current) return;
      setLoading(false);
      setNeedsPlayback(true);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    active.current = true;
    audio.muted = false;
    let idle: number | undefined;
    let timer: number | undefined;
    function stopListening() {
      document.removeEventListener("pointerdown", retryPlayback);
      document.removeEventListener("keydown", retryPlayback);
    }
    function retryPlayback(event: Event) {
      if (event.target instanceof Element && event.target.closest(".intro-audio-toggle")) return;
      if (event instanceof KeyboardEvent && ["Tab", "Shift", "Control", "Alt", "Meta", "Escape"].includes(event.key)) return;
      if (!audio || audio.muted || !audio.paused || audio.ended) return;
      play();
    }
    function startWhenIdle() {
      const start = () => { if (audio && audio.paused && !audio.muted && !audio.ended) play(); };
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start, { timeout: 2000 });
      else timer = window.setTimeout(start, 750);
    }
    // Keep audio bytes out of initial rendering, while preserving the automatic-start attempt.
    if (document.readyState === "complete") startWhenIdle();
    else window.addEventListener("load", startWhenIdle, { once: true });
    document.addEventListener("pointerdown", retryPlayback, { passive: true });
    document.addEventListener("keydown", retryPlayback);
    audio.addEventListener("playing", stopListening);
    return () => {
      active.current = false;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener("load", startWhenIdle);
      stopListening();
      audio.removeEventListener("playing", stopListening);
      audio.pause();
    };
  }, [play]);

  function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;
    if (unavailable) {
      audio.removeAttribute("src");
      fallback.current = false;
      audio.muted = false;
      setMuted(false);
      play();
      return;
    }
    const nextMuted = audio.muted ? false : needsPlayback ? false : true;
    audio.muted = nextMuted;
    setMuted(nextMuted);
    if (nextMuted) {
      audio.pause();
      setLoading(false);
    } else if (audio.paused) {
      play();
    }
  }

  const label = unavailable ? "Retry intro audio" : muted ? "Unmute intro audio" : loading ? "Loading intro audio" : needsPlayback ? "Play intro audio" : "Mute intro audio";

  return <>
    <audio ref={audioRef} preload="none" aria-hidden="true" tabIndex={-1}
      onPlaying={() => { setNeedsPlayback(false); setLoading(false); setUnavailable(false); }}
      onWaiting={() => { if (audioRef.current && !audioRef.current.paused) setLoading(true); }}
      onPause={() => { setNeedsPlayback(true); setLoading(false); }}
      onEnded={() => { setNeedsPlayback(true); setLoading(false); }}
      onError={() => {
        if (!fallback.current) { play(true); return; }
        setLoading(false); setNeedsPlayback(true); setUnavailable(true);
      }}/>
    <button className="icon-button intro-audio-toggle" type="button" aria-label={label} title={label} aria-pressed={muted} aria-busy={loading} onClick={toggleSound}>
      {muted || needsPlayback || unavailable ? <VolumeX size={20} aria-hidden="true"/> : <Volume2 size={20} aria-hidden="true"/>}
    </button>
  </>;
}
