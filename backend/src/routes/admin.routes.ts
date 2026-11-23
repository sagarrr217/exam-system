import { Router } from 'express';
import {
  getDashboardStats,
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  togglePublishExam,
  duplicateExam,
  getSubmissions,
  getSubmissionDetails,
  exportResultsCSV,
  getFocusLossLogs,
  getStudents,
  uploadImage,
  generateAIQuestions
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/exams', getExams);
router.get('/exams/:id', getExamById);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);
router.patch('/exams/:id/publish', togglePublishExam);
router.post('/exams/:id/duplicate', duplicateExam);
router.get('/submissions', getSubmissions);
router.get('/submissions/:id', getSubmissionDetails);
router.get('/exams/:examId/export', exportResultsCSV);
router.get('/focus-loss-logs', getFocusLossLogs);
router.get('/students', getStudents);
router.post('/upload-image', uploadImage);
router.post('/generate-questions', generateAIQuestions);

export default router;
