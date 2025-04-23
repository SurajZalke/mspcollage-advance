
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRound, Users } from "lucide-react";
import Logo from "@/components/Logo";
import GameCodeDisplay from "@/components/GameCodeDisplay";
import LeaderboardDisplay from "@/components/LeaderboardDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";

const HostGameRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeGame, currentQuiz, currentQuestion, isHost, startGame, nextQuestion, endGame } = useGame();
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };
  
  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

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
    setShowResults(false);
    nextQuestion();
  };

  const handleEndGame = () => {
    endGame();
    navigate("/host-dashboard");
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  // Calculate the number of players who have answered the current question
  const playersAnswered = activeGame?.players.filter(p => 
    p.answers.some(a => a.questionId === currentQuestion?.id)
  ).length || 0;

  if (!currentUser || !activeGame || !currentQuiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 overflow-x-hidden">
      <header className="bg-white shadow transform hover:scale-[1.01] transition-all duration-300">
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
              <div 
                ref={cardRef}
                className="quiz-card p-6 transition-all duration-300 transform hover:shadow-xl"
                onMouseMove={handleMouseMove}
                onMouseLeave={resetTilt}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-quiz-dark">
                      Waiting for Players
                    </h2>
                    <p className="text-gray-600">
                      Share the game code with your students to let them join
                    </p>
                  </div>
                  <Button 
                    className="quiz-btn-primary text-lg px-8 py-6 h-auto mt-4 md:mt-0 animate-pulse-scale"
                    onClick={handleStartGame}
                    disabled={activeGame.players.length === 0}
                  >
                    Start Quiz
                  </Button>
                </div>
                
                {activeGame.players.length > 0 ? (
                  <div className="bg-white rounded-lg border shadow-sm p-4 animate-fade-in">
                    <div className="flex items-center mb-4">
                      <Users className="text-quiz-primary mr-2" />
                      <h3 className="text-lg font-medium text-quiz-dark">
                        Joined Players ({activeGame.players.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {activeGame.players.map((player, index) => (
                        <div 
                          key={player.id}
                          className="flex items-center p-2 bg-gray-50 rounded-md border transform hover:scale-105 transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="bg-quiz-light w-8 h-8 rounded-full flex items-center justify-center mr-2 animate-float">
                            <UserRound size={16} className="text-quiz-primary" />
                          </div>
                          <span className="font-medium truncate">{player.nickname}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center bg-gray-50 p-8 rounded-lg border border-dashed">
                    <Users size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-red-500 font-medium">
                      No players have joined yet
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Share the game code so players can join
                    </p>
                  </div>
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
                      className="hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      End Quiz
                    </Button>
                    <Button 
                      className="quiz-btn-primary animate-pulse-scale"
                      onClick={handleNextQuestion}
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
                
                {currentQuestion && (
                  <div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={resetTilt}
                    className="transition-all duration-300"
                  >
                    <QuestionDisplay 
                      question={currentQuestion} 
                      onAnswer={() => {}} 
                      showTimer={false}
                    />
                  </div>
                )}
                
                <div className="quiz-card p-4 transform hover:scale-[1.01] transition-all duration-300">
                  <h3 className="font-medium text-gray-700 mb-4">Player Responses</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span>
                      <span className="font-bold text-quiz-primary">
                        {playersAnswered}
                      </span>
                      <span className="text-gray-600">
                        /{activeGame.players.length} answered
                      </span>
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleResults}
                      className="hover:bg-indigo-50 transition-colors"
                    >
                      {showResults ? "Hide Results" : "Show Results"}
                    </Button>
                  </div>
                  
                  <div className="bg-white rounded-lg border p-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Correct</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeGame.players.map((player, idx) => {
                          const answer = player.answers.find(
                            (a) => a.questionId === currentQuestion?.id
                          );
                          return (
                            <TableRow 
                              key={player.id}
                              className="transform hover:bg-indigo-50/30 hover:scale-[1.02] transition-all duration-300"
                              style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                              <TableCell className="font-medium">{player.nickname}</TableCell>
                              <TableCell>
                                {answer ? (
                                  <span className="text-green-600">Answered</span>
                                ) : (
                                  <span className="text-amber-600">Waiting</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {answer ? `${answer.timeToAnswer}s` : "-"}
                              </TableCell>
                              <TableCell>
                                {showResults ? (
                                  answer ? (
                                    answer.correct ? (
                                      <span className="text-green-600 font-bold animate-pulse-scale">✓</span>
                                    ) : (
                                      <span className="text-red-600 font-bold animate-pulse-scale">✗</span>
                                    )
                                  ) : (
                                    "-"
                                  )
                                ) : (
                                  <span className="text-gray-400">Hidden</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="quiz-card p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
                <h2 className="text-2xl font-bold text-quiz-dark mb-4">
                  Quiz Ended
                </h2>
                <p className="text-gray-600 mb-8">
                  The quiz session has been completed
                </p>
                <Button 
                  className="quiz-btn-primary animate-pulse-scale"
                  onClick={() => navigate("/host-dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <GameCodeDisplay
                code={activeGame.code}
                playerCount={activeGame.players.length}
              />
            </div>
            
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <LeaderboardDisplay players={activeGame.players} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostGameRoomPage;
