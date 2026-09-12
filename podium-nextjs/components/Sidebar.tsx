'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconBook, IconChat, IconUpload, IconTrend, IconUsers } from './icons';

const IconFolder = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </svg>
);

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', Icon: IconHome },
  { href: '/lesson', label: 'Lessons', Icon: IconBook },
  { href: '/chat', label: 'AI Tutor', Icon: IconChat },
  { href: '/homework', label: 'Homework', Icon: IconUpload },
  { href: '/progress', label: 'Progress', Icon: IconTrend },
];

const tutorNav = [
  { href: '/tutor', label: 'Students', Icon: IconUsers },
  { href: '/tutor/courses', label: 'Courses', Icon: IconFolder },
];

export default function Sidebar({
  role,
  name,
  meta,
  initials,
}: {
  role: 'student' | 'tutor';
  name: string;
  meta: string;
  initials: string;
}) {
  const pathname = usePathname();
  const items = role === 'student' ? studentNav : tutorNav;
  const brandHref = role === 'student' ? '/dashboard' : '/tutor';

  return (
    <aside className="sidebar" style={{ width: role === 'tutor' ? 220 : 240 }}>
      <Link href={brandHref} className="sidebar-brand">Podium</Link>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/tutor' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={'navlink ' + (active ? 'navlink-active' : '')}>
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="identity">
        <div className="avatar">{initials}</div>
        <div style={{ fontSize: 13, lineHeight: 1.3, overflow: 'hidden' }}>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div className="text-muted">{meta}</div>
        </div>
      </div>
    </aside>
  );
}
