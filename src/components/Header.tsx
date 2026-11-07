import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Volume2, VolumeX, Smartphone, Flame, User, LogIn, Award } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  user: UserProfile;
  completedSlotsCount: number;
  activeTab: 'routines' | 'badges' | 'leaderboard';
  setActiveTab: (tab: 'routines' | 'badges' | 'leaderboard') => void;
  onOpenStoreModal: () => void;
  onOpenAuthModal: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  completedSlotsCount,
  activeTab,
  setActiveTab,
  onOpenStoreModal,
  onOpenAuthModal,
  onToggleSound,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { firebaseUser } = useAuth();
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('routines')}
            className="text-lg font-bold text-white tracking-tight hover:text-emerald-400 transition"
          >
            ShiftMove
          </button>
          <span className="text-xs text-slate-500 hidden sm:inline">
            9–5 Challenge
          </span>
        </div>

        {/* Center Segmented View Switch */}
        <nav className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('routines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'routines'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tracker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'badges'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Badges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'leaderboard'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Streak Indicator */}
          <div
            title={`${user.streakDays} day challenge streak`}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span className="tabular-nums">{user.streakDays}d</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={user.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            {user.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* App Stores Modal Trigger */}
          <button
            type="button"
            onClick={onOpenStoreModal}
            title="App Store & Play Store publishing guide"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={install}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Install
            </button>
          )}

          {!isInstalled && isIOS && !isInstallable && (
            <button
              type="button"
              onClick={() => setShowIOSInstallGuide(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:text-white"
            >
              Install iOS
            </button>
          )}

          {/* User Profile / Login Button */}
          {firebaseUser ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              title={`Logged in as ${user.name}`}
              className="relative p-0.5 rounded-full ring-1 ring-emerald-500/60 hover:ring-emerald-400 transition"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Install Guide Sheet */}
      {showIOSInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl text-slate-200">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Install on iPhone or iPad
            </h3>
            <ol className="mt-3 text-xs space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
              <li>Tap the <strong className="text-white">Share</strong> icon in the Safari toolbar.</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-emerald-400">Add</strong> to launch with native camera support.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSInstallGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
