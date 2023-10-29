import React from 'react';
import { useSelector } from 'react-redux';
import { scoreState } from '@/store/scoreSlice';

const ScoreBoard = () => {
  const { player1, player2 } = useSelector(scoreState);

  return (
    <div className='border border-gray-600 overflow-hidden rounded-lg flex flex-col h-[30rem] min-w-[20rem]'>
      <div className='flex-1 flex flex-col justify-evenly'>
        <p className='text-center text-xl'>You: {player1}</p>
      </div>
      <div className='divider before:bg-slate-500 after:bg-slate-500'>vs</div>
      <div className='flex-1 flex flex-col justify-evenly'>
        <p className='text-center text-xl'>Opponent: {player2}</p>
      </div>
    </div>
  );
};

export default ScoreBoard;
