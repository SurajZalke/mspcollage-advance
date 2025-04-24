
import { useCallback } from 'react';
import { activeGamesStore, TEST_GAME_CODES, initTestGames } from '@/store/gameStore';

export const useGameValidation = () => {
  const validateGameCode = useCallback((code: string): { valid: boolean; message?: string } => {
    if (!code) {
      return { valid: false, message: "Game code is required" };
    }
    
    if (code.length !== 6) {
      return { valid: false, message: "Game code must be exactly 6 characters" };
    }
    
    const upperCode = code.trim().toUpperCase();
    console.log(`Validating game code: ${upperCode}`);
    
    if (TEST_GAME_CODES.includes(upperCode) && !activeGamesStore[upperCode]) {
      initTestGames();
    }
    
    const availableCodes = Object.keys(activeGamesStore);
    console.log(`Available games: ${availableCodes}`);
    
    const gameExists = !!activeGamesStore[upperCode];
    
    if (!gameExists) {
      return { 
        valid: false, 
        message: `Game with code ${upperCode} not found. Please check and try again. Available codes: ${TEST_GAME_CODES.join(", ")}` 
      };
    }
    
    const game = activeGamesStore[upperCode];
    if (game.status === "finished") {
      return { valid: false, message: "This game has already ended. Please join another game." };
    }
    
    if (game.status === "active") {
      return { valid: false, message: "This game is already in progress. Please join another game." };
    }
    
    return { valid: true };
  }, []);

  const getAvailableGameCodes = useCallback(() => {
    const anyMissingCode = TEST_GAME_CODES.some(code => !activeGamesStore[code]);
    if (anyMissingCode) {
      initTestGames();
    }
    return Object.keys(activeGamesStore);
  }, []);

  return {
    validateGameCode,
    getAvailableGameCodes
  };
};
