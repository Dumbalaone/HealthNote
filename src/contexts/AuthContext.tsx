import React, { createContext, useContext, useEffect, useState } from "react";
import {
  supabase,
  getCurrentUser,
  signIn,
  signUp,
  signOut,
} from "@/lib/supabase";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    userData: { user_type: string; name: string },
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  userType: "doctor" | "patient" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();

        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || "",
            user_type: currentUser.user_metadata?.user_type || "patient",
            name: currentUser.user_metadata?.name || "",
          });

          setUserType(currentUser.user_metadata?.user_type || null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to retrieve user information.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up auth subscription
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            user_type: session.user.user_metadata?.user_type || "patient",
            name: session.user.user_metadata?.name || "",
          });
          setUserType(session.user.user_metadata?.user_type || null);
        } else {
          setUser(null);
          setUserType(null);
        }
        setIsLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          user_type: data.user.user_metadata?.user_type || "patient",
          name: data.user.user_metadata?.name || "",
        });
        setUserType(data.user.user_metadata?.user_type || null);
        return { success: true };
      }

      return { success: false, error: "No user data returned" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    userData: { user_type: string; name: string },
  ) => {
    try {
      const { data, error } = await signUp(email, password, userData);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast({
          title: "Account created",
          description:
            "Your account has been successfully created. You can now log in.",
        });
        return { success: true };
      }

      return { success: false, error: "No user data returned" };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, userType }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
