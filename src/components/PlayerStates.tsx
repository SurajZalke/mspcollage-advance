
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Player } from "@/types";

interface PlayerStatesProps {
  players: Player[];
  currentQuestionId?: string;
}

const PlayerStates: React.FC<PlayerStatesProps> = ({ players, currentQuestionId }) => {
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const playersAnswered = currentQuestionId ? 
    players.filter(p => p.answers.some(a => a.questionId === currentQuestionId)).length : 0;

  const toggleResults = () => {
    setShowResults(!showResults);
    toast({
      title: showResults ? "Results hidden" : "Results shown",
      description: showResults ? "Player answers are now hidden" : "Player answers are now visible",
    });
  };

  return (
    <div className="quiz-card p-4 transform hover:scale-[1.01] transition-all duration-300">
      <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-4">Player Responses</h3>
      <div className="flex items-center justify-between mb-4">
        <span>
          <span className="font-bold text-quiz-primary">{playersAnswered}</span>
          <span className="text-gray-600 dark:text-gray-300">/{players.length} answered</span>
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleResults}
          className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          {showResults ? "Hide Results" : "Show Results"}
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 p-3">
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
            {players.map((player, idx) => {
              const answer = currentQuestionId ? 
                player.answers.find(a => a.questionId === currentQuestionId) : null;
              return (
                <TableRow 
                  key={player.id}
                  className="transform hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <TableCell className="font-medium">{player.nickname}</TableCell>
                  <TableCell>
                    {answer ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Answered
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        Waiting
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {answer ? `${answer.timeToAnswer}s` : "-"}
                  </TableCell>
                  <TableCell>
                    {showResults ? (
                      answer ? (
                        answer.correct ? (
                          <span className="text-green-600 dark:text-green-400 font-bold animate-pulse-scale">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-bold animate-pulse-scale">✗</span>
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
  );
};

export default PlayerStates;
