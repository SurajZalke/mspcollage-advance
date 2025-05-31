import React, { useState } from "react";
import { ref as dbRef, push as dbPush, set as dbSet } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { scienceSubjects } from "@/utils/gameUtils";
import { Plus, Minus } from "lucide-react";
import { db } from "@/lib/firebaseConfig";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: QuizOption[];
  correctOption: string;
  timeLimit: number;
  points: number;
}

const CreateQuizForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([{
    id: `q_${Date.now()}`,
    text: "",
    options: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" }
    ],
    correctOption: "a",
    timeLimit: 30,
    points: 100
  }]);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: `q_${Date.now()}`,
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" }
      ],
      correctOption: "a",
      timeLimit: 30,
      points: 100
    }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionId: string, value: string) => {
    const newQuestions = [...questions];
    const optionIndex = newQuestions[questionIndex].options.findIndex(opt => opt.id === optionId);
    if (optionIndex !== -1) {
      newQuestions[questionIndex].options[optionIndex].text = value;
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser?.uid) {
      setIsSubmitting(false);
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a quiz.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title || !subject || !grade || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill out all quiz details",
        variant: "destructive"
      });
      return;
    }
    
    for (const question of questions) {
      if (!question.text) {
        toast({
          title: "Incomplete Question",
          description: "All questions must have text",
          variant: "destructive"
        });
        return;
      }
      
      for (const option of question.options) {
        if (!option.text) {
          toast({
            title: "Incomplete Options",
            description: `Please fill all options for question "${question.text.substring(0, 20)}..."`,
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const quizzesRef = dbRef(db, 'quizzes');
      const newQuizRef = dbPush(quizzesRef);
      
      const newQuiz = {
        id: newQuizRef.key,
        title,
        description,
        subject,
        grade,
        topic: "", // Optional field
        questions,
        createdBy: currentUser?.uid || "",
        createdAt: new Date().toISOString(),
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        hasNegativeMarking: false, // Optional field
        negativeMarkingValue: 0 // Optional field
      };

      const quizRef = dbRef(db, `quizzes/${newQuizRef.key}`);
      await dbSet(quizRef, newQuiz);

      toast({
        title: "Success",
        description: "Quiz created successfully!",
        variant: "default"
      });

      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold dark:text-white">Create New Quiz</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz Title"
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  {scienceSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Grade Level</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium dark:text-gray-200 mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for your quiz"
              className="dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium dark:text-white">Questions</h3>
            <Button 
              type="button" 
              onClick={handleAddQuestion}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Button>
          </div>
          
          {questions.map((question, qIndex) => (
            <div key={question.id} className="mb-8 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium dark:text-white">Question {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="h-8 px-2 text-xs"
                  >
                    <Minus className="h-3 w-3 mr-1" /> Remove
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Input
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                    placeholder="Question text"
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center">
                        {option.id.toUpperCase()}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(qIndex, option.id, e.target.value)}
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm dark:text-gray-300 mb-1">Correct Option</label>
                    <Select 
                      value={question.correctOption} 
                      onValueChange={(value) => handleQuestionChange(qIndex, 'correctOption', value)}
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800">
                        {question.options.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            Option {opt.id.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm dark:text-gray-300 mb-1">Time Limit (seconds)</label>
                    <Input
                      type="number"
                      min={5}
                      max={300}
                      value={question.timeLimit}
                      onChange={(e) => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value) || 30)}
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm dark:text-gray-300 mb-1">Points</label>
                    <Input
                      type="number"
                      min={10}
                      max={1000}
                      step={10}
                      value={question.points}
                      onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 100)}
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateQuizForm;
function ref(db: any, arg1: string) {
  throw new Error("Function not implemented.");
}

function push(quizzesRef: any) {
  throw new Error("Function not implemented.");
}

