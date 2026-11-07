import React, { useEffect, useRef, useState } from 'react';
import { MobilityRoutine, FormFeedback, RoutineLog } from '../types';
import { VisionTracker } from '../services/visionTracker';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X,
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
    message: 'Position yourself so full body is visible in frame',
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
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#34D399', '#F43F5E', '#38BDF8'],
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
  const routineHeadline = routine.id === 'squats' ? 'SQUAT CHECK!' : `${routine.title.toUpperCase()} CHECK!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between my-auto space-y-4 text-white">
        <video
          ref={videoRef}
          playsInline
          muted
          className="hidden"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-1">
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
              {routineHeadline}
            </h2>
            <p className="text-[11px] font-medium text-neutral-400 mt-1">
              {routine.targetCount} {routine.unit.toUpperCase()} · Hourly 9–5 Slot
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCameraFacing}
              title="Flip Camera"
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 flex items-center justify-center text-neutral-200 transition modern-press"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder Viewport */}
        <div className="relative w-full aspect-[4/3] bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-inner flex items-center justify-center">
          {cameraError ? (
            <div className="p-5 text-center text-white space-y-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 text-amber-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold">Camera Unavailable</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Allow camera permission to enable AI auto-counting, or record reps manually.
              </p>
              <button
                type="button"
                onClick={handleManualIncrement}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase modern-press transition"
              >
                +1 Rep Manually ({displayCurrent}/{routine.targetCount})
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
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
                  <div className="text-7xl font-black text-amber-400 font-mono tabular-nums">
                    {countdown}
                  </div>
                  <p className="mt-2 text-xs font-bold text-white uppercase tracking-wider">
                    Get in position
                  </p>
                </div>
              )}

              {/* Rep Counter Overlay Card */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 rounded-2xl px-6 py-2.5 shadow-xl text-center">
                  <div className="text-4xl font-black font-mono tracking-tight text-amber-400 tabular-nums">
                    {String(displayCurrent).padStart(2, '0')} / {String(routine.targetCount).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                    {routine.unit === 'seconds' ? 'Seconds Held' : 'Reps Counted'}
                  </div>
                </div>

                {/* Live Form Guidance Pill */}
                <div className="mt-3 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-xs font-medium text-white flex items-center gap-1.5 shadow-md">
                  {feedback.status === 'good' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form Guidance Card below viewfinder */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Form Guidance
          </h4>
          <p className="text-xs font-medium text-neutral-300 mt-1 leading-relaxed">
            {routine.instructions?.[0] || 'Stand with feet shoulder-width, keep chest high, squat to 90°. AI computer vision counts each full rep automatically.'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleRoutineFinished}
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm tracking-wide shadow-md shadow-amber-400/10 modern-press transition"
          >
            Finish Routine Early
          </button>

          <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
            <button
              type="button"
              onClick={handleManualIncrement}
              className="hover:text-white font-medium flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tap +1 Manual Rep</span>
            </button>
            <span className="font-mono text-[11px]">
              Goal: {routine.targetCount} {routine.unit}
            </span>
          </div>
        </div>

        {/* Completion Celebration Overlay */}
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
                <Award className="w-8 h-8 stroke-[2.2]" />
              </div>

              <h3 className="text-2xl font-black text-white font-sans">
                Move Complete!
              </h3>

              <p className="mt-1 text-xs text-neutral-400">
                You crushed {routine.title}! Hourly slot successfully recorded.
              </p>

              <button
                type="button"
                onClick={handleSaveAndExit}
                className="mt-6 w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-400/20 modern-press transition"
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
