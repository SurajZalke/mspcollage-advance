
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/host-login"
}) => {
  const { isLoggedIn, currentUser, loading } = useAuth();
  const { toast } = useToast();

  console.log('ProtectedRoute: loading', loading);
  console.log('ProtectedRoute: isLoggedIn', isLoggedIn());
  console.log('ProtectedRoute: currentUser', currentUser);

  // Wait for auth state to load
  if (loading) {
    return null; // Or render a loading spinner
  }

  // Check if user is logged in
  if (!isLoggedIn()) {
    toast({
      title: "Access denied",
      description: "Please login to access this page",
      variant: "destructive"
    });
    return <Navigate to={redirectTo} replace />;
  }

  // Check if profile is complete (e.g., nickname is set)
  const isProfileComplete = currentUser?.user_metadata?.name && currentUser?.user_metadata?.avatar_url;

  console.log('ProtectedRoute: isProfileComplete', isProfileComplete);
  console.log('ProtectedRoute: currentPathname', window.location.pathname);

  // If logged in but profile is incomplete and not already on the profile setup page, redirect
  if (!isProfileComplete && window.location.pathname !== '/profile-setup') {
    toast({
      title: "Profile incomplete",
      description: "Please complete your profile to access this page",
      variant: "default"
    });
    return <Navigate to="/profile-setup" replace />;
  }

  // If logged in and profile is complete (or on profile setup page), render children
  return <>{children}</>;

};

export default ProtectedRoute;
