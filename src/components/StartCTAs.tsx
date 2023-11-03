'use client';
import Input from './Input';
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { getRandom, getUniqueRoomName } from '@/utils';
import { useDispatch } from 'react-redux';
import { initializeGame, resetTikadiState } from '@/store/tikadiSlice';
import { OpponentType } from '@/types';
import { resetChatState } from '@/store/chatSlice';
import { resetDuelState } from '@/store/duelSlice';
import { resetScoreState } from '@/store/scoreSlice';
import { SocketContext } from './SocketProvider';
import { toast } from 'react-toastify';

const StartCTAs = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const dispatch = useDispatch();
  const { createOrJoinRoom } = useContext(SocketContext);

  const resetRootState = () => {
    dispatch(resetChatState());
    dispatch(resetDuelState());
    dispatch(resetScoreState());
    dispatch(resetTikadiState());
  };

  const createRoom = () => {
    resetRootState();
    const newRoom = getUniqueRoomName();
    localStorage.setItem('duel-room', JSON.stringify(newRoom));
    router.push('/play');
  };

  const joinRoom = () => {
    resetRootState();
    localStorage.setItem('duel-room', JSON.stringify(roomName));
    createOrJoinRoom(roomName, (res) => {
      console.log('RESPONSE:', res);
      if (res.status) {
        router.push('/play');
      } else {
        toast.error(res.message);
      }
    });
  };

  const startNewGame = () => {
    resetRootState();
    localStorage.removeItem('duel-room');
    dispatch(
      initializeGame({ opponentType: OpponentType.bot, turn: getRandom(1, 3) })
    );
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
