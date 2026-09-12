import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const STATUS_TAG: Record<string, string> = {
  draft: 'tag tag-neutral',
  in_review: 'tag tag-outline',
  published: 'tag tag-accent',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In review',
  published: 'Published',
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, status, updated_at, topics(name)')
    .order('updated_at', { ascending: false });

  const groups = new Map<string, typeof lessons>();
  for (const l of lessons ?? []) {
    const topicName = (l as any).topics?.name ?? 'Uncategorised';
    if (!groups.has(topicName)) groups.set(topicName, []);
    groups.get(topicName)!.push(l);
  }

  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Courses</h1>
          <p style={{ fontSize: 14, margin: '6px 0 0', opacity: 0.78 }}>A-Level &amp; GCSE Maths · all lessons across topics</p>
        </div>
        <Link href="/tutor/courses/new">
          <button type="button" className="btn btn-primary">New lesson</button>
        </Link>
      </div>

      {groups.size === 0 && (
        <p style={{ fontSize: 14, opacity: 0.7 }}>No lessons yet. Create your first one.</p>
      )}

      {[...groups.entries()].map(([topic, topicLessons]) => (
        <div key={topic} style={{ border: '1px solid var(--color-divider)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-surface)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: 16 }}>{topic}</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>{topicLessons!.length} lessons</span>
          </div>
          {topicLessons!.map((l) => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--color-divider)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{l.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                  Edited {new Date(l.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={STATUS_TAG[l.status] ?? 'tag tag-neutral'}>{STATUS_LABEL[l.status] ?? l.status}</span>
                <Link href={`/tutor/courses/${l.id}`}>
                  <button type="button" className="btn btn-ghost">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
