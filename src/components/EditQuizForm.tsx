import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebaseConfig';
import { ref, get, update } from 'firebase/database';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { scienceSubjects, gameUtils } from '../utils/gameUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PlusCircle, MinusCircle, Save, XCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionImage?: string;
  options: QuizOption[];
  correctOptionId: string;
  timeLimit: number;
  marks: number;
  negativeMarking: boolean;
}

interface QuizData {
  title: string;
  description: string;
  subject: string;
  topic: string;
  grade: string;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: any; // Firebase Timestamp
}

const DEFAULT_OPTIONS = [
  { id: 'a', text: 'A' },
  { id: 'b', text: 'B' },
  { id: 'c', text: 'C' },
  { id: 'd', text: 'D' },
];

const EditQuizForm: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizGrade, setQuizGrade] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    let mounted = true;

    if (authLoading) {
      setLoading(true);
      return;
    }

    const fetchQuizData = async () => {
      if (!quizId) {
        setError('Quiz ID is missing.');
        setLoading(false);
        return;
      }

      try {
        let quizSnapshot = null;
        if (currentUser?.uid) {
          const userQuizRef = ref(db, `users/${currentUser.uid}/quizzes/${quizId}`);
          quizSnapshot = await get(userQuizRef);
        }
        if (!quizSnapshot?.exists()) {
          const globalQuizRef = ref(db, `quizzes/${quizId}`);
          quizSnapshot = await get(globalQuizRef);
        }
        if (!mounted) return;

        if (quizSnapshot.exists()) {
          const data = quizSnapshot.val() as QuizData;
          setQuizTitle(data.title || '');
          setQuizDescription(data.description || '');
          setQuizSubject(data.subject || '');
          setQuizTopic(data.topic || '');
          setQuizGrade(
            gameUtils.gradeLevels.includes(data.grade) ? data.grade : ''
          );
          // Ensure questions are well-formed
          setQuestions(
            (data.questions || []).map((q, idx) => ({
              id: q.id || `q${idx + 1}`,
              questionText: q.questionText || '',
              questionImage: q.questionImage || '',
              options:
                Array.isArray(q.options) && q.options.length > 0
                  ? q.options.map((opt, oidx) => ({
                      id: opt.id || String.fromCharCode(97 + oidx),
                      text: opt.text || '',
                    }))
                  : DEFAULT_OPTIONS,
              correctOptionId:
                q.correctOptionId ||
                (q.options && q.options[0] && q.options[0].id) ||
                'a',
              timeLimit: typeof q.timeLimit === 'number' ? q.timeLimit : 30,
              marks: typeof q.marks === 'number' ? q.marks : 10,
              negativeMarking: !!q.negativeMarking,
            }))
          );
        } else {
          setError('Quiz not found.');
        }
      } catch (err) {
        setError('Failed to fetch quiz data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchQuizData();
    }

    return () => {
      mounted = false;
    };
  }, [quizId, currentUser, authLoading]);

  const handleQuestionChange = useCallback(
    (index: number, field: keyof QuizQuestion, value: any) => {
      setQuestions((prevQuestions) => {
        const newQuestions = [...prevQuestions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        return newQuestions;
      });
    },
    []
  );

  const handleOptionChange = useCallback(
    (qIndex: number, oIndex: number, value: string) => {
      setQuestions((prevQuestions) => {
        const newQuestions = [...prevQuestions];
        const options = [...newQuestions[qIndex].options];
        options[oIndex] = { ...options[oIndex], text: value };
        newQuestions[qIndex].options = options;
        return newQuestions;
      });
    },
    []
  );

  const addQuestion = useCallback(() => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        id: `q${prevQuestions.length + 1}`,
        questionText: '',
        options: DEFAULT_OPTIONS.map((opt) => ({ ...opt })),
        correctOptionId: 'a',
        timeLimit: 30,
        marks: 10,
        negativeMarking: false,
      },
    ]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  }, []);

  const addOption = useCallback((qIndex: number) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      const nextId = String.fromCharCode(
        97 + newQuestions[qIndex].options.length
      ); // 'a', 'b', ...
      newQuestions[qIndex].options = [
        ...newQuestions[qIndex].options,
        { id: nextId, text: '' },
      ];
      return newQuestions;
    });
  }, []);

  const removeOption = useCallback((qIndex: number, oIndex: number) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter(
        (_, i) => i !== oIndex
      );
      // Fix correctOptionId if needed
      if (
        !newQuestions[qIndex].options.some(
          (opt) => opt.id === newQuestions[qIndex].correctOptionId
        )
      ) {
        newQuestions[qIndex].correctOptionId =
          newQuestions[qIndex].options[0]?.id || '';
      }
      return newQuestions;
    });
  }, []);

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !quizId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to edit a quiz.',
        variant: 'destructive',
      });
      return;
    }

    if (
      !quizTitle ||
      !quizDescription ||
      !quizSubject ||
      !quizTopic ||
      !quizGrade ||
      questions.length === 0
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all quiz details and add at least one question.',
        variant: 'destructive',
      });
      return;
    }

    for (const q of questions) {
      if (
        !q.questionText ||
        q.options.some((opt) => !opt.text) ||
        !q.correctOptionId
      ) {
        toast({
          title: 'Error',
          description:
            'Please ensure all questions have text, options, and a correct answer selected.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        subject: quizSubject,
        topic: quizTopic,
        grade: quizGrade,
        questions: questions,
        updatedAt: new Date().toISOString(),
      };

      // Update both user and global quiz locations
      const userQuizRef = ref(db, `users/${currentUser.uid}/quizzes/${quizId}`);
      const globalQuizRef = ref(db, `quizzes/${quizId}`);

      await update(userQuizRef, quizData);
      await update(globalQuizRef, quizData);

      toast({
        title: 'Success',
        description: 'Quiz updated successfully!',
      });
      navigate('/host-dashboard');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading quiz...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Quiz</h1>
      <form onSubmit={handleSaveQuiz} className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quizTitle" className="text-white">
                Quiz Title
              </Label>
              <Input
                id="quizTitle"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="quizDescription" className="text-white">
                Description
              </Label>
              <Textarea
                id="quizDescription"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Enter quiz description"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="quizSubject" className="text-white">
                Subject
              </Label>
              <Select value={quizSubject} onValueChange={setQuizSubject}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {scienceSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quizTopic" className="text-white">
                Topic
              </Label>
              <Input
                id="quizTopic"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Newtonian Physics"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="quizGrade" className="text-white">
                Grade Level
              </Label>
              <Select value={quizGrade} onValueChange={setQuizGrade}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {gameUtils.gradeLevels.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-center">Questions</h2>
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">
                  Question {qIndex + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <MinusCircle className="mr-2 h-4 w-4" /> Remove Question
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor={`questionText-${qIndex}`}
                    className="text-white"
                  >
                    Question Text
                  </Label>
                  <Textarea
                    id={`questionText-${qIndex}`}
                    value={question.questionText}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, 'questionText', e.target.value)
                    }
                    placeholder="Enter question text"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {question.questionText && (
                    <div className="mt-2 p-2 bg-gray-700 rounded-md">
                      <h4 className="text-sm font-semibold text-gray-300">
                        Preview:
                      </h4>
                      <div className="text-white text-lg">
                        {question.questionText}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor={`questionImage-${qIndex}`}
                    className="text-white"
                  >
                    Question Image URL (Optional)
                  </Label>
                  <Input
                    id={`questionImage-${qIndex}`}
                    value={question.questionImage || ''}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        'questionImage',
                        e.target.value
                      )
                    }
                    placeholder="Enter image URL"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {question.questionImage && (
                    <img
                      src={question.questionImage}
                      alt="Question Preview"
                      className="mt-2 max-h-48 object-contain"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Options</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(qIndex, oIndex, e.target.value)
                        }
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        className="bg-gray-700 border-gray-600 text-white flex-grow"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-500 border-red-500 hover:bg-red-900 hover:text-white"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    className="text-green-500 border-green-500 hover:bg-green-900 hover:text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
                <div>
                  <Label
                    htmlFor={`correctOption-${qIndex}`}
                    className="text-white"
                  >
                    Correct Option
                  </Label>
                  <Select
                    value={question.correctOptionId}
                    onValueChange={(value) =>
                      handleQuestionChange(qIndex, 'correctOptionId', value)
                    }
                  >
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white">
                      {question.options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {`Option ${option.id.toUpperCase()}: ${option.text}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor={`timeLimit-${qIndex}`}
                      className="text-white"
                    >
                      Time Limit (seconds)
                    </Label>
                    <Input
                      id={`timeLimit-${qIndex}`}
                      type="number"
                      value={question.timeLimit}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          'timeLimit',
                          parseInt(e.target.value)
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`marks-${qIndex}`} className="text-white">
                      Marks
                    </Label>
                    <Input
                      id={`marks-${qIndex}`}
                      type="number"
                      value={question.marks}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          'marks',
                          parseInt(e.target.value)
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`negativeMarking-${qIndex}`}
                      type="checkbox"
                      checked={question.negativeMarking}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          'negativeMarking',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={`negativeMarking-${qIndex}`}
                      className="text-white"
                    >
                      Negative Marking
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          onClick={addQuestion}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Question
        </Button>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={loading}
        >
          <Save className="mr-2 h-5 w-5" /> {loading ? 'Saving...' : 'Save Quiz'}
        </Button>
        <button
          type="button"
          onClick={() => navigate('/host-dashboard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Return to dashboard
        </button>
      </form>
    </div>
  );
};

export default EditQuizForm;