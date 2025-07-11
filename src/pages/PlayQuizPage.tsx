
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import { Quiz } from '@/types';
import QuestionDisplay from '@/components/QuestionDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { avatars } from '@/utils/avatars';
import { app } from '@/lib/firebaseConfig';
import { saveSharedUrlGameHistory } from '@/utils/gameHistoryUtils';

const PlayQuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch quiz from Realtime Database
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) {
        toast({
          title: 'Error',
          description: 'Quiz ID not found in URL.',
          variant: 'destructive',
        });
        setNotFound(true);
        return;
      }
      try {
        const db = getDatabase();
        const quizRef = ref(db, `quizzes/${id}`);
        const snapshot = await get(quizRef);

        if (snapshot.exists()) {
          setQuiz({ id, ...snapshot.val() } as Quiz);
          setAnswers(new Array(snapshot.val().questions.length).fill(''));
          setNotFound(false);
        } else {
          setNotFound(true);
          toast({
            title: 'Quiz Not Found',
            description: 'The quiz you are looking for does not exist.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        setNotFound(true);
        toast({
          title: 'Error',
          description: 'Failed to load quiz. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchQuiz();
  }, [id, toast]);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`quiz_player_id_${id}`);
    const storedNickname = localStorage.getItem(`quiz_nickname_${id}`);
    const storedAvatar = localStorage.getItem(`quiz_avatar_${id}`);

    if (storedPlayerId && storedNickname && storedAvatar) {
      setPlayerId(storedPlayerId);
      setNickname(storedNickname);
      setSelectedAvatar(storedAvatar);
      setPlayerReady(true);
    }
  }, [id]);

  const handlePlayerSetup = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a nickname.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedAvatar) {
      toast({
        title: 'Error',
        description: 'Please select an avatar.',
        variant: 'destructive',
      });
      return;
    }

    const result = await saveSharedUrlGameHistory(id!, quiz!.title, quiz!.createdBy, nickname, selectedAvatar, 0);

    if (result.success) {
      setPlayerId(result.playerId!);
      setPlayerReady(true);
      toast({
        title: 'Success',
        description: 'Player setup complete! Starting quiz...',
      });
    } else {
      console.error('Error saving player data:', result.error);
      toast({
        title: 'Error',
        description: 'Failed to save player data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Timer effect
  useEffect(() => {
    if (!quiz || !quiz.questions[currentQuestionIndex] || hasAnswered) {
      setTimeLeft(0);
      return;
    }

    const questionTimeLimit = quiz.questions[currentQuestionIndex].timeLimit || 30;
    setTimeLeft(questionTimeLimit);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setHasAnswered(true);
        }
        return prevTime > 0 ? prevTime - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, currentQuestionIndex, hasAnswered]);

  // Handle answer selection
  function handleAnswerSelect(questionId: string, optionId: string) {
    setSelectedAnswer(optionId);
    setHasAnswered(true);

    setAnswers((prev) => {
      const newAnswers = Array(quiz!.questions.length).fill('');
      prev.forEach((answer, index) => {
        if (answer !== undefined && answer !== null) {
          newAnswers[index] = answer;
        }
      });
      newAnswers[currentQuestionIndex] = optionId;
      return newAnswers;
    });

    // Scoring: check if correct
    const currentQ = quiz?.questions[currentQuestionIndex];
    if (currentQ && optionId === currentQ.correctOption) {
      setScore((prev) => prev + (currentQ.Marks || 1));
    }
  }

  // Go to next question or finish
  function handleNextQuestion() {
    setHasAnswered(false);
    setSelectedAnswer(null);
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (quiz) {
      setQuizCompleted(true);
    }
  }

  // Update player score in database when quiz is completed
  useEffect(() => {
    const updatePlayerScore = async () => {
      if (quizCompleted && playerId && id) {
        try {
          const filteredAnswers = answers.filter((answer): answer is string => answer !== undefined && answer !== null);
          const result = await saveSharedUrlGameHistory(id!, quiz!.title, quiz!.createdBy, nickname, selectedAvatar!, score, filteredAnswers);
          toast({
            title: 'Quiz Completed',
            description: 'Your score has been saved!',
          });
        } catch (error) {
          console.error('Error updating player score:', error);
          toast({
            title: 'Error',
            description: 'Failed to save your score. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };
    updatePlayerScore();
  }, [quizCompleted, playerId, id, score, toast]);

  if (notFound) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4 transition-all duration-300 animate-fadeIn">
        <div className="mb-6 flex flex-col items-center">
          <img src="/msplogo.jpg" alt="MSP Collage Logo" className="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-white/50" />
          <h2 className="font-bold text-xl mt-3 text-white drop-shadow-md tracking-wide">MSP Collage Manora</h2>
        </div>
        <Card className="w-full max-w-md rounded-xl shadow-2xl border border-purple-300/20 overflow-hidden transform transition-all backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
            <CardTitle className="text-center text-2xl font-bold tracking-tight">Quiz Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">The quiz you are looking for does not exist or is no longer available.</p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-full transition-all transform hover:scale-105 shadow-md"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4 transition-all duration-300 animate-fadeIn">
        <div className="mb-6 flex flex-col items-center animate-bounce-slow">
          <img src="/msplogo.jpg" alt="MSP Collage Logo" className="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-white/50" />
          <h2 className="font-bold text-xl mt-3 text-white drop-shadow-md tracking-wide">MSP Collage Manora</h2>
        </div>
        <div className="text-white text-xl font-medium animate-pulse">Loading Quiz...</div>
      </div>
    );
  }

  if (!playerReady) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4 transition-all duration-300 animate-fadeIn">
        <div className="mb-6 flex flex-col items-center">
          <img src="/msplogo.jpg" alt="MSP Collage Logo" className="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-white/50" />
          <h2 className="font-bold text-xl mt-3 text-white drop-shadow-md tracking-wide">MSP Collage Manora</h2>
        </div>
        <Card className="w-full max-w-md rounded-xl shadow-2xl border border-purple-300/20 overflow-hidden transform transition-all backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
            <CardTitle className="text-center text-2xl font-bold tracking-tight">Enter Your Details</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-8">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {avatars.map((avatar, index) => (
                <div
                  key={index}
                  className={`cursor-pointer p-2 rounded-full ${selectedAvatar === avatar ? 'border-4 border-purple-500' : 'border-2 border-transparent'}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <Avatar className="w-16 h-16 mx-auto">
                    <img src={avatar} alt={`Avatar ${index + 1}`} className="rounded-full" />
                  </Avatar>
                </div>
              ))}
            </div>
            <Button
              onClick={handlePlayerSetup}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-full transition-all transform hover:scale-105 shadow-md"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4 transition-all duration-300 animate-fadeIn">
        <div className="mb-6 flex flex-col items-center">
          <img src="/msplogo.jpg" alt="MSP Collage Logo" className="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-white/50" />
          <h2 className="font-bold text-xl mt-3 text-white drop-shadow-md tracking-wide">MSP Collage Manora</h2>
        </div>
        <Card className="w-full max-w-md rounded-xl shadow-2xl border border-purple-300/20 overflow-hidden transform transition-all hover:scale-[1.01] backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
            <CardTitle className="text-center text-2xl font-bold tracking-tight">Quiz Completed! 🎉</CardTitle>
          {nickname && selectedAvatar && (
            <div className="flex items-center justify-center mt-2">
              <Avatar className="w-8 h-8 mr-2">
                <img src={selectedAvatar} alt="Player Avatar" className="rounded-full" />
              </Avatar>
              <p className="text-sm font-semibold text-white">{nickname}</p>
            </div>
          )}
          </CardHeader>
          <CardContent className="text-center p-8">
            <div className="text-3xl font-bold mb-2 mt-4">Your Score</div>
            <div className="text-5xl font-bold mb-6 text-purple-700">{score} <span className="text-2xl text-gray-500">/ {quiz.questions.reduce((sum, q) => sum + (q.Marks || 1), 0)}</span></div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-full transition-all transform hover:scale-105 shadow-md">Play Again</Button>
              <Button onClick={() => window.location.href = "/"} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-full transition-all transform hover:scale-105 shadow-md">Go Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4 transition-all duration-300 animate-fadeIn">

      <Card className="w-full max-w-2xl rounded-xl shadow-2xl border border-purple-300/20 overflow-hidden transform transition-all hover:scale-[1.01] backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 relative">
        <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
          <CardTitle className="text-2xl font-bold tracking-tight">{quiz.title}</CardTitle>
          <p className="text-sm text-white/80 font-medium">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </CardHeader>
        <CardContent>
          <QuestionDisplay
            question={currentQuestion}
            onAnswer={handleAnswerSelect}
            showCorrectAnswer={hasAnswered}
            selectedAnswer={selectedAnswer}
            timeLeft={timeLeft}
            disableOptions={hasAnswered}
          />
          <div className="flex justify-start mt-4 w-full">
            <Button
              onClick={handleNextQuestion}
              disabled={!hasAnswered}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? '🏁 Finish Quiz' : '👉 Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default PlayQuizPage;



