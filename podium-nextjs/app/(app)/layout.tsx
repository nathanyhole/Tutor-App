import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar role="student" name="Alex Morgan" meta="A-Level Maths" initials="AM" />
      {children}
    </div>
  );
}
