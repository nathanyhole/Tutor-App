'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const TOPICS = ['Calculus', 'Algebra', 'Trigonometry', 'Statistics', 'Mechanics'];

export default function NewLessonPage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [topicName, setTopicName] = useState(TOPICS[0]);
  const [level, setLevel] = useState('A-Level');
  const [notes, setNotes] = useState('');
  const [formula, setFormula] = useState('');
  const [steps, setSteps] = useState<string[]>(['', '']);
  const [questions, setQuestions] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  async function resolveTopicId(name: string) {
    const { data: existing } = await supabase.from('topics').select('id').eq('name', name).maybeSingle();
    if (existing) return existing.id;
    const { data: created, error } = await supabase.from('topics').insert({ name, subject: 'Maths' }).select('id').single();
    if (error) throw error;
    return created.id;
  }

  async function save(status: 'draft' | 'in_review') {
    setSaving(true);
    setError(null);
    try {
      const topic_id = await resolveTopicId(topicName);
      const { data: userData } = await supabase.auth.getUser();

      let video_path: string | null = null;
      if (videoFile) {
        const path = `${userData.user?.id}/${Date.now()}-${videoFile.name}`;
        const { error: uploadError } = await supabase.storage.from('lesson-videos').upload(path, videoFile);
        if (uploadError) throw uploadError;
        video_path = path;
      }

      const { error } = await supabase.from('lessons').insert({
        topic_id,
        level,
        title: title || 'Untitled lesson',
        revision_notes: notes,
        key_formula: formula,
        video_path,
        worked_example: steps.filter((s) => s.trim()).map((text, i) => ({ step: i + 1, text })),
        practice_questions: questions.filter((q) => q.question.trim()),
        status,
        created_by: userData.user?.id,
      });
      if (error) throw error;
      router.push('/tutor/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  const previewSteps = steps.filter((s) => s.trim());

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <a href="/tutor/courses" style={{ fontSize: 13 }}>&larr; Back to courses</a>
          <h1 style={{ fontSize: 26, margin: '8px 0 0' }}>New lesson</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setPreviewOpen(true)}>Preview as student</button>
          <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => save('draft')}>Save draft</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={() => save('in_review')}>Submit for review</button>
        </div>
      </div>

      {error && <p style={{ fontSize: 13, color: '#a33' }}>{error}</p>}

      <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginBottom: 24 }}>
        <span className="kicker">Lesson details</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label htmlFor="title">Lesson title</label>
            <input className="input" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The chain rule" />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="topic">Topic</label>
              <select className="input" id="topic" value={topicName} onChange={(e) => setTopicName(e.target.value)}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="level">Exam level</label>
              <select className="input" id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>A-Level</option>
                <option>GCSE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginBottom: 24 }}>
        <span className="kicker">Video guide</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setVideoFile(file);
            setVideoPreviewUrl(file ? URL.createObjectURL(file) : null);
          }}
        />
        {videoPreviewUrl && (
          <video src={videoPreviewUrl} controls style={{ width: '100%', marginTop: 12, aspectRatio: '16/9' }} />
        )}
      </div>

      <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginBottom: 24 }}>
        <span className="kicker">Revision notes</span>
        <textarea className="input" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explain the concept in plain language." />
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="formula">Key formula (optional)</label>
          <input className="input" id="formula" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="e.g. dy/dx = dy/du × du/dx" />
        </div>
      </div>

      <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span className="kicker" style={{ margin: 0 }}>Worked example</span>
          <button type="button" className="btn btn-ghost" onClick={() => setSteps([...steps, ''])}>+ Add step</button>
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, width: 22, marginTop: 8 }}>{i + 1}</div>
            <input className="input" style={{ flex: 1 }} value={s} onChange={(e) => setSteps(steps.map((st, idx) => idx === i ? e.target.value : st))} placeholder="Describe this step..." />
            <button type="button" className="icon-btn" style={{ border: 'none' }} onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}>×</button>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span className="kicker" style={{ margin: 0 }}>Practice questions</span>
          <button type="button" className="btn btn-ghost" onClick={() => setQuestions([...questions, { question: '', answer: '' }])}>+ Add question</button>
        </div>
        {questions.map((q, i) => (
          <div key={i} style={{ border: '1px solid var(--color-divider)', padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Question {i + 1}</span>
              <button type="button" className="icon-btn" style={{ border: 'none' }} onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" placeholder="Question text" value={q.question} onChange={(e) => setQuestions(questions.map((qq, idx) => idx === i ? { ...qq, question: e.target.value } : qq))} />
              <input className="input" placeholder="Correct answer" value={q.answer} onChange={(e) => setQuestions(questions.map((qq, idx) => idx === i ? { ...qq, answer: e.target.value } : qq))} />
            </div>
          </div>
        ))}
      </div>

      {previewOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)', zIndex: 60, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px clamp(20px,4vw,56px)', borderBottom: '1px solid var(--color-divider)', position: 'sticky', top: 0, background: 'var(--color-bg)' }}>
            <span className="kicker" style={{ margin: 0 }}>Previewing as a student</span>
            <button type="button" className="btn btn-ghost" onClick={() => setPreviewOpen(false)}>Close preview</button>
          </div>
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px clamp(20px,4vw,56px)' }}>
            <span className="kicker">{topicName} · {level}</span>
            <h1 style={{ fontSize: 30, marginBottom: 24 }}>{title.trim() || 'Untitled lesson'}</h1>

            {videoPreviewUrl ? (
              <video src={videoPreviewUrl} controls style={{ width: '100%', aspectRatio: '16/9', marginBottom: 32, border: '1px solid var(--color-divider)' }} />
            ) : (
              <div style={{ aspectRatio: '16/9', border: '1px solid var(--color-divider)', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
                <span style={{ fontSize: 13, opacity: 0.6 }}>No video uploaded yet</span>
              </div>
            )}

            <span className="kicker">Revision notes</span>
            <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '0 0 20px', maxWidth: '68ch' }}>{notes.trim() || 'No revision notes added yet.'}</p>
            {formula.trim() && <div className="formula-box" style={{ marginBottom: 24 }}>{formula}</div>}

            <span className="kicker">Worked example</span>
            <div style={{ border: '1px solid var(--color-divider)', padding: '4px 20px', marginBottom: 32 }}>
              {(previewSteps.length ? previewSteps : ['No worked example steps added yet.']).map((s, i) => (
                <div key={i} className="worked-step">
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, width: 20 }}>{i + 1}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>{s}</div>
                </div>
              ))}
            </div>

            <span className="kicker">Practice questions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions.filter((q) => q.question.trim()).length === 0 && (
                <p style={{ fontSize: 14, opacity: 0.7 }}>No practice questions added yet.</p>
              )}
              {questions.filter((q) => q.question.trim()).map((q, i) => (
                <div key={i} style={{ border: '1px solid var(--color-divider)', padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Q{i + 1}. {q.question}</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>Answer: {q.answer || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}