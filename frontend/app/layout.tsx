import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-slate-900">{children}</body>
    </html>
  );
}
