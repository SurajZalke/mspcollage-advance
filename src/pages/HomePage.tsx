
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import PlayerJoinForm from "@/components/PlayerJoinForm";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-quiz-dark">
              Interactive Science Quizzes for Grades 11-12
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join a quiz room or host your own science-based quizzes to enhance learning and assess knowledge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-full">
                <PlayerJoinForm />
              </div>
              
              <div className="text-center text-gray-500 text-sm">
                Players don't need an account to join a quiz
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="quiz-card w-full max-w-md p-6 text-center">
                <h2 className="text-xl font-bold text-quiz-dark mb-4">Host a Quiz</h2>
                <p className="text-gray-600 mb-6">
                  Create, customize and host interactive quizzes for your students or friends
                </p>
                
                <div className="space-y-3">
                  <Link to="/host-login">
                    <Button className="quiz-btn-primary w-full">
                      Sign In as Host
                    </Button>
                  </Link>
                  
                  <Link to="/host-signup">
                    <Button className="quiz-btn-secondary w-full">
                      Create Host Account
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="text-center text-gray-500 text-sm">
                Hosts can create and save quizzes, track results, and more
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-quiz-dark">Science Stream Quiz Features</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="quiz-card p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-quiz-light text-quiz-primary text-xl font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center mb-2">Specialized Content</h3>
                <p className="text-gray-600 text-center">
                  Quizzes specifically for 11th and 12th grade science stream subjects
                </p>
              </div>
              
              <div className="quiz-card p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-quiz-light text-quiz-primary text-xl font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center mb-2">Real-time Competition</h3>
                <p className="text-gray-600 text-center">
                  Engage students in competitive real-time quizzes with live leaderboards
                </p>
              </div>
              
              <div className="quiz-card p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-quiz-light text-quiz-primary text-xl font-bold">
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
