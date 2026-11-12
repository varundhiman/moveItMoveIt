import React, { useState } from 'react';
import { X, Trophy, Target, Calendar, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { Challenge, UserProfile } from '../types';
import { challengeService } from '../services/challengeService';
import { auth } from '../services/firebase';

interface CreateChallengeModalProps {
  user: UserProfile;
  onClose: () => void;
  onCreated: (challenge: Challenge) => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  user,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyTargetSlots, setDailyTargetSlots] = useState<number>(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isGuestUser = !auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a challenge name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const challenge = await challengeService.createChallenge({
        name: name.trim(),
        description: description.trim(),
        dailyTargetSlots,
        startDate,
        endDate,
        creator: user,
      });
      onCreated(challenge);
      onClose();
    } catch (err: unknown) {
      console.error('Challenge creation error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create challenge in database. Please check connection.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Create New Challenge
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

        {isGuestUser && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p>
              <strong>Guest Mode:</strong> Your challenge and invite code will be created and saved locally on this device. Sign in with Google to sync in real time with coworkers.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
              Challenge Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Workplace Warriors, Q4 Move-Off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
              Daily Activity Quota (Configurable Target) *
            </label>
            <div className="flex items-center gap-2">
              {[3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDailyTargetSlots(num)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition modern-press border ${
                    dailyTargetSlots === num
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {num} slots
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
              Members earn <strong className="text-amber-600 dark:text-amber-400 font-bold">+5 bonus points</strong> when they complete {dailyTargetSlots} hourly slots in a single workday (9 AM – 5 PM).
            </p>
          </div>

          <div>
            <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
              Goal / Description
            </label>
            <textarea
              rows={2}
              placeholder="Short motivation or challenge rules for your squad"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-neutral-700 dark:text-neutral-300 font-semibold block mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Point system summary card */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-1">
            <div className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Challenge Point System</span>
            </div>
            <ul className="text-[11px] text-neutral-700 dark:text-neutral-300 space-y-0.5 list-disc list-inside">
              <li><strong>+5 pts</strong> for every mobility routine completed</li>
              <li><strong>+5 pts</strong> bonus for hitting the daily {dailyTargetSlots}-slot quota</li>
              <li><strong>+2 pts</strong> bonus on days with a 3+ day challenge streak</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
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
              className="flex-1 py-3 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold modern-press disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Launch Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
