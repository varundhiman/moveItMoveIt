import React, { useState, useEffect } from 'react';
import { X, UserPlus, Copy, Check, Mail, Send, Sparkles, Users } from 'lucide-react';
import { Challenge, UserProfile } from '../types';
import { inviteService } from '../services/inviteService';
import { auth } from '../services/firebase';

interface InviteUsersModalProps {
  challenge: Challenge;
  currentUser: UserProfile;
  onClose: () => void;
  onInviteSent?: (recipient: string) => void;
}

export const InviteUsersModal: React.FC<InviteUsersModalProps> = ({
  challenge,
  currentUser,
  onClose,
  onInviteSent,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [invitedList, setInvitedList] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [teammates, setTeammates] = useState<Array<{ id: string; name: string; email?: string; avatar?: string }>>([]);

  const currentUserId = auth.currentUser?.uid || currentUser.id;

  useEffect(() => {
    async function fetchTeammates() {
      const candidates = await inviteService.getPotentialTeammates(currentUserId);
      setTeammates(candidates);
    }
    fetchTeammates();
  }, [currentUserId]);

  const handleCopyCode = () => {
    const inviteUrl = `${window.location.origin}?code=${encodeURIComponent(challenge.inviteCode)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSending(true);
    try {
      await inviteService.sendInvite({
        challenge,
        inviter: currentUser,
        targetEmail: emailInput.trim(),
        targetName: emailInput.split('@')[0],
      });

      setInvitedList((prev) => [...prev, emailInput.trim()]);
      setSuccessMsg(`Invite sent to ${emailInput.trim()}! They will see it on their home screen.`);
      onInviteSent?.(emailInput.trim());
      setEmailInput('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleInviteTeammate = async (teammate: { id: string; name: string; email?: string }) => {
    try {
      await inviteService.sendInvite({
        challenge,
        inviter: currentUser,
        targetUserId: teammate.id,
        targetEmail: teammate.email,
        targetName: teammate.name,
      });

      setInvitedList((prev) => [...prev, teammate.id]);
      setSuccessMsg(`Invite sent to ${teammate.name}!`);
      onInviteSent?.(teammate.name);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-900 dark:text-white max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Invite Coworkers & Friends
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                To group: <strong className="text-neutral-800 dark:text-neutral-200">{challenge.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition modern-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Share Link & Invite Code Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent border border-teal-500/30 dark:border-teal-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-600 dark:text-neutral-300">
              Shareable Squad Code
            </span>
            <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
              {challenge.inviteCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition modern-press flex items-center justify-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </div>

        {/* Send Direct Invite by Email */}
        <form onSubmit={handleSendEmailInvite} className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Invite by Email or Username
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="coworker@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !emailInput.trim()}
              className="py-2.5 px-4 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold transition modern-press disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            When they open MoveMates, an invite banner will pop up directly on their home screen to join.
          </p>
        </form>

        {/* Registered Teammates List */}
        {teammates.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Coworkers on MoveMates</span>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {teammates.map((teammate) => {
                const isAlreadyInvited = invitedList.includes(teammate.id);
                return (
                  <div
                    key={teammate.id}
                    className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {(teammate.name || 'C')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-neutral-900 dark:text-white truncate">
                          {teammate.name}
                        </div>
                        {teammate.email && (
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                            {teammate.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyInvited}
                      onClick={() => handleInviteTeammate(teammate)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition modern-press shrink-0 ${
                        isAlreadyInvited
                          ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      {isAlreadyInvited ? 'Invited ✓' : '+ Invite'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
