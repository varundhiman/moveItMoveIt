import { useCallback, useRef } from 'react';

export function useAudioFeedback(enabled: boolean = true, voiceEnabled: boolean = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback((freq = 440, type: OscillatorType = 'sine', duration = 0.1, gainVal = 0.15) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback blocked or uninitialized
    }
  }, [enabled, getAudioContext]);

  const playRepDing = useCallback((repNumber?: number) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      // Dual resonant bell tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      const baseFreq = 587.33; // D5
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

      // Voice prompt rep count
      if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window && repNumber) {
        const utter = new SpeechSynthesisUtterance(repNumber.toString());
        utter.rate = 1.3;
        utter.pitch = 1.1;
        window.speechSynthesis.speak(utter);
      }
    } catch {
      // ignore audio errors
    }
  }, [enabled, voiceEnabled, getAudioContext]);

  const playCountdown = useCallback((count: number) => {
    if (!enabled) return;
    const freq = count === 1 ? 880 : 520;
    playBeep(freq, 'sine', 0.15, 0.2);
    if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(count.toString());
      utter.rate = 1.2;
      window.speechSynthesis.speak(utter);
    }
  }, [enabled, voiceEnabled, playBeep]);

  const playWarning = useCallback(() => {
    if (!enabled) return;
    playBeep(240, 'sawtooth', 0.15, 0.1);
  }, [enabled, playBeep]);

  const playCheer = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Arpeggiated victory chord
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playBeep(freq, 'triangle', 0.28, 0.2);
        }, idx * 70);
      });
      if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setTimeout(() => {
          const utter = new SpeechSynthesisUtterance('Awesome job! Mobility routine complete!');
          utter.rate = 1.1;
          window.speechSynthesis.speak(utter);
        }, 350);
      }
    } catch {
      // ignore
    }
  }, [enabled, voiceEnabled, getAudioContext, playBeep]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.1;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore
    }
  }, [voiceEnabled]);

  return {
    playBeep,
    playRepDing,
    playCountdown,
    playWarning,
    playCheer,
    speak,
  };
}
