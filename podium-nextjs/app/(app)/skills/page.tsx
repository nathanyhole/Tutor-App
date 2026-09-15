'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Skill = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  prerequisite_skill_id: string | null;
  p_mastery: number;
  attempts_count: number;
};

function tierFor(s: Skill) {
  if (s.attempts_count === 0) return { label: 'Not started', dot: '#9aa0a6' };
  if (s.p_mastery >= 0.75) return { label: 'Strong', dot: 'var(--color-accent-700)' };
  if (s.p_mastery >= 0.4) return { label: 'Developing', dot: '#c98a1f' };
  return { label: 'Weak', dot: '#b3423d' };
}

export default function SkillsPage() {
  const supabase = createClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: topic } = await supabase.from('topics').select('id').eq('name', 'Integration').maybeSingle();
      if (!topic) { setLoading(false); return; }

      const { data: skillRows } = await supabase
        .from('skills')
        .select('id, name, description, sort_order, prerequisite_skill_id')
        .eq('topic_id', topic.id)
        .order('sort_order');

      const { data: masteryRows } = await supabase
        .from('skill_mastery')
        .select('skill_id, p_mastery, attempts_count')
        .eq('student_id', userData.user?.id);

      const masteryMap = new Map((masteryRows ?? []).map((m) => [m.skill_id, m]));
      const merged = (skillRows ?? []).map((s) => ({
        ...s,
        p_mastery: masteryMap.get(s.id)?.p_mastery ?? 0.3,
        attempts_count: masteryMap.get(s.id)?.attempts_count ?? 0,
      }));
      setSkills(merged);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)' }}>Loading...</main>;
  }

  const unlocked = skills.filter((s) => {
    if (!s.prerequisite_skill_id) return true;
    const prereq = skills.find((p) => p.id === s.prerequisite_skill_id);
    return !prereq || prereq.p_mastery >= 0.5;
  });
  const recommended = [...unlocked].sort((a, b) => a.p_mastery - b.p_mastery)[0];

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 820 }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Integration — skill checklist</h1>
      <p style={{ fontSize: 14, margin: '0 0 32px', opacity: 0.78 }}>
        Mastery tracked per skill, not per topic — so revision targets exactly what's costing you marks.
      </p>

      {recommended && (
        <div style={{ border: '1px solid var(--color-accent-700)', padding: 20, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <span className="kicker" style={{ margin: 0 }}>What to revise today</span>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 6 }}>{recommended.name}</div>
          </div>
          <Link href={`/skills/practice?skill=${recommended.id}`} className="btn btn-primary">Practice this skill</Link>
        </div>
      )}

      <span className="kicker">All skills</span>
      <div style={{ border: '1px solid var(--color-divider)', padding: '4px 20px' }}>
        {skills.map((s) => {
          const tier = tierFor(s);
          const locked = s.prerequisite_skill_id && !unlocked.some((u) => u.id === s.id);
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: tier.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, opacity: locked ? 0.45 : 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                {s.description && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.description}</div>}
              </div>
              <span style={{ fontSize: 12, opacity: 0.7, width: 90, textAlign: 'right' }}>{tier.label}</span>
              {locked ? (
                <span style={{ fontSize: 12, opacity: 0.5, width: 110, textAlign: 'right' }}>Locked</span>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/lesson?skill=${s.id}`} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>Lesson</Link>
                  <Link href={`/skills/practice?skill=${s.id}`} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>Practice</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}