import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BenchFlow — Gestion & Valorisation des Inter-projets Tech',
  description: 'Anticipez les fins de mission de vos consultants et activez les initiatives internes en 1 clic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
