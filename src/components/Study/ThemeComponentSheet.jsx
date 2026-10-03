import React from 'react';
import MathBlock from '../Lesson/MathBlock';

export default function ThemeComponentSheet({ currentTheme }) {
  return (
    <div className="study-card space-y-8 animate-fade-in" style={{ padding: '28px' }}>
      <div>
        <p className="eyebrow">Design System & Verification</p>
        <h2 style={{ margin: '6px 0 2px' }}>Theme Component Sheet</h2>
        <p className="study-muted">
          Active palette: <strong>{currentTheme === 'forest' ? 'Deep Pine Forest' : currentTheme === 'dark' ? 'Original Charcoal Dark' : 'Light Paper'}</strong>.
          Every component adapts to token variables without hardcoded color conflicts.
        </p>
      </div>

      {/* Semantic Color Tokens */}
      <div>
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
          Semantic Surface & Feedback Tokens
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border border-[var(--line)]" style={{ background: 'var(--ground)' }}>
            <div className="font-bold">--ground</div>
            <div className="study-muted text-[11px]">Desk Canvas</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--line)]" style={{ background: 'var(--surface)' }}>
            <div className="font-bold">--surface</div>
            <div className="study-muted text-[11px]">Study Card</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--line)]" style={{ background: 'var(--surface-2)' }}>
            <div className="font-bold">--surface-2</div>
            <div className="study-muted text-[11px]">Inset Subcard</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--line)]" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <div className="font-bold">--accent</div>
            <div className="text-[11px]">Primary Brand</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--good)]" style={{ background: 'var(--good-soft)', color: 'var(--good)' }}>
            <div className="font-bold">--good</div>
            <div className="text-[11px]">Correct Mastery</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--heat)]" style={{ background: 'var(--heat-soft)', color: 'var(--heat)' }}>
            <div className="font-bold">--heat</div>
            <div className="text-[11px]">Incorrect Error</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--storm)]" style={{ background: 'var(--storm-soft)', color: 'var(--storm)' }}>
            <div className="font-bold">--storm</div>
            <div className="text-[11px]">Supported Practice</div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--line)]" style={{ background: 'var(--surface)' }}>
            <div className="font-bold">--line-strong</div>
            <div className="study-muted text-[11px]">Focus Borders</div>
          </div>
        </div>
      </div>

      {/* Typography Hierarchy */}
      <div className="space-y-3">
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Typography System Roles
        </h3>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-3">
          <div>
            <span className="text-[11px] font-mono text-[var(--ink-3)] block mb-1">PROSE SANS (Inter)</span>
            <p className="text-sm m-0">Clear, distraction-free reading typography for instructions, worked explanations, and rulebook concepts.</p>
          </div>
          <div>
            <span className="text-[11px] font-mono text-[var(--ink-3)] block mb-1">NUMERIC FIELDS & MONO (JetBrains Mono)</span>
            <span className="font-mono text-sm tracking-wider font-semibold block">
              1/4 + 1/6 = 5/12 · Score: 92% · Time: 03:45 · Attempt: #2
            </span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-[var(--ink-3)] block mb-1">MATHEMATICAL TYPESETTING (KaTeX)</span>
            <MathBlock math="\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}" />
          </div>
        </div>
      </div>

      {/* Button & Input States */}
      <div>
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
          Button, Input & Control States
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <button className="study-button">Primary Action</button>
          <button className="study-button secondary">Secondary Action</button>
          <button className="study-button" disabled>Disabled State</button>
          <input
            className="study-answer"
            style={{ maxWidth: 200 }}
            placeholder="Type answer..."
            defaultValue="3/4"
            readOnly
          />
        </div>
      </div>

      {/* Feedback Badges & Comparison Card */}
      <div>
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
          Feedback Badges & Side-by-Side Comparison
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="study-badge incorrect">✗ Incorrect</span>
          <span className="study-badge correct">✓ Correct</span>
          <span className="study-badge supported">✓ Correct after hint</span>
          <span className="study-badge skipped">— Skipped</span>
          <span className="study-badge legacy">Legacy Record</span>
        </div>

        <div className="answer-comparison-box">
          <div className="comparison-col your-answer is-incorrect">
            <span className="comparison-label">Your answer (Incorrect)</span>
            <span className="comparison-value">2/10</span>
            <span className="comparison-subtext">First attempt: 2/10</span>
          </div>
          <div className="comparison-col expected-answer">
            <span className="comparison-label">Expected answer</span>
            <span className="comparison-value">5/12</span>
            <span className="comparison-subtext">Common denominator 12</span>
          </div>
        </div>
      </div>

      {/* Loading & Skeleton State */}
      <div>
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
          Loading Skeleton State
        </h3>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-2.5 max-w-md">
          <div className="skeleton-bar" style={{ width: '40%' }} />
          <div className="skeleton-bar" style={{ width: '85%' }} />
          <div className="skeleton-bar" style={{ width: '65%' }} />
        </div>
      </div>
    </div>
  );
}
