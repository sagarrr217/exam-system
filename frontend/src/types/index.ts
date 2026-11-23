export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string | null;
  department?: string | null;
  createdAt?: string;
}

export type QuestionType = 
  | 'MCQ' 
  | 'MULTIPLE_SELECT' 
  | 'TRUE_FALSE' 
  | 'FILL_BLANK' 
  | 'NUMERICAL' 
  | 'SHORT_ANSWER' 
  | 'LONG_ANSWER';

export interface Option {
  id: string;
  questionId?: string;
  text: string;
  isCorrect?: boolean; // Only present in admin views, stripped in student views
  orderIndex: number;
}

export interface Question {
  id: string;
  examId?: string;
  text: string;
  type: QuestionType;
  orderIndex: number;
  marks: number;
  isRequired: boolean;
  imageUrl?: string | null;
  explanation?: string | null; // Only in admin / review views
  options: Option[];
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description?: string | null;
  instructions?: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startDate?: string | null;
  endDate?: string | null;
  isPublished: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowReview: boolean;
  autoSubmit: boolean;
  focusLossThreshold: number;
  createdAt?: string;
  updatedAt?: string;
  questions?: Question[];
  totalQuestions?: number;
  userExamStatus?: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  activeAttemptId?: string | null;
  submittedAttempt?: {
    id: string;
    score: number;
    percentage: number;
    passed: boolean;
    submittedAt?: string;
  } | null;
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
  isMarkedForReview?: boolean;
  isCorrect?: boolean;
  marksAwarded?: number;
}

export interface ExamAttemptData {
  attemptId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  exam: {
    id: string;
    title: string;
    subject: string;
    instructions?: string | null;
    durationMinutes: number;
    totalMarks: number;
    focusLossThreshold: number;
  };
  startTime: string;
  durationSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  questions: Question[];
  savedAnswers: StudentAnswer[];
  focusLossCount: number;
}

export interface FocusLossLog {
  id: string;
  attemptId: string;
  eventType: 'WINDOW_BLUR' | 'VISIBILITY_HIDDEN' | 'WINDOW_RESIZE';
  timestamp: string;
  details?: string | null;
  durationSeconds?: number | null;
  attempt?: {
    student: {
      name: string;
      studentId?: string | null;
      email: string;
    };
    exam: {
      id: string;
      title: string;
      focusLossThreshold: number;
    };
  };
}

export interface DashboardStats {
  totalExams: number;
  publishedExams: number;
  totalStudents: number;
  totalSubmissions: number;
  passRate: string;
  averageScore: string;
  highRiskAttemptsCount: number;
}

export interface SubmissionSummary {
  id: string;
  score: number;
  percentage: number;
  passed: boolean;
  startTime: string;
  submittedAt: string;
  totalAnswered: number;
  totalUnanswered: number;
  student: {
    id: string;
    name: string;
    email: string;
    studentId?: string | null;
    department?: string | null;
  };
  exam: {
    id: string;
    title: string;
    subject: string;
    totalMarks: number;
    passingMarks: number;
    focusLossThreshold: number;
  };
  _count: {
    focusLossLogs: number;
    answers: number;
  };
}
