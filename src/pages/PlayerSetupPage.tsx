import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get, getDatabase, ref, update } from 'firebase/database';
// This appears to be an incomplete import statement that should be removed
import { useToast } from '@/components/ui/use-toast';
import { app } from '@/lib/firebaseConfig';
import { avatars } from '@/utils/avatars';    
import { Avatar } from '@/components/ui/avatar';

const PlayerSetupPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      setGameId(location.state.gameId);
      setPlayerId(location.state.playerId);
    } else {
      toast({
        title: "Error",
        description: "Game or player information not found. Please join a game first.",
        variant: "destructive",
      });
      navigate('/join'); // Redirect to join page if no state
    }
  }, [location.state, navigate, toast]);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleSaveAvatar = async () => {
    if (!gameId || !playerId || !selectedAvatar) {
      toast({
        title: "Error",
        description: "Missing game or player information, or no avatar selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getDatabase(app);
      const gameRef = ref(db, `games/${gameId}`);
      const gameSnapshot = await get(gameRef);

      if (gameSnapshot.exists()) {
        const gameData = gameSnapshot.val();
        const players = gameData.players || {};

        if (players[playerId]) {
          players[playerId].avatar = selectedAvatar;
          await update(gameRef, { [`players/${playerId}`]: players[playerId] });
        } else {
          throw new Error("Player not found in game.");
        }
      } else {
        throw new Error("Game not found.");
      }

      toast({
        title: "Success",
        description: "Avatar saved successfully!",
      });
      navigate(`/game-room?gameId=${gameId}&playerId=${playerId}`); // Redirect to game room with playerId
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast({
        title: "Error",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!gameId || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <p className="text-white text-xl">Loading player data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Select Your Avatar</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`cursor-pointer rounded-full overflow-hidden border-4 ${selectedAvatar === avatar ? 'border-purple-500' : 'border-transparent'} hover:border-purple-400 transition-all duration-200`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveAvatar}
          disabled={!selectedAvatar}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200
            ${selectedAvatar ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
        >
          Save Avatar and Join Game
        </button>
      </div>
    </div>
  );
};

export default PlayerSetupPage;