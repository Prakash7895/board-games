'use client';
import AdSpace from '@/components/AdSpace';
import OnlinePlayers from '@/components/OnlinePlayers';
import StartCTAs from '@/components/StartCTAs';
import Welcome from '@/components/Welcome';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-10'>
      <h1 className='text-5xl'>Three Men's Morris</h1>
      {/* <div className='flex h-full flex-1 justify-between w-full items-center '> */}
      {/* <AdSpace /> */}
      <Welcome />
      <StartCTAs />
      <OnlinePlayers />
      {/* </div> */}
    </main>
  );
}
