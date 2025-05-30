
import { useCallback } from 'react';
import { db } from '@/lib/firebaseConfig';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { GameRoom } from '@/types';

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
    
    const gameRef = ref(db, 'games/' + upperCode);
    const gameSnapshot = await get(gameRef);

    if (!gameSnapshot.exists()) {
      return Promise.resolve({ 
        valid: false, 
        message: `Game with code ${upperCode} not found. Please check and try again.` 
      });
    }
    
    const game = gameSnapshot.val() as GameRoom; // Cast data to GameRoom type
    if (game.status === "finished") {
      return Promise.resolve({ valid: false, message: "This game has already ended. Please join another game." });
    }
    
    if (game.status === "active") {
      return Promise.resolve({ valid: false, message: "This game is already in progress. Please join another game." });
    }
    
    return Promise.resolve({ valid: true });
  }, []);

  
  // Keeping it for now but it might be removed later.
  const getAvailableGameCodes = useCallback(async () => {
    const gamesRef = ref(db, 'games');
    const snapshot = await get(gamesRef);
    const codes: string[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        codes.push(childSnapshot.key as string); // Assuming the key is the game code
      });
    }
    return codes;
  }, []);

  return {
    validateGameCode,
    getAvailableGameCodes
  };
};
