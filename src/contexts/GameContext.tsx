// Note: Frontend-only implementation (works in ONE SESSION).
// Multiplayer between host/player across tabs or devices will NOT sync in real time without backend like Supabase.
// To truly connect host and player in real time, connect Lovable to Supabase via the Lovable Supabase integration!

import React, { createContext, useContext, useState, useEffect } from "react";
import { GameRoom, Player, Quiz, Question } from "../types";
import { generateGameCode, generatePlayerId } from "../utils/gameUtils";

// Simulate a server-side store for active games
const activeGamesStore: { [key: string]: GameRoom } = {};

interface GameContextType {
  activeGame: GameRoom | null;
  currentPlayer: Player | null;
  currentQuiz: Quiz | null;
  currentQuestion: Question | null;
  isHost: boolean;
  createGame: (quizId: string) => GameRoom;
  joinGame: (code: string, nickname: string) => boolean;
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

  // Polling interval for game state updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
    }, 2000);

    return () => clearInterval(interval);
  }, [activeGame]);

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
    }
  };

  const createGame = (quizId: string): GameRoom => {
    import('../utils/gameUtils').then(({ sampleQuizzes }) => {
      const quiz = sampleQuizzes.find(q => q.id === quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
    });

    const gameCode = generateGameCode();
    const newGame: GameRoom = {
      id: `game_${Math.random().toString(36).substr(2, 9)}`,
      code: gameCode,
      hostId: "currentUserId",
      quizId,
      players: [],
      status: "waiting",
      currentQuestionIndex: -1
    };

    activeGamesStore[gameCode] = newGame;
    setActiveGame(newGame);
    setIsHost(true);
    return newGame;
  };

  const joinGame = (code: string, nickname: string): boolean => {
    if (!code || !nickname) return false;
    
    const upperCode = code.trim().toUpperCase();
    
    const gameToJoin = activeGamesStore[upperCode];
    if (!gameToJoin) {
      console.log(`Game with code ${upperCode} not found. Available games:`, Object.keys(activeGamesStore));
      return false;
    }

    if (gameToJoin.players.some(p => p.nickname.trim().toLowerCase() === nickname.trim().toLowerCase())) {
      console.log(`Nickname ${nickname} already taken in game ${upperCode}`);
      return false;
    }

    const newPlayer: Player = {
      id: generatePlayerId(),
      nickname,
      score: 0,
      answers: []
    };

    setCurrentPlayer(newPlayer);
    setIsHost(false);

    gameToJoin.players.push(newPlayer);
    activeGamesStore[upperCode] = {...gameToJoin};

    setActiveGame(activeGamesStore[upperCode]);

    import('../utils/gameUtils').then(({ sampleQuizzes }) => {
      const quiz = sampleQuizzes.find(q => q.id === gameToJoin.quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
    });

    return true;
  };

  const startGame = () => {
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
  };

  const endGame = () => {
    if (activeGame) {
      const updatedGame: GameRoom = {
        ...activeGame,
        status: "finished" as "finished",
        endTime: new Date()
      };
      activeGamesStore[activeGame.code] = updatedGame;
      setActiveGame(updatedGame);
    }
  };

  const submitAnswer = (questionId: string, optionId: string) => {
    if (!currentPlayer || !currentQuestion || !activeGame || !currentQuiz) return;

    const isCorrect = optionId === currentQuestion.correctOption;
    const timeToAnswer = 10;

    let scoreChange = 0;
    if (isCorrect) {
      scoreChange = currentQuestion.points;
    } else if (currentQuiz.hasNegativeMarking) {
      scoreChange = -(currentQuestion.points * currentQuiz.negativeMarkingValue / 100);
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
  };

  const nextQuestion = () => {
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
  };

  const value = {
    activeGame,
    currentPlayer,
    currentQuiz,
    currentQuestion,
    isHost,
    createGame,
    joinGame,
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
