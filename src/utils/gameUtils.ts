
// Generate a random game code
export const generateGameCode = (): string => {
  // Create a 6-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate a unique player ID
export const generatePlayerId = (): string => {
  return 'player_' + Math.random().toString(36).substring(2, 9);
};

// Mock function to validate game code
export const isValidGameCode = (code: string): boolean => {
  // In a real app, this would check against active game sessions
  return code.length === 6;
};

// Science stream subjects
export const scienceSubjects = [
  {
    id: "physics",
    name: "Physics",
    topics: [
      { id: "mechanics", name: "Mechanics", quizCount: 12 },
      { id: "electricity", name: "Electricity & Magnetism", quizCount: 10 },
      { id: "optics", name: "Optics", quizCount: 10 },
      { id: "modern_physics", name: "Modern Physics", quizCount: 14 },
      { id: "thermodynamics", name: "Thermodynamics", quizCount: 10 },
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    topics: [
      { id: "organic", name: "Organic Chemistry", quizCount: 15 },
      { id: "inorganic", name: "Inorganic Chemistry", quizCount: 12 },
      { id: "physical", name: "Physical Chemistry", quizCount: 11 },
      { id: "analytical", name: "Analytical Chemistry", quizCount: 10 },
    ]
  },
  {
    id: "biology",
    name: "Biology",
    topics: [
      { id: "botany", name: "Botany", quizCount: 14 },
      { id: "zoology", name: "Zoology", quizCount: 16 },
      { id: "human_physiology", name: "Human Physiology", quizCount: 12 },
      { id: "genetics", name: "Genetics", quizCount: 10 },
      { id: "ecology", name: "Ecology", quizCount: 10 },
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    topics: [
      { id: "algebra", name: "Algebra", quizCount: 15 },
      { id: "calculus", name: "Calculus", quizCount: 14 },
      { id: "trigonometry", name: "Trigonometry", quizCount: 10 },
      { id: "coordinate", name: "Coordinate Geometry", quizCount: 12 },
      { id: "statistics", name: "Statistics & Probability", quizCount: 10 },
    ]
  }
];

// Sample quiz questions
export const sampleQuestions = [
  {
    id: "q1",
    text: "What is Newton's First Law of Motion?",
    options: [
      { id: "a", text: "Force equals mass times acceleration" },
      { id: "b", text: "An object at rest stays at rest unless acted upon by an external force" },
      { id: "c", text: "For every action, there is an equal and opposite reaction" },
      { id: "d", text: "Energy cannot be created or destroyed" }
    ],
    correctOption: "b",
    points: 10,
    timeLimit: 30
  },
  {
    id: "q2",
    text: "Which of the following is an organic compound?",
    options: [
      { id: "a", text: "NaCl" },
      { id: "b", text: "H₂O" },
      { id: "c", text: "CH₄" },
      { id: "d", text: "Fe₂O₃" }
    ],
    correctOption: "c",
    points: 10,
    timeLimit: 20
  },
  {
    id: "q3",
    text: "What is the powerhouse of the cell?",
    options: [
      { id: "a", text: "Nucleus" },
      { id: "b", text: "Mitochondria" },
      { id: "c", text: "Endoplasmic Reticulum" },
      { id: "d", text: "Golgi Apparatus" }
    ],
    correctOption: "b",
    points: 10,
    timeLimit: 20
  }
];

// Sample quizzes
export const sampleQuizzes = [
  {
    id: "quiz1",
    title: "Physics Fundamentals",
    description: "Test your knowledge on basic physics concepts",
    subject: "Physics",
    grade: "11" as const,
    topic: "Mechanics",
    createdBy: "host1",
    createdAt: new Date(),
    questions: sampleQuestions.slice(0, 2),
    hasNegativeMarking: true,
    negativeMarkingValue: 25
  },
  {
    id: "quiz2",
    title: "Biology Basics",
    description: "Essential biology concepts for Class 11",
    subject: "Biology",
    grade: "11" as const,
    topic: "Botany",
    createdBy: "host1",
    createdAt: new Date(),
    questions: sampleQuestions.slice(2),
    hasNegativeMarking: false,
    negativeMarkingValue: 0
  }
];
