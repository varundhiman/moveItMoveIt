/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { MobilityRoutine, LeaderboardMember, RoutineLog, ActivityFeedItem, DigitalBadge } from './types';
import { MOBILITY_ROUTINES } from './data/routines';
import { storage } from './services/storage';
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
import { OfflineIndicator } from './components/OfflineIndicator';

function AppContent() {
  const { profile, firebaseUser, updateUserProfile } = useAuth();
  const [members, setMembers] = useState<LeaderboardMember[]>(() => storage.getLeaderboard());
  const [allLogs, setAllLogs] = useState<RoutineLog[]>(() => storage.getRoutineLogs());
  const [todayLogs, setTodayLogs] = useState<RoutineLog[]>(() => storage.getTodayLogs());
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(() => storage.getActivityFeed());

  const [activeTab, setActiveTab] = useState<NavTab>('radar');
  const [activeWorkout, setActiveWorkout] = useState<MobilityRoutine | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [latestUnlockedBadge, setLatestUnlockedBadge] = useState<DigitalBadge | null>(null);

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
    const { updatedProfile, updatedMembers } = storage.saveRoutineLog(log);
    const updatedAllLogs = storage.getRoutineLogs();
    const updatedTodayLogs = storage.getTodayLogs(updatedAllLogs);
    const updatedSlots = storage.getTodayWorkdaySlots(updatedTodayLogs);

    setMembers(updatedMembers);
    setAllLogs(updatedAllLogs);
    setTodayLogs(updatedTodayLogs);
    setSlotData(updatedSlots);
    setActivityFeed(storage.getActivityFeed());
    setActiveWorkout(null);
    setActiveTab('radar'); // Return to Radar screen to see completed slot

    // Evaluate badges
    const badgeEval = evaluateBadges(
      updatedProfile,
      updatedTodayLogs,
      updatedAllLogs,
      updatedSlots.completedSlotsCount
    );

    setBadges(badgeEval.allBadges);

    // Check if new badges unlocked
    if (badgeEval.newlyUnlockedBadges.length > 0) {
      setLatestUnlockedBadge(badgeEval.newlyUnlockedBadges[0]);
      updatedProfile.unlockedBadgeIds = badgeEval.unlockedBadgeIds;
      storage.saveUserProfile(updatedProfile);
      updateUserProfile({ unlockedBadgeIds: badgeEval.unlockedBadgeIds });
    }

    // Sync to Firestore if authenticated
    if (firebaseUser) {
      try {
        const logDocRef = doc(collection(db, 'users', firebaseUser.uid, 'logs'));
        await setDoc(logDocRef, {
          userId: firebaseUser.uid,
          routineId: log.routineId,
          routineTitle: log.routineTitle,
          completedAt: log.completedAt,
          isWithin9to5: log.isWithin9to5,
          slotIndex: log.slotIndex ?? 0,
          score: log.score,
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
        console.warn('Failed to persist log to Firestore:', err);
      }
    }
  };

  const handleCheerMember = (memberId: string) => {
    const updated = storage.cheerMember(memberId);
    setMembers(updated);
  };

  const handleAddFriend = (name: string) => {
    const updated = storage.addFriendToLeaderboard(name);
    setMembers(updated);
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
              members={members}
              activityFeed={activityFeed}
              onCheer={handleCheerMember}
              onAddFriend={handleAddFriend}
            />
          )}

          {activeTab === 'badges' && (
            <BadgesView badges={badges} />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          completedSlotsCount={slotData.completedSlotsCount}
        />
      </div>

      {/* Screen 7: Camera Workout Tracker Modal */}
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
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
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
