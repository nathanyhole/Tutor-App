import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Podium — maths tutoring, human and AI',
  description: 'GCSE and A-Level maths tutoring with an AI tutor chat and AI-marked homework.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
