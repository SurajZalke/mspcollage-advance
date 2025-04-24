
import React from "react";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WaitingRoomProps {
  players: Player[];
  onStartGame: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  resetTilt: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  onStartGame,
  cardRef,
  handleMouseMove,
  resetTilt
}) => {
  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="quiz-card p-6 transform hover:scale-[1.02] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-quiz-dark dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Waiting Room
        </h2>
        <Button 
          className="quiz-btn-primary"
          onClick={onStartGame}
          disabled={players.length === 0}
        >
          Start Quiz
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
          Players Joined: <span className="text-indigo-600 dark:text-indigo-400">{players.length}</span>
        </h3>
        
        {players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Waiting for players to join...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, idx) => (
                <TableRow 
                  key={player.id}
                  className="transform hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <TableCell className="font-medium">{player.nickname}</TableCell>
                  <TableCell>
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Ready
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
