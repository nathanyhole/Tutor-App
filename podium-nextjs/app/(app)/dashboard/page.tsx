'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Blueprint from '@/components/Blueprint';
import { IconTarget } from '@/components/icons';
import { createClient } from '@/lib/supabase/client';

type SkillRow = { id: string; name: string; p_mastery: number; attempts_count: number; prerequisite_skill_id: string | null };

const chats = [
  { topic: 'Differentiation by first principles', preview: 'Why does the limit definition give the power rule?', time: 'Today' },
  { topic: 'Simultaneous equations', preview: 'Checked my substitution method on Q4', time: 'Yesterday' },
  { topic: 'Trig identities', preview: 'Asked for a proof of the double angle formula', time: '2 days ago' },
];

const homework = [
  { title: 'Quadratics worksheet 3', topic: 'Algebra', score: '17/20', tag: 'tag-accent', date: 'Mon' },
  { title: 'Sine & cosine rule', topic: 'Trigonometry', score: '12/20', tag: 'tag-neutral', date: 'Fri' },
  { title: 'Chain rule practice', topic: 'Calculus', score: '9/20', tag: 'tag-outline', date: 'Last week' },
];

export default function DashboardPage() {
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
        .select('id, name, sort_order, prerequisite_skill_id')
        .eq('topic_id', topic.id)
        .order('sort_order');
      const { data: masteryRows } = await supabase
        .from('skill_mastery')
        .select('skill_id, p_mastery, attempts_count')
        .eq('student_id', userData.user?.id);
      const masteryMap = new Map((masteryRows ?? []).map((m) => [m.skill_id, m]));
      setSkills((skillRows ?? []).map((s) => ({
        id: s.id, name: s.name,
        prerequisite_skill_id: s.prerequisite_skill_id,
        p_mastery: masteryMap.get(s.id)?.p_mastery ?? 0.3,
        attempts_count: masteryMap.get(s.id)?.attempts_count ?? 0,
      })));
      setLoading(false);
    })();
  }, []);

  const unlocked = skills.filter((s) => {
    if (!s.prerequisite_skill_id) return true;
    const prereq = skills.find((p) => p.id === s.prerequisite_skill_id);
    return !prereq || prereq.p_mastery >= 0.5;
  });
  const weakest = [...unlocked].sort((a, b) => a.p_mastery - b.p_mastery).slice(0, 3);

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Welcome back</h1>
          <p style={{ fontSize: 14, margin: '6px 0 0', opacity: 0.78 }}>Skill mastery is tracked per examinable skill, not per topic.</p>
        </div>
        <Link href="/chat">
          <Blueprint className="btn btn-primary">Ask the AI tutor</Blueprint>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="kicker">Integration — skill mastery</span>
            <Link href="/skills" style={{ fontSize: 13 }}>View full checklist &rarr;</Link>
          </div>
          {loading ? (
            <p style={{ fontSize: 14, opacity: 0.7 }}>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 40 }}>
              {skills.map((s) => (
                <Link key={s.id} href={`/skills/practice?skill=${s.id}`} className="topic-card">
                  <Blueprint style={{ padding: 20 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-heading-weight)' as any, textTransform: 'uppercase', fontSize: 15, marginBottom: 14 }}>
                      {s.name}
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(s.p_mastery * 100)}%` }} /></div>
                    <div style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>{Math.round(s.p_mastery * 100)}% mastery{s.attempts_count === 0 ? ' · not started' : ''}</div>
                  </Blueprint>
                </Link>
              ))}
            </div>
          )}

          <span className="kicker">Recent AI chat sessions</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--color-divider)', marginBottom: 40 }}>
            {chats.map((c) => (
              <Link key={c.topic} href="/chat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', textDecoration: 'none', color: 'var(--color-text)', borderBottom: '1px solid var(--color-divider)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.topic}</div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{c.preview}</div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, whiteSpace: 'nowrap', marginLeft: 16 }}>{c.time}</div>
              </Link>
            ))}
          </div>

          <span className="kicker">Marked homework</span>
          <table className="table">
            <thead><tr><th>Worksheet</th><th>Topic</th><th>Score</th><th>Marked</th></tr></thead>
            <tbody>
              {homework.map((h) => (
                <tr key={h.title}>
                  <td>{h.title}</td>
                  <td>{h.topic}</td>
                  <td><span className={'tag ' + h.tag}>{h.score}</span></td>
                  <td className="text-muted">{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <span className="kicker">Recommended focus</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weakest.length === 0 && !loading && (
              <p style={{ fontSize: 13, opacity: 0.7 }}>No skill data yet — practice a skill to see recommendations here.</p>
            )}
            {weakest.map((s) => (
              <Link key={s.id} href={`/skills/practice?skill=${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid var(--color-divider)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <IconTarget style={{ color: 'var(--color-accent-700)' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, opacity: 0.78 }}>
                    {s.attempts_count === 0 ? 'Not attempted yet — start here.' : `Currently ${Math.round(s.p_mastery * 100)}% mastery.`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}