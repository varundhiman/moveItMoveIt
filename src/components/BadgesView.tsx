import React, { useState } from 'react';
import { DigitalBadge } from '../types';
import {
  Sunrise,
  Trophy,
  Flame,
  Award,
  Compass,
  Zap,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';

interface BadgesViewProps {
  badges: DigitalBadge[];
}

export const BadgesView: React.FC<BadgesViewProps> = ({ badges }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = isUnlocked
      ? 'w-5 h-5 text-amber-500 dark:text-amber-400 stroke-[2.2]'
      : 'w-5 h-5 text-neutral-400 dark:text-neutral-500 stroke-[2]';
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const filteredBadges = badges.filter(
    (b) => selectedCategory === 'all' || b.category === selectedCategory
  );

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto">
      {/* 1. Header Title */}
      <div className="pt-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
          ACHIEVEMENTS
        </h1>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5">
          Digital Badges & Challenge Trophies
        </p>
      </div>

      {/* 2. Metric Header Banner */}
      <section className="bg-gradient-to-br from-amber-400/15 via-amber-400/10 to-transparent dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 border border-amber-300 dark:border-amber-500/30 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Collection Progress
            </div>
            <div className="text-3xl font-black font-mono text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {unlockedCount} / {badges.length}
            </div>
            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">
              Badges Unlocked
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          {['all', 'streak', 'timing', 'completion', 'mastery'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-all modern-press shrink-0 ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Badges Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isUnlocked;

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-3 ${
                isUnlocked
                  ? 'bg-white dark:bg-neutral-900/80 border-neutral-200/90 dark:border-neutral-800 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/50 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  }`}
                >
                  {getBadgeIcon(badge.iconName, isUnlocked)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                      {badge.title}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>

                  <div className="mt-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                    <span>Target: {badge.requirement}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                    <span>Earned</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
