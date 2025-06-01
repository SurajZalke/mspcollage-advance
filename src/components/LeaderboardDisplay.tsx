import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Player, Quiz } from "@/types";

interface LeaderboardDisplayProps {
  players: Player[];
  activeQuiz?: Quiz;
  showScores?: boolean;
  hasHostSubmitted?: boolean;
}

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ 
  players, 
  activeQuiz, 
  showScores = false, 
  hasHostSubmitted = false 
}) => {
  const allPlayers = players.map(player => ({
    ...player,
    isHost: player.player_id === activeQuiz?.createdBy
  }));
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
               className="w-6 h-6 text-yellow-500 animate-pulse">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        );
      case 1:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
               className="w-6 h-6 text-gray-400">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        );
      case 2:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
               className="w-6 h-6 text-amber-500">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
               className="w-5 h-5 text-blue-400">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-1.007.607-2.295-.217-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getBackgroundClass = (index: number) => {
    switch(index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300';
      case 1:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300';
      case 2:
        return 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const markingType = activeQuiz
    ? activeQuiz.hasNegativeMarking
      ? `Negative Marking: -${activeQuiz.negativeMarkingValue}%`
      : "Simple Marking"
    : undefined;

  return (
    <Card className="quiz-card shadow-lg border-0">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
        <CardTitle className="text-center text-xl font-bold text-gray-800">
          Leaderboard
        </CardTitle>
        {markingType && (
          <div className="text-xs text-gray-600 mt-1 text-center font-medium">
            {markingType}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {sortedPlayers.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-lg">
            No players yet
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div 
                key={`${player.id}-${index}`}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${getBackgroundClass(index)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white shadow-sm ${
                    index === 0 
                      ? 'text-yellow-500' 
                      : index === 1 
                      ? 'text-gray-600'
                      : index === 2 
                      ? 'text-amber-500'
                      : 'text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={player.avatar || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      {typeof player.nickname === 'string' && player.nickname.length > 0 
                        ? player.nickname.charAt(0).toUpperCase() 
                        : ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{player.nickname}</span>
                    {getRankIcon(index)}
                    {player.isHost && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                        Host
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-lg">
                    {(showScores && hasHostSubmitted) ? player.score : '...'}
                  </span>
                  <span className="text-xs text-gray-500">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardDisplay;