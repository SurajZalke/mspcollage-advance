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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Constants for symbols and formulas
const MATH_SYMBOLS = [
  { symbol: '±', name: 'Plus-Minus' },
  { symbol: '×', name: 'Multiplication' },
  { symbol: '÷', name: 'Division' },
  { symbol: '≠', name: 'Not Equal' },
  { symbol: '≈', name: 'Approximately' },
  { symbol: '∞', name: 'Infinity' },
  { symbol: '∑', name: 'Summation' },
  { symbol: '∫', name: 'Integral' },
  { symbol: '√', name: 'Square Root' },
  { symbol: '∏', name: 'Product' },
  { symbol: '∂', name: 'Partial Derivative' },
  { symbol: '∇', name: 'Nabla/Del' },
  { symbol: '∆', name: 'Delta/Change' },
  { symbol: '∈', name: 'Element Of' },
  { symbol: '∉', name: 'Not Element Of' },
  { symbol: '⊂', name: 'Subset Of' },
  { symbol: '⊃', name: 'Superset Of' },
  { symbol: '∪', name: 'Union' },
  { symbol: '∩', name: 'Intersection' },
  { symbol: '∀', name: 'For All' },
  { symbol: '∃', name: 'There Exists' },
  { symbol: '∄', name: 'Does Not Exist' },
  { symbol: '∅', name: 'Empty Set' },
  { symbol: '∝', name: 'Proportional To' },
  { symbol: '∞', name: 'Infinity' },
];

const CHEMISTRY_SYMBOLS = [
  { symbol: 'H₂O', name: 'Water' },
  { symbol: 'CO₂', name: 'Carbon Dioxide' },
  { symbol: 'NaCl', name: 'Sodium Chloride' },
  { symbol: 'H₂SO₄', name: 'Sulfuric Acid' },
  { symbol: 'HCl', name: 'Hydrochloric Acid' },
  { symbol: 'NaOH', name: 'Sodium Hydroxide' },
  { symbol: 'CH₄', name: 'Methane' },
  { symbol: 'C₂H₅OH', name: 'Ethanol' },
  { symbol: 'NH₃', name: 'Ammonia' },
  { symbol: 'O₃', name: 'Ozone' },
  { symbol: 'CaCO₃', name: 'Calcium Carbonate' },
  { symbol: 'Fe₂O₃', name: 'Iron(III) Oxide' },
  { symbol: 'KMnO₄', name: 'Potassium Permanganate' },
  { symbol: 'AgNO₃', name: 'Silver Nitrate' },
  { symbol: '→', name: 'Reaction Arrow' },
  { symbol: '⇌', name: 'Equilibrium' },
  { symbol: 'Δ', name: 'Heat' },
  { symbol: '↑', name: 'Gas Evolution' },
  { symbol: '↓', name: 'Precipitation' },
  { symbol: '⇅', name: 'Resonance' },
];

const PHYSICS_SYMBOLS = [
  { symbol: 'λ', name: 'Wavelength' },
  { symbol: 'μ', name: 'Micro' },
  { symbol: 'Ω', name: 'Ohm' },
  { symbol: 'π', name: 'Pi' },
  { symbol: 'θ', name: 'Theta' },
  { symbol: 'ρ', name: 'Density' },
  { symbol: 'σ', name: 'Sigma' },
  { symbol: 'τ', name: 'Tau' },
  { symbol: 'φ', name: 'Phi' },
  { symbol: 'ν', name: 'Frequency' },
  { symbol: 'α', name: 'Alpha' },
  { symbol: 'β', name: 'Beta' },
  { symbol: 'γ', name: 'Gamma' },
  { symbol: 'ε₀', name: 'Permittivity of Free Space' },
  { symbol: 'μ₀', name: 'Permeability of Free Space' },
  { symbol: '∆x', name: 'Displacement' },
  { symbol: '∆v', name: 'Change in Velocity' },
  { symbol: '∆t', name: 'Time Interval' },
  { symbol: '∆E', name: 'Change in Energy' },
  { symbol: '∆P', name: 'Change in Momentum' },
];

const BIOLOGY_SYMBOLS = [
  { symbol: '♂', name: 'Male' },
  { symbol: '♀', name: 'Female' },
  { symbol: '→', name: 'Leads to' },
  { symbol: '⇌', name: 'Reversible Process' },
  { symbol: 'ATP', name: 'Adenosine Triphosphate' },
  { symbol: 'DNA', name: 'Deoxyribonucleic Acid' },
  { symbol: 'RNA', name: 'Ribonucleic Acid' },
  { symbol: 'ADP', name: 'Adenosine Diphosphate' },
  { symbol: 'NADH', name: 'Nicotinamide Adenine Dinucleotide' },
  { symbol: 'CO₂', name: 'Carbon Dioxide' },
  { symbol: 'O₂', name: 'Oxygen' },
  { symbol: 'H₂O', name: 'Water' },
  { symbol: 'C₆H₁₂O₆', name: 'Glucose' },
  { symbol: 'pH', name: 'pH Scale' },
  { symbol: '∆G', name: 'Change in Gibbs Free Energy' },
];

const COMMON_FORMULAS = [
  { symbol: 'E=mc²', name: 'Mass-Energy Equivalence' },
  { symbol: 'F=ma', name: 'Newton\'s Second Law' },
  { symbol: 'PV=nRT', name: 'Ideal Gas Law' },
  { symbol: 'c=λν', name: 'Wave Speed' },
  { symbol: 'E=hν', name: 'Photon Energy' },
  { symbol: 'ΔG=ΔH-TΔS', name: 'Gibbs Free Energy' },
  { symbol: 'pH=-log[H⁺]', name: 'pH Definition' },
  { symbol: 'F=-kx', name: 'Hooke\'s Law' },
  { symbol: 'v=u+at', name: 'First Equation of Motion' },
  { symbol: 's=ut+½at²', name: 'Second Equation of Motion' },
  { symbol: 'v²=u²+2as', name: 'Third Equation of Motion' },
  { symbol: 'T=2π√(l/g)', name: 'Period of Simple Pendulum' },
  { symbol: 'V=IR', name: 'Ohm\'s Law' },
  { symbol: 'P=VI', name: 'Electric Power' },
  { symbol: 'F=GMm/r²', name: 'Gravitational Force' },
];

const CONSTANTS = [
  { symbol: 'c = 3×10⁸ m/s', name: 'Speed of Light', unit: 'm/s' },
  { symbol: 'h = 6.626×10⁻³⁴', name: 'Planck Constant', unit: 'J·s' },
  { symbol: 'G = 6.674×10⁻¹¹', name: 'Gravitational Constant', unit: 'N·m²/kg²' },
  { symbol: 'NA = 6.022×10²³', name: 'Avogadro Number', unit: 'mol⁻¹' },
  { symbol: 'R = 8.314', name: 'Gas Constant', unit: 'J/(mol·K)' },
  { symbol: 'k = 1.381×10⁻²³', name: 'Boltzmann Constant', unit: 'J/K' },
  { symbol: 'e = 1.602×10⁻¹⁹', name: 'Elementary Charge', unit: 'C' },
  { symbol: 'me = 9.109×10⁻³¹', name: 'Electron Mass', unit: 'kg' },
  { symbol: 'mp = 1.672×10⁻²⁷', name: 'Proton Mass', unit: 'kg' },
  { symbol: 'ε₀ = 8.854×10⁻¹²', name: 'Vacuum Permittivity', unit: 'F/m' },
  { symbol: 'μ₀ = 4π×10⁻⁷', name: 'Vacuum Permeability', unit: 'H/m' },
  { symbol: 'g = 9.81', name: 'Acceleration due to Gravity', unit: 'm/s²' },
];

const ADVANCED_MATH = [
  { symbol: '∮', name: 'Line Integral' },
  { symbol: '∯', name: 'Surface Integral' },
  { symbol: '∰', name: 'Volume Integral' },
  { symbol: '∇²', name: 'Laplacian' },
  { symbol: '∑∞ᵢ₌₁', name: 'Infinite Sum' },
  { symbol: '∏∞ᵢ₌₁', name: 'Infinite Product' },
  { symbol: 'lim x→∞', name: 'Limit to Infinity' },
  { symbol: '∫∞₀', name: 'Infinite Integral' },
  { symbol: '⟨x|ψ⟩', name: 'Bra-ket Notation' },
];

const ADVANCED_PHYSICS = [
  { symbol: 'ψ(x,t)', name: 'Wave Function' },
  { symbol: 'Ĥψ = Eψ', name: 'Schrödinger Equation' },
  { symbol: 'E = ℏω', name: 'Photon Energy' },
  { symbol: 'p = ℏk', name: 'De Broglie Relation' },
  { symbol: 'F = -∇V', name: 'Conservative Force' },
  { symbol: '∇×E = -∂B/∂t', name: 'Faraday\'s Law' },
  { symbol: '∇×B = μ₀J + μ₀ε₀∂E/∂t', name: 'Ampere\'s Law' },
  { symbol: '∇·E = ρ/ε₀', name: 'Gauss\'s Law' },
  { symbol: '∇·B = 0', name: 'Gauss\'s Law for Magnetism' },
  { symbol: 'ds² = gᵢⱼdxᵢdxʲ', name: 'Metric Tensor' },
];

const ADVANCED_CHEMISTRY = [
  { symbol: 'K = [C][D]/[A][B]', name: 'Equilibrium Constant' },
  { symbol: 'pH = -log[H⁺]', name: 'pH Definition' },
  { symbol: 'E = E° - (RT/nF)lnQ', name: 'Nernst Equation' },
  { symbol: 'ΔG° = -RTlnK', name: 'Standard Free Energy Change' },
  { symbol: 'k = Ae⁻ᴱᵃ/ᴿᵀ', name: 'Arrhenius Equation' },
  { symbol: 'PV = nRT', name: 'Ideal Gas Law' },
  { symbol: 'μ = -RTlna', name: 'Chemical Potential' },
  { symbol: 'dG = VdP - SdT', name: 'Gibbs Free Energy Differential' },
  { symbol: 'ΔH = ΔU + ΔnRT', name: 'Enthalpy Change' },
  { symbol: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', name: 'Glucose Oxidation' },
];

const ADVANCED_BIOLOGY = [
  { symbol: 'dN/dt = rN(1-N/K)', name: 'Logistic Growth' },
  { symbol: 'v = Vmax[S]/(Km+[S])', name: 'Michaelis-Menten Equation' },
  { symbol: 'ΔG = ΔH - TΔS', name: 'Gibbs Free Energy' },
  { symbol: 'P + ADP + Pi → ATP', name: 'ATP Synthesis' },
  { symbol: 'NADH + H⁺ + ½O₂ → NAD⁺ + H₂O', name: 'Electron Transport Chain' },
  { symbol: '2H₂O → O₂ + 4H⁺ + 4e⁻', name: 'Photolysis of Water' },
  { symbol: 'CO₂ + H₂O + energy → CH₂O + O₂', name: 'Photosynthesis' },
  { symbol: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy', name: 'Cellular Respiration' },
];

const CONSTANT_SYMBOLS = [
  { symbol: '²', name: 'Squared' },
  { symbol: '³', name: 'Cubed' },
  { symbol: '⁴', name: 'To the Fourth' },
  { symbol: '₁', name: 'Subscript 1' },
  { symbol: '₂', name: 'Subscript 2' },
  { symbol: '₃', name: 'Subscript 3' },
  { symbol: '₄', name: 'Subscript 4' },
  { symbol: '₅', name: 'Subscript 5' },
  { symbol: '₆', name: 'Subscript 6' },
  { symbol: '₇', name: 'Subscript 7' },
  { symbol: '₈', name: 'Subscript 8' },
  { symbol: '₉', name: 'Subscript 9' },
  { symbol: '₀', name: 'Subscript 0' },
  { symbol: '()', name: 'Parentheses' },
  { symbol: '[]', name: 'Square Brackets' },
  { symbol: '{}', name: 'Curly Brackets' },
  { symbol: '⟨⟩', name: 'Angle Brackets' },
  { symbol: '|', name: 'Vertical Bar' },
  { symbol: '‖', name: 'Double Vertical Bar' },
  { symbol: '⌈⌉', name: 'Ceiling Brackets' },
  { symbol: '⌊⌋', name: 'Floor Brackets' },
  { symbol: '√', name: 'Square Root' },
  { symbol: '∛', name: 'Cube Root' },
  { symbol: '∜', name: 'Fourth Root' },
  { symbol: '∝', name: 'Proportional to' },
  { symbol: '∑', name: 'Summation' },
  { symbol: '∏', name: 'Product' },
  { symbol: '∫', name: 'Integral' },
  { symbol: '∆', name: 'Delta' },
  { symbol: '∇', name: 'Nabla' },
  { symbol: '∂', name: 'Partial Derivative' },
  { symbol: '∂²', name: 'Second Partial Derivative' },
  { symbol: '∂³', name: 'Third Partial Derivative' },
  { symbol: '∂⁴', name: 'Fourth Partial Derivative' },
  { symbol: '∂⁵', name: 'Fifth Partial Derivative' },
  { symbol: '∂⁶', name: 'Sixth Partial Derivative' },
  { symbol: '∂⁷', name: 'Seventh Partial Derivative' },
  { symbol: '∂⁸', name: 'Eighth Partial Derivative' },  
  { symbol: '∂⁹', name: 'Ninth Partial Derivative' },
];

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
  options: QuizOption[];
  correctOption: string;
  timeLimit: number;
  Marks: number;
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
        topic: "",
        questions,
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