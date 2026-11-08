import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Challenge, LeaderboardMember, ActivityFeedItem, RoutineLog, UserProfile, PointBreakdown } from '../types';

export const challengeService = {
  /**
   * Generates a clean, readable invite code (e.g. MOVE-4821)
   */
  generateInviteCode(): string {
    const letters = 'MOVE';
    const nums = Math.floor(1000 + Math.random() * 9000);
    return `${letters}-${nums}`;
  },

  /**
   * Create a new challenge in Firestore
   */
  async createChallenge(params: {
    name: string;
    description: string;
    dailyTargetSlots: number;
    startDate?: string;
    endDate?: string;
    creator: UserProfile;
  }): Promise<Challenge> {
    const user = auth.currentUser;
    const userId = user?.uid || params.creator.id;
    const creatorName = user?.displayName || params.creator.name || 'Anonymous';

    const challengeId = `chal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inviteCode = this.generateInviteCode();

    const todayStr = new Date().toISOString().split('T')[0];
    const challengeData: Challenge = {
      id: challengeId,
      name: params.name.trim(),
      description: params.description.trim() || 'Workday mobility challenge with friends',
      inviteCode,
      dailyTargetSlots: Math.max(1, Math.min(8, params.dailyTargetSlots || 5)),
      createdBy: userId,
      creatorName,
      startDate: params.startDate || todayStr,
      endDate: params.endDate || '',
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await setDoc(challengeRef, challengeData);

      // Add creator as the first member with real starting points
      const memberRef = doc(db, 'challenges', challengeId, 'members', userId);
      const initialMember: LeaderboardMember = {
        id: userId,
        name: creatorName,
        avatar: user?.photoURL || params.creator.avatar,
        isCurrentUser: true,
        todayCompletedCount: params.creator.todayRoutinesCount || 0,
        todayActivitiesCount: 0,
        streakDays: params.creator.streakDays || 0,
        totalScore: params.creator.totalPoints || 0,
        lastActiveTime: 'Just joined',
        lastRoutine: 'Ready to start',
        cheerCount: 0,
        status: 'online',
        joinedAt: new Date().toISOString(),
      };
      await setDoc(memberRef, initialMember);

      // Update creator's profile with active challenge ID
      if (user) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          currentChallengeId: challengeId,
          squadCode: inviteCode,
          squadName: challengeData.name,
          updatedAt: new Date().toISOString(),
        }).catch(() => {
          // Ignore if user profile document not created yet
        });
      }

      return challengeData;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `challenges/${challengeId}`);
      throw error;
    }
  },

  /**
   * Join an existing challenge by its invite code
   */
  async joinChallengeByCode(inviteCode: string, userProfile: UserProfile): Promise<Challenge> {
    const normalizedCode = inviteCode.trim().toUpperCase();
    const user = auth.currentUser;
    const userId = user?.uid || userProfile.id;
    const memberName = user?.displayName || userProfile.name || 'Anonymous';
    const memberAvatar = user?.photoURL || userProfile.avatar;

    try {
      const q = query(
        collection(db, 'challenges'),
        where('inviteCode', '==', normalizedCode),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error(`Challenge with code "${normalizedCode}" not found. Please verify the invite code.`);
      }

      const challengeDoc = snapshot.docs[0];
      const challenge = challengeDoc.data() as Challenge;

      // Add or update user in challenge members
      const memberRef = doc(db, 'challenges', challenge.id, 'members', userId);
      const existingMemberSnap = await getDoc(memberRef);

      if (!existingMemberSnap.exists()) {
        const newMember: LeaderboardMember = {
          id: userId,
          name: memberName,
          avatar: memberAvatar,
          todayCompletedCount: 0,
          todayActivitiesCount: 0,
          streakDays: userProfile.streakDays || 0,
          totalScore: 0,
          lastActiveTime: 'Just joined',
          lastRoutine: 'Joined challenge',
          cheerCount: 0,
          status: 'online',
          joinedAt: new Date().toISOString(),
        };
        await setDoc(memberRef, newMember);

        // Increment challenge member count
        await updateDoc(challengeDoc.ref, {
          memberCount: increment(1),
        });
      }

      // Update user's profile
      if (user) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          currentChallengeId: challenge.id,
          squadCode: challenge.inviteCode,
          squadName: challenge.name,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }

      return challenge;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'challenges');
      throw error;
    }
  },

  /**
   * Fetch a challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<Challenge | null> {
    try {
      const snap = await getDoc(doc(db, 'challenges', challengeId));
      if (!snap.exists()) return null;
      return snap.data() as Challenge;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `challenges/${challengeId}`);
      return null;
    }
  },

  /**
   * Listen to real challenge members in real-time for the leaderboard
   */
  listenChallengeMembers(
    challengeId: string,
    currentUserId: string,
    onUpdate: (members: LeaderboardMember[]) => void
  ): () => void {
    const membersRef = collection(db, 'challenges', challengeId, 'members');
    return onSnapshot(
      membersRef,
      (snapshot) => {
        const members: LeaderboardMember[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LeaderboardMember;
          members.push({
            ...data,
            id: docSnap.id,
            isCurrentUser: docSnap.id === currentUserId,
          });
        });

        // Sort: 1. Total score descending, 2. Today's completed slots descending
        members.sort((a, b) => {
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
          }
          return b.todayCompletedCount - a.todayCompletedCount;
        });

        onUpdate(members);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `challenges/${challengeId}/members`);
      }
    );
  },

  /**
   * Listen to real-time activity feed in a challenge
   */
  listenChallengeActivities(
    challengeId: string,
    onUpdate: (activities: ActivityFeedItem[]) => void
  ): () => void {
    const activitiesRef = collection(db, 'challenges', challengeId, 'activities');
    return onSnapshot(
      activitiesRef,
      (snapshot) => {
        const items: ActivityFeedItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const timestamp = d.completedAt ? new Date(d.completedAt).getTime() : Date.now();
          const minutesAgo = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
          const timeAgo = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`;

          items.push({
            id: docSnap.id,
            userId: d.userId,
            userName: d.userName || 'Teammate',
            userAvatar: d.userAvatar || '',
            routineTitle: d.routineTitle || 'Mobility routine',
            routineType: d.routineId || 'squats',
            timeAgo,
            timestamp,
            cheers: d.cheers || 0,
            pointsEarned: d.pointsEarned || 5,
          });
        });

        // Sort descending by timestamp
        items.sort((a, b) => b.timestamp - a.timestamp);
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `challenges/${challengeId}/activities`);
      }
    );
  },

  /**
   * Record a verified activity, allot points according to point system, and update real member score
   */
  async recordActivity(params: {
    challengeId: string;
    user: UserProfile;
    log: RoutineLog;
    pointBreakdown: PointBreakdown;
    newCompletedSlotsCount: number;
    newStreakDays: number;
  }): Promise<void> {
    const { challengeId, user, log, pointBreakdown, newCompletedSlotsCount, newStreakDays } = params;
    const authUser = auth.currentUser;
    const userId = authUser?.uid || user.id;
    const userName = authUser?.displayName || user.name || 'You';
    const userAvatar = authUser?.photoURL || user.avatar;

    try {
      // 1. Post to challenge activity feed
      const activityRef = doc(collection(db, 'challenges', challengeId, 'activities'));
      await setDoc(activityRef, {
        id: activityRef.id,
        userId,
        userName,
        userAvatar,
        routineId: log.routineId,
        routineTitle: log.routineTitle,
        completedAt: log.completedAt,
        isWithin9to5: log.isWithin9to5,
        slotIndex: log.slotIndex ?? 0,
        pointsEarned: pointBreakdown.totalEarned,
        durationSeconds: log.durationSeconds,
        cheers: 0,
      });

      // 2. Update member's real score and streak in this challenge
      const memberRef = doc(db, 'challenges', challengeId, 'members', userId);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) {
        await updateDoc(memberRef, {
          totalScore: increment(pointBreakdown.totalEarned),
          todayCompletedCount: newCompletedSlotsCount,
          todayActivitiesCount: increment(1),
          streakDays: newStreakDays,
          lastRoutine: log.routineTitle,
          lastActiveTime: 'Just now',
        });
      } else {
        // Create member record if not yet exists
        await setDoc(memberRef, {
          id: userId,
          name: userName,
          avatar: userAvatar,
          totalScore: pointBreakdown.totalEarned,
          todayCompletedCount: newCompletedSlotsCount,
          todayActivitiesCount: 1,
          streakDays: newStreakDays,
          lastRoutine: log.routineTitle,
          lastActiveTime: 'Just now',
          cheerCount: 0,
          status: 'online',
          joinedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `challenges/${challengeId}`);
      throw error;
    }
  },

  /**
   * Send a cheer to a challenge member
   */
  async cheerMember(challengeId: string, memberUserId: string): Promise<void> {
    try {
      const memberRef = doc(db, 'challenges', challengeId, 'members', memberUserId);
      await updateDoc(memberRef, {
        cheerCount: increment(1),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `challenges/${challengeId}/members/${memberUserId}`);
      throw error;
    }
  },
};
