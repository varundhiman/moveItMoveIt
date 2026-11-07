import { DigitalBadge, RoutineLog, UserProfile } from '../types';
import { BADGE_DEFINITIONS } from '../data/badges';

export interface EvaluationResult {
  allBadges: DigitalBadge[];
  newlyUnlockedBadges: DigitalBadge[];
  unlockedBadgeIds: string[];
}

export function evaluateBadges(
  profile: UserProfile,
  todayLogs: RoutineLog[],
  allLogs: RoutineLog[],
  currentCompletedSlotsCount: number
): EvaluationResult {
  const previouslyUnlocked = new Set(profile.unlockedBadgeIds || []);
  const newlyUnlocked: DigitalBadge[] = [];

  // Metrics calculation
  const hasEarlyBird = allLogs.some((l) => {
    const d = new Date(l.completedAt);
    const h = d.getHours();
    return h >= 9 && h < 10;
  });

  const uniqueRoutineTypes = new Set(allLogs.map((l) => l.routineId));
  const hasAllFiveRoutines = ['squats', 'pushups', 'jumping_jacks', 'plank', 'walk'].every((t) =>
    uniqueRoutineTypes.has(t as RoutineLog['routineId'])
  );

  const totalRepsEstimated = allLogs.reduce((acc, l) => {
    if (l.routineId === 'squats' || l.routineId === 'pushups') return acc + 10;
    if (l.routineId === 'jumping_jacks') return acc + 20;
    if (l.routineId === 'plank') return acc + 20;
    if (l.routineId === 'walk') return acc + 50;
    return acc + 10;
  }, 0);

  const hasPerfectPosture = allLogs.some((l) => (l.formScore || 0) >= 95);

  const allBadges: DigitalBadge[] = BADGE_DEFINITIONS.map((def) => {
    let isUnlocked = previouslyUnlocked.has(def.id);
    let current = 0;
    let target = 1;

    switch (def.id) {
      case 'early_bird':
        target = 1;
        current = hasEarlyBird ? 1 : 0;
        if (hasEarlyBird) isUnlocked = true;
        break;

      case 'workday_warrior_5':
        target = 5;
        current = Math.min(5, currentCompletedSlotsCount);
        if (currentCompletedSlotsCount >= 5) isUnlocked = true;
        break;

      case 'streak_3':
        target = 3;
        current = Math.min(3, profile.streakDays);
        if (profile.streakDays >= 3) isUnlocked = true;
        break;

      case 'streak_7':
        target = 7;
        current = Math.min(7, profile.streakDays);
        if (profile.streakDays >= 7) isUnlocked = true;
        break;

      case 'all_rounder':
        target = 5;
        current = uniqueRoutineTypes.size;
        if (hasAllFiveRoutines) isUnlocked = true;
        break;

      case 'century_club':
        target = 100;
        current = Math.min(100, totalRepsEstimated);
        if (totalRepsEstimated >= 100) isUnlocked = true;
        break;

      case 'perfect_posture':
        target = 1;
        current = hasPerfectPosture ? 1 : 0;
        if (hasPerfectPosture) isUnlocked = true;
        break;
    }

    const badge: DigitalBadge = {
      ...def,
      isUnlocked,
      progress: { current, target },
      unlockedAt: isUnlocked ? (previouslyUnlocked.has(def.id) ? 'Earned' : 'Just now') : undefined,
    };

    if (isUnlocked && !previouslyUnlocked.has(def.id)) {
      newlyUnlocked.push(badge);
    }

    return badge;
  });

  const updatedUnlockedIds = allBadges.filter((b) => b.isUnlocked).map((b) => b.id);

  return {
    allBadges,
    newlyUnlockedBadges: newlyUnlocked,
    unlockedBadgeIds: updatedUnlockedIds,
  };
}
