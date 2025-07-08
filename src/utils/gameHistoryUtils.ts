import { app } from '@/lib/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, get, update } from 'firebase/database';

function generateShortUuid(): string {
  return uuidv4().substring(0, 8);
}

export const saveSharedUrlGameHistory = async (quizId: string, quizTitle: string, createdBy: string, nickname: string, avatar: string, score: number, answers?: string[]) => {
  const db = getDatabase(app);
  let currentPlayerId = localStorage.getItem(`quiz_player_id_${quizId}`);
  if (!currentPlayerId) {
    currentPlayerId = generateShortUuid();
  }

  try {
    const quizRef = ref(db, `gameHistory/${quizId}`);
    const playerRef = ref(db, `gameHistory/${quizId}/players/${currentPlayerId}`);

    // Update quiz details if they don't exist or are different
    await update(quizRef, {
      quizTitle: quizTitle,
      createdBy: createdBy,
    });
    const playerSnapshot = await get(playerRef);

    if (!playerSnapshot.exists()) {
      await update(playerRef, {
        nickname: nickname,
        avatar: avatar,
        score: score,
        joinedAt: new Date().toISOString(),
        ...(answers && { answers: answers }),
      });
    } else {
      // If player exists, update nickname and avatar if they changed, and score if it's higher
      await update(playerRef, {
        nickname: nickname,
        avatar: avatar,
        score: score,
        completedAt: new Date().toISOString(),
        ...(answers && { answers: answers }),
      });
    }

    localStorage.setItem(`quiz_player_id_${quizId}`, currentPlayerId);
    localStorage.setItem(`quiz_nickname_${quizId}`, nickname);
    localStorage.setItem(`quiz_avatar_${quizId}`, avatar);

    return { success: true, playerId: currentPlayerId };
  } catch (error) {
    console.error('Error saving shared URL game history:', error);
    return { success: false, error };
  }
};