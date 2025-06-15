
import { useState, useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { generateGameCode } from '@/utils/gameUtils';
import { useToast } from '@/components/ui/use-toast';
import { db, auth } from '@/lib/firebaseConfig';
import { ref, set, push, get } from 'firebase/database';

export const useGameState = () => {
  const [activeGame, setActiveGame] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);

  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [questionEnded, setQuestionEnded] = useState<boolean>(false);
  const { toast } = useToast();

  const createGame = useCallback(async (quiz: Quiz): Promise<{ success: boolean; message?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to create a game.',
        };
      }

      // The quiz object is now passed directly, no need to find it from local storage.

      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found.',
        };
      }

      // Generate unique game code
      const gamesRef = ref(db, 'games');
      const code = generateGameCode();
      
      // Check if code already exists
      const existingGamesSnapshot = await get(gamesRef);
      if (existingGamesSnapshot.exists()) {
        const games = existingGamesSnapshot.val();
        const codeExists = Object.values(games).some((game: any) => game.code === code);
        if (codeExists) {
          return {
            success: false,
            message: 'Failed to generate unique game code. Please try again.',
          };
        }
      }

      // Create a new game room in Realtime Database
      const newGameRef = push(gamesRef); // This generates a unique ID
      const gameId = newGameRef.key;

      if (!gameId) {
        return {
          success: false,
          message: 'Failed to generate game ID.',
        };
      }

      const gameData = {
        id: gameId,
        code,
        quiz: {
          ...quiz,
          questions: quiz.questions.map(question => ({
            ...question,
            imageUrl: question.imageUrl || '', // Ensure imageUrl is a string
          })),
        },
        hostId: user.uid,
        status: 'waiting',
        currentQuestionIndex: -1,
        players: {
          [user.uid]: {
            id: user.uid,
            player_id: user.uid,
            nickname: user.displayName || 'Host',
            score: 0,
            answers: []
          },
        },
        startTime: null,
        endTime: null,
        scores: {},
        answers: {}
      };

      // Save the game data
      await set(newGameRef, gameData);

      // Update local state
      const gameRoom = {
        ...gameData,
        players: Object.values(gameData.players),
        showScores: false
      } as unknown as GameRoom;
      
      setActiveGame(gameRoom);
      setCurrentQuiz(quiz);
      setIsHost(true);
      setCurrentPlayer(gameData.players[user.uid]);

      toast({
        title: 'Game Created!',
        description: `Share code ${code} with your players`,
      });

      return {
        success: true,
        message: `Game created successfully with code ${code}`
      };

    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game. Please try again.',
        variant: 'destructive'
      });
      return {
        success: false,
        message: 'Failed to create game. Please try again.'
      };
    }
  }, [setActiveGame, setCurrentQuiz, setIsHost, setCurrentPlayer, toast]);

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
    showCorrectAnswer: activeGame?.showScores || false,
    questionStartTime,
    setQuestionStartTime,
    questionEnded,
    setQuestionEnded,
    createGame
  };
};
