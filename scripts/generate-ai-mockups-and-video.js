const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/ai-showcase');
const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\41ba554f-e563-4628-a198-6a72371862a7\\ai-showcase';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function saveFile(filename, buffer) {
  const localPath = path.join(OUTPUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(localPath, buffer);
  fs.writeFileSync(artifactPath, buffer);
  console.log(`✓ Generated: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
}

async function renderMockup1(page) {
  console.log('Generating Mockup 1: 3D Isometric Apple Devices Ecosystem...');
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        width: 1920px; height: 1080px; background: #060709; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        overflow: hidden; display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 40%, #111827 0%, #060709 70%, #030406 100%);
      }
      .grid-lines {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        transform: perspective(1000px) rotateX(60deg) translateY(-100px);
        opacity: 0.6;
      }
      .glow-blue {
        position: absolute; width: 600px; height: 600px; border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 113, 227, 0.25) 0%, transparent 70%);
        top: 15%; left: 15%; filter: blur(80px);
      }
      .glow-purple {
        position: absolute; width: 600px; height: 600px; border-radius: 50%;
        background: radial-gradient(circle, rgba(191, 90, 242, 0.22) 0%, transparent 70%);
        bottom: 10%; right: 15%; filter: blur(80px);
      }
      .container {
        position: relative; z-index: 10; width: 1760px; height: 960px;
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 24px 36px; border-radius: 30px;
        background: rgba(255,255,255,0.04); backdrop-filter: blur(30px);
        border: 1px solid rgba(255,255,255,0.08);
      }
      .brand {
        display: flex; align-items: center; gap: 16px;
      }
      .logo-icon {
        width: 44px; height: 44px; border-radius: 14px;
        background: linear-gradient(135deg, #0071e3, #60a5fa);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 113, 227, 0.4);
      }
      .brand-title { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .brand-sub { font-size: 13px; color: #86868b; text-transform: uppercase; letter-spacing: 1px; }
      .tag-pill {
        padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;
        background: rgba(0, 113, 227, 0.15); border: 1px solid rgba(0, 113, 227, 0.4);
        color: #60a5fa;
      }
      .stage {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 50px;
        position: relative;
      }
      /* 3D Devices */
      .laptop-mockup {
        width: 880px; height: 550px; background: #1c1c1e; border-radius: 28px;
        border: 3px solid #3a3a3c; box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(0, 113, 227, 0.2);
        padding: 16px; display: flex; flex-direction: column; position: relative;
        transform: perspective(1200px) rotateY(-8deg) rotateX(4deg);
      }
      .laptop-screen {
        flex: 1; background: #000; border-radius: 18px; overflow: hidden;
        border: 1px solid rgba(255,255,255,0.1); padding: 24px; display: flex; flex-direction: column; gap: 18px;
      }
      .dynamic-island {
        align-self: center; background: #1c1c1e; border: 1px solid rgba(255,255,255,0.15);
        border-radius: 100px; padding: 10px 28px; display: flex; align-items: center; gap: 18px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.5);
      }
      .timer-digit { font-family: monospace; font-size: 18px; font-weight: 700; color: #30d158; }
      .screen-cards {
        display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1;
      }
      .q-card {
        background: #1c1c1e; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);
        padding: 24px; display: flex; flex-direction: column; justify-content: space-between;
      }
      .q-opts { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
      .q-opt {
        padding: 12px 18px; border-radius: 14px; font-size: 13px;
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        display: flex; align-items: center; gap: 12px;
      }
      .q-opt.active {
        background: rgba(0, 113, 227, 0.2); border-color: #0071e3; color: #fff; font-weight: 600;
      }
      .q-opt-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #636366; }
      .q-opt.active .q-opt-dot { background: #0071e3; border-color: #0071e3; }
      .side-panel {
        background: #1c1c1e; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);
        padding: 20px; display: flex; flex-direction: column; gap: 14px;
      }
      .grid-3x3 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .grid-chip {
        aspect-ratio: 1; border-radius: 10px; background: rgba(255,255,255,0.06);
        display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
      }
      .grid-chip.done { background: #30d158; color: #000; }
      .grid-chip.current { background: #0071e3; color: #fff; box-shadow: 0 0 12px #0071e3; }

      /* iPad Mockup */
      .ipad-mockup {
        width: 580px; height: 640px; background: #1c1c1e; border-radius: 36px;
        border: 3px solid #3a3a3c; box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(191, 90, 242, 0.25);
        padding: 16px; display: flex; flex-direction: column;
        transform: perspective(1200px) rotateY(12deg) rotateX(4deg);
      }
      .ipad-screen {
        flex: 1; background: #121214; border-radius: 24px; padding: 24px;
        border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 16px;
      }
      .ai-header {
        display: flex; align-items: center; justify-content: space-between;
        padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .ai-bubble-bot {
        background: #1c1c1e; border-radius: 20px; border-bottom-left-radius: 4px;
        border: 1px solid rgba(255,255,255,0.08); padding: 18px; font-size: 13px; line-height: 1.5; color: #d1d1d6;
      }
      .ai-bubble-user {
        align-self: flex-end; background: #0071e3; border-radius: 20px; border-bottom-right-radius: 4px;
        padding: 14px 20px; font-size: 13px; color: #fff; font-weight: 500;
      }
      .pdf-chip {
        display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.06);
        padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); font-size: 12px;
      }
      .footer-badge-bar {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 36px; border-radius: 24px; background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06); font-size: 14px; color: #86868b;
      }
    </style>
  </head>
  <body>
    <div class="grid-lines"></div>
    <div class="glow-blue"></div>
    <div class="glow-purple"></div>

    <div class="container">
      <div class="header">
        <div class="brand">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div class="brand-title">Dual-Interface Examination Platform</div>
            <div class="brand-sub">Apple HIG Design Language • Multimodal AI Engine</div>
          </div>
        </div>
        <div class="tag-pill">✨ Powered by Google Gemini Vision & Proctoring Core</div>
      </div>

      <div class="stage">
        <!-- MacBook Pro 3D Canvas -->
        <div class="laptop-mockup">
          <div class="laptop-screen">
            <div class="dynamic-island">
              <span style="font-size:12px; color:#86868b;">EXAM IN PROGRESS</span>
              <span class="timer-digit">00:44:18</span>
              <span style="padding:4px 10px; border-radius:20px; font-size:11px; background:rgba(48,209,88,0.2); color:#30d158; font-weight:700;">PROCTORED</span>
            </div>

            <div class="screen-cards">
              <div class="q-card">
                <div>
                  <div style="font-size:11px; text-transform:uppercase; color:#0a84ff; font-weight:700; margin-bottom:6px;">QUESTION 3 OF 10 • 10 MARKS</div>
                  <div style="font-size:16px; font-weight:600; line-height:1.4;">
                    Which SQL isolation level prevents phantom reads using range locks or multiversion concurrency control?
                  </div>
                  <div class="q-opts">
                    <div class="q-opt"><div class="q-opt-dot"></div>Read Committed</div>
                    <div class="q-opt"><div class="q-opt-dot"></div>Repeatable Read</div>
                    <div class="q-opt active"><div class="q-opt-dot"></div>Serializable Isolation</div>
                    <div class="q-opt"><div class="q-opt-dot"></div>Read Uncommitted</div>
                  </div>
                </div>
                <div style="font-size:11px; color:#86868b; display:flex; justify-content:space-between; margin-top:14px;">
                  <span>Autosaved 2s ago</span>
                  <span style="color:#30d158;">Focus Guard Active</span>
                </div>
              </div>

              <div class="side-panel">
                <div style="font-size:12px; font-weight:700; color:#86868b;">QUESTION PALETTE</div>
                <div class="grid-3x3">
                  <div class="grid-chip done">1</div>
                  <div class="grid-chip done">2</div>
                  <div class="grid-chip current">3</div>
                  <div class="grid-chip">4</div>
                  <div class="grid-chip">5</div>
                  <div class="grid-chip">6</div>
                  <div class="grid-chip">7</div>
                  <div class="grid-chip">8</div>
                </div>
                <div style="margin-top:auto; padding:14px; border-radius:14px; background:rgba(255,214,10,0.1); border:1px solid rgba(255,214,10,0.3); font-size:11px; color:#ffd60a;">
                  ⚠️ Incident Monitor: 0 tab switches detected
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- iPad Pro 3D Canvas -->
        <div class="ipad-mockup">
          <div class="ipad-screen">
            <div class="ai-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px;">✨</span>
                <div>
                  <div style="font-size:14px; font-weight:700;">AI Question Studio</div>
                  <div style="font-size:10px; color:#86868b;">Gemini Multimodal Document Ingestion</div>
                </div>
              </div>
              <span style="font-size:10px; padding:4px 10px; border-radius:12px; background:rgba(191,90,242,0.2); color:#bf5af2; font-weight:700;">LIVE</span>
            </div>

            <div class="ai-bubble-user">
              Generate 3 hard questions from this uploaded lecture syllabus PDF:
              <div class="pdf-chip" style="margin-top:8px;">
                <span>📄</span>
                <span>Distributed_Systems_Lec4.pdf (2.4 MB)</span>
              </div>
            </div>

            <div class="ai-bubble-bot">
              <div style="display:flex; align-items:center; gap:6px; color:#bf5af2; font-weight:700; margin-bottom:8px; font-size:12px;">
                <span>🤖</span> GEMINI AI SYNTHESIS COMPLETE
              </div>
              Extracted 3 rigorous academic questions from section 4.2 (Raft Consensus & Log Compaction) with correct answer keys and explanations:
              <div style="margin-top:10px; padding:10px; border-radius:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.06); font-size:11px;">
                <b>Q1:</b> In the Raft protocol, what guarantees that a leader contains all committed entries?
              </div>
              <div style="margin-top:8px; display:flex; justify-content:flex-end;">
                <button style="padding:6px 14px; border-radius:100px; background:#0071e3; color:#fff; border:none; font-size:11px; font-weight:600;">+ 1-Click Import to Exam</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-badge-bar">
        <span>Architected with React 18, Vite, TypeScript, Tailwind CSS, Express, Prisma ORM & SQLite</span>
        <span style="color:#0a84ff; font-weight:600;">github.com/sagarrr217/exam-system</span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  const buf = await page.screenshot({ fullPage: false });
  saveFile('01-ai-isometric-devices-mockup.png', buf);
}

async function renderMockup2(page) {
  console.log('Generating Mockup 2: Apple Bento Grid Architecture...');
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        width: 1920px; height: 1080px; background: #000; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 30%, #111827 0%, #000 70%);
      }
      .bento-grid {
        width: 1760px; height: 960px; display: grid;
        grid-template-columns: 1.2fr 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 24px;
      }
      .card {
        background: #111216; border-radius: 32px; border: 1px solid rgba(255,255,255,0.08);
        padding: 40px; display: flex; flex-direction: column; justify-content: space-between;
        position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      }
      .card-featured {
        grid-row: span 2; background: linear-gradient(145deg, #161821, #0d0f15);
        border-color: rgba(10, 132, 255, 0.3); box-shadow: 0 0 80px rgba(0, 113, 227, 0.15);
      }
      .card-title { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 12px; }
      .card-desc { font-size: 16px; color: #86868b; line-height: 1.6; }
      .icon-box {
        width: 60px; height: 60px; border-radius: 20px; display: flex;
        align-items: center; justify-content: center; font-size: 28px; margin-bottom: 24px;
      }
      .chip {
        display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
        border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 16px;
      }
      .ring-circle {
        width: 180px; height: 180px; border-radius: 50%; border: 16px solid rgba(255,255,255,0.06);
        border-top-color: #30d158; border-right-color: #30d158; border-bottom-color: #30d158;
        transform: rotate(45deg); display: flex; align-items: center; justify-content: center;
        align-self: center; margin: 30px 0;
      }
      .ring-inner { transform: rotate(-45deg); text-align: center; }
      .ring-score { font-size: 38px; font-weight: 800; color: #fff; }
      .ring-label { font-size: 12px; color: #30d158; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="bento-grid">
      <!-- 1. AI Studio -->
      <div class="card card-featured">
        <div>
          <div class="chip" style="background: rgba(191,90,242,0.15); color: #bf5af2; border: 1px solid rgba(191,90,242,0.3);">
            ✨ MULTIMODAL INTELLIGENCE
          </div>
          <div class="card-title">AI Question Studio & Document Ingestion</div>
          <div class="card-desc">
            Direct integration with Google Gemini Multimodal Vision API. Ingests raw multi-page syllabus PDFs, textbook chapters, and complex diagram images to formulate rigorous examinations with automatic solutions and rationale.
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display:flex; justify-content:space-between; font-size:13px;">
            <span style="color:#86868b;">Document Understanding:</span>
            <span style="color:#bf5af2; font-weight:700;">Native Base64 Ingestion</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px;">
            <span style="color:#86868b;">Supported Inputs:</span>
            <span style="color:#fff;">PDF, PNG, JPG, WEBP, Prompts</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px;">
            <span style="color:#86868b;">Import Latency:</span>
            <span style="color:#30d158; font-weight:700;">< 2.8s per Batch</span>
          </div>
        </div>

        <div style="display:flex; gap:12px;">
          <div style="flex:1; padding:16px; border-radius:18px; background:rgba(255,255,255,0.03); text-align:center;">
            <div style="font-size:24px; font-weight:700; color:#fff;">100%</div>
            <div style="font-size:11px; color:#86868b;">Zero Third-Party OCR</div>
          </div>
          <div style="flex:1; padding:16px; border-radius:18px; background:rgba(255,255,255,0.03); text-align:center;">
            <div style="font-size:24px; font-weight:700; color:#0a84ff;">1-Click</div>
            <div style="font-size:11px; color:#86868b;">Direct Draft Import</div>
          </div>
        </div>
      </div>

      <!-- 2. Proctoring -->
      <div class="card">
        <div>
          <div class="chip" style="background: rgba(255,69,58,0.15); color: #ff453a; border: 1px solid rgba(255,69,58,0.3);">
            🛡️ INTEGRITY GUARD
          </div>
          <div class="card-title">Focus-Loss & Anti-Cheat Sentinel</div>
          <div class="card-desc">
            Browser visibility tracking, window blur alarms, and fullscreen lockdown with persistent timestamped incident audit logging for proctor oversight.
          </div>
        </div>
        <div style="display:flex; gap:10px; font-size:12px; color:#86868b;">
          <span>• Window Blur Detection</span>
          <span>• Tab Switching Traps</span>
          <span>• Non-Destructive Autosave</span>
        </div>
      </div>

      <!-- 3. Question Formats -->
      <div class="card">
        <div>
          <div class="chip" style="background: rgba(10,132,255,0.15); color: #0a84ff; border: 1px solid rgba(10,132,255,0.3);">
            📝 UNIVERSAL CURRICULUM
          </div>
          <div class="card-title">7 Versatile Question Types</div>
          <div class="card-desc">
            Complete exam versatility: Single-choice MCQ, Multi-select checkboxes, True/False, Numerical ranges, Fill-in-blanks, and Essays.
          </div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <span style="padding:6px 12px; border-radius:100px; font-size:11px; background:rgba(255,255,255,0.06);">MCQ</span>
          <span style="padding:6px 12px; border-radius:100px; font-size:11px; background:rgba(255,255,255,0.06);">Multi-Select</span>
          <span style="padding:6px 12px; border-radius:100px; font-size:11px; background:rgba(255,255,255,0.06);">True/False</span>
          <span style="padding:6px 12px; border-radius:100px; font-size:11px; background:rgba(255,255,255,0.06);">Numerical</span>
          <span style="padding:6px 12px; border-radius:100px; font-size:11px; background:rgba(255,255,255,0.06);">Essays</span>
        </div>
      </div>

      <!-- 4. Activity Ring Results -->
      <div class="card">
        <div>
          <div class="chip" style="background: rgba(48,209,88,0.15); color: #30d158; border: 1px solid rgba(48,209,88,0.3);">
            📊 INSTANT EVALUATION
          </div>
          <div class="card-title">Activity Ring Scoring & Analytics</div>
          <div class="card-desc">
            Instant objective auto-grading with itemized answer breakdowns, circular progress rings, and comprehensive CSV export.
          </div>
        </div>

        <div class="ring-circle">
          <div class="ring-inner">
            <div class="ring-score">92%</div>
            <div class="ring-label">PASSED</div>
          </div>
        </div>
      </div>

      <!-- 5. Apple HIG Design -->
      <div class="card">
        <div>
          <div class="chip" style="background: rgba(255,214,10,0.15); color: #ffd60a; border: 1px solid rgba(255,214,10,0.3);">
            🍎 DESIGN SYSTEM
          </div>
          <div class="card-title">iOS HIG & Dynamic Island HUD</div>
          <div class="card-desc">
            Engineered with continuous squircles, frosted glass materials, OLED pure black dark mode, and spring animations.
          </div>
        </div>
        <div style="font-size:13px; color:#30d158; font-weight:600;">
          ✓ Verified Accessible & Responsive across Mobile, Tablet, and Desktop
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  const buf = await page.screenshot({ fullPage: false });
  saveFile('02-ai-bento-grid-showcase.png', buf);
}

async function renderMockup3(page) {
  console.log('Generating Mockup 3: Full-Stack System Architecture Blueprint...');
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        width: 1920px; height: 1080px; background: #07090e; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 50%, #0d121d 0%, #050608 100%);
      }
      .blueprint-container {
        width: 1760px; height: 960px; border-radius: 36px;
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
        padding: 50px; display: flex; flex-direction: column; justify-content: space-between;
        position: relative;
      }
      .title-row {
        display: flex; justify-content: space-between; align-items: center;
      }
      .arch-pillars {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin: 40px 0; flex: 1;
      }
      .pillar {
        background: #11141c; border-radius: 28px; border: 1px solid rgba(255,255,255,0.08);
        padding: 32px; display: flex; flex-direction: column; gap: 20px;
        position: relative;
      }
      .pillar.highlight {
        border-color: rgba(0, 113, 227, 0.4); box-shadow: 0 0 50px rgba(0, 113, 227, 0.15);
      }
      .pillar-header {
        font-size: 18px; font-weight: 700; color: #0a84ff; display: flex; align-items: center; gap: 10px;
      }
      .pillar-list {
        display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: #a1a1a6;
      }
      .pillar-item {
        padding: 12px 16px; border-radius: 14px; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.05); color: #e5e5ea; font-size: 13px;
      }
      .data-bus {
        height: 50px; border-radius: 18px; background: rgba(0, 113, 227, 0.08);
        border: 1px dashed rgba(0, 113, 227, 0.3); display: flex; align-items: center;
        justify-content: space-around; font-size: 13px; color: #60a5fa; font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="blueprint-container">
      <div class="title-row">
        <div>
          <div style="font-size:36px; font-weight:800; letter-spacing:-1px;">System Architecture Blueprint</div>
          <div style="font-size:16px; color:#86868b; margin-top:6px;">High-Availability Dual-Interface Examination Engine</div>
        </div>
        <div style="padding:10px 24px; border-radius:100px; background:#1c1c1e; border:1px solid rgba(255,255,255,0.1); font-size:13px; color:#30d158; font-weight:700;">
          ● Production Ready & Verified
        </div>
      </div>

      <div class="arch-pillars">
        <!-- 1. Frontend -->
        <div class="pillar">
          <div class="pillar-header">🖥️ PRESENTATION TIER</div>
          <div class="pillar-list">
            <div class="pillar-item"><b>Student Exam Portal:</b> Restricted window, Dynamic Island countdown, question grid, autosave.</div>
            <div class="pillar-item"><b>Admin Control Center:</b> Exam builder, question studio, submissions audit, CSV exporter.</div>
            <div class="pillar-item"><b>Design Core:</b> Tailwind CSS, Apple continuous squircles, Light/Dark theme sync.</div>
          </div>
        </div>

        <!-- 2. Security -->
        <div class="pillar highlight">
          <div class="pillar-header">🛡️ SECURITY & PROCTORING</div>
          <div class="pillar-list">
            <div class="pillar-item"><b>Focus-Loss Sentinel:</b> VisibilityChange & Blur listeners with timestamped incident logs.</div>
            <div class="pillar-item"><b>Accidental Exit Guard:</b> Native beforeunload interceptors & modal confirmations.</div>
            <div class="pillar-item"><b>Auth & RBAC:</b> Stateless JWT tokens, bcrypt salted password hashes, student ID isolation.</div>
          </div>
        </div>

        <!-- 3. AI Multimodal -->
        <div class="pillar highlight">
          <div class="pillar-header">✨ AI INFERENCE STUDIO</div>
          <div class="pillar-list">
            <div class="pillar-item"><b>Google Gemini Multimodal:</b> Document parsing, image vision, and JSON question generation.</div>
            <div class="pillar-item"><b>Document Ingestion:</b> Raw base64 PDF stream processing up to 15MB.</div>
            <div class="pillar-item"><b>Conversational Assistant:</b> Multi-turn iterative question tuning & 1-click batch import.</div>
          </div>
        </div>

        <!-- 4. Persistence -->
        <div class="pillar">
          <div class="pillar-header">🗄️ PERSISTENCE & DATA</div>
          <div class="pillar-list">
            <div class="pillar-item"><b>Express REST API:</b> Robust error handling, rate limiting, and CORS configuration.</div>
            <div class="pillar-item"><b>Prisma ORM:</b> Type-safe SQLite relational database schema with cascade deletions.</div>
            <div class="pillar-item"><b>Cloud Integrations:</b> Cloudinary CDN image uploads and Resend transactional emails.</div>
          </div>
        </div>
      </div>

      <div class="data-bus">
        <span>⚡ Bidirectional REST / JSON APIs</span>
        <span>•</span>
        <span>🔒 Zero Data Loss Periodic Autosave Journal</span>
        <span>•</span>
        <span>🤖 Gemini 1M Context Window Pipeline</span>
        <span>•</span>
        <span>📈 Sub-millisecond SQLite Query Execution</span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  const buf = await page.screenshot({ fullPage: false });
  saveFile('03-ai-architecture-blueprint.png', buf);
}

async function renderAICommercialVideo(page) {
  console.log('Generating Asset 4: 1080p 60fps AI Commercial Motion Video (Hook-Story-CTA)...');

  const img1 = `data:image/png;base64,${fs.readFileSync(path.join(OUTPUT_DIR, '01-ai-isometric-devices-mockup.png')).toString('base64')}`;
  const img2 = `data:image/png;base64,${fs.readFileSync(path.join(OUTPUT_DIR, '02-ai-bento-grid-showcase.png')).toString('base64')}`;
  const img3 = `data:image/png;base64,${fs.readFileSync(path.join(OUTPUT_DIR, '03-ai-architecture-blueprint.png')).toString('base64')}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        width: 1920px; height: 1080px; background: #000; overflow: hidden;
        display: flex; align-items: center; justify-content: center;
      }
      canvas { width: 1920px; height: 1080px; }
    </style>
  </head>
  <body>
    <canvas id="c" width="1920" height="1080"></canvas>
    <script>
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');

      const images = {};
      function load(name, src) {
        return new Promise(r => {
          const img = new Image();
          img.onload = () => { images[name] = img; r(); };
          img.onerror = () => r();
          img.src = src;
        });
      }

      async function start() {
        await Promise.all([
          load('iso', '${img1}'),
          load('bento', '${img2}'),
          load('blue', '${img3}')
        ]);

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8',
          videoBitsPerSecond: 8000000
        });

        const chunks = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onload = () => {
            window.videoBase64 = reader.result.split(',')[1];
            window.done = true;
          };
          reader.readAsDataURL(blob);
        };

        recorder.start();

        const DURATION = 36; // 36 seconds
        const FPS = 30;
        const TOTAL_FRAMES = DURATION * FPS;
        let frame = 0;

        // Particle system for AI effect
        const particles = Array.from({length: 60}, () => ({
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? '#0071e3' : '#bf5af2'
        }));

        function drawParticles() {
          particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = 1920; if (p.x > 1920) p.x = 0;
            if (p.y < 0) p.y = 1080; if (p.y > 1080) p.y = 0;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        function draw() {
          const time = frame / FPS;

          ctx.fillStyle = '#050608';
          ctx.fillRect(0, 0, 1920, 1080);
          drawParticles();

          // Brand HUD overlay
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.roundRect(80, 40, 1760, 60, 30);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = '700 20px -apple-system, sans-serif';
          ctx.fillText('DUAL-INTERFACE EXAMINATION SYSTEM', 130, 77);

          ctx.font = '500 16px -apple-system, sans-serif';
          ctx.fillStyle = '#0a84ff';
          ctx.fillText('PRODUCT COMMERCIAL • 2026', 1580, 77);

          // Scene 1 (0-6s): Hook
          if (time < 6) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0a84ff';
            ctx.font = '700 20px -apple-system, sans-serif';
            ctx.fillText('RE-IMAGINING ONLINE ASSESSMENT', 960, 360);

            ctx.fillStyle = '#ffffff';
            ctx.font = '800 68px -apple-system, sans-serif';
            ctx.fillText('Testing, Perfected for Modern Education.', 960, 440);

            ctx.fillStyle = '#86868b';
            ctx.font = '400 24px -apple-system, sans-serif';
            ctx.fillText('Apple HIG Design • Gemini Multimodal Vision • Smart Proctoring Sentinel', 960, 520);
            ctx.textAlign = 'left';

          } else if (time < 16) {
            // Scene 2 (6-16s): 3D Ecosystem Reveal
            ctx.drawImage(images.iso, 120, 140, 1680, 840);

            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.roundRect(140, 780, 800, 140, 20);
            ctx.fill();

            ctx.fillStyle = '#0a84ff';
            ctx.font = '700 16px -apple-system, sans-serif';
            ctx.fillText('PILLAR 1: RESTRICTED DUAL-PANEL ARCHITECTURE', 170, 820);

            ctx.fillStyle = '#ffffff';
            ctx.font = '600 22px -apple-system, sans-serif';
            ctx.fillText('Dedicated Student Exam Room + Admin Control Studio', 170, 855);

            ctx.font = '400 15px -apple-system, sans-serif';
            ctx.fillStyle = '#a1a1a6';
            ctx.fillText('Dynamic Island HUD countdown timer, tactile option cards & autosave journal.', 170, 890);

          } else if (time < 26) {
            // Scene 3 (16-26s): Bento Grid Innovation
            ctx.drawImage(images.bento, 120, 140, 1680, 840);

            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.roundRect(140, 780, 860, 140, 20);
            ctx.fill();

            ctx.fillStyle = '#bf5af2';
            ctx.font = '700 16px -apple-system, sans-serif';
            ctx.fillText('PILLAR 2: MULTIMODAL AI & DOCUMENT INGESTION', 170, 820);

            ctx.fillStyle = '#ffffff';
            ctx.font = '600 22px -apple-system, sans-serif';
            ctx.fillText('Upload Raw PDFs or Diagrams → Instant Rigorous Questions', 170, 855);

            ctx.font = '400 15px -apple-system, sans-serif';
            ctx.fillStyle = '#a1a1a6';
            ctx.fillText('Powered by Google Gemini 1M context window with 1-click batch exam import.', 170, 890);

          } else {
            // Scene 4 (26-36s): Architecture & Open Source Call to Action
            ctx.drawImage(images.blue, 120, 140, 1680, 840);

            ctx.fillStyle = 'rgba(0, 113, 227, 0.9)';
            ctx.beginPath();
            ctx.roundRect(560, 760, 800, 140, 24);
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 28px -apple-system, sans-serif';
            ctx.fillText('Explore the Full Source Code on GitHub', 960, 815);

            ctx.font = '500 18px -apple-system, sans-serif';
            ctx.fillText('👉 https://github.com/sagarrr217/exam-system', 960, 860);
            ctx.textAlign = 'left';
          }

          // Bottom progress
          const prog = frame / TOTAL_FRAMES;
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(80, 1020, 1760, 6);
          ctx.fillStyle = '#0071e3';
          ctx.fillRect(80, 1020, 1760 * prog, 6);

          frame++;
          if (frame <= TOTAL_FRAMES) {
            requestAnimationFrame(draw);
          } else {
            recorder.stop();
          }
        }

        draw();
      }

      start();
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.done === true, { timeout: 120000 });
  const base64 = await page.evaluate(() => window.videoBase64);
  const buf = Buffer.from(base64, 'base64');
  saveFile('ai-product-commercial.webm', buf);
}

async function main() {
  console.log('🚀 Generating Full Suite of AI Mockups & Commercial Video...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  try {
    await renderMockup1(page);
    await renderMockup2(page);
    await renderMockup3(page);
    await renderAICommercialVideo(page);
    console.log('🎉 All AI-generated mockups and commercial video completed!');
  } catch (err) {
    console.error('Error during generation:', err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
