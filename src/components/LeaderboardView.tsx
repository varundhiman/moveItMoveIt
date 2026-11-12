import React, { useState } from 'react';
import { LeaderboardMember, UserProfile, Challenge } from '../types';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import {
  Share2,
  Check,
  PlusCircle,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { InviteUsersModal } from './InviteUsersModal';

interface LeaderboardViewProps {
  user: UserProfile;
  challenge: Challenge | null;
  members: LeaderboardMember[];
  onCheer: (memberId: string) => void;
  onCreateChallenge: () => void;
  onJoinChallenge: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  challenge,
  members,
  onCheer,
  onCreateChallenge,
  onJoinChallenge,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { playRepDing } = useAudioFeedback(user.soundEnabled, user.voiceEnabled);

  const targetSlots = challenge?.dailyTargetSlots || 5;
  const inviteCode = challenge?.inviteCode || user.squadCode || 'SQUAD-A9B7';
  const challengeTitle = challenge?.name || user.squadName || 'Workplace Warriors';

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

  const handleShareCode = () => {
    const inviteUrl = `${window.location.origin}?code=${encodeURIComponent(inviteCode)}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Join my MoveMates challenge: ${challengeTitle}`,
          text: `Join our workday mobility squad on MoveMates with code ${inviteCode}!`,
          url: inviteUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
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

  // Calculate squad completion percentage
  const totalCompletedToday = sortedMembers.reduce((sum, m) => sum + m.todayCompletedCount, 0);
  const maxPossibleToday = Math.max(1, sortedMembers.length * targetSlots);
  const squadPercent = Math.min(100, Math.round((totalCompletedToday / maxPossibleToday) * 100));

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto select-none text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 rounded-2xl bg-teal-500 text-neutral-950 px-4 py-2.5 shadow-2xl text-xs font-bold transition flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-neutral-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Section with Join & New Challenge */}
      <div className="pt-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <span>🏃</span>
            <span>MoveMates</span>
          </div>

          {/* Quick Challenge Switch/Create Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onJoinChallenge}
              className="px-3 py-1.5 rounded-full bg-[#16272e] border border-teal-500/30 text-xs font-semibold text-teal-200 hover:bg-teal-950/60 transition modern-press flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Join</span>
            </button>
            <button
              type="button"
              onClick={onCreateChallenge}
              className="px-3 py-1.5 rounded-full bg-teal-500 text-neutral-950 text-xs font-bold transition modern-press flex items-center gap-1 shadow-sm hover:bg-teal-400"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Challenge</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            LEADERBOARD:
          </h1>
          <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Live Challenge Rankings</span>
            <span>🏆</span>
          </div>
        </div>
      </div>

      {/* 2. Active Challenge Card (Styled matching ss3.jpeg) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e2730] via-[#091b22] to-[#06141a] border border-teal-500/30 p-5 shadow-xl relative overflow-hidden">
        {/* Glow accent in top right */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {challengeTitle}
            </h2>
            <p className="text-xs font-medium text-neutral-300 mt-0.5 flex items-center gap-1">
              <span>Goal: {targetSlots} slots/day</span>
              <span>👥</span>
            </p>
          </div>

          {/* Circular progress badge matching screenshot */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-teal-950"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-400"
                  strokeDasharray={`${squadPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-extrabold text-white">
                {squadPercent}%
              </span>
            </div>
            <span className="text-[10px] font-semibold text-neutral-300 mt-0.5">
              {squadPercent}% Full
            </span>
          </div>
        </div>

        {/* Bottom row: Invite Code pill + Invite Users button + Active Challenge badge */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-500/15">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareCode}
              title="Copy or share invite code"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#112d38] hover:bg-[#163a48] border border-teal-400/40 text-xs font-semibold text-neutral-200 transition modern-press"
            >
              <span>Invite Code:</span>
              <span className="font-mono font-bold text-teal-300">{inviteCode}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-teal-400 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/50 text-xs font-bold text-teal-300 transition modern-press"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Invite</span>
            </button>
          </div>

          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <span>Active Challenge</span>
          </div>
        </div>
      </div>

      {/* 3. Compact Point Scoring Card */}
      <div className="rounded-2xl bg-[#0e1d24]/90 border border-neutral-800/80 px-3 py-2 shadow-xs">
        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-0.5">
          <span>Points Guide</span>
          <span className="text-[9px] text-neutral-400 font-medium">(Max: 32+ pts/day)</span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-neutral-700/50 text-center py-0.5">
          <div className="px-1">
            <div className="text-xs font-black text-white">5 PTS</div>
            <div className="text-[10px] text-neutral-300">Routine ✅</div>
          </div>
          <div className="px-1">
            <div className="text-xs font-black text-amber-400">+5 PTS</div>
            <div className="text-[10px] text-neutral-300">Quota ⭐</div>
          </div>
          <div className="px-1">
            <div className="text-xs font-black text-orange-400">+2 PTS</div>
            <div className="text-[10px] text-neutral-300">Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME SQUAD RANKINGS Title */}
      <div className="pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 pl-1">
          REAL-TIME SQUAD RANKINGS
        </h3>
      </div>

      {/* 5. Ranked Members List (Exact styling from ss3.jpeg) */}
      <div className="space-y-3">
        {sortedMembers.map((member, index) => {
          const rankNum = index + 1;
          const isTop1 = rankNum === 1;
          const isTop2 = rankNum === 2;
          const isTop3 = rankNum === 3;
          const isMe = member.isCurrentUser || member.id === user.id;

          const rankColorClass = isTop1
            ? 'text-amber-400'
            : isTop2
            ? 'text-neutral-400'
            : isTop3
            ? 'text-amber-600'
            : 'text-neutral-500';

          return (
            <div
              key={member.id}
              className={`p-3.5 rounded-3xl border transition flex items-center justify-between gap-3 ${
                isMe
                  ? 'bg-[#122830]/90 border-teal-500/40 shadow-md'
                  : 'bg-[#0f1d22]/85 border-neutral-800/80 hover:border-neutral-700/80 shadow-xs'
              }`}
            >
              {/* Left Column: # Rank + Avatar + Name + Stats */}
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 text-base font-black font-mono shrink-0 ${rankColorClass}`}>
                  #{rankNum}
                </span>

                {/* Avatar with circle */}
                <div className="relative shrink-0">
                  {member.avatar && member.avatar.startsWith('http') ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-11 h-11 rounded-full object-cover border border-neutral-700/80"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-teal-900/60 border border-teal-600/40 text-teal-300 font-bold flex items-center justify-center text-sm">
                      {(member.name || 'A')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Middle details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm font-bold text-white truncate">
                      {member.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/30 px-1.5 py-0.2 rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-neutral-300 font-medium flex items-center gap-1 mt-0.5">
                    <span>{member.totalScore || 0} pts</span>
                    <span>🔥</span>
                  </div>

                  <div className="text-xs text-neutral-300 font-medium mt-0.5 flex items-center gap-1">
                    <span>Today: {member.todayCompletedCount}/{targetSlots} Slots</span>
                    <span>{member.todayCompletedCount >= targetSlots ? '✅' : '⏳'}</span>
                  </div>

                  <div className="text-xs text-neutral-300 font-medium mt-0.5 flex items-center gap-1">
                    <span>🔥 {member.streakDays} Day Streak</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Score & CHEER Button */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="text-base sm:text-lg font-black text-amber-400 font-mono tracking-tight">
                  {member.totalScore || 0} PTS
                </div>

                <button
                  type="button"
                  onClick={() => handleCheerMember(member)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wide transition modern-press shadow-sm flex items-center gap-1"
                >
                  <span>CHEER</span>
                  <span>💪</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && challenge && (
        <InviteUsersModal
          challenge={challenge}
          currentUser={user}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={(name) => {
            showToast(`Invite sent to ${name}!`);
          }}
        />
      )}
    </div>
  );
};
