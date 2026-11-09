import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';
import { UserProfile } from '../types';
import { storage, INITIAL_USER } from '../services/storage';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile;
  loading: boolean;
  isGuest: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // onAuthStateChanged automatically restores persisted user from browserLocalPersistence
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsGuest(false);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            const synced: UserProfile = {
              id: user.uid,
              name: data.name || user.displayName || 'Athlete',
              avatar: data.avatar || user.photoURL || profile.avatar,
              streakDays: data.streakDays || 1,
              todayRoutinesCount: data.todaySlotsCount || 0,
              totalPoints: data.totalPoints || 0,
              squadCode: data.squadCode || 'MOVE-9TO5',
              squadName: data.squadName || '9-to-5 Workplace Mobility',
              reminderIntervalMinutes: data.reminderIntervalMinutes || 60,
              soundEnabled: data.soundEnabled !== false,
              voiceEnabled: data.voiceEnabled !== false,
              currentChallengeId: data.currentChallengeId,
              unlockedBadgeIds: data.unlockedBadgeIds || [],
            };
            setProfile(synced);
            storage.saveUserProfile(synced);
          } else {
            // New user registration in Firestore
            const newProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || 'Athlete',
              avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              streakDays: 1,
              todayRoutinesCount: 0,
              totalPoints: 0,
              squadCode: 'MOVE-9TO5',
              squadName: '9-to-5 Workplace Mobility',
              reminderIntervalMinutes: 60,
              soundEnabled: true,
              voiceEnabled: true,
              unlockedBadgeIds: [],
            };

            await setDoc(userDocRef, {
              userId: user.uid,
              name: newProfile.name,
              email: user.email || '',
              avatar: newProfile.avatar,
              streakDays: newProfile.streakDays,
              todaySlotsCount: newProfile.todayRoutinesCount,
              totalPoints: newProfile.totalPoints,
              squadCode: newProfile.squadCode,
              squadName: newProfile.squadName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            setProfile(newProfile);
            storage.saveUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Firestore profile sync fallback to local cache:', err);
        }
      } else {
        // Fallback to local profile when not logged in
        setProfile(storage.getUserProfile());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const user = await loginWithGoogle();
      setFirebaseUser(user);
      setIsGuest(false);
    } catch (err) {
      console.error('Failed to sign in', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const user = await loginWithEmail(email, pass);
      setFirebaseUser(user);
      setIsGuest(false);
    } catch (err) {
      console.error('Failed to sign in with email', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      const user = await registerWithEmail(email, pass, name);
      setFirebaseUser(user);
      setIsGuest(false);
    } catch (err) {
      console.error('Failed to register with email', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
      setFirebaseUser(null);
      setIsGuest(false);
      setProfile(INITIAL_USER);
      storage.saveUserProfile(INITIAL_USER);
    } catch (err) {
      console.error('Failed to sign out', err);
      throw err;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    storage.saveUserProfile(updated);

    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userDocRef, {
          name: updated.name,
          avatar: updated.avatar,
          squadName: updated.squadName,
          streakDays: updated.streakDays,
          todaySlotsCount: updated.todayRoutinesCount,
          totalPoints: updated.totalPoints,
          currentChallengeId: updated.currentChallengeId || null,
          unlockedBadgeIds: updated.unlockedBadgeIds || [],
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isGuest,
        signIn,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        continueAsGuest,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
