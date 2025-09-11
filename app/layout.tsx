import type { Metadata } from 'next';
import './globals.css';
import { WEBSITE_TITLE } from '@shared/model/constants';

export const metadata: Metadata = {
  title: WEBSITE_TITLE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
