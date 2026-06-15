import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionProvider } from '@/hooks/useSession';

const siteName = 'DocuFlow DMS';
const siteDescription = 'Structured document storage, version control, approvals, and access control';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e', // Teal/Cyan hues for "DocuFlow" theme
};

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: 'summary',
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900" suppressHydrationWarning>
      <body className="h-full antialiased selection:bg-teal-100 selection:text-teal-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
