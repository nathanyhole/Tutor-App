import Link from 'next/link';
import Blueprint from '@/components/Blueprint';
import { IconTarget } from '@/components/icons';

const topics = [
  { name: 'Algebra', pct: '82%' },
  { name: 'Trigonometry', pct: '58%' },
  { name: 'Calculus', pct: '41%' },
  { name: 'Statistics', pct: '70%' },
];

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

const recommendations = [
  { topic: 'Calculus — chain rule', note: 'Three of your last five mistakes came from misapplying the chain rule on composite functions.' },
  { topic: 'Trigonometry — identities', note: "Try five more identity proofs before Friday's mock." },
  { topic: 'Algebra — factorising', note: 'Solid this week. Keep it up with mixed practice.' },
];

export default function DashboardPage() {
  return (
    <main style={{ flex: 1, padding: '40px clamp(20px,4vw,56px)', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Welcome back, Alex</h1>
          <p style={{ fontSize: 14, margin: '6px 0 0', opacity: 0.78 }}>Wednesday · 3 topics need attention this week</p>
        </div>
        <Link href="/chat">
          <Blueprint className="btn btn-primary">Ask the AI tutor</Blueprint>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
        <div>
          <span className="kicker">Subjects</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
            {topics.map((t) => (
              <Link key={t.name} href="/lesson" className="topic-card">
                <Blueprint style={{ padding: 20 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-heading-weight)' as any, textTransform: 'uppercase', fontSize: 15, marginBottom: 14 }}>
                    {t.name}
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: t.pct }} /></div>
                  <div style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>{t.pct} mastery</div>
                </Blueprint>
              </Link>
            ))}
          </div>

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
            {recommendations.map((r) => (
              <div key={r.topic} style={{ border: '1px solid var(--color-divider)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <IconTarget style={{ color: 'var(--color-accent-700)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.topic}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, opacity: 0.78 }}>{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
