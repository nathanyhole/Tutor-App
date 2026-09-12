import Link from 'next/link';
import Blueprint from '@/components/Blueprint';

export default function LandingPage() {
  return (
    <div>
      <nav className="nav" style={{ paddingInline: 'clamp(20px,5vw,64px)' }}>
        <span className="nav-brand">Podium</span>
        <a href="#how">How it works</a>
        <a href="#tutors">For tutors</a>
        <Link href="/login">Log in</Link>
        <Link href="/login">
          <Blueprint className="btn btn-primary">Get started</Blueprint>
        </Link>
      </nav>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 clamp(20px, 5vw, 64px)' }}>
        <section style={{ padding: '96px 0 64px' }}>
          <h1 style={{ fontSize: 'clamp(40px,6vw,80px)', lineHeight: 1.05, margin: 0 }}>
            <span style={{ display: 'block' }}>Maths help that shows</span>
            <span style={{ display: 'block' }}>its working.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '56ch', margin: '24px 0 0', opacity: 0.85 }}>
            Podium pairs GCSE and A-Level students with real tutors and an AI chat tutor that&apos;s
            always on. Stuck on a step? Ask the bot. Finished a worksheet? Photograph it and get it
            marked line by line.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/login">
              <Blueprint className="btn btn-primary">Get started free</Blueprint>
            </Link>
            <a href="#how" className="btn btn-ghost">See how it works</a>
          </div>
        </section>

        <section id="how" style={{ padding: '40px 0 64px' }}>
          <span className="kicker">01 · What&apos;s inside</span>
          <hr className="caption-rule" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            <Blueprint style={{ padding: 28 }}>
              <h2 style={{ fontSize: 20 }}>AI tutor chat</h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: '12px 0 0', opacity: 0.78 }}>
                Ask a question at 11pm the night before a mock exam. The AI walks through the method,
                never just the answer.
              </p>
            </Blueprint>
            <Blueprint style={{ padding: 28 }}>
              <h2 style={{ fontSize: 20 }}>Snap and mark</h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: '12px 0 0', opacity: 0.78 }}>
                Photograph a page of working. The AI marks it, finds the exact step it went wrong,
                and explains the fix.
              </p>
            </Blueprint>
            <Blueprint style={{ padding: 28 }}>
              <h2 style={{ fontSize: 20 }}>Real tutors, still in charge</h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: '12px 0 0', opacity: 0.78 }}>
                Every student has a human tutor who sets homework, reads the AI&apos;s marking and
                steps in when it matters.
              </p>
            </Blueprint>
          </div>
        </section>

        <section id="tutors" style={{ padding: '0 0 96px' }}>
          <span className="kicker">02 · Sign up</span>
          <hr className="caption-rule" />
          <h3 style={{ fontSize: 24 }}>Start learning with Podium</h3>
          <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: '56ch', margin: '12px 0 24px', opacity: 0.78 }}>
            Free to sign up. Built for GCSE and A-Level maths, with a small team of tutors behind
            every account.
          </p>
          <Link href="/login">
            <Blueprint className="btn btn-primary">Create an account</Blueprint>
          </Link>
        </section>

        <footer style={{ padding: '32px 0', borderTop: '1px solid var(--color-divider)', fontSize: 13, opacity: 0.7 }}>
          Podium — maths tutoring, human and AI.
        </footer>
      </div>
    </div>
  );
}
