
import React, { createContext, useContext, useEffect, useState } from "react";
import { GameRoom, Player, Quiz, Question } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { useGameActions } from "@/hooks/useGameActions";
import { useGameValidation } from "@/hooks/useGameValidation";
import { initTestGames, activeGamesStore } from "@/store/gameStore";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

interface GameContextType {
  activeGame: GameRoom | null;
  currentPlayer: Player | null;
  currentQuiz: Quiz | null;
  currentQuestion: Question | null;
  isHost: boolean;
  createGame: (quizId: string) => Promise<GameRoom>;
  joinGame: (code: string, nickname: string) => Promise<{ success: boolean; message?: string }>;
  validateGameCode: (code: string) => Promise<{ valid: boolean; message?: string }>;
  startGame: () => Promise<void>;
  endGame: () => Promise<void>;
  submitAnswer: (questionId: string, optionId: string) => Promise<void>;
  nextQuestion: () => Promise<void>;
  refreshGameState: () => Promise<void>;
  getAvailableGameCodes: () => Promise<string[]>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [gameSubscription, setGameSubscription] = useState<any>(null);
  const {
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
  } = useGameState();

  const {
    startGame,
    endGame,
    submitAnswer,
    nextQuestion
  } = useGameActions(activeGame, setActiveGame, currentPlayer, currentQuestion, currentQuiz);

  const {
    validateGameCode,
    getAvailableGameCodes
  } = useGameValidation();

  // Initialize real-time subscriptions
  useEffect(() => {
    if (activeGame?.code) {
      // Unsubscribe from any existing subscription before creating a new one
      if (gameSubscription) {
        gameSubscription.unsubscribe();
      }

      // Subscribe to game changes
      const subscription = supabase
        .channel(`game:${activeGame.code}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${activeGame.code}`
        }, async (payload) => {
          console.log('Real-time update received:', payload);
          await refreshGameState();
        })
        .subscribe();

      setGameSubscription(subscription);

      return () => {
        console.log(`Unsubscribing from game:${activeGame.code}`);
        subscription.unsubscribe();
      };
    } else if (gameSubscription) {
       // If activeGame becomes null, unsubscribe from the current game
       console.log('Unsubscribing due to activeGame becoming null');
       gameSubscription.unsubscribe();
       setGameSubscription(null);
    }
  }, [activeGame?.code]); // Depend on activeGame.code to re-subscribe when game changes

  // Update current question on game/quiz changes and game status
  useEffect(() => {
    if (activeGame && currentQuiz && activeGame.status === "active") {
      const questionIndex = activeGame.currentQuestionIndex;
      if (questionIndex >= 0 && questionIndex < currentQuiz.questions.length) {
        setCurrentQuestion(currentQuiz.questions[questionIndex]);
      } else {
        // Game is active but no more questions, maybe end game or show results
        setCurrentQuestion(null);
        // Consider adding logic here to transition to a results state or end the game
      }
    } else {
      setCurrentQuestion(null);
    }
  }, [activeGame, currentQuiz]); // Depend on activeGame and currentQuiz

  const refreshGameState = async () => {
    if (!activeGame?.code) return; // Ensure activeGame and its code exist

    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*, players(*)')
        .eq('code', activeGame.code) // Use activeGame.code for the query
        .single();

      if (gameError) {
        console.error('Error fetching game data during refresh:', gameError);
        toast({
          title: "Error",
          description: "Failed to fetch latest game data.",
          variant: "destructive"
        });
        // Do not clear state on error, as the previous state might still be valid.
        return; // Stop execution on error
      }

      if (!gameData) { // Explicitly check for null/undefined data
         console.log('Game data is null during refresh, clearing state.');
         setActiveGame(null);
         setCurrentPlayer(null);
         setCurrentQuiz(null);
         setCurrentQuestion(null);
         setIsHost(false);
         toast({
           title: "Game Update",
           description: "The game state could not be refreshed or the game has ended.",
         });
         // Optionally navigate user away if game is gone
         // navigate('/'); // Uncomment if you want to redirect users when game disappears
         return; // Stop execution if no game data
      }

      // If we reach here, gameData is valid
      setActiveGame(gameData);

      // Fetch quiz data if not host and quiz_id is available, or if currentQuiz is null
      // This ensures quiz data is loaded on initial join/refresh even for host if not already loaded
      if (gameData.quiz_id && (!currentQuiz || currentQuiz.id !== gameData.quiz_id)) {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', gameData.quiz_id)
          .single();

        if (quizError) {
           console.error('Error fetching quiz data during refresh:', quizError);
           // Continue without quiz data, game state might be incomplete
        } else if (quizData) {
          setCurrentQuiz(quizData);
        }
      }

      // Update current player data if they exist in the updated game data
      const { data: { user: authenticatedUser } } = await supabase.auth.getUser();
      if (authenticatedUser) {
        const userId = authenticatedUser.id;
        const updatedPlayerData = gameData.players.find((p: Player) => p.player_id === userId); // Use player_id from game_players table
        if (updatedPlayerData) {
          setCurrentPlayer(updatedPlayerData);
          // Also update isHost based on the fetched game data
          setIsHost(gameData.host_id === userId); // Use host_id from games table
        } else {
           // Current player not found in the game, maybe they were removed or game ended?
           console.warn('Authenticated user not found in refreshed game data players list.');
           // Clear player state if they are no longer in the game
           setCurrentPlayer(null);
           setIsHost(false);
          }
      } else if (currentPlayer) {
         // If no authenticated user but currentPlayer state exists, clear it
         console.warn('No authenticated user found, clearing currentPlayer state.');
         setCurrentPlayer(null);
         setIsHost(false);
      }
    } catch (error: any) {
      console.error('An unexpected error occurred during game state refresh:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while refreshing game state.",
        variant: "destructive"
      });
    }
  };

  const joinGame = async (code: string, nickname: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!code || !nickname) {
        return {
          success: false,
          message: !code ? "Please enter a game code" : "Please enter a nickname",
        };
      }

      const upperCode = code.trim().toUpperCase();
      const validation = await validateGameCode(upperCode);

      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Check if game exists in database
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*, players(*)')
        .eq('code', upperCode)
        .single();

      if (gameError || !gameData) {
        console.error('Error fetching game data:', gameError);
        return {
          success: false,
          message: 'Game not found or has expired. Please check the code and try again.',
        };
      }

      // Check if nickname is taken
      if (gameData.players.some((p: Player) =>
        p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
      )) {
        return {
          success: false,
          message: `Nickname "${nickname}" is already taken in this game. Please choose another.`,
        };
      }

      // Check if user is authenticated and get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to join a game.',
        };
      }

      // Check if the user is already a player in this game using player_id
      const existingPlayer = gameData.players.find((p: Player) => p.player_id === user.id);
      if (existingPlayer) {
         // If player already exists, just set the current player and game state
         // refreshGameState will handle setting activeGame, currentPlayer, isHost, and currentQuiz
         await refreshGameState();
         toast({
           title: "Joined Game",
           description: `Welcome back to game ${upperCode}!`,
         });
         return { success: true };
      }

      // Add player to the game_players table
      const { error: playerInsertError } = await supabase
        .from('game_players')
        .insert({
          game_id: gameData.id,
          player_id: user.id, // Use Supabase user ID for the player
          nickname: nickname.trim(),
          score: 0,
        });

      if (playerInsertError) {
        console.error('Error inserting new player:', playerInsertError);
        return {
          success: false,
          message: 'Failed to add player to the game. Please try again.',
        };
      }

      // setIsHost(false); // refreshGameState will handle setting isHost

      // Refresh state to get the latest game data including the newly added player
      await refreshGameState();

      toast({
        title: "Joined Game",
        description: `Successfully joined game ${upperCode}!`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('An unexpected error occurred during game join:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  };

  const value = {
    activeGame,
    currentPlayer,
    currentQuiz,
    currentQuestion,
    isHost,
    createGame,
    joinGame,
    validateGameCode,
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    refreshGameState,
    getAvailableGameCodes
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Removed unused styles
// const avatarContainerStyle = {
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   gap: '10px',
// };

// const profileModalStyle = {
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: '20px',
// };

export default GameContext;

const avatarContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
};

const profileModalStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};