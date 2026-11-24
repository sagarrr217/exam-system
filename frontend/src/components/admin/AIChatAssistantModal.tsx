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
  AlertCircle,
  HelpCircle,
  Trash2,
  FileUp,
  Bot,
  User,
  Layers
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
  fileAttachment?: {
    filename: string;
    mimeType: string;
    sizeKb: number;
  };
  questions?: GeneratedQuestion[];
}

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
  onAddAllQuestions
}) => {
  const toast = useToast();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your AI Question Studio Assistant. You can ask me to generate questions on any topic, tailor difficulty, or upload a PDF document (syllabus, past paper, textbook excerpt) or image (diagram, problem screenshot) to extract questions automatically.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
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

  // Track which question IDs or indexes have been added
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

    // Check size limit: 15MB max
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
        previewUrl: file.type.startsWith('image/') ? result : undefined
      });
      toast.success(`Attached: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file. Please try another file.');
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const promptToSend = (promptOverride || inputValue).trim();
    if (!promptToSend && !attachedFile) {
      toast.error('Please enter an instruction or attach a document/image.');
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const userMessage: AIChatMessage = {
      id: userMessageId,
      role: 'user',
      text: promptToSend || `Generate questions from the attached ${attachedFile?.filename}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttachment: attachedFile
        ? {
            filename: attachedFile.filename,
            mimeType: attachedFile.mimeType,
            sizeKb: attachedFile.sizeKb
          }
        : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Keep reference to file before clearing state
    const filePayload = attachedFile
      ? {
          filename: attachedFile.filename,
          mimeType: attachedFile.mimeType,
          base64Data: attachedFile.base64Data
        }
      : undefined;

    setAttachedFile(null);

    try {
      // Build history for context
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await api.chatAIQuestions({
        prompt: promptToSend,
        history: historyPayload,
        file: filePayload,
        examContext: {
          title: examTitle,
          subject: examSubject,
          existingQuestionCount: existingQuestionsCount
        }
      });

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res.reply || 'Here are the generated questions based on your request:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        questions: res.questions || []
      };

      setMessages(prev => [...prev, aiMessage]);

      if (res.questions && res.questions.length > 0) {
        toast.success(`Generated ${res.questions.length} questions!`);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      toast.error(err.message || 'Failed to generate questions. Please check your Gemini API key.');
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `⚠️ Error: ${err.message || 'Unable to connect to Gemini AI. Please verify your API key in backend/.env.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingleQuestion = (question: GeneratedQuestion, msgId: string, qIdx: number) => {
    const key = `${msgId}-${qIdx}`;
    onAddQuestion(question);
    setAddedQuestionKeys(prev => new Set(prev).add(key));
    toast.success(`Added question: "${question.text.slice(0, 30)}..."`);
  };

  const handleAddAllFromMessage = (questions: GeneratedQuestion[], msgId: string) => {
    onAddAllQuestions(questions);
    setAddedQuestionKeys(prev => {
      const next = new Set(prev);
      questions.forEach((_, idx) => next.add(`${msgId}-${idx}`));
      return next;
    });
    toast.success(`Added all ${questions.length} questions to the exam!`);
  };

  const quickPrompts = [
    `Generate 3 conceptual MCQ questions with 4 options and detailed explanations`,
    `Create 2 hard multiple-select questions with code snippets`,
    `Generate 2 True/False questions testing common misconceptions`,
    `Extract questions from the uploaded PDF/image file`
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="flex flex-col w-full max-w-4xl h-[90vh] max-h-[850px] bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden">
        
        {/* Apple HIG Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-[#f5f5f7]/80 dark:bg-[#2c2c2e]/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  AI Question Studio & Assistant
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  Gemini Multimodal
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Context: {examSubject || examTitle || 'General Exam'} • {existingQuestionsCount} question(s) in draft
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#fafafa] dark:bg-[#121214]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-center space-x-2 text-xs text-gray-400 px-1">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-blue-500" />
                    <span>Gemini AI Studio</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-sm text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#0071e3] text-white rounded-br-md shadow-blue-500/10'
                    : 'bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-gray-100 border border-black/5 dark:border-white/10 rounded-bl-md'
                }`}
              >
                {/* Attached File Preview inside User Bubble */}
                {msg.fileAttachment && (
                  <div className="mb-3 p-2.5 rounded-2xl bg-white/15 dark:bg-black/30 border border-white/20 flex items-center space-x-3 text-xs">
                    {msg.fileAttachment.mimeType === 'application/pdf' ? (
                      <FileText className="w-5 h-5 text-red-300 shrink-0" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-green-300 shrink-0" />
                    )}
                    <div className="truncate flex-1">
                      <p className="font-medium truncate">{msg.fileAttachment.filename}</p>
                      <p className="opacity-75 text-[10px]">{msg.fileAttachment.sizeKb} KB</p>
                    </div>
                  </div>
                )}

                {/* Prose Text */}
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>

              {/* Generated Question Cards Stream */}
              {msg.questions && msg.questions.length > 0 && (
                <div className="w-full max-w-[95%] sm:max-w-[90%] space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>{msg.questions.length} Generated Question(s)</span>
                    </span>

                    <button
                      onClick={() => handleAddAllFromMessage(msg.questions!, msg.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
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
                          className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/30">
                                  {q.type}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                  {q.marks} Marks
                                </span>
                              </div>

                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {qIdx + 1}. {q.text}
                              </p>

                              {/* Options */}
                              {q.options && q.options.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs border ${
                                        opt.isCorrect
                                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium'
                                          : 'bg-gray-50/50 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-300'
                                      }`}
                                    >
                                      {opt.isCorrect ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                                      )}
                                      <span className="truncate">{opt.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Academic Explanation */}
                              {q.explanation && (
                                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                  <span>{q.explanation}</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleAddSingleQuestion(q, msg.id, qIdx)}
                              disabled={isAdded}
                              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5 transition-all ${
                                isAdded
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-default'
                                  : 'bg-black/5 dark:bg-white/10 hover:bg-[#0071e3] hover:text-white text-gray-700 dark:text-gray-200'
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
            <div className="flex items-center space-x-3 p-4 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 max-w-sm shadow-sm animate-pulse">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Gemini is analyzing prompt & documents...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-black/5 dark:border-white/10 bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-md overflow-x-auto flex items-center space-x-2 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">Prompts:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Attached File Staging Area */}
        {attachedFile && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-blue-800 dark:text-blue-200 truncate">
              {attachedFile.mimeType === 'application/pdf' ? (
                <FileText className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-green-500 shrink-0" />
              )}
              <span className="font-medium truncate">{attachedFile.filename}</span>
              <span className="opacity-70 text-[10px]">({attachedFile.sizeKb} KB)</span>
            </div>

            <button
              onClick={removeAttachedFile}
              className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200/50 dark:hover:bg-blue-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#1c1c1e]">
          <div className="flex items-end space-x-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-10 w-10 rounded-2xl flex items-center justify-center border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              title="Attach PDF or Image (up to 15MB)"
            >
              <FileUp className="w-5 h-5" />
            </button>

            {/* Chat Input Textarea */}
            <div className="flex-1 relative rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask AI to generate questions, or ask questions about attached PDF/image... (Press Enter to send)"
                rows={1}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm bg-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none max-h-32"
              />
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputValue.trim() && !attachedFile)}
              className="h-10 w-10 rounded-2xl bg-[#0071e3] hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#0071e3] text-white flex items-center justify-center shadow-md transition-all shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-1">
            <span>Supports raw PDFs, syllabus files, and screenshots via Gemini Vision</span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>

      </div>
    </div>
  );
};
