import React from 'react';
import { PointBreakdown } from '../types';
import { Sparkles, Trophy, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

interface PointsEarnedModalProps {
  routineTitle: string;
  breakdown: PointBreakdown;
  onDismiss: () => void;
}

export const PointsEarnedModal: React.FC<PointsEarnedModalProps> = ({
  routineTitle,
  breakdown,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-center text-neutral-900 dark:text-white space-y-4">
        {/* Glow icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-500 mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-3 py-0.5 rounded-full inline-block">
            Activity Recorded
          </span>
          <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {routineTitle}
          </h3>
        </div>

        {/* Big points display */}
        <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
          <div className="text-4xl font-black font-mono text-amber-500 tabular-nums">
            +{breakdown.totalEarned} PTS
          </div>
          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-1">
            Added to your challenge score
          </div>
        </div>

        {/* Detailed breakdown list */}
        <div className="space-y-2 text-xs text-left bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Routine Completed</span>
            </span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">+{breakdown.basePoints} pts</span>
          </div>

          {breakdown.dailyQuotaBonus > 0 && (
            <div className="flex items-center justify-between font-medium text-amber-700 dark:text-amber-300 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <span className="flex items-center gap-1.5 font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Quota Bonus Achieved!</span>
              </span>
              <span className="font-mono font-black">+{breakdown.dailyQuotaBonus} pts</span>
            </div>
          )}

          {breakdown.streakBonus > 0 && (
            <div className="flex items-center justify-between font-medium text-amber-700 dark:text-amber-300 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <span className="flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>3+ Day Challenge Streak Bonus!</span>
              </span>
              <span className="font-mono font-black">+{breakdown.streakBonus} pts</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wide modern-press shadow-md"
        >
          View Live Leaderboard
        </button>
      </div>
    </div>
  );
};
