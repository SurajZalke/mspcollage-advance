
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Player {
  player_id: string;
  id: string;
  nickname: string;
  score: number;
  answers: PlayerAnswer[];
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
  grade: "11" | "12";
  topic: string;
  createdBy: string;
  createdAt: Date;
  questions: Question[];
  hasNegativeMarking: boolean;
  negativeMarkingValue: number; // percentage of question's points
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
  id: string;
  code: string;
  hostId: string;
  quizId: string;
  players: Player[];
  status: "waiting" | "active" | "finished";
  currentQuestionIndex: number;
  startTime?: Date;
  endTime?: Date;
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
