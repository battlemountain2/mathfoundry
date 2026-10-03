import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 9222;
const USER_DATA_DIR = '/tmp/mathfoundry-fixture-profile';

// Clean temp directory
fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
fs.mkdirSync(USER_DATA_DIR, { recursive: true });

const chrome = spawn('google-chrome-stable', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DATA_DIR}`,
  'http://127.0.0.1:5173/',
], { stdio: 'ignore' });

// Wait for devtools endpoint
async function waitForCdp() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) {
        const pages = await res.json();
        if (pages.length > 0) return pages[0].webSocketDebuggerUrl;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome DevTools timed out');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }
  async init() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message));
          else res(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.id++;
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function run() {
  try {
    const wsUrl = await waitForCdp();
    const cdp = new CdpClient(wsUrl);
    await cdp.init();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    // 1. Synthetic test data payload
    const fixtureData = {
      settings: { theme: 'light', fontSize: 'medium' },
      reviewHistory: [
        {
          id: 'fixture-session-p1',
          title: 'Arithmetic & fractions block',
          timestamp: new Date().toISOString(),
          answers: [
            {
              id: 'q1',
              question: 'Add 1/4 + 1/6. Enter a fraction.',
              submittedAnswer: '2/10',
              expectedAnswer: '5/12',
              isCorrect: false,
              skipped: false,
              assisted: false,
              explanation: 'Use common denominator 12: 3/12 + 2/12 = 5/12.',
              problem: {
                question: 'Add 1/4 + 1/6. Enter a fraction.',
                conceptId: 'addition',
                example: {
                  question: 'Add 1/3 + 1/4.',
                  steps: ['Common denominator is 12.', '4/12 + 3/12 = 7/12.'],
                },
              },
            },
            {
              id: 'q2',
              question: 'Which is larger: 3/4 or 2/3?',
              submittedAnswer: null,
              expectedAnswer: '3/4',
              isCorrect: false,
              skipped: true,
              assisted: false,
              explanation: 'Use denominator 12: 3/4 is 9/12, while 2/3 is 8/12.',
              problem: {
                question: 'Which is larger: 3/4 or 2/3?',
                conceptId: 'comparison',
                options: ['3/4', '2/3'],
              },
            },
            {
              id: 'q3',
              question: 'What is 7 × 6?',
              initialAnswer: '40',
              submittedAnswer: '42',
              expectedAnswer: '42',
              isCorrect: true,
              skipped: false,
              assisted: true,
              explanation: '7 × 6 = 42. Check: 42 ÷ 6 = 7.',
              problem: {
                question: 'What is 7 × 6?',
                conceptId: 'arithmetic',
              },
            },
            {
              id: 'q4',
              question: 'Find 2/3 of 3/5. Enter a fraction.',
              submittedAnswer: '2/5',
              expectedAnswer: '2/5',
              isCorrect: true,
              skipped: false,
              assisted: false,
              explanation: '(2 × 3) / (3 × 5) = 6/15 = 2/5.',
              problem: {
                question: 'Find 2/3 of 3/5. Enter a fraction.',
                conceptId: 'multiplication',
              },
            },
            {
              id: 'q5',
              question: 'Solve for x: 2x - 5 = 11',
              initialAnswer: '3',
              submittedAnswer: '6',
              expectedAnswer: '8',
              isCorrect: false,
              skipped: false,
              assisted: true,
              explanation: '2x = 16 => x = 8.',
              problem: {
                question: 'Solve for x: 2x - 5 = 11',
                moduleId: 'linear-equations',
              },
            },
            {
              id: 'q6',
              question: 'Point and line basic geometric definitions',
              submittedAnswer: undefined,
              expectedAnswer: undefined,
              isCorrect: true,
              skipped: false,
              assisted: false,
              explanation: 'Recorded in earlier quiz session before full step logging.',
            },
          ],
        },
      ],
      foundationSession: {
        id: 'fixture-active-foundations',
        mode: 'guided',
        minutes: 30,
        index: 0,
        questions: [
          {
            id: 'addition-active',
            conceptId: 'addition',
            question: 'Add 1/4 + 1/6. Enter a fraction.',
            answer: '5/12',
            explanation: 'Use common denominator 12: 3/12 + 2/12 = 5/12.',
            example: {
              question: 'Add 1/3 + 1/4.',
              steps: ['Common denominator is 12.', '4/12 + 3/12 = 7/12.'],
            },
          },
        ],
        answers: [
          {
            id: 'fixture-active-foundations:0',
            sessionId: 'fixture-active-foundations',
            conceptId: 'addition',
            problemId: 'addition-active',
            question: 'Add 1/4 + 1/6. Enter a fraction.',
            submittedAnswer: '2/10',
            initialAnswer: '2/10',
            expectedAnswer: '5/12',
            explanation: 'Use common denominator 12: 3/12 + 2/12 = 5/12.',
            isCorrect: false,
            skipped: false,
            assisted: false,
          },
        ],
        input: '2/10',
        attemptsOnCurrent: 1,
        initialAnswer: '2/10',
        showHint: true,
        showSolution: false,
        assisted: true,
        checked: true,
        exampleOpen: false,
      },
    };

    // Helper to evaluate script in page
    async function evalInPage(expression) {
      return cdp.send('Runtime.evaluate', { expression, awaitPromise: true });
    }

    async function setStorageAndNavigate(pathUrl, theme = 'light', width = 1280, height = 900) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: width < 600,
      });

      fixtureData.settings.theme = theme;
      const json = JSON.stringify(fixtureData).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

      await cdp.send('Page.navigate', { url: `http://127.0.0.1:5173${pathUrl}` });
      await new Promise((r) => setTimeout(r, 600));

      await evalInPage(`
        localStorage.setItem('mathfoundry_data', '${json}');
        document.documentElement.setAttribute('data-theme', '${theme}');
        if ('${theme}' === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      `);

      await cdp.send('Page.navigate', { url: `http://127.0.0.1:5173${pathUrl}` });
      await new Promise((r) => setTimeout(r, 800));
    }

    async function takeScreenshot(outputPath) {
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${outputPath}`);
    }

    const screenshotsDir = path.resolve('docs/screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // Screenshot 1: Review in Light Paper theme
    await setStorageAndNavigate('/review?session=fixture-session-p1', 'light');
    await takeScreenshot(path.join(screenshotsDir, 'p1-review-light.png'));

    // Screenshot 2: Review in Charcoal Dark theme
    await setStorageAndNavigate('/review?session=fixture-session-p1', 'dark');
    await takeScreenshot(path.join(screenshotsDir, 'p1-review-dark.png'));

    // Screenshot 3: Review in Deep Pine Forest theme
    await setStorageAndNavigate('/review?session=fixture-session-p1', 'forest');
    await takeScreenshot(path.join(screenshotsDir, 'p1-review-forest.png'));

    // Screenshot 4: Review on Mobile (390px)
    await setStorageAndNavigate('/review?session=fixture-session-p1', 'light', 390, 844);
    await takeScreenshot(path.join(screenshotsDir, 'p1-review-mobile.png'));

    // Screenshot 5: Active Foundations Hint & Retry Flow (Desktop)
    await setStorageAndNavigate('/foundations', 'light', 1280, 900);
    await takeScreenshot(path.join(screenshotsDir, 'p1-active-hint-retry.png'));

    // Screenshot 6: Interactive Fraction Bar Lab (Desktop)
    await setStorageAndNavigate('/foundations?lab=fraction-bars', 'forest', 1280, 950);
    await takeScreenshot(path.join(screenshotsDir, 'p2-fraction-visualizer.png'));

    console.log('All verification screenshots captured successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch((err) => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
