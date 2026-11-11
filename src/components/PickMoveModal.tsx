import React from 'react';
import { MobilityRoutine } from '../types';
import {
  X,
  Flame,
  Dumbbell,
  ShieldCheck,
  Zap,
  Footprints,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PickMoveModalProps {
  routines: MobilityRoutine[];
  onSelectRoutine: (routine: MobilityRoutine) => void;
  onClose: () => void;
  slotLabel?: string;
}

export const PickMoveModal: React.FC<PickMoveModalProps> = ({
  routines,
  onSelectRoutine,
  onClose,
  slotLabel,
}) => {
  const getRoutineMeta = (routineId: string) => {
    switch (routineId) {
      case 'squats':
        return {
          icon: <Flame className="w-5 h-5 text-amber-500" />,
          accent: 'hover:border-amber-400 dark:hover:border-amber-400',
          badge: 'AI Camera Vision',
          badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          time: '~1 min',
          reps: '15 reps',
        };
      case 'pushups':
        return {
          icon: <Dumbbell className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />,
          accent: 'hover:border-neutral-400 dark:hover:border-neutral-500',
          badge: 'AI Camera Vision',
          badgeStyle: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
          time: '~1 min',
          reps: '10 reps',
        };
      case 'plank':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
          accent: 'hover:border-rose-400 dark:hover:border-rose-400',
          badge: 'Pose Hold Timer',
          badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          time: '20 sec',
          reps: '20s hold',
        };
      case 'jumping_jacks':
        return {
          icon: <Zap className="w-5 h-5 text-emerald-500" />,
          accent: 'hover:border-emerald-400 dark:hover:border-emerald-400',
          badge: 'Cardio AI Tracking',
          badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          time: '~1 min',
          reps: '20 reps',
        };
      case 'walk':
        return {
          icon: <Footprints className="w-5 h-5 text-sky-500" />,
          accent: 'hover:border-sky-400 dark:hover:border-sky-400',
          badge: 'Step Timer',
          badgeStyle: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
          time: '5 min',
          reps: '300 sec',
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
          accent: 'hover:border-neutral-400',
          badge: 'Verified',
          badgeStyle: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
          time: '~1 min',
          reps: 'Goal',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#FAF7F0] dark:bg-[#161920] border-t sm:border border-neutral-200 dark:border-[#262B35] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              {slotLabel ? `Lock in ${slotLabel}` : 'Hourly Workday Mobility'}
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-0.5">
              Pick a Move!
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Select any quick routine to complete your slot and earn points
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors modern-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of 5 Mobility Routines */}
        <div className="mt-4 space-y-3">
          {routines.map((routine) => {
            const meta = getRoutineMeta(routine.id);

            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => {
                  onSelectRoutine(routine);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl bg-white dark:bg-[#1F242D] border border-neutral-200/90 dark:border-neutral-700/60 hover:border-amber-400 dark:hover:border-amber-400 shadow-xs hover:shadow-md transition-all modern-press flex items-center justify-between gap-3 group`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {meta.icon}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                        {routine.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {routine.description}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${meta.badgeStyle}`}>
                        {meta.badge}
                      </span>
                      <span className="text-neutral-400 font-mono font-medium">
                        {meta.reps} · {meta.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-amber-400 dark:group-hover:bg-amber-400 group-hover:text-neutral-950 text-neutral-400 flex items-center justify-center shrink-0 transition-all">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Help Footer */}
        <div className="mt-4 p-3 rounded-2xl bg-neutral-100/80 dark:bg-[#1A1D24] text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Camera vision runs 100% privately on your device. No video is ever stored or uploaded.</span>
        </div>
      </div>
    </div>
  );
};
