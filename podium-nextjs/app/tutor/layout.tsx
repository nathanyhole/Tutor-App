import Sidebar from '@/components/Sidebar';

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar role="tutor" name="Mr. Hale" meta="Tutor · Team of 4" initials="MH" />
      {children}
    </div>
  );
}
