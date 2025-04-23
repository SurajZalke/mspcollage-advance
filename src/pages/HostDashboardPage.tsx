
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from "@/components/Logo";
import QuizCard from "@/components/QuizCard";
import { useGame } from "@/contexts/GameContext";
import { Quiz, ScienceSubject } from "@/types";
import { scienceSubjects, sampleQuizzes } from "@/utils/gameUtils";
import { useToast } from "@/components/ui/use-toast";
import { Filter, Search, BookOpen, Users, Play, Award } from "lucide-react";
import BackgroundContainer from "@/components/BackgroundContainer";

const HostDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { createGame } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<ScienceSubject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/host-login");
    }
  }, [currentUser, navigate]);

  // Load subjects and quizzes
  useEffect(() => {
    // Load subjects
    setSubjects(scienceSubjects);
    
    // Load quizzes (in a real app, these would be fetched from a server)
    setQuizzes(sampleQuizzes);
  }, []);

  // Filter quizzes based on selected filters
  const filteredQuizzes = quizzes.filter(quiz => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by subject
    const matchesSubject = selectedSubject === "all" || quiz.subject.toLowerCase() === selectedSubject.toLowerCase();
    
    // Filter by grade
    const matchesGrade = selectedGrade === "all" || quiz.grade === selectedGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const handleStartQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      
      toast({
        title: "Quiz Selected",
        description: `${quiz.title} is ready to start!`,
        variant: "default"
      });
      
      const gameRoom = createGame(quizId);
      navigate("/host-game-room");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <BackgroundContainer>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-md">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <Logo />
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-white">
                Welcome, <span className="font-medium">{currentUser.name}</span>
              </span>
              <Button variant="outline" onClick={handleLogout} className="dark:text-white dark:hover:bg-gray-800">
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                    />
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
                <h2 className="text-xl font-bold text-quiz-dark dark:text-white mb-4">Create a New Quiz</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create custom quizzes for your students by selecting a subject, grade level, and topic.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-4">Choose a Subject and Topic</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="quiz-card p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105">
                        <h4 className="font-bold text-quiz-dark dark:text-gray-200 mb-2">{subject.name}</h4>
                        <ul className="text-sm space-y-1">
                          {subject.topics.map((topic) => (
                            <li key={topic.id} className="flex justify-between">
                              <span className="dark:text-gray-300">{topic.name}</span>
                              <span className="text-xs bg-quiz-light dark:bg-indigo-900 px-1 rounded text-quiz-secondary dark:text-indigo-300">
                                {topic.quizCount} quizzes
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <Button className="quiz-btn-primary">
                    Create Custom Quiz
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="game-history">
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
