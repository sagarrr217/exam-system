/**
 * Automated Verification Script: Auth & Role-Based Access Control (RBAC)
 * 
 * Verifies:
 * 1. Admin and Student credential authentication and JWT issuance.
 * 2. Invalid password rejection (HTTP 401).
 * 3. Role mismatch gate enforcement (HTTP 403).
 * 4. Unauthenticated route protection (HTTP 401).
 * 5. Cross-role route protection (Student -> Admin: 403, Admin -> Student: 403).
 * 6. Profile retrieval and integrity via /api/auth/me.
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
  console.log('🔒 Starting Auth & RBAC Automated Verification Suite');
  console.log(`🌐 Target API: ${BASE_URL}`);
  console.log('====================================================\n');

  let adminToken = '';
  let studentToken = '';

  // 1. Admin Login
  console.log('▶ Step 1: Administrator Authentication');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@exam.com', password: 'admin123' })
  });
  const adminLoginData = await adminLoginRes.json() as any;
  assert(adminLoginRes.status === 200, 'Admin login HTTP 200', `Status: ${adminLoginRes.status}`);
  assert(typeof adminLoginData.token === 'string' && adminLoginData.token.length > 20, 'Admin JWT token received');
  assert(adminLoginData.user?.role === 'ADMIN', 'Admin role asserted in user payload', `Role: ${adminLoginData.user?.role}`);
  adminToken = adminLoginData.token;

  // 2. Student Login
  console.log('\n▶ Step 2: Student Authentication');
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@exam.com', password: 'student123' })
  });
  const studentLoginData = await studentLoginRes.json() as any;
  assert(studentLoginRes.status === 200, 'Student login HTTP 200', `Status: ${studentLoginRes.status}`);
  assert(typeof studentLoginData.token === 'string' && studentLoginData.token.length > 20, 'Student JWT token received');
  assert(studentLoginData.user?.role === 'STUDENT', 'Student role asserted in user payload', `Role: ${studentLoginData.user?.role}`);
  studentToken = studentLoginData.token;

  // 3. Invalid Password Rejection
  console.log('\n▶ Step 3: Invalid Password Rejection (HTTP 401)');
  const invalidPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@exam.com', password: 'wrongpassword' })
  });
  const invalidPassData = await invalidPassRes.json() as any;
  assert(invalidPassRes.status === 401, 'Invalid password returns HTTP 401', `Status: ${invalidPassRes.status}`);
  assert(invalidPassData.error === 'Invalid email or password.', 'Error message indicates invalid credentials', `Error: ${invalidPassData.error}`);

  // 4. Role Mismatch Enforcement
  console.log('\n▶ Step 4: Role Mismatch Gate Enforcement (HTTP 403)');
  const roleMismatchRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@exam.com', password: 'student123', role: 'ADMIN' })
  });
  const roleMismatchData = await roleMismatchRes.json() as any;
  assert(roleMismatchRes.status === 403, 'Role mismatch returns HTTP 403', `Status: ${roleMismatchRes.status}`);
  assert(
    roleMismatchData.error === 'Unauthorized. This account does not have ADMIN access.',
    'Error message specifies role authorization failure',
    `Error: ${roleMismatchData.error}`
  );

  // 5. Unauthenticated Route Protection
  console.log('\n▶ Step 5: Unauthenticated Route Protection (HTTP 401)');
  const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/exams`);
  const unauthAdminData = await unauthAdminRes.json() as any;
  assert(unauthAdminRes.status === 401, 'Unauthenticated GET /api/admin/exams returns HTTP 401', `Status: ${unauthAdminRes.status}`);
  assert(unauthAdminData.error === 'Access denied. No authorization token provided.', 'Token required error message asserted');

  const unauthStudentRes = await fetch(`${BASE_URL}/api/student/exams`);
  const unauthStudentData = await unauthStudentRes.json() as any;
  assert(unauthStudentRes.status === 401, 'Unauthenticated GET /api/student/exams returns HTTP 401', `Status: ${unauthStudentRes.status}`);
  assert(unauthStudentData.error === 'Access denied. No authorization token provided.', 'Token required error message asserted');

  // 6. Cross-Role Route Violations: Student calling Admin endpoints
  console.log('\n▶ Step 6: Cross-Role Isolation — Student Calling Admin Route (HTTP 403)');
  const studentCallingAdminStats = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentCallingAdminStatsData = await studentCallingAdminStats.json() as any;
  assert(studentCallingAdminStats.status === 403, 'Student calling /api/admin/dashboard-stats returns HTTP 403', `Status: ${studentCallingAdminStats.status}`);
  assert(
    studentCallingAdminStatsData.error === 'Forbidden. Administrator privileges required.',
    'Administrator privilege required error asserted',
    `Error: ${studentCallingAdminStatsData.error}`
  );

  const studentCallingAdminExams = await fetch(`${BASE_URL}/api/admin/exams`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentCallingAdminExamsData = await studentCallingAdminExams.json() as any;
  assert(studentCallingAdminExams.status === 403, 'Student calling /api/admin/exams returns HTTP 403', `Status: ${studentCallingAdminExams.status}`);
  assert(studentCallingAdminExamsData.error === 'Forbidden. Administrator privileges required.', 'Administrator privilege required error asserted');

  // 7. Cross-Role Route Violations: Admin calling Student endpoints
  console.log('\n▶ Step 7: Cross-Role Isolation — Admin Calling Student Route (HTTP 403)');
  const adminCallingStudentExams = await fetch(`${BASE_URL}/api/student/exams`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminCallingStudentExamsData = await adminCallingStudentExams.json() as any;
  assert(adminCallingStudentExams.status === 403, 'Admin calling /api/student/exams returns HTTP 403', `Status: ${adminCallingStudentExams.status}`);
  assert(
    adminCallingStudentExamsData.error === 'Forbidden. Student privileges required.',
    'Student privilege required error asserted',
    `Error: ${adminCallingStudentExamsData.error}`
  );

  // 8. Profile Inspection (/api/auth/me)
  console.log('\n▶ Step 8: Profile Inspection (/api/auth/me)');
  const adminMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminMeData = await adminMeRes.json() as any;
  assert(adminMeRes.status === 200, 'Admin /api/auth/me returns HTTP 200');
  assert(adminMeData.user?.email === 'admin@exam.com', 'Admin profile email matches');
  assert(adminMeData.user?.role === 'ADMIN', 'Admin profile role matches');
  assert(adminMeData.user?.name === 'Dr. Sarah Connor', 'Admin profile name matches');

  const studentMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentMeData = await studentMeRes.json() as any;
  assert(studentMeRes.status === 200, 'Student /api/auth/me returns HTTP 200');
  assert(studentMeData.user?.email === 'student@exam.com', 'Student profile email matches');
  assert(studentMeData.user?.role === 'STUDENT', 'Student profile role matches');
  assert(studentMeData.user?.studentId === 'STU-2026-001', 'Student profile studentId matches');

  // Summary
  const failed = results.filter(r => !r.passed);
  console.log('\n====================================================');
  console.log(`📋 Verification Summary: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`❌ FAILED ${failed.length} assertions:`);
    failed.forEach(f => console.error(`  - ${f.step}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('✅ ALL AUTH & RBAC VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal verification execution error:', err);
  process.exit(1);
});
