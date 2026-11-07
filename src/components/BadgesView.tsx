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
    const iconClass = isUnlocked ? 'w-5 h-5 text-emerald-400' : 'w-5 h-5 text-slate-500';
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
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Metric Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mobility Achievements
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {unlockedCount} of {badges.length}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                Digital Badges Earned
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Earn badges for consistency, early morning movement, and hitting your 5-slot workday goals.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
            {['all', 'streak', 'timing', 'completion', 'mastery'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isUnlocked;

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition text-left flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-slate-900 border-slate-750 shadow-sm'
                  : 'bg-slate-900/50 border-slate-850 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-slate-800/60 border border-slate-700/60'
                    }`}
                  >
                    {getBadgeIcon(badge.iconName, isUnlocked)}
                  </div>

                  {isUnlocked ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Earned</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h4 className="mt-3.5 font-bold text-sm text-white">
                  {badge.title}
                </h4>

                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Requirement & Progress */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate pr-2">{badge.requirement}</span>
                  {badge.progress && !isUnlocked && (
                    <span className="font-mono text-slate-300 font-semibold shrink-0">
                      {badge.progress.current}/{badge.progress.target}
                    </span>
                  )}
                </div>

                {badge.progress && !isUnlocked && badge.progress.target > 1 && (
                  <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (badge.progress.current / badge.progress.target) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
