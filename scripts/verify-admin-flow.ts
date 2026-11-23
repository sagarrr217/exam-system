/**
 * Automated Verification Script: Admin Flow, Question Builder & CSV Export
 * 
 * Verifies:
 * 1. Admin authentication & dashboard metric aggregation (GET /api/admin/dashboard-stats).
 * 2. Google Forms-style question builder creation (MCQ, True/False, options, correct designations).
 * 3. Publish validation gate enforcement (HTTP 400 on 0 questions, HTTP 200 on valid exam).
 * 4. Deep exam duplication (cloning all questions, options, settings as draft copy).
 * 5. Candidate submissions roster & detailed attempt audit inspection.
 * 6. RFC 4180 CSV export content and structure validation.
 * 7. Verification artifact cleanup.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

interface TestResult {
  step: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, step: string, details?: string): void {
  if (condition) {
    console.log(`  [PASS] ${step}`);
    results.push({ step, passed: true, details });
  } else {
    console.error(`  [FAIL] ${step}: ${details || 'Assertion failed'}`);
    results.push({ step, passed: false, details });
  }
}

async function run(): Promise<void> {
  console.log('====================================================');
  console.log('🛠️ Starting Admin Flow & Builder Verification Suite');
  console.log(`🌐 Target API: ${BASE_URL}`);
  console.log('====================================================\n');

  // Step 1: Admin Authentication
  console.log('▶ Step 1: Administrator Authentication');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@exam.com', password: 'admin123' })
  });
  const loginData = await loginRes.json() as any;
  assert(loginRes.status === 200, 'Admin login HTTP 200');
  assert(loginData.user?.role === 'ADMIN', 'Admin role verified');
  const token = loginData.token;

  // Step 2: Dashboard Stats Verification
  console.log('\n▶ Step 2: Dashboard Analytics & Operational Metrics');
  const statsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statsData = await statsRes.json() as any;
  assert(statsRes.status === 200, 'GET /api/admin/dashboard-stats returns HTTP 200');
  assert(typeof statsData.stats?.totalExams === 'number' && statsData.stats.totalExams >= 3, 'Total exams count is >= 3', `Count: ${statsData.stats?.totalExams}`);
  assert(typeof statsData.stats?.totalStudents === 'number' && statsData.stats.totalStudents >= 2, 'Total students count is >= 2', `Count: ${statsData.stats?.totalStudents}`);
  assert(typeof statsData.stats?.totalSubmissions === 'number' && statsData.stats.totalSubmissions >= 1, 'Total submissions count is >= 1', `Count: ${statsData.stats?.totalSubmissions}`);
  assert(!isNaN(Number(statsData.stats?.passRate)), 'passRate is valid numeric value', `PassRate: ${statsData.stats?.passRate}%`);
  assert(!isNaN(Number(statsData.stats?.averageScore)), 'averageScore is valid numeric value', `AvgScore: ${statsData.stats?.averageScore}`);
  assert(typeof statsData.stats?.highRiskAttemptsCount === 'number', 'highRiskAttemptsCount is numeric', `HighRisk: ${statsData.stats?.highRiskAttemptsCount}`);

  // Step 3: Google Forms-Style Question Builder Creation
  console.log('\n▶ Step 3: Question Builder Exam Creation (MCQ & True/False)');
  const createExamRes = await fetch(`${BASE_URL}/api/admin/exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'QA-ADMIN-TEST: Comprehensive Verification Exam',
      subject: 'Quality Assurance',
      description: 'Automated E2E Admin Verification Exam with multi-type questions',
      instructions: 'Answer all objective questions. Autosave is enabled.',
      durationMinutes: 45,
      totalMarks: 20,
      passingMarks: 10,
      randomizeQuestions: true,
      randomizeOptions: true,
      allowReview: true,
      autoSubmit: true,
      focusLossThreshold: 2,
      questions: [
        {
          text: 'What is the primary characteristic of an idempotent HTTP method?',
          type: 'MCQ',
          orderIndex: 0,
          marks: 10,
          isRequired: true,
          explanation: 'Making multiple identical requests has the same effect as making a single request.',
          options: [
            { text: 'It always returns status 200', isCorrect: false, orderIndex: 0 },
            { text: 'Multiple identical requests produce the same server-side outcome', isCorrect: true, orderIndex: 1 },
            { text: 'It caches data indefinitely', isCorrect: false, orderIndex: 2 }
          ]
        },
        {
          text: 'A foreign key in a relational database enforces referential integrity.',
          type: 'TRUE_FALSE',
          orderIndex: 1,
          marks: 10,
          isRequired: true,
          explanation: 'Foreign keys establish relationships and enforce referential consistency between tables.',
          options: [
            { text: 'True', isCorrect: true, orderIndex: 0 },
            { text: 'False', isCorrect: false, orderIndex: 1 }
          ]
        }
      ]
    })
  });
  const createExamData = await createExamRes.json() as any;
  assert(createExamRes.status === 201, 'POST /api/admin/exams returns HTTP 201');
  assert(createExamData.exam?.title === 'QA-ADMIN-TEST: Comprehensive Verification Exam', 'Exam title matches creation payload');
  assert(createExamData.exam?.isPublished === false, 'New exam defaults to unpublished draft');
  assert(Array.isArray(createExamData.exam?.questions) && createExamData.exam.questions.length === 2, 'Two questions successfully constructed');

  const testExamId = createExamData.exam.id;

  // Verify questions and options
  const createdQ1 = createExamData.exam.questions.find((q: any) => q.type === 'MCQ');
  const createdQ2 = createExamData.exam.questions.find((q: any) => q.type === 'TRUE_FALSE');
  assert(createdQ1?.options?.length === 3, 'MCQ question possesses exactly 3 options');
  assert(createdQ1?.options?.some((o: any) => o.isCorrect === true), 'MCQ option designated as correct');
  assert(createdQ2?.options?.length === 2, 'True/False question possesses exactly 2 options');
  assert(createdQ2?.options?.some((o: any) => o.isCorrect === true), 'True/False option designated as correct');

  // Step 4: Publish Validation Gate
  console.log('\n▶ Step 4: Publish Validation Gate Enforcement');
  // 4A: Reject publishing exam with 0 questions
  const emptyExamRes = await fetch(`${BASE_URL}/api/admin/exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'EMPTY-DRAFT-EXAM',
      subject: 'Temporary',
      durationMinutes: 30,
      questions: []
    })
  });
  const emptyExamData = await emptyExamRes.json() as any;
  const emptyExamId = emptyExamData.exam?.id;

  const publishEmptyRes = await fetch(`${BASE_URL}/api/admin/exams/${emptyExamId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  const publishEmptyData = await publishEmptyRes.json() as any;
  assert(publishEmptyRes.status === 400, 'Publishing 0-question exam rejected with HTTP 400', `Status: ${publishEmptyRes.status}`);
  assert(
    publishEmptyData.error === 'Cannot publish an examination with no questions. Please add questions first.',
    'Validation gate error message matches authoritative specification',
    `Error: ${publishEmptyData.error}`
  );

  // Clean up empty exam
  await fetch(`${BASE_URL}/api/admin/exams/${emptyExamId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  // 4B: Publish valid created exam
  const publishValidRes = await fetch(`${BASE_URL}/api/admin/exams/${testExamId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  const publishValidData = await publishValidRes.json() as any;
  assert(publishValidRes.status === 200, 'Publishing valid exam returns HTTP 200');
  assert(publishValidData.isPublished === true, 'Exam status toggled to isPublished: true');
  assert(publishValidData.message === 'Examination published successfully.', 'Publish confirmation message asserted');

  // Step 5: Exam Duplication
  console.log('\n▶ Step 5: Deep Exam Duplication');
  const duplicateRes = await fetch(`${BASE_URL}/api/admin/exams/${testExamId}/duplicate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const duplicateData = await duplicateRes.json() as any;
  assert(duplicateRes.status === 201, 'Exam duplication returns HTTP 201');
  assert(
    duplicateData.exam?.title === 'QA-ADMIN-TEST: Comprehensive Verification Exam (Copy)',
    'Cloned exam title appends (Copy)',
    `Title: ${duplicateData.exam?.title}`
  );
  assert(duplicateData.exam?.isPublished === false, 'Cloned exam is reset to draft status (isPublished: false)');
  const duplicateExamId = duplicateData.exam?.id;

  // Clean up duplicated copy
  const deleteDuplicateRes = await fetch(`${BASE_URL}/api/admin/exams/${duplicateExamId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(deleteDuplicateRes.status === 200, 'Duplicated copy cleaned up via DELETE HTTP 200');

  // Step 6: Candidate Submissions Roster & Detail Inspection
  console.log('\n▶ Step 6: Candidate Submissions Roster & Audit Inspection');
  const submissionsRes = await fetch(`${BASE_URL}/api/admin/submissions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const submissionsData = await submissionsRes.json() as any;
  assert(submissionsRes.status === 200, 'GET /api/admin/submissions returns HTTP 200');
  assert(Array.isArray(submissionsData.submissions) && submissionsData.submissions.length > 0, 'Submissions list populated');

  // Find Jane Doe's submission from seed data
  const janeSubmission = submissionsData.submissions.find((s: any) => s.student?.email === 'jane@exam.com');
  assert(!!janeSubmission, 'Jane Doe seeded submission found in submissions roster');
  assert(janeSubmission?.score === 40, 'Jane Doe score is 40 marks', `Score: ${janeSubmission?.score}`);
  assert(janeSubmission?.passed === true, 'Jane Doe passed status is true');
  assert(
    typeof janeSubmission?._count?.focusLossLogs === 'number' && janeSubmission._count.focusLossLogs >= 2,
    'Focus-loss event count recorded in submission summary',
    `Count: ${janeSubmission?._count?.focusLossLogs}`
  );

  // Deep detail inspection
  const detailRes = await fetch(`${BASE_URL}/api/admin/submissions/${janeSubmission.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const detailData = await detailRes.json() as any;
  assert(detailRes.status === 200, 'GET /api/admin/submissions/:id returns HTTP 200');
  assert(detailData.attempt?.student?.name === 'Jane Doe', 'Candidate name confirmed in deep audit');
  assert(Array.isArray(detailData.attempt?.answers) && detailData.attempt.answers.length === 5, 'All 5 question responses present in deep audit');
  assert(Array.isArray(detailData.attempt?.focusLossLogs) && detailData.attempt.focusLossLogs.length >= 2, 'Chronological focus-loss audit logs present');

  // Step 7: RFC 4180 CSV Export Validation
  console.log('\n▶ Step 7: RFC 4180 CSV Export Structure & Content Validation');
  const allExamsRes = await fetch(`${BASE_URL}/api/admin/exams`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const allExamsData = await allExamsRes.json() as any;
  const exam1 = allExamsData.exams.find((e: any) => e.title?.includes('CS401'));
  assert(!!exam1, 'Exam 1 (CS401) found for CSV export check');

  const exportRes = await fetch(`${BASE_URL}/api/admin/exams/${exam1.id}/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(exportRes.status === 200, 'GET /api/admin/exams/:id/export returns HTTP 200');
  const contentType = exportRes.headers.get('content-type') || '';
  assert(contentType.includes('text/csv'), 'Content-Type is text/csv', `Header: ${contentType}`);

  const csvText = await exportRes.text();
  const csvLines = csvText.trim().split(/\r?\n/);
  assert(csvLines.length >= 2, 'CSV contains header line and at least one candidate row', `Lines: ${csvLines.length}`);

  const expectedHeader = 'Student ID,Student Name,Email,Department,Score,Total Marks,Percentage (%),Status (Pass/Fail),Answered Count,Unanswered Count,Focus Loss Incidents,Start Time,Submitted At';
  assert(csvLines[0] === expectedHeader, 'RFC 4180 CSV header exactly matches specification');

  // Validate Jane Doe's CSV row
  const janeRow = csvLines.find(line => line.includes('jane@exam.com'));
  assert(!!janeRow, 'Jane Doe data record present in CSV export');
  assert(janeRow!.includes('"STU-2026-002"'), 'Student ID column correctly quoted');
  assert(janeRow!.includes('"Jane Doe"'), 'Student Name column correctly quoted');
  assert(janeRow!.includes('40'), 'Candidate score present in CSV record');
  assert(janeRow!.includes('PASSED'), 'Status column reflects PASSED');

  // Step 8: Verification Exam Cleanup
  console.log('\n▶ Step 8: Test Examination Cleanup');
  const deleteRes = await fetch(`${BASE_URL}/api/admin/exams/${testExamId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(deleteRes.status === 200, 'Created test examination deleted via DELETE HTTP 200');

  // Verify deletion
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/admin/exams`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const verifyDeleteData = await verifyDeleteRes.json() as any;
  const stillExists = verifyDeleteData.exams.some((e: any) => e.id === testExamId);
  assert(!stillExists, 'Test examination successfully removed from database');

  // Summary
  const failed = results.filter(r => !r.passed);
  console.log('\n====================================================');
  console.log(`📋 Verification Summary: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`❌ FAILED ${failed.length} assertions:`);
    failed.forEach(f => console.error(`  - ${f.step}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('✅ ALL ADMIN FLOW & QUESTION BUILDER VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal admin flow verification execution error:', err);
  process.exit(1);
});
