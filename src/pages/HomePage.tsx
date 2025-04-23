
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import PlayerJoinForm from "@/components/PlayerJoinForm";
import { Sparkles, Star, Zap } from "lucide-react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 animate-gradient-x">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-center mb-8 animate-float">
          <Logo size="lg" />
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-heading animate-pulse-scale">
              Interactive Science Quizzes for Grades 11-12
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join a quiz room or host your own science-based quizzes to enhance learning and assess knowledge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-full relative">
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 animate-pulse z-10">
                  <Star size={20} className="text-yellow-900" />
                </div>
                <PlayerJoinForm />
              </div>
              
              <div className="text-center text-gray-500 text-sm">
                Players don't need an account to join a quiz
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="quiz-card w-full max-w-md p-6 text-center relative overflow-hidden glass-dark border-2 border-purple-300/30">
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center transform -rotate-12 animate-float z-10">
                  <Sparkles size={20} className="text-purple-900" />
                </div>
                
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>
                
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-quiz-dark mb-4">Host a Quiz</h2>
                  <p className="text-gray-600 mb-6">
                    Create, customize and host interactive quizzes for your students or friends
                  </p>
                  
                  <div className="space-y-3">
                    <Link to="/host-login">
                      <Button className="quiz-btn-primary w-full relative group overflow-hidden">
                        <span className="relative z-10">Sign In as Host</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </Button>
                    </Link>
                    
                    <Link to="/host-signup">
                      <Button className="bg-white/20 hover:bg-white/30 text-indigo-700 border border-indigo-300 w-full">
                        Create Host Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-gray-500 text-sm">
                Hosts can create and save quizzes, track results, and more
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-quiz-dark inline-flex items-center">
                Science Stream Quiz Features
                <Zap className="ml-2 text-yellow-500" size={24} />
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="quiz-card p-6 transform hover:scale-105 transition-all duration-300 border-l-4 border-pink-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-500 text-white text-xl font-bold attractive-glow">
                    1
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center mb-2">Specialized Content</h3>
                <p className="text-gray-600 text-center">
                  Quizzes specifically for 11th and 12th grade science stream subjects
                </p>
              </div>
              
              <div className="quiz-card p-6 transform hover:scale-105 transition-all duration-300 border-l-4 border-blue-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xl font-bold attractive-glow">
                    2
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center mb-2">Real-time Competition</h3>
                <p className="text-gray-600 text-center">
                  Engage students in competitive real-time quizzes with live leaderboards
                </p>
              </div>
              
              <div className="quiz-card p-6 transform hover:scale-105 transition-all duration-300 border-l-4 border-green-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white text-xl font-bold attractive-glow">
                    3
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center mb-2">Customizable Scoring</h3>
                <p className="text-gray-600 text-center">
                  Choose between standard and negative marking to suit different testing styles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
