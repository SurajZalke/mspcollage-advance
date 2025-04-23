
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { use3DTilt } from "@/utils/animationUtils";
import { AlertCircle } from "lucide-react";

const PlayerJoinForm: React.FC = () => {
  const [gameCode, setGameCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { joinGame } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cardRef, handleMouseMove, resetTilt } = use3DTilt();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setErrorMessage(null);

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

  return (
    <Card 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="quiz-card shadow-lg w-full max-w-md mx-auto transition-all duration-300 hover:shadow-xl glass-dark"
    >
      <CardContent className="pt-6">
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-quiz-dark">Join a Quiz Game</h2>
            <p className="text-gray-500 dark:text-gray-300 text-sm">Enter the game code and your nickname to join</p>
            <p className="text-amber-500 text-sm animate-pulse">Try code: TEST12</p>
          </div>
          
          {errorMessage && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive rounded-md px-3 py-2 flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="transform transition-all duration-300 hover:scale-105">
              <Input
                type="text"
                placeholder="GAME CODE"
                className="quiz-input text-center text-2xl font-bold tracking-widest uppercase"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                maxLength={6}
              />
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
