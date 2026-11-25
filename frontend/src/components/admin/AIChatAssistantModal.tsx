import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  FileText,
  Image as ImageIcon,
  Plus,
  Check,
  CheckCircle2,
  HelpCircle,
  FileUp,
  Bot,
  Layers,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export interface GeneratedOption {
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface GeneratedQuestion {
  text: string;
  type: string;
  marks: number;
  explanation: string;
  options: GeneratedOption[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isNetworkError?: boolean;
  fileAttachment?: {
    filename: string;
    mimeType: string;
    sizeKb: number;
  };
  questions?: GeneratedQuestion[];
}

const OFFLINE_FALLBACK_QUESTIONS: GeneratedQuestion[] = [
  {
    text: 'Which algorithm guarantees shortest paths from a single source in graphs that may contain negative edge weights (without negative cycles)?',
    type: 'MCQ',
    marks: 10,
    explanation: 'Bellman-Ford relaxes all edges |V|-1 times, correctly handling negative edge weights where Dijkstra fails.',
    options: [
      { text: 'Dijkstra’s Algorithm', isCorrect: false, orderIndex: 0 },
      { text: 'Bellman-Ford Algorithm', isCorrect: true, orderIndex: 1 },
      { text: 'Breadth-First Search', isCorrect: false, orderIndex: 2 },
      { text: 'Prim’s Minimum Spanning Tree', isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    text: 'Select all true statements regarding Role-Based Access Control (RBAC) with signed JWT tokens.',
    type: 'MULTIPLE_SELECT',
    marks: 10,
    explanation: 'Signed JWTs carry claims verified server-side per request; endpoints must enforce role authorization independently of client UI.',
    options: [
      { text: 'Server middleware must verify role claims on every protected route', isCorrect: true, orderIndex: 0 },
      { text: 'Client-side hiding of buttons alone is sufficient security', isCorrect: false, orderIndex: 1 },
      { text: 'Answer keys must be redacted from active student attempt payloads', isCorrect: true, orderIndex: 2 },
      { text: 'Passwords should be hashed using bcrypt before database storage', isCorrect: true, orderIndex: 3 },
    ],
  },
  {
    text: 'In relational databases, wrapping multi-step updates inside a transaction preserves atomicity if an intermediate step fails.',
    type: 'TRUE_FALSE',
    marks: 5,
    explanation: 'ACID transactions roll back all partial writes if any operation within the transaction fails.',
    options: [
      { text: 'True', isCorrect: true, orderIndex: 0 },
      { text: 'False', isCorrect: false, orderIndex: 1 },
    ],
  },
];

interface AIChatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  examSubject: string;
  existingQuestionsCount: number;
  onAddQuestion: (question: GeneratedQuestion) => void;
  onAddAllQuestions: (questions: GeneratedQuestion[]) => void;
}

export const AIChatAssistantModal: React.FC<AIChatAssistantModalProps> = ({
  isOpen,
  onClose,
  examTitle,
  examSubject,
  existingQuestionsCount,
  onAddQuestion,
  onAddAllQuestions,
}) => {
  const toast = useToast();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your Gemini Multimodal Question Studio Assistant. Ask me to generate questions on any topic, tailor difficulty, or attach a syllabus PDF / textbook diagram to extract structured exam questions automatically.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    file: File;
    filename: string;
    mimeType: string;
    base64Data: string;
    sizeKb: number;
    previewUrl?: string;
  } | null>(null);

  const [addedQuestionKeys, setAddedQuestionKeys] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds the 15MB limit. Please attach a smaller PDF or image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedFile({
        file,
        filename: file.name,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        base64Data: result,
        sizeKb: Math.round(file.size / 1024),
        previewUrl: file.type.startsWith('image/') ? result : undefined,
      });
      toast.success(`Attached: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file. Please try another file.');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = () => setAttachedFile(null);

  const handleSendMessage = async (promptOverride?: string) => {
    const promptToSend = (promptOverride || inputValue).trim();
    if (!promptToSend && !attachedFile) {
      toast.error('Please enter an instruction or attach a document/image.');
      return;
    }

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: promptToSend || `Generate questions from the attached ${attachedFile?.filename}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttachment: attachedFile
        ? {
            filename: attachedFile.filename,
            mimeType: attachedFile.mimeType,
            sizeKb: attachedFile.sizeKb,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const filePayload = attachedFile
      ? {
          filename: attachedFile.filename,
          mimeType: attachedFile.mimeType,
          base64Data: attachedFile.base64Data,
        }
      : undefined;

    setAttachedFile(null);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await api.chatAIQuestions({
        prompt: promptToSend,
        history: historyPayload,
        file: filePayload,
        examContext: {
          title: examTitle,
          subject: examSubject,
          existingQuestionCount: existingQuestionsCount,
        },
      });

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res.reply || 'Here are the generated questions based on your request:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        questions: res.questions || [],
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (res.questions && res.questions.length > 0) {
        toast.success(`Generated ${res.questions.length} questions!`);
      }
    } catch (err: any) {
      const rawMsg = err?.message || 'Unable to connect to Gemini AI.';
      const isNetworkOrOutage =
        /fetch failed|ENOTFOUND|OFFLINE|ECONNREFUSED|ETIMEDOUT|Unable to reach|503|429|404|UNAVAILABLE|high demand|not configured/i.test(
          rawMsg
        );
      toast.error(rawMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          isNetworkError: isNetworkOrOutage,
          text: `${rawMsg}\n\nYou can retry in a moment, or load local sample templates below to continue authoring your exam immediately.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingleQuestion = (question: GeneratedQuestion, msgId: string, qIdx: number) => {
    const key = `${msgId}-${qIdx}`;
    onAddQuestion(question);
    setAddedQuestionKeys((prev) => new Set(prev).add(key));
    toast.success(`Added question: "${question.text.slice(0, 30)}..."`);
  };

  const handleAddAllFromMessage = (questions: GeneratedQuestion[], msgId: string) => {
    onAddAllQuestions(questions);
    setAddedQuestionKeys((prev) => {
      const next = new Set(prev);
      questions.forEach((_, idx) => next.add(`${msgId}-${idx}`));
      return next;
    });
    toast.success(`Added all ${questions.length} questions to the exam!`);
  };

  const quickPrompts = [
    'Generate 3 conceptual MCQ questions with 4 options and explanations',
    'Create 2 hard multiple-select questions with scenarios',
    'Generate 2 True/False questions testing common misconceptions',
    'Extract questions from the uploaded PDF/image file',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-lg animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col w-full max-w-4xl h-[90vh] max-h-[850px] studio-card border border-[var(--border-strong)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-tray)]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-signal)] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  AI Question Studio
                </h2>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#0891B2]/25">
                  Gemini Multimodal
                </span>
              </div>
              <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                Context: {examSubject || examTitle || 'General Exam'} • {existingQuestionsCount} in draft
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close AI Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[var(--bg-canvas)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-tertiary)] px-1">
                {msg.role === 'user' ? (
                  <span>YOU • {msg.timestamp}</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                    GEMINI STUDIO • {msg.timestamp}
                  </span>
                )}
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-signal)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)]'
                }`}
              >
                {msg.fileAttachment && (
                  <div className="mb-3 p-2.5 rounded-xl bg-black/15 border border-white/20 flex items-center gap-3 text-xs">
                    {msg.fileAttachment.mimeType === 'application/pdf' ? (
                      <FileText className="w-5 h-5 text-amber-200 shrink-0" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-200 shrink-0" />
                    )}
                    <div className="truncate flex-1">
                      <p className="font-medium truncate">{msg.fileAttachment.filename}</p>
                      <p className="font-mono opacity-75 text-[10px]">{msg.fileAttachment.sizeKb} KB</p>
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {msg.isNetworkError && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `offline-${Date.now()}`,
                            role: 'model',
                            text: 'Loaded 3 local offline sample questions (non-AI template). You can preview, customize, or add them directly to your exam:',
                            timestamp: new Date().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                            questions: OFFLINE_FALLBACK_QUESTIONS,
                          },
                        ]);
                      }}
                      className="btn-ghost-surface px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                      <span>Load Offline Sample Templates (3 Qs)</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.questions && msg.questions.length > 0 && (
                <div className="w-full max-w-[95%] sm:max-w-[90%] space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                      <span>{msg.questions.length} Generated Question(s)</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddAllFromMessage(msg.questions!, msg.id)}
                      className="btn-signal px-3.5 py-1.5 text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add All to Exam</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {msg.questions.map((q, qIdx) => {
                      const isAdded = addedQuestionKeys.has(`${msg.id}-${qIdx}`);
                      return (
                        <div
                          key={qIdx}
                          className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2 font-mono">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0891B2]/10 text-[#0891B2] dark:text-[#22D3EE]">
                                  {q.type}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--bg-tray)] text-[var(--text-secondary)]">
                                  {q.marks} Marks
                                </span>
                              </div>

                              <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {qIdx + 1}. {q.text}
                              </p>

                              {q.options && q.options.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                                        opt.isCorrect
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                                          : 'bg-[var(--bg-tray)]/50 border-[var(--border-hairline)] text-[var(--text-secondary)]'
                                      }`}
                                    >
                                      {opt.isCorrect ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-[var(--border-strong)] shrink-0" />
                                      )}
                                      <span className="truncate">{opt.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {q.explanation && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{q.explanation}</span>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSingleQuestion(q, msg.id, qIdx)}
                              disabled={isAdded}
                              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                                isAdded
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 cursor-default'
                                  : 'btn-ghost-surface hover:border-[var(--accent-signal)]'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] max-w-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-[var(--accent-signal)] animate-spin" />
              <div className="font-mono text-xs text-[var(--text-secondary)]">
                Gemini is analyzing prompt & documents...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-[var(--border-hairline)] bg-[var(--bg-tray)]/50 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-tertiary)] shrink-0">
            Prompts:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-signal)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Attached File */}
        {attachedFile && (
          <div className="px-4 py-2 bg-[#0891B2]/10 border-t border-[#0891B2]/25 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#0891B2] dark:text-[#22D3EE] truncate">
              {attachedFile.mimeType === 'application/pdf' ? (
                <FileText className="w-4 h-4 shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium truncate">{attachedFile.filename}</span>
              <span className="font-mono opacity-75 text-[10px]">({attachedFile.sizeKb} KB)</span>
            </div>
            <button
              type="button"
              onClick={removeAttachedFile}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-10 w-10 rounded-xl flex items-center justify-center border border-[var(--border-hairline)] bg-[var(--bg-tray)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              title="Attach PDF or Image (up to 15MB)"
            >
              <FileUp className="w-5 h-5" />
            </button>

            <div className="flex-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] focus-within:ring-2 focus-within:ring-[var(--accent-signal)] transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask AI to generate questions or parse attached syllabus PDF/diagram..."
                rows={1}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm bg-transparent resize-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none max-h-32"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputValue.trim() && !attachedFile)}
              className="h-10 w-10 rounded-xl btn-signal flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
