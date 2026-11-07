import React from 'react';
import { Target, Flame, Trophy, Award } from 'lucide-react';

export type NavTab = 'radar' | 'moves' | 'ranks' | 'badges';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  completedSlotsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  completedSlotsCount,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0B0D13]/90 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-800/80 py-2 px-4 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => onChangeTab('radar')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all modern-press ${
            activeTab === 'radar'
              ? 'bg-amber-400/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Target className="w-5 h-5 stroke-[2.2]" />
            {completedSlotsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono">
                {completedSlotsCount}/5
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Radar</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('moves')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all modern-press ${
            activeTab === 'moves'
              ? 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium'
          }`}
        >
          <Flame className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] tracking-tight mt-1">Moves</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('ranks')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all modern-press ${
            activeTab === 'ranks'
              ? 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium'
          }`}
        >
          <Trophy className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] tracking-tight mt-1">Ranks</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('badges')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all modern-press ${
            activeTab === 'badges'
              ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium'
          }`}
        >
          <Award className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] tracking-tight mt-1">Badges</span>
        </button>
      </div>
    </nav>
  );
};
