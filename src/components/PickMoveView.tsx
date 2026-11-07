import React from 'react';
import { MobilityRoutine } from '../types';
import { ArrowRight, ChevronLeft, Sparkles, CheckCircle2, Flame, Dumbbell, ShieldCheck, Zap, Footprints } from 'lucide-react';

interface PickMoveViewProps {
  routines: MobilityRoutine[];
  onSelectRoutine: (routine: MobilityRoutine) => void;
  onBackToRadar?: () => void;
}

export const PickMoveView: React.FC<PickMoveViewProps> = ({
  routines,
  onSelectRoutine,
  onBackToRadar,
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
        };
      case 'pushups':
        return {
          icon: <Dumbbell className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />,
          accent: 'hover:border-neutral-400 dark:hover:border-neutral-500',
          badge: 'AI Camera Vision',
          badgeStyle: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
          time: '~1 min',
        };
      case 'plank':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
          accent: 'hover:border-rose-400 dark:hover:border-rose-400',
          badge: 'Pose Hold Timer',
          badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          time: '20 sec',
        };
      case 'jumping_jacks':
        return {
          icon: <Zap className="w-5 h-5 text-emerald-500" />,
          accent: 'hover:border-emerald-400 dark:hover:border-emerald-400',
          badge: 'Cardio AI Tracking',
          badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          time: '~1 min',
        };
      case 'walk':
        return {
          icon: <Footprints className="w-5 h-5 text-sky-500" />,
          accent: 'hover:border-sky-400 dark:hover:border-sky-400',
          badge: 'Step Timer',
          badgeStyle: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
          time: '5 min',
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
          accent: 'hover:border-neutral-400',
          badge: 'Verified',
          badgeStyle: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
          time: '~1 min',
        };
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto">
      {/* Top Header */}
      <div className="pt-1">
        {onBackToRadar && (
          <button
            type="button"
            onClick={onBackToRadar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-2.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Radar</span>
          </button>
        )}

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
          PICK A MOVE!
        </h1>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5">
          Choose your mobility routine for this hour
        </p>
      </div>

      {/* List of 5 Modern Routine Cards */}
      <div className="space-y-3">
        {routines.map((routine) => {
          const meta = getRoutineMeta(routine.id);

          return (
            <button
              key={routine.id}
              type="button"
              onClick={() => onSelectRoutine(routine)}
              className={`w-full text-left p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all modern-press flex items-center justify-between gap-4 group ${meta.accent}`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  {meta.icon}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate">
                      {routine.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                    {routine.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${meta.badgeStyle}`}>
                      {meta.badge}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-500 font-mono">
                      {meta.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-4 rounded-3xl bg-white/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 text-center shadow-xs">
        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
          ⚡ All routines qualify for your hourly slot
        </p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Camera tracking starts automatically upon selection to verify reps.
        </p>
      </div>
    </div>
  );
};
