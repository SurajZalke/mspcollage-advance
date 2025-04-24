
import { useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { activeGamesStore, TEST_GAME_CODES, initTestGames } from '@/store/gameStore';

export const useGameActions = (
  activeGame: GameRoom | null,
  setActiveGame: (game: GameRoom | null) => void,
  currentPlayer: Player | null,
  currentQuestion: Question | null,
  currentQuiz: Quiz | null
) => {
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
  }, [activeGame, setActiveGame]);

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
  }, [activeGame, setActiveGame]);

  const submitAnswer = useCallback((questionId: string, optionId: string) => {
    if (!currentPlayer || !currentQuestion || !activeGame || !currentQuiz) return;

    const isCorrect = optionId === currentQuestion.correctOption;
    const timeToAnswer = Math.floor(Math.random() * 10) + 1;

    let scoreChange = 0;
    if (isCorrect) {
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
  }, [activeGame, currentPlayer, currentQuestion, currentQuiz, setActiveGame]);

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
  }, [activeGame, currentQuiz, endGame, setActiveGame]);

  return {
    startGame,
    endGame,
    submitAnswer,
    nextQuestion
  };
};
