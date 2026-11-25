import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  ImagePlus,
  X,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { api } from '../../api/client';
import { QuestionType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../ui/cn';

export interface GeneratedQuestionDraft {
  type: QuestionType;
  text: string;
  prompt?: string;
  explanation?: string;
  marks: number;
  options?: { text: string; isCorrect: boolean }[];
}

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imagePreview?: string;
  questions?: GeneratedQuestionDraft[];
  isError?: boolean;
}

interface AIChatAssistantModalProps {
  open: boolean;
  onClose: () => void;
  examTitle?: string;
  subject?: string;
  onImportQuestions: (questions: GeneratedQuestionDraft[]) => void;
}

function cleanDisplayText(raw: string): string {
  return raw
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .trim();
}

function buildLocalFallbackQuestions(
  topic: string,
  count: number,
  qType: string
): GeneratedQuestionDraft[] {
  const safeTopic = topic.trim() || 'Core Systems Concepts';
  const result: GeneratedQuestionDraft[] = [];

  for (let i = 0; i < count; i++) {
    const type: QuestionType =
      qType === 'MIXED'
        ? i % 3 === 0
          ? 'MCQ'
          : i % 3 === 1
          ? 'TRUE_FALSE'
          : 'NUMERICAL'
        : (qType as QuestionType);

    if (type === 'TRUE_FALSE') {
      result.push({
        type: 'TRUE_FALSE',
        text: `Statement ${i + 1}: In ${safeTopic}, state isolation and integrity checks reduce systemic faults.`,
        marks: 2,
        explanation: `Understanding isolation principles in ${safeTopic} prevents subtle consistency bugs.`,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
      });
    } else if (type === 'NUMERICAL' || type === 'FILL_BLANK') {
      result.push({
        type,
        text:
          type === 'NUMERICAL'
            ? `Numerical Exercise ${i + 1} (${safeTopic}): What is the minimal quorum threshold when N = 3 nodes?`
            : `Fill in the blank (${safeTopic}): An immutable log ensures operations remain ________.`,
        marks: 3,
        explanation: `Derived from foundational definitions within ${safeTopic}.`,
        options: [{ text: type === 'NUMERICAL' ? '2' : 'auditable', isCorrect: true }],
      });
    } else if (type === 'SHORT_ANSWER' || type === 'LONG_ANSWER') {
      result.push({
        type,
        text: `Explain a key architectural tradeoff in ${safeTopic} (Prompt ${i + 1}).`,
        marks: type === 'LONG_ANSWER' ? 10 : 4,
        explanation: 'Evaluated based on clarity, correctness, and edge-case reasoning.',
        options: [],
      });
    } else {
      result.push({
        type: type === 'MULTIPLE_SELECT' ? 'MULTIPLE_SELECT' : 'MCQ',
        text: `Which principle is essential when designing reliable components in ${safeTopic}? (Item ${i + 1})`,
        marks: 2,
        explanation: `Strict validation and bounded invariants form the core of ${safeTopic}.`,
        options: [
          { text: 'Deterministic validation & clear failure boundaries', isCorrect: true },
          { text: 'Skipping authentication checks under load', isCorrect: false },
          { text: 'Ignoring state synchronization guarantees', isCorrect: false },
          { text: 'Silently swallowing runtime exceptions', isCorrect: false },
        ],
      });
    }
  }
  return result;
}

export const AIChatAssistantModal: React.FC<AIChatAssistantModalProps> = ({
  open,
  onClose,
  examTitle = '',
  subject = '',
  onImportQuestions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState(3);
  const [questionType, setQuestionType] = useState<'MIXED' | QuestionType>('MIXED');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Describe a syllabus topic, paste lecture notes, or attach a diagram image. I will synthesize structured exam questions ready for one-click import.',
    },
  ]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed && !imageBase64) return;

    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed || 'Generate questions based on the attached image.',
      imagePreview: imageBase64 || undefined,
    };

    const nextHistory = [...turns, userTurn];
    setTurns(nextHistory);
    setPrompt('');
    setGenerating(true);

    try {
      const apiMessages = turns
        .filter((t) => t.id !== 'welcome')
        .map((t) => ({
          role: t.role === 'user' ? ('user' as const) : ('model' as const),
          text: t.text,
        }));

      let filePayload: { filename: string; mimeType: string; base64Data: string } | undefined;
      if (imageBase64) {
        const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
        filePayload = {
          filename: 'attachment.png',
          mimeType: match ? match[1] : 'image/png',
          base64Data: match ? match[2] : imageBase64,
        };
      }

      const fullPrompt = `${trimmed || 'Generate questions based on attached image.'} (Target: ${questionCount} questions, Format: ${questionType}, Difficulty: ${difficulty})`;

      const res = await api.chatAIQuestions({
        prompt: fullPrompt,
        history: apiMessages,
        file: filePayload,
        examContext: { title: examTitle, subject },
      });

      setImageBase64(null);

      const generated = Array.isArray(res.questions) ? res.questions : [];
      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text:
            res.reply ||
            (generated.length > 0
              ? `Synthesized ${generated.length} ${difficulty.toLowerCase()} question(s). Review below and click Import.`
              : 'Response received.'),
          questions: generated,
        },
      ]);
    } catch (err: any) {
      const fallback = buildLocalFallbackQuestions(trimmed || subject || 'Exam Topic', questionCount, questionType);
      setImageBase64(null);
      setTurns((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          text: `${err?.message || 'Live AI service unavailable.'} Generated ${fallback.length} structured template question(s) offline so you can continue authoring without interruption.`,
          questions: fallback,
          isError: true,
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !generating && onClose()}
      maxWidthClass="max-w-3xl"
      titleId="ai-studio-modal-title"
      headerBadge={
        <Badge variant="brand" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Gemini Multimodal AI Studio
        </Badge>
      }
      title="AI Question Synthesis Assistant"
      subtitle={`Target Assessment: ${examTitle || 'New Exam'} (${subject || 'General'})`}
    >
      <div className="space-y-4">
        {/* Generation Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
          <div>
            <label htmlFor="ai-count" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Questions
            </label>
            <select
              id="ai-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full min-h-[44px] px-3 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)]"
            >
              {[1, 2, 3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ai-type" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Question Format
            </label>
            <select
              id="ai-type"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as any)}
              className="w-full min-h-[44px] px-3 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)]"
            >
              <option value="MIXED">Mixed Formats</option>
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="MULTIPLE_SELECT">Multiple Select</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="FILL_BLANK">Fill in the Blank</option>
              <option value="NUMERICAL">Numerical Value</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="LONG_ANSWER">Long Answer</option>
            </select>
          </div>

          <div>
            <label htmlFor="ai-diff" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Difficulty
            </label>
            <select
              id="ai-diff"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full min-h-[44px] px-3 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)]"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Conversation Feed */}
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={cn(
                'p-4 rounded-[14px] border text-sm space-y-3',
                turn.role === 'user'
                  ? 'ml-6 bg-blue-50/70 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/80'
                  : 'mr-4 bg-[var(--bg-canvas)] border-[var(--border-default)]'
              )}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {turn.role === 'assistant' ? (
                  <>
                    <Bot className="w-4 h-4 text-[var(--accent-primary)]" aria-hidden="true" />
                    <span>Gemini Studio</span>
                  </>
                ) : (
                  <span>You</span>
                )}
              </div>

              {turn.imagePreview && (
                <img
                  src={turn.imagePreview}
                  alt="Uploaded syllabus attachment"
                  className="max-h-40 rounded-[8px] border border-[var(--border-default)]"
                />
              )}

              <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {cleanDisplayText(turn.text)}
              </p>

              {turn.isError && (
                <div className="flex items-center gap-2 text-xs text-[var(--accent-warning)] font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Offline fallback draft used</span>
                </div>
              )}

              {turn.questions && turn.questions.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[var(--border-default)]">
                  {turn.questions.map((q, qi) => (
                    <div
                      key={qi}
                      className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="neutral">{q.type}</Badge>
                        <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">
                          +{q.marks} marks
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {cleanDisplayText(q.text || q.prompt || '')}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <ul className="text-xs text-[var(--text-secondary)] space-y-0.5 pl-1">
                          {q.options.map((o, oi) => (
                            <li key={oi} className="flex items-center gap-1.5">
                              {o.isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-success)] shrink-0" aria-hidden="true" />
                              )}
                              <span>{o.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="teal"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      onImportQuestions(turn.questions!);
                      onClose();
                    }}
                    leftIcon={<PlusCircle className="w-4 h-4" />}
                  >
                    Import {turn.questions.length} Question{turn.questions.length > 1 ? 's' : ''} into Exam
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Attached Image Preview */}
        {imageBase64 && (
          <div className="flex items-center gap-3 p-2.5 rounded-[10px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
            <img src={imageBase64} alt="Attachment preview" className="w-12 h-12 rounded object-cover" />
            <span className="text-xs font-medium text-[var(--text-secondary)] flex-1">
              Image attached for multimodal analysis
            </span>
            <button
              type="button"
              onClick={() => setImageBase64(null)}
              aria-label="Remove attached image"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-danger)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Composer Form */}
        <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={generating}
            leftIcon={<ImagePlus className="w-4 h-4" />}
            aria-label="Attach diagram or question image"
          >
            Image
          </Button>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create 3 OS scheduling questions covering round-robin and deadlocks"
            aria-label="AI question generation prompt"
            className="flex-1 min-h-[44px] px-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={generating}
            disabled={!prompt.trim() && !imageBase64}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Generate
          </Button>
        </form>
      </div>
    </Modal>
  );
};
