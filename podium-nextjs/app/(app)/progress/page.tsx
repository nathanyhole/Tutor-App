'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SkillRow = { id: string; name: string; p_mastery: number; attempts_count: number };

const history = [
  { title: 'Chain rule practice', topic: 'Calculus', score: '12/20', tag: 'tag-neutral', note: 'Sign error on the inner derivative — see AI marking', date: 'Today' },
  { title: 'Sine & cosine rule', topic: 'Trigonometry', score: '12/20', tag: 'tag-neutral', note: 'Reviewed with Mr. Hale in session', date: 'Fri' },
  { title: 'Quadratics worksheet 3', topic: 'Algebra', score: '17/20', tag: 'tag-accent', note: '—', date: 'Mon' },
  { title: 'Vectors — resultant force', topic: 'Mechanics', score: '14/20', tag: 'tag-outline', note: 'Good improvement from last attempt', date: 'Last week' },
  { title: 'Probability trees', topic: 'Statistics', score: '18/20', tag: 'tag-accent', note: '—', date: 'Last week' },
];

export default function ProgressPage() {
  const supabase = createClient();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: topic } = await supabase.from('topics').select('id').eq('name', 'Integration').maybeSingle();
      if (!topic) { setLoading(false); return; }
      const { data: skillRows } = await supabase
        .from('skills')
        .select('id, name, sort_order')
        .eq('topic_id', topic.id)
        .order('sort_order');
      const { data: masteryRows } = await supabase
        .from('skill_mastery')
        .select('skill_id, p_mastery, attempts_count')
        .eq('student_id', userData.user?.id);
      const masteryMap = new Map((masteryRows ?? []).map((m) => [m.skill_id, m]));
      setSkills((skillRows ?? []).map((s) => ({
        id: s.id, name: s.name,
        p_mastery: masteryMap.get(s.id)?.p_mastery ?? 0.3,
        attempts_count: masteryMap.get(s.id)?.attempts_count ?? 0,
      })));
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 1200 }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Progress</h1>
      <p style={{ fontSize: 14, margin: '0 0 32px', opacity: 0.78 }}>
        Mastery per examinable skill and how your marked homework scores have moved.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
        <div style={{ border: '1px solid var(--color-divider)', padding: 24 }}>
          <span className="kicker">Skill mastery — Integration</span>
          {loading ? (
            <p style={{ fontSize: 14, opacity: 0.7 }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {skills.map((s) => (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span>{s.name}</span>
                    <span style={{ opacity: 0.7 }}>{s.attempts_count === 0 ? 'Not started' : `${Math.round(s.p_mastery * 100)}%`}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(s.p_mastery * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ border: '1px solid var(--color-divider)', padding: 24 }}>
          <span className="kicker">Homework score trend</span>
          <svg viewBox="0 0 320 160" style={{ width: '100%', height: 160, overflow: 'visible' }}>
            <line x1="0" y1="40" x2="320" y2="40" stroke="var(--color-divider)" strokeWidth="1" />
            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--color-divider)" strokeWidth="1" />
            <line x1="0" y1="140" x2="320" y2="140" stroke="var(--color-divider)" strokeWidth="1" />
            <polyline points="10,120 65,95 120,100 175,70 230,55 285,35" fill="none" stroke="var(--color-accent-500)" strokeWidth="2" />
            {[[10, 120], [65, 95], [120, 100], [175, 70], [230, 55], [285, 35]].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="3" fill="var(--color-accent-700)" />
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            <span>6 weeks ago</span><span>This week</span>
          </div>
        </div>
      </div>

      <span className="kicker">Marked homework history</span>
      <table className="table">
        <thead><tr><th>Worksheet</th><th>Topic</th><th>Score</th><th>Tutor note</th><th>Date</th></tr></thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.title}>
              <td>{h.title}</td>
              <td>{h.topic}</td>
              <td><span className={'tag ' + h.tag}>{h.score}</span></td>
              <td className="text-muted">{h.note}</td>
              <td className="text-muted">{h.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}