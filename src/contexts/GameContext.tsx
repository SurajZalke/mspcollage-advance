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
    
    setActiveGame(newGame);
    setIsHost(true);
    return newGame;
  };

  const joinGame = (code: string, nickname: string): boolean => {
    if (!code || !nickname) return false;
    
    if (!activeGame) {
      import('../utils/gameUtils').then(({ sampleQuizzes }) => {
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
    } else {
      const newPlayer: Player = {
        id: generatePlayerId(),
        nickname,
        score: 0,
        answers: []
      };
      
      setCurrentPlayer(newPlayer);
      
      setActiveGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: [...prev.players, newPlayer]
        };
      });
      
      return true;
    }
  };

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

  const endGame = () => {
    if (activeGame) {
      setActiveGame({
        ...activeGame,
        status: "finished",
        endTime: new Date()
      });
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
    
    const updatedPlayers = activeGame.players.map(p => 
      p.id === currentPlayer.id ? updatedPlayer : p
    );
    
    setActiveGame({
      ...activeGame,
      players: updatedPlayers
    });
  };

  const nextQuestion = () => {
    if (!activeGame || !currentQuiz) return;
    
    const nextIndex = activeGame.currentQuestionIndex + 1;
    
    if (nextIndex >= currentQuiz.questions.length) {
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
