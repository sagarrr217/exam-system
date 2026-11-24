const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/ai-showcase');
const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\41ba554f-e563-4628-a198-6a72371862a7\\ai-showcase';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function main() {
  console.log('🎨 Generating High-Impact LinkedIn Project Profile Thumbnail (16:9)...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        width: 1920px; height: 1080px; background: #050608; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
        overflow: hidden; display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 30%, #0d1322 0%, #050608 75%, #020304 100%);
      }
      .ambient-glow-1 {
        position: absolute; width: 800px; height: 800px; border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 113, 227, 0.35) 0%, transparent 65%);
        top: -100px; left: 10%; filter: blur(100px); pointer-events: none;
      }
      .ambient-glow-2 {
        position: absolute; width: 750px; height: 750px; border-radius: 50%;
        background: radial-gradient(circle, rgba(191, 90, 242, 0.3) 0%, transparent 65%);
        bottom: -100px; right: 10%; filter: blur(100px); pointer-events: none;
      }
      .grid-lines {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: 64px 64px;
        opacity: 0.7;
      }
      .card-canvas {
        position: relative; z-index: 10; width: 1760px; height: 960px;
        border-radius: 44px; background: rgba(255, 255, 255, 0.02);
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 40px 120px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15);
        padding: 50px 70px; display: flex; flex-direction: column; justify-content: space-between;
      }
      .top-badge-row {
        display: flex; justify-content: space-between; align-items: center;
      }
      .badge-capsule {
        display: flex; align-items: center; gap: 12px; padding: 10px 24px;
        border-radius: 100px; background: rgba(0, 113, 227, 0.15);
        border: 1px solid rgba(0, 113, 227, 0.4); color: #60a5fa;
        font-size: 15px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
      }
      .apple-hig-pill {
        display: flex; align-items: center; gap: 10px; padding: 10px 22px;
        border-radius: 100px; background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12); color: #e5e5ea;
        font-size: 15px; font-weight: 600;
      }
      .center-content {
        display: grid; grid-template-columns: 1.05fr 1fr; gap: 60px; align-items: center;
      }
      .text-col {
        display: flex; flex-direction: column; gap: 20px;
      }
      .main-title {
        font-size: 64px; font-weight: 800; letter-spacing: -2px; line-height: 1.08;
        background: linear-gradient(135deg, #ffffff 40%, #a1a1aa 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .sub-title {
        font-size: 22px; color: #a1a1a6; line-height: 1.5; font-weight: 400;
      }
      .feature-tags {
        display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px;
      }
      .feature-tag {
        display: flex; align-items: center; gap: 8px; padding: 10px 20px;
        border-radius: 16px; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08); font-size: 14px; font-weight: 600; color: #f5f5f7;
      }
      .feature-tag span.dot {
        width: 8px; height: 8px; border-radius: 50%;
      }
      .preview-col {
        display: flex; justify-content: center; position: relative;
      }
      .device-card {
        width: 100%; max-width: 680px; height: 460px; border-radius: 32px;
        background: #15171e; border: 2.5px solid rgba(255,255,255,0.15);
        box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(0, 113, 227, 0.25);
        padding: 20px; display: flex; flex-direction: column; justify-content: space-between;
        position: relative;
      }
      .device-top-island {
        align-self: center; background: #000; border: 1px solid rgba(255,255,255,0.18);
        border-radius: 100px; padding: 8px 24px; display: flex; align-items: center; gap: 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      }
      .ui-question-box {
        background: #1c1e26; border-radius: 20px; padding: 22px;
        border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 12px;
      }
      .ui-option {
        padding: 10px 16px; border-radius: 12px; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06); font-size: 13px; display: flex; align-items: center; gap: 10px;
      }
      .ui-option.selected {
        background: rgba(0, 113, 227, 0.22); border-color: #0071e3; color: #60a5fa; font-weight: 600;
      }
      .ui-ai-drawer {
        background: linear-gradient(135deg, rgba(191,90,242,0.12), rgba(0,113,227,0.08));
        border-radius: 16px; border: 1px solid rgba(191,90,242,0.3); padding: 14px 18px;
        display: flex; align-items: center; justify-content: space-between; font-size: 13px;
      }
      .bottom-stack-row {
        display: flex; justify-content: space-between; align-items: center;
        padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);
      }
      .tech-pills {
        display: flex; gap: 12px;
      }
      .tech-pill {
        padding: 8px 18px; border-radius: 12px; font-size: 14px; font-weight: 600;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #d1d1d6;
      }
      .github-link {
        font-size: 16px; font-weight: 700; color: #0a84ff; display: flex; align-items: center; gap: 8px;
      }
    </style>
  </head>
  <body>
    <div class="grid-lines"></div>
    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <div class="card-canvas">
      <!-- Top Row -->
      <div class="top-badge-row">
        <div class="badge-capsule">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>FULL-STACK SHOWCASE</span>
        </div>
        <div class="apple-hig-pill">
          <span>🍎 Apple HIG Design Language • iOS Materials</span>
        </div>
      </div>

      <!-- Center Feature Showcase -->
      <div class="center-content">
        <div class="text-col">
          <h1 class="main-title">Dual-Interface Examination System</h1>
          <p class="sub-title">
            A modern, secure testing platform pairing a restricted student proctored test room with an intelligent administrative question studio.
          </p>

          <div class="feature-tags">
            <div class="feature-tag">
              <span class="dot" style="background:#bf5af2;"></span>
              <span>Gemini Multimodal AI Studio</span>
            </div>
            <div class="feature-tag">
              <span class="dot" style="background:#30d158;"></span>
              <span>Focus-Loss Proctoring Guard</span>
            </div>
            <div class="feature-tag">
              <span class="dot" style="background:#0a84ff;"></span>
              <span>Dynamic Island Countdown</span>
            </div>
            <div class="feature-tag">
              <span class="dot" style="background:#ffd60a;"></span>
              <span>7 Question Types + Auto-Grading</span>
            </div>
          </div>
        </div>

        <div class="preview-col">
          <div class="device-card">
            <div class="device-top-island">
              <span style="font-size:11px; color:#86868b; font-weight:700;">PROCTORED EXAM</span>
              <span style="font-family:monospace; font-size:15px; font-weight:800; color:#30d158;">00:58:42</span>
              <span style="font-size:10px; padding:3px 8px; border-radius:8px; background:rgba(48,209,88,0.25); color:#30d158; font-weight:700;">ACTIVE</span>
            </div>

            <div class="ui-question-box">
              <div style="font-size:11px; color:#0a84ff; font-weight:700; text-transform:uppercase;">QUESTION 4 OF 10 • MULTIPLE CHOICE</div>
              <div style="font-size:15px; font-weight:600; line-height:1.4;">
                Which consensus algorithm ensures leader safety and log replication in distributed state machines?
              </div>
              <div class="ui-option"><div style="width:10px; height:10px; border-radius:50%; border:2px solid #636366;"></div>Two-Phase Commit</div>
              <div class="ui-option selected"><div style="width:10px; height:10px; border-radius:50%; background:#0071e3;"></div>Raft Consensus Protocol</div>
            </div>

            <div class="ui-ai-drawer">
              <div style="display:flex; align-items:center; gap:8px;">
                <span>✨</span>
                <div>
                  <div style="font-weight:700; color:#bf5af2; font-size:12px;">Gemini Document Ingestion</div>
                  <div style="font-size:10px; color:#a1a1a6;">Syllabus PDF & Diagram Vision Analyzed</div>
                </div>
              </div>
              <span style="font-size:11px; font-weight:700; color:#30d158;">1-Click Import ✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Tech Stack & Repository Bar -->
      <div class="bottom-stack-row">
        <div class="tech-pills">
          <div class="tech-pill">React 18</div>
          <div class="tech-pill">TypeScript</div>
          <div class="tech-pill">Tailwind CSS</div>
          <div class="tech-pill">Node.js</div>
          <div class="tech-pill">Prisma & SQLite</div>
          <div class="tech-pill">Google Gemini</div>
        </div>

        <div class="github-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>github.com/sagarrr217/exam-system</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);

  // Save at 1920x1080 (High Resolution)
  const bufFull = await page.screenshot({ fullPage: false });
  const path1 = path.join(OUTPUT_DIR, 'linkedin-project-thumbnail.png');
  const path1Artifact = path.join(ARTIFACT_DIR, 'linkedin-project-thumbnail.png');
  fs.writeFileSync(path1, bufFull);
  fs.writeFileSync(path1Artifact, bufFull);
  console.log(`✓ Saved 1920x1080 thumbnail: ${path1} (${Math.round(bufFull.length / 1024)} KB)`);

  // Also save a downscaled 1280x720 version specifically optimized for LinkedIn's project card
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  const buf720 = await page.screenshot({ fullPage: false });
  const path2 = path.join(OUTPUT_DIR, 'linkedin-project-thumbnail-720p.png');
  const path2Artifact = path.join(ARTIFACT_DIR, 'linkedin-project-thumbnail-720p.png');
  fs.writeFileSync(path2, buf720);
  fs.writeFileSync(path2Artifact, buf720);
  console.log(`✓ Saved 1280x720 thumbnail: ${path2} (${Math.round(buf720.length / 1024)} KB)`);

  await browser.close();
}

main().catch(console.error);
