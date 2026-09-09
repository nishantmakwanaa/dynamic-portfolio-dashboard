import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dynamic Portfolio | Real-Time Financial Analytics • Made by Nishant Makwana',
  description:
    'Minimal, high-density, real-time stock portfolio analytics & live market tracking dashboard. Built with Next.js, React, Tailwind CSS, Docker, and MongoDB.',
  keywords: [
    'Portfolio Dashboard',
    'Real-Time Stock Analytics',
    'Financial Dashboard',
    'Next.js 16',
    'React',
    'MongoDB',
    'Docker',
    'Nishant Makwana',
  ],
  authors: [{ name: 'Nishant Makwana' }],
  creator: 'Nishant Makwana',
  publisher: 'Nishant Makwana',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Dynamic Portfolio Analytics',
    description:
      'Real-time stock portfolio tracking and financial analytics dashboard. Made with heart by Nishant Makwana.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dynamic Portfolio Analytics',
    description:
      'Real-time stock portfolio tracking and financial analytics dashboard. Made with heart by Nishant Makwana.',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}

