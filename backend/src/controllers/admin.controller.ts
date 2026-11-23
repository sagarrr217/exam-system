import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalExams = await prisma.exam.count();
    const publishedExams = await prisma.exam.count({ where: { isPublished: true } });
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalSubmissions = await prisma.examAttempt.count({ where: { status: 'SUBMITTED' } });

    const passedSubmissions = await prisma.examAttempt.count({
      where: { status: 'SUBMITTED', passed: true }
    });

    const submissionsWithScore = await prisma.examAttempt.findMany({
      where: { status: 'SUBMITTED' },
      select: { percentage: true }
    });

    const averageScore = submissionsWithScore.length > 0
      ? (submissionsWithScore.reduce((acc, curr) => acc + curr.percentage, 0) / submissionsWithScore.length).toFixed(1)
      : '0.0';

    const highRiskThreshold = 3;
    const focusLossAggregates = await prisma.focusLossLog.groupBy({
      by: ['attemptId'],
      _count: { id: true }
    });
    const highRiskAttemptsCount = focusLossAggregates.filter(a => a._count.id >= highRiskThreshold).length;

    const recentSubmissions = await prisma.examAttempt.findMany({
      where: { status: 'SUBMITTED' },
      take: 5,
      orderBy: { submittedAt: 'desc' },
      include: {
        student: { select: { name: true, email: true, studentId: true } },
        exam: { select: { title: true, subject: true, totalMarks: true } }
      }
    });

    res.json({
      stats: {
        totalExams,
        publishedExams,
        totalStudents,
        totalSubmissions,
        passRate: totalSubmissions > 0 ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1) : '0.0',
        averageScore,
        highRiskAttemptsCount
      },
      recentSubmissions
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' });
  }
};

export const getExams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });

    res.json({ exams });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to retrieve examinations.' });
  }
};

export const getExamById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        _count: {
          select: { attempts: true }
        }
      }
    });

    if (!exam) {
      res.status(404).json({ error: 'Examination not found.' });
      return;
    }

    res.json({ exam });
  } catch (error: any) {
    console.error('Error fetching exam by id:', error);
    res.status(500).json({ error: 'Failed to retrieve examination.' });
  }
};

export const createExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      subject,
      description,
      instructions,
      durationMinutes = 60,
      totalMarks = 100,
      passingMarks = 40,
      startDate,
      endDate,
      randomizeQuestions = false,
      randomizeOptions = false,
      allowReview = true,
      autoSubmit = true,
      focusLossThreshold = 3,
      questions = []
    } = req.body;

    if (!title || !subject) {
      res.status(400).json({ error: 'Exam title and subject are required.' });
      return;
    }

    const exam = await prisma.$transaction(async (tx) => {
      const createdExam = await tx.exam.create({
        data: {
          title,
          subject,
          description,
          instructions,
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          passingMarks: Number(passingMarks),
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          randomizeQuestions,
          randomizeOptions,
          allowReview,
          autoSubmit,
          focusLossThreshold: Number(focusLossThreshold),
          isPublished: false
        }
      });

      if (questions && Array.isArray(questions)) {
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const q = questions[qIdx];
          const createdQ = await tx.question.create({
            data: {
              examId: createdExam.id,
              text: q.text || `Question ${qIdx + 1}`,
              type: q.type || 'MCQ',
              orderIndex: qIdx,
              marks: Number(q.marks || 1),
              isRequired: q.isRequired ?? true,
              imageUrl: q.imageUrl || null,
              explanation: q.explanation || null
            }
          });

          if (q.options && Array.isArray(q.options)) {
            for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
              const opt = q.options[oIdx];
              await tx.option.create({
                data: {
                  questionId: createdQ.id,
                  text: opt.text || `Option ${oIdx + 1}`,
                  isCorrect: Boolean(opt.isCorrect),
                  orderIndex: oIdx
                }
              });
            }
          }
        }
      }

      return createdExam;
    });

    const fullExam = await prisma.exam.findUnique({
      where: { id: exam.id },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    res.status(201).json({
      message: 'Examination created successfully.',
      exam: fullExam
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create examination.' });
  }
};

export const updateExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const {
      title,
      subject,
      description,
      instructions,
      durationMinutes,
      totalMarks,
      passingMarks,
      startDate,
      endDate,
      randomizeQuestions,
      randomizeOptions,
      allowReview,
      autoSubmit,
      focusLossThreshold,
      questions
    } = req.body;

    const existingExam = await prisma.exam.findUnique({ where: { id } });
    if (!existingExam) {
      res.status(404).json({ error: 'Examination not found.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.exam.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(subject !== undefined && { subject }),
          ...(description !== undefined && { description }),
          ...(instructions !== undefined && { instructions }),
          ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
          ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
          ...(passingMarks !== undefined && { passingMarks: Number(passingMarks) }),
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          ...(randomizeQuestions !== undefined && { randomizeQuestions }),
          ...(randomizeOptions !== undefined && { randomizeOptions }),
          ...(allowReview !== undefined && { allowReview }),
          ...(autoSubmit !== undefined && { autoSubmit }),
          ...(focusLossThreshold !== undefined && { focusLossThreshold: Number(focusLossThreshold) })
        }
      });

      if (questions && Array.isArray(questions)) {
        // Replace questions atomically
        await tx.question.deleteMany({ where: { examId: id } });

        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const q = questions[qIdx];
          const createdQ = await tx.question.create({
            data: {
              examId: id,
              text: q.text || `Question ${qIdx + 1}`,
              type: q.type || 'MCQ',
              orderIndex: qIdx,
              marks: Number(q.marks || 1),
              isRequired: q.isRequired ?? true,
              imageUrl: q.imageUrl || null,
              explanation: q.explanation || null
            }
          });

          if (q.options && Array.isArray(q.options)) {
            for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
              const opt = q.options[oIdx];
              await tx.option.create({
                data: {
                  questionId: createdQ.id,
                  text: opt.text || `Option ${oIdx + 1}`,
                  isCorrect: Boolean(opt.isCorrect),
                  orderIndex: oIdx
                }
              });
            }
          }
        }
      }
    });

    const updated = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: { orderBy: { orderIndex: 'asc' } }
          }
        }
      }
    });

    res.json({
      message: 'Examination updated successfully.',
      exam: updated
    });
  } catch (error: any) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update examination.' });
  }
};

export const deleteExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.exam.delete({ where: { id } });
    res.json({ message: 'Examination deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Failed to delete examination.' });
  }
};

export const togglePublishExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    if (!exam) {
      res.status(404).json({ error: 'Examination not found.' });
      return;
    }

    if (!exam.isPublished) {
      // Validate before publishing
      if (exam.questions.length === 0) {
        res.status(400).json({ error: 'Cannot publish an examination with no questions. Please add questions first.' });
        return;
      }

      if (exam.durationMinutes <= 0) {
        res.status(400).json({ error: 'Exam duration must be greater than zero minutes.' });
        return;
      }

      for (const q of exam.questions) {
        if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
          if (q.options.length < 2) {
            res.status(400).json({
              error: `Question "${q.text.slice(0, 30)}..." must have at least 2 options.`
            });
            return;
          }
          const hasCorrect = q.options.some((o: any) => o.isCorrect);
          if (!hasCorrect) {
            res.status(400).json({
              error: `Question "${q.text.slice(0, 30)}..." does not have a designated correct answer.`
            });
            return;
          }
        }
      }
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: { isPublished: !exam.isPublished }
    });

    res.json({
      message: updated.isPublished ? 'Examination published successfully.' : 'Examination unpublished successfully.',
      isPublished: updated.isPublished
    });
  } catch (error: any) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ error: 'Failed to toggle publication status.' });
  }
};

export const duplicateExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const sourceExam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    if (!sourceExam) {
      res.status(404).json({ error: 'Source examination not found.' });
      return;
    }

    const newExam = await prisma.$transaction(async (tx) => {
      const cloned = await tx.exam.create({
        data: {
          title: `${sourceExam.title} (Copy)`,
          subject: sourceExam.subject,
          description: sourceExam.description,
          instructions: sourceExam.instructions,
          durationMinutes: sourceExam.durationMinutes,
          totalMarks: sourceExam.totalMarks,
          passingMarks: sourceExam.passingMarks,
          startDate: sourceExam.startDate,
          endDate: sourceExam.endDate,
          randomizeQuestions: sourceExam.randomizeQuestions,
          randomizeOptions: sourceExam.randomizeOptions,
          allowReview: sourceExam.allowReview,
          autoSubmit: sourceExam.autoSubmit,
          focusLossThreshold: sourceExam.focusLossThreshold,
          isPublished: false
        }
      });

      for (const q of (sourceExam.questions as any[])) {
        const clonedQ = await tx.question.create({
          data: {
            examId: cloned.id,
            text: q.text,
            type: q.type,
            orderIndex: q.orderIndex,
            marks: q.marks,
            isRequired: q.isRequired,
            imageUrl: q.imageUrl,
            explanation: q.explanation
          }
        });

        for (const opt of (q.options as any[])) {
          await tx.option.create({
            data: {
              questionId: clonedQ.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
              orderIndex: opt.orderIndex
            }
          });
        }
      }

      return cloned;
    });

    res.status(201).json({
      message: 'Examination duplicated successfully.',
      exam: newExam
    });
  } catch (error: any) {
    console.error('Error duplicating exam:', error);
    res.status(500).json({ error: 'Failed to duplicate examination.' });
  }
};

export const getSubmissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.query;

    const attempts = await prisma.examAttempt.findMany({
      where: {
        status: 'SUBMITTED',
        ...(examId ? { examId: String(examId) } : {})
      },
      orderBy: { submittedAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true, studentId: true, department: true } },
        exam: { select: { id: true, title: true, subject: true, totalMarks: true, passingMarks: true, focusLossThreshold: true } },
        _count: {
          select: {
            focusLossLogs: true,
            answers: true
          }
        }
      }
    });

    res.json({ submissions: attempts });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
};

export const getSubmissionDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true, studentId: true, department: true } },
        exam: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                options: { orderBy: { orderIndex: 'asc' } }
              }
            }
          }
        },
        answers: {
          include: {
            selectedOption: true
          }
        },
        focusLossLogs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!attempt) {
      res.status(404).json({ error: 'Examination attempt not found.' });
      return;
    }

    res.json({ attempt });
  } catch (error: any) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ error: 'Failed to retrieve submission details.' });
  }
};

export const exportResultsCSV = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const examId = String(req.params.examId);
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      res.status(404).json({ error: 'Exam not found.' });
      return;
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { examId, status: 'SUBMITTED' },
      include: {
        student: true,
        _count: { select: { focusLossLogs: true } }
      },
      orderBy: { score: 'desc' }
    });

    const headers = [
      'Student ID',
      'Student Name',
      'Email',
      'Department',
      'Score',
      'Total Marks',
      'Percentage (%)',
      'Status (Pass/Fail)',
      'Answered Count',
      'Unanswered Count',
      'Focus Loss Incidents',
      'Start Time',
      'Submitted At'
    ];

    const rows = attempts.map(a => [
      `"${a.student.studentId || ''}"`,
      `"${a.student.name}"`,
      `"${a.student.email}"`,
      `"${a.student.department || ''}"`,
      a.score,
      exam.totalMarks,
      a.percentage.toFixed(2),
      a.passed ? 'PASSED' : 'FAILED',
      a.totalAnswered,
      a.totalUnanswered,
      a._count.focusLossLogs,
      `"${a.startTime.toISOString()}"`,
      a.submittedAt ? `"${a.submittedAt.toISOString()}"` : '""'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="results-${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export results to CSV.' });
  }
};

export const getFocusLossLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.query;

    const logs = await prisma.focusLossLog.findMany({
      where: examId
        ? { attempt: { examId: String(examId) } }
        : {},
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        attempt: {
          include: {
            student: { select: { name: true, studentId: true, email: true } },
            exam: { select: { id: true, title: true, focusLossThreshold: true } }
          }
        }
      }
    });

    res.json({ logs });
  } catch (error: any) {
    console.error('Error fetching focus loss logs:', error);
    res.status(500).json({ error: 'Failed to retrieve focus loss logs.' });
  }
};

export const getStudents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        department: true,
        createdAt: true,
        attempts: {
          select: {
            id: true,
            status: true,
            score: true,
            percentage: true,
            passed: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ students });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to retrieve students.' });
  }
};

export const uploadImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { image, folder = 'exam-questions' } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Image payload is required (base64 or URL).' });
      return;
    }
    const { uploadImageToCloudinary } = await import('../services/cloudinary.service.js');
    const secureUrl = await uploadImageToCloudinary(image, folder);
    res.json({ url: secureUrl });
  } catch (error: any) {
    console.error('Image upload controller error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image to Cloudinary.' });
  }
};

export const generateAIQuestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { topic, count = 3, difficulty = 'medium' } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({ error: 'A subject or topic is required for AI question generation.' });
      return;
    }

    const { generateQuestionsWithGemini } = await import('../services/gemini.service.js');
    const questions = await generateQuestionsWithGemini(
      topic.trim(),
      Math.min(10, Math.max(1, Number(count) || 3)),
      difficulty
    );

    res.json({
      message: `Generated ${questions.length} questions successfully using Gemini AI.`,
      questions
    });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    res.status(500).json({ error: error.message || 'Failed to generate questions with Gemini AI.' });
  }
};
