import { useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { ref, update, get as getDatabaseData, set, serverTimestamp } from 'firebase/database';

export const useGameActions = (
  activeGame: GameRoom | null,
  setActiveGame: (game: GameRoom | null) => void,
  currentPlayer: Player | null,
  currentQuestion: Question | null,
  currentQuiz: Quiz | null,
  questionStartTime: number | null,
  serverTimeOffset: number
) => {
  const startGame = useCallback(async () => {
    if (!activeGame) return;

    const gameRef = ref(db, `games/${activeGame.id}`);
     try {
       await update(gameRef, {
         status: 'active',
         currentQuestionIndex: 0,
         questionStartTime: Date.now() + serverTimeOffset, // Use calculated server time
       });

       // Explicitly clear all players' answers when the game starts
       const playersRef = ref(db, `games/${activeGame.id}/players`);
       const playersSnapshot = await getDatabaseData(playersRef);
       if (playersSnapshot.exists()) {
         const playersData = playersSnapshot.val();
         const updates: { [key: string]: any } = {};
         for (const playerId in playersData) {
           updates[`${playerId}/answers`] = [];
         }
         await update(playersRef, updates);
       }

      // No direct state update here, GameContext's onSnapshot will handle it
    } catch (error: any) {
      console.error('Error starting game in Realtime Database:', error);
    }
  }, [activeGame, setActiveGame, serverTimeOffset]);

  const endGame = useCallback(async () => {
    if (!activeGame) return;

    const gameRef = ref(db, `games/${activeGame.id}`);
    try {
      // Ensure the latest activeGame state (including player scores) is saved
      // before marking the game as ended.
      await update(gameRef, {
        ...activeGame,
        status: 'ended',
        endedAt: new Date().toISOString(),
      });

      // No direct state update here, GameContext's onSnapshot will handle it
    } catch (error: any) {
      console.error('Error ending game in Realtime Database:', error);
    }
  }, [activeGame]);

  const submitAnswer = useCallback(async (questionId: string, optionId: string) => {
    if (!currentPlayer || !currentQuestion || !activeGame || !currentQuiz) return;

    // Always fetch the latest questionStartTime from the database for accurate timing
    let latestQuestionStartTime = null;
    try {
      const gameRef = ref(db, `games/${activeGame.id}`);
      const gameSnapshot = await getDatabaseData(gameRef);
      let gameData = null;
      if (gameSnapshot.exists && typeof gameSnapshot.exists === 'function' ? gameSnapshot.exists() : gameSnapshot) {
        gameData = gameSnapshot.val ? gameSnapshot.val() : gameSnapshot;
        if (gameData && gameData.questionStartTime) {
          latestQuestionStartTime = gameData.questionStartTime;
        }
      }
    } catch (err) {
      // fallback to local questionStartTime if fetch fails
      latestQuestionStartTime = questionStartTime;
    }

    // If still not found, fallback to 0
    if (!latestQuestionStartTime) latestQuestionStartTime = 0;

    const isCorrect = optionId === currentQuestion.correctOption;
    const now = Date.now() + serverTimeOffset;
    const timeToAnswer = Math.max(0, Math.floor((now - latestQuestionStartTime) / 1000));

    let scoreChange = 0;
    if (isCorrect) {
      scoreChange = currentQuestion.Marks;
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
    const gameRef = ref(db, `games/${activeGame.id}`); // Define gameRef here

    try {
      // Fetch current player data to get existing answers
      const playerSnapshot = await getDatabaseData(playerRef);
      const playerCurrentData = playerSnapshot.val() as Player;
      const existingAnswers = playerCurrentData.answers || [];

      // Append the new answer to the existing answers array
      const updatedAnswers = [...existingAnswers, newAnswer];

      // Calculate new streak
      let newStreak = playerCurrentData.streak || 0;
      if (isCorrect) {
        newStreak++;
      } else {
        newStreak = 0;
      }

      // Update player score, status, and streak
      await update(playerRef, {
        score: currentPlayer.score + scoreChange,
        status: 'answered',
        streak: newStreak,
        answers: updatedAnswers // Update answers directly on player object
      });

      // If the current player is the host, update hostSubmitted flag
      if (currentPlayer.player_id === activeGame.hostId) {
        await update(gameRef, {
          hostSubmitted: true
        });
      }

      // Check if all players have submitted their answers
      const gameSnapshot = await getDatabaseData(gameRef);
      const latestGame = gameSnapshot.val() as GameRoom;

      const allPlayersAnswered = latestGame.players.every(player => player.status === 'answered');

      if (allPlayersAnswered) {
        await update(gameRef, {
          showScores: true,
          lastAnsweredQuestion: currentQuestion.id
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
         questionStartTime: Date.now() + serverTimeOffset, // Use calculated server time
         showScores: false,
         hostSubmitted: false
       };

       // Clear all players' answers for the new question
       activeGame.players.forEach((player) => {
         updates[`players/${player.player_id}/answers`] = [];
       });

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

  const deductPlayerScore = useCallback(async (playerId: string, pointsToDeduct: number) => {
    if (!activeGame) return;

    const playerRef = ref(db, `games/${activeGame.id}/players/${playerId}`);
    try {
      const snapshot = await getDatabaseData(playerRef);
      if (snapshot.exists()) {
        const currentPlayer = snapshot.val() as Player;
        const newScore = Math.max(0, currentPlayer.score - pointsToDeduct);
        await update(playerRef, { score: newScore });
        console.log(`Deducted ${pointsToDeduct} points from player ${playerId}. New score: ${newScore}`);
      }
    } catch (error) {
      console.error('Error deducting player score:', error);
    }
  }, [activeGame]);

  const removePlayer = useCallback(async (playerId: string) => {
    if (!activeGame) return;

    const gameRef = ref(db, `games/${activeGame.id}`);
    try {
      const snapshot = await getDatabaseData(gameRef);
      if (snapshot.exists()) {
        const gameData = snapshot.val() as GameRoom;
        const updatedPlayers = gameData.players.filter(player => player.player_id !== playerId);
        await update(gameRef, { players: updatedPlayers });
        console.log(`Player ${playerId} removed from game ${activeGame.id}`);
      }
    } catch (error) {
      console.error('Error removing player:', error);
    }
  }, [activeGame]);

  const setCorrectAnswer = useCallback(async (optionId: string, questionId: string | undefined) => {
    if (!activeGame || !currentQuestion || !currentPlayer) return;

    // Always fetch the latest questionStartTime from the database for accurate timing
    let latestQuestionStartTime = null;
    try {
      const gameRef = ref(db, `games/${activeGame.id}`);
      const gameSnapshot = await getDatabaseData(gameRef);
      let gameData = null;
      if (gameSnapshot.exists && typeof gameSnapshot.exists === 'function' ? gameSnapshot.exists() : gameSnapshot) {
        gameData = gameSnapshot.val ? gameSnapshot.val() : gameSnapshot;
        if (gameData && gameData.questionStartTime) {
          latestQuestionStartTime = gameData.questionStartTime;
        }
      }
    } catch (err) {
      // fallback to local questionStartTime if fetch fails
      latestQuestionStartTime = questionStartTime;
    }
    if (!latestQuestionStartTime) latestQuestionStartTime = 0;

    const timeToAnswer = Math.max(0, Math.floor((Date.now() - latestQuestionStartTime) / 1000));
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
    setCorrectAnswer,
    deductPlayerScore,
    removePlayer
  };
};
