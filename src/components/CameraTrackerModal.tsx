import React, { useEffect, useRef, useState } from 'react';
import { MobilityRoutine, FormFeedback, RoutineLog } from '../types';
import { VisionTracker } from '../services/visionTracker';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import confetti from 'canvas-confetti';
import {
  X,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

interface CameraTrackerModalProps {
  routine: MobilityRoutine;
  isWithin9to5: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onClose: () => void;
  onComplete: (log: RoutineLog) => void;
}

export const CameraTrackerModal: React.FC<CameraTrackerModalProps> = ({
  routine,
  isWithin9to5,
  soundEnabled,
  voiceEnabled,
  onClose,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<VisionTracker | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number | null>(3);
  const [repCount, setRepCount] = useState(0);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [feedback, setFeedback] = useState<FormFeedback>({
    status: 'waiting',
    message: 'Position yourself so full body is visible',
    depthScore: 0,
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const { playRepDing, playCountdown, playCheer, playWarning } = useAudioFeedback(
    soundEnabled,
    voiceEnabled
  );

  // Initialize Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setStreamActive(true);
          };
        }
      } catch (err: unknown) {
        console.error('Camera access error:', err);
        const errMsg = err instanceof Error ? err.message : 'Camera access was denied or unavailable.';
        setCameraError(errMsg);
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Start Tracker after Countdown
  useEffect(() => {
    if (!streamActive || isCompleted) return;

    if (countdown !== null && countdown > 0) {
      playCountdown(countdown);
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === null && !trackerRef.current) {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;

        const tracker = new VisionTracker(routine.id, routine.targetCount, {
          onRepCount: (count) => {
            setRepCount(count);
            playRepDing(count);
            if (count >= routine.targetCount) {
              handleRoutineFinished();
            }
          },
          onHoldProgress: (elapsedSec, targetSec) => {
            setHoldSeconds(elapsedSec);
            if (elapsedSec % 5 === 0 && elapsedSec > 0 && elapsedSec < targetSec) {
              playRepDing(elapsedSec);
            }
            if (elapsedSec >= targetSec) {
              setRepCount(targetSec);
              handleRoutineFinished();
            }
          },
          onFeedback: (fb) => {
            setFeedback(fb);
            if (fb.status === 'warning') {
              playWarning();
            }
          },
        });

        tracker.start(videoRef.current, canvasRef.current);
        trackerRef.current = tracker;
      }
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, [streamActive, countdown, isCompleted, routine, playCountdown, playRepDing, playWarning]);

  const handleRoutineFinished = () => {
    setIsCompleted(true);
    if (trackerRef.current) {
      trackerRef.current.stop();
    }
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

  const handleManualIncrement = () => {
    if (routine.unit === 'seconds') {
      const next = Math.min(routine.targetCount, holdSeconds + 5);
      setHoldSeconds(next);
      playRepDing(next);
      if (next >= routine.targetCount) {
        setRepCount(routine.targetCount);
        handleRoutineFinished();
      }
    } else {
      const next = repCount + 1;
      setRepCount(next);
      playRepDing(next);
      if (next >= routine.targetCount) {
        handleRoutineFinished();
      }
    }
  };

  const handleSaveAndExit = () => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const log: RoutineLog = {
      id: `log_${Date.now()}`,
      routineId: routine.id,
      routineTitle: routine.title,
      completedAt: new Date().toISOString(),
      isWithin9to5,
      score: 150,
      formScore: 96,
      durationSeconds,
    };
    onComplete(log);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setCountdown(3);
    if (trackerRef.current) {
      trackerRef.current.stop();
      trackerRef.current = null;
    }
  };

  const displayCurrent = routine.unit === 'seconds' ? holdSeconds : repCount;
  const progressPercent = Math.min(100, Math.round((displayCurrent / routine.targetCount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 sm:p-4 overflow-hidden select-none">
      <div className="relative w-full h-full sm:max-w-4xl sm:h-[90vh] bg-slate-950 sm:rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between shadow-2xl">
        <video
          ref={videoRef}
          playsInline
          muted
          className="hidden"
        />

        {/* Top Control Bar */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-sm">
              {routine.title}
            </h3>
            <span className="text-xs text-slate-400">· Computer Vision</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCameraFacing}
              title="Flip Camera"
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Close Workout"
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport with Canvas Overlay */}
        <div className="relative flex-1 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="max-w-md p-6 text-center text-slate-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Camera Access Needed</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Allow camera access in your browser to enable automatic rep detection.
              </p>
              <button
                type="button"
                onClick={handleManualIncrement}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Count +1 Rep Manually ({displayCurrent}/{routine.targetCount})
              </button>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />

              {/* Countdown Splash */}
              {countdown !== null && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75">
                  <div className="text-7xl font-extrabold text-white font-mono tabular-nums">
                    {countdown}
                  </div>
                  <p className="mt-3 text-xs text-slate-300 uppercase tracking-wider font-semibold">
                    Position yourself in frame
                  </p>
                </div>
              )}

              {/* Form Feedback Indicator */}
              <div className="absolute top-16 inset-x-4 z-20 flex justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
                  {feedback.status === 'good' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{feedback.message}</span>
                  {feedback.angle && (
                    <span className="font-mono text-slate-400 text-[11px]">
                      {feedback.angle}°
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom HUD Bar */}
        <div className="relative z-30 p-4 sm:p-5 bg-slate-950 border-t border-slate-800">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium">
                {routine.unit === 'seconds' ? 'Hold Time' : 'Reps Completed'}
              </div>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-0.5">
                {displayCurrent} <span className="text-sm text-slate-400 font-normal">/ {routine.targetCount} {routine.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualIncrement}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                title="Manually log rep"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>+1 Rep</span>
              </button>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        {isCompleted && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <Award className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                {routine.title} Completed
              </h3>

              <p className="mt-1.5 text-xs text-slate-400">
                Logged to your workday challenge schedule.
              </p>

              <button
                type="button"
                onClick={handleSaveAndExit}
                className="mt-5 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Save & Return to Tracker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
