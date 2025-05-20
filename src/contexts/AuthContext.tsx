import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthError } from '@supabase/supabase-js';
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: (User & { user_metadata?: { name?: string; avatar_url?: string; bio?: string } }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoggedIn: () => boolean;
  updateProfile: (data: { name?: string; avatar_url?: string; bio?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { supabase } from "@/lib/supabaseClient";

const handleAuthError = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email not confirmed':
      return 'Please verify your email before logging in.';
    case 'User already registered':
      return 'An account with this email already exists.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch profile data if user exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') { // PGRST116 is 'No rows found'
            // Profile does not exist, create it
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || '', // Use name from auth metadata or empty
                  avatar_url: session.user.user_metadata?.avatar_url || '', // Use avatar_url from auth metadata or empty
                  bio: session.user.user_metadata?.bio || '', // Use bio from auth metadata or empty
                }
              ]);

            if (createProfileError) {
              console.error('Error creating profile on auth state change:', createProfileError);
              // Continue without profile data if creation fails
              setCurrentUser(session.user);
            } else {
              // Profile created, fetch it again to update state
              const { data: newProfileData, error: fetchNewProfileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (fetchNewProfileError) {
                 console.error('Error fetching newly created profile:', fetchNewProfileError);
                 setCurrentUser(session.user); // Fallback to user data if fetching new profile fails
              } else {
                 setCurrentUser({
                   ...session.user,
                   user_metadata: newProfileData || session.user.user_metadata
                 });
              }
            }
          } else if (profileError) {
            console.error('Error fetching profile on auth state change:', profileError);
            // Continue without profile data if there's an error other than 'No rows found'
            setCurrentUser(session.user);
          } else {
            // Profile exists, update currentUser state with fetched profile data
            setCurrentUser({
              ...session.user,
              user_metadata: profileData || session.user.user_metadata
            });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile data if user exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') { // PGRST116 is 'No rows found'
           // Profile does not exist, create it
           const { error: createProfileError } = await supabase
             .from('profiles')
             .insert([
               {
                 id: session.user.id,
                 name: session.user.user_metadata?.name || '', // Use name from auth metadata or empty
                 avatar_url: session.user.user_metadata?.avatar_url || '', // Use avatar_url from auth metadata or empty
                 bio: session.user.user_metadata?.bio || '', // Use bio from auth metadata or empty
               }
             ]);

           if (createProfileError) {
             console.error('Error creating profile on initial session check:', createProfileError);
             setCurrentUser(session.user); // Continue without profile data if creation fails
           } else {
             // Profile created, fetch it again to update state
             const { data: newProfileData, error: fetchNewProfileError } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', session.user.id)
               .single();

             if (fetchNewProfileError) {
                console.error('Error fetching newly created profile on initial session check:', fetchNewProfileError);
                setCurrentUser(session.user); // Fallback to user data if fetching new profile fails
             } else {
                setCurrentUser({
                  ...session.user,
                  user_metadata: newProfileData || session.user.user_metadata
                });
             }
           }
        } else if (profileError) {
          console.error('Error fetching profile on initial session check:', profileError);
          // Continue without profile data if there's an error other than 'No rows found'
          setCurrentUser(session.user);
        } else {
          // Profile exists, update currentUser state with fetched profile data
          setCurrentUser({
            ...session.user,
            user_metadata: profileData || session.user.user_metadata
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Real-time subscription for profile changes
    const profileListener = supabase
      .channel(`profiles:id=eq.${currentUser?.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser?.id}` },
        (payload) => {
          console.log('Profile update received via real-time:', payload);
          if (currentUser) {
            setCurrentUser({
              ...currentUser,
              user_metadata: payload.new
            });
          }
        }
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      profileListener.unsubscribe(); // Unsubscribe from profile changes
    };
  }, [currentUser]); // Depend on currentUser to subscribe to the correct channel

  const isLoggedIn = () => {
    return currentUser !== null;
  };

  // Login functionality with Supabase
  const login = async (email: string, password: string): Promise<User> => {
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error("Login failed: No user data returned");
      }

      if (!data.user.email_confirmed_at) {
        toast({
          title: "Email not confirmed",
          description: "Please check your email and confirm your account before logging in.",
          variant: "destructive",
        });
        throw new Error("Please confirm your email before logging in.");
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      const updatedUser = {
        ...data.user,
        user_metadata: profileData || data.user.user_metadata
      };
      setCurrentUser(updatedUser);

      toast({
        title: "Login successful",
        description: `Welcome back, ${updatedUser.user_metadata?.name || 'User'}!`,
      });

      return data.user;
    } catch (error: any) {
      throw error;
    }
  };



  // Signup functionality with Supabase
  const signup = async (name: string, email: string, password: string): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            avatar_url: "",
            bio: ""
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        toast({
          title: "Signup failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error("Signup failed: No user data returned");
      }

      // Create profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name,
          avatar_url: "",
          bio: ""
        }]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      setCurrentUser({
        ...data.user,
        user_metadata: { name, avatar_url: "", bio: "" }
      });

      toast({
        title: "Signup successful",
        description: "Please check your email to confirm your account.",
      });

      return data.user;
    } catch (error: any) {
      throw error;
    }
  };

  // Logout functionality
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setCurrentUser(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Re-throw any caught errors after handling toasts
      throw error;
    }
  };

  // Update profile functionality with real-time sync
  const updateProfile = async (data: { name?: string; avatar_url?: string; bio?: string }): Promise<void> => {
    try {
      if (!currentUser) {
        throw new Error("No user logged in");
      }

      // Update auth metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
          bio: data.bio,
        }
      });

      if (metadataError) {
        throw metadataError;
      }

      // Update the 'profiles' table
      const { data: profileData, error: dbUpdateError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (dbUpdateError) {
        throw dbUpdateError;
      }

      // Update currentUser state with the latest profile data
      setCurrentUser({
        ...currentUser,
        user_metadata: profileData
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Refresh session and user data
  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile during refresh:', profileError);
        }

        setCurrentUser({
          ...session.user,
          user_metadata: profileData || session.user.user_metadata
        });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      signup,
      logout,
      isLoggedIn,
      updateProfile,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};