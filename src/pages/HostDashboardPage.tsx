
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { ref, get, remove } from "firebase/database";
import { db } from "@/lib/firebaseConfig";

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
        const quizzesRef = ref(db, 'quizzes');
        const snapshot = await get(quizzesRef);
        
        let combinedQuizzes: Quiz[] = [];
        
        if (snapshot.exists()) {
          const firebaseData = snapshot.val() || {};
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

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      if (!currentUser?.uid) return;

      // Reference to the specific quiz in Firebase
      const quizRef = ref(db, `quizzes/${quizId}`);
      
      // Delete the quiz from Firebase
      await remove(quizRef);
      
      // Update local state
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);
      
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been successfully deleted.",
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

  const handleStartQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      
      toast({
        title: "Quiz Selected",
        description: `${quiz.title} is ready to start!`,
        variant: "default"
      });
      
      const gameRoom = createGame(quiz);
      navigate("/host-game-room");
    }
  };

  const handleLogout = () => {
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
          <div className="container mx-auto p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <Button
                variant="ghost"
                className="dark:text-white dark:hover:bg-gray-800 flex items-center gap-2"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Profile Edit Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 dark:text-white dark:hover:bg-gray-800">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.user_metadata?.avatar_url || ''} />
                      <AvatarFallback>{currentUser.user_metadata?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-600 dark:text-white">
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
                className="dark:text-white dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-quiz-dark dark:text-white">Host Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your quizzes and game sessions</p>
        </div>

        <Tabs defaultValue="my-quizzes" className="mb-8">
          <TabsList className="mb-6 bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-md">
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
          </TabsList>

          <TabsContent value="my-quizzes">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="quiz-card p-6 text-center bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">Game History</h2>
              <p className="text-gray-600 dark:text-gray-300">
                You haven't hosted any games yet. Start a quiz to see your game history.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </BackgroundContainer>
  );
};

export default HostDashboardPage;

