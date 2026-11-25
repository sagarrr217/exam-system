import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  ImagePlus,
  CheckCircle2,
  X,
  Eye,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { QuestionType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  AIChatAssistantModal,
  GeneratedQuestionDraft,
} from '../../components/admin/AIChatAssistantModal';
import { cn } from '../../components/ui/cn';

interface BuilderOption {
  localId: string;
  text: string;
  isCorrect: boolean;
}

interface BuilderQuestion {
  localId: string;
  type: QuestionType;
  prompt: string;
  explanation: string;
  marks: number;
  negativeMarks: number;
  imageUrl: string;
  options: BuilderOption[];
}

const OPTION_BEARING_TYPES: QuestionType[] = [
  'MCQ',
  'TRUE_FALSE',
  'MULTIPLE_SELECT',
  'FILL_BLANK',
  'NUMERICAL',
];

const TYPE_CATALOG: { type: QuestionType; label: string }[] = [
  { type: 'MCQ', label: 'MCQ' },
  { type: 'MULTIPLE_SELECT', label: 'Multi-Select' },
  { type: 'TRUE_FALSE', label: 'True / False' },
  { type: 'FILL_BLANK', label: 'Fill Blank' },
  { type: 'NUMERICAL', label: 'Numerical' },
  { type: 'SHORT_ANSWER', label: 'Short Answer' },
  { type: 'LONG_ANSWER', label: 'Long Essay' },
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function createDefaultOptions(type: QuestionType): BuilderOption[] {
  if (type === 'TRUE_FALSE') {
    return [
      { localId: uid(), text: 'True', isCorrect: true },
      { localId: uid(), text: 'False', isCorrect: false },
    ];
  }
  if (type === 'FILL_BLANK' || type === 'NUMERICAL') {
    return [{ localId: uid(), text: '', isCorrect: true }];
  }
  if (type === 'SHORT_ANSWER' || type === 'LONG_ANSWER') {
    return [];
  }
  return [
    { localId: uid(), text: 'Option A', isCorrect: true },
    { localId: uid(), text: 'Option B', isCorrect: false },
    { localId: uid(), text: 'Option C', isCorrect: false },
    { localId: uid(), text: 'Option D', isCorrect: false },
  ];
}

function createEmptyQuestion(type: QuestionType = 'MCQ'): BuilderQuestion {
  return {
    localId: uid(),
    type,
    prompt: '',
    explanation: '',
    marks: type === 'LONG_ANSWER' ? 10 : 2,
    negativeMarks: 0,
    imageUrl: '',
    options: createDefaultOptions(type),
  };
}

export const QuestionBuilderPage: React.FC = () => {
  const { id: editingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(Boolean(editingId));
  const [saving, setSaving] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Exam Settings
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [passingMarks, setPassingMarks] = useState(4);
  const [focusLossThreshold, setFocusLossThreshold] = useState(3);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<BuilderQuestion[]>([createEmptyQuestion('MCQ')]);
  const [activeLocalId, setActiveLocalId] = useState<string>('');

  useEffect(() => {
    if (!editingId) return;
    let active = true;

    const loadExam = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminExamById(editingId);
        if (!active) return;
        const ex = res.exam;
        setTitle(ex.title || '');
        setSubject(ex.subject || '');
        setDescription(ex.description || '');
        setDurationMinutes(ex.durationMinutes || 45);
        setPassingMarks(ex.passingMarks || 0);
        setFocusLossThreshold(ex.focusLossThreshold ?? 3);
        setRandomizeOptions(Boolean(ex.randomizeOptions));
        setAutoSubmit(ex.autoSubmit !== false);
        setShowResultsImmediately(ex.allowReview !== false);
        setShuffleQuestions(Boolean(ex.randomizeQuestions));

        const mapped: BuilderQuestion[] = (ex.questions || []).map((q: any) => {
          const mappedOpts = (q.options || []).map((o: any) => ({
            localId: o.id || uid(),
            text: o.text || '',
            isCorrect: Boolean(o.isCorrect),
          }));

          return {
            localId: q.id || uid(),
            type: q.type,
            prompt: q.text || q.prompt || '',
            explanation: q.explanation || '',
            marks: Number(q.marks ?? 2),
            negativeMarks: 0,
            imageUrl: q.imageUrl || '',
            options:
              mappedOpts.length > 0 ? mappedOpts : createDefaultOptions(q.type as QuestionType),
          };
        });

        setQuestions(mapped.length > 0 ? mapped : [createEmptyQuestion('MCQ')]);
      } catch (err: any) {
        toast.error(err?.message || 'Unable to load exam into builder.');
        navigate('/admin/exams');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExam();
    return () => {
      active = false;
    };
  }, [editingId, navigate]);

  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  const updateQuestion = (localId: string, patch: Partial<BuilderQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.localId === localId ? { ...q, ...patch } : q))
    );
  };

  const handleChangeType = (localId: string, nextType: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.localId !== localId) return q;
        return {
          ...q,
          type: nextType,
          options: createDefaultOptions(nextType),
        };
      })
    );
  };

  const handleMoveQuestion = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= questions.length) return;
    const copy = [...questions];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setQuestions(copy);
  };

  const handleDuplicateQuestion = (q: BuilderQuestion, index: number) => {
    const clone: BuilderQuestion = {
      ...q,
      localId: uid(),
      options: q.options.map((o) => ({ ...o, localId: uid() })),
    };
    const copy = [...questions];
    copy.splice(index + 1, 0, clone);
    setQuestions(copy);
  };

  const handleDeleteQuestion = (localId: string) => {
    if (questions.length <= 1) {
      toast.warning('An assessment requires at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.localId !== localId));
  };

  const handleUploadImage = async (localId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      try {
        const res = await api.uploadImage(reader.result);
        updateQuestion(localId, { imageUrl: res.url });
        toast.success('Diagram uploaded');
      } catch (err: any) {
        toast.error(err?.message || 'Image upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImportAI = (imported: GeneratedQuestionDraft[]) => {
    const mapped: BuilderQuestion[] = imported.map((item) => ({
      localId: uid(),
      type: item.type || 'MCQ',
      prompt: item.text || item.prompt || '',
      explanation: item.explanation || '',
      marks: Number(item.marks ?? 2),
      negativeMarks: 0,
      imageUrl: '',
      options:
        item.options && item.options.length > 0
          ? item.options.map((o) => ({
              localId: uid(),
              text: o.text,
              isCorrect: Boolean(o.isCorrect),
            }))
          : createDefaultOptions(item.type || 'MCQ'),
    }));

    setQuestions((prev) => {
      const hasOnlyBlank = prev.length === 1 && !prev[0].prompt.trim();
      return hasOnlyBlank ? mapped : [...prev, ...mapped];
    });
    toast.success(`Imported ${mapped.length} question(s) from AI Studio`);
  };

  const handleSave = async (publishNow: boolean) => {
    if (!title.trim()) {
      toast.error('Please enter an exam title before saving.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        toast.error(`Question ${i + 1} requires a prompt.`);
        return;
      }
      if ((q.type === 'FILL_BLANK' || q.type === 'NUMERICAL') && !q.options[0]?.text?.trim()) {
        toast.error(`Question ${i + 1} (${q.type}) needs an accepted reference answer.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subject: subject.trim() || 'General',
        description: description.trim(),
        durationMinutes: Number(durationMinutes) || 45,
        totalMarks,
        passingMarks: Math.min(Number(passingMarks) || 0, totalMarks),
        focusLossThreshold: Number(focusLossThreshold) || 3,
        allowReview: showResultsImmediately,
        randomizeQuestions: shuffleQuestions,
        randomizeOptions,
        autoSubmit,
        isPublished: publishNow,
        questions: questions.map((q, idx) => ({
          type: q.type,
          text: q.prompt.trim(),
          explanation: q.explanation.trim() || undefined,
          marks: Number(q.marks) || 1,
          isRequired: true,
          imageUrl: q.imageUrl.trim() || undefined,
          orderIndex: idx,
          options: OPTION_BEARING_TYPES.includes(q.type)
            ? q.options.map((o, oi) => ({
                text: o.text.trim(),
                isCorrect: o.isCorrect,
                orderIndex: oi,
              }))
            : [],
        })),
      };

      if (editingId) {
        await api.updateExam(editingId, payload);
        toast.success(publishNow ? 'Exam updated & published live!' : 'Exam changes saved as draft.');
      } else {
        await api.createExam(payload);
        toast.success(publishNow ? 'New exam created & published!' : 'New exam draft saved.');
      }
      navigate('/admin/exams');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to save examination.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-20 w-full rounded-[16px]" />
        <Skeleton className="h-64 w-full rounded-[16px]" />
        <Skeleton className="h-64 w-full rounded-[16px]" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Sticky Builder Action Header */}
      <div className="sticky top-0 lg:top-0 z-[var(--z-sticky)] ui-nav px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/exams')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Exams
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">
                {editingId ? 'Edit Assessment' : 'New Assessment Builder'}
              </h1>
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {questions.length} question{questions.length > 1 ? 's' : ''} · {totalMarks} total marks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="teal"
              size="sm"
              onClick={() => setAiModalOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              AI Question Studio
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={saving}
              onClick={() => handleSave(false)}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={() => handleSave(true)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Publish Live
            </Button>
          </div>
        </div>
      </div>

      {/* Main Builder Canvas */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 1. Exam Settings Card */}
        <section className="ui-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Assessment Configuration</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Configure metadata, timing rules, and automated focus protection thresholds.
              </p>
            </div>
            <Badge variant="brand">Core Settings</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="exam-title" className="block text-sm font-semibold text-[var(--text-primary)]">
                Assessment Title *
              </label>
              <input
                id="exam-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CS-301 Operating Systems Midterm"
                className="w-full min-h-[44px] px-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="exam-subject" className="block text-sm font-semibold text-[var(--text-primary)]">
                Subject / Course Code
              </label>
              <input
                id="exam-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Computer Science"
                className="w-full min-h-[44px] px-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="exam-desc" className="block text-sm font-semibold text-[var(--text-primary)]">
                Description / Instructions
              </label>
              <textarea
                id="exam-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief candidate syllabus notes or instructions..."
                className="w-full p-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div className="space-y-1.5">
                <label htmlFor="exam-dur" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Duration (min)
                </label>
                <input
                  id="exam-dur"
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] font-mono text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exam-pass" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Passing Marks
                </label>
                <input
                  id="exam-pass"
                  type="number"
                  min={0}
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] font-mono text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exam-strikes" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Max Focus Strikes
                </label>
                <input
                  id="exam-strikes"
                  type="number"
                  min={1}
                  value={focusLossThreshold}
                  onChange={(e) => setFocusLossThreshold(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] font-mono text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Auto-Submit on Limit', checked: autoSubmit, set: setAutoSubmit },
              { label: 'Randomize Options', checked: randomizeOptions, set: setRandomizeOptions },
              { label: 'Allow Review', checked: showResultsImmediately, set: setShowResultsImmediately },
              { label: 'Randomize Questions', checked: shuffleQuestions, set: setShuffleQuestions },
            ].map((tog) => (
              <label
                key={tog.label}
                className="min-h-[44px] px-3.5 py-2.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-tray)]/50 flex items-center gap-2.5 cursor-pointer hover:bg-[var(--bg-tray)]"
              >
                <input
                  type="checkbox"
                  checked={tog.checked}
                  onChange={(e) => tog.set(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--accent-primary)]"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">{tog.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 2. Questions Stack */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Questions ({questions.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_CATALOG.map((item) => (
                <Button
                  key={item.type}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const q = createEmptyQuestion(item.type);
                    setQuestions((prev) => [...prev, q]);
                    setActiveLocalId(q.localId);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {questions.map((q, idx) => (
            <article
              key={q.localId}
              onClick={() => setActiveLocalId(q.localId)}
              className={cn(
                'builder-question-card p-6 sm:p-7 space-y-5',
                activeLocalId === q.localId && 'is-active'
              )}
            >
              {/* Question Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="brand">Question {idx + 1}</Badge>
                  <select
                    aria-label={`Question ${idx + 1} format`}
                    value={q.type}
                    onChange={(e) => handleChangeType(q.localId, e.target.value as QuestionType)}
                    className="min-h-[44px] px-3 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    {TYPE_CATALOG.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <label htmlFor={`marks-${q.localId}`} className="text-xs font-semibold text-[var(--text-muted)]">
                      Marks
                    </label>
                    <input
                      id={`marks-${q.localId}`}
                      type="number"
                      min={1}
                      value={q.marks}
                      onChange={(e) => updateQuestion(q.localId, { marks: Number(e.target.value) })}
                      className="w-16 min-h-[44px] px-2.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-canvas)] font-mono text-sm text-[var(--text-primary)] text-center"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveQuestion(idx, -1)}
                    aria-label={`Move question ${idx + 1} up`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tray)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === questions.length - 1}
                    onClick={() => handleMoveQuestion(idx, 1)}
                    aria-label={`Move question ${idx + 1} down`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tray)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(q, idx)}
                    aria-label={`Duplicate question ${idx + 1}`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tray)]"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.localId)}
                    aria-label={`Delete question ${idx + 1}`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] border border-[var(--border-default)] text-[var(--accent-danger)] hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prompt Textarea */}
              <div className="space-y-2">
                <label htmlFor={`prompt-${q.localId}`} className="block text-sm font-semibold text-[var(--text-primary)]">
                  Question Prompt
                </label>
                <textarea
                  id={`prompt-${q.localId}`}
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q.localId, { prompt: e.target.value })}
                  placeholder="Enter clear, unambiguous question text..."
                  className="w-full p-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </div>

              {/* Diagram Upload */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="min-h-[44px] px-3.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-tray)]/50 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 cursor-pointer">
                  <ImagePlus className="w-4 h-4" aria-hidden="true" />
                  <span>{q.imageUrl ? 'Replace Diagram' : 'Attach Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadImage(q.localId, f);
                    }}
                  />
                </label>
                {q.imageUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={q.imageUrl}
                      alt="Question visual"
                      className="h-11 w-16 rounded object-cover border border-[var(--border-default)]"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuestion(q.localId, { imageUrl: '' })}
                      aria-label="Remove question image"
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-danger)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Option Editors */}
              {(q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'MULTIPLE_SELECT') && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {q.type === 'MULTIPLE_SELECT'
                        ? 'Options (Select all correct choices)'
                        : 'Options (Select one correct choice)'}
                    </span>
                    {q.type !== 'TRUE_FALSE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateQuestion(q.localId, {
                            options: [
                              ...q.options,
                              { localId: uid(), text: `Option ${q.options.length + 1}`, isCorrect: false },
                            ],
                          })
                        }
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add Option
                      </Button>
                    )}
                  </div>

                  {q.options.map((opt, oi) => (
                    <div key={opt.localId} className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextOpts = q.options.map((o) => {
                            if (q.type === 'MULTIPLE_SELECT') {
                              return o.localId === opt.localId
                                ? { ...o, isCorrect: !o.isCorrect }
                                : o;
                            }
                            return { ...o, isCorrect: o.localId === opt.localId };
                          });
                          updateQuestion(q.localId, { options: nextOpts });
                        }}
                        aria-label={`Mark option ${oi + 1} as correct`}
                        className={cn(
                          'min-h-[44px] min-w-[44px] rounded-[10px] border inline-flex items-center justify-center shrink-0 transition-colors',
                          opt.isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-[var(--accent-success)] dark:bg-emerald-950/60 dark:border-emerald-700'
                            : 'bg-[var(--bg-tray)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        readOnly={q.type === 'TRUE_FALSE'}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateQuestion(q.localId, {
                            options: q.options.map((o) =>
                              o.localId === opt.localId ? { ...o, text: val } : o
                            ),
                          });
                        }}
                        className="flex-1 min-h-[44px] px-3.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                      />

                      {q.type !== 'TRUE_FALSE' && q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(q.localId, {
                              options: q.options.filter((o) => o.localId !== opt.localId),
                            })
                          }
                          aria-label={`Remove option ${oi + 1}`}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] text-[var(--text-muted)] hover:text-[var(--accent-danger)]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(q.type === 'FILL_BLANK' || q.type === 'NUMERICAL') && (
                <div className="space-y-1.5">
                  <label htmlFor={`ref-${q.localId}`} className="block text-sm font-semibold text-[var(--text-primary)]">
                    Accepted Exact Answer *
                  </label>
                  <input
                    id={`ref-${q.localId}`}
                    type="text"
                    value={q.options[0]?.text || ''}
                    onChange={(e) =>
                      updateQuestion(q.localId, {
                        options: [
                          {
                            localId: q.options[0]?.localId || uid(),
                            text: e.target.value,
                            isCorrect: true,
                          },
                        ],
                      })
                    }
                    placeholder={q.type === 'NUMERICAL' ? 'e.g. 8' : 'e.g. idempotency'}
                    className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] font-mono text-sm text-[var(--text-primary)]"
                  />
                </div>
              )}

              {(q.type === 'SHORT_ANSWER' || q.type === 'LONG_ANSWER') && (
                <div className="p-3.5 rounded-[10px] bg-[var(--bg-tray)]/60 border border-[var(--border-default)] text-xs text-[var(--text-secondary)]">
                  Subjective response item — graded automatically for keywords or flagged for manual review.
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-1.5">
                <label htmlFor={`exp-${q.localId}`} className="block text-xs font-semibold text-[var(--text-muted)]">
                  Grading Explanation (Shown after results release)
                </label>
                <input
                  id={`exp-${q.localId}`}
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(q.localId, { explanation: e.target.value })}
                  placeholder="Optional explanation for candidates..."
                  className="w-full min-h-[44px] px-3.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)]"
                />
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Gemini Multimodal AI Studio Modal */}
      <AIChatAssistantModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        examTitle={title}
        subject={subject}
        onImportQuestions={handleImportAI}
      />
    </div>
  );
};
