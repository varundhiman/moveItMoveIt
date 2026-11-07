import React, { useEffect, useState } from 'react';
import { MobilityRoutine, RoutineLog } from '../types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  Footprints,
  Play,
  Pause,
  Award,
} from 'lucide-react';

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
  const targetSeconds = routine.targetCount; // 300 seconds (5 min)
  const [secondsRemaining, setSecondsRemaining] = useState(targetSeconds);
  const [isActive, setIsActive] = useState(true);
  const [stepEstimate, setStepEstimate] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const { playRepDing, playCheer } = useAudioFeedback(soundEnabled, voiceEnabled);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0 && !isCompleted) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          if ((targetSeconds - prev) % 2 === 0) {
            setStepEstimate((s) => s + 3);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, isCompleted]);

  const handleComplete = () => {
    setIsCompleted(true);
    setIsActive(false);
    playCheer();
    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#FBBF24', '#34D399'],
      });
    } catch {
      // ignore
    }
  };

  const handleSaveAndExit = () => {
    const elapsed = targetSeconds - secondsRemaining;
    const durationSeconds = Math.max(elapsed, Math.round((Date.now() - startTime) / 1000));
    const log: RoutineLog = {
      id: `log_${Date.now()}`,
      routineId: routine.id,
      routineTitle: routine.title,
      completedAt: new Date().toISOString(),
      isWithin9to5,
      score: 150,
      formScore: 100,
      durationSeconds,
    };
    onComplete(log);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white mb-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-black tracking-tight text-white font-sans leading-none">
              5 Min Walk
            </h2>
            <p className="text-[11px] font-medium text-neutral-400 mt-1">
              Hourly Step Break · 9–5 Slot
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Footprints className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Timer Card */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-3xl p-6 text-center space-y-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Time Remaining
          </span>
          <div className="text-6xl font-black font-mono tracking-tight text-white tabular-nums">
            {timeFormatted}
          </div>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="inline-block bg-neutral-800 text-sky-400 text-xs font-semibold px-3 py-1 rounded-full font-mono">
              ~{stepEstimate} Steps Estimated
            </span>
          </div>
        </div>

        {/* Guidance card */}
        <div className="bg-neutral-950/50 border border-neutral-800/80 rounded-2xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Walk Guidance
          </h4>
          <p className="text-xs font-medium text-neutral-300 mt-1 leading-relaxed">
            Step away from your workstation. Walk around your home or office floor, stretch your calves, and rest your eyes from screen glare.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase modern-press transition flex items-center justify-center gap-2"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase modern-press transition"
          >
            Finish Early
          </button>
        </div>

        {/* Completion Modal */}
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center mb-4">
                <Award className="w-8 h-8 stroke-[2.2]" />
              </div>

              <h3 className="text-2xl font-black text-white font-sans">
                Walk Completed!
              </h3>

              <p className="mt-1 text-xs text-neutral-400">
                Logged to your 9–5 workday mobility schedule.
              </p>

              <button
                type="button"
                onClick={handleSaveAndExit}
                className="mt-6 w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm tracking-wide modern-press transition"
              >
                Log to My Radar & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
