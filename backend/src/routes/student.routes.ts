import { Router } from 'express';
import {
  getAvailableExams,
  startExamAttempt,
  getExamAttemptData,
  saveAnswerProgress,
  logFocusLoss,
  submitExam,
  getExamResult
} from '../controllers/student.controller.js';
import { authenticate, requireStudent } from '../middleware/auth.middleware.js';

const router = Router();

// All student routes require authentication and student role
router.use(authenticate, requireStudent);

router.get('/exams', getAvailableExams);
router.post('/exams/start', startExamAttempt);
router.get('/attempts/:attemptId', getExamAttemptData);
router.post('/attempts/:attemptId/save-answer', saveAnswerProgress);
router.post('/attempts/:attemptId/focus-loss', logFocusLoss);
router.post('/attempts/:attemptId/submit', submitExam);
router.get('/attempts/:attemptId/result', getExamResult);

export default router;
