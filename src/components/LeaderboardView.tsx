import React, { useState } from 'react';
import { LeaderboardMember, ActivityFeedItem, UserProfile, Challenge } from '../types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import {
  Trophy,
  Flame,
  UserPlus,
  Copy,
  Check,
  Users,
  Sparkles,
  PlusCircle,
  LogIn,
  Target,
  Zap,
  Award,
} from 'lucide-react';

interface LeaderboardViewProps {
  user: UserProfile;
  challenge: Challenge | null;
  members: LeaderboardMember[];
  activityFeed: ActivityFeedItem[];
  onCheer: (memberId: string) => void;
  onCreateChallenge: () => void;
  onJoinChallenge: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  challenge,
  members,
  activityFeed,
  onCheer,
  onCreateChallenge,
  onJoinChallenge,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { playRepDing } = useAudioFeedback(user.soundEnabled, user.voiceEnabled);

  const targetSlots = challenge?.dailyTargetSlots || 5;
  const inviteCode = challenge?.inviteCode || user.squadCode || '';
  const challengeTitle = challenge?.name || user.squadName || 'Workday Mobility Challenge';

  // Sort members: 1. Total score descending, 2. Today's completed slots descending
  const sortedMembers = [...members].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.todayCompletedCount - a.todayCompletedCount;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}?code=${encodeURIComponent(inviteCode)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        showToast('Invite link copied! Share it with friends or coworkers.');
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      showToast(`Invite Code: ${inviteCode}`);
    }
  };

  const handleCheerMember = (member: LeaderboardMember) => {
    onCheer(member.id);
    playRepDing();
    showToast(`Sent a cheer to ${member.name}! 💪`);
  };

  const userRankIndex = sortedMembers.findIndex((m) => m.isCurrentUser || m.id === user.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;
  const activeTodayCount = sortedMembers.filter((m) => m.todayCompletedCount > 0).length;

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 rounded-2xl bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 px-4 py-2.5 shadow-xl text-xs font-bold transition flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 dark:text-neutral-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Title & Actions */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
            LEADERBOARD
          </h1>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1.5">
            <span>Live Challenge Rankings</span>
            <span>·</span>
            <span>Real-time Sync</span>
          </p>
        </div>

        {/* Quick Challenge Switch/Create Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onJoinChallenge}
            title="Join another challenge"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition modern-press flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Join</span>
          </button>
          <button
            type="button"
            onClick={onCreateChallenge}
            title="Create a new challenge"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 text-xs font-bold transition modern-press flex items-center gap-1 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Challenge</span>
          </button>
        </div>
      </div>

      {/* 2. Challenge Overview Card */}
      <section className="bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 border border-amber-400/30 dark:border-neutral-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Active Challenge</span>
            </div>
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white truncate mt-0.5">
              {challengeTitle}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
              {challenge?.description || 'Workday mobility challenge with real-time scoring and live activity tracking.'}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-[11px] font-bold text-amber-800 dark:text-amber-300">
              Goal: {targetSlots} slots/day
            </span>
          </div>
        </div>

        {/* Invite Code & Share Bar (or Create/Join when no challenge active) */}
        {inviteCode ? (
          <div className="flex items-center justify-between gap-2 p-2.5 bg-white/80 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Invite Code:
              </span>
              <code className="font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                {inviteCode}
              </code>
            </div>

            <button
              type="button"
              onClick={handleCopyInvite}
              className="px-3 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold transition modern-press flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Code'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCreateChallenge}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition modern-press shadow-xs"
            >
              + Create Challenge
            </button>
            <button
              type="button"
              onClick={onJoinChallenge}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition modern-press border border-neutral-200 dark:border-neutral-700"
            >
              Join with Code
            </button>
          </div>
        )}
      </section>

      {/* 3. Official Point System Summary Banner */}
      <section className="bg-white dark:bg-neutral-900/70 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Point Scoring Rules</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">Automatic calculation</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
            <div className="text-base font-black font-mono text-amber-500">5 pts</div>
            <div className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">Per Routine</div>
            <div className="text-[9px] text-neutral-400">Any move done</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
            <div className="text-base font-black font-mono text-amber-600 dark:text-amber-400">+5 pts</div>
            <div className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">Daily Quota</div>
            <div className="text-[9px] text-neutral-400">{targetSlots} slots hit</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
            <div className="text-base font-black font-mono text-rose-500">+2 pts</div>
            <div className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">Streak Bonus</div>
            <div className="text-[9px] text-neutral-400">3+ day streak</div>
          </div>
        </div>
      </section>

      {/* 4. Complete Rankings List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Member Rankings ({sortedMembers.length})
          </h2>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            Ranked by Points & Slots
          </span>
        </div>

        <div className="space-y-2">
          {sortedMembers.map((member, index) => {
            const hasHitQuota = member.todayCompletedCount >= targetSlots;
            const remaining = Math.max(0, targetSlots - member.todayCompletedCount);
            const isMe = member.isCurrentUser || member.id === user.id;

            return (
              <div
                key={member.id}
                className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-500/50 shadow-xs'
                    : 'bg-white dark:bg-neutral-900/60 border-neutral-200/90 dark:border-neutral-800 shadow-2xs'
                }`}
              >
                {/* Left: Rank # & Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-5 text-center font-mono font-bold text-xs ${
                      index === 0
                        ? 'text-amber-500 font-black text-sm'
                        : index === 1
                        ? 'text-neutral-400 font-bold'
                        : index === 2
                        ? 'text-amber-700 dark:text-amber-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    #{index + 1}
                  </span>

                  <div className="relative shrink-0">
                    {member.avatar && member.avatar.startsWith('http') ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                        {(member.name || 'A')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {member.todayCompletedCount}/{targetSlots} slots
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {member.streakDays}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Points & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-amber-500">
                      {member.totalScore || 0}
                      <span className="text-[10px] font-semibold text-neutral-400 ml-0.5">pts</span>
                    </div>
                    {hasHitQuota ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Quota Met 👑
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                        {remaining} to quota
                      </span>
                    )}
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => handleCheerMember(member)}
                      title="Cheer teammate"
                      className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-sm transition modern-press"
                    >
                      💪
                      {(member.cheerCount ?? 0) > 0 && (
                        <span className="sr-only">({member.cheerCount})</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* If user is alone in the challenge */}
        {sortedMembers.length === 1 && (
          <div className="mt-3 p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
              You're currently alone in this challenge!
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
              Share code <strong className="font-mono text-amber-600 dark:text-amber-400">{inviteCode}</strong> with friends or coworkers so they can join and compete in real-time.
            </p>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="mt-1 px-4 py-2 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold modern-press inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Invite Code</span>
            </button>
          </div>
        )}
      </section>

      {/* 5. Live Activity Feed */}
      <section className="bg-white dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Challenge Feed</span>
          </h4>
          <span className="text-[11px] text-neutral-400 font-mono">
            {activityFeed.length} recorded
          </span>
        </div>

        {activityFeed.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {activityFeed.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-neutral-900 dark:text-white truncate">
                    {item.userName}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 truncate">
                    completed {item.routineTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.pointsEarned ? (
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px] bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                      +{item.pointsEarned} pts
                    </span>
                  ) : null}
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {item.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
            No routines completed yet today. Start your first move to get on the board!
          </div>
        )}
      </section>
    </div>
  );
};
