import React, { useState } from 'react';
import { X, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Challenge, UserProfile } from '../types';
import { challengeService } from '../services/challengeService';

interface JoinChallengeModalProps {
  user: UserProfile;
  initialCode?: string;
  onClose: () => void;
  onJoined: (challenge: Challenge) => void;
}

export const JoinChallengeModal: React.FC<JoinChallengeModalProps> = ({
  user,
  initialCode = '',
  onClose,
  onJoined,
}) => {
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setErrorMsg('Please enter an invite code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const challenge = await challengeService.joinChallengeByCode(inviteCode.trim(), user);
      onJoined(challenge);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join challenge. Please verify invite code.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Join Challenge
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

        <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Enter the invite code shared by your friend or coworker to join their live leaderboard and compete together.
        </p>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleJoin} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
              Invite Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MOVE-8491"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-wider"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold modern-press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold modern-press disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? 'Joining...' : 'Join Challenge'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
