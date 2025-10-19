export type LearningMode = 'freeplay' | 'practice' | 'quiz' | 'learning';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type AccentType = 'us' | 'uk';

export interface QuizQuestion {
  id: string;
  targetHours: number;
  targetMinutes: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: DifficultyLevel;
  hints?: string[];
  explanation?: string;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: (string | null)[];
  score: number;
  startTime: Date;
  endTime?: Date;
  difficulty: DifficultyLevel;
}

export interface UserProgress {
  totalTimeSpent: number;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  achievements: Achievement[];
  weakAreas: string[];
  strongAreas: string[];
  lastSessionDate: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'accuracy' | 'speed' | 'consistency' | 'learning';
}

export interface LearningSettings {
  mode: LearningMode;
  difficulty: DifficultyLevel;
  accent: AccentType;
  soundEnabled: boolean;
  speechEnabled: boolean;
  showDigital: boolean;
  snapToMinute: boolean;
  showHints: boolean;
  autoAdvance: boolean;
  timeLimit?: number; // in seconds for quiz mode
}

export interface PracticeExercise {
  id: string;
  type: 'setTime' | 'readTime' | 'matchTime';
  targetTime: { hours: number; minutes: number };
  instruction: string;
  hint?: string;
  completed: boolean;
  attempts: number;
  bestTime?: number;
}

export interface LearningSession {
  id: string;
  mode: LearningMode;
  startTime: Date;
  endTime?: Date;
  exercises: PracticeExercise[];
  score?: number;
  feedback?: string;
}