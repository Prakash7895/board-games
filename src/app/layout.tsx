import './globals.css';
import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import ReduxProvider from '@/store/ReduxProvider';

const inter = Patrick_Hand({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
