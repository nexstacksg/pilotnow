import type { Metadata } from 'next';
import './globals.css';
import './latest.css';

export const metadata: Metadata = {
  title: 'PilotNow',
  description: 'Workforce operations for security manpower companies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
