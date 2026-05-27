import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'PropList',
  description: 'PropList - Multi-tenant property listing platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
