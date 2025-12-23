import '../styles/globals.css';
import React from 'react';

export const metadata = {
  title: 'Dashboard - Monitoring Server',
  description: 'Dashboard monitoring server',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen">
          <header className="flex items-center justify-between max-w-7xl mx-auto p-6">
            <div className="text-lg font-semibold">Monitoring Server</div>
            <nav className="flex items-center gap-4">
              <a href="/dashboard" className="hover:underline">Dashboard</a>
              <a href="/login" className="hover:underline">Masuk</a>
              <a href="/register" className="hover:underline">Daftar</a>
            </nav>
          </header>
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
