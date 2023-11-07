import './globals.css';
import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import ReduxProvider from '@/store/ReduxProvider';
import SocketProvider from '@/components/SocketProvider';
import NameConfirmation from '@/components/NameConfirmation';

const inter = Patrick_Hand({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: `Three Men's Morris`,
  description:
    "Experience Three Men's Morris like never before! Play with intelligent bots or challenge online players, engage in real-time chat during matches, invite friends for friendly competitions, and easily discover who's online for instant gaming action. Try our ultimate Morris game now!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ReduxProvider>
          <SocketProvider>
            <NameConfirmation />
            {children}
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
