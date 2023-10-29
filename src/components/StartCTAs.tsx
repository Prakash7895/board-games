'use client';
import Input from './Input';
import Link from 'next/link';
import { OpponentType } from '@/types';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userState } from '@/store/userSlice';
import { initializeGame } from '@/store/tikadiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getUniqueRoomName, setValueToLocalStorage } from '@/utils';
import { updateCurrentPlayer, updateRoom } from '@/store/duelSlice';

const StartCTAs = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [roomName, setRoomName] = useState('');
  const { name, uuid } = useSelector(userState);

  const createRoom = () => {
    const newRoom = getUniqueRoomName();
    setValueToLocalStorage('duel-room', newRoom);
    dispatch(initializeGame({ opponentType: OpponentType.player }));
    dispatch(
      updateCurrentPlayer({
        name: name,
        uuid: uuid,
        isOnline: true,
      })
    );
    dispatch(updateRoom(newRoom));
    router.push('/play');
  };

  const joinRoom = () => {
    setValueToLocalStorage('duel-room', roomName);
    dispatch(initializeGame({ opponentType: OpponentType.player }));
    dispatch(
      updateCurrentPlayer({
        name: name,
        uuid: uuid,
        isOnline: true,
      })
    );
    dispatch(updateRoom(roomName));
    router.push('/play');
  };

  return (
    <div className='flex flex-col'>
      <div className='flex gap-5'>
        <Link
          className='btn w-32 glass btn-warning text-gray-400 hover:text-gray-700'
          href={'/play'}
        >
          New Game
        </Link>
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
