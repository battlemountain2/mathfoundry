import React, { useState } from 'react';
import { getCuratedVideo } from '../../data/courses/curatedVideos';

export default function VideoDrawer({ unitId }) {
  const [isOpen, setIsOpen] = useState(false);
  const video = getCuratedVideo(unitId);

  if (!video) return null;

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="study-button inline-flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-[var(--line-strong)] text-xs font-semibold transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)' }}
          title="Open side-by-side video lecture"
        >
          <span className="text-sm">📺</span>
          <span>{isOpen ? 'Close Video' : 'Watch Video'}</span>
          <span className="font-mono text-[10px] text-[var(--accent)] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-soft)]">
            {video.creator}
          </span>
        </button>
      </div>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl flex flex-col animate-slide-in">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📺</span>
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent)] block">
                  {video.creator} · {video.duration}
                </span>
                <h3 className="text-sm font-bold text-[var(--ink)] m-0 leading-tight">
                  {video.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-xs font-bold text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
              aria-label="Close video drawer"
            >
              ✕
            </button>
          </div>

          {/* Video Iframe */}
          <div className="relative aspect-video w-full bg-black shrink-0">
            <iframe
              src={`https://www.youtube.com/embed/${video.embedId}?rel=0`}
              title={video.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Key Takeaways */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-3)] font-bold block mb-2">
                Core Takeaways
              </span>
              <ul className="space-y-2 text-xs text-[var(--ink-2)]">
                {video.takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--good)] font-bold">✓</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink-3)]">
              <span>
                💡 <strong>Tip:</strong> Keep this video open side-by-side while working through practice problems on paper.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
