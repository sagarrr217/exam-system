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
  HelpCircle,
  Sparkles,
  Lock,
  ChevronDown,
  Upload,
  Loader2,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { QuestionType } from '../../types';
import { AIChatAssistantModal, GeneratedQuestion } from '../../components/admin/AIChatAssistantModal';

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

const OPTION_BEARING_TYPES: QuestionType[] = [
  'MCQ',
  'TRUE_FALSE',
  'MULTIPLE_SELECT',
  'FILL_BLANK',
  'NUMERICAL',
];

export const QuestionBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [showAIModal, setShowAIModal] = useState(false);

  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [focusLossThreshold, setFocusLossThreshold] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [allowReview, setAllowReview] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);

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
        { text: 'Option 4', isCorrect: false, orderIndex: 3 },
      ],
    },
  ]);

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
        toast.success('Diagram image uploaded successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload image.');
      } finally {
        setUploadingImageIndex(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAIModal = () => setShowAIModal(true);

  const handleAddAIQuestion = (q: GeneratedQuestion) => {
    const newQuestion: BuilderQuestion = {
      text: q.text,
      type: (q.type as QuestionType) || 'MCQ',
      marks: q.marks || 10,
      isRequired: true,
      imageUrl: '',
      explanation: q.explanation || '',
      orderIndex: questions.length,
      options: (q.options || []).map((opt, oIdx) => ({
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect),
        orderIndex: oIdx,
      })),
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setActiveQuestionIndex(questions.length);
  };

  const handleAddAllAIQuestions = (aiQuestions: GeneratedQuestion[]) => {
    const formatted = aiQuestions.map((q, idx) => ({
      text: q.text,
      type: (q.type as QuestionType) || 'MCQ',
      marks: q.marks || 10,
      isRequired: true,
      imageUrl: '',
      explanation: q.explanation || '',
      orderIndex: questions.length + idx,
      options: (q.options || []).map((opt, oIdx) => ({
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect),
        orderIndex: oIdx,
      })),
    }));
    setQuestions((prev) => [...prev, ...formatted]);
    setActiveQuestionIndex(questions.length);
  };

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
              orderIndex: oIdx,
            })),
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

  const sumQuestionMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleSyncTotalMarks = () => {
    setTotalMarks(sumQuestionMarks);
    toast.info(`Total marks synced to ${sumQuestionMarks}`);
  };

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
        { text: 'Option 4', isCorrect: false, orderIndex: 3 },
      ],
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
    toast.success('Question added');
  };

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
        orderIndex: oIdx,
      })),
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, cloned);
    setQuestions(updated.map((q, i) => ({ ...q, orderIndex: i })));
    setActiveQuestionIndex(idx + 1);
    toast.success('Question duplicated');
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.warning('An examination must contain at least 1 question.');
      return;
    }
    const updated = questions
      .filter((_, i) => i !== idx)
      .map((q, i) => ({ ...q, orderIndex: i }));
    setQuestions(updated);
    setActiveQuestionIndex(Math.max(0, idx - 1));
    toast.info('Question removed');
  };

  const handleMoveQuestionUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...questions];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setQuestions(updated.map((q, i) => ({ ...q, orderIndex: i })));
    setActiveQuestionIndex(idx - 1);
  };

  const handleMoveQuestionDown = (idx: number) => {
    if (idx === questions.length - 1) return;
    const updated = [...questions];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setQuestions(updated.map((q, i) => ({ ...q, orderIndex: i })));
    setActiveQuestionIndex(idx + 1);
  };

  const handleUpdateQuestion = (idx: number, patch: Partial<BuilderQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        const updatedQ = { ...q, ...patch };

        if (patch.type && patch.type !== q.type) {
          if (patch.type === 'TRUE_FALSE') {
            updatedQ.options = [
              { text: 'True', isCorrect: true, orderIndex: 0 },
              { text: 'False', isCorrect: false, orderIndex: 1 },
            ];
          } else if (patch.type === 'MCQ') {
            if (updatedQ.options.length < 2) {
              updatedQ.options = [
                { text: 'Option 1', isCorrect: true, orderIndex: 0 },
                { text: 'Option 2', isCorrect: false, orderIndex: 1 },
                { text: 'Option 3', isCorrect: false, orderIndex: 2 },
                { text: 'Option 4', isCorrect: false, orderIndex: 3 },
              ];
            } else {
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
                { text: 'Option 4', isCorrect: false, orderIndex: 3 },
              ];
            }
          } else if (patch.type === 'FILL_BLANK') {
            updatedQ.options = [{ text: 'Accepted Answer', isCorrect: true, orderIndex: 0 }];
          } else if (patch.type === 'NUMERICAL') {
            updatedQ.options = [{ text: '0', isCorrect: true, orderIndex: 0 }];
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

  const handleAddOption = (qIdx: number) => {
    const q = questions[qIdx];
    if (q.options.length >= 6) {
      toast.warning('Maximum 6 options allowed per question.');
      return;
    }
    const newOption: BuilderOption = {
      text: `Option ${q.options.length + 1}`,
      isCorrect: false,
      orderIndex: q.options.length,
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
    const filtered = q.options
      .filter((_, i) => i !== oIdx)
      .map((opt, i) => ({ ...opt, orderIndex: i }));
    if (wasCorrect && filtered.length > 0) {
      filtered[0].isCorrect = true;
    }
    handleUpdateQuestion(qIdx, { options: filtered });
  };

  const handleSetCorrectOption = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIdx,
    }));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  const handleToggleCorrectOptionMulti = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) =>
      i === oIdx ? { ...opt, isCorrect: !opt.isCorrect } : opt
    );
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

  const handleUpdateOptionText = (qIdx: number, oIdx: number, text: string) => {
    const q = questions[qIdx];
    const updatedOptions = q.options.map((opt, i) => (i === oIdx ? { ...opt, text } : opt));
    handleUpdateQuestion(qIdx, { options: updatedOptions });
  };

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
      options: OPTION_BEARING_TYPES.includes(q.type)
        ? q.options.map((opt, oIdx) => ({
            text: opt.text.trim(),
            isCorrect: Boolean(opt.isCorrect),
            orderIndex: oIdx,
          }))
        : [],
    })),
  });

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

  const handlePublish = async () => {
    if (!validateForm()) return;
    setPublishing(true);

    try {
      const currentExamId = await handleSave(false);
      if (!currentExamId) {
        setPublishing(false);
        return;
      }

      const res = await api.togglePublish(currentExamId);
      setIsPublished(res.isPublished);
      toast.success(
        res.message || 'Examination published successfully! Candidates can now take this exam.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Publishing validation failed.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-signal)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-[var(--text-secondary)]">Loading question builder...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-6 animate-fade-in">
      {/* Sticky Builder Toolbar */}
      <div className="sticky top-16 z-30 studio-glass p-3.5 sm:p-4 rounded-2xl border border-[var(--border-strong)] shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/exams"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
            title="Back to Exams"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                {isEditing ? 'Exam Editor' : 'Exam Creator'}
              </span>
              {isPublished ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  <Globe className="w-3 h-3" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                  <Lock className="w-3 h-3" />
                  Draft
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-[var(--text-primary)] truncate max-w-sm sm:max-w-md">
              {title.trim() || 'Untitled Examination'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAIModal}
            className="btn-ghost-surface px-3 py-2 text-xs flex items-center gap-1.5 border-[var(--accent-signal)]/30"
            title="Generate questions using Google Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
            <span className="hidden sm:inline">AI Studio</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="btn-ghost-surface px-3.5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            className="btn-signal px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{publishing ? 'Validating...' : isPublished ? 'Re-Publish' : 'Publish Exam'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Examination Settings Card */}
      <div className="studio-card p-6 sm:p-8 space-y-5">
        <div>
          <input
            type="text"
            aria-label="Examination Title"
            placeholder="Examination Title (e.g. CS401: Advanced Data Structures)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] bg-transparent border-b border-transparent hover:border-[var(--border-hairline)] focus:border-[var(--accent-signal)] focus:outline-none transition-colors pb-1"
          />
          <input
            type="text"
            aria-label="Subject or Department"
            placeholder="Subject or Department (e.g. Computer Science & Engineering)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-sm font-medium text-[var(--text-secondary)] placeholder-[var(--text-tertiary)] bg-transparent border-b border-transparent hover:border-[var(--border-hairline)] focus:border-[var(--accent-signal)] focus:outline-none transition-colors mt-2 pb-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] block mb-1.5">
              Description / Overview
            </label>
            <textarea
              rows={2}
              placeholder="Brief course or syllabus overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)] resize-none"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] block mb-1.5">
              Candidate Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Important rules (e.g. No tab switching allowed)..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-sm p-3 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)] resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-hairline)] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
              Duration (mins)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl font-mono text-sm font-bold bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                Total Marks
              </label>
              {sumQuestionMarks !== totalMarks && (
                <button
                  type="button"
                  onClick={handleSyncTotalMarks}
                  className="font-mono text-[10px] text-[var(--accent-signal)] hover:underline font-bold"
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
              className="w-full p-2.5 rounded-xl font-mono text-sm font-bold bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
              Passing Marks
            </label>
            <input
              type="number"
              min={0}
              max={totalMarks}
              value={passingMarks}
              onChange={(e) => setPassingMarks(Math.max(0, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl font-mono text-sm font-bold bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
              Focus-Loss Limit
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={focusLossThreshold}
              onChange={(e) => setFocusLossThreshold(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl font-mono text-sm font-bold bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
              Available From (Optional)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 rounded-xl font-mono text-xs bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
              Available Until (Optional)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 rounded-xl font-mono text-xs bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-hairline)] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            {
              checked: randomizeQuestions,
              onChange: setRandomizeQuestions,
              title: 'Shuffle Questions',
              desc: 'Randomize question order for each candidate',
            },
            {
              checked: randomizeOptions,
              onChange: setRandomizeOptions,
              title: 'Shuffle Options',
              desc: 'Randomize choices for MCQ items',
            },
            {
              checked: allowReview,
              onChange: setAllowReview,
              title: 'Allow Answer Review',
              desc: 'Permit students to view solutions after grading',
            },
            {
              checked: autoSubmit,
              onChange: setAutoSubmit,
              title: 'Auto-Submit on Timer Expiry',
              desc: 'Automatically submit attempt without data loss',
            },
          ].map((toggle, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tray)]/70 border border-[var(--border-hairline)] cursor-pointer hover:border-[var(--border-strong)] transition-colors"
            >
              <input
                type="checkbox"
                checked={toggle.checked}
                onChange={(e) => toggle.onChange(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent-signal)]"
              />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {toggle.title}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">{toggle.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 2: Question Cards */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const isActive = activeQuestionIndex === qIdx;

          return (
            <div
              key={qIdx}
              onClick={() => setActiveQuestionIndex(qIdx)}
              className={`gform-card overflow-hidden ${isActive ? 'is-active' : ''}`}
            >
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[var(--accent-signal)]/15 text-[var(--accent-signal)] font-mono font-bold text-sm flex items-center justify-center">
                      {String(qIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Question {qIdx + 1} of {questions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <select
                        aria-label={`Question ${qIdx + 1} type`}
                        value={q.type}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, { type: e.target.value as QuestionType })
                        }
                        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)]"
                      >
                        <option value="MCQ">Multiple Choice (Single)</option>
                        <option value="MULTIPLE_SELECT">Multiple Select (Checkboxes)</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="FILL_BLANK">Fill in the Blank</option>
                        <option value="NUMERICAL">Numerical Solution</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                        <option value="LONG_ANSWER">Detailed 5-Marker Essay</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-1.5 bg-[var(--bg-tray)] px-2.5 py-1.5 rounded-lg border border-[var(--border-hairline)]">
                      <span className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
                        Marks:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={q.marks}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, { marks: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-12 font-mono text-xs font-bold text-[var(--text-primary)] bg-transparent focus:outline-none text-center"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder={`Enter Question ${qIdx + 1} prompt here...`}
                    value={q.text}
                    onChange={(e) => handleUpdateQuestion(qIdx, { text: e.target.value })}
                    className="w-full text-base sm:text-lg font-medium p-3.5 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none transition-all"
                  />
                </div>

                {/* Image Attachment */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
                        Diagram Attachment (Optional)
                      </span>
                    </div>
                    <label
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        uploadingImageIndex === qIdx
                          ? 'bg-[var(--bg-tray)] text-[var(--text-tertiary)] cursor-not-allowed'
                          : 'bg-[var(--bg-surface)] text-[#0891B2] dark:text-[#22D3EE] border-[#0891B2]/30 hover:bg-[#0891B2]/10'
                      }`}
                    >
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
                    className="w-full font-mono text-xs p-2.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
                  />
                  {q.imageUrl && (
                    <div className="mt-2.5 relative inline-block">
                      <img
                        src={q.imageUrl}
                        alt="Question preview"
                        className="max-h-40 rounded-xl border border-[var(--border-hairline)] object-contain"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQuestion(qIdx, { imageUrl: '' })}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-lg text-xs transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* MCQ & TRUE_FALSE */}
                {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && (
                  <div className="space-y-3 pt-2">
                    <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                      <span>Answer Choices (Select correct option)</span>
                      <span className="text-[var(--text-tertiary)]">{q.options.length} choices</span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            opt.isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/35'
                              : 'bg-[var(--bg-tray)]/50 border-[var(--border-hairline)]'
                          }`}
                        >
                          <label className="cursor-pointer flex items-center gap-2 pl-1">
                            <input
                              type="radio"
                              name={`correct-answer-q-${qIdx}`}
                              checked={opt.isCorrect}
                              onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                              className="w-4 h-4 accent-emerald-600"
                            />
                            {opt.isCorrect && (
                              <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase hidden sm:inline">
                                Correct
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            disabled={q.type === 'TRUE_FALSE'}
                            placeholder={`Choice ${oIdx + 1}...`}
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-[var(--text-primary)] font-medium"
                          />

                          {q.type === 'MCQ' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, oIdx)}
                              disabled={q.options.length <= 2}
                              className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.type === 'MCQ' && q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-signal)] hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                )}

                {/* MULTIPLE_SELECT */}
                {q.type === 'MULTIPLE_SELECT' && (
                  <div className="space-y-3 pt-2">
                    <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                      <span>Multi-Select Choices (Check all correct)</span>
                      <span className="text-[var(--text-tertiary)]">{q.options.length} choices</span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            opt.isCorrect
                              ? 'bg-[#0891B2]/10 border-[#0891B2]/35'
                              : 'bg-[var(--bg-tray)]/50 border-[var(--border-hairline)]'
                          }`}
                        >
                          <label className="cursor-pointer flex items-center gap-2 pl-1">
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={() => handleToggleCorrectOptionMulti(qIdx, oIdx)}
                              className="w-4 h-4 rounded accent-[#0891B2]"
                            />
                            {opt.isCorrect && (
                              <span className="font-mono text-[10px] font-bold text-[#0891B2] dark:text-[#22D3EE] uppercase hidden sm:inline">
                                Correct
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            placeholder={`Option ${oIdx + 1}...`}
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-[var(--text-primary)] font-medium"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            disabled={q.options.length <= 2}
                            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 disabled:opacity-30 transition-colors"
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0891B2] dark:text-[#22D3EE] hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                )}

                {/* FILL_BLANK */}
                {q.type === 'FILL_BLANK' && (
                  <div className="space-y-3 pt-2">
                    <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Accepted Answers (Case-insensitive)
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10"
                        >
                          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 pl-1">
                            Accepted #{oIdx + 1}:
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Mitochondria"
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-[var(--text-primary)] font-medium"
                          />
                          {q.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = q.options.filter((_, i) => i !== oIdx);
                                handleUpdateQuestion(qIdx, { options: filtered });
                              }}
                              className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateQuestion(qIdx, {
                          options: [
                            ...q.options,
                            { text: '', isCorrect: true, orderIndex: q.options.length },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Alternative Answer</span>
                    </button>
                  </div>
                )}

                {/* NUMERICAL */}
                {q.type === 'NUMERICAL' && (
                  <div className="space-y-2.5 pt-2">
                    <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Exact Numerical Solution
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#0891B2]/35 bg-[#0891B2]/10 max-w-md">
                      <span className="font-mono text-xs font-bold text-[#0891B2] dark:text-[#22D3EE]">
                        Target Value:
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 42 or 3.1415"
                        value={q.options[0]?.text || ''}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, {
                            options: [{ text: e.target.value, isCorrect: true, orderIndex: 0 }],
                          })
                        }
                        className="flex-1 text-sm bg-transparent border-0 focus:outline-none font-mono font-bold text-[var(--text-primary)]"
                      />
                    </div>
                    <p className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      Evaluated with floating-point tolerance of ±0.001 during auto-grading.
                    </p>
                  </div>
                )}

                {q.type === 'SHORT_ANSWER' && (
                  <div className="p-4 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
                    <p className="font-bold text-[var(--text-primary)] mb-0.5">
                      Short Answer Question
                    </p>
                    <p>Candidates receive a concise multi-line response box with live counters.</p>
                  </div>
                )}

                {q.type === 'LONG_ANSWER' && (
                  <div className="p-4 rounded-xl bg-[#0891B2]/10 border border-[#0891B2]/25 text-xs text-[var(--text-secondary)]">
                    <p className="font-bold text-[var(--text-primary)] mb-0.5">
                      Detailed 5-Marker Essay / Comprehensive Response
                    </p>
                    <p>Candidates receive an expanded 8-row essay editor with live word counters.</p>
                  </div>
                )}

                {/* Solution Explanation */}
                <div className="pt-2 border-t border-[var(--border-hairline)]">
                  <label className="font-mono text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Solution Explanation (Shown on candidate review if permitted)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Provide solution context, reference citation, or rationale..."
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Card Bottom Bar */}
              <div className="px-6 py-3 bg-[var(--bg-tray)]/60 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 border-r border-[var(--border-hairline)] pr-3">
                    <button
                      type="button"
                      onClick={() => handleMoveQuestionUp(qIdx)}
                      disabled={qIdx === 0}
                      title="Move Question Up"
                      className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestionDown(qIdx)}
                      disabled={qIdx === questions.length - 1}
                      title="Move Question Down"
                      className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => handleUpdateQuestion(qIdx, { isRequired: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[var(--accent-signal)]"
                    />
                    <span>Required</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(qIdx)}
                    title="Duplicate Question"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(qIdx)}
                    disabled={questions.length <= 1}
                    title="Delete Question"
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Action Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 studio-glass px-4 sm:px-5 py-2.5 rounded-2xl shadow-2xl border border-[var(--border-strong)] flex items-center gap-3 sm:gap-4">
        <span className="font-mono text-xs font-bold text-[var(--text-primary)] whitespace-nowrap tabular-nums">
          {questions.length} Qs • {sumQuestionMarks} Marks
        </span>

        <div className="h-4 w-px bg-[var(--border-strong)]" />

        <button
          type="button"
          onClick={handleAddQuestion}
          className="btn-signal px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Question</span>
        </button>

        <button
          type="button"
          onClick={handleOpenAIModal}
          className="btn-ghost-surface px-3 py-1.5 text-xs inline-flex items-center gap-1.5 whitespace-nowrap"
          title="Auto-generate questions with Gemini"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
          <span className="hidden sm:inline">AI Studio</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || publishing}
          className="btn-ghost-surface px-3 py-1.5 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      <AIChatAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        examTitle={title}
        examSubject={subject}
        existingQuestionsCount={questions.length}
        onAddQuestion={handleAddAIQuestion}
        onAddAllQuestions={handleAddAllAIQuestions}
      />
    </div>
  );
};
