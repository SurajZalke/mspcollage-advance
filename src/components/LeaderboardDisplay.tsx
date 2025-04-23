
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types";

interface LeaderboardDisplayProps {
  players: Player[];
}

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ players }) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="quiz-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-quiz-dark">Leaderboard</CardTitle>
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
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 
                    ? "bg-yellow-50 border border-yellow-200" 
                    : index === 1 
                    ? "bg-gray-50 border border-gray-200"
                    : index === 2 
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-white border border-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 
                      ? "bg-yellow-400 text-yellow-800" 
                      : index === 1 
                      ? "bg-gray-400 text-gray-800"
                      : index === 2 
                      ? "bg-amber-400 text-amber-800"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.nickname}</span>
                </div>
                <span className="font-bold text-quiz-primary">{player.score}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardDisplay;
