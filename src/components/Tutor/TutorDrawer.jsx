import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { MathBlock } from '../Lesson/MathBlock';
import { 
  sendTutorMessage, 
  getTutorChatHistory, 
  saveTutorChatHistory, 
  clearTutorChatHistory 
} from '../../utils/aiTutor';
import { getSettings, setSettings, getProgress, getDiagnosticResults, getStreak, getMastery, accuracy } from '../../utils/storage';

export const TutorDrawer = ({ currentContext = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => getTutorChatHistory());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API Key config state
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState(() => getSettings().aiApiKey || '');
  const [provider, setProvider] = useState(() => getSettings().aiProvider || 'gemini');
  const [keySaved, setKeySaved] = useState(false);

  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const [tutorMode, setTutorMode] = useState('Explain');
  useEffect(() => {
    if (!isOpen) return;
    const onKey = event => {
      if(event.key === 'Escape') { setIsOpen(false); triggerRef.current?.focus(); }
      if(event.key === 'Tab') {
        const nodes = [...panelRef.current.querySelectorAll('button,input,select,a[href]')].filter(el=>!el.disabled);
        const first=nodes[0], last=nodes.at(-1);
        if(event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
        if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',onKey);
    return () => document.removeEventListener('keydown',onKey);
  }, [isOpen]);
  const inputRef = useRef(null);
  const location = useLocation();

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSettings({ aiApiKey: apiKey.trim(), aiProvider: provider });
    setKeySaved(true);
    setShowConfig(false);
    setError(null);
    setTimeout(() => setKeySaved(false), 3000);
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    // Check if API key is set
    const currentApiKey = getSettings().aiApiKey;
    if (!currentApiKey) {
      setShowConfig(true);
      setError('Please add your API key first to chat with the AI tutor.');
      return;
    }

    const userMessage = { role: 'user', content: textToSend, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!customText) setInput('');
    setLoading(true);
    setError(null);

    try {
      const reply = await sendTutorMessage({
        message: textToSend,
        history: messages,
        currentContext: { ...currentContext, tutorMode },
      });

      const assistantMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage].slice(-30);
      setMessages(finalMessages);
      saveTutorChatHistory(finalMessages);
    } catch (err) {
      console.error('Tutor chat error:', err);
      if (err.message === 'API_KEY_REQUIRED') {
        setShowConfig(true);
        setError('Please configure your Gemini or OpenAI API key.');
      } else {
        setError(err.message || 'Failed to get response from AI tutor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearTutorChatHistory();
    setMessages([]);
  };

  const quickPrompts = [
    'Show me one worked example for this concept',
    'Give me one hint for the current problem',
    'Help me check my reasoning; ask me for my paper steps',
    'Quiz me with a new problem on this concept',
    'What should I revisit later based on my recorded work?',
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white font-mono text-xs font-bold py-3 px-4 rounded-xl shadow-lg border border-zinc-700/80 dark:border-indigo-400/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Open Engineering Math Copilot"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-amber-400">⚡</span>
        <span>AI COPILOT</span>
      </button>

      {/* Slide-out Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}
        />
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Ada study tutor" className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col font-mono transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              ∑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Ada // AI Tutor</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Optional AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Socratic Engineering Math Copilot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs"
              aria-label="Tutor settings"
              title="API Key Configuration"
            >
              ⚙
            </button>
            <button
              onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold"
              aria-label="Close tutor"
              title="Close Copilot"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Current Telemetry Context Bar */}
        <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
          <span className="truncate">
            📍 <strong className="font-semibold">{currentContext.moduleTitle || 'Dashboard'}</strong>
            {(() => {
              let overallMastery = 0;
              try {
                const masteryScores = typeof getMastery === 'function' ? getMastery() : {};
                const scores = Object.values(masteryScores || {});
                if (scores.length > 0) {
                  overallMastery = Math.round(scores.reduce((sum,record)=>sum+(accuracy(record)||0),0) / scores.length);
                }
              } catch(e) {}
              const weakCount = getDiagnosticResults()?.weakAreas?.length || 0;
              
              return (
                <>
                  {overallMastery > 0 && <span> · {overallMastery}% mixed-practice accuracy</span>}
                  {weakCount > 0 && <span> · {weakCount} geometry review areas</span>}
                </>
              );
            })()}
          </span>
          {messages.length > 0 && (
            <button 
              onClick={handleClearChat}
              className="text-[10px] text-zinc-400 hover:text-rose-500 underline ml-2 shrink-0"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* API Key Configuration Panel */}
        {showConfig && (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">LLM Provider Configuration</span>
              <button 
                onClick={() => setShowConfig(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your API key is stored locally in your browser's local storage and used directly to communicate with the model.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider('gemini')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      provider === 'gemini'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('openai')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      provider === 'openai'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    OpenAI / ChatGPT
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                  </label>
                  {provider === 'gemini' && (
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 underline"
                    >
                      Get API Key →
                    </a>
                  )}
                </div>
                <input
                  aria-label="Tutor provider API key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="secondary" type="button" onClick={() => setShowConfig(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Key
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Chat Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="py-8 px-2 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold mx-auto">
                ⚡
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Study support
                </h4>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/60 text-left mt-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">Ada: </span>
                  {(() => {
                    if (currentContext.conceptId) return `You're working on ${currentContext.conceptId}. Ask for one example, a hint, or help checking the steps on your paper. Your worked examples also work without an AI connection.`;
                    const diag = getDiagnosticResults();
                    const progress = getProgress();
                    const streak = typeof getStreak === 'function' ? getStreak() : 0;
                    const streakDays = typeof streak === 'object' ? (streak?.current || 0) : Number(streak) || 0;
                    const numComplete = Object.values(progress).filter(item=>item.completed).length;
                    if (!diag || diag.overallScore === undefined) {
                      return "I see you haven't run the diagnostic yet. That's the best place to start — it only takes 5 minutes and helps me understand exactly where your gaps are.";
                    }
                    if (diag.weakAreas?.length > 0) {
                      return `Based on your diagnostic, ${diag.weakAreas[0]} is where I'd focus. Want me to explain the key concepts?`;
                    }
                    return `You're making solid progress — ${numComplete} modules complete, ${streakDays} day streak. What would you like to work on?`;
                  })()}
                </div>
              </div>

              {!getSettings().aiApiKey && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    ⚡ Quick Setup Required
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Connect a provider key for optional tutoring. Requests may incur provider charges; study and worked examples work without AI.
                  </p>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="w-full text-xs" 
                    onClick={() => setShowConfig(true)}
                  >
                    Configure API Key →
                  </Button>
                </div>
              )}

              <div className="pt-2 text-left space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Quick Inquiries:
                </div>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      className="text-left text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors"
                    >
                      {p} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1 px-1">
                {msg.role === 'user' ? 'You' : 'Ada (Tutor)'}
              </div>
              <div 
                className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/80'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <MathBlock plainText content={msg.content} />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-zinc-400 mb-1 px-1">Ada (Tutor)</div>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs flex items-center gap-2 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span>Synthesizing physical intuition...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-1">
              <div className="font-bold">Error Encountered</div>
              <div>{error}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <label className="px-4 pt-3 text-sm">Tutor mode
          <select value={tutorMode} onChange={event=>setTutorMode(event.target.value)} className="block w-full p-2 bg-white dark:bg-zinc-800">
            {['Explain','One hint','Check my reasoning','Quiz me'].map(mode=><option key={mode}>{mode}</option>)}
          </select>
        </label>
        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              aria-label="Message to Ada"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this concept, formula, or problem..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-400"
            />
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={loading || !input.trim()}
            >
              Send
            </Button>
          </form>
        </div>
      </div>}
    </>
  );
};

export default TutorDrawer;
