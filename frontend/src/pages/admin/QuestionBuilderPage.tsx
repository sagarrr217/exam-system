import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Globe,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Settings2,
  FileText,
  HelpCircle,
  Sparkles,
  Lock,
  Layers,
  ChevronDown,
  Upload,
  Loader2
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { QuestionType } from '../../types';

interface BuilderOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface BuilderQuestion {
  id?: string;
  text: string;
  type: QuestionType;
  marks: number;
  isRequired: boolean;
  imageUrl?: string | null;
  explanation?: string | null;
  options: BuilderOption[];
  orderIndex: number;
}

export const QuestionBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  // Loading & Action states
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const handleFileUpload = async (qIdx: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setUploadingImageIndex(qIdx);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64);
        handleUpdateQuestion(qIdx, { imageUrl: res.url });
        toast.success('Diagram image uploaded successfully to Cloudinary!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload image.');
      } finally {
        setUploadingImageIndex(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Exam Settings State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // AI Question Generator Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleOpenAIModal = () => {
    setAiTopic(subject || title || '');
    setShowAIModal(true);
  };

  const handleGenerateAI = async () => {
    const queryTopic = aiTopic.trim() || subject.trim() || title.trim();
    if (!queryTopic) {
      toast.error('Please enter a topic or subject for question generation.');
      return;
    }

    setGeneratingAI(true);
    try {
      const res = await api.generateAIQuestions(queryTopic, aiCount, aiDifficulty);
      if (res.questions && res.questions.length > 0) {
        const formatted = res.questions.map((q: any, idx: number) => ({
          text: q.text,
          type: q.type || 'MCQ',
          marks: q.marks || 10,
          isRequired: true,
          imageUrl: '',
          explanation: q.explanation || '',
          orderIndex: questions.length + idx,
          options: q.options.map((opt: any, oIdx: number) => ({
            text: opt.text,
            isCorrect: Boolean(opt.isCorrect),
            orderIndex: oIdx
          }))
        }));

        setQuestions(prev => [...prev, ...formatted]);
        toast.success(`Generated ${formatted.length} questions with Gemini AI!`);
        setShowAIModal(false);
        setActiveQuestionIndex(questions.length);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate questions with Gemini AI.');
    } finally {
      setGeneratingAI(false);
    }
  };
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [focusLossThreshold, setFocusLossThreshold] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [allowReview, setAllowReview] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);

  // Questions List State
  const [questions, setQuestions] = useState<BuilderQuestion[]>([
    {
      text: '',
      type: 'MCQ',
      marks: 10,
      isRequired: true,
      imageUrl: '',
      explanation: '',
      orderIndex: 0,
      options: [
        { text: 'Option 1', isCorrect: true, orderIndex: 0 },
        { text: 'Option 2', isCorrect: false, orderIndex: 1 },
        { text: 'Option 3', isCorrect: false, orderIndex: 2 },
        { text: 'Option 4', isCorrect: false, orderIndex: 3 }
      ]
    }
  ]);

  // Load existing exam if in edit mode
  useEffect(() => {
    if (!id) return;

    const loadExam = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminExamById(id);
        const exam = res.exam;
        setTitle(exam.title || '');
        setSubject(exam.subject || '');
        setDescription(exam.description || '');
        setInstructions(exam.instructions || '');
        setDurationMinutes(exam.durationMinutes || 60);
        setTotalMarks(exam.totalMarks || 100);
        setPassingMarks(exam.passingMarks || 40);
        setFocusLossThreshold(exam.focusLossThreshold ?? 3);
        setStartDate(exam.startDate ? exam.startDate.slice(0, 16) : '');
        setEndDate(exam.endDate ? exam.endDate.slice(0, 16) : '');
        setRandomizeQuestions(Boolean(exam.randomizeQuestions));
        setRandomizeOptions(Boolean(exam.randomizeOptions));
        setAllowReview(Boolean(exam.allowReview));
        setAutoSubmit(Boolean(exam.autoSubmit));
        setIsPublished(Boolean(exam.isPublished));

        if (exam.questions && exam.questions.length > 0) {
          const loadedQuestions: BuilderQuestion[] = exam.questions.map((q: any, qIdx: number) => ({
            id: q.id,
            text: q.text || '',
            type: q.type || 'MCQ',
            marks: q.marks || 1,
            isRequired: q.isRequired ?? true,
            imageUrl: q.imageUrl || '',
            explanation: q.explanation || '',
            orderIndex: qIdx,
            options: (q.options || []).map((opt: any, oIdx: number) => ({
              id: opt.id,
              text: opt.text || '',
              isCorrect: Boolean(opt.isCorrect),
              orderIndex: oIdx
            }))
          }));
          setQuestions(loadedQuestions);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load exam details');
        navigate('/admin/exams');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id]);

  // Dynamic sum of question marks
  const sumQuestionMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // Auto-sync total marks with sum of questions if desired
  const handleSyncTotalMarks = () => {
    setTotalMarks(sumQuestionMarks);
    toast.info(`Total marks set to ${sumQuestionMarks}`);
  };

  // Add Question
  const handleAddQuestion = () => {
    const newQ: BuilderQuestion = {
      text: '',
      type: 'MCQ',
      marks: 10,
      isRequired: true,
      imageUrl: '',
      explanation: '',
      orderIndex: questions.length,
      options: [
        { text: 'Option 1', isCorrect: true, orderIndex: 0 },
        { text: 'Option 2', isCorrect: false, orderIndex: 1 },
        { text: 'Option 3', isCorrect: false, orderIndex: 2 },
        { text: 'Option 4', isCorrect: false, orderIndex: 3 }
      ]
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
    toast.success('Question added');
  };

  // Duplicate Question
  const handleDuplicateQuestion = (idx: number) => {
    const target = questions[idx];
    const cloned: BuilderQuestion = {
      ...target,
      id: undefined,
      text: target.text ? `${target.text} (Copy)` : '',
      orderIndex: questions.length,
      options: target.options.map((opt, oIdx) => ({
        ...opt,
        id: undefined,
        orderIndex: oIdx
      }))
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, cloned);
    // re-index order
    const reindexed = updated.map((q, i) => ({ ...q, orderIndex: i }));
    setQuestions(reindexed);
    setActiveQuestionIndex(idx + 1);
    toast.success('Question duplicated');
  };

  // Delete Question
  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.warning('An examination must contain at least 1 question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i }));
    setQuestions(updated);
    setActiveQuestionIndex(Math.max(0, idx - 1));
    toast.info('Question removed');
  };

  // Reorder Question Up
  const handleMoveQuestionUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...questions];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    const reindexed = updated.map((q, i) => ({ ...q, orderIndex: i }));
    setQuestions(reindexed);
    setActiveQuestionIndex(idx - 1);
  };

  // Reorder Question Down
  const handleMoveQuestionDown = (idx: number) => {
    if (idx === questions.length - 1) return;
    const updated = [...questions];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    const reindexed = updated.map((q, i) => ({ ...q, orderIndex: i }));
    setQuestions(reindexed);
    setActiveQuestionIndex(idx + 1);
  };

  // Update Question Field
  const handleUpdateQuestion = (idx: number, patch: Partial<BuilderQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        const updatedQ = { ...q, ...patch };

        // Handle question type conversion presets
        if (patch.type && patch.type !== q.type) {
          if (patch.type === 'TRUE_FALSE') {
            updatedQ.options = [
              { text: 'True', isCorrect: true, orderIndex: 0 },
              { text: 'False', isCorrect: false, orderIndex: 1 }
            ];
          } else if (patch.type === 'MCQ') {
            if (updatedQ.options.length < 2) {
              updatedQ.options = [
                { text: 'Option 1', isCorrect: true, orderIndex: 0 },
                { text: 'Option 2', isCorrect: false, orderIndex: 1 },
                { text: 'Option 3', isCorrect: false, orderIndex: 2 },
                { text: 'Option 4', isCorrect: false, orderIndex: 3 }
              ];
            } else {
              // Ensure single correct answer for MCQ
              let foundFirst = false;
              updatedQ.options = updatedQ.options.map((o) => {
                if (o.isCorrect && !foundFirst) {
                  foundFirst = true;
                  return o;
                }
                return { ...o, isCorrect: false };
              });
              if (!foundFirst && updatedQ.options.length > 0) {
                updatedQ.options[0].isCorrect = true;
              }
            }
          } else if (patch.type === 'MULTIPLE_SELECT') {
            if (updatedQ.options.length < 2) {
              updatedQ.options = [
                { text: 'Option 1', isCorrect: true, orderIndex: 0 },
                { text: 'Option 2', isCorrect: true, orderIndex: 1 },
                { text: 'Option 3', isCorrect: false, orderIndex: 2 },
                { text: 'Option 4', isCorrect: false, orderIndex: 3 }
              ];
            }
          } else if (patch.type === 'FILL_BLANK') {
            updatedQ.options = [
              { text: 'Accepted Answer', isCorrect: true, orderIndex: 0 }
            ];
          } else if (patch.type === 'NUMERICAL') {
            updatedQ.options = [
              { text: '0', isCorrect: true, orderIndex: 0 }
            ];
          } else if (patch.type === 'SHORT_ANSWER') {
            updatedQ.options = [];
          } else if (patch.type === 'LONG_ANSWER') {
            updatedQ.marks = Math.max(5, updatedQ.marks || 5);
            updatedQ.options = [];
          }
        }

        return updatedQ;
      })
    );
  };

  // Option Operations
  const handleAddOption = (qIdx: number) => {
    const q = questions[qIdx];
    if (q.options.length >= 6) {
      toast.warning('Maximum 6 options allowed per question.');
      return;
    }
    const newOption: BuilderOption = {
      text: `Option ${q.options.length + 1}`,
      isCorrect: false,
      orderIndex: q.options.length
    };
    handleUpdateQuestion(qIdx, { options: [...q.options, newOption] });
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx];
    if (q.options.length <= 2) {
      toast.warning('Multiple choice questions require at least 2 options.');
      return;
    }
    const wasCorrect = q.options[oIdx].isCorrect;
    const filtered = q.options.filter((_, i) => i !== oIdx).map((opt, i) => ({ ...opt, orderIndex: i }));
    if (wasCorrect && filtered.length > 0) {
      filtered[0].isCorrect = true; // ensure at least one correct
    }
    handleUpdateQuestion(qIdx, { options: filtered });
  };

  const handleSetCorrectOption = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIdx
    }));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  const handleToggleCorrectOptionMulti = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => (i === oIdx ? { ...opt, isCorrect: !opt.isCorrect } : opt));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  const handleUpdateOptionText = (qIdx: number, oIdx: number, text: string) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => (i === oIdx ? { ...opt, text } : opt));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  // Validation
  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Exam title is required.');
      return false;
    }
    if (!subject.trim()) {
      toast.error('Subject is required.');
      return false;
    }
    if (durationMinutes <= 0) {
      toast.error('Duration must be greater than zero.');
      return false;
    }
    if (passingMarks > totalMarks) {
      toast.error('Passing marks cannot exceed total marks.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} is missing question text.`);
        setActiveQuestionIndex(i);
        return false;
      }
      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'MULTIPLE_SELECT') {
        if (q.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options.`);
          setActiveQuestionIndex(i);
          return false;
        }
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          toast.error(`Question ${i + 1} does not have any designated correct answer.`);
          setActiveQuestionIndex(i);
          return false;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].text.trim()) {
            toast.error(`Question ${i + 1}, Option ${j + 1} cannot be empty.`);
            setActiveQuestionIndex(i);
            return false;
          }
        }
      } else if (q.type === 'FILL_BLANK') {
        if (!q.options.some((o) => o.isCorrect && o.text.trim().length > 0)) {
          toast.error(`Question ${i + 1} (Fill in Blank) requires at least one accepted answer.`);
          setActiveQuestionIndex(i);
          return false;
        }
      } else if (q.type === 'NUMERICAL') {
        if (!q.options.some((o) => o.isCorrect && !isNaN(parseFloat(o.text.trim())))) {
          toast.error(`Question ${i + 1} (Numerical) requires a valid numerical answer.`);
          setActiveQuestionIndex(i);
          return false;
        }
      }
    }

    return true;
  };

  // Build Payload
  const buildPayload = () => ({
    title: title.trim(),
    subject: subject.trim(),
    description: description.trim() || null,
    instructions: instructions.trim() || null,
    durationMinutes: Number(durationMinutes),
    totalMarks: Number(totalMarks),
    passingMarks: Number(passingMarks),
    focusLossThreshold: Number(focusLossThreshold),
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    randomizeQuestions,
    randomizeOptions,
    allowReview,
    autoSubmit,
    questions: questions.map((q, qIdx) => ({
      text: q.text.trim(),
      type: q.type,
      orderIndex: qIdx,
      marks: Number(q.marks || 1),
      isRequired: Boolean(q.isRequired),
      imageUrl: q.imageUrl ? q.imageUrl.trim() : null,
      explanation: q.explanation ? q.explanation.trim() : null,
      options: (q.type === 'MCQ' || q.type === 'TRUE_FALSE')
        ? q.options.map((opt, oIdx) => ({
          text: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
          orderIndex: oIdx
        }))
        : []
    }))
  });

  // Save Draft
  const handleSave = async (showSuccessToast = true): Promise<string | null> => {
    if (!validateForm()) return null;
    setSaving(true);

    try {
      const payload = buildPayload();
      let savedId = id;

      if (isEditing && id) {
        const res = await api.updateExam(id, payload);
        if (showSuccessToast) toast.success('Examination draft updated successfully');
        savedId = res.exam.id;
      } else {
        const res = await api.createExam(payload);
        if (showSuccessToast) toast.success('Examination created successfully');
        savedId = res.exam.id;
        navigate(`/admin/builder/${savedId}`, { replace: true });
      }

      return savedId || null;
    } catch (err: any) {
      toast.error(err.message || 'Failed to save examination');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Publish Exam
  const handlePublish = async () => {
    if (!validateForm()) return;
    setPublishing(true);

    try {
      // First save latest changes
      const currentExamId = await handleSave(false);
      if (!currentExamId) {
        setPublishing(false);
        return;
      }

      // Then toggle publish
      const res = await api.togglePublish(currentExamId);
      setIsPublished(res.isPublished);
      toast.success(res.message || 'Examination published successfully! Candidates can now take this exam.');
    } catch (err: any) {
      toast.error(err.message || 'Publishing validation failed.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">Loading question builder...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-6 animate-fade-in">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/exams"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Exams"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isEditing ? 'Exam Editor' : 'Exam Creator'}
              </span>
              {isPublished ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <Globe className="w-3 h-3" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  <Lock className="w-3 h-3" />
                  Draft
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
              {title.trim() || 'Untitled Examination'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAIModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-sm transition-all hover:shadow"
            title="Generate questions using Google Gemini AI"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">AI Generate</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:shadow disabled:opacity-50"
          >
            <Globe className="w-4 h-4" />
            <span>{publishing ? 'Validating...' : isPublished ? 'Re-Publish' : 'Publish Exam'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Google Forms Header Card (Settings & Metadata) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-t-8 border-t-blue-600 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <input
            type="text"
            placeholder="Examination Title (e.g. CS401: Advanced Data Structures)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:outline-none transition-colors pb-1"
          />
          <input
            type="text"
            placeholder="Subject or Department (e.g. Computer Science & Engineering)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-sm font-medium text-slate-600 dark:text-slate-400 placeholder-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:outline-none transition-colors mt-2 pb-1"
          />
        </div>

        {/* Description & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Description / Overview
            </label>
            <textarea
              rows={2}
              placeholder="Brief course or syllabus overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Candidate Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Important rules (e.g. No tab switching allowed)..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>
        </div>

        {/* Numeric Configuration Grid */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Total Marks
              </label>
              {sumQuestionMarks !== totalMarks && (
                <button
                  type="button"
                  onClick={handleSyncTotalMarks}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  Sync ({sumQuestionMarks})
                </button>
              )}
            </div>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Passing Marks
            </label>
            <input
              type="number"
              min={0}
              max={totalMarks}
              value={passingMarks}
              onChange={(e) => setPassingMarks(Math.max(0, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Focus-Loss Limit
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={focusLossThreshold}
              onChange={(e) => setFocusLossThreshold(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Schedule Availability Windows */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Available From (Optional)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Available Until (Optional)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Exam Configuration Toggles */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={randomizeQuestions}
              onChange={(e) => setRandomizeQuestions(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Shuffle Questions
              </span>
              <span className="text-[11px] text-slate-500">
                Randomize question presentation order for each student
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={randomizeOptions}
              onChange={(e) => setRandomizeOptions(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Shuffle Options
              </span>
              <span className="text-[11px] text-slate-500">
                Randomize choice choices for multiple choice questions
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={allowReview}
              onChange={(e) => setAllowReview(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Allow Answer Review
              </span>
              <span className="text-[11px] text-slate-500">
                Permit students to see correct answers post-submission
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={autoSubmit}
              onChange={(e) => setAutoSubmit(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Auto-Submit on Timer Expiry
              </span>
              <span className="text-[11px] text-slate-500">
                Automatically submit candidate attempt without data loss
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* SECTION 2: Questions Cards List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isActive = activeQuestionIndex === qIdx;

          return (
            <div
              key={qIdx}
              onClick={() => setActiveQuestionIndex(qIdx)}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isActive
                ? 'bg-white dark:bg-slate-900 border-l-8 border-l-blue-600 border-slate-300 dark:border-slate-700 shadow-lg'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              {/* Question Card Content */}
              <div className="p-6 sm:p-7 space-y-5">
                {/* Top Row: Question Number, Prompt & Type Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-extrabold text-sm flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question {qIdx + 1} of {questions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Question Type Selector */}
                    <div className="relative">
                      <select
                        value={q.type}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, { type: e.target.value as QuestionType })
                        }
                        className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="MCQ">Multiple Choice (Single)</option>
                        <option value="MULTIPLE_SELECT">Multiple Select (Checkboxes)</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="FILL_BLANK">Fill in the Blank</option>
                        <option value="NUMERICAL">Numerical Solution</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                        <option value="LONG_ANSWER">Detailed 5-Marker Essay</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Marks Input */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-500">Marks:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={q.marks}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, { marks: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-12 text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Question Text Area */}
                <div>
                  <textarea
                    rows={2}
                    placeholder={`Enter Question ${qIdx + 1} prompt here...`}
                    value={q.text}
                    onChange={(e) => handleUpdateQuestion(qIdx, { text: e.target.value })}
                    className="w-full text-base sm:text-lg font-medium p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none transition-all"
                  />
                </div>

                {/* Optional Image URL Input & Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">Image Diagram Attachment (Optional)</span>
                    </div>
                    <label className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${uploadingImageIndex === qIdx
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}>
                      {uploadingImageIndex === qIdx ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span>Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImageIndex === qIdx}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(qIdx, file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://example.com/diagram.png or upload above"
                    value={q.imageUrl || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, { imageUrl: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  />
                  {q.imageUrl && (
                    <div className="mt-2.5 relative inline-block group">
                      <img
                        src={q.imageUrl}
                        alt="Question preview"
                        className="max-h-40 rounded-xl border border-slate-200 dark:border-slate-700 object-contain shadow-sm"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQuestion(qIdx, { imageUrl: '' })}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg text-xs transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 1. MCQ Single Select & TRUE_FALSE Options */}
                {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Answer Choices (Select radio to set single correct answer)</span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {q.options.length} {q.options.length === 1 ? 'choice' : 'choices'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${opt.isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          {/* Radio Button for Correct Answer */}
                          <label className="cursor-pointer flex items-center gap-2 pl-1" title="Mark as correct answer">
                            <input
                              type="radio"
                              name={`correct-answer-q-${qIdx}`}
                              checked={opt.isCorrect}
                              onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            {opt.isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider hidden sm:inline">
                                Correct
                              </span>
                            )}
                          </label>

                          {/* Option Text Input */}
                          <input
                            type="text"
                            disabled={q.type === 'TRUE_FALSE'}
                            placeholder={`Choice ${oIdx + 1}...`}
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white font-medium"
                          />

                          {/* Remove Option Button (MCQ only) */}
                          {q.type === 'MCQ' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, oIdx)}
                              disabled={q.options.length <= 2}
                              title={q.options.length <= 2 ? 'Minimum 2 options required' : 'Remove choice'}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Option Button (MCQ only) */}
                    {q.type === 'MCQ' && q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. MULTIPLE_SELECT Options (Checkboxes) */}
                {q.type === 'MULTIPLE_SELECT' && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Multi-Select Choices (Check all options that are correct)</span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {q.options.length} {q.options.length === 1 ? 'choice' : 'choices'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${opt.isCorrect
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          <label className="cursor-pointer flex items-center gap-2 pl-1" title="Toggle correct answer">
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={() => handleToggleCorrectOptionMulti(qIdx, oIdx)}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300"
                            />
                            {opt.isCorrect && (
                              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider hidden sm:inline">
                                Correct
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            placeholder={`Option ${oIdx + 1}...`}
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white font-medium"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            disabled={q.options.length <= 2}
                            title={q.options.length <= 2 ? 'Minimum 2 options required' : 'Remove choice'}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 3. FILL_BLANK Accepted Answers */}
                {q.type === 'FILL_BLANK' && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Accepted Answers for Fill in the Blank (Case-insensitive)</span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {q.options.length} acceptable value{q.options.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 pl-1">
                            Accepted #{oIdx + 1}:
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Mitochondria"
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white font-medium"
                          />
                          {q.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = q.options.filter((_, i) => i !== oIdx);
                                handleUpdateQuestion(qIdx, { options: filtered });
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newOption: BuilderOption = {
                          text: '',
                          isCorrect: true,
                          orderIndex: q.options.length
                        };
                        handleUpdateQuestion(qIdx, { options: [...q.options, newOption] });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Alternative Spelling / Answer</span>
                    </button>
                  </div>
                )}

                {/* 4. NUMERICAL Expected Solution */}
                {q.type === 'NUMERICAL' && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Exact Numerical Solution</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 max-w-md">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        Target Value:
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 42 or 3.1415"
                        value={q.options[0]?.text || ''}
                        onChange={(e) => {
                          const updated = [
                            { text: e.target.value, isCorrect: true, orderIndex: 0 }
                          ];
                          handleUpdateQuestion(qIdx, { options: updated });
                        }}
                        className="flex-1 text-sm bg-transparent border-0 focus:outline-none font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Evaluated with floating-point tolerance of ±0.001 during auto-grading.
                    </p>
                  </div>
                )}

                {/* 5. Short Answer Info */}
                {q.type === 'SHORT_ANSWER' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Short Answer Question (1 - 2 Marks)
                    </p>
                    <p>
                      Candidates will be presented with a concise multi-line response textarea during the examination.
                    </p>
                  </div>
                )}

                {/* 6. Long / Detailed 5-Marker Essay Info */}
                {q.type === 'LONG_ANSWER' && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-indigo-900 dark:text-indigo-100">
                        Detailed 5-Marker Essay / Comprehensive Response
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px] font-extrabold">
                        5 Marks Default
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Candidates will be provided with an expanded 10-line response textarea with live word and character counters.
                    </p>
                  </div>
                )}

                {/* Explanation Input (Visible in Review) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Solution Explanation (Shown to students upon review if permitted)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Provide solution context, reference citation, or rationale..."
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Bottom Card Action Bar */}
              <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-3">
                    <button
                      type="button"
                      onClick={() => handleMoveQuestionUp(qIdx)}
                      disabled={qIdx === 0}
                      title="Move Question Up"
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestionDown(qIdx)}
                      disabled={qIdx === questions.length - 1}
                      title="Move Question Down"
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Required Switch */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => handleUpdateQuestion(qIdx, { isRequired: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Required</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Duplicate Question */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(qIdx)}
                    title="Duplicate Question"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Delete Question */}
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(qIdx)}
                    disabled={questions.length <= 1}
                    title="Delete Question"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Add Bar (Google Forms Style) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-white flex items-center gap-4">
        <span className="text-xs font-bold text-slate-300">
          {questions.length} Question{questions.length === 1 ? '' : 's'} • {sumQuestionMarks} Marks
        </span>

        <div className="h-4 w-px bg-slate-700"></div>

        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>

        <button
          type="button"
          onClick={handleOpenAIModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
          title="Auto-generate questions with Gemini"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Generate</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || publishing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      {/* AI Question Generator Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">AI Question Generator</h3>
              </div>
              <p className="text-xs text-indigo-200">
                Powered by Google Gemini 3.5. Automatically draft academically sound MCQs with options and answer keys.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Subject or Topic *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binary Search Trees, Computer Networks, SQL Joins..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Question Count
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={1}>1 Question</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as any)}
                    className="w-full text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  disabled={generatingAI}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-md transition-all disabled:opacity-50"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Generate & Append</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
