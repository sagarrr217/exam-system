import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables
  await prisma.focusLossLog.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@exam.com',
      password: passwordHash,
      name: 'Dr. Sarah Connor',
      role: 'ADMIN',
      department: 'Faculty of Engineering & Technology'
    }
  });

  // 2. Create Students
  const student1 = await prisma.user.create({
    data: {
      email: 'student@exam.com',
      password: studentPasswordHash,
      name: 'Alex Johnson',
      role: 'STUDENT',
      studentId: 'STU-2026-001',
      department: 'Computer Science'
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'jane@exam.com',
      password: studentPasswordHash,
      name: 'Jane Doe',
      role: 'STUDENT',
      studentId: 'STU-2026-002',
      department: 'Information Technology'
    }
  });

  console.log('✅ Created users (Admin & Students)');

  // 3. Create Exam 1: Advanced Data Structures & Algorithms
  const exam1 = await prisma.exam.create({
    data: {
      title: 'CS401: Advanced Data Structures & Algorithms',
      subject: 'Computer Science',
      description: 'Comprehensive mid-term examination covering Trees, Graphs, Sorting Complexities, and Dynamic Programming.',
      instructions: '1. This exam consists of 5 multiple-choice questions.\n2. Total duration is 45 minutes.\n3. Switching tabs or minimizing the examination window triggers focus-loss monitoring.\n4. Answers are autosaved in real-time.\n5. Click "Submit Exam" once you have answered all questions.',
      durationMinutes: 45,
      totalMarks: 50,
      passingMarks: 20,
      isPublished: true,
      randomizeQuestions: false,
      randomizeOptions: false,
      allowReview: true,
      autoSubmit: true,
      focusLossThreshold: 3
    }
  });

  // Questions for Exam 1
  const q1_1 = await prisma.question.create({
    data: {
      examId: exam1.id,
      text: 'What is the worst-case time complexity of searching for an element in an un-balanced Binary Search Tree (BST)?',
      type: 'MCQ',
      orderIndex: 0,
      marks: 10,
      isRequired: true,
      explanation: 'In the worst case, a binary search tree degenerates into a linear linked list (skewed tree), yielding O(n) search time.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q1_1.id, text: 'O(log n)', isCorrect: false, orderIndex: 0 },
      { questionId: q1_1.id, text: 'O(n)', isCorrect: true, orderIndex: 1 },
      { questionId: q1_1.id, text: 'O(n log n)', isCorrect: false, orderIndex: 2 },
      { questionId: q1_1.id, text: 'O(1)', isCorrect: false, orderIndex: 3 }
    ]
  });

  const q1_2 = await prisma.question.create({
    data: {
      examId: exam1.id,
      text: 'Which graph traversal algorithm uses a Queue data structure (First-In, First-Out)?',
      type: 'MCQ',
      orderIndex: 1,
      marks: 10,
      isRequired: true,
      explanation: 'Breadth-First Search (BFS) explores vertices layer by layer using a FIFO queue.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q1_2.id, text: 'Depth-First Search (DFS)', isCorrect: false, orderIndex: 0 },
      { questionId: q1_2.id, text: 'Breadth-First Search (BFS)', isCorrect: true, orderIndex: 1 },
      { questionId: q1_2.id, text: 'Topological Sort with Recursion', isCorrect: false, orderIndex: 2 },
      { questionId: q1_2.id, text: 'Bellman-Ford Algorithm', isCorrect: false, orderIndex: 3 }
    ]
  });

  const q1_3 = await prisma.question.create({
    data: {
      examId: exam1.id,
      text: 'Dijkstra’s algorithm for Single-Source Shortest Paths always yields correct results on graphs containing negative edge weights.',
      type: 'TRUE_FALSE',
      orderIndex: 2,
      marks: 10,
      isRequired: true,
      explanation: 'Dijkstra assumes that adding an edge never decreases path length. On graphs with negative edge weights, it can get trapped in incorrect greedy choices; Bellman-Ford should be used instead.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q1_3.id, text: 'True', isCorrect: false, orderIndex: 0 },
      { questionId: q1_3.id, text: 'False', isCorrect: true, orderIndex: 1 }
    ]
  });

  const q1_4 = await prisma.question.create({
    data: {
      examId: exam1.id,
      text: 'What is the auxiliary space complexity of standard in-place HeapSort?',
      type: 'MCQ',
      orderIndex: 3,
      marks: 10,
      isRequired: true,
      explanation: 'HeapSort reorganizes elements within the original array using max-heapify, achieving O(1) auxiliary space.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q1_4.id, text: 'O(1)', isCorrect: true, orderIndex: 0 },
      { questionId: q1_4.id, text: 'O(n)', isCorrect: false, orderIndex: 1 },
      { questionId: q1_4.id, text: 'O(log n)', isCorrect: false, orderIndex: 2 },
      { questionId: q1_4.id, text: 'O(n^2)', isCorrect: false, orderIndex: 3 }
    ]
  });

  const q1_5 = await prisma.question.create({
    data: {
      examId: exam1.id,
      text: 'Which problem-solving paradigm is characterized by solving sub-problems only once and storing their solutions in a lookup table (memoization)?',
      type: 'MCQ',
      orderIndex: 4,
      marks: 10,
      isRequired: true,
      explanation: 'Dynamic Programming optimizes recursive solutions by remembering solutions to overlapping sub-problems.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q1_5.id, text: 'Greedy Technique', isCorrect: false, orderIndex: 0 },
      { questionId: q1_5.id, text: 'Divide and Conquer', isCorrect: false, orderIndex: 1 },
      { questionId: q1_5.id, text: 'Dynamic Programming', isCorrect: true, orderIndex: 2 },
      { questionId: q1_5.id, text: 'Branch and Bound', isCorrect: false, orderIndex: 3 }
    ]
  });

  // 4. Create Exam 2: Web Technologies & Security (Standard Verification Target)
  const exam2 = await prisma.exam.create({
    data: {
      title: 'WEB302: Modern Full-Stack Web Architecture',
      subject: 'Web Technologies',
      description: 'Assessment on REST API conventions, HTTP status codes, CORS security, and modern frontend state management.',
      instructions: 'Read each question carefully. Select the most accurate option. You may navigate between questions at any time.',
      durationMinutes: 30,
      totalMarks: 30,
      passingMarks: 15,
      isPublished: true,
      randomizeQuestions: false,
      randomizeOptions: false,
      allowReview: true,
      autoSubmit: true,
      focusLossThreshold: 3
    }
  });

  const q2_1 = await prisma.question.create({
    data: {
      examId: exam2.id,
      text: 'Which HTTP status code should a RESTful server return upon successfully creating a new resource via a POST request?',
      type: 'MCQ',
      orderIndex: 0,
      marks: 10,
      isRequired: true,
      explanation: 'HTTP 201 Created indicates that the request has succeeded and led to the creation of a resource.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q2_1.id, text: '200 OK', isCorrect: false, orderIndex: 0 },
      { questionId: q2_1.id, text: '201 Created', isCorrect: true, orderIndex: 1 },
      { questionId: q2_1.id, text: '204 No Content', isCorrect: false, orderIndex: 2 },
      { questionId: q2_1.id, text: '202 Accepted', isCorrect: false, orderIndex: 3 }
    ]
  });

  const q2_2 = await prisma.question.create({
    data: {
      examId: exam2.id,
      text: 'Cross-Origin Resource Sharing (CORS) is a server-side mechanism to bypass client-side security policies.',
      type: 'TRUE_FALSE',
      orderIndex: 1,
      marks: 10,
      isRequired: true,
      explanation: 'CORS is a browser security mechanism that restricts cross-origin HTTP requests unless permitted by the origin server headers.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q2_2.id, text: 'True', isCorrect: false, orderIndex: 0 },
      { questionId: q2_2.id, text: 'False', isCorrect: true, orderIndex: 1 }
    ]
  });

  const q2_3 = await prisma.question.create({
    data: {
      examId: exam2.id,
      text: 'Which storage mechanism has data that persists even after the browser window is closed, unless explicitly cleared?',
      type: 'MCQ',
      orderIndex: 2,
      marks: 10,
      isRequired: true,
      explanation: 'localStorage persists across browser sessions, whereas sessionStorage is cleared when the page session ends.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q2_3.id, text: 'sessionStorage', isCorrect: false, orderIndex: 0 },
      { questionId: q2_3.id, text: 'localStorage', isCorrect: true, orderIndex: 1 },
      { questionId: q2_3.id, text: 'JavaScript Memory Heap', isCorrect: false, orderIndex: 2 },
      { questionId: q2_3.id, text: 'HTTP Request Headers', isCorrect: false, orderIndex: 3 }
    ]
  });

  // 5. Create Exam 4: Comprehensive Multi-Format Showcase (MCQ, Checkbox, True/False, Fill Blank, Numerical, Short & Long Essay)
  const exam4 = await prisma.exam.create({
    data: {
      title: 'CS505: Comprehensive Multi-Format Examination Showcase',
      subject: 'Computer Science & Engineering',
      description: 'Production showcase featuring all standard examination question types: Single Choice MCQ, Multi-Select Checkboxes, True/False, Fill-in-the-Blank, Numerical Solution, Short Answer, and Comprehensive 5-Marker Essay.',
      instructions: '1. Pay close attention to each question badge to identify the required answering format.\n2. Multi-Select questions allow selecting multiple correct choices.\n3. Fill in Blanks questions are auto-matched against accepted academic terms.\n4. Detailed 5-Marker Essay questions provide a live word/character counter.\n5. Proctoring monitors focus-loss events with automated warnings.',
      durationMinutes: 60,
      totalMarks: 50,
      passingMarks: 20,
      isPublished: true,
      randomizeQuestions: false,
      randomizeOptions: false,
      allowReview: true,
      autoSubmit: true,
      focusLossThreshold: 3
    }
  });

  // Q4_1: MCQ Single Choice
  const q4_1 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'Which asymptotic notation represents the tight bound (both upper and lower bound) of an algorithm’s running time?',
      type: 'MCQ',
      orderIndex: 0,
      marks: 5,
      isRequired: true,
      explanation: 'Big-Theta (Θ) notation characterizes a tight bound that is asymptotically both O and Ω.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q4_1.id, text: 'Big-O (O)', isCorrect: false, orderIndex: 0 },
      { questionId: q4_1.id, text: 'Big-Theta (Θ)', isCorrect: true, orderIndex: 1 },
      { questionId: q4_1.id, text: 'Big-Omega (Ω)', isCorrect: false, orderIndex: 2 },
      { questionId: q4_1.id, text: 'Little-o (o)', isCorrect: false, orderIndex: 3 }
    ]
  });

  // Q4_2: Multi-Select Checkboxes
  const q4_2 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'Which of the following HTTP methods are defined as IDEMPOTENT by RFC 7231? (Select all that apply)',
      type: 'MULTIPLE_SELECT',
      orderIndex: 1,
      marks: 10,
      isRequired: true,
      explanation: 'GET, PUT, and DELETE are idempotent. Multiple identical requests have the exact same side-effect on the server.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q4_2.id, text: 'GET', isCorrect: true, orderIndex: 0 },
      { questionId: q4_2.id, text: 'PUT', isCorrect: true, orderIndex: 1 },
      { questionId: q4_2.id, text: 'POST', isCorrect: false, orderIndex: 2 },
      { questionId: q4_2.id, text: 'DELETE', isCorrect: true, orderIndex: 3 }
    ]
  });

  // Q4_3: True / False
  const q4_3 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'In relational database theory, a table in 3NF (Third Normal Form) is also guaranteed to be in BCNF (Boyce-Codd Normal Form).',
      type: 'TRUE_FALSE',
      orderIndex: 2,
      marks: 5,
      isRequired: true,
      explanation: 'False. BCNF is a stricter version of 3NF; every BCNF table is in 3NF, but not all 3NF tables satisfy BCNF when overlapping candidate keys exist.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q4_3.id, text: 'True', isCorrect: false, orderIndex: 0 },
      { questionId: q4_3.id, text: 'False', isCorrect: true, orderIndex: 1 }
    ]
  });

  // Q4_4: Fill in the Blank
  const q4_4 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'What three-letter acronym denotes the cryptographic protocol that succeeded SSL to secure internet communications?',
      type: 'FILL_BLANK',
      orderIndex: 3,
      marks: 5,
      isRequired: true,
      explanation: 'TLS (Transport Layer Security) is the cryptographic protocol that succeeded SSL.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q4_4.id, text: 'TLS', isCorrect: true, orderIndex: 0 },
      { questionId: q4_4.id, text: 'tls', isCorrect: true, orderIndex: 1 },
      { questionId: q4_4.id, text: 'Transport Layer Security', isCorrect: true, orderIndex: 2 }
    ]
  });

  // Q4_5: Numerical Solution
  const q4_5 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'What is the default TCP port number reserved and assigned for secure Hypertext Transfer Protocol (HTTPS) communication?',
      type: 'NUMERICAL',
      orderIndex: 4,
      marks: 5,
      isRequired: true,
      explanation: 'Port 443 is the standard port for HTTPS traffic.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q4_5.id, text: '443', isCorrect: true, orderIndex: 0 }
    ]
  });

  // Q4_6: Short Answer
  const q4_6 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'Briefly explain the ACID properties in database transaction management and why atomicity is critical.',
      type: 'SHORT_ANSWER',
      orderIndex: 5,
      marks: 5,
      isRequired: true,
      explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures all operations succeed or all are rolled back.'
    }
  });

  // Q4_7: Detailed 5-Marker Essay
  const q4_7 = await prisma.question.create({
    data: {
      examId: exam4.id,
      text: 'Detailed 5-Marker Essay Question: Compare and contrast Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG). Analyze their architectural trade-offs with respect to Time to First Byte (TTFB), First Contentful Paint (FCP), Search Engine Optimization (SEO), and dynamic data freshness.',
      type: 'LONG_ANSWER',
      orderIndex: 6,
      marks: 15,
      isRequired: true,
      explanation: 'CSR downloads JavaScript and renders in client; fast transitions but slow FCP. SSR renders per request on server; optimal SEO but higher TTFB. SSG pre-renders at build time; instant TTFB and top SEO via CDN edge caching.'
    }
  });

  // 5. Create Exam 3: Cybersecurity (Draft)
  const exam3 = await prisma.exam.create({
    data: {
      title: 'SEC501: Fundamentals of Network Defense',
      subject: 'Information Security',
      description: 'Draft assessment covering symmetric and asymmetric encryption, public key infrastructure, and firewall rulesets.',
      instructions: 'Standard proctored exam conditions apply.',
      durationMinutes: 60,
      totalMarks: 40,
      passingMarks: 20,
      isPublished: false,
      focusLossThreshold: 2
    }
  });

  const q3_1 = await prisma.question.create({
    data: {
      examId: exam3.id,
      text: 'Which of the following encryption algorithms is an asymmetric key cipher?',
      type: 'MCQ',
      orderIndex: 0,
      marks: 20,
      isRequired: true,
      explanation: 'RSA relies on a public and private key pair, making it an asymmetric cipher.'
    }
  });

  await prisma.option.createMany({
    data: [
      { questionId: q3_1.id, text: 'AES-256', isCorrect: false, orderIndex: 0 },
      { questionId: q3_1.id, text: 'RSA', isCorrect: true, orderIndex: 1 },
      { questionId: q3_1.id, text: 'DES', isCorrect: false, orderIndex: 2 },
      { questionId: q3_1.id, text: 'Blowfish', isCorrect: false, orderIndex: 3 }
    ]
  });

  // 6. Create a completed submission for Jane Doe on Exam 1 for immediate admin analytics demo
  const attempt = await prisma.examAttempt.create({
    data: {
      examId: exam1.id,
      studentId: student2.id,
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      submittedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      status: 'SUBMITTED',
      score: 40,
      percentage: 80,
      passed: true,
      totalAnswered: 5,
      totalUnanswered: 0
    }
  });

  // Seed answers for Jane Doe
  const options1 = await prisma.option.findMany({ where: { questionId: q1_1.id } });
  const options2 = await prisma.option.findMany({ where: { questionId: q1_2.id } });
  const options3 = await prisma.option.findMany({ where: { questionId: q1_3.id } });
  const options4 = await prisma.option.findMany({ where: { questionId: q1_4.id } });
  const options5 = await prisma.option.findMany({ where: { questionId: q1_5.id } });

  await prisma.studentAnswer.createMany({
    data: [
      {
        attemptId: attempt.id,
        questionId: q1_1.id,
        selectedOptionId: options1.find(o => o.isCorrect)?.id,
        isCorrect: true,
        marksAwarded: 10
      },
      {
        attemptId: attempt.id,
        questionId: q1_2.id,
        selectedOptionId: options2.find(o => o.isCorrect)?.id,
        isCorrect: true,
        marksAwarded: 10
      },
      {
        attemptId: attempt.id,
        questionId: q1_3.id,
        selectedOptionId: options3.find(o => o.isCorrect)?.id,
        isCorrect: true,
        marksAwarded: 10
      },
      {
        attemptId: attempt.id,
        questionId: q1_4.id,
        selectedOptionId: options4.find(o => !o.isCorrect)?.id, // picked wrong
        isCorrect: false,
        marksAwarded: 0
      },
      {
        attemptId: attempt.id,
        questionId: q1_5.id,
        selectedOptionId: options5.find(o => o.isCorrect)?.id,
        isCorrect: true,
        marksAwarded: 10
      }
    ]
  });

  // Seed sample focus loss events for Jane Doe
  await prisma.focusLossLog.createMany({
    data: [
      {
        attemptId: attempt.id,
        eventType: 'WINDOW_BLUR',
        timestamp: new Date(Date.now() - 22 * 60 * 1000),
        details: 'Student clicked outside examination window or switched application',
        durationSeconds: 4.2
      },
      {
        attemptId: attempt.id,
        eventType: 'VISIBILITY_HIDDEN',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        details: 'Browser tab switched or minimized',
        durationSeconds: 8.5
      }
    ]
  });

  console.log('✅ Created sample examinations, questions, options, attempt, and focus-loss logs.');
  console.log('🏁 Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error in seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
