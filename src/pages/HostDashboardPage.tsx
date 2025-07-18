import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from "@/components/Logo";
import QuizCard from "@/components/QuizCard";
import { useGame } from "@/contexts/GameContext";
import { Quiz, ScienceSubject } from "@/types";
import { scienceSubjects, sampleQuizzes } from "@/utils/gameUtils";
import { useToast } from "@/components/ui/use-toast";

import { Filter, Search, BookOpen, Users, Play, Award, Plus, Home, LogOut, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BackgroundContainer from "@/components/BackgroundContainer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateQuizForm from "@/components/CreateQuizForm";
import ProfileSetup from "@/components/ProfileSetup";
import { ref as databaseRef, remove, update } from "firebase/database";
// db is already imported below, removing duplicate import
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebaseConfig';

async function getQuizById(quizId: string) {
  const quizRef = ref(db, `quizzes/${quizId}`);
  const snapshot = await get(quizRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}
import { Howl, Howler } from 'howler';
import { GameResultsActions } from "@/components/GameResultsActions";
import { SharedQuizResultsActions } from "@/components/SharedQuizResultsActions";

interface GameHistory {
  id: string;
  quizTitle: string;
  startedAt: string;
  endedAt: string;
  playerCount: number;
  averageScore: number;
  players: Record<string, any>;
  quiz: Quiz | null;
}

const HostDashboardPage: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();
  const { createGame, startGame } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('HostDashboardPage: currentUser', currentUser);
  console.log('HostDashboardPage: loading', loading);

  const [subjects, setSubjects] = useState<ScienceSubject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [sharedQuizHistory, setSharedQuizHistory] = useState<Record<string, SharedGameHistoryEntry[]>>({});
  const [viewingQuizId, setViewingQuizId] = useState<string | null>(null);

  interface SharedGameHistoryEntry {
    quiz: Quiz;
    quizId: string;
    quizTitle: string;
    players: Record<string, any>;
    createdBy: string;
  }

  // Preload video and audio assets
  useEffect(() => {

    const cleanupOldGames = async () => {
      if (!currentUser?.uid) return;

      try {
        const gamesRef = ref(db, 'games');
        const snapshot = await get(gamesRef);
        if (snapshot.exists()) {
          const gamesData = snapshot.val();
          const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

          for (const gameId in gamesData) {
            const game = gamesData[gameId];
            if (game.hostId === currentUser.uid) {
              const startedAtTimestamp = new Date(game.startedAt).getTime();
              // Case 1: Game has ended and is older than 3 days
              if (game.endedAt) {
                const endedAtTimestamp = new Date(game.endedAt).getTime();
                if (endedAtTimestamp < threeDaysAgo) {
                  console.log(`Deleting old ended game: ${gameId} (ended on ${game.endedAt})`);
                  await remove(ref(db, `games/${gameId}`));
                }
              } else if (startedAtTimestamp < threeDaysAgo) {
                // Case 2: Game has not ended but started more than 3 days ago
                console.log(`Deleting old unended game: ${gameId} (started on ${game.startedAt})`);
                await remove(ref(db, `games/${gameId}`));
              }
            }
          }
          // After cleanup, reload game history to reflect changes
          const loadGameHistory = async () => {
            if (!currentUser?.uid) return;
            try {
              const gamesRef = ref(db, 'games');
              const snapshot = await get(gamesRef);
              if (snapshot.exists()) {
                const gamesData = snapshot.val();
                const userGames = Object.entries(gamesData)
                  .filter(([_, game]: [string, any]) => game.hostId === currentUser.uid)
                  .map(([id, game]: [string, any]) => ({
                    id,
                    quizTitle: game.quiz?.title || 'Untitled Quiz',
                    startedAt: game.startedAt || '',
                    endedAt: game.endedAt || '',
                    playerCount: Object.keys(game.players || {}).length,
                    averageScore: calculateAverageScore(game.players || {}),
                    players: game.players || {},
                    quiz: game.quiz || null
                  }))
                  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
                setGameHistory(userGames);
              }
            } catch (error) {
              console.error('Error loading game history:', error);
            }
          };
          loadGameHistory();
        }
      } catch (error) {
        console.error('Error cleaning up old games:', error);
      }
    };

    cleanupOldGames();

    const loadSharedQuizHistory = async () => {
      try {
        const gameHistoryRef = ref(db, 'gameHistory');
        const snapshot = await get(gameHistoryRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const groupedHistory: Record<string, SharedGameHistoryEntry[]> = {};

          for (const quizId in data) {
            const quizData = data[quizId];
            const quizTitle = quizData.quizTitle || 'Untitled Quiz';
            const createdBy = quizData.createdBy;
            const players = quizData.players || {};

            if (currentUser && createdBy === currentUser.uid && Object.keys(players).length > 0) {
              const fullQuiz = await getQuizById(quizId); // Fetch the full quiz object
              if (!groupedHistory[quizId]) {
                groupedHistory[quizId] = [];
              }
              groupedHistory[quizId].push({
                quizId,
                quizTitle,
                players,
                createdBy: createdBy,
                quiz: fullQuiz // Assign the fetched full quiz object
              });
            }
          }
          setSharedQuizHistory(groupedHistory);
        }
      } catch (error) {
        console.error('Error loading shared quiz history:', error);
      }
    };

    loadSharedQuizHistory();

    const cleanupOldSharedQuizHistory = async () => {
      try {
        const gameHistoryRef = ref(db, 'gameHistory');
        const snapshot = await get(gameHistoryRef);
        if (snapshot.exists()) {
          const gameHistory = snapshot.val();
          const twentyDaysAgo = Date.now() - (20 * 24 * 60 * 60 * 1000);

          for (const quizId in gameHistory) {
            const quizData = gameHistory[quizId];
            if (quizData.createdAt && quizData.createdAt < twentyDaysAgo) {
              console.log(`Deleting old shared quiz history for quizId: ${quizId}`);
              await remove(ref(db, `gameHistory/${quizId}`));
            }
          }
          console.log('Old shared quiz history cleanup complete.');
        }
      } catch (error) {
        console.error('Error cleaning up old shared quiz history:', error);
      }
    };

    cleanupOldSharedQuizHistory();

    // Preload audio
    const mrDevSoundPreload = new Howl({
      src: ['/sounds/mrdeveloper.mp3'],
      preload: true,
      volume: 0,
    });

    const backgroundSoundPreload = new Howl({
      src: ['/sounds/background.mp3'],
      preload: true,
      volume: 0,
    });

    const warningSoundPreload = new Howl({
      src: ['/sounds/warning.mp3'],
      preload: true,
      volume: 0,
    });

    const videoPromises = [];

    // Preload video PC
    const videoPc = document.createElement('video');
    videoPc.src = '/dev.mp4';
    videoPc.load();
    videoPromises.push(new Promise(resolve => {
      videoPc.onloadeddata = () => resolve(true);
      videoPc.onerror = () => resolve(false); // Resolve false on error
    }));

    // Preload video Mobile
    const videoMobile = document.createElement('video');
    videoMobile.src = '/dev-mobile.mp4';
    videoMobile.load();
    videoPromises.push(new Promise(resolve => {
      videoMobile.onloadeddata = () => resolve(true);
      videoMobile.onerror = () => resolve(false); // Resolve false on error
    }));



    const audioPromises = [
      new Promise(resolve => mrDevSoundPreload.once('load', () => resolve(true))),
      new Promise(resolve => backgroundSoundPreload.once('load', () => resolve(true))),
      new Promise(resolve => warningSoundPreload.once('load', () => resolve(true))),
    ];

    // Combine all promises and set a timeout for 2 minutes
    const allAssetsLoaded = Promise.all([...videoPromises, ...audioPromises]);

    const timeout = setTimeout(() => {
      console.warn('Assets did not fully preload within 2 minutes.');
    }, 120000); // 2 minutes in milliseconds

    allAssetsLoaded.then(() => {
      clearTimeout(timeout);
      console.log('All assets preloaded successfully!');
    }).catch(error => {
      clearTimeout(timeout);
      console.error('Error preloading assets:', error);
    });

    return () => {
      clearTimeout(timeout);
      mrDevSoundPreload.unload();
      backgroundSoundPreload.unload();
      warningSoundPreload.unload();
      // No need to remove video elements as they are not appended to DOM yet
    };
  }, []);

  // Calculate average score for game history
  const calculateAverageScore = (players: any) => {
    if (!players || Object.keys(players).length === 0) return 0;
    const totalScore = Object.values(players).reduce((sum: number, player: any) => {
      return sum + (player.score || 0);
    }, 0);
    return Math.round((Number(totalScore) / Object.keys(players).length) * 100) / 100;
  };

  // Load game history
  useEffect(() => {
    const loadGameHistory = async () => {
      if (!currentUser?.uid) return;
      try {
        const gamesRef = ref(db, 'games');
        const snapshot = await get(gamesRef);
        if (snapshot.exists()) {
          const gamesData = snapshot.val();
          const userGames = Object.entries(gamesData)
            .filter(([_, game]: [string, any]) => game.hostId === currentUser.uid)
            .map(([id, game]: [string, any]) => ({
              id,
              quizTitle: game.quiz?.title || 'Untitled Quiz',
              startedAt: game.startedAt || '',
              endedAt: game.endedAt || '',
              playerCount: Object.keys(game.players || {}).length,
              averageScore: calculateAverageScore(game.players || {}),
              players: game.players || {},
              quiz: game.quiz || null
            }))
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
          setGameHistory(userGames);
        }
      } catch (error) {
        console.error('Error loading game history:', error);
      }
    };

    loadGameHistory();
  }, [currentUser?.uid]);

  // Load subjects and quizzes
  useEffect(() => {
    // Load subjects
    setSubjects(scienceSubjects);
    
    const loadQuizzes = async () => {
      try {
        if (!currentUser?.uid) {
          if (!loading) {
setQuizzes(sampleQuizzes.map(quiz => ({
  ...quiz,
  createdAt: typeof quiz.createdAt === 'string' ? quiz.createdAt : quiz.createdAt.toISOString(),
  totalQuestions: quiz.questions?.length || 0,
  totalMarks: quiz.questions?.reduce((sum, q) => sum + (q.Marks || 0), 0) || 0
})));
            navigate("/host-login");
            toast({
              title: "Access Denied",
              description: "Please log in to view your quizzes.",
              variant: "destructive"
            });
          }
          return;
        }

        // Reference to the quizzes in Firebase
        console.log('Loading quizzes for user:', currentUser.uid);
        const quizzesRef = ref(db, 'quizzes');
        console.log('Quizzes ref:', quizzesRef);
        const snapshot = await get(quizzesRef);
        console.log('Quizzes snapshot:', snapshot.val());
        
        let combinedQuizzes: Quiz[] = [];
        
        if (snapshot.exists()) {
          const firebaseData = snapshot.val() || {};
          console.log('Firebase data:', firebaseData);
          const firebaseQuizzes = Object.entries(firebaseData).map(([key, quiz]: [string, any]): Quiz => {
            const questions = Array.isArray(quiz.questions) ? quiz.questions.map((q: any) => ({
              id: q.id || key + '_q' + Math.random().toString(36).substr(2, 9),
              text: q.text || '',
              options: Array.isArray(q.options) ? q.options.map((opt: any) => ({
                id: opt.id || key + '_opt' + Math.random().toString(36).substr(2, 9),
                text: opt.text || ''
              })) : [],
              correctOption: q.correctOption || '',
              Marks: typeof q.Marks === 'number' && !isNaN(q.Marks) ? q.Marks : 1,
              timeLimit: typeof q.timeLimit === 'number' && !isNaN(q.timeLimit) ? q.timeLimit : 30,
              imageUrl: typeof q.imageUrl === 'string' ? q.imageUrl : undefined
            })) : [];

            const totalQuestions = questions.length;
            const totalMarks = questions.reduce((sum, q) => sum + (typeof q.Marks === 'number' ? q.Marks : 0), 0);

            return {
              id: quiz.id || key,
              title: typeof quiz.title === 'string' ? quiz.title : '',
              description: typeof quiz.description === 'string' ? quiz.description : '',
              subject: typeof quiz.subject === 'string' ? quiz.subject : '',
              grade: typeof quiz.grade !== 'undefined' ? String(quiz.grade).trim() : '11',
              topic: typeof quiz.topic === 'string' ? quiz.topic : undefined,
              createdBy: typeof quiz.createdBy === 'string' ? quiz.createdBy : '',
              createdAt: typeof quiz.createdAt === 'string' ? quiz.createdAt : new Date().toISOString(),
              questions,
              totalQuestions,
              totalMarks,
              hasNegativeMarking: typeof quiz.hasNegativeMarking === 'boolean' ? quiz.hasNegativeMarking : false,
              negativeMarkingValue: typeof quiz.negativeMarkingValue === 'number' ? quiz.negativeMarkingValue : 0
            };
          });
          
          // Filter quizzes created by current user
          combinedQuizzes = firebaseQuizzes.filter(quiz => quiz.createdBy === currentUser.uid);
        }
        
        setQuizzes(combinedQuizzes);
      } catch (error) {
        console.error("Error loading quizzes:", error);
        toast({
          title: "Error",
          description: "Failed to load quizzes. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadQuizzes();
  }, [currentUser?.uid, createDialogOpen, loading, navigate, toast, db]); // Re-run when auth state changes

  // Filter quizzes based on selected filters
  const filteredQuizzes = quizzes.filter(quiz => {
    try {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by subject
      const matchesSubject = selectedSubject === "all" || 
        (quiz.subject && quiz.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by grade
      console.log(`Filtering: Quiz ID: ${quiz.id}, Quiz Grade (raw): ${quiz.grade}, Quiz Grade (processed): '${String(quiz.grade).replace(/[^\d]/g, '')}', Selected Grade: '${selectedGrade}', Match: ${selectedGrade === "all" || (quiz.grade && String(quiz.grade).replace(/[^\d]/g, '') === selectedGrade)}`);
      const matchesGrade = selectedGrade === "all" || 
        (quiz.grade && String(quiz.grade).replace(/[^\d]/g, '') === selectedGrade);
      
      return matchesSearch && matchesSubject && matchesGrade;
    } catch (error) {
      console.error("Error filtering quiz:", error, quiz);
      return false;
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Helper function to extract public ID from Cloudinary URL
 const extractPublicIdFromUrl = (url: string) => {
   if (!url) return null;
   const matches = url.match(/\/v\d+\/(.+)\./);
   return matches ? matches[1] : null;
 };

 // Updated handleDeleteQuiz function
 const handleDeleteQuiz = async (quizId: string) => {
    try {
       if (!currentUser?.uid) return;
 
       const quiz = quizzes.find(q => q.id === quizId);
       if (!quiz) return;
 
       // Extract image URLs from quiz questions
       const imageUrls = quiz.questions
         ?.filter(q => q.imageUrl)
         ?.map(q => q.imageUrl)
         ?.filter(Boolean) || [];
 
       // Delete images from Cloudinary via backend API
       if (imageUrls.length > 0) {
         try {
           const response = await fetch(`/api/quiz/${quizId}`, {
             method: 'DELETE',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({ imageUrls })
           });
 
           if (!response.ok) {
             console.warn('Failed to delete some images from Cloudinary');
           } else {
             const result = await response.json();
             console.log(`Deleted ${result.deletedImages} images from Cloudinary`);
           }
         } catch (imageError) {
           console.error('Error deleting images:', imageError);
           // Continue with quiz deletion even if image deletion fails
         }
       }
 
       // Delete quiz from Firebase
       await remove(ref(db, `/quizzes/${quizId}`));
       await remove(ref(db, `/users/${currentUser.uid}/quizzes/${quizId}`));
 
       // Update local state
       setQuizzes(quizzes.filter(q => q.id !== quizId));
       
       toast({
         title: "Quiz Deleted",
         description: `Quiz and ${imageUrls.length} associated images have been deleted.`,
         variant: "default"
       });
     } catch (error) {
       console.error("Error deleting quiz:", error);
       toast({
         title: "Error",
         description: "Failed to delete quiz. Please try again.",
         variant: "destructive"
       });
     }
   };

  const handleClearGameData = async () => {
    if (!currentUser?.uid) return;

    try {
      // Clear game history from local storage
      localStorage.removeItem("gameHistory");

      // Delete all games created by the current user from Firebase
      const gamesRef = ref(db, 'games');
      const gamesSnapshot = await get(gamesRef);
      if (gamesSnapshot.exists()) {
        const gamesData = gamesSnapshot.val();
        for (const gameId in gamesData) {
          if (gamesData[gameId].hostId === currentUser.uid) {
            await remove(ref(db, `games/${gameId}`));
          }
        }
      }



      setGameHistory([]); // Clear game history from state
      toast({
        title: "All User Data Cleared",
        description: "All your hosted games  have been cleared successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error clearing game data:", error);
      toast({
        title: "Error",
        description: "Failed to clear game data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      try {
        setSelectedQuiz(quiz);
        
        // Create game and wait for it to be created
        const gameRoom = await createGame(quiz);
        
        if (gameRoom) {
          toast({
            title: "Quiz Started",
            description: `${quiz.title} has started! Redirecting to game room...`,
            variant: "default"
          });
          
          // Navigate only after game is created
          navigate("/host-game-room");
        } else {
          toast({
            title: "Error",
            description: "Failed to create game room. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error starting quiz:", error);
        toast({
          title: "Error",
          description: "Failed to start quiz. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleClearSharedQuizHistory = async () => {
    if (!currentUser?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to clear shared quiz history.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const gameHistoryRef = ref(db, 'gameHistory');
      const snapshot = await get(gameHistoryRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const quizId in data) {
          const quizData = data[quizId];
          if (quizData.createdBy === currentUser.uid) {
            await remove(ref(db, `gameHistory/${quizId}`));
          }
        }
        toast({
          title: 'Success',
          description: 'Shared quiz history cleared successfully!',
        });
        setSharedQuizHistory({}); // Clear local state
      }
    } catch (error) {
      console.error('Error clearing shared quiz history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear shared quiz history. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClearSharedQuizPlayers = async () => {
    if (!currentUser?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to clear shared quiz players.',
        variant: 'destructive',
      });
      return;
    }

    try {
      for (const quizId in sharedQuizHistory) {
        const quizData = sharedQuizHistory[quizId][0]; // Assuming one entry per quizId
        if (quizData.createdBy === currentUser.uid) {
            console.log(`Attempting to remove gameHistory/${quizId}/players`);
            await remove(ref(db, `gameHistory/${quizId}/players`));
            console.log(`Successfully removed gameHistory/${quizId}/players`);
          }
      }
      toast({
        title: 'Success',
        description: 'Shared quiz players cleared successfully!',
      });
      setSharedQuizHistory({}); // Reset shared quiz history state
    } catch (error) {
      console.error('Error clearing shared quiz players:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear shared quiz players. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    // If not loading and no current user, redirect to login or show a message
    navigate("/host-login"); // Redirect to login page
    return null; // Or return a message like "Please log in to view the dashboard."
  }

  return (
    <BackgroundContainer>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-md">
          <div className="container mx-auto p-4 flex justify-between items-center relative">
            <div className="flex items-center space-x-4 md:space-x-6">
              <Logo />
              {/* Desktop Navigation */}
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.user_metadata?.avatar_url || ''} />
                    <AvatarFallback>{currentUser.user_metadata?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-600 dark:text-white">
                    Welcome, <span className="font-medium">{currentUser.user_metadata?.name || 'Host'}</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="dark:text-white dark:hover:bg-gray-800 flex items-center gap-2 hidden md:flex"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </div>
            </div>

            {/* Mobile Menu and Desktop Profile/Logout */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[320px] dark:bg-gray-900 overflow-y-auto flex flex-col">
                    <nav className="flex flex-col gap-4 p-4 w-full">
                      <Logo />
                      <Button
                        variant="ghost"
                        className="dark:text-white dark:hover:bg-gray-800 flex items-center gap-2 justify-start w-full"
                        onClick={() => { navigate("/"); /* Close sheet */ }}
                      >
                        <Home className="h-4 w-4" />
                        Home
                      </Button>
                      {/* Profile Edit Button for Mobile */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="flex items-center space-x-3 dark:text-white dark:hover:bg-gray-800 justify-start w-full text-left whitespace-normal h-auto py-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={currentUser.user_metadata?.avatar_url || ''} />
                              <AvatarFallback>{currentUser.user_metadata?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-gray-600 dark:text-white text-left break-words">
                              Welcome, <span className="font-medium">{currentUser.user_metadata?.name || 'Host'}</span>
                            </span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] flex items-center justify-center">
                          <ProfileSetup />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="dark:text-white dark:hover:bg-gray-800 flex items-center gap-2 justify-start w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Profile and Logout */}
              <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {/* Profile Edit Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 dark:text-white dark:hover:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser.user_metadata?.avatar_url || ''} />
                          <AvatarFallback>{currentUser.user_metadata?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <span className="text-gray-600 dark:text-white">
                          Welcome, <span className="font-medium">{currentUser.user_metadata?.name || 'Host'}</span>
                        </span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] flex items-center justify-center">
                    <ProfileSetup />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="dark:text-white dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-quiz-dark dark:text-white">Host Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your quizzes and game sessions</p>
        </div>

        <Tabs defaultValue="my-quizzes" className="mb-8">
          <TabsList className="mb-6 bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-md flex-wrap h-auto">
            <TabsTrigger value="my-quizzes" className="dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              My Quizzes
            </TabsTrigger>
            <TabsTrigger value="create-quiz" className="dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white">
              <Play className="w-4 h-4 mr-2" />
              Create Quiz
            </TabsTrigger>
            <TabsTrigger value="game-history" className="dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Game History
            </TabsTrigger>
            <TabsTrigger value="shared-quiz-history" className="dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Shared Quiz History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-quizzes">
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center relative">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  className="pl-10 w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filter by Subject" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <Award className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filter by Grade" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    onDelete={quiz.createdBy === currentUser.uid ? handleDeleteQuiz : undefined} />
                ))
              ) : (
                <div className="col-span-full text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No quizzes found matching your filters.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create-quiz">
            <div className="quiz-card p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
              <div className="text-center">
                <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">Create a New Quiz</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Create custom quizzes for your students by selecting a subject, grade level, and adding your own questions.
                  All your created quizzes will appear in your "My Quizzes" tab.
                </p>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="quiz-btn-primary flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0">
                    <CreateQuizForm onClose={() => setCreateDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="game-history">
            <div className="mb-4">
              <Button
                variant="destructive"
                onClick={handleClearGameData}
                className="dark:bg-red-600 dark:hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Game History
              </Button>
            </div>
            <div className="quiz-card p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">Game History</h2>
              {gameHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="p-4">Quiz Title</th>
                        <th className="p-4">Started</th>
                        <th className="p-4">Ended</th>
                        <th className="p-4">Players</th>
                        <th className="p-4">Avg. Score</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameHistory.map((game) => (
                        <tr key={game.id} className="border-b dark:border-gray-700">
                          <td className="p-4">{game.quizTitle}</td>
                          <td className="p-4">
                            {game.startedAt && !isNaN(new Date(game.startedAt).getTime())
                              ? new Date(game.startedAt).toLocaleString()
                              : 'Not Started'}
                          </td>
                          <td className="p-4">
                            {game.endedAt && !isNaN(new Date(game.endedAt).getTime())
                              ? new Date(game.endedAt).toLocaleString()
                              : 'In Progress'}
                          </td>
                          <td className="p-4">{game.playerCount}</td>
                          <td className="p-4">{game.averageScore}</td>
                          <td className="p-4">
                            <GameResultsActions
                              players={Object.values(game.players)}
                              quiz={game.quiz}
                              totalQuestions={game.quiz?.questions?.length || 0}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  You haven't hosted any games yet. Start a quiz to see your game history.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shared-quiz-history">
            <div className="mb-4">
              <Button
                variant="destructive"
                onClick={handleClearSharedQuizPlayers}
                className="dark:bg-red-600 dark:hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Shared Quiz Players
              </Button>
            </div>
            <div className="quiz-card p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">Shared Quiz History</h2>
              {Object.keys(sharedQuizHistory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(sharedQuizHistory).map(([quizId, entries]) => (
                    <div key={quizId} className="border dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-quiz-dark dark:text-white">Quiz: {entries[0].quizTitle}</h3>
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2" >
                          <Button
                            onClick={() => setViewingQuizId(viewingQuizId === quizId ? null : quizId)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 ease-in-out"
                          >
                            {viewingQuizId === quizId ? "Hide Players" : "View Players"}
                          </Button>
                          <div className="w-full sm:w-auto">
                            <SharedQuizResultsActions
                              players={Object.values(entries[0].players)}
                              quiz={entries[0].quiz}
                              totalQuestions={entries[0].quiz?.questions?.length || 0}
                            />
                          </div>
                        </div>
                      </div>
                      {viewingQuizId === quizId && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b dark:border-gray-700">
                                <th className="p-2">Rank</th>
                                <th className="p-2">Player Nickname</th>
                                <th className="p-2">Score</th>
                                <th className="p-2">Completed At</th>

                              </tr>
                            </thead>
                            <tbody>
                              {Object.values(entries[0].players)
                                .sort((a: any, b: any) => b.score - a.score)
                                .map((player: any, index: number) => (
                                <tr key={player.id} className="border-b dark:border-gray-700 last:border-b-0">
                                  <td className="p-2">{index + 1}</td>
                                  <td className="p-2 flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={player.avatar || ''} />
                                      <AvatarFallback>{player.nickname?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                                    </Avatar>
                                    {player.nickname}
                                  </td>
                                  <td className="p-2">{player.score}</td>
                                  <td className="p-2">
                                    {player.completedAt && !isNaN(new Date(player.completedAt).getTime())
                                      ? new Date(player.completedAt).toLocaleString()
                                      : 'N/A'}
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  No shared quiz history found yet. Players who complete quizzes via shared links will appear here.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      </div>
      <footer className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-md py-4">
        <div className="container mx-auto text-center text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
        </div>
        <Avatar className="w-8 h-8 mx-auto mt-2">
          <AvatarImage src={currentUser.user_metadata?.avatar_url || ''} />
          <AvatarFallback>{currentUser.user_metadata?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
      </footer>
    </BackgroundContainer>
  );
};

export default HostDashboardPage;