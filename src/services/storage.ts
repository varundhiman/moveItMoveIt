import { UserProfile, LeaderboardMember, RoutineLog, ActivityFeedItem, WorkdaySlot } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'shiftmove_user_profile_v2',
  ROUTINE_LOGS: 'shiftmove_routine_logs_v2',
  LEADERBOARD_MEMBERS: 'shiftmove_leaderboard_members_v2',
  ACTIVITY_FEED: 'shiftmove_activity_feed_v2',
};

export const WORKDAY_SLOT_DEFS = [
  { slotIndex: 0, startHour: 9, endHour: 10, timeLabel: '9:00 AM – 10:00 AM', shortLabel: '9–10 AM' },
  { slotIndex: 1, startHour: 10, endHour: 11, timeLabel: '10:00 AM – 11:00 AM', shortLabel: '10–11 AM' },
  { slotIndex: 2, startHour: 11, endHour: 12, timeLabel: '11:00 AM – 12:00 PM', shortLabel: '11 AM–12 PM' },
  { slotIndex: 3, startHour: 12, endHour: 13, timeLabel: '12:00 PM – 1:00 PM', shortLabel: '12–1 PM' },
  { slotIndex: 4, startHour: 13, endHour: 14, timeLabel: '1:00 PM – 2:00 PM', shortLabel: '1–2 PM' },
  { slotIndex: 5, startHour: 14, endHour: 15, timeLabel: '2:00 PM – 3:00 PM', shortLabel: '2–3 PM' },
  { slotIndex: 6, startHour: 15, endHour: 16, timeLabel: '3:00 PM – 4:00 PM', shortLabel: '3–4 PM' },
  { slotIndex: 7, startHour: 16, endHour: 17, timeLabel: '4:00 PM – 5:00 PM', shortLabel: '4–5 PM' },
];

// Helper to construct sample ISO dates today
function getTodayIsoAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const INITIAL_USER: UserProfile = {
  id: 'user_me',
  name: 'Varun D.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  streakDays: 4,
  todayRoutinesCount: 2,
  totalPoints: 1250,
  squadCode: 'SQUAD-95-MOVE',
  squadName: 'Desk Breakers 9-to-5',
  reminderIntervalMinutes: 60,
  soundEnabled: true,
  voiceEnabled: true,
  unlockedBadgeIds: ['early_bird', 'streak_3', 'perfect_posture'],
};

export const INITIAL_LOGS: RoutineLog[] = [
  {
    id: 'log_seed_1',
    routineId: 'squats',
    routineTitle: '10 Squats',
    completedAt: getTodayIsoAt(9, 45), // 9:45 AM -> Slot 0 (9-10 AM)
    isWithin9to5: true,
    score: 150,
    formScore: 96,
    durationSeconds: 45,
    slotIndex: 0,
  },
  {
    id: 'log_seed_2',
    routineId: 'pushups',
    routineTitle: '10 Pushups',
    completedAt: getTodayIsoAt(11, 20), // 11:20 AM -> Slot 2 (11-12 PM)
    isWithin9to5: true,
    score: 150,
    formScore: 94,
    durationSeconds: 40,
    slotIndex: 2,
  },
];

export const INITIAL_LEADERBOARD: LeaderboardMember[] = [
  {
    id: 'user_alex',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    todayCompletedCount: 5,
    todayRepsOrMinutes: 50,
    streakDays: 7,
    totalScore: 2150,
    lastActiveTime: '24m ago',
    lastRoutine: '10 Squats',
    cheerCount: 12,
    status: 'online',
  },
  {
    id: 'user_priya',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    todayCompletedCount: 4,
    todayRepsOrMinutes: 40,
    streakDays: 5,
    totalScore: 1820,
    lastActiveTime: '45m ago',
    lastRoutine: '20s Plank Hold',
    cheerCount: 8,
    status: 'online',
  },
  {
    id: 'user_me',
    name: 'Varun D.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isCurrentUser: true,
    todayCompletedCount: 2,
    todayRepsOrMinutes: 20,
    streakDays: 4,
    totalScore: 1250,
    lastActiveTime: '11:20 AM',
    lastRoutine: '10 Pushups',
    cheerCount: 6,
    status: 'active_now',
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    todayCompletedCount: 3,
    todayRepsOrMinutes: 30,
    streakDays: 3,
    totalScore: 1100,
    lastActiveTime: '1h ago',
    lastRoutine: '5 Min Walk',
    cheerCount: 4,
    status: 'away',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    todayCompletedCount: 1,
    todayRepsOrMinutes: 10,
    streakDays: 2,
    totalScore: 680,
    lastActiveTime: '2h ago',
    lastRoutine: '20 Jumping Jacks',
    cheerCount: 2,
    status: 'away',
  },
];

export const INITIAL_ACTIVITY: ActivityFeedItem[] = [
  {
    id: 'act_1',
    userName: 'Alex Chen',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    routineTitle: '10 Squats',
    routineType: 'squats',
    timeAgo: '24m ago',
    timestamp: Date.now() - 24 * 60 * 1000,
    cheers: 4,
  },
  {
    id: 'act_2',
    userName: 'Priya Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    routineTitle: '20s Plank Hold',
    routineType: 'plank',
    timeAgo: '45m ago',
    timestamp: Date.now() - 45 * 60 * 1000,
    cheers: 3,
  },
  {
    id: 'act_3',
    userName: 'Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    routineTitle: '5 Min Walk',
    routineType: 'walk',
    timeAgo: '1h ago',
    timestamp: Date.now() - 65 * 60 * 1000,
    cheers: 2,
  },
];

export const storage = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getRoutineLogs(): RoutineLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINE_LOGS);
      return data ? JSON.parse(data) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  },

  getTodayLogs(allLogs?: RoutineLog[]): RoutineLog[] {
    const logs = allLogs || this.getRoutineLogs();
    const todayStr = new Date().toDateString();
    return logs.filter((l) => new Date(l.completedAt).toDateString() === todayStr);
  },

  /**
   * Computes the 8 workday time slots (9-10, 10-11, ... 4-5 PM).
   * Determines which slots have been completed based on routine timestamps.
   */
  getTodayWorkdaySlots(todayLogs?: RoutineLog[]): {
    slots: WorkdaySlot[];
    completedSlotsCount: number;
    currentSlotIndex: number;
  } {
    const logs = todayLogs || this.getTodayLogs();
    const now = new Date();
    const currentHour = now.getHours();

    let currentSlotIndex = -1;
    if (currentHour >= 9 && currentHour < 17) {
      currentSlotIndex = currentHour - 9;
    }

    const slots: WorkdaySlot[] = WORKDAY_SLOT_DEFS.map((def) => {
      // Find log in this slot
      const logInSlot = logs.find((l) => {
        const d = new Date(l.completedAt);
        const h = d.getHours();
        return h === def.startHour;
      });

      const isCompleted = !!logInSlot;
      const isCurrent = def.slotIndex === currentSlotIndex;
      const isPast = currentHour > def.startHour;

      return {
        ...def,
        isCompleted,
        isCurrent,
        isPast,
        completedLog: logInSlot,
      };
    });

    const completedSlotsCount = slots.filter((s) => s.isCompleted).length;

    return {
      slots,
      completedSlotsCount,
      currentSlotIndex,
    };
  },

  saveRoutineLog(log: RoutineLog): { updatedProfile: UserProfile; updatedMembers: LeaderboardMember[] } {
    const logs = this.getRoutineLogs();
    const logDate = new Date(log.completedAt);
    const hour = logDate.getHours();
    
    // Assign slotIndex if within 9 to 5
    if (hour >= 9 && hour < 17) {
      log.slotIndex = hour - 9;
      log.isWithin9to5 = true;
    } else {
      log.isWithin9to5 = false;
    }

    logs.unshift(log);
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINE_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save routine log', e);
    }

    const todayLogs = this.getTodayLogs(logs);
    const { completedSlotsCount } = this.getTodayWorkdaySlots(todayLogs);

    // Update user profile
    const profile = this.getUserProfile();
    profile.todayRoutinesCount = completedSlotsCount;
    profile.totalPoints += log.score;
    if (completedSlotsCount >= 5 && profile.streakDays < 5) {
      profile.streakDays += 1;
    }
    this.saveUserProfile(profile);

    // Update leaderboard
    const members = this.getLeaderboard();
    const myIndex = members.findIndex((m) => m.isCurrentUser || m.id === profile.id);
    if (myIndex !== -1) {
      members[myIndex] = {
        ...members[myIndex],
        name: profile.name,
        avatar: profile.avatar,
        todayCompletedCount: completedSlotsCount,
        todayRepsOrMinutes: members[myIndex].todayRepsOrMinutes + 10,
        totalScore: profile.totalPoints,
        streakDays: profile.streakDays,
        lastActiveTime: 'Just now',
        lastRoutine: log.routineTitle,
        status: 'active_now',
      };
      this.saveLeaderboard(members);
    }

    // Add activity item
    this.addActivityItem({
      id: `act_${Date.now()}`,
      userName: profile.name,
      userAvatar: profile.avatar,
      routineTitle: log.routineTitle,
      routineType: log.routineId,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      cheers: 0,
    });

    return { updatedProfile: profile, updatedMembers: members };
  },

  getLeaderboard(): LeaderboardMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD_MEMBERS);
      return data ? JSON.parse(data) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  },

  saveLeaderboard(members: LeaderboardMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save leaderboard', e);
    }
  },

  addFriendToLeaderboard(name: string): LeaderboardMember[] {
    const members = this.getLeaderboard();
    const avatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    ];
    const newMember: LeaderboardMember = {
      id: `friend_${Date.now()}`,
      name,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      todayCompletedCount: Math.floor(Math.random() * 3) + 1,
      todayRepsOrMinutes: 20,
      streakDays: 1,
      totalScore: 300,
      lastActiveTime: 'Just joined',
      lastRoutine: '10 Squats',
      cheerCount: 0,
      status: 'online',
    };
    const updated = [...members, newMember];
    this.saveLeaderboard(updated);
    return updated;
  },

  cheerMember(memberId: string): LeaderboardMember[] {
    const members = this.getLeaderboard();
    const updated = members.map((m) => (m.id === memberId ? { ...m, cheerCount: m.cheerCount + 1 } : m));
    this.saveLeaderboard(updated);
    return updated;
  },

  getActivityFeed(): ActivityFeedItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY;
    } catch {
      return INITIAL_ACTIVITY;
    }
  },

  addActivityItem(item: ActivityFeedItem): ActivityFeedItem[] {
    const feed = this.getActivityFeed();
    feed.unshift(item);
    const trimmed = feed.slice(0, 20);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save activity feed', e);
    }
    return trimmed;
  },

  isCurrentlyIn9to5(): { inWindow: boolean; timeRemainingStr: string; currentHour: number } {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const startMinutes = 9 * 60; // 9:00 AM = 540
    const endMinutes = 17 * 60; // 5:00 PM = 1020
    const currentMinutes = hour * 60 + minute;

    const inWindow = currentMinutes >= startMinutes && currentMinutes < endMinutes;

    if (inWindow) {
      const minutesLeft = endMinutes - currentMinutes;
      const hoursLeft = Math.floor(minutesLeft / 60);
      const remainingMinutes = minutesLeft % 60;
      const timeRemainingStr = `${hoursLeft}h ${remainingMinutes}m remaining`;
      return { inWindow, timeRemainingStr, currentHour: hour };
    } else if (currentMinutes < startMinutes) {
      const minutesUntil = startMinutes - currentMinutes;
      const hoursUntil = Math.floor(minutesUntil / 60);
      const remainingMinutes = minutesUntil % 60;
      return {
        inWindow: false,
        timeRemainingStr: `Opens in ${hoursUntil}h ${remainingMinutes}m`,
        currentHour: hour,
      };
    } else {
      return {
        inWindow: false,
        timeRemainingStr: 'Challenge ended at 5:00 PM',
        currentHour: hour,
      };
    }
  },
};
