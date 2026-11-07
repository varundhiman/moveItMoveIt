import React, { useState } from 'react';
import { MobilityRoutine, RoutineLog, WorkdaySlot } from '../types';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Clock,
  Camera,
  Footprints,
  Flame,
  Dumbbell,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface WorkdayRoutineTrackerProps {
  slots: WorkdaySlot[];
  completedSlotsCount: number;
  todayLogs: RoutineLog[];
  inWindow: boolean;
  timeRemainingStr: string;
  routines: MobilityRoutine[];
  onSelectRoutine: (routine: MobilityRoutine) => void;
}

export const WorkdayRoutineTracker: React.FC<WorkdayRoutineTrackerProps> = ({
  slots,
  completedSlotsCount,
  todayLogs,
  inWindow,
  timeRemainingStr,
  routines,
  onSelectRoutine,
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);

  const targetSlots = 5;
  const isGoalMet = completedSlotsCount >= targetSlots;
  const progressPercent = Math.min(100, Math.round((completedSlotsCount / targetSlots) * 100));

  const getRoutineIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatLogTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 1. Primary Time Slots Summary Card (Clickable to reveal details) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition hover:border-slate-700">
        <button
          type="button"
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          className="w-full p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition"
          aria-expanded={detailsExpanded}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Workday Mobility Target · 9 AM – 5 PM
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  {completedSlotsCount} of {targetSlots}
                </span>
                <span className="text-base sm:text-lg font-semibold text-slate-300">
                  Time Slots Completed
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {isGoalMet
                  ? 'Daily goal achieved! All 5 hourly slots completed today.'
                  : `${targetSlots - completedSlotsCount} more hourly ${
                      targetSlots - completedSlotsCount === 1 ? 'slot' : 'slots'
                    } needed before 5:00 PM.`}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{timeRemainingStr}</span>
              </div>
              <div className="p-1 rounded-lg text-slate-400 hover:text-white transition">
                {detailsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Clean Segmented Progress Bar */}
          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isFilled = idx < completedSlotsCount;
              return (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-colors duration-300 ${
                    isFilled ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Toggle Hint */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>
              {detailsExpanded ? 'Hide hourly slot schedule' : 'Tap to view 9 AM – 5 PM hourly slot schedule'}
            </span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span>{detailsExpanded ? 'Collapse' : 'Expand'}</span>
              {detailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </div>
        </button>

        {/* Revealed Details: Hourly Slots (9-10, 10-11, ... 4-5) */}
        {detailsExpanded && (
          <div className="border-t border-slate-800 bg-slate-950/60 p-5 sm:p-6 space-y-4 animate-fadeIn">
            <div className="text-xs text-slate-400 leading-relaxed">
              Between 9 AM and 5 PM, there are 8 one-hour windows. Completing any mobility routine within a window locks in that slot. For example, moving at 9:55 AM and 10:05 AM covers two distinct slots.
            </div>

            <div className="divide-y divide-slate-800/70 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/50">
              {slots.map((slot) => {
                const isCompleted = slot.isCompleted;
                const isCurrent = slot.isCurrent;

                return (
                  <div
                    key={slot.slotIndex}
                    className={`flex items-center justify-between p-3.5 text-xs transition ${
                      isCurrent
                        ? 'bg-slate-800/50'
                        : isCompleted
                        ? 'bg-emerald-950/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950'
                            : isCurrent
                            ? 'border border-emerald-400 text-emerald-400'
                            : 'border border-slate-700 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : slot.slotIndex + 1}
                      </div>

                      <div>
                        <div className="font-semibold text-white">
                          {slot.timeLabel}
                        </div>
                        {isCompleted && slot.completedLog ? (
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {slot.completedLog.routineTitle} · {formatLogTime(slot.completedLog.completedAt)}
                          </div>
                        ) : isCurrent ? (
                          <div className="text-emerald-400 text-[11px] mt-0.5 font-medium">
                            Current active slot — ready for activity
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          Completed
                        </span>
                      ) : isCurrent ? (
                        <span className="text-emerald-400 font-medium text-[11px]">
                          Active Now
                        </span>
                      ) : slot.isPast ? (
                        <span className="text-slate-500 text-[11px]">
                          Unfilled
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Add Activity Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        {!addingActivity ? (
          <div className="text-center py-2">
            <button
              type="button"
              onClick={() => setAddingActivity(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Mobility Activity</span>
            </button>
            <p className="mt-2.5 text-xs text-slate-400">
              Select any routine to launch the camera and automatically verify your reps.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Choose a Mobility Routine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Camera tracking starts immediately upon selection
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddingActivity(false)}
                className="text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>

            {/* List of 5 Mobility Routines */}
            <div className="space-y-2.5">
              {routines.map((routine) => {
                const isWalk = routine.id === 'walk';

                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => {
                      setAddingActivity(false);
                      onSelectRoutine(routine);
                    }}
                    className="w-full text-left p-4 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        {getRoutineIcon(routine.iconName)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
                          {routine.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {routine.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {isWalk ? 'Timer & Cadence' : 'Camera Tracked'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. Today's Completed Activity Log */}
      {todayLogs.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Today's Completed Activities ({todayLogs.length})
          </h3>

          <div className="divide-y divide-slate-800/80">
            {todayLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{log.routineTitle}</div>
                    <div className="text-slate-400 text-[11px]">
                      {formatLogTime(log.completedAt)} · {log.durationSeconds}s duration
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-emerald-400 font-mono font-medium">
                    Verified
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {log.formScore}% form
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
