
import { useCallback } from 'react';
import { GameRoom, Player, Quiz, Question } from '@/types';
import { activeGamesStore, TEST_GAME_CODES, initTestGames } from '@/store/gameStore';
import { supabase } from '@/lib/supabaseClient';

export const useGameActions = (
  activeGame: GameRoom | null,
  setActiveGame: (game: GameRoom | null) => void,
  currentPlayer: Player | null,
  currentQuestion: Question | null,
  currentQuiz: Quiz | null
) => {
  const startGame = useCallback(async () => {
    if (!activeGame) return;

    const { data, error } = await supabase
      .from('games')
      .update({
        status: "active",
        current_question_index: 0,
        start_time: new Date().toISOString()
      })
      .eq('id', activeGame.id)
      .select()
      .single();

    if (error) {
      console.error('Error starting game in Supabase:', error);
      // Handle error, maybe show a toast
    } else if (data) {
      setActiveGame(data);
    }
  }, [activeGame, setActiveGame]);

  const endGame = useCallback(async () => {
    if (!activeGame) return;

    const { data, error } = await supabase
      .from('games')
      .update({
        status: "finished",
        end_time: new Date().toISOString()
      })
      .eq('id', activeGame.id)
      .select()
      .single();

    if (error) {
      console.error('Error ending game in Supabase:', error);
      // Handle error
    } else if (data) {
      setActiveGame(data);
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

    // Update player's score and answers in Supabase
    const { data: updatedPlayerData, error: playerUpdateError } = await supabase
      .from('game_players')
      .update({
        score: currentPlayer.score + scoreChange,
        answers: [...currentPlayer.answers, newAnswer] // Assuming 'answers' is a JSONB column
      })
      .eq('player_id', currentPlayer.id)
      .eq('game_id', activeGame.id)
      .select()
      .single();

    if (playerUpdateError) {
      console.error('Error updating player score/answers in Supabase:', playerUpdateError);
      // Handle error
    } else if (updatedPlayerData) {
      // The refreshGameState in GameContext will handle updating the local state
      // based on the real-time subscription.
      // No need to call setActiveGame or setCurrentPlayer here directly.
    }
  }, [activeGame, currentPlayer, currentQuestion, currentQuiz]);

  const nextQuestion = useCallback(async () => {
    if (!activeGame || !currentQuiz) return;

    const nextIndex = activeGame.currentQuestionIndex + 1;

    if (nextIndex >= currentQuiz.questions.length) {
      endGame();
    } else {
      // Update the current question index in Supabase
      const { data, error } = await supabase
        .from('games')
        .update({ current_question_index: nextIndex })
        .eq('id', activeGame.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating question index in Supabase:', error);
        // Handle error
      } else if (data) {
        // The refreshGameState in GameContext will handle updating the local state
        // based on the real-time subscription.
        // No need to call setActiveGame here directly.
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
