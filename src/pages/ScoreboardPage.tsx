import React, { useState, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import ConfettiAnimation from "@/components/ConfettiAnimation"; 
 import { Player } from "@/types"; // Import Player interface from types
 
 import { Quiz, Question } from "@/types";

interface ScoreboardPageProps { 
   players: Player[]; 
   currentQuestion: Question | null;
   currentQuiz: Quiz | null;
 } 
 
 const rankColors = [ 
   "bg-yellow-400 text-black", // 1st 
   "bg-gray-300 text-black",   // 2nd 
   "bg-orange-400 text-black", // 3rd 
   "bg-purple-700 text-white", // others 
 ]; 
 
 export const ScoreboardPage: React.FC<ScoreboardPageProps> = ({ players, currentQuestion, currentQuiz }) => { 
   // Sort players by score descending 
    const [prevPlayers, setPrevPlayers] = useState<Player[]>([]);

  const calculateOptionVotes = () => {
    if (!currentQuestion || !currentQuiz) return {};

    const votes: { [optionId: string]: number } = {};
    const totalPlayers = players.length;

    currentQuestion.options.forEach(option => {
      votes[option.id] = 0;
    });

    players.forEach(player => {
      const playerAnswer = player.answers?.find(answer => answer.questionId === currentQuestion.id);
      if (playerAnswer) {
        votes[playerAnswer.selectedOption] += 1;
      }
    });

    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

    const percentages: { [optionId: string]: number } = {};
    currentQuestion.options.forEach(option => {
      percentages[option.id] = totalVotes > 0 ? (votes[option.id] / totalVotes) * 100 : 0;
    });

    return { votes, percentages, totalVotes };
  };

  const { votes, percentages, totalVotes } = calculateOptionVotes();

  useEffect(() => {
    // Store current players as previous players for the next render
    setPrevPlayers(players);
  }, [players]);

  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankChange = (currentPlayer: Player, currentIdx: number) => {
    const prevIdx = prevPlayers.findIndex(p => p.player_id === currentPlayer.player_id);
    if (prevIdx === -1) return 0; // New player or first render
    return prevIdx - currentIdx;
  };

  const getScoreChange = (currentPlayer: Player) => {
    const prevPlayer = prevPlayers.find(p => p.player_id === currentPlayer.player_id);
    if (!prevPlayer) return 0;
    return currentPlayer.score - prevPlayer.score;
  }; 

  // Find the player with the highest streak above 5
  const highestStreakPlayer = players.reduce((max, p) => (p.streak && p.streak > (max?.streak || 0) ? p : max), null as Player | null);
  const showStreakHighlight = highestStreakPlayer && highestStreakPlayer.streak > 5;
 
   return ( 
     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 relative overflow-hidden"> 
       <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10"> 
         <h1 className="text-4xl font-bold bg-white rounded-lg px-8 py-2 shadow-lg text-purple-800">Scoreboard</h1> 
       </div> 
       <div className="w-full max-w-2xl mt-24 md:mt-32 space-y-4 p-2 md:p-4 z-10"> 
         {currentQuestion && ( 
           <div className="bg-white rounded-lg p-6 shadow-lg mb-8"> 
             <h2 className="text-2xl font-bold text-purple-800 mb-4">{currentQuestion.text}</h2> 
             <div className="space-y-4"> 
               {currentQuestion.options.map((option) => ( 
                 <div key={option.id} className="flex items-center gap-4"> 
                   <div className="w-full bg-gray-100 rounded-full h-6 relative overflow-hidden"> 
                     <div
                       className={`h-full rounded-full text-right pr-2 flex items-center justify-between text-white font-bold transition-all duration-500 ease-out ${option.id === currentQuestion.correctOption ? 'bg-green-500' : 'bg-indigo-500'}`}
                       style={{ width: `${percentages[option.id] || 0}%` }}
                     >
                       <span className="absolute left-2 text-black font-semibold">{option.text}</span>
                       <span className="absolute right-2 text-black font-semibold">{Math.round(percentages[option.id] || 0)}%</span>
                     </div> 
                   </div> 
                 </div> 
               ))} 
             </div> 
             <p className="text-gray-600 text-lg mt-4">Total answers: {totalVotes}</p>
            {currentQuestion.correctOption && (
              <p className="text-green-600 text-lg mt-2">Correct Answer: {currentQuestion.options.find(opt => opt.id === currentQuestion.correctOption)?.text}</p>
            )} 
           </div> 
         )} 
         <AnimatePresence> 
           {sortedPlayers.map((player, idx) => ( 
             <motion.div 
               key={player.player_id} // Use player_id as key 
               layoutId={player.player_id} // Add layoutId for smooth transitions
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               transition={{
                   type: "spring",
                   stiffness: 150, // Increased stiffness for a snappier feel
                   damping: 12,    // Slightly increased damping to control overshoot
                   mass: 1,        // Added mass for more realistic spring physics
                   delay: idx * 0.05, // Slightly reduced delay for faster animation
                 }} 
               className={`flex items-center justify-between px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-xl mb-2 text-xl md:text-2xl font-semibold transform transition-all duration-300 hover:scale-[1.02] ${ 
                 rankColors[idx] || rankColors[3] 
               }`}  
             > 
               <div className="flex items-center gap-4">
                 <span className="text-2xl md:text-3xl font-black w-8 md:w-10 text-center">{idx + 1}</span>
                 {idx === 0 && (
                   <motion.span
                     initial={{ opacity: 0, rotate: 0 }}
                     animate={{ opacity: 1, rotate: [0, 20, -20, 0] }}
                     transition={{ delay: 0.5, duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                     className="text-3xl md:text-4xl mr-2"
                   >
                     🏆
                   </motion.span>
                 )}
                 {getScoreChange(player) >= 50 && (
                   <motion.span
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                     className="text-2xl md:text-3xl mr-2"
                   >
                     🔥
                   </motion.span>
                 )}

                 {player.avatar ? (
                   <img
                     src={player.avatar}
                     alt={player.nickname}
                     className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white object-cover"
                   />
                 ) : (
                   <span className="text-2xl md:text-3xl">👤</span> // Generic avatar if none
                 )}
                 <span>{player.nickname}</span>
                 {currentQuestion && player.answers?.some(a => a.questionId === currentQuestion.id && a.selectedOption === currentQuestion.correctOption) && (
                   <motion.span
                     initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                     animate={{ opacity: 1, scale: 1, rotate: 0 }}
                     transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                     className="text-green-400 text-2xl md:text-3xl ml-2"
                   >
                     ✅
                   </motion.span>
                 )}
                 {player.streak && player.streak > 0 && (
                   <motion.span
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                     className="ml-2 text-lg md:text-xl font-bold text-red-500"
                   >
                     🔥 {player.streak}x
                   </motion.span>
                 )}
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-lg md:text-xl font-bold">{player.score}</span>
                 {getScoreChange(player) > 0 && (
                   <motion.span
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                     className="text-green-400 text-base md:text-lg"
                   >
                     +{getScoreChange(player)}
                   </motion.span>
                 )}
                 {getRankChange(player, idx) > 0 && (
                   <motion.span
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                     className="text-green-400 text-base md:text-lg"
                   >
                     ⬆️{Math.abs(getRankChange(player, idx))}
                   </motion.span>
                 )}
                 {getRankChange(player, idx) < 0 && (
                   <motion.span
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                     className="text-red-400 text-lg"
                   >
                     ⬇️{Math.abs(getRankChange(player, idx))}
                   </motion.span>
                 )}
                 {getRankChange(player, idx) < 0 && (
                   <motion.span
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.5 }}
                     className="text-red-400 text-lg"
                   >
                     ⬇️{Math.abs(getRankChange(player, idx))}
                   </motion.span>
                 )}
               </div>
             </motion.div>
           ))} 
         </AnimatePresence> 
       </div> 

       {/* Decorative elements */}
       <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500 rounded-full opacity-20 -translate-x-24 -translate-y-24"></div>
       <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 translate-x-32 translate-y-32"></div>
       <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
       <ConfettiAnimation active={true} />
     </div> 
   ); 
 }; 
 
 export default ScoreboardPage;