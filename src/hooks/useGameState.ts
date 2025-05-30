
import { useState, useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { generateGameCode } from '@/utils/gameUtils';
import { useToast } from '@/components/ui/use-toast';
import { db, auth } from '@/lib/firebaseConfig';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';

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
    let gameCode = generateGameCode();
    // In a real application, you'd check against existing game codes in your DB
    // For simplicity, we'll assume uniqueness or handle conflicts on insert

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newGame: GameRoom = {
      id: gameCode, // Using code as ID for simplicity in Firestore
      code: gameCode,
      hostId: user.uid,
      quizId,
      players: [], // Players will be stored in a subcollection
      status: "waiting",
      currentQuestionIndex: -1
    };

    try {
      await setDoc(doc(db, 'games', gameCode), newGame);

      // Add host as a player in a subcollection
      const playerRef = doc(collection(db, 'games', gameCode, 'players'), user.uid);
      await setDoc(playerRef, {
        player_id: user.uid,
        nickname: user.displayName || 'Host',
        score: 0,
      });

      // Fetch the created game data including the host player
      const createdGameSnap = await getDoc(doc(db, 'games', gameCode));
      if (!createdGameSnap.exists()) {
        throw new Error('Failed to retrieve created game data.');
      }
      const createdGameData = createdGameSnap.data() as GameRoom;
      // Manually add the host player to the fetched game data for immediate state update
      createdGameData.players = [{ player_id: user.uid, nickname: user.displayName || 'Host', score: 0 }];

      setActiveGame(createdGameData);
      setCurrentPlayer(createdGameData.players[0]);
      setIsHost(true);

      toast({
        title: "Game created!",
        description: `Share code ${gameCode} with your players`,
      });

      return createdGameData;
    } catch (error: any) {
      console.error('Error creating game in Firestore:', error);
      toast({
        title: "Error creating game",
        description: error.message,
        variant: "destructive"
      });
      throw new Error('Failed to create game');
    }
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
