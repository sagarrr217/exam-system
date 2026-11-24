const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ASSETS_DIR = path.resolve(__dirname, '../docs/showcase-assets');
const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\41ba554f-e563-4628-a198-6a72371862a7\\showcase';

function getBase64Image(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

async function main() {
  console.log('🎬 Initializing High-Definition Video Walkthrough Generator (1080p 60fps)...');

  const imgLogin = getBase64Image('01-login-screen.png');
  const imgAdmin = getBase64Image('07-admin-dashboard-dark.png');
  const imgAIStudio = getBase64Image('03-ai-question-studio.png');
  const imgExamPortal = getBase64Image('05-proctored-exam-portal.png');
  const imgResults = getBase64Image('06-exam-results-review.png');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
      overflow: hidden;
      width: 1920px;
      height: 1080px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #canvas {
      width: 1920px;
      height: 1080px;
      background: #000;
    }
  </style>
</head>
<body>
  <canvas id="canvas" width="1920" height="1080"></canvas>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const images = {};
    function loadImage(name, src) {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.onload = () => { images[name] = img; resolve(img); };
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    async function init() {
      await Promise.all([
        loadImage('login', '${imgLogin}'),
        loadImage('admin', '${imgAdmin}'),
        loadImage('ai', '${imgAIStudio}'),
        loadImage('exam', '${imgExamPortal}'),
        loadImage('results', '${imgResults}')
      ]);

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 6000000
      });

      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          window.videoBase64 = reader.result.split(',')[1];
          window.videoDone = true;
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();

      const TOTAL_DURATION = 42; // 42 seconds total
      const FPS = 30;
      const TOTAL_FRAMES = TOTAL_DURATION * FPS;
      let frame = 0;

      function drawLaptopFrame(img, x, y, w, h) {
        if (!img) return;
        ctx.save();
        ctx.fillStyle = '#1c1c1e';
        ctx.strokeStyle = '#3a3a3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x - 12, y - 12, w + 24, h + 24, 20);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.clip();
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      }

      function render() {
        const time = frame / FPS;

        // Background gradient
        const bgGrad = ctx.createRadialGradient(960, 540, 200, 960, 540, 1100);
        bgGrad.addColorStop(0, '#0a0d14');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Header brand bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.roundRect(80, 40, 1760, 64, 32);
        ctx.fill();

        ctx.fillStyle = '#0a84ff';
        ctx.beginPath();
        ctx.arc(120, 72, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 22px -apple-system, sans-serif';
        ctx.fillText('Dual-Interface Examination System', 150, 80);

        ctx.font = '400 18px -apple-system, sans-serif';
        ctx.fillStyle = '#86868b';
        ctx.fillText('Apple HIG Aesthetic • AI Question Studio • Proctoring Security', 1080, 80);

        // Scene timeline logic
        if (time < 7) {
          // Scene 1: Title & Hero
          const progress = time / 7;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 64px -apple-system, sans-serif';
          ctx.fillText('Modern, Secure Examination System', 960, 360);

          ctx.font = '300 32px -apple-system, sans-serif';
          ctx.fillStyle = '#a1a1a6';
          ctx.fillText('Student Proctored Portal + Administrator Control Center', 960, 430);

          // Feature badges
          const badges = ['Apple HIG Design', 'Gemini Multimodal AI', 'Focus-Loss Proctoring', '7 Question Types'];
          badges.forEach((b, i) => {
            const bx = 450 + i * 280;
            ctx.fillStyle = 'rgba(10, 132, 255, 0.15)';
            ctx.strokeStyle = '#0a84ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(bx - 120, 520, 240, 52, 26);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '500 18px -apple-system, sans-serif';
            ctx.fillText(b, bx, 552);
          });

          ctx.font = '400 20px -apple-system, sans-serif';
          ctx.fillStyle = '#30d158';
          ctx.fillText('● Full-Stack Production Architecture (React, Vite, Node.js, Express, Prisma, SQLite)', 960, 680);
          ctx.textAlign = 'left';

        } else if (time < 15) {
          // Scene 2: Admin Control Center
          ctx.fillStyle = '#0a84ff';
          ctx.font = '600 20px -apple-system, sans-serif';
          ctx.fillText('ADMINISTRATOR DASHBOARD', 120, 170);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 44px -apple-system, sans-serif';
          ctx.fillText('macOS Control Center & Live Metrics', 120, 225);

          ctx.font = '400 20px -apple-system, sans-serif';
          ctx.fillStyle = '#a1a1a6';
          ctx.fillText('• Real-time exam publish/unpublish toggle & CSV export', 120, 290);
          ctx.fillText('• Submissions monitor with auto-graded scores', 120, 335);
          ctx.fillText('• Complete focus-loss proctoring incident log review', 120, 380);
          ctx.fillText('• True OLED Dark Mode and Studio Light Mode', 120, 425);

          drawLaptopFrame(images.admin, 860, 170, 940, 588);

        } else if (time < 24) {
          // Scene 3: AI Question Studio
          ctx.fillStyle = '#bf5af2';
          ctx.font = '600 20px -apple-system, sans-serif';
          ctx.fillText('GEMINI MULTIMODAL INTEGRATION', 120, 170);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 44px -apple-system, sans-serif';
          ctx.fillText('AI Question Studio & Assistant', 120, 225);

          ctx.font = '400 20px -apple-system, sans-serif';
          ctx.fillStyle = '#a1a1a6';
          ctx.fillText('• Conversational prompt-based question creation', 120, 290);
          ctx.fillText('• Raw PDF syllabus & lecture note document ingestion', 120, 335);
          ctx.fillText('• Image & problem diagram visual analysis', 120, 380);
          ctx.fillText('• 1-Click batch import into examination draft', 120, 425);

          drawLaptopFrame(images.ai, 860, 170, 940, 588);

        } else if (time < 33) {
          // Scene 4: Student Exam Portal & Proctoring
          ctx.fillStyle = '#30d158';
          ctx.font = '600 20px -apple-system, sans-serif';
          ctx.fillText('STUDENT PROCTORED PORTAL', 120, 170);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 44px -apple-system, sans-serif';
          ctx.fillText('Restricted Exam Room & Focus Monitoring', 120, 225);

          ctx.font = '400 20px -apple-system, sans-serif';
          ctx.fillStyle = '#a1a1a6';
          ctx.fillText('• Dynamic Island HUD countdown timer & progress pill', 120, 290);
          ctx.fillText('• Real-time autosave on every option selection', 120, 335);
          ctx.fillText('• Anti-cheat focus tracking (tab switch & window blur alerts)', 120, 380);
          ctx.fillText('• 7 question formats with tactile iOS option cards', 120, 425);

          drawLaptopFrame(images.exam, 860, 170, 940, 588);

        } else {
          // Scene 5: Auto-Grading & Results Review
          ctx.fillStyle = '#ff9f0a';
          ctx.font = '600 20px -apple-system, sans-serif';
          ctx.fillText('INSTANT RESULTS & ANALYTICS', 120, 170);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 44px -apple-system, sans-serif';
          ctx.fillText('Apple Activity Ring Score Breakdown', 120, 225);

          ctx.font = '400 20px -apple-system, sans-serif';
          ctx.fillStyle = '#a1a1a6';
          ctx.fillText('• Instant objective auto-grading on submission', 120, 290);
          ctx.fillText('• Circular score progress & pass/fail indicator', 120, 335);
          ctx.fillText('• Detailed question-by-question review & explanations', 120, 380);
          ctx.fillText('• Source Code: github.com/sagarrr217/exam-system', 120, 425);

          drawLaptopFrame(images.results, 860, 170, 940, 588);
        }

        // Bottom progress bar
        const timelineProgress = frame / TOTAL_FRAMES;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(80, 1020, 1760, 8);

        ctx.fillStyle = '#0a84ff';
        ctx.fillRect(80, 1020, 1760 * timelineProgress, 8);

        frame++;
        if (frame <= TOTAL_FRAMES) {
          requestAnimationFrame(render);
        } else {
          recorder.stop();
        }
      }

      render();
    }

    init();
  </script>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.setContent(htmlContent);

  console.log('Rendering frames and recording video stream (42 seconds)...');
  await page.waitForFunction(() => window.videoDone === true, { timeout: 120000 });

  const videoBase64 = await page.evaluate(() => window.videoBase64);
  const videoBuffer = Buffer.from(videoBase64, 'base64');

  const videoPath = path.join(ASSETS_DIR, 'exam-system-walkthrough.webm');
  const artifactVideoPath = path.join(ARTIFACT_DIR, 'exam-system-walkthrough.webm');

  fs.writeFileSync(videoPath, videoBuffer);
  fs.writeFileSync(artifactVideoPath, videoBuffer);

  console.log(`✅ Video generated successfully! Saved to: ${videoPath} (${Math.round(videoBuffer.length / 1024)} KB)`);

  await browser.close();
}

main().catch(console.error);
