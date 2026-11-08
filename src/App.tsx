/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  MobilityRoutine,
  LeaderboardMember,
  RoutineLog,
  ActivityFeedItem,
  DigitalBadge,
  Challenge,
  PointBreakdown,
} from './types';
import { MOBILITY_ROUTINES } from './data/routines';
import { storage } from './services/storage';
import { challengeService } from './services/challengeService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { db } from './services/firebase';
import { doc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { evaluateBadges } from './services/achievements';
import { Header } from './components/Header';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { WorkdayRoutineTracker } from './components/WorkdayRoutineTracker';
import { PickMoveView } from './components/PickMoveView';
import { LeaderboardView } from './components/LeaderboardView';
import { BadgesView } from './components/BadgesView';
import { CameraTrackerModal } from './components/CameraTrackerModal';
import { WalkTrackerModal } from './components/WalkTrackerModal';
import { StorePublishModal } from './components/StorePublishModal';
import { AuthModal } from './components/AuthModal';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { CreateChallengeModal } from './components/CreateChallengeModal';
import { JoinChallengeModal } from './components/JoinChallengeModal';
import { PointsEarnedModal } from './components/PointsEarnedToast';
import { OfflineIndicator } from './components/OfflineIndicator';

function AppContent() {
  const { profile, firebaseUser, updateUserProfile } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [members, setMembers] = useState<LeaderboardMember[]>(() => storage.getLeaderboard());
  const [allLogs, setAllLogs] = useState<RoutineLog[]>(() => storage.getRoutineLogs());
  const [todayLogs, setTodayLogs] = useState<RoutineLog[]>(() => storage.getTodayLogs());
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(() => storage.getActivityFeed());

  const [activeTab, setActiveTab] = useState<NavTab>('radar');
  const [activeWorkout, setActiveWorkout] = useState<MobilityRoutine | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showJoinChallengeModal, setShowJoinChallengeModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [latestUnlockedBadge, setLatestUnlockedBadge] = useState<DigitalBadge | null>(null);
  const [earnedPointsData, setEarnedPointsData] = useState<{
    routineTitle: string;
    breakdown: PointBreakdown;
  } | null>(null);

  // Live 9-to-5 window & slot calculation
  const [windowInfo, setWindowInfo] = useState(() => storage.isCurrentlyIn9to5());
  const [slotData, setSlotData] = useState(() => storage.getTodayWorkdaySlots());

  // Evaluate current digital badges
  const currentBadgeEval = evaluateBadges(
    profile,
    todayLogs,
    allLogs,
    slotData.completedSlotsCount
  );
  const [badges, setBadges] = useState<DigitalBadge[]>(currentBadgeEval.allBadges);

  // 1. Check for URL invite code param on mount (e.g. ?code=MOVE-1234 or ?squad=MOVE-1234)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || params.get('squad');
      if (codeFromUrl) {
        setJoinInviteCode(codeFromUrl.toUpperCase());
        setShowJoinChallengeModal(true);
        // Clean query param
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // 2. Fetch or initialize active challenge
  useEffect(() => {
    let isMounted = true;
    async function loadChallenge() {
      const challengeId = profile.currentChallengeId;
      if (challengeId) {
        const found = await challengeService.getChallengeById(challengeId);
        if (found && isMounted) {
          setActiveChallenge(found);
          return;
        }
      }

      // If user has a squad code, try finding that challenge
      if (profile.squadCode) {
        try {
          const found = await challengeService.joinChallengeByCode(profile.squadCode, profile);
          if (found && isMounted) {
            setActiveChallenge(found);
            return;
          }
        } catch {
          // If code not in database, fallback below
        }
      }

      // Default challenge for new users
      if (isMounted) {
        setActiveChallenge({
          id: 'chal_default_workday',
          name: profile.squadName || '9-to-5 Workplace Mobility',
          description: 'Daily workplace mobility challenge with real-time scoring and streaks.',
          inviteCode: profile.squadCode || 'MOVE-9TO5',
          dailyTargetSlots: 5,
          createdBy: profile.id,
          creatorName: profile.name,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          memberCount: members.length,
          createdAt: new Date().toISOString(),
        });
      }
    }

    loadChallenge();
    return () => {
      isMounted = false;
    };
  }, [profile.currentChallengeId, profile.squadCode]);

  // 3. Real-time Firestore sync for Members & Activities when in a challenge
  useEffect(() => {
    if (!activeChallenge || !activeChallenge.id || activeChallenge.id === 'chal_default_workday') {
      return;
    }

    const currentUserId = firebaseUser?.uid || profile.id;

    // Listen to real-time members
    const unsubscribeMembers = challengeService.listenChallengeMembers(
      activeChallenge.id,
      currentUserId,
      (liveMembers) => {
        setMembers(liveMembers);
        storage.saveLeaderboard(liveMembers);
      }
    );

    // Listen to real-time activities
    const unsubscribeActivities = challengeService.listenChallengeActivities(
      activeChallenge.id,
      (liveActivities) => {
        setActivityFeed(liveActivities);
      }
    );

    return () => {
      unsubscribeMembers();
      unsubscribeActivities();
    };
  }, [activeChallenge?.id, firebaseUser?.uid, profile.id]);

  // 4. Update timer for 9-to-5 window
  useEffect(() => {
    const timer = setInterval(() => {
      setWindowInfo(storage.isCurrentlyIn9to5());
      setSlotData(storage.getTodayWorkdaySlots());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const updated = { ...profile, soundEnabled: !profile.soundEnabled };
    updateUserProfile(updated);
  };

  const handleSelectRoutineToTrack = (routine: MobilityRoutine) => {
    setActiveWorkout(routine);
  };

  const handleRoutineCompleted = async (log: RoutineLog) => {
    const targetSlots = activeChallenge?.dailyTargetSlots || 5;
    const { updatedProfile, updatedMembers, pointBreakdown } = storage.saveRoutineLog(log, targetSlots);
    const updatedAllLogs = storage.getRoutineLogs();
    const updatedTodayLogs = storage.getTodayLogs(updatedAllLogs);
    const updatedSlots = storage.getTodayWorkdaySlots(updatedTodayLogs);

    setMembers(updatedMembers);
    setAllLogs(updatedAllLogs);
    setTodayLogs(updatedTodayLogs);
    setSlotData(updatedSlots);
    setActivityFeed(storage.getActivityFeed());
    setActiveWorkout(null);

    // Show celebration modal with exact points breakdown
    setEarnedPointsData({
      routineTitle: log.routineTitle,
      breakdown: pointBreakdown,
    });

    // Evaluate badges
    const badgeEval = evaluateBadges(
      updatedProfile,
      updatedTodayLogs,
      updatedAllLogs,
      updatedSlots.completedSlotsCount
    );

    setBadges(badgeEval.allBadges);

    if (badgeEval.newlyUnlockedBadges.length > 0) {
      setLatestUnlockedBadge(badgeEval.newlyUnlockedBadges[0]);
      updatedProfile.unlockedBadgeIds = badgeEval.unlockedBadgeIds;
      storage.saveUserProfile(updatedProfile);
      updateUserProfile({ unlockedBadgeIds: badgeEval.unlockedBadgeIds });
    }

    // Record activity in Firestore challenge if connected to a challenge
    if (activeChallenge && activeChallenge.id !== 'chal_default_workday') {
      try {
        await challengeService.recordActivity({
          challengeId: activeChallenge.id,
          user: updatedProfile,
          log,
          pointBreakdown,
          newCompletedSlotsCount: updatedSlots.completedSlotsCount,
          newStreakDays: updatedProfile.streakDays,
        });
      } catch (err) {
        console.warn('Failed to record activity in challenge:', err);
      }
    }

    // Sync to user's personal logs in Firestore if authenticated
    if (firebaseUser) {
      try {
        const logDocRef = doc(collection(db, 'users', firebaseUser.uid, 'logs'));
        await setDoc(logDocRef, {
          userId: firebaseUser.uid,
          challengeId: activeChallenge?.id || null,
          routineId: log.routineId,
          routineTitle: log.routineTitle,
          completedAt: log.completedAt,
          isWithin9to5: log.isWithin9to5,
          slotIndex: log.slotIndex ?? 0,
          score: pointBreakdown.totalEarned,
          pointsBreakdown: pointBreakdown,
          formScore: log.formScore,
          durationSeconds: log.durationSeconds,
          createdAt: new Date().toISOString(),
        });

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userDocRef, {
          todaySlotsCount: updatedSlots.completedSlotsCount,
          totalPoints: updatedProfile.totalPoints,
          streakDays: updatedProfile.streakDays,
          lastRoutine: log.routineTitle,
          unlockedBadgeIds: badgeEval.unlockedBadgeIds,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to persist log to Firestore user doc:', err);
      }
    }
  };

  const handleCheerMember = async (memberId: string) => {
    // 1. Optimistic local update
    const updated = storage.cheerMember(memberId);
    setMembers(updated);

    // 2. Real Firestore sync
    if (activeChallenge && activeChallenge.id !== 'chal_default_workday') {
      try {
        await challengeService.cheerMember(activeChallenge.id, memberId);
      } catch (err) {
        console.warn('Failed to cheer member in Firestore:', err);
      }
    }
  };

  const handleChallengeCreated = (newChallenge: Challenge) => {
    setActiveChallenge(newChallenge);
    updateUserProfile({
      currentChallengeId: newChallenge.id,
      squadCode: newChallenge.inviteCode,
      squadName: newChallenge.name,
    });
    setActiveTab('ranks');
  };

  const handleChallengeJoined = (joinedChallenge: Challenge) => {
    setActiveChallenge(joinedChallenge);
    updateUserProfile({
      currentChallengeId: joinedChallenge.id,
      squadCode: joinedChallenge.inviteCode,
      squadName: joinedChallenge.name,
    });
    setActiveTab('ranks');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#0B0D13] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-amber-400/30 transition-colors">
      <OfflineIndicator />

      {/* Mobile Shell Wrapper with crisp borders for desktop viewing */}
      <div className="w-full max-w-md sm:max-w-lg mx-auto bg-[#FAF7F0] dark:bg-[#0B0D13] min-h-screen flex flex-col sm:border-x sm:border-neutral-200/80 dark:sm:border-neutral-800/80 sm:shadow-2xl relative transition-colors">
        {/* Top Header with MoveMates wordmark, streak, audio, and [ME] badge */}
        <Header
          user={profile}
          completedSlotsCount={slotData.completedSlotsCount}
          onOpenStoreModal={() => setShowStoreModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onToggleSound={handleToggleSound}
        />

        {/* Main View Area */}
        <main className="flex-1 px-4 py-5 sm:px-6">
          {activeTab === 'radar' && (
            <WorkdayRoutineTracker
              slots={slotData.slots}
              completedSlotsCount={slotData.completedSlotsCount}
              todayLogs={todayLogs}
              inWindow={windowInfo.inWindow}
              timeRemainingStr={windowInfo.timeRemainingStr}
              dailyTargetSlots={activeChallenge?.dailyTargetSlots || 5}
              challengeName={activeChallenge?.name}
              onStartMove={() => setActiveTab('moves')}
            />
          )}

          {activeTab === 'moves' && (
            <PickMoveView
              routines={MOBILITY_ROUTINES}
              onSelectRoutine={handleSelectRoutineToTrack}
              onBackToRadar={() => setActiveTab('radar')}
            />
          )}

          {activeTab === 'ranks' && (
            <LeaderboardView
              user={profile}
              challenge={activeChallenge}
              members={members}
              activityFeed={activityFeed}
              onCheer={handleCheerMember}
              onCreateChallenge={() => setShowCreateChallengeModal(true)}
              onJoinChallenge={() => {
                setJoinInviteCode('');
                setShowJoinChallengeModal(true);
              }}
            />
          )}

          {activeTab === 'badges' && <BadgesView badges={badges} />}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          completedSlotsCount={slotData.completedSlotsCount}
        />
      </div>

      {/* Camera Workout Tracker Modal */}
      {activeWorkout && activeWorkout.id !== 'walk' && (
        <CameraTrackerModal
          routine={activeWorkout}
          isWithin9to5={windowInfo.inWindow}
          soundEnabled={profile.soundEnabled}
          voiceEnabled={profile.voiceEnabled}
          onClose={() => setActiveWorkout(null)}
          onComplete={handleRoutineCompleted}
        />
      )}

      {/* Walk Tracker Modal */}
      {activeWorkout && activeWorkout.id === 'walk' && (
        <WalkTrackerModal
          routine={activeWorkout}
          isWithin9to5={windowInfo.inWindow}
          soundEnabled={profile.soundEnabled}
          voiceEnabled={profile.voiceEnabled}
          onClose={() => setActiveWorkout(null)}
          onComplete={handleRoutineCompleted}
        />
      )}

      {/* App Stores & Netlify Hosting Guide Modal */}
      {showStoreModal && (
        <StorePublishModal onClose={() => setShowStoreModal(false)} />
      )}

      {/* User Management & Google Login Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Create Challenge Modal */}
      {showCreateChallengeModal && (
        <CreateChallengeModal
          user={profile}
          onClose={() => setShowCreateChallengeModal(false)}
          onCreated={handleChallengeCreated}
        />
      )}

      {/* Join Challenge Modal */}
      {showJoinChallengeModal && (
        <JoinChallengeModal
          user={profile}
          initialCode={joinInviteCode}
          onClose={() => setShowJoinChallengeModal(false)}
          onJoined={handleChallengeJoined}
        />
      )}

      {/* Real-time Points Earned Celebration Modal */}
      {earnedPointsData && (
        <PointsEarnedModal
          routineTitle={earnedPointsData.routineTitle}
          breakdown={earnedPointsData.breakdown}
          onDismiss={() => {
            setEarnedPointsData(null);
            setActiveTab('ranks');
          }}
        />
      )}

      {/* Badge Unlock Celebration Modal */}
      {latestUnlockedBadge && (
        <BadgeUnlockModal
          badge={latestUnlockedBadge}
          onClose={() => setLatestUnlockedBadge(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
