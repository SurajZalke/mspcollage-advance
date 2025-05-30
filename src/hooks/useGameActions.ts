
import { useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { ref, update, get as getDatabaseData } from 'firebase/database';

export const useGameActions = (
  activeGame: GameRoom | null,
  setActiveGame: (game: GameRoom | null) => void,
  currentPlayer: Player | null,
  currentQuestion: Question | null,
  currentQuiz: Quiz | null
) => {
  const startGame = useCallback(async () => {
    if (!activeGame) return;

    const gameRef = ref(db, `games/${activeGame.code}`);
     try {
       await update(gameRef, {
         status: 'active',
         currentQuestionIndex: 0,
       });

      // No direct state update here, GameContext's onSnapshot will handle it
    } catch (error: any) {
      console.error('Error starting game in Realtime Database:', error);
    }
  }, [activeGame, setActiveGame]);

  const endGame = useCallback(async () => {
    if (!activeGame) return;

    const gameRef = ref(db, `games/${activeGame.code}`);
    const quizRef = ref(db, `quizzes/${currentQuiz.id}`);
     try {
       await update(gameRef, {
         status: 'ended',
       });

      // No direct state update here, GameContext's onSnapshot will handle it
    } catch (error: any) {
      console.error('Error ending game in Realtime Database:', error);
    }
  }, [activeGame, setActiveGame]);

  const submitAnswer = useCallback(async (questionId: string, optionId: string) => {
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

    // Update player's score and answers in Realtime Database
    const playerRef = ref(db, `games/${activeGame.code}/players/${currentPlayer.player_id}`);
     try {
       // Fetch current player data to get existing answers
       const snapshot = await getDatabaseData(playerRef);
       const playerData = snapshot.val();

       // Append the new answer to the existing answers array
       const updatedAnswers = playerData.answers ? [...playerData.answers, { questionId, optionId }] : [{ questionId, optionId }];

       await update(playerRef, {
         score: currentPlayer.score + scoreChange,
         answers: updatedAnswers,
       });

      // The refreshGameState in GameContext will handle updating the local state
      // based on the real-time subscription.
    } catch (playerUpdateError: any) {
      console.error('Error updating player score/answers in Realtime Database:', playerUpdateError);
    }
  }, [activeGame, currentPlayer, currentQuestion, currentQuiz]);

  const nextQuestion = useCallback(async () => {
    if (!activeGame || !currentQuiz) return;

    const nextIndex = activeGame.currentQuestionIndex + 1;

    if (nextIndex >= currentQuiz.questions.length) {
      endGame();
    } else {
      // Update the current question index in Firestore
      const gameRef = ref(db, `games/${activeGame.code}`);
     try {
       await update(gameRef, {
         currentQuestionIndex: activeGame.currentQuestionIndex + 1,
       });

        // The refreshGameState in GameContext will handle updating the local state
        // based on the real-time subscription.
      } catch (error: any) {
        console.error('Error updating question index in Firestore:', error);
      }
    }
  }, [activeGame, currentQuiz, endGame]);

  return {
    startGame,
    endGame,
    submitAnswer,
    nextQuestion
  };
};
