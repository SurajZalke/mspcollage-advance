
import React, { createContext, useContext, useState, useEffect } from "react";
import { GameRoom, Player, Quiz, Question } from "../types";
import { generateGameCode, generatePlayerId } from "../utils/gameUtils";

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

  // Set current question based on game state
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

  // Create a new game as host
  const createGame = (quizId: string): GameRoom => {
    // In a real app, this would be stored in a database
    // For now, we're using mock data
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
      hostId: "currentUserId", // Would be set from auth context in real app
      quizId,
      players: [],
      status: "waiting",
      currentQuestionIndex: -1
    };
    
    setActiveGame(newGame);
    setIsHost(true);
    return newGame;
  };

  // Join an existing game as player
  const joinGame = (code: string, nickname: string): boolean => {
    // In a real app, this would validate the code against active games
    if (!code || !nickname) return false;
    
    // For demo, we'll create a mock game if joining as player
    if (!activeGame && !isHost) {
      import('../utils/gameUtils').then(({ sampleQuizzes }) => {
        // Just use the first sample quiz for demo
        setCurrentQuiz(sampleQuizzes[0]);
      });

      const newPlayer: Player = {
        id: generatePlayerId(),
        nickname,
        score: 0,
        answers: []
      };
      
      setCurrentPlayer(newPlayer);
      
      const newGame: GameRoom = {
        id: `game_${Math.random().toString(36).substr(2, 9)}`,
        code: code,
        hostId: "mockHostId",
        quizId: "quiz1",
        players: [newPlayer],
        status: "waiting",
        currentQuestionIndex: -1
      };
      
      setActiveGame(newGame);
      return true;
    }
    
    return false;
  };

  // Start the active game
  const startGame = () => {
    if (activeGame) {
      setActiveGame({
        ...activeGame,
        status: "active",
        currentQuestionIndex: 0,
        startTime: new Date()
      });
    }
  };

  // End the active game
  const endGame = () => {
    if (activeGame) {
      setActiveGame({
        ...activeGame,
        status: "finished",
        endTime: new Date()
      });
    }
  };

  // Submit an answer for the current question
  const submitAnswer = (questionId: string, optionId: string) => {
    if (!currentPlayer || !currentQuestion || !activeGame || !currentQuiz) return;
    
    const isCorrect = optionId === currentQuestion.correctOption;
    const timeToAnswer = 10; // Would be calculated based on question timer
    
    // Calculate score
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
    
    // Update player in game
    const updatedPlayers = activeGame.players.map(p => 
      p.id === currentPlayer.id ? updatedPlayer : p
    );
    
    setActiveGame({
      ...activeGame,
      players: updatedPlayers
    });
  };

  // Move to the next question
  const nextQuestion = () => {
    if (!activeGame || !currentQuiz) return;
    
    const nextIndex = activeGame.currentQuestionIndex + 1;
    
    if (nextIndex >= currentQuiz.questions.length) {
      // End game if all questions have been answered
      endGame();
    } else {
      setActiveGame({
        ...activeGame,
        currentQuestionIndex: nextIndex
      });
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
    nextQuestion
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
