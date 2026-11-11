import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Volume2, VolumeX, Smartphone, Flame, Zap, Sun, Moon } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  user: UserProfile;
  completedSlotsCount: number;
  onOpenStoreModal: () => void;
  onOpenAuthModal: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  completedSlotsCount,
  onOpenStoreModal,
  onOpenAuthModal,
  onToggleSound,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { firebaseUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

  const userInitials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#0B0D13]/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3 transition-colors">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white font-sans">
            MoveMates
          </span>
        </div>

        {/* Right Action Icons & Streak Badge */}
        <div className="flex items-center gap-2.5">
          {/* Workday Streak Badge (Matching Screenshot) */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            title={`${user.streakDays || 1}-day streak`}
            className="flex flex-col items-center modern-press group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-amber-400/90 bg-amber-500/20 dark:bg-amber-500/25 flex items-center justify-center shadow-[0_0_14px_rgba(251,191,36,0.3)] transition-transform group-hover:scale-105">
              <span className="text-neutral-950 dark:text-white font-black text-sm tabular-nums">
                {user.streakDays || 1}
              </span>
              <span className="text-sm ml-0.5">🔥</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-tight mt-0.5">
              {user.streakDays || 1}-day streak
            </span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-colors modern-press border border-neutral-200/60 dark:border-neutral-700/60"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={user.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-colors modern-press border border-neutral-200/60 dark:border-neutral-700/60"
          >
            {user.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {/* App Stores Modal Trigger */}
          <button
            type="button"
            onClick={onOpenStoreModal}
            title="App Stores & Netlify Hosting guide"
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-colors modern-press border border-neutral-200/60 dark:border-neutral-700/60"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Native PWA Install button */}
          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={install}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-3 py-1 rounded-full text-xs font-bold transition shadow-xs modern-press"
            >
              Install
            </button>
          )}

          {/* User Profile / [ME] Badge */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            title={firebaseUser ? `Signed in as ${user.name}` : 'Sign in / Profile'}
            className="flex items-center justify-center min-w-[34px] h-[34px] px-2.5 rounded-full bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 font-bold text-xs shadow-xs modern-press hover:opacity-90 transition"
          >
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover mr-1"
              />
            ) : null}
            <span>{firebaseUser ? userInitials : 'ME'}</span>
          </button>
        </div>
      </div>

      {/* iOS Install Prompt */}
      {showIOSInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-neutral-900 dark:text-white">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              Install on iOS
            </h3>
            <ol className="mt-3 text-xs space-y-2 text-neutral-600 dark:text-neutral-300 list-decimal list-inside font-medium leading-relaxed">
              <li>Tap the <strong className="font-bold text-neutral-900 dark:text-white">Share</strong> icon in Safari.</li>
              <li>Scroll down and tap <strong className="font-bold text-neutral-900 dark:text-white">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="font-bold text-emerald-500">Add</strong> to launch with native camera support.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSInstallGuide(false)}
              className="mt-5 w-full rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 py-3 text-xs font-bold modern-press"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
