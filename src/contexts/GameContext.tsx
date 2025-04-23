
// Note: Frontend-only implementation (works in ONE SESSION).
// Multiplayer between host/player across tabs or devices will NOT sync in real time without backend like Supabase.
// To truly connect host and player in real time, connect Lovable to Supabase via the Lovable Supabase integration!

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GameRoom, Player, Quiz, Question } from "../types";
import { generateGameCode, generatePlayerId } from "../utils/gameUtils";

// Simulate a server-side store for active games
const activeGamesStore: { [key: string]: GameRoom } = {};

// Poll interval in milliseconds - increased for more real-time responsiveness
const POLL_INTERVAL = 300;

// Create some predefined test games
const TEST_GAME_CODES = ["TEST12", "DEMO01", "PLAY22", "QUIZ99", "FUN123"];

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
  const [activeGame, setActiveGame] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // Initialize the test games
  useEffect(() => {
    // Create test games if they don't exist
    TEST_GAME_CODES.forEach((code, index) => {
      if (!activeGamesStore[code]) {
        const testGame: GameRoom = {
          id: `test_game_id_${index}`,
          code: code,
          hostId: `test_host_id_${index}`,
          quizId: "quiz1",
          players: [],
          status: "waiting",
          currentQuestionIndex: -1
        };
        
        activeGamesStore[code] = testGame;
        console.log("Test game created with code:", code);
      }
    });
    
    // Log all available games for debugging
    console.log("Available games in store:", Object.keys(activeGamesStore));
  }, []);

  // Polling interval for game state updates - more frequent for better real-time feeling
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
      setLastRefreshTime(Date.now());
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [activeGame]);

  // Update current question whenever game or quiz changes
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

  // Function to refresh game state from the "server"
  const refreshGameState = useCallback(() => {
    if (!activeGame) return;

    const gameCode = activeGame.code;
    const storedGame = activeGamesStore[gameCode];

    if (storedGame) {
      setActiveGame(storedGame);
      
      // If we're not the host, we need to fetch quiz data too
      if (!isHost && storedGame.quizId) {
        import('../utils/gameUtils').then(({ sampleQuizzes }) => {
          const quiz = sampleQuizzes.find(q => q.id === storedGame.quizId);
          if (quiz) {
            setCurrentQuiz(quiz);
          }
        });
      }
      
      // Update player data if we're a player
      if (!isHost && currentPlayer) {
        const updatedPlayerData = storedGame.players.find(p => p.id === currentPlayer.id);
        if (updatedPlayerData) {
          setCurrentPlayer(updatedPlayerData);
        }
      }
    }
  }, [activeGame, currentPlayer, isHost]);

  // Validate game code function
  const validateGameCode = useCallback((code: string): { valid: boolean; message?: string } => {
    if (!code || code.length !== 6) {
      return { valid: false, message: "Game code must be 6 characters" };
    }
    
    const upperCode = code.trim().toUpperCase();
    const gameExists = !!activeGamesStore[upperCode];
    
    if (!gameExists) {
      return { valid: false, message: `Game with code ${upperCode} not found` };
    }
    
    const game = activeGamesStore[upperCode];
    if (game.status === "finished") {
      return { valid: false, message: "This game has already ended" };
    }
    
    return { valid: true };
  }, []);

  const createGame = useCallback((quizId: string): GameRoom => {
    // Fetch and set the quiz for the host
    import('../utils/gameUtils').then(({ sampleQuizzes }) => {
      const quiz = sampleQuizzes.find(q => q.id === quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
    });

    // Create a unique game code that doesn't exist yet
    let gameCode;
    do {
      gameCode = generateGameCode();
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

    // Add the new game to the store
    activeGamesStore[gameCode] = newGame;
    
    console.log("Game created with code:", gameCode);
    console.log("Available games:", Object.keys(activeGamesStore));
    
    setActiveGame(newGame);
    setIsHost(true);
    return newGame;
  }, []);

  const joinGame = useCallback((code: string, nickname: string): { success: boolean; message?: string } => {
    if (!code) {
      return { success: false, message: "Please enter a game code" };
    }
    
    if (!nickname) {
      return { success: false, message: "Please enter a nickname" };
    }
    
    const upperCode = code.trim().toUpperCase();
    
    // Validate game code first
    const validation = validateGameCode(upperCode);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    const gameToJoin = activeGamesStore[upperCode];

    // Check if nickname is unique in this game
    if (gameToJoin.players.some(p => p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase())) {
      return { 
        success: false, 
        message: `Nickname "${nickname}" is already taken in this game. Please choose another nickname.`
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

    // Add player to the game
    gameToJoin.players.push(newPlayer);
    activeGamesStore[upperCode] = {...gameToJoin};

    setActiveGame(gameToJoin);

    // Load quiz data
    import('../utils/gameUtils').then(({ sampleQuizzes }) => {
      const quiz = sampleQuizzes.find(q => q.id === gameToJoin.quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
    });

    return { success: true };
  }, [validateGameCode]);

  // Start the game
  const startGame = useCallback(() => {
    if (activeGame) {
      const updatedGame: GameRoom = {
        ...activeGame,
        status: "active" as "active",
        currentQuestionIndex: 0,
        startTime: new Date()
      };
      activeGamesStore[activeGame.code] = updatedGame;
      setActiveGame(updatedGame);
    }
  }, [activeGame]);

  // End the game
  const endGame = useCallback(() => {
    if (activeGame) {
      const updatedGame: GameRoom = {
        ...activeGame,
        status: "finished" as "finished",
        endTime: new Date()
      };
      activeGamesStore[activeGame.code] = updatedGame;
      setActiveGame(updatedGame);
    }
  }, [activeGame]);

  // Submit an answer to a question
  const submitAnswer = useCallback((questionId: string, optionId: string) => {
    if (!currentPlayer || !currentQuestion || !activeGame || !currentQuiz) return;

    const isCorrect = optionId === currentQuestion.correctOption;
    const timeToAnswer = Math.floor(Math.random() * 10) + 1; // Simulate time taken 1-10 seconds

    let scoreChange = 0;
    if (isCorrect) {
      // Calculate score based on time taken
      const timeBonus = Math.max(0, (currentQuestion.timeLimit - timeToAnswer) / currentQuestion.timeLimit);
      scoreChange = currentQuestion.points + Math.floor(currentQuestion.points * timeBonus * 0.5);
    } else if (currentQuiz.hasNegativeMarking) {
      scoreChange = -Math.floor(currentQuestion.points * currentQuiz.negativeMarkingValue / 100);
    }

    const newAnswer = {
      questionId,
      selectedOption: optionId,
      correct: isCorrect,
      timeToAnswer
    };

    const updatedPlayer = {
      ...currentPlayer,
      score: currentPlayer.score + scoreChange,
      answers: [...currentPlayer.answers, newAnswer]
    };

    setCurrentPlayer(updatedPlayer);

    const gameToUpdate = activeGamesStore[activeGame.code];
    if (gameToUpdate) {
      const updatedPlayers = gameToUpdate.players.map(p =>
        p.id === currentPlayer.id ? updatedPlayer : p
      );

      const updatedGame: GameRoom = {
        ...gameToUpdate,
        players: updatedPlayers
      };

      activeGamesStore[activeGame.code] = updatedGame;
      setActiveGame(updatedGame);
    }
  }, [activeGame, currentPlayer, currentQuestion, currentQuiz]);

  // Move to the next question
  const nextQuestion = useCallback(() => {
    if (!activeGame || !currentQuiz) return;

    const nextIndex = activeGame.currentQuestionIndex + 1;

    if (nextIndex >= currentQuiz.questions.length) {
      endGame();
    } else {
      const updatedGame: GameRoom = {
        ...activeGame,
        currentQuestionIndex: nextIndex
      };

      activeGamesStore[activeGame.code] = updatedGame;
      setActiveGame(updatedGame);
    }
  }, [activeGame, currentQuiz, endGame]);

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
    refreshGameState
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
