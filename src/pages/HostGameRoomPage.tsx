
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import GameCodeDisplay from "@/components/GameCodeDisplay";
import LeaderboardDisplay from "@/components/LeaderboardDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";

const HostGameRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeGame, currentQuiz, currentQuestion, isHost, startGame, nextQuestion, endGame } = useGame();
  const navigate = useNavigate();

  // Redirect if not logged in or no active game
  useEffect(() => {
    if (!currentUser) {
      navigate("/host-login");
    } else if (!activeGame || !isHost) {
      navigate("/host-dashboard");
    }
  }, [currentUser, activeGame, isHost, navigate]);

  const handleStartGame = () => {
    startGame();
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const handleEndGame = () => {
    endGame();
    navigate("/host-dashboard");
  };

  if (!currentUser || !activeGame || !currentQuiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center">
            <span className="font-medium text-quiz-primary mr-2">
              {currentQuiz.title}
            </span>
            <span className="text-sm text-gray-500">
              Host: {currentUser.name}
            </span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {activeGame.status === "waiting" ? (
              <div className="quiz-card p-6 text-center">
                <h2 className="text-2xl font-bold text-quiz-dark mb-6">
                  Waiting for Players
                </h2>
                <p className="text-gray-600 mb-8">
                  Share the game code with your students to let them join this quiz session
                </p>
                <Button 
                  className="quiz-btn-primary text-lg px-8 py-6 h-auto"
                  onClick={handleStartGame}
                  disabled={activeGame.players.length === 0}
                >
                  Start Quiz
                </Button>
                {activeGame.players.length === 0 && (
                  <p className="text-sm text-red-500 mt-4">
                    Wait for at least one player to join
                  </p>
                )}
              </div>
            ) : activeGame.status === "active" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-quiz-dark">
                    Question {activeGame.currentQuestionIndex + 1} of {currentQuiz.questions.length}
                  </h2>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleEndGame}
                    >
                      End Quiz
                    </Button>
                    <Button 
                      className="quiz-btn-primary"
                      onClick={handleNextQuestion}
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
                
                {currentQuestion && (
                  <QuestionDisplay 
                    question={currentQuestion} 
                    onAnswer={() => {}} 
                    showTimer={false}
                  />
                )}
                
                <div className="quiz-card p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Player Responses</h3>
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-bold text-quiz-primary">
                        {activeGame.players.filter(p => 
                          p.answers.some(a => a.questionId === currentQuestion?.id)
                        ).length}
                      </span>
                      <span className="text-gray-600">
                        /{activeGame.players.length} answered
                      </span>
                    </span>
                    <Button variant="outline" size="sm">
                      Show Results
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="quiz-card p-6 text-center">
                <h2 className="text-2xl font-bold text-quiz-dark mb-4">
                  Quiz Ended
                </h2>
                <p className="text-gray-600 mb-8">
                  The quiz session has been completed
                </p>
                <Button 
                  className="quiz-btn-primary"
                  onClick={() => navigate("/host-dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <GameCodeDisplay
              code={activeGame.code}
              playerCount={activeGame.players.length}
            />
            
            <LeaderboardDisplay players={activeGame.players} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostGameRoomPage;
