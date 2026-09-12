'use client';

import { useState } from 'react';
import Blueprint from '@/components/Blueprint';
import { IconCheck, IconX } from '@/components/icons';

type Status = 'idle' | 'marking' | 'marked';

const markedSteps = [
  { ok: true, title: 'Step 1 — identify outer and inner functions', note: 'Correctly split f(x) = (3x + 1)^4 into outer u^4 and inner u = 3x + 1.' },
  { ok: true, title: 'Step 2 — differentiate the outer function', note: '4u^3 is correct.' },
  { ok: false, title: 'Step 3 — differentiate the inner function', note: "You wrote d/dx(3x + 1) = 3x. It's just 3 — the derivative of a constant is 0. This is where the mark was lost." },
  { ok: false, title: 'Step 4 — combine and simplify', note: 'Follows from Step 3, so it carries the same error through. Method after this point is otherwise sound.' },
];

export default function HomeworkPage() {
  const [status, setStatus] = useState<Status>('idle');

  function mark() {
    setStatus('marking');
    setTimeout(() => setStatus('marked'), 1200);
  }

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 1200 }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Homework</h1>
      <p style={{ fontSize: 14, margin: '0 0 32px', opacity: 0.78 }}>
        Upload a photo of your working. The AI marks it and shows you exactly where it went wrong.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <Blueprint style={{ aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', textAlign: 'center', padding: 24 }}>
            <span style={{ fontSize: 13, opacity: 0.6 }}>Drop or click to upload a photo of your working</span>
          </Blueprint>

          <div className="field" style={{ marginTop: 20 }}>
            <label htmlFor="topic">Topic</label>
            <select className="input" id="topic">
              <option>Calculus — chain rule</option>
              <option>Algebra</option>
              <option>Trigonometry</option>
            </select>
          </div>

          {status === 'idle' && (
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={mark}>
              <Blueprint style={{ width: '100%', textAlign: 'center', padding: '6px 0' }}>Mark my work</Blueprint>
            </button>
          )}
          {status === 'marking' && (
            <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 20 }} disabled>
              Marking...
            </button>
          )}
          {status === 'marked' && (
            <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={() => setStatus('idle')}>
              Upload another
            </button>
          )}
        </div>

        <div>
          {status === 'idle' && (
            <div style={{ border: '1px solid var(--color-divider)', padding: 24, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <p style={{ fontSize: 14, opacity: 0.7, maxWidth: '32ch', margin: 0 }}>
                Marking results will appear here once you upload a photo and click &quot;Mark my work&quot;.
              </p>
            </div>
          )}
          {status === 'marking' && (
            <div style={{ border: '1px solid var(--color-divider)', padding: 24, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>Reading your working, step by step...</p>
            </div>
          )}
          {status === 'marked' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <span className="kicker">Result</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 26 }}>12 / 20</span>
              </div>
              <div style={{ border: '1px solid var(--color-divider)', padding: '4px 20px' }}>
                {markedSteps.map((s) => (
                  <div key={s.title} className="step-row">
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {s.ok ? <IconCheck style={{ color: 'var(--color-accent-700)' }} /> : <IconX />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                      <p style={{ fontSize: 13, lineHeight: 1.5, margin: '4px 0 0', opacity: 0.78 }}>{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
