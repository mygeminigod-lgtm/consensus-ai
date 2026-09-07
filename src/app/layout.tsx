import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Consensus AI — One question. Multiple AIs. One verified answer.',
  description: 'Compare AI models, verify claims, detect disagreements, and get the most accurate answer available. Multi-model AI verification platform.',
  keywords: ['AI', 'fact checking', 'multi-model', 'verification', 'consensus', 'GPT', 'Claude', 'Gemini'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-gray-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
