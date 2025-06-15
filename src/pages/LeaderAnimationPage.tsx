import React, { useEffect, useState } from 'react';
import { Player, Quiz } from "@/types";
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
// @ts-ignore - Temporarily ignore type checking for framer-motion import
// Note: Run "npm install framer-motion" or "yarn add framer-motion" to install the package

import confetti from 'canvas-confetti';

interface LeaderAnimationPageProps {
  // This component will likely receive player data and quiz data
  // For now, we'll assume it gets it from location state or props
}

export const LeaderAnimationPage: React.FC<LeaderAnimationPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const NUM_ANIMATED_PLAYERS = 6; // Define how many players to animate
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [allSortedPlayers, setAllSortedPlayers] = useState<Player[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | undefined>(undefined);
  const [highlightCorrectAnswer, setHighlightCorrectAnswer] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (location.state && location.state.players && location.state.activeQuiz && location.state.currentQuestionIndex !== undefined && location.state.isHost !== undefined) {
      const allPlayers: Player[] = location.state.players;
      const quiz: Quiz = location.state.activeQuiz;
      const qIndex: number = location.state.currentQuestionIndex;
      const hostStatus: boolean = location.state.isHost;

      setActiveQuiz(quiz);
      setCurrentQuestionIndex(qIndex);
      setIsHost(hostStatus);

      const sortedPlayers = [...allPlayers].sort((a, b) => {
        // Primary sort by score (descending)
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // Secondary sort by average time to answer (ascending) if scores are equal
        const aCorrectAnswers = a.answers?.filter(ans => ans.correct) || [];
        const aTotalTime = aCorrectAnswers.reduce((sum, ans) => sum + ans.timeToAnswer, 0);
        const aAvgTime = aCorrectAnswers.length > 0 ? aTotalTime / aCorrectAnswers.length : Infinity;

        const bCorrectAnswers = b.answers?.filter(ans => ans.correct) || [];
        const bTotalTime = bCorrectAnswers.reduce((sum, ans) => sum + ans.timeToAnswer, 0);
        const bAvgTime = bCorrectAnswers.length > 0 ? bTotalTime / bCorrectAnswers.length : Infinity;

        return aAvgTime - bAvgTime;
      });

      setTopPlayers(sortedPlayers.slice(0, NUM_ANIMATED_PLAYERS)); // Get top players for animation based on constant
      setAllSortedPlayers(sortedPlayers); // Store all sorted players for the table

      // Trigger confetti after a delay
      const confettiDelay = setTimeout(() => {
        setShowConfetti(true);
        confetti({
          particleCount: 500, // More particles for a blast effect
          spread: 180, // Wider spread for a sky shot
          startVelocity: 60, // Higher velocity for particles to shoot up
          decay: 0.9, // Slower decay to keep particles in air longer
          scalar: 1.2, // Larger particles
          shapes: ['circle', 'square'], // Mix of shapes
          colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'] // Vibrant colors
        });
      }, 3000); // 3-second delay before confetti starts

      return () => clearTimeout(confettiDelay);
    } else {
      // If no data, redirect or show an error
      navigate('/'); // Redirect to home or a suitable page
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (activeQuiz && currentQuestionIndex !== undefined) {
      const timer = setTimeout(() => {
        setHighlightCorrectAnswer(true);
      }, 5000); // Highlight after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [activeQuiz, currentQuestionIndex]);

  const calculateAverageResponseTime = (player: Player): string => {
    const correctAnswers = player.answers?.filter(ans => ans.correct) || [];
    if (correctAnswers.length === 0) {
      return '0s';
    }
    const totalTime = correctAnswers.reduce((sum, ans) => sum + ans.timeToAnswer, 0);
    const avgTime = totalTime / correctAnswers.length;
    return `${avgTime.toFixed(2)}s`;
  };

  const calculateCorrectAnswersCount = (player: Player): string => {
    const correctAnswers = player.answers?.filter(ans => ans.correct).length || 0;
    const totalQuestions = activeQuiz?.questions.length || 0;
    return `${correctAnswers} / ${totalQuestions}`;
  };

  if (allSortedPlayers.length === 0) { // Check allSortedPlayers for loading state
    return <div className="flex items-center justify-center min-h-screen text-white text-2xl">Loading Leaderboard...</div>;
  }

  return (
    <React.Fragment>
      <div className="min-h-screen bg-[#1a1f36] flex flex-col items-center justify-center p-4 overflow-hidden">
        <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg animate-fade-in">Top Leaders!</h1>
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Pyramid Structure */}
          <div className="relative w-full flex justify-center mb-8">
            {/* 1st Rank Player (Top of Pyramid) */}
            {topPlayers[0] && (
              <motion.div
                key={topPlayers[0].player_id}
                className="relative flex flex-col items-center p-6 rounded-xl shadow-xl bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-yellow-200 z-50 w-64 h-64 justify-center"
                initial={{ opacity: 0, y: -100, scale: 0.5 }}
                animate={{
                  opacity: 1, y: 0, scale: 1,
                  transition: { duration: 1, ease: "easeOut", delay: 2.5 }
                }}
              >
                <motion.span
                  className="text-6xl mb-2" role="img" aria-label="king"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.2, rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.8, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
                >👑</motion.span>
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg mb-2">
                  <AvatarImage src={topPlayers[0].avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
                    {typeof topPlayers[0].nickname === 'string' && topPlayers[0].nickname.length > 0
                      ? topPlayers[0].nickname.charAt(0).toUpperCase()
                      : ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-3xl font-extrabold text-white drop-shadow-md text-center">{topPlayers[0].nickname}</span>
                <span className="text-xl text-white text-opacity-90">Score: {topPlayers[0].score}</span>
              </motion.div>
            )}
          </div>

          <div className="w-full flex justify-center items-end mb-8 space-x-8">
            {/* 2nd Rank Player (Left of 1st) */}
            {topPlayers[1] && (
              <motion.div
                key={topPlayers[1].player_id}
                className="relative flex flex-col items-center p-4 rounded-xl shadow-xl bg-gradient-to-r from-gray-300 to-gray-400 border-3 border-gray-200 z-40 w-56 h-56 justify-center"
                initial={{ opacity: 0, y: -100, scale: 0.5 }}
                animate={{
                  opacity: 1, y: 0, scale: 1,
                  transition: { duration: 1, ease: "easeOut", delay: 2 }
                }}
              >
                <motion.span
                  className="text-5xl mb-2" role="img" aria-label="trophy"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.6, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.8 }}
                >🏆</motion.span>
                <Avatar className="w-20 h-20 border-3 border-white shadow-lg mb-2">
                  <AvatarImage src={topPlayers[1].avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {typeof topPlayers[1].nickname === 'string' && topPlayers[1].nickname.length > 0
                      ? topPlayers[1].nickname.charAt(0).toUpperCase()
                      : ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-2xl font-extrabold text-white drop-shadow-md text-center">{topPlayers[1].nickname}</span>
                <span className="text-lg text-white text-opacity-90">Score: {topPlayers[1].score}</span>
              </motion.div>
            )}

            {/* 3rd Rank Player (Right of 1st) */}
            {topPlayers[2] && (
              <motion.div
                key={topPlayers[2].player_id}
                className="relative flex flex-col items-center p-4 rounded-xl shadow-xl bg-gradient-to-r from-amber-600 to-amber-700 border-3 border-amber-500 z-30 w-56 h-56 justify-center"
                initial={{ opacity: 0, y: -100, scale: 0.5 }}
                animate={{
                  opacity: 1, y: 0, scale: 1,
                  transition: { duration: 1, ease: "easeOut", delay: 1.5 }
                }}
              >
                <motion.span
                  className="text-5xl mb-2" role="img" aria-label="rocket"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 0.7, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.6 }}
                >🚀</motion.span>
                <Avatar className="w-20 h-20 border-3 border-white shadow-lg mb-2">
                  <AvatarImage src={topPlayers[2].avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {typeof topPlayers[2].nickname === 'string' && topPlayers[2].nickname.length > 0
                      ? topPlayers[2].nickname.charAt(0).toUpperCase()
                      : ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-2xl font-extrabold text-white drop-shadow-md text-center">{topPlayers[2].nickname}</span>
                <span className="text-lg text-white text-opacity-90">Score: {topPlayers[2].score}</span>
              </motion.div>
            )}
          </div>

          <div className="w-full flex justify-around items-end">
            {/* 4th, 5th, 6th Rank Players (Bottom Row) */}
            {topPlayers.slice(3, 6).map((player, index) => (
              <motion.div
                key={player.player_id}
                className={`relative flex flex-col items-center p-3 rounded-xl shadow-xl z-${10 - index} w-48 h-48 justify-center
                  ${index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-blue-300' : ''}
                  ${index === 1 ? 'bg-gradient-to-r from-green-400 to-green-500 border-2 border-green-300' : ''}
                  ${index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-500 border-2 border-purple-300' : ''}
                  `}
                initial={{ opacity: 0, y: -100, scale: 0.5 }}
                animate={{
                  opacity: 1, y: 0, scale: 1,
                  transition: { duration: 1, ease: "easeOut", delay: 1 + (index * 0.2) } // Staggered delay
                }}
              >
                <Avatar className="w-16 h-16 border-2 border-white shadow-lg mb-2">
                  <AvatarImage src={player.avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                    {typeof player.nickname === 'string' && player.nickname.length > 0
                      ? player.nickname.charAt(0).toUpperCase()
                      : ''}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xl font-extrabold text-white drop-shadow-md text-center">{player.nickname}</span>
                <span className="text-base text-white text-opacity-90">Score: {player.score}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Player Ranks Table */}
        <div className="mt-12 w-full max-w-7xl bg-[#1f2747] rounded-lg shadow-xl p-8">
          <h2 className="text-center text-4xl font-extrabold text-white mb-8">All Player Ranks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#2a3356]">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Avatar</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Nickname</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Avg. Time</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Correct Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {allSortedPlayers.map((player, index) => (
                  <tr key={player.player_id} className={index % 2 === 0 ? 'bg-[#2a3356] hover:bg-[#323c64]' : 'bg-[#1f2747] hover:bg-[#323c64]'}>
                    <td className="px-8 py-5 whitespace-nowrap text-base font-medium text-gray-200">{index + 1}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <Avatar className="w-14 h-14 border-2 border-gray-200">
                        <AvatarImage src={player.avatar || ''} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xl">
                          {typeof player.nickname === 'string' && player.nickname.length > 0
                            ? player.nickname.charAt(0).toUpperCase()
                            : ''}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-base text-gray-200">{player.nickname}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-base text-gray-200">{player.score}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-base text-gray-200">{calculateAverageResponseTime(player)}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-base text-gray-200">{calculateCorrectAnswersCount(player)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isHost && ( // Only show "Go to Home" button if the user is the host
          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default LeaderAnimationPage;