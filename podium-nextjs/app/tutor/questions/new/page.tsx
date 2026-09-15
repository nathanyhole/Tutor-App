'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Skill = { id: string; name: string };
type Existing = { id: string; question_text: string; skill_name: string; status: string; difficulty: number };

export default function NewDiagnosticQuestionPage() {
  const supabase = createClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillId, setSkillId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [markScheme, setMarkScheme] = useState('');
  const [misconceptions, setMisconceptions] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [marks, setMarks] = useState(2);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<Existing[]>([]);

  async function loadExisting() {
    const { data } = await supabase
      .from('skill_questions')
      .select('id, question_text, status, difficulty, skills(name)')
      .order('created_at', { ascending: false })
      .limit(20);
    setExisting((data ?? []).map((r: any) => ({
      id: r.id, question_text: r.question_text, status: r.status, difficulty: r.difficulty,
      skill_name: r.skills?.name ?? '—',
    })));
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('skills').select('id, name').order('sort_order');
      setSkills(data ?? []);
      if (data?.[0]) setSkillId(data[0].id);
      loadExisting();
    })();
  }, []);

  async function save() {
    if (!skillId || !questionText.trim() || !markScheme.trim()) {
      setError('Skill, question text and mark scheme are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('skill_questions').insert({
      skill_id: skillId,
      question_text: questionText,
      mark_scheme: markScheme,
      common_misconceptions: misconceptions || null,
      difficulty,
      marks,
      status,
      created_by: userData.user?.id,
    });
    if (error) {
      setError(error.message);
    } else {
      setQuestionText(''); setMarkScheme(''); setMisconceptions('');
      loadExisting();
    }
    setSaving(false);
  }

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 760 }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Add a diagnostic question</h1>
      <p style={{ fontSize: 14, margin: '0 0 28px', opacity: 0.78 }}>
        Every question is tagged to one skill — this is what drives each student's mastery checklist.
      </p>

      {error && <p style={{ fontSize: 13, color: '#a33' }}>{error}</p>}

      <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginBottom: 28 }}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="skill">Skill</label>
          <select className="input" id="skill" value={skillId} onChange={(e) => setSkillId(e.target.value)}>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="qtext">Question</label>
          <textarea className="input" id="qtext" rows={4} value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Type the question exactly as the student will see it..." />
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="markscheme">Mark scheme</label>
          <textarea className="input" id="markscheme" rows={4} value={markScheme} onChange={(e) => setMarkScheme(e.target.value)} placeholder="Full worked solution and marking points." />
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="misconceptions">Common misconceptions (optional)</label>
          <textarea className="input" id="misconceptions" rows={2} value={misconceptions} onChange={(e) => setMisconceptions(e.target.value)} placeholder="What tends to go wrong on this question?" />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="difficulty">Difficulty (1-5)</label>
            <select className="input" id="difficulty" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="marks">Marks</label>
            <input className="input" id="marks" type="number" min={1} value={marks} onChange={(e) => setMarks(Number(e.target.value))} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="status">Status</label>
            <select className="input" id="status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <button type="button" className="btn btn-primary" style={{ marginTop: 20 }} disabled={saving} onClick={save}>
          {saving ? 'Saving...' : 'Save question'}
        </button>
      </div>

      <span className="kicker">Recently added</span>
      <table className="table">
        <thead><tr><th>Question</th><th>Skill</th><th>Difficulty</th><th>Status</th></tr></thead>
        <tbody>
          {existing.map((q) => (
            <tr key={q.id}>
              <td style={{ maxWidth: 320 }}>{q.question_text.slice(0, 80)}{q.question_text.length > 80 ? '…' : ''}</td>
              <td>{q.skill_name}</td>
              <td>{q.difficulty}</td>
              <td><span className={'tag ' + (q.status === 'published' ? 'tag-accent' : 'tag-outline')}>{q.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}