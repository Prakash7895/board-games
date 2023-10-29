'use client';
import React from 'react';
import { tikadiState } from '@/store/tikadiSlice';
import { useSelector } from 'react-redux';

export const coinOne = (
  <img src={'./coin-one.svg'} className={`w-10 h-10 cursor-pointer`} />
);

export const coinTwo = (
  <img src={'./coin-two.svg'} className={`w-10 h-10 cursor-pointer`} />
);

const Marbles = () => {
  const { player1, player2 } = useSelector(tikadiState);
  const marbles1 = [1, 2, 3];
  const marbles2 = [1, 2, 3];

  return (
    <div className='min-w-[20rem] border border-gray-600 rounded-lg flex flex-col'>
      <div className='flex-1 flex flex-col justify-evenly'>
        <div className='flex gap-5 justify-center h-12'>
          {marbles1.map((m) => (
            <div key={m}>{player1[m - 1] === -1 && coinOne}</div>
          ))}
        </div>
        <p className='text-center text-xl'>Player 1</p>
      </div>
      <div className='divider before:bg-slate-500 after:bg-slate-500'>vs</div>
      <div className='flex-1 flex flex-col justify-evenly'>
        <p className='text-center text-xl'>Player 2</p>
        <div className='flex gap-5 justify-center h-12'>
          {marbles2.map((m) => (
            <div key={m}>{player2[m - 1] === -1 && coinTwo}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marbles;
