export type RoutineType = 'squats' | 'pushups' | 'jumping_jacks' | 'plank' | 'walk';

export interface MobilityRoutine {
  id: RoutineType;
  title: string;
  targetCount: number;
  unit: 'reps' | 'seconds' | 'minutes';
  description: string;
  deskBenefit: string;
  iconName: string;
  targetAnglesGuide: string;
  instructions: string[];
}

export interface RoutineLog {
  id: string;
  routineId: RoutineType;
  routineTitle: string;
  completedAt: string; // ISO string
  isWithin9to5: boolean;
  score: number; // Points earned (5 base + potential 5 quota bonus + 2 streak bonus)
  formScore: number; // 0-100%
  durationSeconds: number;
  slotIndex?: number; // 0 to 7 (corresponds to 9-10, 10-11, ... 16-17)
  challengeId?: string;
  pointsBreakdown?: PointBreakdown;
}

export interface PointBreakdown {
  basePoints: number; // 5 pts per routine
  dailyQuotaBonus: number; // 5 pts if quota met for today
  streakBonus: number; // 2 pts if streak >= 3 days when quota met
  totalEarned: number;
  message?: string;
}

export interface WorkdaySlot {
  slotIndex: number; // 0 to 7
  startHour: number; // 9, 10, ... 16
  endHour: number; // 10, 11, ... 17
  timeLabel: string; // "9:00 AM – 10:00 AM"
  shortLabel: string; // "9–10 AM"
  isCompleted: boolean;
  isCurrent: boolean;
  isPast: boolean;
  completedLog?: RoutineLog;
}

export interface DigitalBadge {
  id: string;
  title: string;
  category: 'streak' | 'timing' | 'completion' | 'mastery';
  description: string;
  requirement: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  dailyTargetSlots: number; // Configurable daily activity quota, e.g. 3, 5, etc.
  createdBy: string;
  creatorName: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  todayRoutinesCount: number;
  totalPoints: number;
  currentChallengeId?: string;
  squadCode: string;
  squadName: string;
  reminderIntervalMinutes: number;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  unlockedBadgeIds?: string[];
}

export interface LeaderboardMember {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser?: boolean;
  todayCompletedCount: number; // Number of unique slots completed today
  todayActivitiesCount?: number; // Total routines completed today
  todayRepsOrMinutes?: number;
  streakDays: number;
  totalScore: number;
  lastActiveTime: string;
  lastRoutine: string;
  cheerCount: number;
  status: 'online' | 'active_now' | 'away';
  badgeCount?: number;
  joinedAt?: string;
}

export interface ActivityFeedItem {
  id: string;
  userId?: string;
  userName: string;
  userAvatar: string;
  routineTitle: string;
  routineType: RoutineType;
  timeAgo: string;
  timestamp: number;
  cheers: number;
  pointsEarned?: number;
}

export interface Point2D {
  x: number;
  y: number;
  confidence?: number;
}

export interface SkeletonPose {
  nose?: Point2D;
  leftShoulder?: Point2D;
  rightShoulder?: Point2D;
  leftElbow?: Point2D;
  rightElbow?: Point2D;
  leftWrist?: Point2D;
  rightWrist?: Point2D;
  leftHip?: Point2D;
  rightHip?: Point2D;
  leftKnee?: Point2D;
  rightKnee?: Point2D;
  leftAnkle?: Point2D;
  rightAnkle?: Point2D;
}

export interface FormFeedback {
  status: 'good' | 'warning' | 'adjust' | 'waiting';
  message: string;
  depthScore: number; // 0-100%
  angle?: number;
}
