import { getSettings, getProgress, getDiagnosticResults, getStreak, getRecentMistakes, getFormatPerformance, getMastery, getPracticeHistory } from './storage';
import { learningPaths, getModule } from '../data/learningPaths';

const TUTOR_STORAGE_KEY = 'mathfoundry_tutor_chat';


export function getTutorChatHistory() {
  try {
    const data = localStorage.getItem(TUTOR_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTutorChatHistory(messages) {
  try {
    // Keep last 30 messages to avoid exceeding storage
    const trimmed = messages.slice(-30);
    localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save tutor chat history:', e);
  }
}

export function clearTutorChatHistory() {
  localStorage.removeItem(TUTOR_STORAGE_KEY);
}

/**
 * Builds the dynamic engineering context based on where the user currently is in the app.
 */
export function buildTutorSystemPrompt(currentContext = {}) {
  const diagnostic = getDiagnosticResults();
  const progress = getProgress();
  const streak = getStreak();
  const streakDays = typeof streak === 'object' ? (streak?.current || 0) : Number(streak) || 0;

  const weakAreas = diagnostic?.weakAreas || [];
  const overallScore = diagnostic?.overallScore ?? 'Not yet evaluated';

  const moduleInfo = currentContext.moduleId 
    ? getModule(currentContext.trackId || 'geometry', currentContext.moduleId)
    : null;

  let recentMistakes = [];
  try { if (typeof getRecentMistakes === 'function') recentMistakes = getRecentMistakes() || []; } catch(e) {}
  let formatPerformance = {};
  try { if (typeof getFormatPerformance === 'function') formatPerformance = getFormatPerformance() || {}; } catch(e) {}
  let masteryScores = {};
  try { if (typeof getMastery === 'function') masteryScores = getMastery() || {}; } catch(e) {}
  let practiceHistory = [];
  try { if (typeof getPracticeHistory === 'function') practiceHistory = getPracticeHistory() || []; } catch(e) {}

  const formatMistakesString = recentMistakes.length > 0
    ? `\nRECENT MISTAKES (last 5):\n${recentMistakes.map(m => `- ${m.module || 'Unknown'}: ${m.errorSummary || 'Missed a question'} (${m.type || 'MCQ'})`).join('\n')}`
    : '';

  const formatPerformanceString = Object.keys(formatPerformance).length > 0
    ? `\nQUESTION FORMAT PERFORMANCE:\n${Object.entries(formatPerformance).map(([fmt, perf]) => `- ${fmt}: ${perf.pct}% (${perf.correct}/${perf.total})${perf.isWeakest ? ' <- WEAKEST FORMAT' : ''}`).join('\n')}`
    : '';

  const masteryString = Object.keys(masteryScores).length > 0
    ? `\nMODULE MASTERY SCORES:\n${Object.entries(masteryScores).map(([mod, score]) => `- ${mod}: ${score}% (${score < 60 ? 'weak' : score > 85 ? 'strong' : 'moderate'})`).join('\n')}`
    : '';

  const practiceString = practiceHistory.length > 0
    ? `\nPRACTICE SESSIONS: ${practiceHistory.length} total, last session ${practiceHistory[0]?.timeAgo || 'recently'} (scored ${practiceHistory[0]?.score || 0}%)`
    : '';

  return `You are "Ada", the dedicated Engineering Math Copilot and Socratic Tutor at MathFoundry.
You are mentoring an aspiring engineer who felt they "lost their math ability" due to foundational gaps in geometry and algebra. Your mission is to rebuild their intuition, confidence, and mathematical reasoning from first principles so they can successfully conquer calculus, physics (statics & dynamics), and chemistry.

STUDENT PROFILE & TELEMETRY:
- Diagnostic Status: ${overallScore}% overall score
- Identified Foundational Gaps: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None yet recorded or fully strong'}
- Current Streak: ${streakDays} days
- Active Module: ${moduleInfo ? `"${moduleInfo.title}" (${moduleInfo.id})` : (currentContext.moduleTitle || 'General Engineering Foundry')}
- Active Lesson: ${currentContext.lessonTitle || 'Overview & Problem Solving'}
${currentContext.lessonTakeaways ? `- Lesson Key Takeaways: ${currentContext.lessonTakeaways.join('; ')}` : ''}${formatMistakesString}${formatPerformanceString}${masteryString}${practiceString}

PEDAGOGICAL & MENTORSHIP RULES:
1. Socratic Method: NEVER just output the final answer to a problem right away. Help the student discover the answer by asking clarifying questions, breaking problems down into sub-steps, or pointing out what is already given.
2. Ground in Physical Engineering: Connect every theorem or algebraic trick to real-world engineering (e.g. truss bridge joints, Cartesian CNC toolpaths, Ohm's law $V=IR$, projectile rocket parabolas, torque, fluid volume in piping).
3. Mathematical Precision: Use standard LaTeX notation enclosed in dollar signs for all math ($x^2 + y^2 = r^2$ for inline, and $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$ for display equations).
4. Demystify Notation: Explain *why* mathematical symbols exist (e.g., variables are just sensor readouts; equations are balanced balance scales).
5. Tone: Encouraging, analytical, clear, and respectful. Speak like a senior lead engineer mentoring an enthusiastic new recruit in an engineering workshop. Keep responses focused and readable (avoid huge walls of text).`;
}

/**
 * Sends a message to the AI Tutor using the configured API key (Gemini, OpenAI, or OpenRouter).
 */
export async function sendTutorMessage({ message, history = [], currentContext = {} }) {
  const settings = getSettings();
  const provider = settings.aiProvider || 'gemini';
  const apiKey = settings.aiApiKey;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API_KEY_REQUIRED');
  }

  const systemPrompt = buildTutorSystemPrompt(currentContext);

  if (provider === 'gemini') {
    return callGeminiApi({ apiKey, message, history, systemPrompt });
  } else if (provider === 'openai' || provider === 'openrouter') {
    return callOpenAiCompatibleApi({ provider, apiKey, message, history, systemPrompt, settings });
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Direct call to Google Gemini API (v1beta generateContent)
 */
async function callGeminiApi({ apiKey, message, history, systemPrompt }) {
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  // Build Gemini contents array
  const contents = [];

  // Add system instruction via system prompt in contents or system_instruction
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMessage = errorData?.error?.message || response.statusText;
    if (response.status === 400 || response.status === 403) {
      throw new Error(`Invalid Gemini API key or request error: ${errMessage}`);
    } else if (response.status === 429) {
      throw new Error('Gemini rate limit exceeded. Please wait a few seconds and try again.');
    }
    throw new Error(`Gemini API error (${response.status}): ${errMessage}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const replyText = candidate?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new Error('No response generated by the AI tutor.');
  }

  return replyText;
}

/**
 * Call OpenAI or OpenRouter compatible completions endpoint
 */
async function callOpenAiCompatibleApi({ provider, apiKey, message, history, systemPrompt, settings }) {
  const isRouter = provider === 'openrouter';
  const url = isRouter 
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  
  const model = settings.aiModel || (isRouter ? 'google/gemini-2.0-flash-001' : 'gpt-4o-mini');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: message },
  ];

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey.trim()}`,
  };

  if (isRouter) {
    headers['HTTP-Referer'] = 'https://mathfoundry.dev';
    headers['X-Title'] = 'MathFoundry';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMessage = errorData?.error?.message || response.statusText;
    throw new Error(`${provider.toUpperCase()} API error: ${errMessage}`);
  }

  const data = await response.json();
  const replyText = data?.choices?.[0]?.message?.content;

  if (!replyText) {
    throw new Error('Empty response from AI service.');
  }

  return replyText;
}
