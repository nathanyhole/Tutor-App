'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Blueprint from '@/components/Blueprint';
import { IconSend } from '@/components/icons';
import { createClient } from '@/lib/supabase/client';

type Message = { from: 'user' | 'ai'; text: string };
type Lesson = {
  id: string;
  title: string;
  revision_notes: string | null;
  key_formula: string | null;
  worked_example: { step: number; text: string }[] | null;
  video_path: string | null;
  skill_id: string;
  skills: { name: string } | null;
};
type SkillOption = { id: string; name: string; hasLesson: boolean };

export default function LessonPage() {
  return (
    <Suspense fallback={<main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)' }}>Loading...</main>}>
      <LessonContent />
    </Suspense>
  );
}

function LessonContent() {
  const params = useSearchParams();
  const supabase = createClient();
  const skillParam = params.get('skill');

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    (async () => {
      const { data: publishedLessons } = await supabase
        .from('lessons')
        .select('id, skill_id, skills(name)')
        .eq('status', 'published');
      const lessonSkillIds = new Set((publishedLessons ?? []).map((l: any) => l.skill_id));

      const { data: skills } = await supabase.from('skills').select('id, name').order('sort_order');
      setSkillOptions((skills ?? []).map((s) => ({ id: s.id, name: s.name, hasLesson: lessonSkillIds.has(s.id) })));

      const targetSkillId = skillParam ?? (publishedLessons ?? [])[0]?.skill_id;
      if (!targetSkillId) { setLoading(false); return; }

      const { data: lessonRow } = await supabase
        .from('lessons')
        .select('id, title, revision_notes, key_formula, worked_example, video_path, skill_id, skills(name)')
        .eq('skill_id', targetSkillId)
        .eq('status', 'published')
        .maybeSingle();

      setLesson(lessonRow as any);
      if (lessonRow?.video_path) {
        const { data: pub } = supabase.storage.from('lesson-videos').getPublicUrl(lessonRow.video_path);
        setVideoUrl(pub.publicUrl);
      }
      setMessages([{ from: 'ai', text: `This lesson covers ${(lessonRow as any)?.skills?.name ?? 'this skill'}. Ask me anything about the video or the worked example.` }]);
      setLoading(false);
    })();
  }, [skillParam]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setMessages((prev) => [
      ...prev,
      { from: 'user', text },
      { from: 'ai', text: 'Good question — talk me through what you tried first, and I\u2019ll point out where it goes off track.' },
    ]);
  }

  if (loading) {
    return <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)' }}>Loading...</main>;
  }

  if (!lesson) {
    return (
      <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 700 }}>
        <h1 style={{ fontSize: 26, marginBottom: 16 }}>No lesson published yet</h1>
        <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 24 }}>Pick a skill to see its lesson once your tutor has published one.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--color-divider)' }}>
          {skillOptions.map((s) => (
            <Link key={s.id} href={`/lesson?skill=${s.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-divider)', textDecoration: 'none', color: 'var(--color-text)' }}>
              <span style={{ fontSize: 14 }}>{s.name}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{s.hasLesson ? 'Lesson ready' : 'No lesson yet'}</span>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', minWidth: 0 }}>
      <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 780 }}>
        <span className="kicker">{lesson.skills?.name}</span>
        <h1 style={{ fontSize: 30, marginBottom: 24 }}>{lesson.title}</h1>

        {videoUrl ? (
          <video src={videoUrl} controls style={{ width: '100%', marginBottom: 32, aspectRatio: '16/9', border: '1px solid var(--color-divider)' }} />
        ) : (
          <Blueprint style={{ marginBottom: 32, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: 13, opacity: 0.6 }}>No video uploaded yet</span>
          </Blueprint>
        )}

        <span className="kicker">Revision notes</span>
        <p style={{ fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', opacity: 0.85, whiteSpace: 'pre-wrap' }}>
          {lesson.revision_notes || 'No revision notes yet.'}
        </p>
        {lesson.key_formula && <div className="formula-box" style={{ marginBottom: 24 }}>{lesson.key_formula}</div>}

        <span className="kicker">Worked example</span>
        <div style={{ border: '1px solid var(--color-divider)', padding: '4px 20px', marginBottom: 32 }}>
          {(lesson.worked_example ?? []).map((s) => (
            <div key={s.step} className="worked-step">
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, width: 20, flexShrink: 0 }}>{s.step}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{s.text}</div>
            </div>
          ))}
        </div>

        <Link href={`/skills/practice?skill=${lesson.skill_id}`}>
          <Blueprint className="btn btn-primary">Practice this skill</Blueprint>
        </Link>
      </main>

      <aside style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Ask about this lesson</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Context: {lesson.skills?.name}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'bubble-user' : 'bubble-ai'} style={{ fontSize: 13 }}>
              {m.text}
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-divider)', display: 'flex', gap: 8 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ask a question..."
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
      </aside>
    </div>
  );
}