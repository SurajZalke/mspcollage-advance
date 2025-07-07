import { ReactNode } from "react";

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
  uid: string;
  id: any;
  player_id: string;
  nickname: string;
  score: number;
  answers: PlayerAnswer[];
  avatar?: string;
  status?: 'waiting' | 'answered';
  streak?: number;
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
  totalMarks: number;
  hasNegativeMarking?: boolean;
  negativeMarkingValue?: number;
}

export interface Question {
  questionText: any;
  correctAnswer: ReactNode;
  playerAnswerId: any;
  id: string;
  text: string;
  options: QuestionOption[];
  correctOption: string;
  Marks: number;
  timeLimit: number; // in seconds
  imageUrl?: string;
  imageFile?: File | null;
}

export interface QuestionOption {
  correct: any;
  id: string;
  text: string;
  imageUrl?: string;
  imageFile?: File | null;
  publicId?: string; // For Cloudinary image management
}

export interface GameRoom {
  gameCode: any;
  negativeMarkingValue: number;
  settings: any;
  winner: any;
  questionStartTime: number;
  showScores: boolean;
  id: string;
  code: string;
  quiz: Quiz;
  hostId: string;
  players: Player[];
  status: "waiting" | "active" | "finished" | "ended";
  currentQuestionIndex: number;
  startTime: Date | null;
  endTime: Date | null;
  hostSubmitted?: boolean;
  removedPlayers?: { [playerId: string]: boolean };
  removedNicknames?: { [nickname: string]: boolean };
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
