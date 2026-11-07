/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { MobilityRoutine, LeaderboardMember, RoutineLog, ActivityFeedItem, DigitalBadge } from './types';
import { MOBILITY_ROUTINES } from './data/routines';
import { storage } from './services/storage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './services/firebase';
import { doc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { evaluateBadges } from './services/achievements';
import { Header } from './components/Header';
import { WorkdayRoutineTracker } from './components/WorkdayRoutineTracker';
import { BadgesView } from './components/BadgesView';
import { LeaderboardView } from './components/LeaderboardView';
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

  const [activeTab, setActiveTab] = useState<'routines' | 'badges' | 'leaderboard'>('routines');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        user={profile}
        completedSlotsCount={slotData.completedSlotsCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStoreModal={() => setShowStoreModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6">
        {activeTab === 'routines' && (
          <WorkdayRoutineTracker
            slots={slotData.slots}
            completedSlotsCount={slotData.completedSlotsCount}
            todayLogs={todayLogs}
            inWindow={windowInfo.inWindow}
            timeRemainingStr={windowInfo.timeRemainingStr}
            routines={MOBILITY_ROUTINES}
            onSelectRoutine={handleSelectRoutineToTrack}
          />
        )}

        {activeTab === 'badges' && (
          <BadgesView badges={badges} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            user={profile}
            members={members}
            activityFeed={activityFeed}
            onCheer={handleCheerMember}
            onAddFriend={handleAddFriend}
          />
        )}
      </main>

      {/* Camera Workout Modal */}
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

      {/* App Stores Publish Guide Modal */}
      {showStoreModal && (
        <StorePublishModal onClose={() => setShowStoreModal(false)} />
      )}

      {/* User Management & Login Modal */}
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
