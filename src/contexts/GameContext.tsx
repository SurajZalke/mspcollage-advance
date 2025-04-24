
import React, { createContext, useContext, useEffect } from "react";
import { GameRoom, Player, Quiz, Question } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { useGameActions } from "@/hooks/useGameActions";
import { useGameValidation } from "@/hooks/useGameValidation";
import { initTestGames, activeGamesStore } from "@/store/gameStore";

// Poll interval in milliseconds
const POLL_INTERVAL = 150;

interface GameContextType {
  activeGame: GameRoom | null;
  currentPlayer: Player | null;
  currentQuiz: Quiz | null;
  currentQuestion: Question | null;
  isHost: boolean;
  createGame: (quizId: string) => GameRoom;
  joinGame: (code: string, nickname: string) => { success: boolean; message?: string };
  validateGameCode: (code: string) => { valid: boolean; message?: string };
  startGame: () => void;
  endGame: () => void;
  submitAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  refreshGameState: () => void;
  getAvailableGameCodes: () => string[];
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

  // Re-initialize test games on component mount
  useEffect(() => {
    initTestGames();
  }, []);

  // Polling for game state updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [activeGame]);

  // Update current question on game/quiz changes
  useEffect(() => {
    if (activeGame && currentQuiz && activeGame.status === "active") {
      const questionIndex = activeGame.currentQuestionIndex;
      if (questionIndex >= 0 && questionIndex < currentQuiz.questions.length) {
        setCurrentQuestion(currentQuiz.questions[questionIndex]);
      } else {
        setCurrentQuestion(null);
      }
    } else {
      setCurrentQuestion(null);
    }
  }, [activeGame, currentQuiz]);

  const refreshGameState = () => {
    if (!activeGame) return;

    const gameCode = activeGame.code;
    const storedGame = activeGamesStore[gameCode];

    if (storedGame) {
      setActiveGame(storedGame);
      
      if (!isHost && storedGame.quizId) {
        import('../utils/gameUtils').then(({ sampleQuizzes }) => {
          const quiz = sampleQuizzes.find(q => q.id === storedGame.quizId);
          if (quiz) {
            setCurrentQuiz(quiz);
          }
        });
      }
      
      if (!isHost && currentPlayer) {
        const updatedPlayerData = storedGame.players.find(p => p.id === currentPlayer.id);
        if (updatedPlayerData) {
          setCurrentPlayer(updatedPlayerData);
        }
      }
    }
  };

  const joinGame = (code: string, nickname: string): { success: boolean; message?: string } => {
    if (!code || !nickname) {
      return { 
        success: false, 
        message: !code ? "Please enter a game code" : "Please enter a nickname" 
      };
    }
    
    const upperCode = code.trim().toUpperCase();
    const validation = validateGameCode(upperCode);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    const gameToJoin = activeGamesStore[upperCode];
    if (!gameToJoin) {
      return { 
        success: false, 
        message: `Game not found. Available codes: ${TEST_GAME_CODES.join(", ")}` 
      };
    }

    if (gameToJoin.players.some(p => 
      p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
    )) {
      return { 
        success: false, 
        message: `Nickname "${nickname}" is already taken. Please choose another.` 
      };
    }

    const newPlayer: Player = {
      id: generatePlayerId(),
      nickname: nickname.trim(),
      score: 0,
      answers: []
    };

    setCurrentPlayer(newPlayer);
    setIsHost(false);

    gameToJoin.players.push(newPlayer);
    activeGamesStore[upperCode] = {...gameToJoin};
    setActiveGame(gameToJoin);

    import('../utils/gameUtils').then(({ sampleQuizzes }) => {
      const quiz = sampleQuizzes.find(q => q.id === gameToJoin.quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
    });

    return { success: true };
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

export default GameContext;
