import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Challenge, GroupInvite, UserProfile } from '../types';
import { storage } from './storage';

export const inviteService = {
  /**
   * Send an invitation to another user
   */
  async sendInvite(params: {
    challenge: Challenge;
    inviter: UserProfile;
    targetUserId?: string;
    targetEmail?: string;
    targetName?: string;
  }): Promise<GroupInvite> {
    const user = auth.currentUser;
    const inviterId = user?.uid || params.inviter.id;
    const inviterName = user?.displayName || params.inviter.name || 'Teammate';
    const inviterAvatar = user?.photoURL || params.inviter.avatar || '';

    const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const invite: GroupInvite = {
      id: inviteId,
      challengeId: params.challenge.id,
      challengeName: params.challenge.name,
      dailyTargetSlots: params.challenge.dailyTargetSlots,
      inviteCode: params.challenge.inviteCode,
      inviterId,
      inviterName,
      inviterAvatar,
      targetUserId: params.targetUserId || '',
      targetEmail: params.targetEmail ? params.targetEmail.trim().toLowerCase() : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Always save locally so the invite exists right away
    storage.saveInvite(invite);

    // If user is authenticated, sync to Firestore
    if (user) {
      try {
        const inviteRef = doc(db, 'invitations', inviteId);
        await setDoc(inviteRef, invite);
      } catch (err) {
        console.warn('Could not sync invite to Firestore, kept locally:', err);
      }
    }

    return invite;
  },

  /**
   * Listen for incoming invitations targeting the current user
   */
  listenIncomingInvites(
    userId: string,
    userEmail: string,
    onUpdate: (invites: GroupInvite[]) => void
  ): () => void {
    const user = auth.currentUser;

    // Load initial local pending invites
    const localPending = storage.getPendingInvites().filter((i) => {
      if (i.status !== 'pending') return false;
      // Recipient check: if targetUserId matches or targetEmail matches
      if (i.targetUserId && i.targetUserId === userId) return true;
      if (i.targetEmail && userEmail && i.targetEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      // If neither target is set (open invite created in guest/demo), show it if not created by self
      if (!i.targetUserId && !i.targetEmail && i.inviterId !== userId) return true;
      return false;
    });

    onUpdate(localPending);

    if (!user) {
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'invitations'),
        where('status', '==', 'pending'),
        limit(20)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const cloudInvites: GroupInvite[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as GroupInvite;
            // Filter for this user
            const matchesUid = data.targetUserId && data.targetUserId === user.uid;
            const matchesEmail =
              data.targetEmail &&
              user.email &&
              data.targetEmail.toLowerCase() === user.email.toLowerCase();
            const isOpen = !data.targetUserId && !data.targetEmail && data.inviterId !== user.uid;

            if (matchesUid || matchesEmail || isOpen) {
              cloudInvites.push({ ...data, id: d.id });
              storage.saveInvite({ ...data, id: d.id });
            }
          });

          // Merge local and cloud invites
          const mergedMap = new Map<string, GroupInvite>();
          localPending.forEach((inv) => mergedMap.set(inv.id, inv));
          cloudInvites.forEach((inv) => mergedMap.set(inv.id, inv));

          onUpdate(Array.from(mergedMap.values()).filter((i) => i.status === 'pending'));
        },
        (error) => {
          console.warn('Could not listen to incoming invites:', error);
        }
      );
    } catch {
      return () => {};
    }
  },

  /**
   * Accept or decline an invitation
   */
  async respondToInvite(inviteId: string, status: 'accepted' | 'declined'): Promise<void> {
    storage.updateInviteStatus(inviteId, status);

    const user = auth.currentUser;
    if (user) {
      try {
        const inviteRef = doc(db, 'invitations', inviteId);
        await updateDoc(inviteRef, { status }).catch(() => {});
      } catch (err) {
        console.warn('Failed to update invite in Firestore:', err);
      }
    }
  },

  /**
   * Fetch registered users to invite
   */
  async getPotentialTeammates(currentUserId: string): Promise<Array<{ id: string; name: string; email?: string; avatar?: string }>> {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }

    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const candidates: Array<{ id: string; name: string; email?: string; avatar?: string }> = [];

      usersSnap.forEach((docSnap) => {
        if (docSnap.id !== currentUserId) {
          const data = docSnap.data();
          candidates.push({
            id: docSnap.id,
            name: data.name || 'Coworker',
            email: data.email || '',
            avatar: data.avatar || '',
          });
        }
      });

      return candidates;
    } catch {
      return [];
    }
  },
};
