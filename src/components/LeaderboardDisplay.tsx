

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Player, Quiz } from "@/types";

// Add prop for quiz info, to display marking
interface LeaderboardDisplayProps {
  players: Player[];
  activeQuiz?: Quiz;
  showScores?: boolean;
  hasHostSubmitted?: boolean;
}

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ players, activeQuiz, showScores = false, hasHostSubmitted = false }) => {
  // Include host in the players list if they exist
  const allPlayers = players.map(player => ({
    ...player,
    isHost: player.player_id === activeQuiz?.createdBy
  }));
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);

  // Show marking type summary
  const markingType = activeQuiz
    ? activeQuiz.hasNegativeMarking
      ? `Negative Marking: -${activeQuiz.negativeMarkingValue}%`
      : "Simple Marking"
    : undefined;

  return (
    <Card className="quiz-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-quiz-dark">
          Leaderboard
        </CardTitle>
        {markingType && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {markingType}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {sortedPlayers.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No players yet
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div 
                key={`${player.id}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 
                    ? "bg-yellow-100 border border-yellow-200 animate-winner"
                    : index === 1 
                    ? "bg-slate-100 border border-slate-200"
                    : index === 2 
                    ? "bg-orange-100 border border-orange-200"
                    : "bg-gray-50 border border-gray-100"
                }`} 
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 
                      ? "bg-yellow-400 text-gray-900" 
                      : index === 1 
                      ? "bg-slate-400 text-slate-900"
                      : index === 2 
                      ? "bg-orange-400 text-orange-900"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={player.avatar || ''} />
                    <AvatarFallback>{typeof player.nickname === 'string' && player.nickname.length > 0 ? player.nickname.charAt(0).toUpperCase() : ''}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-black-100">{player.nickname}</span>
                    {player.isHost && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Host</span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-quiz-primary">{(showScores && hasHostSubmitted) ? player.score : '...'}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardDisplay;

