import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Bookmark,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  FileText,
  GraduationCap,
  Cpu,
  Lock,
  Download,
  Terminal,
  Layers,
  Check,
  Activity,
} from 'lucide-react';
import type { ProctorSceneMode } from '../components/ProctorVault3D';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { useAuth } from '../context/AuthContext';

const ProctorVault3D = lazy(() =>
  import('../components/ProctorVault3D').then((m) => ({ default: m.ProctorVault3D }))
);

interface LandingPageProps {
  openGatewayOnMount?: boolean;
}

const SANDBOX_QUESTIONS = [
  {
    id: 'sb-1',
    type: 'MCQ',
    marks: 10,
    prompt: 'Which graph algorithm finds single-source shortest paths even when edges carry negative weights?',
    options: [
      { id: 'a', label: 'A', text: 'Dijkstra’s Greedy Relaxation' },
      { id: 'b', label: 'B', text: 'Bellman-Ford Dynamic Relaxation' },
      { id: 'c', label: 'C', text: 'Breadth-First Queue Traversal' },
      { id: 'd', label: 'D', text: 'Kruskal’s Disjoint Union' },
    ],
    correctId: 'b',
  },
  {
    id: 'sb-2',
    type: 'NUMERICAL',
    marks: 5,
    prompt: 'Compute the worst-case comparison depth of a balanced binary tree with 1,024 leaf nodes (log₂ 1024).',
    expected: '10',
  },
  {
    id: 'sb-3',
    type: 'TRUE_FALSE',
    marks: 5,
    prompt: 'Student attempt endpoints strip option correctness flags (`isCorrect`) from payloads until submission locks.',
    options: [
      { id: 'true', label: 'T', text: 'True — Strictly Redacted' },
      { id: 'false', label: 'F', text: 'False — Sent to Client' },
    ],
    correctId: 'true',
  },
];

const QUESTION_FORMATS = [
  { code: '01', name: 'Single-Choice MCQ', spec: 'Radio cards • Exact option ID' },
  { code: '02', name: 'Multi-Select Matrix', spec: 'Set-equality grading' },
  { code: '03', name: 'True / False Binary', spec: 'Affirmative / Negative cards' },
  { code: '04', name: 'Fill in the Blank', spec: 'Case-insensitive multi-match' },
  { code: '05', name: 'Numerical Precision', spec: 'Floating tolerance ±0.001' },
  { code: '06', name: 'Short Response', spec: 'Word count & autosave' },
  { code: '07', name: '5-Marker Essay', spec: 'Expanded architectural prose' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ openGatewayOnMount = false }) => {
  const { openGateway } = useRoleGateway();
  const { user } = useAuth();

  // 3D WebGL State Machine Mode
  const [sceneMode, setSceneMode] = useState<ProctorSceneMode>('sentinel');

  // Interactive Sandbox State
  const [sandboxIdx, setSandboxIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Record<string, string>>({ 'sb-1': 'b' });
  const [numericalVal, setNumericalVal] = useState('10');
  const [markedSet, setMarkedSet] = useState<Record<string, boolean>>({});
  const [simViolations, setSimViolations] = useState(0);
  const [simTimer, setSimTimer] = useState(2684); // 44:44

  // Dual Interface Preview Tab
  const [interfaceTab, setInterfaceTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

  useEffect(() => {
    if (openGatewayOnMount) {
      openGateway();
    }
  }, [openGatewayOnMount, openGateway]);

  useEffect(() => {
    const t = setInterval(() => {
      setSimTimer((prev) => (prev > 60 ? prev - 1 : 2684));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeSandboxQ = SANDBOX_QUESTIONS[sandboxIdx];

  const modeDescriptions: Record<ProctorSceneMode, { tag: string; metric: string; detail: string }> = {
    sentinel: {
      tag: 'PROCTOR SENTINEL // ACTIVE',
      metric: '0.4ms Event Hook',
      detail: 'Tracks window blur, tab visibility & resize telemetry with debounced audit logging.',
    },
    ai: {
      tag: 'GEMINI MULTIMODAL // 1M CTX',
      metric: 'PDF + Vision Parse',
      detail: 'Converts raw syllabi, diagrams & textbook pages into structured 7-type exams.',
    },
    lockdown: {
      tag: 'RBAC + KEY REDACTION // SEALED',
      metric: 'HTTP 403 Enforced',
      detail: 'Strips answer keys from student payloads & locks attempts post-submission.',
    },
  };

  return (
    <div className="relative bg-[var(--bg-canvas)] text-[var(--text-primary)] overflow-x-hidden">
      {/* SECTION 1: ASYMMETRIC 3D WEBGL HERO */}
      <section className="relative border-b border-[var(--border-hairline)] bg-arch-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Editorial Column (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Precision Telemetry Eyebrow */}
              <div className="inline-flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-signal)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-signal)] animate-pulse" />
                  Dual-Interface Architecture
                </span>
                <span className="text-[var(--border-strong)]">|</span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  Student Room + Faculty AI Console
                </span>
              </div>

              {/* Asymmetric Typographic Display Title */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.85rem] font-extrabold tracking-[-0.035em] leading-[1.03] text-[var(--text-primary)]">
                High-stakes exams,{' '}
                <span className="font-serif italic font-normal text-[var(--accent-signal)] tracking-[-0.01em]">
                  architected
                </span>{' '}
                for zero ambiguity.
              </h1>

              {/* Punchy, Content-First Copy (under 65 words) */}
              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
                An institutional examination engine pairing an isolated, keystroke-autosaved student room with a faculty studio powered by Gemini Multimodal synthesis and real-time focus-loss auditing.
              </p>

              {/* Primary CTA Row */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={openGateway}
                  className="btn-signal px-7 py-3.5 text-sm sm:text-base inline-flex items-center gap-2.5 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#sandbox"
                  className="btn-ghost-surface px-5 py-3.5 text-sm inline-flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4 text-[#0891B2] dark:text-[#22D3EE]" />
                  <span>Test Live Sandbox</span>
                </a>

                {!user && (
                  <Link
                    to="/login"
                    className="px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline-offset-4 hover:underline transition-colors"
                  >
                    Custom Sign In
                  </Link>
                )}
              </div>

              {/* Factual Telemetry Specification Strip */}
              <div className="pt-6 border-t border-[var(--border-hairline)] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                    07
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Native Question Formats
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                    ±0.001
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Numeric Auto-Tolerance
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#0891B2] dark:text-[#22D3EE] tabular-nums">
                    100%
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Answer Key Redacted
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[var(--accent-signal)] tabular-nums">
                    1M CTX
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Gemini PDF Ingestion
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive 3D WebGL Telemetry Core (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
                {/* 3D Viewport Top Bar */}
                <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-tray)]/60">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>{modeDescriptions[sceneMode].tag}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    WEBGL // 60FPS
                  </span>
                </div>

                {/* 3D Canvas Stage */}
                <div className="relative h-[340px] sm:h-[400px] w-full bg-gradient-to-b from-transparent via-black/[0.02] to-black/[0.06] dark:via-white/[0.01] dark:to-black/40">
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-signal)] border-t-transparent animate-spin" />
                        <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
                          Loading 3D Engine...
                        </span>
                      </div>
                    }
                  >
                    <ProctorVault3D mode={sceneMode} className="w-full h-full" />
                  </Suspense>

                  {/* Corner Coordinate Reticle */}
                  <div className="pointer-events-none absolute top-3 left-4 font-mono text-[10px] text-[var(--text-tertiary)] space-y-0.5">
                    <div>AXIS_IK: POINTER_TRACK</div>
                    <div>CORE_SPEC: {modeDescriptions[sceneMode].metric}</div>
                  </div>
                </div>

                {/* State Machine Interactive Mode Switcher */}
                <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
                    {(
                      [
                        { id: 'sentinel', label: 'Sentinel' },
                        { id: 'ai', label: 'AI Studio' },
                        { id: 'lockdown', label: 'RBAC Seal' },
                      ] as const
                    ).map((item) => {
                      const active = sceneMode === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSceneMode(item.id)}
                          className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                            active
                              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-sm'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {modeDescriptions[sceneMode].detail}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE LIVE SANDBOX (Judges can test the real UX immediately) */}
      <section id="sandbox" className="py-16 sm:py-24 border-b border-[var(--border-hairline)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent-signal)] font-semibold mb-2">
                [ 01 / INTERACTIVE ENGINE PREVIEW ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Experience the exam portal before signing in.
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              Select answers, flag questions for review, or trigger a simulated focus-loss violation to watch the live telemetry sentinel respond.
            </p>
          </div>

          <div className="studio-card overflow-hidden border border-[var(--border-strong)]">
            {/* Simulated Exam Header */}
            <div className="px-5 py-3.5 bg-[var(--bg-tray)] border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                  CS401 // SANDBOX
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  Algorithms & Distributed Integrity
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSimViolations((v) => v + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Simulate Tab Switch</span>
                </button>

                <div
                  className={`font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border tabular-nums flex items-center gap-1.5 ${
                    simViolations >= 3
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/35'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Incidents: {simViolations}/3</span>
                </div>

                <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-[#141413] text-white dark:bg-white/10 tabular-nums flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                  <span>{formatTimer(simTimer)}</span>
                </div>
              </div>
            </div>

            {/* Sandbox Split Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Question Stage */}
              <div className="lg:col-span-8 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[var(--border-hairline)] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border border-[var(--accent-signal)]/20">
                      Q0{sandboxIdx + 1} / 03
                    </span>
                    <span className="font-mono text-xs text-[var(--text-secondary)]">
                      {activeSandboxQ.type} • {activeSandboxQ.marks} MARKS
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMarkedSet((prev) => ({
                        ...prev,
                        [activeSandboxQ.id]: !prev[activeSandboxQ.id],
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      markedSet[activeSandboxQ.id]
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35'
                        : 'bg-[var(--bg-tray)] text-[var(--text-secondary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedSet[activeSandboxQ.id] ? 'Flagged' : 'Mark Review'}</span>
                  </button>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] leading-snug">
                  {activeSandboxQ.prompt}
                </h3>

                {/* Options / Numerical Input */}
                {activeSandboxQ.options ? (
                  <div className="space-y-2.5">
                    {activeSandboxQ.options.map((opt) => {
                      const isChosen = selectedChoice[activeSandboxQ.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSelectedChoice((prev) => ({ ...prev, [activeSandboxQ.id]: opt.id }))
                          }
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                            isChosen
                              ? 'border-[var(--accent-signal)] bg-[var(--accent-signal)]/10'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                              isChosen
                                ? 'bg-[var(--accent-signal)] text-white'
                                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)]'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 max-w-sm">
                    <label
                      htmlFor="sandbox-numerical"
                      className="block font-mono text-xs uppercase text-[var(--text-secondary)]"
                    >
                      Exact Value (Tolerance ±0.001)
                    </label>
                    <input
                      id="sandbox-numerical"
                      type="number"
                      value={numericalVal}
                      onChange={(e) => setNumericalVal(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl font-mono text-lg font-bold bg-[var(--bg-tray)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)]"
                    />
                  </div>
                )}

                {simViolations > 0 && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      simViolations >= 3
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {simViolations >= 3
                          ? `Threshold reached (${simViolations}/3): Attempt flagged in Admin Proctoring Console.`
                          : `Focus-loss event #${simViolations} logged non-destructively — answers preserved.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimViolations(0)}
                      className="font-mono text-[11px] underline flex-shrink-0"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Palette & Launch Sidebar */}
              <div className="lg:col-span-4 p-6 sm:p-8 bg-[var(--bg-tray)]/35 flex flex-col justify-between gap-6">
                <div>
                  <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Live Question Palette
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {SANDBOX_QUESTIONS.map((q, idx) => {
                      const isCurrent = idx === sandboxIdx;
                      const isFlagged = markedSet[q.id];
                      const isDone = q.options ? Boolean(selectedChoice[q.id]) : numericalVal.trim().length > 0;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setSandboxIdx(idx)}
                          className={`h-11 rounded-xl font-mono text-sm font-bold border transition-all ${
                            isFlagged
                              ? 'bg-amber-500 text-white border-amber-600'
                              : isDone
                              ? 'bg-[#15803D] dark:bg-[#10B981] text-white dark:text-[#0A0B0E] border-transparent'
                              : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                          } ${isCurrent ? 'ring-2 ring-[var(--accent-signal)] ring-offset-2 ring-offset-[var(--bg-canvas)]' : ''}`}
                        >
                          0{idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                    In production, every click or field blur syncs asynchronously via <code className="font-mono text-[var(--text-primary)]">POST /save-answer</code> with instant state indicators.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openGateway}
                  className="btn-signal w-full py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Enter Real Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ASYMMETRIC BENTO ARCHITECTURE */}
      <section id="architecture" className="py-16 sm:py-24 border-b border-[var(--border-hairline)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent-signal)] font-semibold mb-2">
              [ 02 / SYSTEM CAPABILITIES ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Built like laboratory instrumentation, not a quiz template.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Wide 8-Col Bento: Gemini Multimodal AI Studio */}
            <div className="lg:col-span-8 studio-card p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-[var(--accent-signal)]/10 text-[var(--accent-signal)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini Multimodal Studio
                  </span>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                    Drop a raw syllabus PDF or circuit diagram. Get exam-ready items in seconds.
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Faculty upload multi-page PDFs or reference images up to 15MB. Gemini synthesizes structured questions with options, rationales, and marks for 1-click injection into any exam draft.
                  </p>
                </div>
              </div>

              {/* Architectural Flow Visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-1.5">
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase">Input Payload</div>
                  <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text-primary)]">
                    <FileText className="w-4 h-4 text-[var(--accent-signal)]" />
                    <span>Syllabus_CS401.pdf</span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)]">Multimodal Vision + Text</div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-1.5">
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase">Synthesis Engine</div>
                  <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text-primary)]">
                    <Cpu className="w-4 h-4 text-[#0891B2] dark:text-[#22D3EE]" />
                    <span>Structured JSON</span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)]">Options + Rationales</div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-1.5">
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase">Builder Commit</div>
                  <div className="flex items-center gap-2 font-semibold text-sm text-[#15803D] dark:text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Batch Imported</span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)]">Ready for live publish</div>
                </div>
              </div>
            </div>

            {/* Tall 4-Col Bento: 7 Question Modalities */}
            <div className="lg:col-span-4 studio-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    7 Grading Modalities
                  </span>
                  <Layers className="w-4 h-4 text-[#0891B2] dark:text-[#22D3EE]" />
                </div>

                <div className="divide-y divide-[var(--border-hairline)]">
                  {QUESTION_FORMATS.map((fmt) => (
                    <div key={fmt.code} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                          {fmt.code}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                          {fmt.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-secondary)] text-right">
                        {fmt.spec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6-Col Bento: Cryptographic & RBAC Guardrails */}
            <div className="lg:col-span-6 studio-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#15803D] dark:text-[#10B981]">
                  <Lock className="w-3.5 h-3.5" />
                  Zero-Leak Security Model
                </span>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">RBAC + JWT</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                DevTools-proof answer key redaction & strict role isolation.
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  'isCorrect & explanations stripped from student attempt APIs',
                  'Student tokens strictly rejected (HTTP 403) on admin endpoints',
                  'Submitted & expired attempts permanently immutable',
                  'Timestamped blur & visibilitychange audit logs',
                ].map((line, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[var(--bg-tray)]/70 border border-[var(--border-hairline)] flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#10B981] mt-0.5 flex-shrink-0" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6-Col Bento: Instant Score Telemetry & RFC 4180 Export */}
            <div className="lg:col-span-6 studio-card p-6 sm:p-8 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0891B2] dark:text-[#22D3EE]">
                  <Download className="w-3.5 h-3.5" />
                  Automated Grading & Export
                </span>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">RFC 4180 CSV</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Immediate itemized performance rings and 1-click institutional CSV gradebooks.
              </h3>
              <div className="p-3.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] font-mono text-[11px] text-[var(--text-secondary)] overflow-x-auto">
                <div className="text-[var(--text-tertiary)] mb-1"># Exported Roster Output</div>
                <div>STU-2026-001, "Alex Johnson", 46/50, 92.0%, PASSED, 0_INCIDENTS</div>
                <div>STU-2026-002, "Jane Doe", 41/50, 82.0%, PASSED, 1_INCIDENT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DUAL-INTERFACE ROLE EXPLORER */}
      <section id="interfaces" className="py-16 sm:py-24 border-b border-[var(--border-hairline)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent-signal)] font-semibold mb-2">
                [ 03 / TWO DEDICATED INTERFACES ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Switch between candidate & faculty perspectives.
              </h2>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] self-start">
              <button
                type="button"
                onClick={() => setInterfaceTab('STUDENT')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  interfaceTab === 'STUDENT'
                    ? 'bg-[var(--bg-surface)] text-[#0891B2] dark:text-[#22D3EE] border border-[var(--border-hairline)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setInterfaceTab('ADMIN')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  interfaceTab === 'ADMIN'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-signal)] border border-[var(--border-hairline)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>

          <div className="studio-card p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {interfaceTab === 'STUDENT' ? (
              <>
                <div className="lg:col-span-6 space-y-4">
                  <span className="font-mono text-xs font-semibold text-[#0891B2] dark:text-[#22D3EE] uppercase tracking-wider">
                    Candidate Experience
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Calm, zero-clutter exam focus from launch to graded transcript.
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Candidates track Available, In-Progress, and Completed exams in one unified hub, review explicit proctoring rules before entering an isolated window, and navigate questions with keyboard shortcuts and real-time autosave.
                  </p>
                  <button
                    type="button"
                    onClick={openGateway}
                    className="btn-signal px-5 py-2.5 text-xs sm:text-sm inline-flex items-center gap-2"
                  >
                    <span>Launch as Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="lg:col-span-6 p-5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
                    <span>STUDENT_HUB // ROSTER</span>
                    <span className="text-[#15803D] dark:text-[#10B981]">LIVE SYNC</span>
                  </div>
                  {[
                    { title: 'CS401: Data Structures & Algorithms', status: 'AVAILABLE', meta: '45m • 50 Marks' },
                    { title: 'MATH302: Linear Algebra & Matrices', status: 'COMPLETED', meta: 'Score: 92.0% • PASSED' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{row.title}</div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">{row.meta}</div>
                      </div>
                      <span
                        className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded ${
                          row.status === 'AVAILABLE'
                            ? 'bg-[#0891B2]/15 text-[#0891B2] dark:text-[#22D3EE]'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-6 space-y-4">
                  <span className="font-mono text-xs font-semibold text-[var(--accent-signal)] uppercase tracking-wider">
                    Faculty & Proctoring Command
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Author exams with AI, audit every focus incident, export cohorts.
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Administrators monitor live cohort pass rates, spot flagged high-risk attempts immediately, generate questions from PDFs via Gemini Multimodal, reorder & publish exams, and inspect full question-by-question candidate logs.
                  </p>
                  <button
                    type="button"
                    onClick={openGateway}
                    className="btn-signal px-5 py-2.5 text-xs sm:text-sm inline-flex items-center gap-2"
                  >
                    <span>Launch as Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="lg:col-span-6 p-5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
                    <span>ADMIN_CONSOLE // TELEMETRY</span>
                    <span className="text-[var(--accent-signal)]">RBAC PROTECTED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: 'Pass Rate', val: '88.4%' },
                      { label: 'Published', val: '04 Live' },
                      { label: 'Risk Flags', val: '01 Alert' },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]"
                      >
                        <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase">{stat.label}</div>
                        <div className="font-mono text-base font-bold text-[var(--text-primary)] mt-1">{stat.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">Gemini PDF Studio Ready</span>
                    <span className="font-mono text-[11px] text-[#15803D] dark:text-[#10B981]">1-Click Import</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: WORKFLOW PIPELINE & FINAL CTA */}
      <section id="workflow" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Author & Synthesize',
                desc: 'Draft manually across 7 formats or ingest raw course PDFs with Gemini Multimodal AI, set passing standards, and publish.',
              },
              {
                step: '02',
                title: 'Proctor in Isolation',
                desc: 'Candidates verify conduct rules, enter an isolated exam workspace with countdown persistence, keystroke autosave & focus sentinel.',
              },
              {
                step: '03',
                title: 'Auto-Grade & Audit',
                desc: 'Instant objective evaluation, student score rings with instructor rationales, and full proctoring violation logs with CSV export.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-3"
              >
                <div className="font-mono text-2xl font-bold text-[var(--accent-signal)]">{item.step}</div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Final Call-To-Action Strip */}
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[#141413] dark:bg-[#12141A] text-[#F4F3EF] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="font-mono text-xs uppercase tracking-widest text-[#FF5A36]">
                Ready to Launch
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Choose your role and step inside the live platform.
              </h2>
              <p className="text-sm text-[#9297A5]">
                Both Student Workspace and Admin Console run against the unified Express, Prisma & SQLite backend with zero mock walls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openGateway}
                className="btn-signal px-7 py-3.5 text-sm inline-flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/register"
                className="px-5 py-3.5 rounded-xl text-sm font-semibold border border-white/15 hover:bg-white/10 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Minimal Architectural Footer */}
          <footer className="pt-8 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
            <div className="font-mono">
              EXAMSECURE // DUAL-INTERFACE EXAMINATION ARCHITECTURE
            </div>
            <div className="flex items-center gap-5 font-medium">
              <button type="button" onClick={openGateway} className="hover:text-[var(--text-primary)] transition-colors">
                Role Selector
              </button>
              <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-[var(--text-primary)] transition-colors">
                Register
              </Link>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};
