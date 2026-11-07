import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, LogOut, CheckCircle2, User, Flame } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { firebaseUser, profile, signIn, signOut, updateUserProfile } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit fields
  const [name, setName] = useState(profile.name);
  const [squadName, setSquadName] = useState(profile.squadName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      await signIn();
      onClose();
    } catch (err: unknown) {
      const errString = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setErrorMsg(errString);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim() || profile.name,
        squadName: squadName.trim() || profile.squadName,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {firebaseUser ? 'User Profile & Settings' : 'Sign in to MoveMates'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition modern-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Not Logged In View */}
        {!firebaseUser ? (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Sign in with your Google account to sync your 9-to-5 mobility slots across devices, maintain your daily streaks, and compete live on the squad ranks.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-medium text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={isSigningIn}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center justify-center gap-3 shadow-sm hover:opacity-90 transition modern-press disabled:opacity-60"
            >
              {/* Google G Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>

            <div className="pt-1 text-center">
              <span className="text-[11px] text-neutral-400">
                Guest mode is also supported; progress is stored locally in your browser.
              </span>
            </div>
          </div>
        ) : (
          /* Logged In View */
          <div className="mt-5 space-y-4">
            {/* User Info Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
              <img
                src={firebaseUser.photoURL || profile.avatar}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {profile.name}
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60">
                    Verified
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {firebaseUser.email}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Streak</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono mt-0.5">{profile.streakDays}d</div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Slots</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{profile.todayRoutinesCount}/5</div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">XP</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono mt-0.5">{profile.totalPoints}</div>
              </div>
            </div>

            {/* Edit User Form */}
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs pt-1">
              <div>
                <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
                  Squad Name
                </label>
                <input
                  type="text"
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {saveSuccess ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs modern-press hover:opacity-90 transition"
                >
                  {isSaving ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>

            {/* Logout Action */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400 text-[11px] font-mono">
                UID: {firebaseUser.uid.substring(0, 8)}...
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold modern-press transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
