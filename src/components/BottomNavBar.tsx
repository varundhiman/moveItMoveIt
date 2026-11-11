import React from 'react';
import { Home, BarChart2, Users, User } from 'lucide-react';

export type NavTab = 'radar' | 'history' | 'ranks' | 'badges';

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
  const tabs = [
    { id: 'radar' as const, label: 'Radar Home', icon: Home },
    { id: 'history' as const, label: 'Activity History', icon: BarChart2 },
    { id: 'ranks' as const, label: 'Squad Leaderboard', icon: Users },
    { id: 'badges' as const, label: 'Profile & Badges', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[100] bg-[#0E1117]/95 dark:bg-[#0E1117]/95 backdrop-blur-xl border-t border-neutral-800/80 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] px-6 transition-colors shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all modern-press ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.id === 'radar' && completedSlotsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono ring-2 ring-[#0E1117]">
                    {completedSlotsCount}
                  </span>
                )}
              </div>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

