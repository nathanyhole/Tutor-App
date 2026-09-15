'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Question = {
  id: string;
  question_text: string;
  mark_scheme: string;
  difficulty: number;
  marks: number;
};

export default function PracticeSkillPage() {
  const params = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const skillId = params.get('skill');

  const [skillName, setSkillName] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!skillId) return;
    (async () => {
      const { data: skill } = await supabase.from('skills').select('name').eq('id', skillId).maybeSingle();
      setSkillName(skill?.name ?? '');
      const { data: q } = await supabase
        .from('skill_questions')
        .select('id, question_text, mark_scheme, difficulty, marks')
        .eq('skill_id', skillId)
        .eq('status', 'published')
        .limit(1)
        .maybeSingle();
      setQuestion(q ?? null);
      setLoading(false);
    })();
  }, [skillId]);

  async function submit(correct: boolean, usedHint: boolean) {
    if (!question) return;
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase.rpc('record_attempt', {
      p_student_id: userData.user?.id,
      p_question_id: question.id,
      p_correct: correct,
      p_used_hint: usedHint,
    });
    if (error) { setError(error.message); return; }
    setResult(data as number);
  }

  if (!skillId) {
    return <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)' }}>No skill selected. <a href="/skills">Back to checklist</a></main>;
  }
  if (loading) {
    return <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)' }}>Loading...</main>;
  }

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 700 }}>
      <a href="/skills" style={{ fontSize: 13 }}>&larr; Back to checklist</a>
      <span className="kicker" style={{ marginTop: 16 }}>{skillName}</span>

      {error && <p style={{ fontSize: 13, color: '#a33' }}>{error}</p>}

      {!question && (
        <p style={{ fontSize: 14, opacity: 0.75, marginTop: 12 }}>No practice question tagged for this skill yet — ask your tutor to add one.</p>
      )}

      {question && result === null && (
        <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginTop: 12 }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{question.question_text}</p>
          {!revealed ? (
            <button type="button" className="btn btn-secondary" onClick={() => setRevealed(true)}>Show mark scheme</button>
          ) : (
            <div style={{ border: '1px solid var(--color-divider)', padding: 14, marginBottom: 20, fontSize: 13, whiteSpace: 'pre-wrap' }}>{question.mark_scheme}</div>
          )}
          {revealed && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-primary" onClick={() => submit(true, false)}>I got this right</button>
              <button type="button" className="btn btn-secondary" onClick={() => submit(true, true)}>Right, but needed the mark scheme</button>
              <button type="button" className="btn btn-ghost" onClick={() => submit(false, false)}>I got this wrong</button>
            </div>
          )}
        </div>
      )}

      {result !== null && (
        <div style={{ border: '1px solid var(--color-divider)', padding: 24, marginTop: 12 }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Updated mastery for this skill: <strong>{Math.round(result * 100)}%</strong></p>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/skills')}>Back to checklist</button>
        </div>
      )}
    </main>
  );
}