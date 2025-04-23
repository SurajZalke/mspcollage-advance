
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { use3DTilt } from "@/utils/animationUtils";

const PlayerJoinForm: React.FC = () => {
  const [gameCode, setGameCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinGame } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cardRef, handleMouseMove, resetTilt } = use3DTilt();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);

    try {
      if (gameCode.length !== 6) {
        throw new Error("Game code must be 6 characters");
      }
      
      if (!nickname.trim()) {
        throw new Error("Please enter a nickname");
      }
      
      const joined = joinGame(gameCode.toUpperCase(), nickname.trim());
      
      if (joined) {
        toast({
          title: "Success!",
          description: "You've joined the game!",
        });
        navigate("/game-room");
      } else {
        throw new Error("Game not found. Check your game code.");
      }
    } catch (error: any) {
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
      className="quiz-card shadow-lg w-full max-w-md mx-auto transition-all duration-300 hover:shadow-xl"
    >
      <CardContent className="pt-6">
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-quiz-dark">Join a Quiz Game</h2>
            <p className="text-gray-500 text-sm">Enter the game code and your nickname to join</p>
          </div>
          
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
