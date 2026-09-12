'use client';

import { useState } from 'react';

type Student = {
  id: number;
  name: string;
  level: string;
  lastActivity: string;
  summary: string;
  activity: { time: string; title: string; detail: string }[];
};

const students: Student[] = [
  {
    id: 1,
    name: 'Priya Nair',
    level: 'A-Level',
    lastActivity: 'Chain rule worksheet — today',
    summary: 'Calculus, weakest on chain rule',
    activity: [
      { time: 'Today', title: 'Uploaded chain rule practice', detail: 'AI marked 12/20 — sign error in the inner derivative, flagged for review.' },
      { time: 'Today', title: 'Asked the AI tutor a question', detail: 'Differentiation by first principles — worked through to the power rule.' },
      { time: 'Fri', title: 'Sine & cosine rule worksheet', detail: "Scored 12/20. Reviewed together in Friday's session." },
    ],
  },
  {
    id: 2,
    name: 'Jayden Osei',
    level: 'GCSE',
    lastActivity: 'Algebra practice — yesterday',
    summary: 'On track for a grade 8',
    activity: [
      { time: 'Yesterday', title: 'Factorising quadratics worksheet', detail: 'Scored 19/20. Ready to move on to completing the square.' },
      { time: '3 days ago', title: 'Asked the AI tutor a question', detail: 'Clarified the difference between factorising and expanding.' },
    ],
  },
  {
    id: 3,
    name: 'Sofia Marchetti',
    level: 'A-Level',
    lastActivity: 'No activity in 6 days',
    summary: "Hasn't logged in since last Tuesday",
    activity: [
      { time: 'Last week', title: 'Vectors worksheet', detail: 'Scored 14/20. Improved from the previous attempt at 9/20.' },
    ],
  },
  {
    id: 4,
    name: 'Marcus Webb',
    level: 'GCSE',
    lastActivity: 'Probability trees — last week',
    summary: 'Statistics, strong performer',
    activity: [
      { time: 'Last week', title: 'Probability trees worksheet', detail: 'Scored 18/20 — small error reading a tree diagram branch.' },
    ],
  },
];

export default function TutorPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const [note, setNote] = useState('');
  const selected = students.find((s) => s.id === selectedId)!;

  return (
    <>
      <aside style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--color-divider)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Your students</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{students.length} assigned</div>
        </div>
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            className={'stu-row ' + (s.id === selectedId ? 'stu-row-active' : '')}
            onClick={() => setSelectedId(s.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{s.level}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.lastActivity}</div>
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26 }}>{selected.name}</h1>
            <p style={{ fontSize: 14, margin: '6px 0 0', opacity: 0.78 }}>{selected.level} · {selected.summary}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setAssignOpen(true)}>Assign homework</button>
        </div>

        <span className="kicker">Recent activity</span>
        <div style={{ border: '1px solid var(--color-divider)', padding: '4px 20px', marginBottom: 32 }}>
          {selected.activity.map((a, i) => (
            <div key={i} className="activity-row">
              <div style={{ fontSize: 12, opacity: 0.6, whiteSpace: 'nowrap', width: 70, flexShrink: 0 }}>{a.time}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: '4px 0 0', opacity: 0.78 }}>{a.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <span className="kicker">Note to {selected.name}</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" style={{ flex: 1 }} placeholder="Leave a comment on their latest work..." value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={() => setNote('')}>Send</button>
        </div>
      </main>

      {assignOpen && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <div className="dialog-title">Assign homework to {selected.name}</div>
            <div className="dialog-body">
              <div className="field" style={{ marginBottom: 14 }}>
                <label htmlFor="hw-topic">Topic</label>
                <select className="input" id="hw-topic">
                  <option>Calculus — chain rule</option>
                  <option>Algebra — factorising</option>
                  <option>Trigonometry — identities</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="hw-notes">Instructions</label>
                <textarea className="input" id="hw-notes" rows={3} defaultValue="Complete the worksheet and upload a photo of your working for AI marking before Friday." />
              </div>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setAssignOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => setAssignOpen(false)}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
