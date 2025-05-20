
import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GameRoom } from '@/types';
import { TEST_GAME_CODES } from '@/store/gameStore';

export const useGameValidation = () => {
  const validateGameCode = useCallback(async (code: string): Promise<{ valid: boolean; message?: string }> => {
    if (!code) {
      return Promise.resolve({ valid: false, message: "Game code is required" });
    }
    
    if (code.length !== 6) {
      return Promise.resolve({ valid: false, message: "Game code must be exactly 6 characters" });
    }
    
    const upperCode = code.trim().toUpperCase();
    console.log(`Validating game code: ${upperCode}`);
    
    const { data: gameData, error } = await supabase
      .from('games')
      .select('status')
      .eq('code', upperCode)
      .single();

    if (error || !gameData) {
      return Promise.resolve({ 
        valid: false, 
        message: `Game with code ${upperCode} not found. Please check and try again. Available codes: ${TEST_GAME_CODES.join(", ")}` 
      });
    }
    
    const game = gameData as GameRoom; // Cast data to GameRoom type
    if (game.status === "finished") {
      return Promise.resolve({ valid: false, message: "This game has already ended. Please join another game." });
    }
    
    if (game.status === "active") {
      return Promise.resolve({ valid: false, message: "This game is already in progress. Please join another game." });
    }
    
    return Promise.resolve({ valid: true });
  }, []);

  // This function is likely not needed anymore if validation is done via Supabase
  // Keeping it for now but it might be removed later.
  const getAvailableGameCodes = useCallback(async () => {
    const { data, error } = await supabase
      .from('games')
      .select('code');

    if (error) {
      console.error('Error fetching available game codes:', error);
      return [];
    }
    return data ? data.map(game => game.code) : [];
  }, []);

  return {
    validateGameCode,
    getAvailableGameCodes
  };
};
