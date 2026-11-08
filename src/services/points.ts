import { PointBreakdown } from '../types';

/**
 * Calculates points earned for completing a mobility routine according to the challenge rules:
 * 1. Base: 5 points for every activity completed.
 * 2. Daily Quota Bonus: 5 additional points if this activity achieves today's quota (configurable per challenge).
 * 3. Streak Bonus: 2 additional points if the user has a 3+ day streak of completing daily challenges on the day quota is met.
 */
export function calculateRoutinePoints(params: {
  priorCompletedSlotsCount: number;
  newCompletedSlotsCount: number;
  dailyTargetSlots: number;
  currentStreakDays: number;
}): PointBreakdown {
  const {
    priorCompletedSlotsCount,
    newCompletedSlotsCount,
    dailyTargetSlots,
    currentStreakDays,
  } = params;

  // 1. Every activity completed gives 5 points
  const basePoints = 5;

  // 2. Did this specific activity achieve the daily quota for the first time today?
  const justMetDailyQuota =
    priorCompletedSlotsCount < dailyTargetSlots &&
    newCompletedSlotsCount >= dailyTargetSlots;

  const dailyQuotaBonus = justMetDailyQuota ? 5 : 0;

  // 3. If on a 3+ day streak of completing daily challenges, 2 additional points for the day
  // Effective streak for today includes today's completion (if streak was 2 yesterday, meeting today makes it 3)
  const effectiveStreak = currentStreakDays + (justMetDailyQuota ? 1 : 0);
  const streakBonus = (justMetDailyQuota && (currentStreakDays >= 3 || effectiveStreak >= 3)) ? 2 : 0;

  const totalEarned = basePoints + dailyQuotaBonus + streakBonus;

  let message = `+${basePoints} pts for routine`;
  if (dailyQuotaBonus > 0 && streakBonus > 0) {
    message = `+5 base + 5 Daily Quota Bonus + 2 Streak Bonus (${totalEarned} pts!)`;
  } else if (dailyQuotaBonus > 0) {
    message = `+5 base + 5 Daily Quota Bonus (${totalEarned} pts!)`;
  }

  return {
    basePoints,
    dailyQuotaBonus,
    streakBonus,
    totalEarned,
    message,
  };
}
