import React, { useState } from 'react';
import { RoutineLog, WorkdaySlot } from '../types';
import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';

interface WorkdayRoutineTrackerProps {
  slots: WorkdaySlot[];
  completedSlotsCount: number;
  todayLogs: RoutineLog[];
  inWindow: boolean;
  timeRemainingStr: string;
  dailyTargetSlots?: number;
  challengeName?: string;
  onStartMove: () => void;
}

export const WorkdayRoutineTracker: React.FC<WorkdayRoutineTrackerProps> = ({
  slots,
  completedSlotsCount,
  todayLogs,
  inWindow,
  timeRemainingStr,
  dailyTargetSlots = 5,
  challengeName,
  onStartMove,
}) => {
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState<WorkdaySlot | null>(null);

  const targetSlots = Math.max(1, dailyTargetSlots);
  const isGoalMet = completedSlotsCount >= targetSlots;
  const remainingSlots = Math.max(0, targetSlots - completedSlotsCount);

  const formatLogTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto">
      {/* 1. Header Title */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
            LET'S MOVE!
          </h1>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1.5">
            <span>9 AM – 5 PM</span>
            <span>·</span>
            <span>Hourly Workday Mobility</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="tabular-nums font-mono">{timeRemainingStr}</span>
        </div>
      </div>

      {/* 2. Modern Hero Progress Card */}
      <section className="bg-gradient-to-br from-amber-400 via-amber-400 to-amber-500 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 border border-amber-300 dark:border-amber-500/30 rounded-3xl p-6 shadow-lg shadow-amber-500/10 dark:shadow-xl dark:shadow-black/40 relative overflow-hidden transition-all">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-900/80 dark:text-amber-400/90 mb-2">
          <span>{challengeName || "Workday Mobility"}</span>
          <span>Goal: {targetSlots} Slots/Day</span>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-6xl font-black font-mono tracking-tight text-neutral-950 dark:text-white tabular-nums">
              {completedSlotsCount}/{targetSlots}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold uppercase tracking-tight text-neutral-950 dark:text-white">
              Moves Completed
            </div>
            <div className="text-xs font-semibold text-neutral-900/80 dark:text-neutral-400 mt-0.5">
              {isGoalMet
                ? 'Daily Quota Achieved! 🏆'
                : `${remainingSlots} more to hit daily quota`}
            </div>
          </div>
        </div>

        {/* Dynamic Segmented Modern Bar */}
        <div
          className="mt-5 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${targetSlots}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: targetSlots }).map((_, idx) => {
            const isFilled = idx < completedSlotsCount;
            return (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isFilled
                    ? 'bg-neutral-950 dark:bg-amber-400 shadow-xs'
                    : 'bg-black/15 dark:bg-neutral-800'
                }`}
              />
            );
          })}
        </div>

        {/* Expand / Collapse Explainer */}
        <button
          type="button"
          onClick={() => setShowScheduleDetails(!showScheduleDetails)}
          className="mt-4 w-full flex items-center justify-between text-xs font-semibold text-neutral-950/90 dark:text-neutral-300 pt-3 border-t border-black/10 dark:border-neutral-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-800 dark:text-amber-400" />
            <span>How slots work (e.g. 9:55 & 10:05 = 2 slots)</span>
          </span>
          <span className="flex items-center gap-1 font-bold">
            {showScheduleDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showScheduleDetails && (
          <div className="mt-3 text-xs font-medium text-neutral-900 dark:text-neutral-300 bg-white/75 dark:bg-neutral-800/80 backdrop-blur-xs p-4 rounded-2xl border border-black/10 dark:border-neutral-700/60 space-y-1.5 leading-relaxed">
            <p>
              The workday between 9 AM and 5 PM has 8 distinct one-hour slots (9–10, 10–11, 11–12, 12–1, 1–2, 2–3, 3–4, 4–5).
            </p>
            <p className="font-semibold text-neutral-950 dark:text-white">
              Perform any routine inside a window to lock in that slot. Complete any 5 out of 8 to achieve your daily streak!
            </p>
          </div>
        )}
      </section>

      {/* 3. "YOUR 8-HOUR RADAR" */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Your 8-Hour Radar
          </h2>
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 rounded-full shadow-2xs">
            {completedSlotsCount} completed · {8 - completedSlotsCount} remaining
          </span>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-2 gap-3">
          {slots.map((slot) => {
            const isCompleted = slot.isCompleted;
            const isCurrent = slot.isCurrent;

            return (
              <button
                key={slot.slotIndex}
                type="button"
                onClick={() => {
                  if (isCompleted) {
                    setSelectedSlotForDetail(slot);
                  }
                }}
                className={`text-left p-4 rounded-2xl border transition-all modern-press flex flex-col justify-between min-h-[88px] ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                    : isCurrent
                    ? 'bg-amber-50/70 dark:bg-amber-950/25 border-2 border-amber-400 dark:border-amber-400/80 shadow-sm'
                    : 'bg-white dark:bg-neutral-900/60 border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                    {slot.timeLabel.split(' – ')[0]}
                  </span>

                  {isCompleted ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[10px] font-bold uppercase bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                      Slot {slot.slotIndex + 1}
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  {isCompleted && slot.completedLog ? (
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate flex items-center gap-1">
                      <span>✓</span>
                      <span className="truncate">{slot.completedLog.routineTitle}</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <span>Ready to Move</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                      {slot.isPast ? 'Unfilled' : 'Upcoming'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Modern Primary CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartMove}
          className="w-full py-4 px-6 rounded-2xl bg-rose-500 hover:bg-rose-400 dark:bg-rose-500 dark:hover:bg-rose-400 text-white font-bold text-base tracking-wide shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 modern-press transition-all"
        >
          <span>Start a Move</span>
          <span className="text-xl leading-none font-bold">+</span>
        </button>
        <p className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-2.5">
          Squats · Push-ups · Plank · Jumping Jacks · Walk
        </p>
      </div>

      {/* 5. Completed Slot Details Modal */}
      {selectedSlotForDetail && selectedSlotForDetail.completedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-neutral-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400">
                  Slot {selectedSlotForDetail.slotIndex + 1} · {selectedSlotForDetail.timeLabel}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {selectedSlotForDetail.completedLog.routineTitle}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Completed At</span>
                <span className="font-mono font-medium">
                  {formatLogTime(selectedSlotForDetail.completedLog.completedAt)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Verification</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Verified with AI Vision
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Duration</span>
                <span className="font-mono">
                  {selectedSlotForDetail.completedLog.durationSeconds}s
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500 dark:text-neutral-400">Form Score</span>
                <span className="font-mono font-semibold">
                  {selectedSlotForDetail.completedLog.formScore}% accuracy
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSlotForDetail(null)}
              className="mt-2 w-full py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold modern-press"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
