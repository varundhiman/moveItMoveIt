import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, CheckCircle2, User, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const {
    firebaseUser,
    profile,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserProfile,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit profile fields for logged in state
  const [name, setName] = useState(profile.name);
  const [squadName, setSquadName] = useState(profile.squadName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signIn();
      onClose();
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      if (formatted) setErrorMsg(formatted);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (authMode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      onClose();
    } catch (err) {
      const formatted = formatAuthError(err);
      if (formatted) setErrorMsg(formatted);
    } finally {
      setIsSubmitting(false);
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
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {firebaseUser ? 'User Profile & Settings' : 'Sign In or Create User'}
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
          <div className="mt-4 space-y-3.5">
            {/* Mode Switch */}
            <div className="flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
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
                  setErrorMsg(null);
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

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-2.5 text-xs">
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
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs shadow-xs modern-press transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{authMode === 'signup' ? 'Create User Account' : 'Sign In with Email'}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              <span className="bg-white dark:bg-neutral-900 px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider absolute">
                or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
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
        ) : (
          /* Logged In View */
          <div className="mt-4 space-y-4">
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
                    Active
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {firebaseUser.email || 'Email user'}
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
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Points</div>
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
