import React, { useState } from 'react';
import { RoutineLog, DaySummary } from '../types';
import { storage } from '../services/storage';
import {
  Calendar,
  CheckCircle2,
  Trophy,
  Flame,
  Award,
  Sparkles,
  Clock,
  Dumbbell,
  ShieldCheck,
  Zap,
  Footprints,
  ChevronRight,
  TrendingUp,
  Check,
  X,
  Target,
} from 'lucide-react';

interface HistoryViewProps {
  allLogs: RoutineLog[];
  dailyTargetSlots?: number;
  streakDays: number;
  onStartMove: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  allLogs,
  dailyTargetSlots = 5,
  streakDays,
  onStartMove,
}) => {
  const daySummaries: DaySummary[] = storage.getHistoricDaysSummary(allLogs, dailyTargetSlots);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => {
    return daySummaries.length > 0 ? daySummaries[0].dateStr : '';
  });

  const selectedDay = daySummaries.find((d) => d.dateStr === selectedDateKey) || daySummaries[0];

  // All-time aggregated stats
  const totalMoves = allLogs.length;
  const quotaMetDaysCount = daySummaries.filter((d) => d.isGoalMet).length;
  const totalPoints = daySummaries.reduce((sum, d) => sum + d.totalPoints, 0);
  const avgFormScore =
    allLogs.length > 0
      ? Math.round(allLogs.reduce((sum, l) => sum + (l.formScore || 95), 0) / allLogs.length)
      : 0;

  // Routine variety breakdown
  const routineCounts: { [key: string]: number } = {};
  allLogs.forEach((l) => {
    routineCounts[l.routineId] = (routineCounts[l.routineId] || 0) + 1;
  });

  const routineMetaMap: {
    [key: string]: { label: string; icon: React.ReactNode; color: string; barColor: string };
  } = {
    squats: {
      label: 'Desk Squats',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      color: 'text-amber-500',
      barColor: 'bg-amber-400',
    },
    pushups: {
      label: 'Desk Push-ups',
      icon: <Dumbbell className="w-4 h-4 text-neutral-400" />,
      color: 'text-neutral-400',
      barColor: 'bg-neutral-500',
    },
    plank: {
      label: 'Desk Plank',
      icon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
      color: 'text-rose-500',
      barColor: 'bg-rose-500',
    },
    jumping_jacks: {
      label: 'Jumping Jacks',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      color: 'text-emerald-400',
      barColor: 'bg-emerald-400',
    },
    walk: {
      label: '5-Min Walk',
      icon: <Footprints className="w-4 h-4 text-sky-400" />,
      color: 'text-sky-400',
      barColor: 'bg-sky-400',
    },
  };

  const getRoutineIcon = (routineId: string) => {
    return routineMetaMap[routineId]?.icon || <Sparkles className="w-4 h-4 text-amber-400" />;
  };

  const formatLogTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 pb-28 max-w-md mx-auto animate-fade-in">
      {/* 1. Header */}
      <div className="pt-1 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
            HISTORY
          </h1>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Past Days Mobility & Streak Summary</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-3 py-1.5 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="font-mono tabular-nums">{streakDays}d Streak</span>
        </div>
      </div>

      {/* 2. High-Level Summary Stats Grid (4 Cards) */}
      <section className="grid grid-cols-2 gap-3">
        {/* Total Moves */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#161920] border border-neutral-200/80 dark:border-[#262B35] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Moves Logged</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tabular-nums">
            {totalMoves}
          </div>
          <span className="text-[10px] text-neutral-500 font-medium">Workday exercises</span>
        </div>

        {/* Quota Days Met */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#161920] border border-neutral-200/80 dark:border-[#262B35] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Quota Hit</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tabular-nums">
            {quotaMetDaysCount} <span className="text-xs text-neutral-500 font-sans">days</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {quotaMetDaysCount > 0 && daySummaries.length > 0
              ? `${Math.round((quotaMetDaysCount / daySummaries.length) * 100)}% consistency`
              : '0% consistency'}
          </span>
        </div>

        {/* Mobility Points */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#161920] border border-neutral-200/80 dark:border-[#262B35] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Total Points</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tabular-nums">
            {totalPoints} <span className="text-xs text-neutral-500 font-sans">pts</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-medium">+5 bonus on quotas</span>
        </div>

        {/* Form Accuracy */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#161920] border border-neutral-200/80 dark:border-[#262B35] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">AI Accuracy</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tabular-nums">
            {avgFormScore}%
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Camera vision verified</span>
        </div>
      </section>

      {/* 3. Interactive 7-Day Streak & Quota Bar Chart */}
      <section className="bg-white dark:bg-[#161920] border border-neutral-200/80 dark:border-[#262B35] rounded-[28px] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>7-Day Mobility Quota Tracker</span>
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Goal: {dailyTargetSlots} slots per workday
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-neutral-100 dark:bg-[#1F242D] px-2.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300">
            Tap day to view
          </span>
        </div>

        {/* 7-Day Horizontal Bar Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
          {daySummaries.slice(0, 7).reverse().map((day) => {
            const isSelected = selectedDay && selectedDay.dateStr === day.dateStr;
            const fillRatio = Math.min(1, day.completedSlotsCount / dailyTargetSlots);

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDateKey(day.dateStr)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all modern-press relative ${
                  isSelected
                    ? 'bg-amber-500/15 dark:bg-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-neutral-50 dark:bg-[#1F242D]/60 hover:bg-neutral-100 dark:hover:bg-[#1F242D]'
                }`}
              >
                {/* Day of Week */}
                <span className={`text-[10px] font-bold uppercase font-mono ${
                  isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'
                }`}>
                  {day.shortDay}
                </span>

                {/* Day of Month */}
                <span className={`text-xs font-bold my-1 ${
                  day.isToday ? 'text-amber-500' : 'text-neutral-700 dark:text-neutral-300'
                }`}>
                  {day.dayNumber}
                </span>

                {/* Vertical Mini Bar */}
                <div className="w-2.5 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex flex-col justify-end my-1">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      day.isGoalMet
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                        : day.completedSlotsCount > 0
                        ? 'bg-amber-400'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(10, fillRatio * 100)}%` }}
                  />
                </div>

                {/* Quota Badge Indicator */}
                <div className="mt-1">
                  {day.isGoalMet ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-400 font-bold">
                      {day.completedSlotsCount}/{dailyTargetSlots}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Selected Day Inspector Card */}
      {selectedDay && (
        <section className="bg-[#FAF7F0] dark:bg-[#161920] border border-neutral-200 dark:border-[#262B35] rounded-[28px] p-6 shadow-xl relative overflow-hidden transition-all">
          {/* Card Date Header */}
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Workday Scorecard
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight mt-0.5">
                {selectedDay.displayDate}
              </h2>
            </div>

            {selectedDay.isGoalMet ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quota Met (+5 Bonus)</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
                {selectedDay.completedSlotsCount}/{dailyTargetSlots} Slots
              </span>
            )}
          </div>

          {/* Quick Metrics for the day */}
          <div className="grid grid-cols-3 gap-2 py-4 border-b border-neutral-200/80 dark:border-neutral-800 text-center">
            <div className="p-2 rounded-2xl bg-white/70 dark:bg-[#1F242D]/70 border border-neutral-200/60 dark:border-neutral-700/50">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Slots Filled</span>
              <span className="text-lg font-black text-neutral-900 dark:text-white font-mono tabular-nums">
                {selectedDay.completedSlotsCount}/{dailyTargetSlots}
              </span>
            </div>

            <div className="p-2 rounded-2xl bg-white/70 dark:bg-[#1F242D]/70 border border-neutral-200/60 dark:border-neutral-700/50">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Points Earned</span>
              <span className="text-lg font-black text-amber-500 font-mono tabular-nums">
                +{selectedDay.totalPoints}
              </span>
            </div>

            <div className="p-2 rounded-2xl bg-white/70 dark:bg-[#1F242D]/70 border border-neutral-200/60 dark:border-neutral-700/50">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Form Precision</span>
              <span className="text-lg font-black text-emerald-500 font-mono tabular-nums">
                {selectedDay.averageFormScore}%
              </span>
            </div>
          </div>

          {/* 8-Hour Slot Timeline for this day */}
          <div className="py-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
              <span>8-Hour Workday Slots</span>
              <span className="text-[10px] font-normal text-neutral-400">9 AM – 5 PM</span>
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {selectedDay.slotDistribution.map((slot) => {
                const hourLabel = slot.timeLabel.split(' – ')[0].replace(':00', '').trim();
                return (
                  <div
                    key={slot.slotIndex}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[64px] transition-all ${
                      slot.isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-white/50 dark:bg-[#1F242D]/50 border-neutral-200 dark:border-neutral-700/50 text-neutral-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block">{hourLabel}</span>
                    <div className="my-1">
                      {slot.isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center text-[10px] mx-auto">
                          —
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-medium truncate max-w-[65px] block">
                      {slot.routineTitle ? slot.routineTitle.split(' ')[0] : 'Rest'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed list of workouts on that day */}
          <div className="pt-4">
            <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono mb-3">
              Completed Moves Log ({selectedDay.logs.length})
            </h3>

            {selectedDay.logs.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-100/60 dark:bg-[#1F242D]/60 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                No mobility routines recorded for this workday.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDay.logs.map((log) => {
                  const meta = routineMetaMap[log.routineId];

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#1F242D] border border-neutral-200/90 dark:border-neutral-700/60 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          {getRoutineIcon(log.routineId)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                            {log.routineTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                            <span>{formatLogTime(log.completedAt)}</span>
                            <span>·</span>
                            <span>{log.durationSeconds}s duration</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-amber-500 font-mono">
                          +{log.score || 5} pts
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {log.formScore}% form
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick CTA if looking at today and quota is open */}
          {selectedDay.isToday && !selectedDay.isGoalMet && (
            <div className="mt-5 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
              <button
                type="button"
                onClick={onStartMove}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF5B69] via-[#FF4D5A] to-[#FF4152] text-white font-bold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 modern-press"
              >
                <span>Complete Next Slot to Maintain Streak</span>
                <span className="text-base font-bold">+</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* 5. Routine Distribution (Movement Variety) */}
      <section className="bg-white dark:bg-[#161920] border border-neutral-200/80 dark:border-[#262B35] rounded-[28px] p-5 shadow-lg">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-emerald-500" />
          <span>Mobility Routine Variety</span>
        </h2>

        {totalMoves === 0 ? (
          <div className="p-5 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-[#1F242D]/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
            No routines completed yet. Start your first move on the Radar screen!
          </div>
        ) : (
          <div className="space-y-2.5">
            {Object.keys(routineMetaMap).map((id) => {
              const meta = routineMetaMap[id];
              const count = routineCounts[id] || 0;
              const percentage = totalMoves > 0 ? Math.round((count / totalMoves) * 100) : 0;

              return (
                <div key={id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                      {meta.icon}
                      <span>{meta.label}</span>
                    </div>
                    <span className="text-neutral-400 font-mono font-bold text-[11px]">
                      {count} moves ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
