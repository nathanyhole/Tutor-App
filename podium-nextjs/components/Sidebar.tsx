'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconBook, IconChat, IconUpload, IconTrend, IconUsers } from './icons';

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', Icon: IconHome },
  { href: '/lesson', label: 'Lessons', Icon: IconBook },
  { href: '/chat', label: 'AI Tutor', Icon: IconChat },
  { href: '/homework', label: 'Homework', Icon: IconUpload },
  { href: '/progress', label: 'Progress', Icon: IconTrend },
];

const tutorNav = [{ href: '/tutor', label: 'Students', Icon: IconUsers }];

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
          const active = pathname === href;
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
