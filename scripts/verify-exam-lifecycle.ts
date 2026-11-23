/**
 * Automated Verification Script: Student Exam Attempt Lifecycle
 * 
 * Verifies:
 * 1. Exam discovery via /api/student/exams.
 * 2. Starting an attempt via /api/student/exams/start.
 * 3. Anti-cheat secrecy guardrails: isCorrect and explanation stripped in GET /api/student/attempts/:id.
 * 4. Real-time autosave answer upsert and question palette counter updates.
 * 5. Proctoring focus-loss multi-event logging and threshold limit exceeded warning.
 * 6. Server-side auto-grading evaluation (score, percentage, pass/fail, answered/unanswered counts).
 * 7. Post-submission immutability locks (HTTP 400 on answer mutation or re-submission).
 * 8. Result review inspection with answer breakdown when allowReview is true.
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
  console.log('📝 Starting Exam Lifecycle Automated Verification Suite');
  console.log(`🌐 Target API: ${BASE_URL}`);
  console.log('====================================================\n');

  // Step 1: Student Authentication & Exam Discovery
  console.log('▶ Step 1: Student Authentication & Published Exam Discovery');
  let studentEmail = 'student@exam.com';
  let studentPassword = 'student123';

  let loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: studentPassword })
  });
  let loginData = await loginRes.json() as any;
  assert(loginRes.status === 200, 'Student login HTTP 200', `Status: ${loginRes.status}`);
  let token = loginData.token;

  let examsRes = await fetch(`${BASE_URL}/api/student/exams`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  let examsData = await examsRes.json() as any;
  assert(examsRes.status === 200, 'GET /api/student/exams returns HTTP 200');
  assert(Array.isArray(examsData.exams) && examsData.exams.length > 0, 'Exams list populated');

  // Find target exam WEB302
  let targetExam = examsData.exams.find((e: any) => e.title?.includes('WEB302'));
  assert(!!targetExam, 'Target exam WEB302 discovered', `Found: ${targetExam?.title}`);

  // If already completed by student@exam.com, register a fresh dedicated test student
  if (targetExam?.userExamStatus === 'COMPLETED') {
    console.log('  [INFO] Target exam was previously completed; registering isolated test student for fresh attempt');
    const freshSuffix = Date.now().toString().slice(-6);
    studentEmail = `test_student_${freshSuffix}@exam.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: 'student123',
        name: `Lifecycle Tester ${freshSuffix}`,
        studentId: `STU-LC-${freshSuffix}`,
        department: 'Quality Assurance',
        role: 'STUDENT'
      })
    });
    const regData = await regRes.json() as any;
    assert(regRes.status === 201, 'Fresh test student registration HTTP 201');
    token = regData.token;

    // Refresh exam listing
    examsRes = await fetch(`${BASE_URL}/api/student/exams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    examsData = await examsRes.json() as any;
    targetExam = examsData.exams.find((e: any) => e.title?.includes('WEB302'));
  }

  assert(targetExam.userExamStatus === 'AVAILABLE' || targetExam.userExamStatus === 'IN_PROGRESS', 'Target exam status is AVAILABLE or IN_PROGRESS');

  // Step 2: Start or Resume Attempt
  console.log('\n▶ Step 2: Start Examination Attempt');
  const startRes = await fetch(`${BASE_URL}/api/student/exams/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ examId: targetExam.id })
  });
  const startData = await startRes.json() as any;
  assert(startRes.status === 200 || startRes.status === 201, 'Start attempt returned 200/201', `Status: ${startRes.status}`);
  assert(typeof startData.attemptId === 'string' && startData.attemptId.length > 10, 'Valid attemptId received');
  const attemptId = startData.attemptId;

  // Step 3: Anti-Cheat Secrecy Guardrail
  console.log('\n▶ Step 3: Anti-Cheat Secrecy Guardrail');
  const attemptRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const attemptData = await attemptRes.json() as any;
  assert(attemptRes.status === 200, 'GET /api/student/attempts/:id returns HTTP 200');
  assert(Array.isArray(attemptData.questions) && attemptData.questions.length === 3, 'Questions array contains exactly 3 questions');

  let answerKeyLeaked = false;
  let explanationLeaked = false;
  let totalOptionsChecked = 0;

  for (const q of attemptData.questions) {
    if (q.explanation !== undefined && q.explanation !== null) {
      explanationLeaked = true;
    }
    for (const opt of q.options) {
      totalOptionsChecked++;
      if (opt.isCorrect !== undefined) {
        answerKeyLeaked = true;
      }
    }
  }

  assert(!answerKeyLeaked, `Zero answer key leakage: option.isCorrect is omitted across all ${totalOptionsChecked} options`);
  assert(!explanationLeaked, 'Zero explanation leakage: question.explanation is omitted across all questions');

  // Step 4: Real-Time Autosave Answers
  console.log('\n▶ Step 4: Real-Time Autosave Answer Upserts');
  const q1 = attemptData.questions[0]; // MCQ
  const q2 = attemptData.questions[1]; // TRUE_FALSE
  const q3 = attemptData.questions[2]; // MCQ

  // Select Option for Q1 (Option text '201 Created')
  const opt1 = q1.options.find((o: any) => o.text.includes('201 Created')) || q1.options[1];
  const saveQ1Res = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      questionId: q1.id,
      selectedOptionId: opt1.id,
      isMarkedForReview: false
    })
  });
  const saveQ1Data = await saveQ1Res.json() as any;
  assert(saveQ1Res.status === 200, 'Save answer for Question 1 returns HTTP 200');
  assert(saveQ1Data.answeredCount === 1, 'Answered count incremented to 1', `Count: ${saveQ1Data.answeredCount}`);
  assert(saveQ1Data.unansweredCount === 2, 'Unanswered count decremented to 2', `Count: ${saveQ1Data.unansweredCount}`);

  // Select Option for Q2 (Option text 'False')
  const opt2 = q2.options.find((o: any) => o.text.toLowerCase() === 'false') || q2.options[1];
  const saveQ2Res = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      questionId: q2.id,
      selectedOptionId: opt2.id,
      isMarkedForReview: true
    })
  });
  const saveQ2Data = await saveQ2Res.json() as any;
  assert(saveQ2Res.status === 200, 'Save answer for Question 2 returns HTTP 200');
  assert(saveQ2Data.answeredCount === 2, 'Answered count incremented to 2', `Count: ${saveQ2Data.answeredCount}`);
  assert(saveQ2Data.unansweredCount === 1, 'Unanswered count decremented to 1', `Count: ${saveQ2Data.unansweredCount}`);

  // Q3 deliberately left unanswered to verify totalUnanswered tracking

  // Step 5: Proctoring Focus-Loss Multi-Event Logging & Threshold Detection
  console.log('\n▶ Step 5: Proctoring Focus-Loss Logging & Threshold Exceeded Detection');
  // Event 1: Blur
  const fl1Res = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/focus-loss`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      eventType: 'WINDOW_BLUR',
      details: 'Student switched away to external application',
      durationSeconds: 3.5
    })
  });
  const fl1Data = await fl1Res.json() as any;
  assert(fl1Res.status === 200, 'Focus-loss Event 1 logged HTTP 200');
  assert(fl1Data.focusLossCount === 1, 'Focus-loss count is 1', `Count: ${fl1Data.focusLossCount}`);
  assert(fl1Data.warningLimitExceeded === false, 'warningLimitExceeded is false for event 1 (1 < 3)');

  // Event 2: Tab switch
  const fl2Res = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/focus-loss`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      eventType: 'VISIBILITY_HIDDEN',
      details: 'Student navigated to secondary browser tab',
      durationSeconds: 6.2
    })
  });
  const fl2Data = await fl2Res.json() as any;
  assert(fl2Res.status === 200, 'Focus-loss Event 2 logged HTTP 200');
  assert(fl2Data.focusLossCount === 2, 'Focus-loss count is 2', `Count: ${fl2Data.focusLossCount}`);
  assert(fl2Data.warningLimitExceeded === false, 'warningLimitExceeded is false for event 2 (2 < 3)');

  // Event 3: Threshold trigger (threshold = 3)
  const fl3Res = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/focus-loss`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      eventType: 'WINDOW_BLUR',
      details: 'Student minimized window during exam',
      durationSeconds: 2.1
    })
  });
  const fl3Data = await fl3Res.json() as any;
  assert(fl3Res.status === 200, 'Focus-loss Event 3 logged HTTP 200');
  assert(fl3Data.focusLossCount === 3, 'Focus-loss count reached threshold 3', `Count: ${fl3Data.focusLossCount}`);
  assert(fl3Data.warningLimitExceeded === true, 'warningLimitExceeded triggered true upon reaching threshold (3 >= 3)');

  // Step 6: Exam Submission & Server-Side Auto-Grading Calculation
  console.log('\n▶ Step 6: Exam Submission & Auto-Grading Calculation');
  const submitRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });
  const submitData = await submitRes.json() as any;
  assert(submitRes.status === 200, 'Exam submission returns HTTP 200');
  assert(submitData.result?.score === 20, 'Auto-grading score is exactly 20 marks', `Score: ${submitData.result?.score}`);
  assert(submitData.result?.totalMarks === 30, 'Total exam marks is 30', `Total: ${submitData.result?.totalMarks}`);
  assert(submitData.result?.passed === true, 'Passed status is true (20 >= 15 passing marks)');
  assert(submitData.result?.totalAnswered === 2, 'Answered questions count is 2', `Answered: ${submitData.result?.totalAnswered}`);
  assert(submitData.result?.totalUnanswered === 1, 'Unanswered questions count is 1', `Unanswered: ${submitData.result?.totalUnanswered}`);
  assert(
    Math.abs(submitData.result?.percentage - 66.67) < 0.1,
    'Calculated percentage is 66.67%',
    `Percentage: ${submitData.result?.percentage}`
  );

  // Step 7: Post-Submission Immutability Guardrail
  console.log('\n▶ Step 7: Post-Submission Immutability Guardrail');
  const postSubmitAnswerRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/save-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      questionId: q3.id,
      selectedOptionId: q3.options[0].id
    })
  });
  const postSubmitAnswerData = await postSubmitAnswerRes.json() as any;
  assert(postSubmitAnswerRes.status === 400, 'Answer modification after submission rejected with HTTP 400', `Status: ${postSubmitAnswerRes.status}`);
  assert(
    postSubmitAnswerData.error === 'This examination attempt has already been submitted.',
    'Immutability error message asserted for answer mutation',
    `Error: ${postSubmitAnswerData.error}`
  );

  const reSubmitRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });
  const reSubmitData = await reSubmitRes.json() as any;
  assert(reSubmitRes.status === 400, 'Re-submission rejected with HTTP 400', `Status: ${reSubmitRes.status}`);
  assert(
    reSubmitData.error === 'This examination has already been submitted.',
    'Immutability error message asserted for re-submit',
    `Error: ${reSubmitData.error}`
  );

  // Step 8: Result Review Inspection
  console.log('\n▶ Step 8: Result Review Inspection');
  const resultRes = await fetch(`${BASE_URL}/api/student/attempts/${attemptId}/result`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const resultData = await resultRes.json() as any;
  assert(resultRes.status === 200, 'GET /api/student/attempts/:id/result returns HTTP 200');
  assert(resultData.allowReview === true, 'allowReview is true in result view');
  assert(resultData.score === 20, 'Final score confirmed in review');
  assert(Array.isArray(resultData.questions) && resultData.questions.length === 3, 'All questions returned with answers in review');

  // Check that review now provides explanation and correct answers
  const q1Review = resultData.questions.find((q: any) => q.id === q1.id);
  assert(typeof q1Review?.explanation === 'string' && q1Review.explanation.length > 0, 'Explanation revealed in post-submission review');
  assert(q1Review?.isCorrect === true, 'Question 1 marked correct for student');
  assert(q1Review?.marksAwarded === 10, 'Question 1 marksAwarded is 10');

  // Summary
  const failed = results.filter(r => !r.passed);
  console.log('\n====================================================');
  console.log(`📋 Verification Summary: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`❌ FAILED ${failed.length} assertions:`);
    failed.forEach(f => console.error(`  - ${f.step}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('✅ ALL EXAM LIFECYCLE VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal exam lifecycle verification execution error:', err);
  process.exit(1);
});
