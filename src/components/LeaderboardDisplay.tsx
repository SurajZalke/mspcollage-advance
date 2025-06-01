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
            <path d="M11.25 1.5V8.25H9.375C8.339 8.25 7.5 9.089 7.5 10.125V11.25c0 .621.504 1.125 1.125 1.125h.375v1.5H7.5c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 001.125 1.125h9a1.125 1.125 0 001.125-1.125v-3c0-.621-.504-1.125-1.125-1.125H15v-1.5h.375c.621 0 1.125-.504 1.125-1.125V10.125C16.5 9.089 15.661 8.25 14.625 8.25H12.75V1.5h-1.5zM9.375 9.75h5.25c.207 0 .375.168.375.375v.75H9V10.125c0-.207.168-.375.375-.375zm1.125 3h3v1.5h-3v-1.5z" />
          </svg>
        );
      case 1:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
               className="w-6 h-6 text-gray-400">
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
          </svg>
        );
      case 2:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
               className="w-6 h-6 text-amber-500">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
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
                {showScores && (
                  <div className="text-gray-600 text-lg font-semibold">
                     {(showScores && hasHostSubmitted) ? player.score : '...'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardDisplay;