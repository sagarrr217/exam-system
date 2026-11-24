const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/showcase-assets');
const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\41ba554f-e563-4628-a198-6a72371862a7\\showcase';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function saveImage(filename, buffer) {
  const localPath = path.join(OUTPUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(localPath, buffer);
  fs.writeFileSync(artifactPath, buffer);
  console.log(`✓ Saved: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
}

async function main() {
  console.log('🚀 Starting Automated High-Resolution Showcase Screenshot Capture...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }); // 2x Retina resolution

  try {
    // 1. Capture Login Screen (Apple ID style card)
    console.log('Capturing 01-login-screen.png...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[type="email"]');
    const loginBuffer = await page.screenshot({ fullPage: false });
    saveImage('01-login-screen.png', loginBuffer);

    // Perform Admin Login via API to get token
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@exam.com', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    // 2. Capture Admin Control Center Dashboard
    console.log('Capturing 02-admin-dashboard.png...');
    await page.evaluate((token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, adminToken, adminData.user);

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    const adminDashBuffer = await page.screenshot({ fullPage: false });
    saveImage('02-admin-dashboard.png', adminDashBuffer);

    // 3. Capture AI Question Studio Modal open in Exam Builder
    console.log('Capturing 03-ai-question-studio.png...');
    await page.goto(`${BASE_URL}/admin/exams/new`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Click AI Generator button to open the modal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const aiBtn = buttons.find(b => b.textContent.includes('AI') || b.querySelector('svg'));
      if (aiBtn) aiBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    const aiStudioBuffer = await page.screenshot({ fullPage: false });
    saveImage('03-ai-question-studio.png', aiStudioBuffer);

    // Perform Student Login via API to get token
    const studentLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@exam.com', password: 'student123' })
    });
    const studentData = await studentLoginRes.json();
    const studentToken = studentData.token;

    // 4. Capture Student Dashboard
    console.log('Capturing 04-student-dashboard.png...');
    await page.evaluate((token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, studentToken, studentData.user);

    await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    const studentDashBuffer = await page.screenshot({ fullPage: false });
    saveImage('04-student-dashboard.png', studentDashBuffer);

    // 5. Capture Student Proctored Exam Portal
    console.log('Capturing 05-proctored-exam-portal.png...');
    // Start an exam attempt via API or find active attempt
    const examsRes = await fetch(`${API_URL}/student/exams`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const examsData = await examsRes.json();
    const availableExam = examsData.exams?.[0];

    if (availableExam) {
      try {
        const startRes = await fetch(`${API_URL}/student/exams/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
          body: JSON.stringify({ examId: availableExam.id })
        });
        const startData = await startRes.json();
        if (startData.attemptId) {
          await page.goto(`${BASE_URL}/student/exam/${startData.attemptId}`, { waitUntil: 'networkidle0' });
          await new Promise(r => setTimeout(r, 2000));
          const examPortalBuffer = await page.screenshot({ fullPage: false });
          saveImage('05-proctored-exam-portal.png', examPortalBuffer);
        }
      } catch (err) {
        console.warn('Could not launch live exam attempt for screenshot:', err.message);
      }
    }

    console.log('🎉 All high-resolution showcase screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main();
