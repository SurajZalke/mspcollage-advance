
import { useState, useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { activeGamesStore } from '@/store/gameStore';
import { generateGameCode, generatePlayerId } from '@/utils/gameUtils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

export const useGameState = () => {
  const [activeGame, setActiveGame] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const { toast } = useToast();

  const createGame = useCallback(async (quizId: string): Promise<GameRoom> => {
    // Load quiz data
    import('../utils/gameUtils').then(({ sampleQuizzes }) => {
      const quiz = sampleQuizzes.find(q => q.id === quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
        toast({
          title: "Quiz loaded",
          description: `"${quiz.title}" is ready to play`,
        });
      }
    });

    // Generate unique game code
    let gameCode;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      gameCode = generateGameCode();
      attempts++;
      if (attempts >= maxAttempts) {
        gameCode = `G${Math.floor(Date.now() % 1000000).toString().padStart(5, '0')}`;
        break;
      }
    } while (activeGamesStore[gameCode]);

    const newGame: GameRoom = {
      id: `game_${Math.random().toString(36).substr(2, 9)}`,
      code: gameCode,
      hostId: "currentUserId",
      quizId,
      players: [],
      status: "waiting",
      currentQuestionIndex: -1
    };

    // Insert the new game into Supabase
    const { data, error } = await supabase
      .from('games')
      .insert([newGame])
      .select()
      .single();

    if (error) {
      console.error('Error creating game in Supabase:', error);
      toast({
        title: "Error creating game",
        description: error.message,
        variant: "destructive"
      });
      throw new Error('Failed to create game');
    }

    // Set active game and host status from the data returned by Supabase
    setActiveGame(data);
    setIsHost(true);

    toast({
      title: "Game created!",
      description: `Share code ${gameCode} with your players`,
    });

    return data;
  }, [toast]);

  return {
    activeGame,
    setActiveGame,
    currentPlayer,
    setCurrentPlayer,
    currentQuiz,
    setCurrentQuiz,
    currentQuestion,
    setCurrentQuestion,
    isHost,
    setIsHost,
    createGame
  };
};
