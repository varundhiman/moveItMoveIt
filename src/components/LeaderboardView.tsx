import React, { useState } from 'react';
import { LeaderboardMember, ActivityFeedItem, UserProfile } from '../types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import {
  Trophy,
  Flame,
  UserPlus,
  Copy,
  Check,
  Users,
  Bell,
  Sparkles,
} from 'lucide-react';

interface LeaderboardViewProps {
  user: UserProfile;
  members: LeaderboardMember[];
  activityFeed: ActivityFeedItem[];
  onCheer: (memberId: string) => void;
  onAddFriend: (name: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  members,
  activityFeed,
  onCheer,
  onAddFriend,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { playRepDing } = useAudioFeedback(user.soundEnabled, user.voiceEnabled);

  // Sort members: 1. Slots completed today (descending), 2. Total score
  const sortedMembers = [...members].sort((a, b) => {
    if (b.todayCompletedCount !== a.todayCompletedCount) {
      return b.todayCompletedCount - a.todayCompletedCount;
    }
    return b.totalScore - a.totalScore;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}?squad=${encodeURIComponent(user.squadCode)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        showToast('Invite link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      showToast(`Challenge Code: ${user.squadCode}`);
    }
  };

  const handleCheerMember = (member: LeaderboardMember) => {
    onCheer(member.id);
    playRepDing();
    showToast(`Sent cheer to ${member.name}! 💪`);
  };

  const handleNudgeMember = (member: LeaderboardMember) => {
    playRepDing();
    showToast(`Nudged ${member.name} to hit today’s 5 mobility slots.`);
  };

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;
    onAddFriend(friendName.trim());
    showToast(`Added ${friendName.trim()} to the challenge leaderboard.`);
    setFriendName('');
    setShowAddFriend(false);
  };

  const userRankIndex = sortedMembers.findIndex((m) => m.isCurrentUser);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 rounded-2xl bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 px-4 py-2.5 shadow-xl text-xs font-bold transition">
          {toastMessage}
        </div>
      )}

      {/* 1. Header Title */}
      <div className="pt-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
          THE RANKS!
        </h1>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1.5">
          9-to-5 Workday Squad Leaderboard
        </p>
      </div>

      {/* 2. Top Callout Banner */}
      <section className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent dark:from-neutral-900 dark:to-neutral-950 border border-amber-500/30 dark:border-amber-400/30 rounded-3xl p-5 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h3 className="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Your Crew is on Fire!
          </h3>
        </div>
        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          {sortedMembers.filter((m) => m.todayCompletedCount > 0).length} friends active today · You're #{userRank} right now!
        </p>
      </section>

      {/* 3. Squad Info & Action Bar */}
      <div className="flex items-center justify-between gap-2 p-3.5 bg-white dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200 shrink-0">
            {user.squadCode.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
              {user.squadName}
            </div>
            <div className="text-[11px] font-mono text-neutral-400 truncate">
              Code: {user.squadCode}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyInvite}
            className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition modern-press flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Invite'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddFriend(true)}
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-emerald-500 dark:text-neutral-950 text-xs font-bold transition modern-press flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* 4. Complete Rankings List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Today's Crew Rankings
          </h2>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            Goal: 5 Slots before 5 PM
          </span>
        </div>

        <div className="space-y-2">
          {sortedMembers.map((member, index) => {
            const hasHit5 = member.todayCompletedCount >= 5;
            const remaining = Math.max(0, 5 - member.todayCompletedCount);
            const isMe = member.isCurrentUser;

            return (
              <div
                key={member.id}
                className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/50 shadow-xs'
                    : 'bg-white dark:bg-neutral-900/60 border-neutral-200/90 dark:border-neutral-800 shadow-2xs'
                }`}
              >
                {/* Left: Rank # & Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-5 text-center font-mono font-bold text-xs ${
                    index === 0
                      ? 'text-amber-500 font-extrabold'
                      : index === 1
                      ? 'text-neutral-400 font-bold'
                      : index === 2
                      ? 'text-amber-700 dark:text-amber-600 font-bold'
                      : 'text-neutral-400'
                  }`}>
                    #{index + 1}
                  </span>

                  <div className="relative shrink-0">
                    {member.avatar.startsWith('http') ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
                        {member.name[0]}
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
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      <span>{member.todayCompletedCount}/5 moves</span>
                      <span className="mx-1">·</span>
                      <span>{member.streakDays}d streak</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {hasHit5 ? (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                      Complete 👑
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {remaining} to go
                    </span>
                  )}

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => handleCheerMember(member)}
                      title="Cheer"
                      className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-sm transition modern-press"
                    >
                      💪
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Recent Activity Feed */}
      {activityFeed.length > 0 && (
        <section className="bg-white dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-4 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Recent Squad Activity
          </h4>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {activityFeed.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span className="font-semibold text-neutral-900 dark:text-white truncate">
                    {item.userName}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 truncate">
                    completed {item.routineTitle}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
                  {item.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Friend Dialog */}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-neutral-900 dark:text-white">
            <h3 className="text-base font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              Add Friend to Squad
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Invite friends or coworkers to compete on the 9-to-5 mobility leaderboard.
            </p>

            <form onSubmit={handleCreateFriend} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Friend's Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold modern-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold modern-press"
                >
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
