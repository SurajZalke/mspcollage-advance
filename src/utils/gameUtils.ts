
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

// Sample quiz questions - Physics
const physicsQuestions = [
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
    text: "Which scientist formulated the theory of relativity?",
    options: [
      { id: "a", text: "Isaac Newton" },
      { id: "b", text: "Galileo Galilei" },
      { id: "c", text: "Albert Einstein" },
      { id: "d", text: "Niels Bohr" }
    ],
    correctOption: "c",
    points: 10,
    timeLimit: 20
  },
  {
    id: "q3",
    text: "What is the SI unit of electric current?",
    options: [
      { id: "a", text: "Volt" },
      { id: "b", text: "Watt" },
      { id: "c", text: "Ampere" },
      { id: "d", text: "Ohm" }
    ],
    correctOption: "c",
    points: 10,
    timeLimit: 20
  }
];

// Sample quiz questions - Chemistry
const chemistryQuestions = [
  {
    id: "q1",
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
    id: "q2",
    text: "What is the pH of a neutral solution?",
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "7" },
      { id: "c", text: "14" },
      { id: "d", text: "1" }
    ],
    correctOption: "b",
    points: 10,
    timeLimit: 20
  },
  {
    id: "q3",
    text: "Which element has the symbol 'Au'?",
    options: [
      { id: "a", text: "Silver" },
      { id: "b", text: "Gold" },
      { id: "c", text: "Aluminum" },
      { id: "d", text: "Argon" }
    ],
    correctOption: "b",
    points: 10,
    timeLimit: 20
  }
];

// Sample quiz questions - Biology
const biologyQuestions = [
  {
    id: "q1",
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
  },
  {
    id: "q2",
    text: "Which of the following is NOT a type of blood cell?",
    options: [
      { id: "a", text: "Red blood cells" },
      { id: "b", text: "White blood cells" },
      { id: "c", text: "Platelets" },
      { id: "d", text: "Stem cells" }
    ],
    correctOption: "d",
    points: 10,
    timeLimit: 20
  },
  {
    id: "q3",
    text: "What is the process by which plants make their own food?",
    options: [
      { id: "a", text: "Respiration" },
      { id: "b", text: "Photosynthesis" },
      { id: "c", text: "Digestion" },
      { id: "d", text: "Excretion" }
    ],
    correctOption: "b",
    points: 10,
    timeLimit: 20
  }
];

// Sample quiz questions - Mathematics
const mathQuestions = [
  {
    id: "q1",
    text: "What is the value of π (pi) to two decimal places?",
    options: [
      { id: "a", text: "3.14" },
      { id: "b", text: "3.12" },
      { id: "c", text: "3.16" },
      { id: "d", text: "3.18" }
    ],
    correctOption: "a",
    points: 10,
    timeLimit: 20
  },
  {
    id: "q2",
    text: "What is the formula for the area of a circle?",
    options: [
      { id: "a", text: "πr" },
      { id: "b", text: "2πr" },
      { id: "c", text: "πr²" },
      { id: "d", text: "2πr²" }
    ],
    correctOption: "c",
    points: 10,
    timeLimit: 20
  },
  {
    id: "q3",
    text: "What is the Pythagorean theorem?",
    options: [
      { id: "a", text: "a² + b² = c²" },
      { id: "b", text: "a + b = c" },
      { id: "c", text: "a² - b² = c²" },
      { id: "d", text: "a × b = c" }
    ],
    correctOption: "a",
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
    questions: physicsQuestions,
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
    questions: biologyQuestions,
    hasNegativeMarking: false,
    negativeMarkingValue: 0
  },
  {
    id: "quiz3",
    title: "Chemistry Fundamentals",
    description: "Basic chemistry concepts for high school students",
    subject: "Chemistry",
    grade: "11" as const,
    topic: "Organic",
    createdBy: "host1",
    createdAt: new Date(),
    questions: chemistryQuestions,
    hasNegativeMarking: true,
    negativeMarkingValue: 20
  },
  {
    id: "quiz4",
    title: "Mathematics Challenge",
    description: "Test your math skills with these challenging questions",
    subject: "Mathematics",
    grade: "12" as const,
    topic: "Algebra",
    createdBy: "host1",
    createdAt: new Date(),
    questions: mathQuestions,
    hasNegativeMarking: true,
    negativeMarkingValue: 15
  }
];
