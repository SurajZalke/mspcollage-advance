
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const HostLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/host-dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="quiz-card w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-quiz-dark">Host Login</h2>
            <p className="text-gray-500 text-sm">Sign in to access your host dashboard</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Input
                type="email"
                placeholder="Email"
                className="quiz-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                className="quiz-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="quiz-btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/host-signup" className="text-quiz-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HostLoginForm;
