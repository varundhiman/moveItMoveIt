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
        return <Sunrise className="w-8 h-8 text-emerald-400" />;
      case 'Trophy':
        return <Trophy className="w-8 h-8 text-emerald-400" />;
      case 'Flame':
        return <Flame className="w-8 h-8 text-emerald-400" />;
      case 'Award':
        return <Award className="w-8 h-8 text-emerald-400" />;
      case 'Compass':
        return <Compass className="w-8 h-8 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-8 h-8 text-emerald-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      default:
        return <Award className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          {getBadgeIcon(badge.iconName)}
        </div>

        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          New Digital Badge Unlocked!
        </div>

        <h3 className="mt-1 text-lg font-bold text-white">
          {badge.title}
        </h3>

        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
          {badge.description}
        </p>

        <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          {badge.requirement}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
        >
          Collect Badge
        </button>
      </div>
    </div>
  );
};
