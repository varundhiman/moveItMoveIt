import React from 'react';
import { GroupInvite } from '../types';
import { Users, Check, X, Sparkles, ArrowRight } from 'lucide-react';

interface HomeInviteBannerProps {
  invites: GroupInvite[];
  onAccept: (invite: GroupInvite) => void;
  onDecline: (inviteId: string) => void;
}

export const HomeInviteBanner: React.FC<HomeInviteBannerProps> = ({
  invites,
  onAccept,
  onDecline,
}) => {
  if (!invites || invites.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900/40 via-cyan-950/40 to-neutral-900 border border-teal-500/40 p-4 shadow-lg text-white"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Challenge Group Invite</span>
                </span>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {invite.inviterName || 'A coworker'} invited you to join{' '}
                  <span className="text-amber-400 font-extrabold underline decoration-amber-400/40">
                    {invite.challengeName}
                  </span>
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDecline(invite.id)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-400 hover:text-white transition modern-press shrink-0"
              title="Decline invite"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-neutral-300 bg-black/30 rounded-2xl px-3 py-2 border border-white/5">
            <div className="flex items-center gap-3">
              <span>
                🎯 <strong>{invite.dailyTargetSlots || 5}</strong> slots/day
              </span>
              <span>•</span>
              <span className="font-mono text-[11px] text-teal-300">
                Code: {invite.inviteCode}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAccept(invite)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-extrabold text-xs transition modern-press flex items-center justify-center gap-1.5 shadow-md shadow-teal-950/40"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Accept & Join Group</span>
            </button>
            <button
              type="button"
              onClick={() => onDecline(invite.id)}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-semibold transition modern-press"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
