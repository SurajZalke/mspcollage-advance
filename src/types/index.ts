
export interface User {
  id: string;
  email: string;
  name: string;
  user_metadata?: {
     id?: string;
     name?: string;
     avatar_url?: string;
     bio?: string;
     email?: string;
     createdAt?: any; // Using 'any' for serverTimestamp type
   };
}

export interface Player {
  id: any;
  player_id: string;
  nickname: string;
  score: number;
  answers: PlayerAnswer[];
  avatar?: string;
  status?: 'waiting' | 'answered';
}

export interface PlayerAnswer {
  questionId: string;
  selectedOption: string;
  correct: boolean;
  timeToAnswer: number; // in seconds
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  topic?: string;
  createdBy: string;
  createdAt: string;
  questions: Question[];
  totalQuestions: number;
  totalPoints: number;
  hasNegativeMarking?: boolean;
  negativeMarkingValue?: number;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOption: string;
  points: number;
  timeLimit: number; // in seconds
  imageUrl?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface GameRoom {
  winner: any;
  questionStartTime: number;
  showScores: boolean;
  id: string;
  code: string;
  quiz: Quiz;
  hostId: string;
  players: Player[];
  status: "waiting" | "active" | "finished";
  currentQuestionIndex: number;
  startTime: Date | null;
  endTime: Date | null;
  hostSubmitted?: boolean;
}

export interface ScienceSubject {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  quizCount: number;
}

export interface GameSettings {
  timePerQuestion: number;
  hasNegativeMarking: boolean;
  negativeMarkingValue: number;
  showLeaderboardAfterEachQuestion: boolean;
}
