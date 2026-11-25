import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Lock,
  Clock,
  FileSpreadsheet,
  Sliders,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { ProctorVault3D } from '../components/ProctorVault3D';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/cn';

interface SandboxQuestion {
  id: number;
  type: 'MCQ' | 'NUMERICAL' | 'TRUE_FALSE';
  label: string;
  prompt: string;
  options?: { id: string; text: string }[];
  correctValue: string;
  explanation: string;
}

const SANDBOX_QUESTIONS: SandboxQuestion[] = [
  {
    id: 1,
    type: 'MCQ',
    label: 'Multiple Choice',
    prompt:
      'Which HTTP status code should an API return when a bearer token fails verification against an active user record?',
    options: [
      { id: 'a', text: '401 Unauthorized' },
      { id: 'b', text: '204 No Content' },
      { id: 'c', text: '302 Found' },
      { id: 'd', text: '500 Internal Server Error' },
    ],
    correctValue: 'a',
    explanation: '401 Unauthorized signals invalid or expired authentication credentials before controller execution.',
  },
  {
    id: 2,
    type: 'NUMERICAL',
    label: 'Numerical Value',
    prompt:
      'In IEEE 754 single-precision (32-bit) floating-point representation, how many bits are allocated to the exponent field?',
    correctValue: '8',
    explanation: 'IEEE 754 float32 allocates 1 sign bit, 8 exponent bits, and 23 significand bits.',
  },
  {
    id: 3,
    type: 'TRUE_FALSE',
    label: 'True / False',
    prompt:
      'ExamSecure proctoring telemetry captures both window blur and document visibility changes into an immutable audit log.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctValue: 'true',
    explanation: 'Both visibilitychange and blur events increment the violation ledger and warn at configured thresholds.',
  },
];

export const LandingPage: React.FC = () => {
  const { openGateway } = useRoleGateway();
  const [vaultMode, setVaultMode] = useState<'landing' | 'student' | 'admin'>('landing');

  // Interactive Sandbox State
  const [activeIdx, setActiveIdx] = useState(0);
  const [sandboxAnswers, setSandboxAnswers] = useState<Record<number, string>>({});
  const [sandboxChecked, setSandboxChecked] = useState(false);
  const [simulatedStrikes, setSimulatedStrikes] = useState(0);

  // Dual Interface Switcher State
  const [workspaceTab, setWorkspaceTab] = useState<'student' | 'admin'>('student');

  const activeQuestion = SANDBOX_QUESTIONS[activeIdx];
  const currentAnswer = sandboxAnswers[activeQuestion.id] || '';
  const sandboxScore = SANDBOX_QUESTIONS.reduce((acc, q) => {
    const val = (sandboxAnswers[q.id] || '').trim().toLowerCase();
    return val === q.correctValue.toLowerCase() ? acc + 1 : acc;
  }, 0);

  const resetSandbox = () => {
    setSandboxAnswers({});
    setSandboxChecked(false);
    setSimulatedStrikes(0);
    setActiveIdx(0);
  };

  return (
    <div className="bg-[var(--bg-canvas)] text-[var(--text-primary)] overflow-x-hidden">
      {/* 1. HERO SECTION — 60-30-10 Nordic Academic / Obsidian Slate Split */}
      <section className="relative bg-subtle-grid border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy (Left 6 columns) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2">
                <Badge variant="brand" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Institutional Assessment &amp; Proctoring Architecture
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.08]">
                High-stakes exams engineered for{' '}
                <span className="font-serif italic font-semibold text-[var(--accent-primary)]">
                  academic precision.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Author multi-format assessments with Gemini AI, isolate candidate browser sessions with real-time focus telemetry, and generate instant analytical gradebooks.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={openGateway}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started
                </Button>
                <a
                  href="#sandbox"
                  className="min-h-[48px] px-5 inline-flex items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-base font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-tray)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
                >
                  Try Live Sandbox
                </a>
                <Link
                  to="/login"
                  className="min-h-[48px] px-4 inline-flex items-center justify-center rounded-[12px] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust Metric Bar */}
              <div className="pt-6 border-t border-[var(--border-default)] grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-[var(--text-primary)]">
                    7
                  </p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                    Question Modalities
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-[var(--accent-primary)]">
                    &lt; 2s
                  </p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                    Auto-Save Latency
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-[var(--accent-secondary)]">
                    100%
                  </p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                    Audited Events
                  </p>
                </div>
              </div>
            </div>

            {/* Hero 3D Interactive Vault (Right 6 columns) */}
            <div className="lg:col-span-6">
              <ProctorVault3D
                mode={vaultMode}
                onModeChange={setVaultMode}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE EXAM SANDBOX */}
      <section id="sandbox" className="py-16 sm:py-20 border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <Badge variant="teal" icon={<Layers className="w-3.5 h-3.5" />}>
                Zero-Signup Preview
              </Badge>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Interactive Exam Sandbox
              </h2>
              <p className="mt-2 text-base text-[var(--text-secondary)]">
                Test multiple question formats, immediate validation feedback, and live focus-loss proctoring directly below.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetSandbox}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Sandbox
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Interactive Question Surface */}
            <div className="lg:col-span-8 ui-card p-6 sm:p-8 space-y-6">
              {/* Top Question Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-2">
                  {SANDBOX_QUESTIONS.map((q, idx) => {
                    const answered = Boolean((sandboxAnswers[q.id] || '').trim());
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold border transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                          activeIdx === idx
                            ? 'bg-[var(--accent-primary)] text-white border-transparent'
                            : answered
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                            : 'bg-[var(--bg-tray)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        Q{idx + 1} · {q.label}
                      </button>
                    );
                  })}
                </div>
                <Badge variant="neutral">Question {activeIdx + 1} of 3</Badge>
              </div>

              {/* Prompt */}
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)] leading-relaxed">
                  {activeQuestion.prompt}
                </p>
              </div>

              {/* Input Controls */}
              {activeQuestion.type === 'NUMERICAL' ? (
                <div className="max-w-xs space-y-2">
                  <label
                    htmlFor="sandbox-numerical-input"
                    className="block text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    Enter numeric answer
                  </label>
                  <input
                    id="sandbox-numerical-input"
                    type="text"
                    inputMode="numeric"
                    value={currentAnswer}
                    onChange={(e) =>
                      setSandboxAnswers((prev) => ({ ...prev, [activeQuestion.id]: e.target.value }))
                    }
                    placeholder="e.g. 8"
                    className="w-full min-h-[44px] px-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-mono text-base focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3" role="radiogroup" aria-label={`Options for question ${activeQuestion.id}`}>
                  {activeQuestion.options?.map((opt) => {
                    const selected = currentAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setSandboxAnswers((prev) => ({ ...prev, [activeQuestion.id]: opt.id }))
                        }
                        className={cn(
                          'w-full min-h-[48px] px-4 py-3 rounded-[12px] border text-left flex items-center justify-between gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                          selected
                            ? 'border-[var(--accent-primary)] bg-blue-50/70 dark:bg-blue-950/50 text-[var(--text-primary)] font-semibold'
                            : 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        <span className="text-base">{opt.text}</span>
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                            selected
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]'
                              : 'border-[var(--border-strong)]'
                          )}
                          aria-hidden="true"
                        >
                          {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Evaluation Result Banner */}
              {sandboxChecked && (
                <div
                  className={cn(
                    'p-4 rounded-[12px] border flex items-start gap-3',
                    currentAnswer.trim().toLowerCase() === activeQuestion.correctValue.toLowerCase()
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-100'
                      : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-100'
                  )}
                >
                  {currentAnswer.trim().toLowerCase() === activeQuestion.correctValue.toLowerCase() ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="font-bold">
                      {currentAnswer.trim().toLowerCase() === activeQuestion.correctValue.toLowerCase()
                        ? 'Correct Answer'
                        : `Expected Answer: ${activeQuestion.correctValue.toUpperCase()}`}
                    </p>
                    <p>{activeQuestion.explanation}</p>
                  </div>
                </div>
              )}

              {/* Action Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={activeIdx === 0}
                    onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={activeIdx === SANDBOX_QUESTIONS.length - 1}
                    onClick={() => setActiveIdx((i) => Math.min(SANDBOX_QUESTIONS.length - 1, i + 1))}
                  >
                    Next Question
                  </Button>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSandboxChecked(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Grade Sandbox ({sandboxScore}/3)
                </Button>
              </div>
            </div>

            {/* Live Proctoring Telemetry Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="ui-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    Focus Guard Telemetry
                  </span>
                  <Badge variant={simulatedStrikes >= 3 ? 'danger' : simulatedStrikes > 0 ? 'warning' : 'success'}>
                    {simulatedStrikes >= 3 ? 'Auto-Submit Triggered' : simulatedStrikes > 0 ? 'Warning Logged' : 'Compliant'}
                  </Badge>
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  During an active exam, leaving fullscreen or switching tabs increments a cryptographic strike counter synced to the faculty audit log.
                </p>

                <div className="p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Recorded Strikes</span>
                  <span className="text-2xl font-mono font-bold tabular-nums text-[var(--text-primary)]">
                    {simulatedStrikes} / 3
                  </span>
                </div>

                <Button
                  variant={simulatedStrikes >= 2 ? 'danger' : 'secondary'}
                  size="md"
                  fullWidth
                  onClick={() => setSimulatedStrikes((s) => Math.min(3, s + 1))}
                  leftIcon={<AlertTriangle className="w-4 h-4" />}
                >
                  Simulate Tab Switch (+1 Strike)
                </Button>
              </div>

              <div className="ui-card p-6 bg-[var(--bg-tray)]/60 space-y-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Ready for the full environment?
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Open the Role Selector to test Student exam-taking or Admin authoring right now.
                </p>
                <Button variant="primary" size="md" fullWidth onClick={openGateway} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open Role Gateway
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ASYMMETRIC BENTO CAPABILITIES */}
      <section id="capabilities" className="py-16 sm:py-20 border-b border-[var(--border-default)] bg-[var(--bg-tray)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <Badge variant="brand" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Core Architecture
            </Badge>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Built for integrity from authoring to transcript.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento 1: Gemini AI Studio (7 cols) */}
            <div className="md:col-span-7 ui-card ui-card-hover p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-[12px] bg-blue-50 dark:bg-blue-950/60 text-[var(--accent-primary)] flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  Gemini Multimodal AI Question Studio
                </h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  Generate balanced exams directly from course syllabi, pasted notes, or uploaded diagram images. Every generated item maps cleanly into structured JSON ready for inline review and instant publishing.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)]" aria-hidden="true" />
                  <span>Resilient Offline Synthesis Fallback Included</span>
                </div>
                <Badge variant="brand">AI Powered</Badge>
              </div>
            </div>

            {/* Bento 2: Zero-Leak Isolation (5 cols) */}
            <div className="md:col-span-5 ui-card ui-card-hover p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-[12px] bg-teal-50 dark:bg-teal-950/60 text-[var(--accent-secondary)] flex items-center justify-center border border-teal-200 dark:border-teal-800">
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  Focus &amp; Browser Guard
                </h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  Captures fullscreen exits, tab switches, window blurs, and restricted clipboard shortcuts with configurable auto-submission thresholds.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <Lock className="w-4 h-4 text-[var(--accent-secondary)]" aria-hidden="true" />
                <span>JWT Verified · Server-enforced timing</span>
              </div>
            </div>

            {/* Bento 3: 7 Modalities (5 cols) */}
            <div className="md:col-span-5 ui-card ui-card-hover p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-[12px] bg-blue-50 dark:bg-blue-950/60 text-[var(--accent-primary)] flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <Sliders className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  7 Question Formats
                </h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  MCQ, Multiple Select, True/False, Fill in the Blank, Exact Numerical, Short Answer, and Long Essay with per-question negative marking.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="neutral">MCQ</Badge>
                <Badge variant="neutral">Numerical</Badge>
                <Badge variant="neutral">Fill Blank</Badge>
                <Badge variant="neutral">Long Answer</Badge>
              </div>
            </div>

            {/* Bento 4: Gradebook & CSV (7 cols) */}
            <div className="md:col-span-7 ui-card ui-card-hover p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/60 text-[var(--accent-success)] flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <BarChart3 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  Instant Grading &amp; Telemetry Correlation
                </h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  Inspect answer-by-answer candidate breakdowns alongside focus-loss event counts, cohort score distributions, and one-click CSV gradebook exports.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[var(--accent-success)]" aria-hidden="true" />
                  Print-ready candidate transcripts &amp; CSV exports
                </span>
                <Badge variant="success">Instant</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DUAL INTERFACE PREVIEW */}
      <section className="py-16 sm:py-20 border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Two dedicated interfaces, one unified system.
              </h2>
              <p className="mt-2 text-base text-[var(--text-secondary)]">
                Every workflow is isolated strictly by Role-Based Access Control.
              </p>
            </div>
            <div className="inline-flex p-1.5 rounded-[14px] bg-[var(--bg-tray)] border border-[var(--border-default)] self-start">
              <button
                type="button"
                onClick={() => setWorkspaceTab('student')}
                className={cn(
                  'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold transition-colors inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  workspaceTab === 'student'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-secondary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab('admin')}
                className={cn(
                  'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold transition-colors inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  workspaceTab === 'admin'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Faculty / Admin Suite
              </button>
            </div>
          </div>

          <div className="ui-card p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <Badge variant={workspaceTab === 'student' ? 'teal' : 'brand'}>
                {workspaceTab === 'student' ? 'Candidate Experience' : 'Faculty Command Center'}
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {workspaceTab === 'student'
                  ? 'Calm, distraction-free exam execution.'
                  : 'Complete exam authoring and cohort oversight.'}
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {workspaceTab === 'student'
                  ? 'Candidates verify hardware & proctoring guidelines before starting, track question progress with a visual status palette, and receive instant printable transcripts.'
                  : 'Administrators compose rich question banks, collaborate with Gemini AI Studio, filter submissions by exam or status, and review timestamped proctoring alerts.'}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant={workspaceTab === 'student' ? 'teal' : 'primary'} size="md" onClick={openGateway} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {workspaceTab === 'student' ? 'Launch Student Demo' : 'Launch Admin Demo'}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-[14px] bg-[var(--bg-tray)] border border-[var(--border-default)] space-y-4">
              {workspaceTab === 'student' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Midterm Operating Systems</span>
                    <Badge variant="success">Ready to Start</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-lg font-bold font-mono text-[var(--text-primary)]">60m</p>
                      <p className="text-xs text-[var(--text-muted)]">Duration</p>
                    </div>
                    <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-lg font-bold font-mono text-[var(--text-primary)]">30</p>
                      <p className="text-xs text-[var(--text-muted)]">Questions</p>
                    </div>
                    <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-lg font-bold font-mono text-[var(--accent-secondary)]">0/3</p>
                      <p className="text-xs text-[var(--text-muted)]">Focus Strikes</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Question Builder · CS-301</span>
                    <Badge variant="brand">AI Studio Ready</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-lg font-bold font-mono text-[var(--text-primary)]">94.2%</p>
                      <p className="text-xs text-[var(--text-muted)]">Clean Rate</p>
                    </div>
                    <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-lg font-bold font-mono text-[var(--accent-primary)]">7</p>
                      <p className="text-xs text-[var(--text-muted)]">Item Types</p>
                    </div>
                    <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-lg font-bold font-mono text-[var(--accent-success)]">CSV</p>
                      <p className="text-xs text-[var(--text-muted)]">One-Click</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. THREE-STEP WORKFLOW */}
      <section id="workflow" className="py-16 sm:py-20 border-b border-[var(--border-default)] bg-[var(--bg-tray)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <Badge variant="neutral" icon={<Clock className="w-3.5 h-3.5" />}>
              Deployment Lifecycle
            </Badge>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              From syllabus draft to audited grades in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Author & Generate',
                body: 'Create exams manually across 7 question modalities or prompt the Gemini Multimodal AI Studio with syllabus topics and images.',
              },
              {
                num: '02',
                title: 'Launch & Proctor',
                body: 'Candidates enter a locked fullscreen environment where every focus shift, shortcut attempt, and answer edit is logged securely.',
              },
              {
                num: '03',
                title: 'Evaluate & Export',
                body: 'Review instant automated scoring, inspect flagged proctoring logs side-by-side, and download structured CSV reports.',
              },
            ].map((step) => (
              <div key={step.num} className="ui-card p-6 sm:p-8 space-y-3">
                <span className="inline-block text-sm font-mono font-bold text-[var(--accent-primary)]">
                  STEP {step.num}
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{step.title}</h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA & INSTITUTIONAL FOOTER */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ui-card p-8 sm:p-12 text-center space-y-5 bg-[var(--bg-surface)]">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Ready to launch your assessment workspace?
            </h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto">
              Choose Student or Admin mode in one click, explore pre-seeded exams, or register your own institutional credentials.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="primary" size="lg" onClick={openGateway} rightIcon={<ArrowRight className="w-5 h-5" />}>
                Get Started
              </Button>
              <Link
                to="/register"
                className="min-h-[48px] px-6 inline-flex items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-tray)] text-base font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-surface)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandMark size="sm" />
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
            <a href="#sandbox" className="hover:text-[var(--text-primary)] transition-colors">
              Live Sandbox
            </a>
            <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[var(--text-primary)] transition-colors">
              Register
            </Link>
            <span className="text-[var(--text-muted)]">© 2026 ExamSecure</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
