import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Notes App',
  description: 'A modern notes app with AI summarization',
  keywords: ['notes', 'ai', 'summarization', 'nextjs', 'supabase'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  applicationName: 'AI Notes App',
  viewport: 'width=device-width, initial-scale=1',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ThemeProvider>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
      </ThemeProvider>
    </html>
  );
}