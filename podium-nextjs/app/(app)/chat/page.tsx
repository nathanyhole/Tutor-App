'use client';

import { useState } from 'react';
import Blueprint from '@/components/Blueprint';
import { IconPaperclip, IconSend } from '@/components/icons';

type Message = { from: 'user' | 'ai'; text: string };

const sessions = [
  { topic: 'Differentiation by first principles', time: 'Active now', active: true },
  { topic: 'Simultaneous equations', time: 'Yesterday', active: false },
  { topic: 'Trig identities', time: '2 days ago', active: false },
  { topic: 'Vectors — resultant force', time: 'Last week', active: false },
  { topic: 'Probability trees', time: 'Last week', active: false },
];

const initialMessages: Message[] = [
  { from: 'ai', text: "Let's work through differentiation by first principles. What's the definition you've been given?" },
  { from: 'user', text: "f'(x) = lim as h→0 of [f(x+h) - f(x)] / h. I don't get why that gives the power rule though." },
  { from: 'ai', text: 'Good, that\u2019s the right definition. Try it with f(x) = x\u00b2. Expand f(x+h) first — what do you get?' },
  { from: 'user', text: '(x+h)\u00b2 = x\u00b2 + 2xh + h\u00b2' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setMessages((prev) => [
      ...prev,
      { from: 'user', text },
      { from: 'ai', text: 'Good — so the h\u00b2 term is the key. Divide the whole expansion by h before you take the limit, and see which term survives as h\u21920.' },
    ]);
  }

  return (
    <>
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--color-divider)', padding: '24px 0' }}>
        <div style={{ padding: '0 16px 16px' }}>
          <button type="button" className="btn btn-secondary btn-block">
            <Blueprint style={{ display: 'block', textAlign: 'center', padding: '6px 0' }}>New chat</Blueprint>
          </button>
        </div>
        {sessions.map((s) => (
          <button key={s.topic} type="button" className={'sess ' + (s.active ? 'sess-active' : '')}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.topic}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.time}</div>
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ fontSize: 18, textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Differentiation by first principles</div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>Calculus · A-Level</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'bubble-user' : 'bubble-ai'}>
              <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--color-divider)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="icon-btn" aria-label="Attach a photo" title="Attach a photo of your working">
            <IconPaperclip />
          </button>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ask a question, or describe where you're stuck..."
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
      </main>
    </>
  );
}
