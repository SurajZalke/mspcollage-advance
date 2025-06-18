import React, { useState, useRef } from "react";
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
import { Plus, Minus, Smile } from "lucide-react";
import { db } from "@/lib/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { byRadius } from '@cloudinary/url-gen/actions/roundCorners';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

import { MATH_SYMBOLS, CHEMISTRY_SYMBOLS, PHYSICS_SYMBOLS, BIOLOGY_SYMBOLS, COMMON_FORMULAS, CONSTANTS, ADVANCED_MATH, ADVANCED_PHYSICS, ADVANCED_CHEMISTRY, ADVANCED_BIOLOGY, CONSTANT_SYMBOLS } from '@/utils/constants';

const SymbolPicker = ({ onSelect }: { onSelect: (symbol: string) => void }) => {
  const [activeTab, setActiveTab] = useState('constant');

  const tabs = [
    { id: 'constant', label: 'Basic Symbols', symbols: CONSTANT_SYMBOLS },
    { id: 'constants', label: 'Constants', symbols: CONSTANTS },
    { id: 'advanced_math', label: 'Advanced Math', symbols: ADVANCED_MATH },
    { id: 'advanced_physics', label: 'Advanced Physics', symbols: ADVANCED_PHYSICS },
    { id: 'advanced_chemistry', label: 'Advanced Chemistry', symbols: ADVANCED_CHEMISTRY },
    { id: 'advanced_biology', label: 'Advanced Biology', symbols: ADVANCED_BIOLOGY },
    { id: 'math', label: 'Basic Math', symbols: MATH_SYMBOLS },
    { id: 'chemistry', label: 'Basic Chemistry', symbols: CHEMISTRY_SYMBOLS },
    { id: 'physics', label: 'Basic Physics', symbols: PHYSICS_SYMBOLS },
    { id: 'biology', label: 'Basic Biology', symbols: BIOLOGY_SYMBOLS },
    { id: 'formulas', label: 'Common Formulas', symbols: COMMON_FORMULAS },
  ];

  return (
    <div className="p-4 max-h-[400px] overflow-y-auto">
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1 text-sm whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tabs.find(tab => tab.id === activeTab)?.symbols.map((item) => (
          <Button
            key={item.symbol}
            variant="outline"
            onClick={() => onSelect(item.symbol)}
            className="p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col items-center justify-center gap-1"
            title={item.name}
          >
            <span className="text-lg">{item.symbol}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
              {item.name}
            </span>
            {('unit' in item) && (
              <span className="text-xs text-blue-500 dark:text-blue-400">
                {String(item.unit)}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  imageFile?: File | null;
  publicId?: string; // Add publicId for Cloudinary
  options: QuizOption[];
  correctOption: string;
  timeLimit: number;
  Marks: number;
}


const CreateQuizForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

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
    Marks: 4
  }]);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(false);
  const [negativeMarkingValue, setNegativeMarkingValue] = useState(25);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInputRef, setActiveInputRef] = useState<HTMLInputElement | null>(null);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setActiveInputRef(e.target);
  };

  const insertTextAtCursor = (text: string) => {
    if (activeInputRef) {
      const start = activeInputRef.selectionStart || 0;
      const end = activeInputRef.selectionEnd || 0;
      const currentValue = activeInputRef.value;
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
      
      // Update the input value
      activeInputRef.value = newValue;
      
      // Update cursor position
      const newCursorPos = start + text.length;
      activeInputRef.setSelectionRange(newCursorPos, newCursorPos);
      
      // Find the question and option being edited
      let questionIndex = -1;
      let optionIndex = -1;

      for (let i = 0; i < questions.length; i++) {
        if (activeInputRef.id === `question_${questions[i].id}`) {
          questionIndex = i;
          break;
        }
        for (let j = 0; j < questions[i].options.length; j++) {
          if (activeInputRef.id === `option_${questions[i].id}_${questions[i].options[j].id}`) {
            questionIndex = i;
            optionIndex = j;
            break;
          }
        }
        if (questionIndex !== -1) break;
      }

      if (questionIndex !== -1) {
        const newQuestions = [...questions];
        const question = newQuestions[questionIndex];
  
        if (optionIndex !== -1) {
          // Update option text
          const updatedOptions = [...question.options];
          updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], text: newValue };
          newQuestions[questionIndex] = { ...question, options: updatedOptions };
        } else {
          // Update question text
          newQuestions[questionIndex] = { ...question, text: newValue };
        }
  
        setQuestions(newQuestions);
      }

      // Trigger a re-render
      activeInputRef.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

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
      Marks: 4
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

  // Placeholder for a new API upload function
  const uploadToNewApi = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET1);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME1}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.public_id) {
      return { url: data.secure_url, id: data.public_id };
    } else {
      throw new Error(`Fallback Cloudinary upload failed: ${data.error ? data.error.message : 'Unknown error'}`);
    }
  };

  const handleImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newQuestions = [...questions];

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Use environment variable

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.public_id) {
          newQuestions[index] = { ...newQuestions[index], imageFile: file, imageUrl: data.secure_url, publicId: data.public_id };
          setQuestions(newQuestions);
          toast({
            title: "Image Uploaded",
            description: "Image successfully uploaded to Cloudinary.",
          });
        } else {
          console.error("Cloudinary upload response data:", data);
          throw new Error(`Cloudinary upload failed: ${data.error ? data.error.message : 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        toast({
          title: "Image Upload Failed",
          description: `There was an error uploading your image: ${error instanceof Error ? error.message : String(error)}. Attempting fallback upload.`, 
          variant: "destructive",
        });

        // Fallback to a new API if Cloudinary upload fails
        try {
          // Placeholder for new API upload logic
          // You would replace this with actual API call, e.g., to your own backend or another service
          console.log("Attempting fallback upload for image:", file.name);
          const fallbackUploadResult = await uploadToNewApi(file);
          newQuestions[index] = { 
            ...newQuestions[index], 
            imageFile: file, 
            imageUrl: fallbackUploadResult.url, // Assuming the new API returns a URL
            publicId: fallbackUploadResult.id // Assuming the new API returns an ID
          };
          toast({
            title: "Fallback Upload Success",
            description: "Image uploaded successfully via fallback API.",
            variant: "default",
          });

        } catch (fallbackError) {
          console.error("Error during fallback image upload:", fallbackError);
          toast({
            title: "Fallback Upload Failed",
            description: `Failed to upload image via fallback: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}.`, 
            variant: "destructive",
          });
          newQuestions[index] = { ...newQuestions[index], imageFile: null, imageUrl: undefined, publicId: undefined };
        }
        setQuestions(newQuestions);
      }
    }
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
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a quiz.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!title || !subject || !grade || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill out all quiz details",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    for (const question of questions) {
      if (!question.text) {
        toast({
          title: "Incomplete Question",
          description: "All questions must have text",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      for (const option of question.options) {
        if (!option.text) {
          toast({
            title: "Incomplete Options",
            description: `Please fill all options for question "${question.text.substring(0, 20)}..."`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
    }
    
    try {
      const quizzesRef = dbRef(db, 'quizzes');
      const newQuizRef = dbPush(quizzesRef);
      
      const newQuiz = {
        id: newQuizRef.key,
        title,
        description,
        subject,
        grade,
        topic,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          imageUrl: q.imageUrl || null,
          publicId: q.publicId || null, // Include publicId
          options: q.options,
          correctOption: q.correctOption,
          timeLimit: q.timeLimit,
          Marks: q.Marks,
        })),
        createdBy: currentUser?.uid || "",
        createdAt: new Date().toISOString(),
        totalQuestions: questions.length,
        totalMarks: questions.length * 4,
        hasNegativeMarking: hasNegativeMarking, 
        negativeMarkingValue: hasNegativeMarking ? negativeMarkingValue : 0
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
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quiz Description" 
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {scienceSubjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div> {/* Add a div for the new input to maintain grid layout */}
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Topic</label>
              <Input
                placeholder="e.g., 'Thermodynamics', 'Genetics'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-1">Grade Level</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {['11th', '12th'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <label htmlFor="negative-marking" className="text-sm font-medium dark:text-gray-200">Enable Negative Marking</label>
            <Switch
              id="negative-marking"
              checked={hasNegativeMarking}
              onCheckedChange={setHasNegativeMarking}
            />
          </div>

        </div>

        <Button
          type="button"
          onClick={handleAddQuestion}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Question
        </Button>

        {questions.map((question, qIndex) => (
          <div key={question.id} className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium dark:text-white">Question {qIndex + 1}</h3>
              <div className="flex space-x-2">
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveQuestion(qIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddQuestion()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  id={`question_${question.id}`}
                  value={question.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Enter question text"
                  className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <SymbolPicker onSelect={insertTextAtCursor} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor={`image-upload-${question.id}`} className="block text-sm font-medium dark:text-gray-200">Image (Optional)</label>
                <Input
                  id={`image-upload-${question.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(qIndex, e)}
                  className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                />
                {question.imageUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleQuestionChange(qIndex, 'imageUrl', undefined)}
                  >
                    Remove Image
                  </Button>
                )}
              </div>

              {question.imageUrl ? (
                <div className="mt-2">
                  <img src={question.imageUrl} alt="Question Preview" className="w-48 h-36 object-cover rounded-lg" />
                </div>
              ) : null}

              <div className="space-y-2">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <span className="w-8 text-center">{option.id.toUpperCase()}</span>
                    <Input
                      id={`option_${question.id}_${option.id}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(qIndex, option.id, e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder={`Option ${option.id.toUpperCase()}`}
                      className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <SymbolPicker onSelect={insertTextAtCursor} />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 mb-1">Correct Option</label>
                  <Select
                    value={question.correctOption}
                    onValueChange={(value) => handleQuestionChange(qIndex, 'correctOption', value)}
                  >
                    <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          Option {option.id.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 mb-1">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    value={question.timeLimit}
                    onChange={(e) => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value))}
                    className="dark:bg-gray-700 dark:border-gray-600"
                    min="10"
                    max="300"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end space-x-3 mt-6">
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
