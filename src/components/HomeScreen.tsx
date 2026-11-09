import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  ShieldCheck,
  ArrowRight,
  Mail,
  Lock,
  User,
} from 'lucide-react';

interface HomeScreenProps {
  onContinueAsGuest?: () => void;
  onEnterInviteCode?: (code: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onContinueAsGuest,
  onEnterInviteCode,
}) => {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Auth mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const formatAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'Invalid email or password.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('popup-closed-by-user')) {
      return '';
    }
    return 'Authentication failed. Please verify your credentials.';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err) {
      const formatted = formatAuthError(err);
      if (formatted) setErrorMessage(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await signIn();
    } catch (err) {
      const formatted = formatAuthError(err);
      if (formatted) setErrorMessage(formatted);
    } finally {
      setIsLoading(false);
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
      <div className="w-full max-w-sm sm:max-w-md mx-auto min-h-screen flex flex-col justify-between p-5 sm:p-7">
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
            className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition modern-press shadow-2xs"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-700" />}
          </button>
        </div>

        {/* Center Section: Brand & Clean Auth */}
        <div className="my-auto py-4 space-y-5 text-center">
          {/* Brand Icon & Heading */}
          <div className="space-y-2.5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-neutral-950 mx-auto flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-400/25">
              ⚡
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white leading-none">
                MoveMates
              </h1>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase mt-1 font-mono">
                9 AM – 5 PM Workday Mobility
              </p>
            </div>
          </div>

          {/* Clean Auth Container */}
          <div className="bg-white dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-5 shadow-xs max-w-xs mx-auto text-left space-y-3.5">
            {/* Segment Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-xl transition ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-xl transition ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Create User
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-2.5 text-xs">
              {authMode === 'signup' && (
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@work.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs shadow-xs modern-press transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{authMode === 'signup' ? 'Create Account' : 'Sign In with Email'}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              <span className="bg-white dark:bg-neutral-900 px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider absolute">
                or
              </span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 modern-press hover:bg-neutral-100 dark:hover:bg-neutral-700 transition disabled:opacity-60"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Links: Guest & Invite Code */}
          <div className="space-y-1.5 max-w-xs mx-auto text-center">
            {onContinueAsGuest && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-semibold transition inline-flex items-center gap-1"
              >
                <span>Explore as Guest</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <div>
              {!showCodeInput ? (
                <button
                  type="button"
                  onClick={() => setShowCodeInput(true)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  Have a team invite code?
                </button>
              ) : (
                <form onSubmit={handleJoinWithCode} className="flex items-center gap-1.5 pt-1 max-w-[240px] mx-auto">
                  <input
                    type="text"
                    required
                    placeholder="MOVE-XXXX"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold modern-press"
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
