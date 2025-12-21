// src/app/models/exam.ts
export interface User {
  uid?: string;
  username: string;
  email: string;
  pin: string;
  mobile: string;
  group: string;
  course: string;
  started: boolean;
  completed: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Question {
  question: string;
  options: string[];
  correct: number;
}

export interface CodingQuestion {
  id?: string;
  title: string;
  problem: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  constraints: string[];
  testCases: {
    input: string;
    expected: string;
  }[];
  language: string;
  starterCode: string;
  course: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamData {
  aptitude: Question[];
  verbal: Question[];
  technical: Question[];
  coding: CodingQuestion[];
}

export interface Answer {
  [key: number]: number | any;
}

export interface ExamResult {
  user_id: string;
  username: string;
  email: string;
  course: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  answers: Answer;
  code_submissions: { [key: string]: any };
  timestamp: Date;
}

export interface ExamState {
  currentQuestion: number;
  answers: Answer;
  timeRemaining: number;
  user: User | null;
  courseQuestions: CodingQuestion[];
  violations: number; // Track number of violations
}