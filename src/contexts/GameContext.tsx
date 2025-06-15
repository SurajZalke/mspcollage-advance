
import React, { createContext, useContext, useEffect, useState } from "react";
import { GameRoom, Player, Quiz, Question } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { useGameActions } from "@/hooks/useGameActions";
import { useGameValidation } from "@/hooks/useGameValidation";
import { initTestGames, activeGamesStore } from "@/store/gameStore";
import { db, auth } from "@/lib/firebaseConfig";
import { ref, get, set, update, onValue, push } from "firebase/database";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface GameContextType {
  activeGame: GameRoom | null;
  currentPlayer: Player | null;
  currentQuiz: Quiz | null;
  currentQuestion: Question | null;
  isHost: boolean;

  questionStartTime: number | null; // Timestamp when the current question started
  questionEnded: boolean; // New state to indicate if the question has ended
  setQuestionEnded: (ended: boolean) => void; // Function to set questionEnded state
  createGame: (quiz: Quiz) => Promise<{ success: boolean; message?: string }>;
  joinGame: (code: string, nickname: string) => Promise<{
    gameId: string | null;
    playerId: string | null; success: boolean; message?: string 
}>;
  validateGameCode: (code: string) => Promise<{ valid: boolean; message?: string }>;
  startGame: () => Promise<void>;
  endGame: () => Promise<void>;
  submitAnswer: (questionId: string, optionId: string) => Promise<void>;
  nextQuestion: () => Promise<void>;
  refreshGameState: (gameId?: string, playerId?: string) => Promise<void>;
  getAvailableGameCodes: () => Promise<string[]>;
  setCorrectAnswer: (questionId: string, correctOption: string) => Promise<void>;
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
  const navigate = useNavigate();
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

    questionStartTime,
    setQuestionStartTime,
    questionEnded,
    setQuestionEnded,
    createGame
  } = useGameState();

  const {
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    setCorrectAnswer
  } = useGameActions(activeGame, setActiveGame, currentPlayer, currentQuestion, currentQuiz, questionStartTime);

  const {
    validateGameCode,
    getAvailableGameCodes
  } = useGameValidation();

  // Initialize real-time subscriptions
  useEffect(() => {
    if (activeGame?.code) {
      // Unsubscribe from any existing subscription before creating a new one
      if (gameSubscription) {
        gameSubscription(); // onValue returns an unsubscribe function directly
      }

      // Subscribe to game changes using Realtime Database
      const gamesRef = ref(db, 'games');
      const gameRef = ref(db, `games/${activeGame.id}`);
      const unsubscribe = onValue(gameRef, async (snapshot) => {
        console.log('onValue listener triggered for game:', activeGame.id);
        if (snapshot.exists()) {
          console.log('Game snapshot exists, calling refreshGameState.');
          await refreshGameState();

        } else {
          console.log('Game document no longer exists, clearing state.');
          setActiveGame(null);
          setCurrentPlayer(null);
          setCurrentQuiz(null);
          setCurrentQuestion(null);
          setIsHost(false);
          toast({
            title: "Game Ended",
            description: "The game you were in has ended or was deleted.",
          });
        }
      });

      setGameSubscription(() => unsubscribe); // Store the unsubscribe function

      return () => {
        console.log(`Unsubscribing from game:${activeGame.code}`);
        unsubscribe();
      };
    } else if (gameSubscription) {
       // If activeGame becomes null, unsubscribe from the current game
       console.log('Unsubscribing due to activeGame becoming null');
       gameSubscription(); // Call the stored unsubscribe function
       setGameSubscription(null);
    }
  }, [activeGame?.id]); // Depend on activeGame.id to re-subscribe when game changes

  // Ensure questionEnded reflects activeGame.showScores
  useEffect(() => {
    if (activeGame?.showScores) {
      setQuestionEnded(true);
    } else {
      setQuestionEnded(false);
    }
  }, [activeGame?.showScores]);

  // Effect to handle question timer ending for the host
  useEffect(() => {
    if (isHost && activeGame?.status === "active" && currentQuestion && questionStartTime && !activeGame.showScores) {
      const now = Date.now();
      const elapsed = Math.floor((now - questionStartTime) / 1000);
      const remaining = currentQuestion.timeLimit - elapsed;

      if (remaining <= 0) {
        // Time is up, update showScores and hostSubmitted in the database
        const gameRef = ref(db, `games/${activeGame.id}`);
        update(gameRef, { showScores: true, hostSubmitted: true })
          .catch(error => console.error("Error updating showScores and hostSubmitted on timer end:", error));
      } else {
        // Set a timeout to trigger when the time runs out
        const timerTimeout = setTimeout(() => {
          const gameRef = ref(db, `games/${activeGame.id}`);
          update(gameRef, { showScores: true, hostSubmitted: true })
            .catch(error => console.error("Error updating showScores and hostSubmitted on timer end:", error));
        }, remaining * 1000);

        return () => clearTimeout(timerTimeout);
      }
    }
  }, [isHost, activeGame?.status, activeGame?.id, currentQuestion, questionStartTime, activeGame?.showScores]);

  // Update current question on game/quiz changes and game status
  useEffect(() => {


    if (activeGame && currentQuiz && activeGame.status === "active") {
      const questionIndex = activeGame.currentQuestionIndex;
      console.log('currentQuestionIndex:', questionIndex);

      if (questionIndex >= 0 && questionIndex < currentQuiz.questions.length) {
        setCurrentQuestion(currentQuiz.questions[questionIndex]);
        console.log('Setting currentQuestion to:', currentQuiz.questions[questionIndex]);
      } else {
        console.log('currentQuestionIndex out of bounds or no more questions. Setting currentQuestion to null.');
        setCurrentQuestion(null);
        // Game is active but no more questions, maybe end game or show results
        // Consider adding logic here to transition to a results state or end the game
      }
    } else {
      console.log('Game not active or currentQuiz is null. Setting currentQuestion to null.');
      setCurrentQuestion(null);
    }
  }, [activeGame, currentQuiz]); // Depend on activeGame and currentQuiz

  const refreshGameState = async (gameIdFromParam?: string, playerIdFromParam?: string) => {
    const targetGameId = gameIdFromParam || activeGame?.id;
    if (!targetGameId) {
      console.log('refreshGameState: No targetGameId, returning.');
      return; // Ensure a game ID exists to refresh
    }

    try {
      console.log('refreshGameState: Attempting to fetch game data for ID:', targetGameId);
      const gameRef = ref(db, 'games/' + targetGameId);
      const gameSnapshot = await get(gameRef);

      if (!gameSnapshot.exists()) {
        console.log('refreshGameState: Game data is null during refresh, clearing state.');
        setActiveGame(null);
        setCurrentPlayer(null);
        setCurrentQuiz(null);
        setCurrentQuestion(null);
        setIsHost(false);
        toast({
          title: "Game Update",
          description: "The game state could not be refreshed or the game has ended.",
        });
        return; // Stop execution if no game data
      }

      const gameData = gameSnapshot.val() as GameRoom;
      console.log('refreshGameState: Fetched gameData:', gameData);

      // Ensure gameData.players is an array
      // Ensure gameData.players is an array, converting from object if necessary
      if (gameData.players && typeof gameData.players === 'object' && !Array.isArray(gameData.players)) {
        gameData.players = Object.values(gameData.players);
      } else if (!gameData.players) {
        gameData.players = [];
      }

      // If we reach here, gameData is valid
      setActiveGame(gameData);
      console.log('refreshGameState: activeGame state updated to:', gameData);

      // Update questionStartTime when the active game or current question changes
      if (gameData.questionStartTime !== undefined) {
        setQuestionStartTime(gameData.questionStartTime);
      }

      // Set the quiz from gameData

      if (gameData.quiz) {
        setCurrentQuiz(gameData.quiz);
        console.log('refreshGameState: currentQuiz state updated to:', gameData.quiz);
      }

      // Determine the current player's ID based on authentication status or existing player state
      const currentUserId = playerIdFromParam || auth.currentUser?.uid || currentPlayer?.player_id;

      if (currentUserId) {
        const updatedPlayerData = (gameData.players || []).find((p: Player) => p.player_id === currentUserId);
        if (updatedPlayerData) {
          setCurrentPlayer(updatedPlayerData);
          setIsHost(gameData.hostId === currentUserId);
        } else {
          console.warn(`Player with ID ${currentUserId} not found in refreshed game data players list.`);
          setCurrentPlayer(null);
          setIsHost(false);
        }
      } else {
        // No current user (authenticated or guest) found, clear player state
        setCurrentPlayer(null);
        setIsHost(false);
      }
    } catch (error: any) {
      console.error('An unexpected error occurred during game state refresh:', error);
      toast({
        title: "Error",
        description: "Failed to refresh game state.",
      });
    }
  };

  const joinGame = async (code: string, nickname: string): Promise<{ success: boolean; message?: string, gameId?: string, playerId?: string }> => {
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
      const gamesRef = ref(db, 'games');
      const gameSnapshot = await get(gamesRef);
      
      if (!gameSnapshot.exists()) {
        return {
          success: false,
          message: 'No games found.'
        };
      }
      
      let gameRef;
      let gameData;
      
      // Find the game with matching code
      const games = gameSnapshot.val();
      for (const key in games) {
        if (games[key].code === upperCode) {
          gameRef = ref(db, `games/${key}`);
          gameData = games[key];
          break;
        }
      }
      
      if (!gameRef || !gameData) {
        return {
          success: false,
          message: 'Game not found or has expired. Please check the code and try again.',
        };
      }

      // Check if nickname is taken
      if (gameData.players && Object.values(gameData.players || {}).some((p: Player) =>
        p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
      )) {
        return {
          success: false,
          message: `Nickname "${nickname}" is already taken in this game. Please choose another.`,
        };
      }

      // Get user ID (if authenticated) or generate a temporary one for unauthenticated users
      const user = auth.currentUser;
      const playerId = user ? user.uid : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log("Firebase Auth User or Generated Player ID:", playerId);

      // Check if the user is already a player in this game
      if (gameData.players && Object.values(gameData.players || {}).some((p: Player) => p.player_id === playerId)) {
        // If player already exists, just set the current player and game state
        setActiveGame(gameData);
        const existingPlayer = Object.values(gameData.players).find((p: Player) => p.player_id === playerId);
        setCurrentPlayer(existingPlayer as Player || null);
        setIsHost(gameData.hostId === playerId);
        setCurrentQuiz(gameData.quiz);

        toast({
          title: "Joined Game",
          description: `Welcome back to game ${upperCode}!`,
        });
        return { success: true, gameId: gameData.id, playerId: playerId };
      }

        // If player does not exist, add them to the game
        const newPlayer: Player = {
          id: playerId,
          player_id: playerId,
          nickname: nickname,
          score: 0,

          answers: []
        };
        if (!gameData.players) {
          gameData.players = {};
        }
        gameData.players[newPlayer.player_id] = newPlayer;
        await update(gameRef, { players: gameData.players });

        // Set current player and game in context
        setCurrentPlayer(newPlayer);
        setActiveGame(gameData);

        // Redirect to player setup page
        return { success: true, gameId: gameData.id, playerId: playerId };
    } catch (error: any) {
      console.error("Error in joinGame:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}. Please try again later.`,
        variant: "destructive",
      });
      return { success: false, gameId: null, playerId: null, message: `An unexpected error occurred: ${error.message}` };
    }
  };

  const value = {
    activeGame,
    currentPlayer,
    currentQuiz,
    currentQuestion,
    isHost,

    questionStartTime,
    questionEnded,
    setQuestionEnded,
    createGame,
    joinGame,
    validateGameCode,
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    refreshGameState,
    getAvailableGameCodes,
    setCorrectAnswer,
    setQuestionStartTime
  };

  return (
    <GameContext.Provider value={value as GameContextType}>
      {children}
    </GameContext.Provider>
  );
};

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


