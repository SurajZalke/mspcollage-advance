
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import QuizCard from "@/components/QuizCard";
import { useGame } from "@/contexts/GameContext";
import { Quiz, ScienceSubject } from "@/types";
import { scienceSubjects, sampleQuizzes } from "@/utils/gameUtils";

const HostDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { createGame } = useGame();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<ScienceSubject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/host-login");
    }
  }, [currentUser, navigate]);

  // Load subjects and quizzes
  useEffect(() => {
    // Load subjects
    setSubjects(scienceSubjects);
    
    // Load quizzes (in a real app, these would be fetched from a server)
    setQuizzes(sampleQuizzes);
  }, []);

  const handleStartQuiz = (quizId: string) => {
    const gameRoom = createGame(quizId);
    navigate("/host-game-room");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, <span className="font-medium">{currentUser.name}</span>
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-quiz-dark">Host Dashboard</h1>
          <p className="text-gray-600">Manage your quizzes and game sessions</p>
        </div>
        
        <Tabs defaultValue="my-quizzes" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="my-quizzes">My Quizzes</TabsTrigger>
            <TabsTrigger value="create-quiz">Create Quiz</TabsTrigger>
            <TabsTrigger value="game-history">Game History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-quizzes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onStart={handleStartQuiz}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="create-quiz">
            <div className="quiz-card p-6">
              <h2 className="text-xl font-bold text-quiz-dark mb-4">Create a New Quiz</h2>
              <p className="text-gray-600 mb-6">
                Create custom quizzes for your students by selecting a subject, grade level, and topic.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-medium text-gray-700 mb-4">Choose a Subject and Topic</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="quiz-card p-4">
                      <h4 className="font-bold text-quiz-dark mb-2">{subject.name}</h4>
                      <ul className="text-sm space-y-1">
                        {subject.topics.map((topic) => (
                          <li key={topic.id} className="flex justify-between">
                            <span>{topic.name}</span>
                            <span className="text-xs bg-quiz-light px-1 rounded text-quiz-secondary">
                              {topic.quizCount} quizzes
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <Button className="quiz-btn-primary">
                  Create Custom Quiz
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="game-history">
            <div className="quiz-card p-6 text-center">
              <h2 className="text-xl font-bold text-quiz-dark mb-4">Game History</h2>
              <p className="text-gray-600">
                You haven't hosted any games yet. Start a quiz to see your game history.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HostDashboardPage;
