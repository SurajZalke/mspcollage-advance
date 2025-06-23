import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import QuestionDisplay from "@/components/QuestionDisplay";
import { Button } from "@/components/ui/button";
import BackgroundContainer from "@/components/BackgroundContainer";
import { AlertCircle, Award, Clock, Wifi, RefreshCw, CheckCircle, UserRound, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import confetti from 'canvas-confetti';
import WaitingRoom from "@/components/WaitingRoom";
import CreatorAttribution from "@/components/CreatorAttribution";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import LeaderboardDisplay from "@/components/LeaderboardDisplay";
// First install emoji-mart: npm install emoji-mart @emoji-mart/data @emoji-mart/react
import Picker from "@emoji-mart/react";
import { ref, push, onValue } from "firebase/database";
import { db } from "@/lib/firebaseConfig";

const PlayerGameRoomPage: React.FC = () => {
  const { activeGame, currentPlayer, currentQuestion, submitAnswer, refreshGameState, joinGame, questionStartTime, questionEnded, deductPlayerScore, removePlayer } = useGame();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showLeaderboardAnimation, setShowLeaderboardAnimation] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  useEffect(() => {
    if (activeGame?.status === 'finished' && !confettiTriggered) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Set a timeout to clear confetti after some time
      setTimeout(() => {
        confetti.clear();
      }, 5000);

      // Set showLeaderboardAnimation to true to display the leaderboard
      setShowLeaderboardAnimation(true);
      setConfettiTriggered(true); // Mark confetti as triggered
    }
  }, [activeGame?.status, confettiTriggered]);



  const cardRef = useRef<HTMLDivElement>(null);
  const [pollingActive, setPollingActive] = useState(true);

  // Effect to handle initial game state loading from URL params
  useEffect(() => {
    const gameIdFromUrl = searchParams.get("gameId");
    const playerIdFromUrl = searchParams.get("playerId");

    if (gameIdFromUrl && !activeGame) {
      // If there's a gameId in the URL but no active game in context,
      // attempt to re-join or refresh the game state.
      // Pass playerIdFromUrl to refreshGameState to help identify the player.
      refreshGameState(gameIdFromUrl, playerIdFromUrl);
    }
  }, [activeGame, searchParams, refreshGameState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
  }, []);
  
  const resetTilt = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  }, []);
  
  // Enhanced polling with error handling
  useEffect(() => {
    if (!pollingActive) return;
    
    const interval = setInterval(() => {
      try {
        refreshGameState();
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Error refreshing game state:", error);
        setConnectionStatus("connecting");
      }
    }, 200); // More frequent for better real-time feeling
    
    // Simulate occasional network hiccups for UI feedback
    const connectionCheck = setInterval(() => {
      const simulateNetworkDelay = Math.random() > 0.95;
      if (simulateNetworkDelay) {
        setConnectionStatus("connecting");
        setTimeout(() => setConnectionStatus("connected"), 1000);
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, [refreshGameState, pollingActive]);
  
  const [gameStartedToastShown, setGameStartedToastShown] = useState(false);
  const [tabSwitchPenaltyApplied, setTabSwitchPenaltyApplied] = useState(false);

  // Handle game status transitions
  useEffect(() => {
    if (activeGame?.status === "active" && currentQuestion && !gameStartedToastShown) {
      // Game just started
      toast({
        title: "Game started!",
        description: "The quiz has begun",
      });
      setGameStartedToastShown(true);
    }
  }, [activeGame?.status, currentQuestion, toast, gameStartedToastShown]);

  // Effect to handle tab switching penalty
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeGame?.status === 'active') {
        if (!tabSwitchPenaltyApplied) {
          setTabSwitchPenaltyApplied(true);
          if (currentPlayer) {
            deductPlayerScore(currentPlayer.player_id, 4);
          }
          toast({
            title: "Warning!",
            description: "You switched tabs during the game. 4 points have been deducted.",
            variant: "destructive",
          });
        } else if (currentPlayer) {
          deductPlayerScore(currentPlayer.player_id, 4);
          removePlayer(currentPlayer.player_id);
          toast({
            title: "Removed from Game",
            description: "You have been removed from the game for repeatedly switching tabs.",
            variant: "destructive",
          });
          navigate('/join'); // Redirect player out of the game
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeGame?.status, currentPlayer, toast, tabSwitchPenaltyApplied]);
  
  const handleAnswerSubmit = (questionId: string, optionId: string) => {

    submitAnswer(questionId, optionId);
    
    // Confetti effect on answer submission
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    
    toast({
      title: "Answer submitted!",
      description: "Your answer has been recorded.",
    });
  };
  
  const handleLeaveGame = () => {
    const leaveGameConfirmation = window.confirm("Are you sure you want to leave the game?");
    if (leaveGameConfirmation) {
      <button onClick={() => removePlayer(currentPlayer.player_id)}>
        Leave Game
      </button>
      removePlayer(currentPlayer.player_id);
      navigate("/");
      toast({
        title: "Left game",
        description: "You've successfully left the game",
      });
    }
  };
  
  const handleManualRefresh = () => {
    setConnectionStatus("connecting");
    refreshGameState();
    setTimeout(() => {
      setConnectionStatus("connected");
      toast({
        title: "Refreshed",
        description: "Game state updated",
      });
    }, 600);
  };

  const hasAnsweredCurrentQuestion = () => {
    if (!currentPlayer || !currentQuestion) return false;
    const answers = Array.isArray(currentPlayer.answers) ? currentPlayer.answers : [];
    return answers.some(a => a.questionId === currentQuestion.id);
  };
  
  // --- Emoji Chat State ---
  const [emojiMessage, setEmojiMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiChat, setEmojiChat] = useState<any[]>([]);
  const [animatedEmojis, setAnimatedEmojis] = useState<{
    avatar: any;emoji: string, player: string, id: string
}[]>([]);
  const [emojiBan, setEmojiBan] = useState(false);
  const [emojiTimestamps, setEmojiTimestamps] = useState<number[]>([]);

  // Listen for emoji chat updates
  useEffect(() => {
    if (!activeGame?.id) return;
    const chatRef = ref(db, `games/${activeGame.id}/emojiChat`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      setEmojiChat(Object.values(data));
    });
    return () => unsubscribe();
  }, [activeGame?.id]);

  // Send emoji to Firebase
  const handleSendEmoji = async () => {
    if (emojiBan || !emojiMessage || !activeGame?.id || !currentPlayer) return;

    // Spam protection: max 5 emojis in 10 seconds
    const now = Date.now();
    const recent = emojiTimestamps.filter(ts => now - ts < 10000);
    if (recent.length >= 5) {
      setEmojiBan(true);
      setTimeout(() => setEmojiBan(false), 60000); // Ban for 1 minute
      setEmojiTimestamps([]);
      toast({
        title: "Emoji Ban",
        description: "You sent too many emojis! Wait 1 minute before sending more.",
        variant: "destructive",
      });
      return;
    }
    setEmojiTimestamps([...recent, now]);

    await push(ref(db, `games/${activeGame.id}/emojiChat`), {
      emoji: emojiMessage,
      player: currentPlayer.nickname,
      avatar: currentPlayer.avatar || "",
      timestamp: now,
    });
    setEmojiMessage("");
  };

  // Listen for new emoji messages and trigger animation
  useEffect(() => {
    if (!activeGame?.id) return;
    const chatRef = ref(db, `games/${activeGame.id}/emojiChat`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const arr = Object.entries(data).map(([id, msg]: any) => ({ ...msg, id }));
      setEmojiChat(arr);

      // Animate only the latest emoji
      if (arr.length > 0) {
        const last = arr[arr.length - 1];
        setAnimatedEmojis((prev) => [
          ...prev,
          { avatar: last.avatar, emoji: last.emoji, player: last.player, id: last.id }
        ]);
        // Remove after animation duration (e.g., 2.5s)
        setTimeout(() => {
          setAnimatedEmojis((prev) => prev.filter(e => e.id !== last.id));
        }, 2500);
      }
    });
    return () => unsubscribe();
  }, [activeGame?.id]);

  const renderContent = () => {
    const gameIdFromUrl = searchParams.get("gameId");

    if (!gameIdFromUrl) {
      navigate("/join");
      return null; // Redirecting, so nothing to render here
    }

    if (!activeGame) {
      console.log("PlayerGameRoomPage: activeGame is null. Displaying loading state.");
      return (
        <div className="text-center space-y-4">
          <p className="dark:text-gray-300">Loading game or game not found...</p>
          <div className="flex justify-center space-x-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      );
    }

    console.log("PlayerGameRoomPage: Current activeGame status:", activeGame.status);
    console.log("PlayerGameRoomPage: activeGame.players:", activeGame.players);
    console.log("PlayerGameRoomPage: activeGame.quiz:", activeGame.quiz);

    if (activeGame.status === "ended") {

      console.log("PlayerGameRoomPage: Game status is 'finished'. Navigating to LeaderAnimationPage.");
      navigate('/leader-animation', {
        state: {
          players: activeGame.players,
          activeQuiz: activeGame.quiz,
          currentQuestionIndex: activeGame.quiz.questions.length - 1, // Assuming last question index
          isHost: false, // Indicate that this is a player viewing the page
        }
      });
      return (
        <div className={`space-y-6 transition-opacity duration-1000 ${showLeaderboardAnimation ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-quiz-dark dark:text-white">
              Game Results
            </h2>
            <Button 
              onClick={() => navigate('/')} 
              className="quiz-btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>
          {activeGame.players && activeGame.quiz ? (
            <LeaderboardDisplay 
              players={activeGame.players}
              activeQuiz={activeGame.quiz}
              showScores={activeGame.showScores} // Changed from true to activeGame.showScores
              hasHostSubmitted={activeGame.hostSubmitted}
            />
          ) : (
            <div className="text-center text-red-500 py-8 text-lg">
              Error: Player data or quiz data missing for leaderboard.
            </div>
          )}
        </div>
      );
    }

    if (activeGame.status === "waiting") {
      return (
        <WaitingRoom
          nickname={currentPlayer?.nickname || "Player"}
          players={activeGame.players}
          onStartGame={() => {}}
          cardRef={cardRef}
          handleMouseMove={handleMouseMove}
          resetTilt={resetTilt}
          gameCode={activeGame.code}
          isHost={false}
          onRefreshPlayers={handleManualRefresh}
        />
      );
    }

    if (currentQuestion) {
      const disableOptions = hasAnsweredCurrentQuestion();
      // Show waiting spinner only if questionStartTime is missing
      if (!questionStartTime) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Waiting for host to start the question...</p>
          </div>
        );
      }

      return (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium dark:text-gray-300">
            <h2 className="text-2xl font-bold text-quiz-dark dark:text-white">
              Question {activeGame.currentQuestionIndex + 1} of {activeGame.quiz.questions.length}
            </h2>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className={`inline-block w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-amber-500 animate-pulse"}`}></span>
              <span className="dark:text-gray-300">{connectionStatus === "connected" ? "Connected" : "Connecting..."}</span>
            </div>
          </div>

          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            className="transition-all duration-300"
          >
            {currentQuestion && (
                    <QuestionDisplay
                      question={currentQuestion}
                      onAnswer={handleAnswerSubmit}
                      disableOptions={hasAnsweredCurrentQuestion() || questionEnded}
                      showCorrectAnswer={questionEnded}
                    />
            )}

            {questionEnded && (
              <div className="mt-8 text-center">
                <h3 className="text-2xl font-bold">Time's Up!</h3>
                {activeGame?.players && activeGame.players.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xl font-semibold">Your Score: {currentPlayer?.score || 0}</h4>
                  </div>
                )}
              </div>
            )}
          </div>

          {hasAnsweredCurrentQuestion() && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <p className="text-gray-700 dark:text-gray-300">
               
              </p>
              <div className="flex justify-center space-x-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {currentPlayer && (
            <>
              <div className="flex items-center justify-between bg-gray-800/50 dark:bg-gray-900/50 p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 border-2 border-indigo-400">
                    <AvatarImage src={currentPlayer?.avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${currentPlayer?.nickname}`} />
                    <AvatarFallback>{typeof currentPlayer?.nickname === 'string' && currentPlayer.nickname.length > 0 ? currentPlayer.nickname.charAt(0).toUpperCase() : ''}</AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-lg text-white">{currentPlayer?.nickname}</p>
                </div>
              </div>
              
              <LeaderboardDisplay
                players={activeGame.players}
                activeQuiz={activeGame.quiz}
                showScores={activeGame.showScores} // Changed from true to activeGame.showScores
                hasHostSubmitted={activeGame.hostSubmitted}
              />
            </>
          )}
        </div>
      );
    }

    return (
      <div className="text-center space-y-4">
        <p className="dark:text-gray-300">Waiting for host to select the next question...</p>
        <div className="flex justify-center space-x-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  };
  
  return (
    <BackgroundContainer>
      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 space-y-8">
        <Logo />
        
        <div className="w-full max-w-4xl space-y-6">
          {renderContent()}
        </div>
      </div>

      {/* Emoji Sharing UI */}
      <div className="mt-4 mb-2">
        <div className="flex items-center">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="mr-2 px-2 py-1 rounded bg-gray-200"
            title="Pick Emoji"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute z-50">
              <Picker
                onEmojiSelect={emoji => {
                  // emoji object has .native in emoji-mart v5+
                  setEmojiMessage((emoji as any).native);
                  setShowEmojiPicker(false);
                }}
                theme="dark"
              />
            </div>
          )}
          <input
            type="text"
            value={emojiMessage}
            onChange={e => setEmojiMessage(e.target.value)}
            placeholder="Send emoji..."
            className="border rounded px-2 py-1 w-24"
          />
          <button
            onClick={handleSendEmoji}
            className="ml-2 px-3 py-1 bg-purple-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>

{animatedEmojis.map((item) => (
  <div
    key={item.id}
    className="emoji-fall-cool"
    style={{
      left: `${30 + Math.random() * 40}%`,
      animationDuration: "5s", // Slower animation (was 2.8s)
    }}
  >
    <div className="emoji-bounce-spin" style={{ fontSize: "1.25rem" }}>{item.emoji}</div>
    <div className="emoji-sender flex items-center justify-center gap-2">
      {item.avatar && (
        <img
          src={item.avatar}
          alt={item.player}
          className="w-5 h-5 rounded-full border border-white shadow"
        />
      )}
      <span style={{ fontSize: "0.95rem" }}>{item.player}</span>
    </div>
  </div>
))}

      {/* Emoji Fall Animation CSS */}
      <style>{`
.emoji-fall-cool {
  position: fixed;
  top: -40px;
  font-size: 1.25rem;
  z-index: 9999;
  pointer-events: none;
  text-align: center;
  width: 48px;
  margin-left: -24px;
  filter: drop-shadow(0 2px 8px #0008);
  animation: emojiCoolFall 5s cubic-bezier(.4,1.5,.5,1) forwards; /* Slower */
  opacity: 0.95;
}
        }
        .emoji-fall-cool {
          position: fixed;
          top: -60px;
          font-size: 2.8rem;
          z-index: 9999;
          pointer-events: none;
          text-align: center;
          width: 120px;
          margin-left: -60px;
          filter: drop-shadow(0 4px 16px #0008);
          animation: emojiCoolFall 2.8s cubic-bezier(.4,1.5,.5,1) forwards;
          opacity: 0.95;
        }
        .emoji-bounce-spin {
          display: inline-block;
          animation: emojiBounceSpin 1.2s cubic-bezier(.68,-0.55,.27,1.55) 1;
          filter: drop-shadow(0 0 12px #fff8) drop-shadow(0 0 24px #a5b4fc);
        }
        .emoji-sender {
          font-size: 1.1rem;
          color: #fff;
          text-shadow: 0 2px 8px #000a, 0 0 2px #a5b4fc;
          font-weight: bold;
          letter-spacing: 0.5px;
          margin-top: 0.2em;
          animation: emojiSenderFade 2.2s ease;
        }
        @keyframes emojiCoolFall {
          0% {
            transform: translateY(-60px) scale(1.3) rotate(-20deg);
            opacity: 0.7;
            filter: blur(2px) drop-shadow(0 0 16px #a5b4fc);
          }
          20% {
            opacity: 1;
            filter: blur(0px) drop-shadow(0 0 24px #a5b4fc);
          }
          60% {
            transform: translateY(60vh) scale(1.7) rotate(12deg);
            opacity: 1;
            filter: blur(0px) drop-shadow(0 0 32px #a5b4fc);
          }
          90% {
            filter: blur(1px) drop-shadow(0 0 8px #a5b4fc);
          }
          100% {
            transform: translateY(85vh) scale(2.1) rotate(24deg);
            opacity: 0;
            filter: blur(4px) drop-shadow(0 0 0px #a5b4fc);
          }
        }
        @keyframes emojiBounceSpin {
          0% { transform: scale(0.7) rotate(-40deg);}
          40% { transform: scale(1.3) rotate(20deg);}
          70% { transform: scale(1.1) rotate(-10deg);}
          100% { transform: scale(1) rotate(0);}
        }
        @keyframes emojiSenderFade {
          0% { opacity: 0; transform: translateY(-10px);}
          20% { opacity: 1; transform: translateY(0);}
          90% { opacity: 1;}
          100% { opacity: 0; transform: translateY(10px);}
        }
      `}</style>
    </BackgroundContainer>
  );
};

export default PlayerGameRoomPage;