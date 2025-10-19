import { useState, useCallback } from 'react';
import {
  LearningMode,
  QuizSession,
  PracticeExercise,
  LearningSession,
  DifficultyLevel,
  QuizQuestion
} from '../types/learning';
import { EnhancedTimeExpressions } from '../utils/enhancedTimeExpressions';

export const useLearningMode = () => {
  const [mode, setMode] = useState<LearningMode>('freeplay');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentExercise, setCurrentExercise] = useState<PracticeExercise | null>(null);

  // Start a new learning session
  const startSession = useCallback((newMode: LearningMode, newDifficulty?: DifficultyLevel) => {
    const session: LearningSession = {
      id: Date.now().toString(),
      mode: newMode,
      startTime: new Date(),
      exercises: []
    };

    setCurrentSession(session);
    setMode(newMode);
    if (newDifficulty) {
      setDifficulty(newDifficulty);
    }

    // Generate initial exercise based on mode
    if (newMode === 'practice') {
      generatePracticeExercise();
    } else if (newMode === 'quiz') {
      startQuizSession(newDifficulty || difficulty);
    }
  }, [difficulty]);

  // Generate a practice exercise
  const generatePracticeExercise = useCallback(() => {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 12) * 5; // 5-minute intervals

    const exercise: PracticeExercise = {
      id: Date.now().toString(),
      type: 'setTime',
      targetTime: { hours, minutes },
      instruction: `Set the clock to ${EnhancedTimeExpressions.getBestExpression(hours, minutes, difficulty).text}`,
      hint: 'Move the clock hands to match the target time',
      completed: false,
      attempts: 0
    };

    setCurrentExercise(exercise);
    return exercise;
  }, [difficulty]);

  // Start a quiz session
  const startQuizSession = useCallback((quizDifficulty: DifficultyLevel, questionCount: number = 5) => {
    const questions: QuizQuestion[] = [];

    for (let i = 0; i < questionCount; i++) {
      const hours = Math.floor(Math.random() * 12) + 1;
      const minutes = Math.floor(Math.random() * 12) * 5;

      const quizData = EnhancedTimeExpressions.generateQuizQuestion(hours, minutes, quizDifficulty);
      questions.push({
        id: `${Date.now()}-${i}`,
        targetHours: hours,
        targetMinutes: minutes,
        questionText: quizData.question,
        options: quizData.options,
        correctAnswer: quizData.correctAnswer,
        difficulty: quizDifficulty,
        hints: quizData.hints,
        explanation: quizData.explanation
      });
    }

    const session: QuizSession = {
      id: Date.now().toString(),
      questions,
      currentQuestionIndex: 0,
      answers: new Array(questionCount).fill(null),
      score: 0,
      startTime: new Date(),
      difficulty: quizDifficulty
    };

    setQuizSession(session);
    setMode('quiz');
    setDifficulty(quizDifficulty);
  }, []);

  // Answer a quiz question
  const answerQuizQuestion = useCallback((answer: string) => {
    if (!quizSession) return false;

    const questionIndex = quizSession.currentQuestionIndex;
    const question = quizSession.questions[questionIndex];
    const isCorrect = answer === question.correctAnswer;

    // Update answer
    const newAnswers = [...quizSession.answers];
    newAnswers[questionIndex] = answer;

    // Update score if correct
    const newScore = isCorrect ? quizSession.score + 1 : quizSession.score;

    const updatedSession = {
      ...quizSession,
      answers: newAnswers,
      score: newScore,
      currentQuestionIndex: questionIndex + 1
    };

    setQuizSession(updatedSession);
    return isCorrect;
  }, [quizSession]);

  // Complete a practice exercise
  const completeExercise = useCallback((exerciseId: string, success: boolean, timeTaken?: number) => {
    if (!currentSession || !currentExercise) return;

    const updatedExercise = {
      ...currentExercise,
      completed: success,
      attempts: currentExercise.attempts + 1,
      bestTime: timeTaken && (!currentExercise.bestTime || timeTaken < currentExercise.bestTime)
        ? timeTaken
        : currentExercise.bestTime
    };

    setCurrentExercise(updatedExercise);

    // Update session
    const updatedExercises = [...currentSession.exercises];
    const exerciseIndex = updatedExercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex >= 0) {
      updatedExercises[exerciseIndex] = updatedExercise;
    } else {
      updatedExercises.push(updatedExercise);
    }

    setCurrentSession({
      ...currentSession,
      exercises: updatedExercises
    });

    // Generate next exercise if in practice mode
    if (mode === 'practice') {
      setTimeout(() => {
        generatePracticeExercise();
      }, 1000);
    }
  }, [currentSession, currentExercise, mode, generatePracticeExercise]);

  // End current session
  const endSession = useCallback(() => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date()
      };
      setCurrentSession(endedSession);
    }

    // Clear quiz session
    if (quizSession) {
      const endedQuiz = {
        ...quizSession,
        endTime: new Date()
      };
      setQuizSession(endedQuiz);
    }

    setCurrentExercise(null);
    setMode('freeplay');
  }, [currentSession, quizSession]);

  // Get current quiz question
  const getCurrentQuizQuestion = useCallback((): QuizQuestion | null => {
    if (!quizSession || quizSession.currentQuestionIndex >= quizSession.questions.length) {
      return null;
    }
    return quizSession.questions[quizSession.currentQuestionIndex];
  }, [quizSession]);

  // Check if quiz is complete
  const isQuizComplete = useCallback((): boolean => {
    return quizSession ? quizSession.currentQuestionIndex >= quizSession.questions.length : false;
  }, [quizSession]);

  // Calculate quiz results
  const getQuizResults = useCallback(() => {
    if (!quizSession || !isQuizComplete()) return null;

    const totalQuestions = quizSession.questions.length;
    const correctAnswers = quizSession.score;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      totalQuestions,
      correctAnswers,
      percentage,
      difficulty: quizSession.difficulty,
      timeTaken: quizSession.endTime
        ? Math.round((quizSession.endTime.getTime() - quizSession.startTime.getTime()) / 1000)
        : 0
    };
  }, [quizSession, isQuizComplete]);

  // Skip to next question
  const skipQuestion = useCallback(() => {
    if (!quizSession) return;

    const updatedSession = {
      ...quizSession,
      currentQuestionIndex: quizSession.currentQuestionIndex + 1
    };

    setQuizSession(updatedSession);
  }, [quizSession]);

  return {
    // State
    mode,
    difficulty,
    currentSession,
    quizSession,
    currentExercise,
    isQuizComplete: isQuizComplete(),

    // Actions
    startSession,
    setDifficulty,
    generatePracticeExercise,
    startQuizSession,
    answerQuizQuestion,
    completeExercise,
    endSession,
    skipQuestion,

    // Getters
    getCurrentQuizQuestion,
    getQuizResults
  };
};