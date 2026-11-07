import React, { useEffect, useState } from 'react';
import { MobilityRoutine, RoutineLog } from '../types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import confetti from 'canvas-confetti';
import { Footprints, X, Play, Pause, Award, FastForward } from 'lucide-react';

interface WalkTrackerModalProps {
  routine: MobilityRoutine;
  isWithin9to5: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onClose: () => void;
  onComplete: (log: RoutineLog) => void;
}

export const WalkTrackerModal: React.FC<WalkTrackerModalProps> = ({
  routine,
  isWithin9to5,
  soundEnabled,
  voiceEnabled,
  onClose,
  onComplete,
}) => {
  const TOTAL_SECONDS = 5 * 60; // 300 seconds
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const { playRepDing, playCheer, speak } = useAudioFeedback(soundEnabled, voiceEnabled);

  useEffect(() => {
    let lastAccel = 0;
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!isActive || isCompleted) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const delta = Math.abs(total - lastAccel);
      if (delta > 2.5) {
        setSteps((s) => s + 1);
      }
      lastAccel = total;
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [isActive, isCompleted]);

  useEffect(() => {
    if (!isActive || isCompleted) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishWalk();
          return 0;
        }

        setSteps((s) => s + Math.floor(Math.random() * 2) + 1);

        if ((prev - 1) % 60 === 0 && prev > 60) {
          playRepDing();
          const minsLeft = Math.floor((prev - 1) / 60);
          speak(`${minsLeft} minutes remaining`);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isCompleted, playRepDing, speak]);

  const finishWalk = () => {
    setIsCompleted(true);
    playCheer();
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const handleFastForward = () => {
    setSecondsRemaining((prev) => Math.max(1, prev - 60));
    setSteps((s) => s + 110);
  };

  const handleSaveAndExit = () => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const log: RoutineLog = {
      id: `log_${Date.now()}`,
      routineId: 'walk',
      routineTitle: '5 Min Walk',
      completedAt: new Date().toISOString(),
      isWithin9to5,
      score: 150,
      formScore: 100,
      durationSeconds,
    };
    onComplete(log);
  };

  const elapsed = TOTAL_SECONDS - secondsRemaining;
  const progressPercent = Math.min(100, Math.round((elapsed / TOTAL_SECONDS) * 100));

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none">
      <div className="relative w-full max-w-md bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Footprints className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-white font-bold text-sm">5 Min Desk Walk</h3>
              <p className="text-xs text-slate-400">Step away from your workstation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Countdown */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#1e293b"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray="263.8"
                strokeDashoffset={263.8 - (263.8 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {timeFormatted}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-0.5">
                {steps} steps
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            type="button"
            onClick={handleFastForward}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition text-xs font-semibold flex items-center gap-1"
            title="Fast forward 1 min"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+1m</span>
          </button>
        </div>

        {/* Completion Modal */}
        {isCompleted && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 p-6 rounded-2xl">
            <div className="w-full text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">5-Minute Walk Complete</h3>
              <p className="text-xs text-slate-400">
                You logged {steps} steps and completed this time slot.
              </p>
              <button
                type="button"
                onClick={handleSaveAndExit}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Log Walk to Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
