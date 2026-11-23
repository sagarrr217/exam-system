# Dual-Interface Examination System

A modern, secure, and responsive web-based examination platform engineered with an Express, TypeScript, and Prisma backend and a React 18, Vite, and Tailwind CSS frontend.

---

## 🏛️ System Architecture

The application is structured into two integrated interfaces sharing a central SQLite database via Prisma ORM:

1. **Student Examination Panel**:
   - **Dashboard**: Browse available, in-progress, upcoming, and completed examinations with metadata (duration, total marks, pass marks, status).
   - **Pre-Exam Instructions Modal**: Rules, duration details, and explicit proctoring consent prior to launch.
   - **Restricted Exam Interface**: Opens in a dedicated pop-out window with fullscreen capability, no distracting navigation, a persistent timer header, and accidental exit confirmation.
   - **Proctoring & Focus-Loss Monitoring**: Detects window `blur` and document `visibilitychange` (tab switches/minimizing), logs timestamped violation events, and alerts the student when threshold is exceeded without destroying answers.
   - **Live Answering Experience**: Autosaving answers to the backend on selection or input blur, interactive Question Palette showing Answered / Marked for Review / Unanswered states, and a pre-submission review modal.
   - **Detailed Results Breakdown**: Shows score, percentage, passing status, submitted answers, and instructor explanations (if permitted by exam settings).

2. **Admin Management Panel**:
   - **Executive Dashboard**: KPI overview including total exams, active candidates, completed submissions, pass rates, and focus-loss violation alerts.
   - **Google Forms-Inspired Question Builder**: Interactive card-based editor supporting question creation, image/diagram uploads, option management, marking correct answers, score setting, reordering, and duplication.
   - **Comprehensive Exam Configuration**: Availability windows (start/end dates), time limit, pass marks, question/option randomization, student result review toggle, and auto-submit on timer expiry.
   - **Candidate Submissions & Audit**: Review individual student submissions, answer breakdowns, and chronological focus-loss proctoring violation logs.
   - **Data Export**: One-click RFC 4180 CSV export of examination results for grading and academic records.

---

## 📝 Supported Question Types

The system supports all standard academic examination question formats with dedicated interactive UI inputs and automated grading:

| Question Type | Answering UI | Evaluation Mechanism |
| :--- | :--- | :--- |
| **Multiple Choice (Single)** | Selectable radio cards | Exact option ID match against designated correct option |
| **Multi-Select Checkboxes** | Multi-select checkbox cards | Set-equality match against all designated correct options |
| **True / False** | Prominent Affirmative / Negative cards | Binary choice match |
| **Fill in the Blank** | Single-line underlined text input | Case-insensitive trimmed match against acceptable answers |
| **Numerical Solution** | Numeric input with step support | Numeric match with floating-point tolerance of $\pm 0.001$ |
| **Short Answer** | Concise paragraph textarea | Autosaved response with word count |
| **Detailed 5-Marker Essay** | Expanded 10-row essay textarea | Live word & character counters, descriptive evaluation |

---

## 🛡️ Anti-Cheat & Security Guardrails

- **Answer Key Redaction**: `GET /api/student/attempts/:id` strictly excludes `isCorrect` from options and `explanation` from questions, preventing students from inspecting solutions via browser DevTools.
- **Role-Based Access Control (RBAC)**: Enforced via JWT middleware; student tokens are rejected on admin endpoints (HTTP 403) and admin tokens are barred from student attempt flows.
- **Post-Submission Immutability**: Once submitted or expired, attempt records and student answers are permanently locked from further modification.
- **Authentic Proctoring Compliance**: Utilizes standard browser APIs (`blur`, `visibilitychange`, `beforeunload`) and records timestamped violations to the database rather than falsely claiming absolute OS-level lockdown.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Initial Setup
```bash
# Install dependencies for both backend and frontend, and generate Prisma client
npm run install:all

# Seed database with sample users, examinations, and question types
npm run seed
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend Application (Port 5173)
npm run dev:frontend
```

Visit **http://localhost:5173** in your browser.

---

## 🌐 Deployment Guide (Access From Anywhere)

The application has been unified into a single fullstack service where Express serves the frontend SPA alongside the API on a single port.

### Option 1: 100% Free Cloud Deployment on Render.com (Recommended)
1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of examination system"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin master
   ```
2. Go to [render.com](https://render.com) and sign in with GitHub.
3. Click **New +** $\rightarrow$ **Web Service** $\rightarrow$ Select your repository.
4. Render will automatically detect the configuration from [render.yaml](file:///c:/Users/Lenovo/Desktop/5th%20SEM%20project/render.yaml), or enter:
   - **Environment**: `Node`
   - **Build Command**: `npm run build:all && npm run seed`
   - **Start Command**: `npm run start`
5. Click **Deploy Web Service**. You will receive an immediate public URL (e.g. `https://your-exam-system.onrender.com`) that you can open from any smartphone or computer anywhere in the world!

---

### Option 2: 1-Click Container Deployment on Railway.app
1. Push your repository to GitHub.
2. Go to [railway.app](https://railway.app) and click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Railway automatically detects the included [Dockerfile](file:///c:/Users/Lenovo/Desktop/5th%20SEM%20project/Dockerfile) and provisions the container with a public HTTPS domain.

---

### Option 3: Instant Live Phone Access via Local Tunnel (No Signup / 10 Seconds)
If your computer is currently running the server and you want to open it on your smartphone right now without signing up for cloud hosting:
```bash
# In your terminal, run:
npx localtunnel --port 5000
```
This generates an instant public HTTPS link (e.g. `https://funny-tiger-42.loca.lt`) that you can type directly into your phone's browser to use the full system immediately!

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@exam.com` | `admin123` | Dr. Sarah Connor (Faculty Admin) |
| **Student 1** | `student@exam.com` | `student123` | Alex Johnson (`STU-2026-001`) |
| **Student 2** | `jane@exam.com` | `student123` | Jane Doe (`STU-2026-002`) |

---

## 🧪 Automated Verification Suite

Run all programmatic end-to-end integration verification tests:

```bash
# Run all test suites (Auth, Lifecycle, Admin, and Multi-Type Questions)
npm run test:all
```

Or execute individual test suites:
```bash
npm run test:auth             # Auth & RBAC access control (28/28 checks)
npm run test:lifecycle        # Student lifecycle & proctoring (44/44 checks)
npm run test:admin            # Admin builder, audits & CSV export (48/48 checks)
npm run test:question-types   # All 7 question types verification (33/33 checks)
```

**Total Test Coverage: 153 / 153 automated checks passing (100% pass rate).**

---

## 📁 Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Exam, Question, Option, Attempt, Logs)
│   │   └── seed.ts             # Comprehensive database seed script
│   ├── src/
│   │   ├── controllers/        # auth, admin, student controllers
│   │   ├── middleware/         # auth and RBAC middleware
│   │   ├── routes/             # RESTful API route definitions
│   │   └── server.ts           # Express server entry point (Port 5000)
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts       # Typed HTTP client for all endpoints
│   │   ├── components/         # QuestionCard, QuestionPalette, PersistentExamHeader, Modals
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, ExamManagement, QuestionBuilder, Submissions, FocusLogs
│   │   │   └── student/        # Dashboard, ExamPortal (restricted window), ExamResult
│   │   └── types/              # TypeScript interface contracts
│   └── vite.config.ts
├── scripts/
│   ├── verify-auth-rbac.ts
│   ├── verify-exam-lifecycle.ts
│   ├── verify-admin-flow.ts
│   └── verify-all-question-types.ts
└── package.json
```
