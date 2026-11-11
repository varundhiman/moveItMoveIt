import React, { useState } from 'react';
import { RoutineLog, WorkdaySlot } from '../types';
import {
  Check,
  X,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
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

  // Format short hour label: "9:00 AM – 10:00 AM" -> "9 AM"
  const getShortHourLabel = (timeLabel: string) => {
    const startPart = timeLabel.split(' – ')[0] || timeLabel;
    return startPart.replace(':00', '').trim();
  };

  const formatLogTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 pb-28 max-w-md mx-auto">
      {/* Main Radar Card (Matching Screenshot Design) */}
      <section className="bg-[#FAF7F0] dark:bg-[#161920] border border-neutral-200 dark:border-[#262B35] rounded-[28px] p-6 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all">
        {/* Card Header: Goal count */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          <span>
            Today's Goal: {targetSlots} Slots/Day
          </span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-[#1F242D] px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700/60 font-mono">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{timeRemainingStr}</span>
          </div>
        </div>

        {/* Big Bold Headline */}
        <div className="mt-2 mb-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.1] font-sans">
            {completedSlotsCount}/{targetSlots} Moves
            <br />
            Completed
          </h2>
        </div>

        {/* Dynamic Segmented Neon Progress Bar */}
        <div
          className="grid gap-2 my-5"
          style={{ gridTemplateColumns: `repeat(${targetSlots}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: targetSlots }).map((_, idx) => {
            const isFilled = idx < completedSlotsCount;
            return (
              <div
                key={idx}
                className={`h-3.5 rounded-md transform -skew-x-12 transition-all duration-300 ${
                  isFilled
                    ? 'bg-gradient-to-r from-[#A3E635] via-[#4ADE80] to-[#2DD4BF] shadow-[0_0_14px_rgba(74,222,128,0.55)]'
                    : 'bg-neutral-200 dark:bg-[#1E232C] border border-neutral-300 dark:border-neutral-700/60'
                }`}
              />
            );
          })}
        </div>

        {/* Radar Section Subtitle */}
        <div className="text-center mt-7 mb-4">
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-300">
            8-Hour Workday Mobility Radar
          </h3>
        </div>

        {/* Hourly Slot Grid (4 Columns x 2 Rows) */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {slots.map((slot) => {
            const isCompleted = slot.isCompleted;
            const isMissed = slot.isPast && !isCompleted;
            const isCurrent = slot.isCurrent;
            const shortTime = getShortHourLabel(slot.timeLabel);

            return (
              <div key={slot.slotIndex} className="flex flex-col items-center">
                {/* Time label above box (Red if missed, green/white if completed, amber if current) */}
                <span
                  className={`text-[11px] sm:text-xs mb-1.5 font-mono ${
                    isMissed
                      ? 'text-rose-500 dark:text-rose-400 font-bold'
                      : isCompleted
                      ? 'text-neutral-700 dark:text-neutral-300 font-semibold'
                      : isCurrent
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-neutral-400 dark:text-neutral-500 font-medium'
                  }`}
                >
                  {shortTime}
                </span>

                {/* Slot Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted) {
                      setSelectedSlotForDetail(slot);
                    } else {
                      onStartMove();
                    }
                  }}
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all modern-press relative ${
                    isCompleted
                      ? 'bg-[#22C55E] text-neutral-950 font-black shadow-md shadow-emerald-500/20 hover:bg-emerald-400'
                      : isMissed
                      ? 'bg-neutral-100 dark:bg-[#1C2028] border border-rose-500/30 text-rose-500 dark:text-rose-400 hover:border-rose-400/50'
                      : isCurrent
                      ? 'bg-amber-50 dark:bg-[#1F242F] border-2 border-amber-400 text-amber-500 shadow-[0_0_14px_rgba(251,191,36,0.25)] hover:border-amber-300'
                      : 'bg-neutral-100 dark:bg-[#1E232C] border border-neutral-200 dark:border-neutral-700/60 text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600'
                  }`}
                  title={
                    isCompleted && slot.completedLog
                      ? `${slot.completedLog.routineTitle} (${slot.completedLog.formScore}% form)`
                      : isMissed
                      ? `Slot missed (${shortTime}) - tap to make up a move`
                      : isCurrent
                      ? `Active window now - tap to move!`
                      : `Upcoming window`
                  }
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                  ) : isMissed ? (
                    <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <div className="flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 relative" />
                    </div>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>

        {/* Expand / Collapse Explainer */}
        <button
          type="button"
          onClick={() => setShowScheduleDetails(!showScheduleDetails)}
          className="mt-6 w-full flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 pt-3 border-t border-neutral-200/80 dark:border-neutral-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>How slots work</span>
          </span>
          <span className="flex items-center gap-1 font-bold">
            {showScheduleDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {showScheduleDetails && (
          <div className="mt-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white/80 dark:bg-[#1F242D] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-1.5 leading-relaxed">
            <p>
              The workday between 9 AM and 5 PM has 8 distinct one-hour slots.
            </p>
            <p className="font-semibold text-neutral-900 dark:text-white">
              Perform any routine inside a window to lock in that slot. Complete any {targetSlots} out of 8 to achieve your daily streak!
            </p>
          </div>
        )}
      </section>

      {/* Primary Action Button (Matching Screenshot Glowing Coral Pill) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartMove}
          className="w-full py-4.5 px-6 rounded-full bg-gradient-to-r from-[#FF5B69] via-[#FF4D5A] to-[#FF4152] hover:from-[#ff6b78] hover:to-[#ff4f5f] text-white font-extrabold text-lg sm:text-xl tracking-wide shadow-[0_12px_32px_rgba(255,77,90,0.48)] hover:shadow-[0_16px_36px_rgba(255,77,90,0.65)] flex items-center justify-center gap-2 modern-press transition-all active:scale-[0.98]"
        >
          <span>Start a Move</span>
          <span className="text-2xl leading-none font-bold">+</span>
        </button>
      </div>

      {/* Completed Slot Details Modal */}
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
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
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
