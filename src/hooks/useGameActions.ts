
import { useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { ref, update, get as getDatabaseData, set } from 'firebase/database';

export const useGameActions = (
  activeGame: GameRoom | null,
  setActiveGame: (game: GameRoom | null) => void,
  currentPlayer: Player | null,
  currentQuestion: Question | null,
  currentQuiz: Quiz | null
) => {
  const startGame = useCallback(async () => {
    if (!activeGame) return;

    const gameRef = ref(db, `games/${activeGame.id}`);
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

    const gameRef = ref(db, `games/${activeGame.id}`);
    try {
      // Ensure the latest activeGame state (including player scores) is saved
      // before marking the game as ended.
      await update(gameRef, {
        ...activeGame,
        status: 'finished',
      });

      // No direct state update here, GameContext's onSnapshot will handle it
    } catch (error: any) {
      console.error('Error ending game in Realtime Database:', error);
    }
  }, [activeGame]);

  const submitAnswer = useCallback(async (questionId: string, optionId: string) => {
    if (!currentPlayer || !currentQuestion || !activeGame || !currentQuiz) return;

    const isCorrect = optionId === currentQuestion.correctOption;
    const timeToAnswer = Math.floor(Math.random() * 10) + 1;

    let scoreChange = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, (currentQuestion.timeLimit - timeToAnswer) / currentQuestion.timeLimit);
      scoreChange = currentQuestion.Marks + Math.floor(currentQuestion.Marks * timeBonus * 0.5);
    } else if (currentQuiz.hasNegativeMarking) {
      scoreChange = -Math.floor(currentQuestion.Marks * currentQuiz.negativeMarkingValue / 100);
    }

    const newAnswer = {
      questionId,
      selectedOption: optionId,
      correct: isCorrect,
      timeToAnswer
    };

    // Update player's score and answers in Realtime Database
    const playerAnswersRef = ref(db, `games/${activeGame.id}/players/${currentPlayer.player_id}/answers`);
    const playerRef = ref(db, `games/${activeGame.id}/players/${currentPlayer.player_id}`);

    try {
      // Fetch current player data to get existing answers
      const snapshot = await getDatabaseData(playerAnswersRef);
      const existingAnswers = snapshot.val();

      // Append the new answer to the existing answers array
      const updatedAnswers = existingAnswers ? [...existingAnswers, newAnswer] : [newAnswer];

      // Update player score and status
      await update(playerRef, {
        score: currentPlayer.score + scoreChange,
        status: 'answered'
      });
      await set(playerAnswersRef, updatedAnswers);

      // If the current player is the host, update hostSubmitted flag
      if (currentPlayer.player_id === activeGame.hostId) {
        const gameRef = ref(db, `games/${activeGame.id}`);
        await update(gameRef, {
          hostSubmitted: true
        });
      }

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
      // Update the current question index and reset player statuses in Firestore
      const gameRef = ref(db, `games/${activeGame.id}`);
     try {
       const updates: any = {
         currentQuestionIndex: activeGame.currentQuestionIndex + 1,
         questionStartTime: Date.now(),
         showScores: false,
         hostSubmitted: false
       };

       // Reset all players' status to 'waiting'
       activeGame.players.forEach((player) => {
         updates[`players/${player.player_id}/status`] = 'waiting';
       });

       await update(gameRef, updates);

        // The refreshGameState in GameContext will handle updating the local state
        // based on the real-time subscription.
      } catch (error: any) {
        console.error('Error updating question index in Firestore:', error);
      }
    }
  }, [activeGame, currentQuiz, endGame]);

  const setCorrectAnswer = useCallback(async (optionId: string, questionId: string | undefined) => {
    if (!activeGame || !currentQuestion || !currentPlayer) return;

    const timeToAnswer = Math.floor(Date.now() / 1000) - (activeGame.questionStartTime || Math.floor(Date.now() / 1000));
    const isCorrect = optionId === currentQuestion.correctOption;

    // Create host's answer object
    const hostAnswer = {
      questionId,
      selectedOption: optionId,
      correct: isCorrect,
      timeToAnswer
    };

    // Update host's answers in the game
    const hostAnswersRef = ref(db, `games/${activeGame.id}/players/${currentPlayer.player_id}/answers`);
    const hostRef = ref(db, `games/${activeGame.id}/players/${currentPlayer.player_id}`);
    const gameRef = ref(db, `games/${activeGame.id}`);

    try {
      // Get existing answers
      const snapshot = await getDatabaseData(hostAnswersRef);
      const existingAnswers = snapshot.val() || [];
      const updatedAnswers = [...existingAnswers, hostAnswer];

      // Find host in players array
      const hostPlayer = activeGame.players.find(p => p.player_id === currentPlayer.player_id);
      const currentHostScore = hostPlayer?.score || 0;

      // Calculate host's score
      let scoreChange = 0;
      if (isCorrect) {
        const timeBonus = Math.max(0, (currentQuestion.timeLimit - timeToAnswer) / currentQuestion.timeLimit);
        scoreChange = currentQuestion.Marks + Math.floor(currentQuestion.Marks * timeBonus * 0.5);
      }

      // Update game state and host's data
      await update(gameRef, {
        [`questions.${currentQuestion.id}.correctOption`]: optionId,
        showScores: true,
        lastAnsweredQuestion: currentQuestion.id
      });

      await update(hostRef, {
        score: currentHostScore + scoreChange,
        answers: updatedAnswers,
        status: 'answered'
      });

      // Calculate and update scores for all players
      const players = activeGame.players;
      for (const playerId in players) {
        if (playerId === currentPlayer.player_id) continue; // Skip host

        const player = players[playerId];
        const playerAnswer = player.answers?.[activeGame.currentQuestionIndex];

        if (playerAnswer) {
          let playerScoreChange = 0;
          const isPlayerCorrect = playerAnswer.selectedOption === optionId;

          if (isPlayerCorrect) {
            const timeBonus = Math.max(0, (currentQuestion.timeLimit - playerAnswer.timeToAnswer) / currentQuestion.timeLimit);
            playerScoreChange = currentQuestion.Marks + Math.floor(currentQuestion.Marks * timeBonus * 0.5);
          } else if (activeGame.quiz.hasNegativeMarking) {
            playerScoreChange = -Math.floor(currentQuestion.Marks * activeGame.quiz.negativeMarkingValue / 100);
          }

          // Update player's score and answer correctness
          const playerRef = ref(db, `games/${activeGame.id}/players/${playerId}`);
          await update(playerRef, {
            score: player.score + playerScoreChange,
            [`answers.${activeGame.currentQuestionIndex}.correct`]: isPlayerCorrect
          });
        }
      }
    } catch (error) {
      console.error('Error setting correct answer:', error);
    }
  }, [activeGame, currentQuestion, currentPlayer]);

  return {
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    setCorrectAnswer
  };
};
