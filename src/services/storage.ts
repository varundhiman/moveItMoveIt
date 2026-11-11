import { UserProfile, LeaderboardMember, RoutineLog, ActivityFeedItem, WorkdaySlot, PointBreakdown, DaySummary } from '../types';
import { calculateRoutinePoints } from './points';

const STORAGE_KEYS = {
  USER_PROFILE: 'movemates_user_profile_v3',
  ROUTINE_LOGS: 'movemates_routine_logs_v3',
  LEADERBOARD_MEMBERS: 'movemates_leaderboard_members_v3',
  ACTIVITY_FEED: 'movemates_activity_feed_v3',
  ACTIVE_CHALLENGE: 'movemates_active_challenge_v3',
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

function createSeedPastLog(
  id: string,
  daysAgo: number,
  hour: number,
  minute: number,
  routineId: 'squats' | 'pushups' | 'jumping_jacks' | 'plank' | 'walk',
  routineTitle: string,
  formScore: number,
  durationSeconds: number,
  score: number = 5
): RoutineLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);

  return {
    id,
    routineId,
    routineTitle,
    completedAt: d.toISOString(),
    isWithin9to5: true,
    score,
    formScore,
    durationSeconds,
    slotIndex: hour - 9,
    pointsBreakdown: {
      basePoints: 5,
      dailyQuotaBonus: hour === 16 ? 5 : 0,
      streakBonus: hour === 16 ? 2 : 0,
      totalEarned: score,
    },
  };
}

function generateInitialSeedLogs(): RoutineLog[] {
  return [
    // Today (4 slots completed - matching 4/5)
    createSeedPastLog('log_td_1', 0, 9, 18, 'squats', 'Bodyweight Desk Squats', 98, 45, 5),
    createSeedPastLog('log_td_2', 0, 10, 24, 'pushups', 'Desk Push-ups', 96, 42, 5),
    createSeedPastLog('log_td_3', 0, 13, 15, 'walk', '5-Minute Posture Walk', 100, 300, 5),
    createSeedPastLog('log_td_4', 0, 14, 42, 'jumping_jacks', 'Workday Jumping Jacks', 97, 52, 5),

    // 1 day ago (Yesterday - 5 slots completed - Quota Met)
    createSeedPastLog('log_yd_1', 1, 9, 12, 'squats', 'Bodyweight Desk Squats', 97, 44, 5),
    createSeedPastLog('log_yd_2', 1, 10, 30, 'plank', 'Core Desk Plank Hold', 94, 20, 5),
    createSeedPastLog('log_yd_3', 1, 12, 10, 'walk', '5-Minute Posture Walk', 100, 300, 5),
    createSeedPastLog('log_yd_4', 1, 14, 20, 'pushups', 'Desk Push-ups', 95, 48, 5),
    createSeedPastLog('log_yd_5', 1, 16, 15, 'jumping_jacks', 'Workday Jumping Jacks', 98, 50, 12),

    // 2 days ago (5 slots completed - Quota Met)
    createSeedPastLog('log_2d_1', 2, 9, 25, 'pushups', 'Desk Push-ups', 96, 46, 5),
    createSeedPastLog('log_2d_2', 2, 11, 14, 'squats', 'Bodyweight Desk Squats', 98, 42, 5),
    createSeedPastLog('log_2d_3', 2, 13, 5, 'walk', '5-Minute Posture Walk', 100, 300, 5),
    createSeedPastLog('log_2d_4', 2, 14, 50, 'plank', 'Core Desk Plank Hold', 95, 20, 5),
    createSeedPastLog('log_2d_5', 2, 16, 30, 'squats', 'Bodyweight Desk Squats', 99, 45, 12),

    // 3 days ago (5 slots completed - Quota Met)
    createSeedPastLog('log_3d_1', 3, 10, 10, 'squats', 'Bodyweight Desk Squats', 97, 45, 5),
    createSeedPastLog('log_3d_2', 3, 11, 40, 'jumping_jacks', 'Workday Jumping Jacks', 96, 50, 5),
    createSeedPastLog('log_3d_3', 3, 13, 20, 'walk', '5-Minute Posture Walk', 100, 300, 5),
    createSeedPastLog('log_3d_4', 3, 15, 15, 'pushups', 'Desk Push-ups', 94, 50, 5),
    createSeedPastLog('log_3d_5', 3, 16, 45, 'plank', 'Core Desk Plank Hold', 96, 20, 12),

    // 4 days ago (5 slots completed - Challenge Kickoff)
    createSeedPastLog('log_4d_1', 4, 9, 30, 'squats', 'Bodyweight Desk Squats', 95, 48, 5),
    createSeedPastLog('log_4d_2', 4, 11, 15, 'walk', '5-Minute Posture Walk', 100, 300, 5),
    createSeedPastLog('log_4d_3', 4, 13, 10, 'pushups', 'Desk Push-ups', 96, 45, 5),
    createSeedPastLog('log_4d_4', 4, 14, 30, 'jumping_jacks', 'Workday Jumping Jacks', 98, 55, 5),
    createSeedPastLog('log_4d_5', 4, 15, 50, 'plank', 'Core Desk Plank Hold', 97, 20, 10),
  ];
}

export const INITIAL_USER: UserProfile = {
  id: 'user_me',
  name: 'Athlete',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  streakDays: 4,
  todayRoutinesCount: 4,
  totalPoints: 145,
  squadCode: 'MOVE-9TO5',
  squadName: '9-to-5 Workplace Mobility',
  reminderIntervalMinutes: 60,
  soundEnabled: true,
  voiceEnabled: true,
  unlockedBadgeIds: ['first_routine', 'streak_3d'],
};

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
      if (data) {
        return JSON.parse(data);
      }
      const initialSeed = generateInitialSeedLogs();
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTINE_LOGS, JSON.stringify(initialSeed));
      } catch {}
      return initialSeed;
    } catch {
      return generateInitialSeedLogs();
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
      // Find matching log completed within this slot's time window today
      const completedLog = logs.find((l) => {
        const logDate = new Date(l.completedAt);
        const logHour = logDate.getHours();
        return logHour >= def.startHour && logHour < def.endHour;
      });

      const isCompleted = !!completedLog;
      const isCurrent = currentSlotIndex === def.slotIndex;
      const isPast = currentHour >= def.endHour && !isCompleted;

      return {
        slotIndex: def.slotIndex,
        startHour: def.startHour,
        endHour: def.endHour,
        timeLabel: def.timeLabel,
        shortLabel: def.shortLabel,
        isCompleted,
        isCurrent,
        isPast,
        completedLog,
      };
    });

    const completedSlotsCount = slots.filter((s) => s.isCompleted).length;

    return {
      slots,
      completedSlotsCount,
      currentSlotIndex,
    };
  },

  /**
   * Generates aggregated daily summaries for past days with slot distributions and statistics.
   */
  getHistoricDaysSummary(allLogs?: RoutineLog[], targetSlots: number = 5): DaySummary[] {
    const logs = allLogs || this.getRoutineLogs();

    const groups: { [dateKey: string]: RoutineLog[] } = {};
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    // Ensure the last 7 days exist in the map
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (!groups[key]) {
        groups[key] = [];
      }
    }

    logs.forEach((log) => {
      const key = new Date(log.completedAt).toISOString().split('T')[0];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(log);
    });

    const sortedDateKeys = Object.keys(groups).sort().reverse();

    return sortedDateKeys.map((dateKey) => {
      const dayLogs = groups[dateKey];
      const d = new Date(`${dateKey}T12:00:00`);
      const isToday = dateKey === todayKey;
      const isYesterday = dateKey === yesterdayKey;

      const shortDay = d.toLocaleDateString([], { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthStr = d.toLocaleDateString([], { month: 'short' });

      let displayDate = `${shortDay}, ${monthStr} ${dayNumber}`;
      if (isToday) displayDate = `Today · ${shortDay}, ${monthStr} ${dayNumber}`;
      else if (isYesterday) displayDate = `Yesterday · ${shortDay}, ${monthStr} ${dayNumber}`;

      // Calculate slot distribution for 8 workday slots
      const slotDistribution = WORKDAY_SLOT_DEFS.map((def) => {
        const completedLog = dayLogs.find((l) => {
          const logDate = new Date(l.completedAt);
          const logHour = logDate.getHours();
          return logHour >= def.startHour && logHour < def.endHour;
        });

        return {
          slotIndex: def.slotIndex,
          startHour: def.startHour,
          timeLabel: def.timeLabel,
          isCompleted: !!completedLog,
          routineTitle: completedLog?.routineTitle,
        };
      });

      const completedSlotsCount = slotDistribution.filter((s) => s.isCompleted).length;
      const isGoalMet = completedSlotsCount >= targetSlots;
      const totalPoints = dayLogs.reduce((sum, l) => sum + (l.score || 5), 0);
      const totalDurationSeconds = dayLogs.reduce((sum, l) => sum + (l.durationSeconds || 45), 0);
      const averageFormScore = dayLogs.length > 0
        ? Math.round(dayLogs.reduce((sum, l) => sum + (l.formScore || 95), 0) / dayLogs.length)
        : 0;

      return {
        dateStr: dateKey,
        displayDate,
        shortDay,
        dayNumber,
        isToday,
        isYesterday,
        completedSlotsCount,
        targetSlots,
        isGoalMet,
        totalPoints,
        totalDurationSeconds,
        averageFormScore,
        logs: dayLogs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
        slotDistribution,
      };
    });
  },

  /**
   * Checks whether the current local time is within the 9-to-5 workday challenge window.
   */
  isCurrentlyIn9to5(): {
    inWindow: boolean;
    currentSlotName: string;
    timeRemainingStr: string;
  } {
    const now = new Date();
    const hour = now.getHours();
    const inWindow = hour >= 9 && hour < 17;

    let currentSlotName = 'Outside 9–5 Window';
    let timeRemainingStr = 'Starts at 9:00 AM';

    if (inWindow) {
      const slotIndex = hour - 9;
      const def = WORKDAY_SLOT_DEFS[slotIndex];
      currentSlotName = def ? def.timeLabel : 'Active Slot';

      const windowEnd = new Date(now);
      windowEnd.setHours(17, 0, 0, 0);
      const diffMs = Math.max(0, windowEnd.getTime() - now.getTime());
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeRemainingStr = `${hoursLeft}h ${minsLeft}m left`;
    } else if (hour >= 17) {
      timeRemainingStr = 'Window closed (5 PM)';
    }

    return {
      inWindow,
      currentSlotName,
      timeRemainingStr,
    };
  },

  /**
   * Saves a routine log, determines slot index, computes exact points with bonuses, and updates streak
   */
  saveRoutineLog(log: RoutineLog, dailyTargetSlots: number = 5): {
    updatedProfile: UserProfile;
    updatedMembers: LeaderboardMember[];
    pointBreakdown: PointBreakdown;
  } {
    const logs = this.getRoutineLogs();
    const now = new Date(log.completedAt);
    const hour = now.getHours();

    // 1. Measure prior completed slots count
    const priorTodayLogs = this.getTodayLogs(logs);
    const priorSlotInfo = this.getTodayWorkdaySlots(priorTodayLogs);
    const priorCompletedSlotsCount = priorSlotInfo.completedSlotsCount;

    // Determine slot
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

    // 2. Measure new completed slots count
    const updatedTodayLogs = this.getTodayLogs(logs);
    const updatedSlotInfo = this.getTodayWorkdaySlots(updatedTodayLogs);
    const newCompletedSlotsCount = updatedSlotInfo.completedSlotsCount;

    // 3. Compute points using the exact formula
    const profile = this.getUserProfile();
    const pointBreakdown = calculateRoutinePoints({
      priorCompletedSlotsCount,
      newCompletedSlotsCount,
      dailyTargetSlots,
      currentStreakDays: profile.streakDays,
    });

    log.score = pointBreakdown.totalEarned;
    log.pointsBreakdown = pointBreakdown;

    // Update user profile
    profile.todayRoutinesCount = newCompletedSlotsCount;
    profile.totalPoints += pointBreakdown.totalEarned;

    // If quota met for the first time today, increment streak
    if (priorCompletedSlotsCount < dailyTargetSlots && newCompletedSlotsCount >= dailyTargetSlots) {
      profile.streakDays += 1;
    }
    this.saveUserProfile(profile);

    // Update local leaderboard
    const members = this.getLeaderboard();
    const myIndex = members.findIndex((m) => m.isCurrentUser || m.id === profile.id);
    if (myIndex !== -1) {
      members[myIndex] = {
        ...members[myIndex],
        name: profile.name,
        avatar: profile.avatar,
        todayCompletedCount: newCompletedSlotsCount,
        todayActivitiesCount: (members[myIndex].todayActivitiesCount || 0) + 1,
        todayRepsOrMinutes: (members[myIndex].todayRepsOrMinutes || 0) + 10,
        totalScore: profile.totalPoints,
        streakDays: profile.streakDays,
        lastActiveTime: 'Just now',
        lastRoutine: log.routineTitle,
        status: 'active_now',
      };
    } else {
      members.unshift({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        isCurrentUser: true,
        todayCompletedCount: newCompletedSlotsCount,
        todayActivitiesCount: 1,
        todayRepsOrMinutes: 10,
        streakDays: profile.streakDays,
        totalScore: profile.totalPoints,
        lastActiveTime: 'Just now',
        lastRoutine: log.routineTitle,
        cheerCount: 0,
        status: 'active_now',
      });
    }
    this.saveLeaderboard(members);

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
      pointsEarned: pointBreakdown.totalEarned,
    });

    return { updatedProfile: profile, updatedMembers: members, pointBreakdown };
  },

  getLeaderboard(): LeaderboardMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD_MEMBERS);
      if (data) {
        return JSON.parse(data);
      }
      // Start with ONLY the current user (no mock friends!)
      const profile = this.getUserProfile();
      return [
        {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          isCurrentUser: true,
          todayCompletedCount: profile.todayRoutinesCount || 0,
          todayActivitiesCount: 0,
          todayRepsOrMinutes: 0,
          streakDays: profile.streakDays || 0,
          totalScore: profile.totalPoints || 0,
          lastActiveTime: 'Today',
          lastRoutine: 'Ready for routine',
          cheerCount: 0,
          status: 'online',
        },
      ];
    } catch {
      return [];
    }
  },

  saveLeaderboard(members: LeaderboardMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save leaderboard', e);
    }
  },

  getActivityFeed(): ActivityFeedItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addActivityItem(item: ActivityFeedItem): void {
    try {
      const feed = this.getActivityFeed();
      feed.unshift(item);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(feed.slice(0, 50)));
    } catch (e) {
      console.error('Failed to add activity item', e);
    }
  },

  cheerMember(memberId: string): LeaderboardMember[] {
    const members = this.getLeaderboard();
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, cheerCount: (m.cheerCount || 0) + 1 };
      }
      return m;
    });
    this.saveLeaderboard(updated);
    return updated;
  },
};
