import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Clock,
  Camera,
  Trophy,
  Zap,
  Sun,
  Moon,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface HomeScreenProps {
  onContinueAsGuest?: () => void;
  onEnterInviteCode?: (code: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onContinueAsGuest,
  onEnterInviteCode,
}) => {
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setLoginError(null);
    try {
      await signIn();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      if (!msg.includes('popup-closed-by-user')) {
        setLoginError('Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    if (onEnterInviteCode) {
      onEnterInviteCode(inviteCode.trim().toUpperCase());
    } else if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#0B0D13] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-amber-400/30 transition-colors">
      <div className="w-full max-w-sm sm:max-w-md mx-auto min-h-screen flex flex-col justify-between p-6 sm:p-8">
        {/* Top Minimal Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
              Live Workday
            </span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition modern-press shadow-2xs"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>

        {/* Center: Iconic Visual Presentation */}
        <div className="my-auto py-8 text-center space-y-8">
          {/* Brand Icon */}
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-400 text-neutral-950 mx-auto flex items-center justify-center text-4xl font-black shadow-xl shadow-amber-400/25 transition-transform hover:scale-105">
              ⚡
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 dark:text-white font-sans leading-none">
                MoveMates
              </h1>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase mt-1.5 font-mono">
                9 AM – 5 PM Workday Mobility
              </p>
            </div>
          </div>

          {/* 4 Visual Feature Chips (Icon + 2-3 words) */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                  8 Hourly Slots
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">9 AM to 5 PM</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                  AI Vision
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">Auto rep count</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                  +5 Pts & Bonus
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">Quota & streaks</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                  Live Ranks
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">Team challenges</div>
              </div>
            </div>
          </div>

          {/* Login Actions */}
          <div className="space-y-3 pt-2 max-w-xs mx-auto">
            {loginError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                {loginError}
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-4 px-4 rounded-2xl bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-extrabold text-xs tracking-wider uppercase shadow-xl flex items-center justify-center gap-3 modern-press transition-all disabled:opacity-60"
            >
              {isSigningIn ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Quick Guest Preview Button */}
            {onContinueAsGuest && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-semibold text-xs transition flex items-center justify-center gap-1"
              >
                <span>Explore as Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Team Invite Code Option */}
            <div className="pt-1">
              {!showCodeInput ? (
                <button
                  type="button"
                  onClick={() => setShowCodeInput(true)}
                  className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Have an invite code?
                </button>
              ) : (
                <form onSubmit={handleJoinWithCode} className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="MOVE-XXXX"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold modern-press"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Minimal Privacy Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Private on-device AI camera tracking</span>
        </div>
      </div>
    </div>
  );
};
