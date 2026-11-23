import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendExamResultEmail } from '../services/resend.service.js';

export const getAvailableExams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ error: 'Student not authenticated.' });
      return;
    }

    const exams = await prisma.exam.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true }
        },
        attempts: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            score: true,
            percentage: true,
            passed: true,
            startTime: true,
            submittedAt: true
          }
        }
      }
    });

    const formattedExams = exams.map(exam => {
      const activeAttempt = exam.attempts.find(a => a.status === 'IN_PROGRESS');
      const submittedAttempt = exam.attempts.find(a => a.status === 'SUBMITTED');

      let userExamStatus: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' = 'AVAILABLE';
      if (activeAttempt) {
        userExamStatus = 'IN_PROGRESS';
      } else if (submittedAttempt) {
        userExamStatus = 'COMPLETED';
      }

      return {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        description: exam.description,
        instructions: exam.instructions,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        startDate: exam.startDate,
        endDate: exam.endDate,
        allowReview: exam.allowReview,
        focusLossThreshold: exam.focusLossThreshold,
        totalQuestions: exam._count.questions,
        userExamStatus,
        activeAttemptId: activeAttempt?.id || null,
        submittedAttempt: submittedAttempt || null
      };
    });

    res.json({ exams: formattedExams });
  } catch (error: any) {
    console.error('Error fetching available exams for student:', error);
    res.status(500).json({ error: 'Failed to retrieve examinations.' });
  }
};

export const startExamAttempt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { examId } = req.body;

    if (!studentId) {
      res.status(401).json({ error: 'Student not authenticated.' });
      return;
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: { select: { id: true } }
      }
    });

    if (!exam || !exam.isPublished) {
      res.status(404).json({ error: 'Examination is not available or unpublished.' });
      return;
    }

    if (exam.questions.length === 0) {
      res.status(400).json({ error: 'This examination does not have any questions yet.' });
      return;
    }

    // Check if active attempt already exists
    const existingActive = await prisma.examAttempt.findFirst({
      where: { examId, studentId, status: 'IN_PROGRESS' }
    });

    if (existingActive) {
      res.json({
        message: 'Resuming active examination attempt.',
        attemptId: existingActive.id,
        isResumed: true
      });
      return;
    }

    // Check if student already submitted this exam
    const existingSubmitted = await prisma.examAttempt.findFirst({
      where: { examId, studentId, status: 'SUBMITTED' }
    });

    if (existingSubmitted) {
      res.status(400).json({
        error: 'You have already completed and submitted this examination.',
        attemptId: existingSubmitted.id
      });
      return;
    }

    // Create new attempt
    const newAttempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId,
        startTime: new Date(),
        status: 'IN_PROGRESS',
        totalAnswered: 0,
        totalUnanswered: exam.questions.length
      }
    });

    res.status(201).json({
      message: 'Examination started successfully.',
      attemptId: newAttempt.id,
      isResumed: false
    });
  } catch (error: any) {
    console.error('Error starting exam attempt:', error);
    res.status(500).json({ error: 'Failed to start examination attempt.' });
  }
};

export const getExamAttemptData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const attemptId = String(req.params.attemptId);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                options: {
                  orderBy: { orderIndex: 'asc' },
                  select: {
                    id: true,
                    text: true,
                    orderIndex: true
                    // SECURITY: Do NOT select isCorrect!
                  }
                }
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            selectedOptionId: true,
            textAnswer: true,
            isMarkedForReview: true
          }
        },
        focusLossLogs: {
          select: { id: true }
        }
      }
    });

    if (!attempt || attempt.studentId !== studentId) {
      res.status(404).json({ error: 'Exam attempt not found or unauthorized.' });
      return;
    }

    // Calculate remaining seconds
    const durationSeconds = attempt.exam.durationMinutes * 60;
    const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startTime).getTime()) / 1000);
    const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

    // If time has expired and autoSubmit is true and still in progress
    if (remainingSeconds <= 0 && attempt.status === 'IN_PROGRESS') {
      res.json({
        expired: true,
        attemptId: attempt.id,
        message: 'Examination time has expired.'
      });
      return;
    }

    // Build questions payload with security stripping
    let questions = attempt.exam.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      orderIndex: q.orderIndex,
      marks: q.marks,
      isRequired: q.isRequired,
      imageUrl: q.imageUrl,
      options: q.options
      // SECURITY: explanation is omitted
    }));

    if (attempt.exam.randomizeQuestions) {
      // Deterministic shuffle based on attemptId to keep consistent across reloads
      questions = questions.sort((a, b) => (a.id + attempt.id).localeCompare(b.id + attempt.id));
    }

    res.json({
      attemptId: attempt.id,
      status: attempt.status,
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        subject: attempt.exam.subject,
        instructions: attempt.exam.instructions,
        durationMinutes: attempt.exam.durationMinutes,
        totalMarks: attempt.exam.totalMarks,
        focusLossThreshold: attempt.exam.focusLossThreshold
      },
      startTime: attempt.startTime,
      durationSeconds,
      elapsedSeconds,
      remainingSeconds,
      questions,
      savedAnswers: attempt.answers,
      focusLossCount: attempt.focusLossLogs.length
    });
  } catch (error: any) {
    console.error('Error fetching exam attempt data:', error);
    res.status(500).json({ error: 'Failed to retrieve exam data.' });
  }
};

export const saveAnswerProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const attemptId = String(req.params.attemptId);
    const { questionId, selectedOptionId, textAnswer, isMarkedForReview } = req.body;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt || attempt.studentId !== studentId) {
      res.status(404).json({ error: 'Exam attempt not found or unauthorized.' });
      return;
    }

    if (attempt.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'This examination attempt has already been submitted.' });
      return;
    }

    await prisma.studentAnswer.upsert({
      where: {
        attemptId_questionId: { attemptId, questionId }
      },
      update: {
        ...(selectedOptionId !== undefined && { selectedOptionId: selectedOptionId || null }),
        ...(textAnswer !== undefined && { textAnswer }),
        ...(isMarkedForReview !== undefined && { isMarkedForReview })
      },
      create: {
        attemptId,
        questionId,
        selectedOptionId: selectedOptionId || null,
        textAnswer: textAnswer || null,
        isMarkedForReview: Boolean(isMarkedForReview)
      }
    });

    // Update answered/unanswered counts on attempt
    const allAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId }
    });
    const answeredCount = allAnswers.filter(a => {
      if (a.selectedOptionId !== null) return true;
      if (a.textAnswer && a.textAnswer.trim().length > 0 && a.textAnswer.trim() !== '[]') return true;
      return false;
    }).length;
    const totalQuestions = await prisma.question.count({ where: { examId: attempt.examId } });

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        totalAnswered: answeredCount,
        totalUnanswered: Math.max(0, totalQuestions - answeredCount)
      }
    });

    res.json({
      success: true,
      answeredCount,
      unansweredCount: Math.max(0, totalQuestions - answeredCount)
    });
  } catch (error: any) {
    console.error('Error saving answer progress:', error);
    res.status(500).json({ error: 'Failed to save answer progress.' });
  }
};

export const logFocusLoss = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const attemptId = String(req.params.attemptId);
    const { eventType = 'WINDOW_BLUR', details, durationSeconds = 0 } = req.body;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { select: { focusLossThreshold: true } }
      }
    });

    if (!attempt || attempt.studentId !== studentId) {
      res.status(404).json({ error: 'Exam attempt not found.' });
      return;
    }

    if (attempt.status !== 'IN_PROGRESS') {
      res.json({ message: 'Exam already submitted, log ignored.' });
      return;
    }

    await prisma.focusLossLog.create({
      data: {
        attemptId,
        eventType,
        details: details || `Student switched window or tab at ${new Date().toLocaleTimeString()}`,
        durationSeconds: Number(durationSeconds)
      }
    });

    const totalLogs = await prisma.focusLossLog.count({ where: { attemptId } });
    const threshold = attempt.exam.focusLossThreshold;

    res.json({
      success: true,
      focusLossCount: totalLogs,
      threshold,
      warningLimitExceeded: totalLogs >= threshold
    });
  } catch (error: any) {
    console.error('Error logging focus loss:', error);
    res.status(500).json({ error: 'Failed to log focus loss.' });
  }
};

export const submitExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const attemptId = String(req.params.attemptId);
    const { finalAnswers } = req.body;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: { select: { name: true, email: true } },
        exam: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        }
      }
    });

    if (!attempt || attempt.studentId !== studentId) {
      res.status(404).json({ error: 'Exam attempt not found or unauthorized.' });
      return;
    }

    if (attempt.status === 'SUBMITTED') {
      res.status(400).json({ error: 'This examination has already been submitted.' });
      return;
    }

    // Save any pending final answers if sent in body
    if (finalAnswers && Array.isArray(finalAnswers)) {
      for (const ans of finalAnswers) {
        if (ans.questionId) {
          await prisma.studentAnswer.upsert({
            where: {
              attemptId_questionId: { attemptId, questionId: ans.questionId }
            },
            update: {
              selectedOptionId: ans.selectedOptionId || null,
              textAnswer: ans.textAnswer || null
            },
            create: {
              attemptId,
              questionId: ans.questionId,
              selectedOptionId: ans.selectedOptionId || null,
              textAnswer: ans.textAnswer || null
            }
          });
        }
      }
    }

    // Grade all question types (MCQ, MULTIPLE_SELECT, TRUE_FALSE, FILL_BLANK, NUMERICAL, SHORT_ANSWER, LONG_ANSWER)
    const studentAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId }
    });

    let totalScore = 0;
    let answeredCount = 0;

    for (const q of attempt.exam.questions) {
      const studentAns = studentAnswers.find(a => a.questionId === q.id);
      let isCorrect: boolean | null = false;
      let marksAwarded = 0;

      if (!studentAns) continue;

      const qType = (q.type || 'MCQ').toUpperCase();

      if (qType === 'MCQ' || qType === 'TRUE_FALSE') {
        if (studentAns.selectedOptionId) {
          answeredCount++;
          const correctOption = q.options.find(o => o.isCorrect);
          if (correctOption && correctOption.id === studentAns.selectedOptionId) {
            isCorrect = true;
            marksAwarded = q.marks;
            totalScore += marksAwarded;
          }
        }
      } else if (qType === 'MULTIPLE_SELECT') {
        // Multi-select checkboxes
        let chosenIds: string[] = [];
        try {
          if (studentAns.textAnswer && studentAns.textAnswer.trim().startsWith('[')) {
            chosenIds = JSON.parse(studentAns.textAnswer);
          } else if (studentAns.textAnswer && studentAns.textAnswer.trim().length > 0) {
            chosenIds = studentAns.textAnswer.split(',').map(s => s.trim()).filter(Boolean);
          } else if (studentAns.selectedOptionId) {
            chosenIds = [studentAns.selectedOptionId];
          }
        } catch {
          chosenIds = studentAns.textAnswer ? [studentAns.textAnswer] : [];
        }

        if (chosenIds.length > 0) {
          answeredCount++;
          const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);
          const allCorrectSelected = correctOptionIds.length > 0 &&
            correctOptionIds.length === chosenIds.length &&
            correctOptionIds.every(id => chosenIds.includes(id));

          if (allCorrectSelected) {
            isCorrect = true;
            marksAwarded = q.marks;
            totalScore += marksAwarded;
          }
        }
      } else if (qType === 'FILL_BLANK') {
        const textVal = (studentAns.textAnswer || '').trim().toLowerCase();
        if (textVal.length > 0) {
          answeredCount++;
          const acceptedAnswers = q.options
            .filter(o => o.isCorrect)
            .map(o => o.text.trim().toLowerCase());

          if (acceptedAnswers.length > 0 && acceptedAnswers.includes(textVal)) {
            isCorrect = true;
            marksAwarded = q.marks;
            totalScore += marksAwarded;
          }
        }
      } else if (qType === 'NUMERICAL') {
        const studentNum = parseFloat((studentAns.textAnswer || '').trim());
        if (!isNaN(studentNum)) {
          answeredCount++;
          const correctOpt = q.options.find(o => o.isCorrect);
          if (correctOpt) {
            const correctNum = parseFloat(correctOpt.text.trim());
            if (!isNaN(correctNum) && Math.abs(studentNum - correctNum) <= 0.001) {
              isCorrect = true;
              marksAwarded = q.marks;
              totalScore += marksAwarded;
            }
          }
        }
      } else if (qType === 'SHORT_ANSWER' || qType === 'LONG_ANSWER') {
        const descText = (studentAns.textAnswer || '').trim();
        if (descText.length > 0) {
          answeredCount++;
          // For descriptive answers: if explanation contains keywords or options provide match phrases,
          // check if keywords appear; otherwise marked for instructor review or awarded partial/completion credit
          const keywords = q.options.filter(o => o.isCorrect).map(o => o.text.trim().toLowerCase());
          if (keywords.length > 0) {
            const matches = keywords.filter(kw => descText.toLowerCase().includes(kw));
            if (matches.length === keywords.length) {
              isCorrect = true;
              marksAwarded = q.marks;
              totalScore += marksAwarded;
            } else if (matches.length > 0) {
              marksAwarded = Math.round((matches.length / keywords.length) * q.marks * 10) / 10;
              isCorrect = marksAwarded >= q.marks / 2;
              totalScore += marksAwarded;
            }
          } else {
            // Awaits instructor review; null indicates pending qualitative grading
            isCorrect = null;
          }
        }
      }

      await prisma.studentAnswer.update({
        where: { id: studentAns.id },
        data: { isCorrect, marksAwarded }
      });
    }

    const totalPossibleMarks = attempt.exam.totalMarks || attempt.exam.questions.reduce((sum, q) => sum + q.marks, 0) || 1;
    const percentage = Math.min(100, Math.max(0, (totalScore / totalPossibleMarks) * 100));
    const passed = totalScore >= attempt.exam.passingMarks;

    const submitted = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        score: totalScore,
        percentage,
        passed,
        totalAnswered: answeredCount,
        totalUnanswered: Math.max(0, attempt.exam.questions.length - answeredCount)
      }
    });

    // Dispatch email notification asynchronously (non-blocking)
    if (attempt.student?.email) {
      sendExamResultEmail({
        to: attempt.student.email,
        studentName: attempt.student.name,
        examTitle: attempt.exam.title,
        score: totalScore,
        totalMarks: totalPossibleMarks,
        percentage,
        passed
      }).catch(err => console.error('Failed to trigger email notification:', err));
    }

    res.json({
      message: 'Examination submitted successfully.',
      result: {
        attemptId: submitted.id,
        examTitle: attempt.exam.title,
        subject: attempt.exam.subject,
        submittedAt: submitted.submittedAt,
        totalQuestions: attempt.exam.questions.length,
        totalAnswered: submitted.totalAnswered,
        totalUnanswered: submitted.totalUnanswered,
        allowReview: attempt.exam.allowReview,
        score: attempt.exam.allowReview ? submitted.score : undefined,
        totalMarks: attempt.exam.allowReview ? attempt.exam.totalMarks : undefined,
        percentage: attempt.exam.allowReview ? submitted.percentage : undefined,
        passed: attempt.exam.allowReview ? submitted.passed : undefined
      }
    });
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit examination.' });
  }
};

export const getExamResult = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const attemptId = String(req.params.attemptId);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
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
          include: { selectedOption: true }
        },
        focusLossLogs: true
      }
    });

    if (!attempt || attempt.studentId !== studentId) {
      res.status(404).json({ error: 'Exam result not found.' });
      return;
    }

    if (attempt.status !== 'SUBMITTED') {
      res.status(400).json({ error: 'This examination has not been submitted yet.' });
      return;
    }

    if (!attempt.exam.allowReview) {
      res.json({
        allowReview: false,
        message: 'The administrator has disabled detailed result review for this examination.',
        summary: {
          examTitle: attempt.exam.title,
          subject: attempt.exam.subject,
          submittedAt: attempt.submittedAt,
          totalAnswered: attempt.totalAnswered,
          totalUnanswered: attempt.totalUnanswered
        }
      });
      return;
    }

    // Format full review
    const reviewData = {
      allowReview: true,
      attemptId: attempt.id,
      examTitle: attempt.exam.title,
      subject: attempt.exam.subject,
      score: attempt.score,
      totalMarks: attempt.exam.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passingMarks: attempt.exam.passingMarks,
      startTime: attempt.startTime,
      submittedAt: attempt.submittedAt,
      totalQuestions: attempt.exam.questions.length,
      totalAnswered: attempt.totalAnswered,
      totalUnanswered: attempt.totalUnanswered,
      focusLossCount: attempt.focusLossLogs.length,
      questions: attempt.exam.questions.map((q: any) => {
        const studentAns = attempt.answers.find((a: any) => a.questionId === q.id);
        const correctOption = q.options.find((o: any) => o.isCorrect);
        return {
          id: q.id,
          text: q.text,
          type: q.type,
          marks: q.marks,
          marksAwarded: studentAns?.marksAwarded || 0,
          isCorrect: studentAns?.isCorrect ?? false,
          explanation: q.explanation,
          imageUrl: q.imageUrl,
          selectedOptionId: studentAns?.selectedOptionId || null,
          textAnswer: studentAns?.textAnswer || null,
          correctOptionId: correctOption?.id || null,
          options: q.options.map((o: any) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect
          }))
        };
      })
    };

    res.json(reviewData);
  } catch (error: any) {
    console.error('Error fetching exam result:', error);
    res.status(500).json({ error: 'Failed to retrieve exam results.' });
  }
};
