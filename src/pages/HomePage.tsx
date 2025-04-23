import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import BackgroundContainer from "@/components/BackgroundContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, Play, Settings, Users } from "lucide-react";
import CreatorAttribution from "@/components/CreatorAttribution";

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleHostClick = () => {
    if (currentUser) {
      navigate("/host-dashboard");
    } else {
      navigate("/host-login");
    }
  };

  const handleJoinClick = () => {
    navigate("/game-room");
  };

  return (
    <BackgroundContainer className="homepage-background">
      <div className="min-h-screen flex flex-col">
        <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-sm">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <Logo />
            
            {currentUser ? (
              <div className="space-x-2">
                <Button 
                  variant="ghost" 
                  className="dark:text-white dark:hover:bg-white/10"
                  onClick={() => navigate("/host-dashboard")}
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="ghost" 
                  className="dark:text-white dark:hover:bg-white/10"
                  onClick={() => navigate("/host-login")}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate("/host-signup")}
                >
                  Host Sign Up
                </Button>
              </div>
            )}
          </div>
        </header>
        
        <main className="container mx-auto flex-1 flex flex-col justify-center items-center p-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold gradient-heading mb-4">Interactive Science Quiz Platform</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create and participate in engaging science quizzes for high school students. 
              Perfect for classroom activities or remote learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <div className="quiz-card p-8 text-center transform hover:scale-105 transition-all duration-300 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="mb-4">
                <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Join as Player</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter a game code to join a quiz as a player. Compete with others and test your knowledge!
              </p>
              <Button onClick={handleJoinClick} className="quiz-btn-primary w-full">
                <Play className="h-4 w-4 mr-2" />
                Join Game
              </Button>
            </div>
            
            <div className="quiz-card p-8 text-center transform hover:scale-105 transition-all duration-300 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="mb-4">
                <div className="mx-auto bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Host a Game</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your own quiz, invite players, and host an interactive learning session.
              </p>
              <Button onClick={handleHostClick} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                {currentUser ? 'Go to Dashboard' : 'Host Sign In'}
              </Button>
            </div>
          </div>
          
          <div className="mt-16 text-center max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Create Quiz</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Teachers create custom quizzes with various question types
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Share Code</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Students join using a unique game code
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Play & Learn</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Compete in real-time and see instant results
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-white/10 dark:bg-gray-900/60 py-4 backdrop-blur-sm">
          <div className="container mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© 2025 Science Quiz Platform — Interactive learning tool for science education</p>
          </div>
        </footer>
      </div>
      <CreatorAttribution />
    </BackgroundContainer>
  );
};

export default HomePage;
