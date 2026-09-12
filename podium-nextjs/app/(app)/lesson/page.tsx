'use client';

import { useState } from 'react';
import Link from 'next/link';
import Blueprint from '@/components/Blueprint';
import { IconSend } from '@/components/icons';

type Message = { from: 'user' | 'ai'; text: string };

const initialMessages: Message[] = [
  { from: 'ai', text: 'This lesson covers the chain rule. Ask me anything about the video or the worked example.' },
  { from: 'user', text: 'Why do we multiply dy/du by du/dx instead of adding them?' },
  { from: 'ai', text: 'Think of u as a middle step: a small change in x causes a change in u, which causes a change in y. Each derivative is a rate — rates chain together by multiplying, not adding.' },
];

const steps = [
  { n: 1, text: 'Differentiate y = (3x + 1)\u2074. Let u = 3x + 1, so y = u\u2074.' },
  { n: 2, text: 'dy/du = 4u\u00b3, and du/dx = 3.' },
  { n: 3, text: 'Multiply: dy/dx = 4u\u00b3 \u00d7 3 = 12u\u00b3.' },
  { n: 4, text: 'Substitute u back in: dy/dx = 12(3x + 1)\u00b3.' },
];

export default function LessonPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setMessages((prev) => [
      ...prev,
      { from: 'user', text },
      { from: 'ai', text: "Good question — try applying that same idea to y = sin(2x). What's the inner function there?" },
    ]);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', minWidth: 0 }}>
      <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 780 }}>
        <span className="kicker">Calculus · A-Level</span>
        <h1 style={{ fontSize: 30, marginBottom: 24 }}>The chain rule</h1>

        <Blueprint style={{ marginBottom: 32, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
          <span style={{ fontSize: 13, opacity: 0.6 }}>Video guide placeholder</span>
        </Blueprint>

        <span className="kicker">Revision notes</span>
        <p style={{ fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', opacity: 0.85 }}>
          The chain rule differentiates a function made of one function nested inside another. If y
          is a function of u, and u is a function of x, the chain rule links their derivatives
          together.
        </p>
        <div className="formula-box" style={{ marginBottom: 24 }}>dy/dx = dy/du × du/dx</div>
        <p style={{ fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', opacity: 0.85 }}>
          In practice: identify the outer function and the inner function, differentiate each
          separately, then multiply the results together.
        </p>

        <span className="kicker">Worked example</span>
        <div style={{ border: '1px solid var(--color-divider)', padding: '4px 20px', marginBottom: 32 }}>
          {steps.map((s) => (
            <div key={s.n} className="worked-step">
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, width: 20, flexShrink: 0 }}>{s.n}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{s.text}</div>
            </div>
          ))}
        </div>

        <Link href="/homework">
          <Blueprint className="btn btn-primary">Try a practice worksheet</Blueprint>
        </Link>
      </main>

      <aside style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Ask about this lesson</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Context: The chain rule</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'bubble-user' : 'bubble-ai'} style={{ fontSize: 13 }}>
              {m.text}
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-divider)', display: 'flex', gap: 8 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ask a question..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          />
          <button type="button" className="btn btn-primary btn-icon" aria-label="Send" onClick={send}>
            <Blueprint style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <IconSend />
            </Blueprint>
          </button>
        </div>
      </aside>
    </div>
  );
}
