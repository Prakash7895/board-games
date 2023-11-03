'use client';
import Input from './Input';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUniqueRoomName } from '@/utils';
import { useDispatch } from 'react-redux';
import { initializeGame } from '@/store/tikadiSlice';
import { OpponentType } from '@/types';

const StartCTAs = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const dispatch = useDispatch();

  const createRoom = () => {
    const newRoom = getUniqueRoomName();
    localStorage.setItem('duel-room', JSON.stringify(newRoom));
    router.push('/play');
  };

  const joinRoom = () => {
    localStorage.setItem('duel-room', JSON.stringify(roomName));
    router.push('/play');
  };

  const startNewGame = () => {
    localStorage.removeItem('duel-room');
    dispatch(initializeGame({ opponentType: OpponentType.bot }));
    router.push('/play');
  };

  return (
    <div className='flex flex-col'>
      <div className='flex gap-5'>
        <button
          className='btn w-32 glass btn-warning text-gray-400 hover:text-gray-700'
          onClick={startNewGame}
        >
          New Game
        </button>
        <button
          className='btn w-32 glass btn-warning text-gray-400 hover:text-gray-700'
          onClick={createRoom}
        >
          Create Room
        </button>
      </div>
      <div className='my-3 flex items-center'>
        <Input
          value={roomName}
          labelClassName='flex-1'
          className='bg-transparent'
          placeholder='Enter Room Name'
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button
          onClick={joinRoom}
          disabled={!roomName.trim().length}
          className={`btn btn-warning ${
            roomName.trim().length ? '' : '!bg-gray-500 !text-gray-700'
          } rounded-none border-0 min-h-[2.5rem] h-[2.5rem]`}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default StartCTAs;
