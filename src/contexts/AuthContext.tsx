import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from "@/lib/firebaseConfig";
import { User, onAuthStateChanged, AuthError, Auth, updateProfile as updateProfileFirebase, UserCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { ref, get, set, onValue, update, serverTimestamp } from "firebase/database";
import { useToast } from "@/components/ui/use-toast";
import { getFunctions, httpsCallable } from "firebase/functions";

interface AuthContextType {
  currentUser: (User & { user_metadata?: {
    id?: string; // Make id optional as it might not be present initially or directly from Firebase Auth
    name?: string; avatar_url?: string; bio?: string;
    email?: string;
    password?: string;
    subject?: string;
    grade?: string;
    quizIds?: string[];
    } }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoggedIn: () => boolean;
  updateProfile: (data: { name?: string; avatar_url?: string; bio?: string }) => Promise<void>;
  // refreshSession: () => Promise<void>; // Firebase handles sessions differently
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const functions = getFunctions();

  console.log('AuthProvider: Setting up onAuthStateChanged listener');
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged: user changed', user);
      if (user) {
        // Fetch profile data from Realtime Database
        const profileRef = ref(db, 'profiles/' + user.uid);
        console.log('onAuthStateChanged: Fetching profile for user', user.uid);
        try {
          const snapshot = await get(profileRef);

          console.log('onAuthStateChanged: Snapshot exists?', snapshot.exists()); // Added log

          if (snapshot.exists()) {
          console.log('onAuthStateChanged: Profile exists', snapshot.val());
          const profileData = snapshot.val();
          console.log('onAuthStateChanged: Profile name from DB:', profileData?.name);
          // Profile exists, update currentUser state with fetched profile data
          setCurrentUser({
            ...user,
            user_metadata: profileData
          } as User & { user_metadata?: { name?: string; avatar_url?: string; bio?: string } });
          setLoading(false);
        } else {
            console.warn(`onAuthStateChanged: Profile data not found for user ${user.uid}. Creating a new profile.`);
            // Profile does not exist, create it in Realtime Database
            const newProfileData = {
               name: user.displayName || user.email || 'New User',
               avatar_url: user.photoURL || 'https://www.gravatar.com/avatar/?d=mp',
               bio: '',
               email: user.email || '',
               createdAt: serverTimestamp(),
              };
            console.log('onAuthStateChanged: Creating new profile with data:', newProfileData);
            console.log('onAuthStateChanged: user.displayName:', user.displayName);
            console.log('onAuthStateChanged: user.email:', user.email);
            try { // Added try-catch for profile creation
              await set(profileRef, newProfileData);
              console.log('onAuthStateChanged: Profile created successfully'); // Added log
              setCurrentUser({
                ...user,
                user_metadata: newProfileData
              } as User & { user_metadata?: { name?: string; avatar_url?: string; bio?: string } });
              setLoading(false);
            } catch (createError) { // Added catch block
              console.error('onAuthStateChanged: Error creating profile:', createError); // Added log
              // Decide how to handle creation error - maybe set currentUser to null or show a toast
              setCurrentUser(null);
              setLoading(false);
              return; // Stop further processing if profile creation fails
            }
          }
          console.log('onAuthStateChanged: currentUser after profile fetch/create:', currentUser); // Added log
        } catch (error) {
          console.error(`onAuthStateChanged: Error fetching or creating profile for user ${user.uid}:`, error);
          // Optionally, handle the error by setting currentUser to null or showing a toast
          setCurrentUser(null);
          setLoading(false);
          return; // Stop further processing for this user if profile fetch/create fails
        }

          // Real-time subscription for profile changes
          const unsubscribeProfile = onValue(profileRef, (snapshot) => {
            if (snapshot.exists()) {
              console.log('Profile update received via real-time:', snapshot.val());
              const updatedProfileData = snapshot.val();
              console.log('Profile update received via real-time - name:', updatedProfileData?.name);
              if (user) {
                setCurrentUser({
                  ...user,
                  user_metadata: updatedProfileData
                } as User & { user_metadata?: { name?: string; avatar_url?: string; bio?: string } });
              }
            } else {
               console.log('Profile removed via real-time for user:', user?.uid);
               // Handle case where profile is removed from database
               if (user) {
                  setCurrentUser(user as User & { user_metadata?: { name?: string; avatar_url?: string; bio?: string } });
               }
            }
          });

          // Return unsubscribe function for profile listener
          return () => {
            console.log('onAuthStateChanged: Unsubscribing from profile listener for user', user.uid);
            unsubscribeProfile();
          };

        } else {
          console.log('onAuthStateChanged: user is null');
          setCurrentUser(null);
        }
        setLoading(false);
      });

    // Return unsubscribe function for auth listener
    return () => {
      console.log('AuthProvider: Cleaning up onAuthStateChanged listener');
      unsubscribeAuth();
    };
  }, []);


  const isLoggedIn = () => {
    console.log('isLoggedIn:', currentUser !== null); // Added log
    return currentUser !== null;
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred during login.';
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This user account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          default:
            errorMessage = error.message;
            break;
        }
      }
      throw new Error(errorMessage);
    }
  };



  const signup = async (name: string, email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Update user profile in Firebase Auth
      await updateProfileFirebase(user, {
        displayName: name,
        photoURL: user.photoURL || 'https://www.gravatar.com/avatar/?d=mp', // Use user's photoURL or a default Gravatar if empty
      });

      // Create a profile entry in Realtime Database
      await set(ref(db, 'profiles/' + user.uid), {
        name: name,
        avatar_url: user.photoURL || 'https://www.gravatar.com/avatar/?d=mp',
        bio: '',
        email: user.email,
        createdAt: serverTimestamp(),
      });

      return user;
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred during signup.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'The email address is already in use by another account.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak.';
            break;
          default:
            errorMessage = error.message;
            break;
        }
      }
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      signOut(auth);
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      throw error;
    }
  };



  const updateProfile = async (data: { name?: string; avatar_url?: string; bio?: string }): Promise<void> => {
    if (!currentUser) {
      throw new Error("No current user to update profile for.");
    }
    try {
      const profileRef = ref(db, 'profiles/' + currentUser.uid);
      await update(profileRef, data);

      // Update the currentUser state with the new data
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const typedPrevUser = prevUser as User & { user_metadata?: { name?: string; avatar_url?: string; bio?: string } };
         return {
           ...typedPrevUser,
           user_metadata: {
             ...typedPrevUser.user_metadata,
             ...data,
           },
         };
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      throw error;
    }
  };

  return (
      <AuthContext.Provider value={{
        confirmPasswordReset: async (email: string, code: string, newPassword: string): Promise<void> => {
          try {
            const confirmReset = httpsCallable(functions, 'confirmPasswordReset');
            await confirmReset({ email, code, newPassword });
            toast({ 
              title: 'Password Reset',
              description: 'Your password has been successfully reset!',
            });
          } catch (error: any) {
            console.error('Error confirming password reset:', error.message);
            toast({
              title: 'Password Reset Failed',
              description: error.message || 'Failed to reset password.',
              variant: 'destructive',
            });
            throw error;
          }
        },
        currentUser,
        loading,
        login,
        signup,
        logout,
        isLoggedIn,
        updateProfile,
        resetPassword: async (email: string) => {
          try {
            const sendResetCode = httpsCallable(functions, 'sendPasswordResetCode');
            await sendResetCode({ email });
            toast({
              title: 'Password Reset',
              description: 'Password reset code sent! Please check your inbox.',
            });
          } catch (error: any) {
            console.error('Error sending password reset code:', error.message);
            toast({
              title: 'Password Reset Failed',
              description: error.message || 'Failed to send password reset code.',
              variant: 'destructive',
            });
            throw error;
          }
        },
      }}>
        {!loading && children}
      </AuthContext.Provider>
    );
  };

