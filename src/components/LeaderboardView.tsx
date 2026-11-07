import React, { useState } from 'react';
import { LeaderboardMember, ActivityFeedItem, UserProfile } from '../types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import {
  Trophy,
  Flame,
  UserPlus,
  CheckCircle2,
  Bell,
  Copy,
  Check,
  Users,
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

  const top3 = sortedMembers.slice(0, 3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}?squad=${encodeURIComponent(user.squadCode)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        showToast('Invite link copied to clipboard.');
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      showToast(`Challenge Code: ${user.squadCode}`);
    }
  };

  const handleCheerMember = (member: LeaderboardMember) => {
    onCheer(member.id);
    playRepDing();
    showToast(`Sent cheer to ${member.name}!`);
  };

  const handleNudgeMember = (member: LeaderboardMember) => {
    playRepDing();
    showToast(`Nudge sent to ${member.name} to hit today’s 5 slots.`);
  };

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;
    onAddFriend(friendName.trim());
    showToast(`Added ${friendName.trim()} to the challenge leaderboard.`);
    setFriendName('');
    setShowAddFriend(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700 text-white px-4 py-3 shadow-xl text-xs font-semibold">
          {toastMessage}
        </div>
      )}

      {/* Squad Overview */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.squadName}</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {user.squadCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Everyday between 9 AM and 5 PM: complete at least 5 hourly mobility slots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-750"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Invite'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddFriend(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friend</span>
            </button>
          </div>
        </div>
      </section>

      {/* Top 3 Standings */}
      <div className="grid grid-cols-3 gap-3">
        {top3.map((member, idx) => {
          const ranks = ['1st', '2nd', '3rd'];
          return (
            <div
              key={member.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-sm"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {ranks[idx]}
              </span>

              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full mx-auto object-cover ring-2 ring-slate-800"
              />

              <h4 className="mt-2.5 font-bold text-xs text-white truncate">
                {member.name}
              </h4>

              <div className="mt-1.5 text-xs font-mono font-bold text-emerald-400">
                {member.todayCompletedCount}/5 Slots
              </div>

              <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-amber-400">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{member.streakDays}d streak</span>
              </div>

              {!member.isCurrentUser && (
                <button
                  type="button"
                  onClick={() => handleCheerMember(member)}
                  className="mt-3 w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-medium transition"
                >
                  Cheer ({member.cheerCount})
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete Rankings List */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today's Rankings
          </h4>
          <span className="text-xs text-slate-500">Goal: 5 Slots before 5 PM</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {sortedMembers.map((member, index) => {
            const hasHit5 = member.todayCompletedCount >= 5;

            return (
              <div
                key={member.id}
                className={`p-4 flex items-center justify-between gap-3 ${
                  member.isCurrentUser ? 'bg-slate-850/60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-mono text-xs font-semibold text-slate-500">
                    {index + 1}
                  </span>

                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{member.name}</span>
                      {member.isCurrentUser && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {member.lastRoutine} · {member.lastActiveTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {member.todayCompletedCount} of 5
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {hasHit5 ? 'Goal complete' : 'In progress'}
                    </div>
                  </div>

                  {!member.isCurrentUser && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCheerMember(member)}
                        title="Send Cheer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition"
                      >
                        💪
                      </button>

                      {!hasHit5 && (
                        <button
                          type="button"
                          onClick={() => handleNudgeMember(member)}
                          title="Nudge to move"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-amber-400 transition"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Feed */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Recent Squad Activity
        </h4>

        <div className="space-y-2.5">
          {activityFeed.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs py-1.5 text-slate-300"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={item.userAvatar}
                  alt={item.userName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>
                  <strong className="text-white">{item.userName}</strong> completed {item.routineTitle}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{item.timeAgo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Add Friend Dialog */}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl text-slate-200">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Add Friend to Challenge
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Invite friends or coworkers to compete on the 9-to-5 mobility leaderboard.
            </p>

            <form onSubmit={handleCreateFriend} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Friend's Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-750 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
