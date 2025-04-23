
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const HostSignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill out all fields.",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      toast({
        title: "Account created!",
        description: "You've successfully signed up.",
      });
      navigate("/host-dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="quiz-card w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-quiz-dark">Host Signup</h2>
            <p className="text-gray-500 text-sm">Create an account to host quiz games</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                className="quiz-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
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
            
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                className="quiz-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="quiz-btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/host-login" className="text-quiz-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HostSignupForm;
