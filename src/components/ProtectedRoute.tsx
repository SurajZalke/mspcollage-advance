
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
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();

  if (!isLoggedIn()) {
    toast({
      title: "Access denied",
      description: "Please login to access this page",
      variant: "destructive"
    });
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
