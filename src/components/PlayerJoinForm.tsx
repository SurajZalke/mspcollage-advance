
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { use3DTilt } from "@/utils/animationUtils";
import { AlertCircle, Check, Info } from "lucide-react";

const PlayerJoinForm: React.FC = () => {
  const [gameCode, setGameCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
  const { joinGame } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cardRef, handleMouseMove, resetTilt } = use3DTilt();

  // Demo codes for easy testing
  const demoCodes = ["TEST12", "DEMO01", "PLAY22", "QUIZ99", "FUN123"];
  const randomDemoCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];

  useEffect(() => {
    // Basic client-side validation
    if (gameCode.length === 6) {
      // Format matches expected pattern
      setIsValidCode(true);
    } else if (gameCode.length > 0) {
      setIsValidCode(false);
    } else {
      setIsValidCode(null);
    }
  }, [gameCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setErrorMessage(null);

    if (!gameCode) {
      setErrorMessage("Please enter a game code");
      setIsJoining(false);
      return;
    }

    if (!nickname) {
      setErrorMessage("Please enter a nickname");
      setIsJoining(false);
      return;
    }

    try {      
      const result = joinGame(gameCode.toUpperCase(), nickname.trim());
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "You've joined the game!",
        });
        navigate("/game-room");
      } else {
        throw new Error(result.message || "Failed to join game");
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        variant: "destructive",
        title: "Error joining game",
        description: error.message,
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDemoCode = () => {
    setGameCode(randomDemoCode);
    setIsValidCode(true);
    toast({
      title: "Demo code applied!",
      description: `Using code: ${randomDemoCode}`,
      variant: "default"
    });
  };

  return (
    <Card 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="quiz-card shadow-lg w-full max-w-md mx-auto transition-all duration-300 hover:shadow-xl glass-dark border-2 border-indigo-300/30"
    >
      <CardContent className="pt-6">
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-quiz-dark">Join a Quiz Game</h2>
            <p className="text-gray-500 dark:text-gray-300 text-sm">Enter the game code and your nickname to join</p>
            <button 
              type="button" 
              onClick={handleDemoCode}
              className="text-amber-500 text-sm animate-pulse hover:text-amber-600 focus:outline-none underline flex items-center gap-1"
            >
              <Info size={14} />
              <span>Try demo code: {randomDemoCode}</span>
            </button>
          </div>
          
          {errorMessage && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive rounded-md px-3 py-2 flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="GAME CODE"
                className={`quiz-input text-center text-2xl font-bold tracking-widest uppercase ${
                  isValidCode === true ? 'border-green-500 focus:ring-green-500' : 
                  isValidCode === false ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                value={gameCode}
                onChange={(e) => {
                  // Allow only alphanumeric characters and limit to 6 chars
                  const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 6);
                  setGameCode(value.toUpperCase());
                }}
                maxLength={6}
              />
              {isValidCode === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                  <Check size={20} />
                </div>
              )}
            </div>
            
            <div className="transform transition-all duration-300 hover:scale-105">
              <Input
                type="text"
                placeholder="Your nickname"
                className="quiz-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="quiz-btn-primary w-full transform transition-all duration-300 hover:scale-105 animate-pulse-scale"
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlayerJoinForm;
