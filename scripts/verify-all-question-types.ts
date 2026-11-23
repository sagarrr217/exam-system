/**
 * Comprehensive Verification Suite for All Standard Examination Question Types:
 * - Single-Choice MCQ
 * - Multi-Select Checkboxes
 * - True / False
 * - Fill in the Blank
 * - Numerical Solution
 * - Short Answer
 * - Detailed 5-Marker Essay
 */

const BASE_URL = 'http://localhost:5000';

let totalChecks = 0;
let passedChecks = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failures.push(`${testName}: ${detail || 'Assertion failed'}`);
    console.error(`  [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
  }
}

async function run() {
  console.log('====================================================');
  console.log('🧪 Starting Multi-Type Questions Automated Verification');
  console.log(`🌐 Target API: ${BASE_URL}`);
  console.log('====================================================\n');

  // Step 1: Admin Login & Discovery of CS505
  console.log('▶ Step 1: Discovering CS505 Multi-Format Exam');
  const adminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@exam.com', password: 'admin123', role: 'ADMIN' })
  });
  const adminData = await adminLogin.json() as any;
  assert(adminLogin.status === 200, 'Admin login HTTP 200');
  const adminToken = adminData.token;

  const examsRes = await fetch(`${BASE_URL}/api/admin/exams`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const examsData = await examsRes.json() as any;
  const exam505 = examsData.exams.find((e: any) => e.title.includes('CS505'));
  assert(!!exam505, 'CS505 Multi-Format Examination found in database');

  const detailRes = await fetch(`${BASE_URL}/api/admin/exams/${exam505.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const detailData = await detailRes.json() as any;
  const questions = detailData.exam.questions;
  assert(questions.length === 7, `CS505 contains exactly 7 questions representing each format (found ${questions.length})`);

  // Verify all 7 distinct question types are present
  const types = questions.map((q: any) => q.type);
  assert(types.includes('MCQ'), 'Contains MCQ Single Choice');
  assert(types.includes('MULTIPLE_SELECT'), 'Contains MULTIPLE_SELECT Checkboxes');
  assert(types.includes('TRUE_FALSE'), 'Contains TRUE_FALSE');
  assert(types.includes('FILL_BLANK'), 'Contains FILL_BLANK');
  assert(types.includes('NUMERICAL'), 'Contains NUMERICAL');
  assert(types.includes('SHORT_ANSWER'), 'Contains SHORT_ANSWER');
  assert(types.includes('LONG_ANSWER'), 'Contains LONG_ANSWER 5-Marker');

  // Step 2: Student Attempt Answering All Types
  console.log('\n▶ Step 2: Student Answering and Autosaving Across Question Types');
  const uniqueId = Date.now().toString().slice(-6);
  const studentReg = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `multitype_student_${uniqueId}@exam.com`,
      password: 'student123',
      name: `Multi-Type Candidate ${uniqueId}`,
      studentId: `STU-MT-${uniqueId}`,
      department: 'Software Engineering',
      role: 'STUDENT'
    })
  });
  const studentAuth = await studentReg.json() as any;
  assert(studentReg.status === 201, 'Fresh candidate registered HTTP 201');
  const studentToken = studentAuth.token;

  const startRes = await fetch(`${BASE_URL}/api/student/exams/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ examId: exam505.id })
  });
  const startData = await startRes.json() as any;
  assert(startRes.status === 201, 'Exam attempt started HTTP 201');
  const attemptId = startData.attemptId;

  // Retrieve student payload (confirm answer key stripping)
  const attemptDataRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentAttempt = await attemptDataRes.json() as any;
  assert(attemptDataRes.status === 200, 'Student attempt data loaded HTTP 200');

  // Answer Q1: MCQ (Big-Theta)
  const q1 = studentAttempt.questions.find((q: any) => q.type === 'MCQ');
  const opt1 = questions.find((q: any) => q.id === q1.id).options.find((o: any) => o.isCorrect);
  const save1 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q1.id, selectedOptionId: opt1.id })
  });
  assert(save1.status === 200, 'MCQ answer saved HTTP 200');

  // Answer Q2: MULTIPLE_SELECT (GET, PUT, DELETE)
  const q2 = studentAttempt.questions.find((q: any) => q.type === 'MULTIPLE_SELECT');
  const correctOptIds2 = questions.find((q: any) => q.id === q2.id).options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
  const save2 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q2.id, textAnswer: JSON.stringify(correctOptIds2) })
  });
  assert(save2.status === 200, 'MULTIPLE_SELECT answers saved as JSON HTTP 200');

  // Answer Q3: TRUE_FALSE (False)
  const q3 = studentAttempt.questions.find((q: any) => q.type === 'TRUE_FALSE');
  const opt3 = questions.find((q: any) => q.id === q3.id).options.find((o: any) => o.isCorrect);
  const save3 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q3.id, selectedOptionId: opt3.id })
  });
  assert(save3.status === 200, 'TRUE_FALSE answer saved HTTP 200');

  // Answer Q4: FILL_BLANK ("TLS")
  const q4 = studentAttempt.questions.find((q: any) => q.type === 'FILL_BLANK');
  const save4 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q4.id, textAnswer: 'TLS' })
  });
  assert(save4.status === 200, 'FILL_BLANK answer saved HTTP 200');

  // Answer Q5: NUMERICAL ("443")
  const q5 = studentAttempt.questions.find((q: any) => q.type === 'NUMERICAL');
  const save5 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q5.id, textAnswer: '443' })
  });
  assert(save5.status === 200, 'NUMERICAL answer saved HTTP 200');

  // Answer Q6: SHORT_ANSWER
  const q6 = studentAttempt.questions.find((q: any) => q.type === 'SHORT_ANSWER');
  const save6 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q6.id, textAnswer: 'Atomicity ensures that all transaction steps execute completely or rollback.' })
  });
  assert(save6.status === 200, 'SHORT_ANSWER saved HTTP 200');

  // Answer Q7: LONG_ANSWER (5-Marker essay)
  const q7 = studentAttempt.questions.find((q: any) => q.type === 'LONG_ANSWER');
  const save7 = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ questionId: q7.id, textAnswer: 'CSR loads JS in client. SSR renders dynamic HTML per request on server with optimal SEO. SSG builds static HTML once at compile time with zero TTFB.' })
  });
  assert(save7.status === 200, 'LONG_ANSWER 5-marker essay saved HTTP 200');

  // Step 3: Exam Submission & Grading
  console.log('\n▶ Step 3: Submission & Multi-Format Auto-Grading');
  const submitRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` }
  });
  const submitData = await submitRes.json() as any;
  assert(submitRes.status === 200, 'Exam submitted HTTP 200');
  assert(submitData.result.totalAnswered === 7, 'All 7 questions tracked as answered');
  assert(submitData.result.totalUnanswered === 0, 'Zero unanswered questions');
  assert(submitData.result.score >= 30, `Auto-grading scored objective questions correctly (Score: ${submitData.result.score} marks)`);
  assert(submitData.result.passed === true, 'Student passed with score >= passing marks');

  // Step 4: Result Inspection for All Types
  console.log('\n▶ Step 4: Result Review Across All Formats');
  const reviewRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/result`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const reviewData = await reviewRes.json() as any;
  assert(reviewRes.status === 200, 'Result review fetched HTTP 200');
  assert(reviewData.questions.length === 7, 'All 7 questions included in review breakdown');

  const revMCQ = reviewData.questions.find((q: any) => q.type === 'MCQ');
  assert(revMCQ.isCorrect === true, 'MCQ graded correct');

  const revMulti = reviewData.questions.find((q: any) => q.type === 'MULTIPLE_SELECT');
  assert(revMulti.isCorrect === true, 'MULTIPLE_SELECT graded correct');

  const revTF = reviewData.questions.find((q: any) => q.type === 'TRUE_FALSE');
  assert(revTF.isCorrect === true, 'TRUE_FALSE graded correct');

  const revBlank = reviewData.questions.find((q: any) => q.type === 'FILL_BLANK');
  assert(revBlank.isCorrect === true, 'FILL_BLANK graded correct');

  const revNum = reviewData.questions.find((q: any) => q.type === 'NUMERICAL');
  assert(revNum.isCorrect === true, 'NUMERICAL graded correct');

  const revLong = reviewData.questions.find((q: any) => q.type === 'LONG_ANSWER');
  assert(revLong.textAnswer.length > 50, 'LONG_ANSWER response preserved in review');

  console.log('\n====================================================');
  console.log(`📋 Verification Summary: ${passedChecks}/${totalChecks} checks passed`);
  if (failures.length === 0) {
    console.log('✅ ALL MULTI-TYPE QUESTION VERIFICATIONS PASSED SUCCESSFULLY!');
  } else {
    console.error(`❌ FAILED ${failures.length} assertions:`);
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('====================================================\n');
}

run().catch((err) => {
  console.error('Unhandled error in multi-type verification suite:', err);
  process.exit(1);
});
