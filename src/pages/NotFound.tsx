
import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 gradient-animated-bg dark:bg-none dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#432f7b] dark:to-[#7efaf8]">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="max-w-md w-full quiz-card text-center p-8 attractive-glow">
        <h1 className="text-6xl font-bold text-quiz-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-quiz-dark mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="quiz-btn-primary animate-pulse-scale shadow-glow-purple">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
