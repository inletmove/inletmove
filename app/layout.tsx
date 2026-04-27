import type { Metadata, Viewport } from 'next';
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/home/Footer';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT'],
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hanken',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const viewport: Viewport = {
  themeColor: '#0E1F36',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Inlet Move Co. — Honest, careful Metro Vancouver movers',
    template: '%s · Inlet Move Co.',
  },
  description:
    'Two-mover crew + cargo van. $150/hr, $300 minimum. Same-week local moves across Metro Vancouver. Quote in 60 seconds.',
  applicationName: 'Inlet Move Co.',
  keywords: [
    'movers vancouver',
    'metro vancouver moving company',
    'burnaby movers',
    'richmond movers',
    'surrey movers',
    'senior moves vancouver',
    'multigenerational moves',
  ],
  authors: [{ name: 'Inlet Move Co.' }],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    siteName: 'Inlet Move Co.',
    title: 'Inlet Move Co. — Honest, careful Metro Vancouver movers',
    description:
      'Two-mover crew + cargo van. $150/hr, $300 minimum. Same-week local moves across Metro Vancouver.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inlet Move Co.',
    description: 'Honest, careful Metro Vancouver movers. Quote in 60 seconds.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
