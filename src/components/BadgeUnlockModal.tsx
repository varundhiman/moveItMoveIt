import React from 'react';
import { DigitalBadge } from '../types';
import { Sunrise, Trophy, Flame, Award, Compass, Zap, ShieldCheck, X } from 'lucide-react';

interface BadgeUnlockModalProps {
  badge: DigitalBadge;
  onClose: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ badge, onClose }) => {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      case 'Trophy':
        return <Trophy className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      case 'Flame':
        return <Flame className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      case 'Award':
        return <Award className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      case 'Compass':
        return <Compass className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      case 'Zap':
        return <Zap className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
      default:
        return <Award className="w-8 h-8 text-amber-500 stroke-[2.2]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 text-center shadow-2xl text-neutral-900 dark:text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition modern-press"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
          {getBadgeIcon(badge.iconName)}
        </div>

        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 inline-block px-3 py-0.5 rounded-full mb-2">
          New Trophy Unlocked!
        </div>

        <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white font-sans">
          {badge.title}
        </h3>

        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {badge.description}
        </p>

        <div className="mt-4 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Target: {badge.requirement}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 modern-press transition"
        >
          Collect Trophy
        </button>
      </div>
    </div>
  );
};
