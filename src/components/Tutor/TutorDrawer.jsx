import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import MathBlock from "../Lesson/MathBlock";
import {
  sendTutorMessage,
  getTutorChatHistory,
  saveTutorChatHistory,
  clearTutorChatHistory,
} from "../../utils/aiTutor";
import { getSettings } from "../../utils/storage";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import { useStoreChange } from "../../hooks/useStoreChange";
import { studyTimestamp } from "../../utils/studySession";

const quickPrompts = [
  "Show me one worked example for this concept",
  "Give me one hint for the current problem",
  "Help me check my reasoning; ask me for my paper steps",
  "Quiz me with a new problem on this concept",
];

export function TutorDrawer({
  currentContext = {},
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) {
  useStoreChange();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;
  const [messages, setMessages] = useState(getTutorChatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tutorMode, setTutorMode] = useState("Explain");
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const connected = Boolean(getSettings().aiApiKey);

  function handleClose() {
    if (isControlled) controlledOnClose?.();
    else setInternalOpen(false);
  }
  useDialogFocus(isOpen, panelRef, handleClose, inputRef);
  useEffect(() => {
    if (isOpen && messages.length > 0)
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [isOpen, messages]);

  async function send(customText = null) {
    const text = (customText || input).trim();
    if (!text || loading) return;
    if (!getSettings().aiApiKey) {
      setError(
        "Add a provider key in Settings to use Ada. Worked examples and visuals are available in your lesson.",
      );
      return;
    }
    const updated = [
      ...messages,
      { role: "user", content: text, timestamp: studyTimestamp() },
    ];
    setMessages(updated);
    if (!customText) setInput("");
    setLoading(true);
    setError("");
    try {
      const reply = await sendTutorMessage({
        message: text,
        history: messages,
        currentContext: { ...currentContext, tutorMode },
      });
      const finalMessages = [
        ...updated,
        { role: "assistant", content: reply, timestamp: studyTimestamp() },
      ].slice(-30);
      saveTutorChatHistory(finalMessages);
      setMessages(finalMessages);
    } catch (err) {
      setError(
        err.message === "API_KEY_REQUIRED"
          ? "Add a provider key in Settings to use Ada."
          : err.message ||
              "The tutor could not respond. Try again when you are ready.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isControlled && (
        <button
          className="tutor-launcher study-button secondary"
          onClick={() => setInternalOpen(true)}
        >
          Tutor
        </button>
      )}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ada-title"
            className="athena-tutor fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] flex flex-col shadow-2xl"
          >
            <header className="tutor-header">
              <div>
                <p className="eyebrow">Optional study support</p>
                <h2 id="ada-title">Ada</h2>
              </div>
              <div className="tutor-header-actions">
                <Link to="/settings" onClick={handleClose}>
                  Settings
                </Link>
                <button aria-label="Close tutor" onClick={handleClose}>
                  Close
                </button>
              </div>
            </header>
            <div className="tutor-context">
              <span>{currentContext.moduleTitle || "Study desk"}</span>
              {messages.length > 0 && (
                <button
                  disabled={loading}
                  onClick={() => {
                    clearTutorChatHistory();
                    setMessages([]);
                    setError("");
                  }}
                >
                  Clear conversation
                </button>
              )}
            </div>
            <div className="tutor-conversation" aria-label="Tutor conversation">
              {messages.length === 0 && (
                <div className="tutor-welcome">
                  <h3>Think it through together.</h3>
                  <p>
                    {currentContext.question
                      ? "Ask for one hint, a separate example, or help checking the steps on your paper."
                      : "Choose a topic or bring a question from your paper. Ada can help you explain a method and check your reasoning."}
                  </p>
                  {!connected && (
                    <div className="tutor-setup">
                      <p>
                        Connect a provider key for optional tutoring. Requests
                        may incur provider charges. Your lessons, examples, and
                        visuals work without AI.
                      </p>
                      <Link
                        className="study-button secondary"
                        to="/settings"
                        onClick={handleClose}
                      >
                        Configure tutor
                      </Link>
                    </div>
                  )}
                  <p className="eyebrow">A place to begin</p>
                  <div className="tutor-prompts">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        disabled={loading}
                        onClick={() => send(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message, i) => (
                <div
                  key={`${message.timestamp}-${i}`}
                  className={`tutor-message ${message.role === "user" ? "from-user" : ""}`}
                >
                  <p className="tutor-speaker">
                    {message.role === "user" ? "You" : "Ada"}
                  </p>
                  <div className="tutor-message-body">
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <MathBlock plainText content={message.content} />
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <p role="status" className="study-muted">
                  Thinking through your question…
                </p>
              )}
              {error && (
                <p role="alert" className="study-notice">
                  {error}
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              className="tutor-composer"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <label>
                Tutor mode
                <select
                  value={tutorMode}
                  onChange={(event) => setTutorMode(event.target.value)}
                >
                  {["Explain", "One hint", "Check my reasoning", "Quiz me"].map(
                    (mode) => (
                      <option key={mode}>{mode}</option>
                    ),
                  )}
                </select>
              </label>
              <div className="tutor-send">
                <input
                  aria-label="Message to Ada"
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your idea or paper steps…"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
export default TutorDrawer;
