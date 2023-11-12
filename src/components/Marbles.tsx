'use client';
import React, { useContext } from 'react';
import { resetTikadiState, tikadiState } from '@/store/tikadiSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  duelState,
  resetDuelState,
  updateRestartState,
} from '@/store/duelSlice';
import { EmitTypes, OpponentType } from '@/types';
import { resetScoreState, scoreState } from '@/store/scoreSlice';
import { SocketContext } from './SocketProvider';
import { resetChatState } from '@/store/chatSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const coinOne = (
  <Image
    width={40}
    height={40}
    alt='coin one icon'
    src={'/coin-one.svg'}
    className={`cursor-pointer`}
  />
);

export const coinTwo = (
  <Image
    width={40}
    height={40}
    alt='coin two icon'
    src={'/coin-two.svg'}
    className={`cursor-pointer`}
  />
);

const Marbles = () => {
  const router = useRouter();
  const { player1, player2, opponentType } = useSelector(tikadiState);
  const marbles1 = [1, 2, 3];
  const marbles2 = [1, 2, 3];

  const { currentPlayer, otherPlayer, room } = useSelector(duelState);
  const { player1: player1Score, player2: player2Score } =
    useSelector(scoreState);

  const dispatch = useDispatch();

  const { socket } = useContext(SocketContext);

  const goHomeHandler = () => {
    if (opponentType === OpponentType.player) {
      socket?.emit(EmitTypes.LEAVE_ROOM, room);
    }
    dispatch(updateRestartState(false));
    dispatch(resetTikadiState());
    dispatch(resetScoreState());
    dispatch(resetChatState());
    dispatch(resetDuelState());
    router.push('/');
  };

  return (
    <div className='min-w-[20rem] border border-gray-600 rounded-lg flex flex-col'>
      {opponentType !== OpponentType.bot && !otherPlayer ? (
        <div className='h-full flex justify-center items-center'>
          <p>Waiting for the Opponent...</p>
        </div>
      ) : opponentType !== OpponentType.bot && !otherPlayer?.isOnline ? (
        <div className='h-full flex flex-col gap-5 justify-center items-center'>
          <p>{otherPlayer?.name} left the Game. Retrying...</p>
          <button className='btn btn-info mx-5' onClick={goHomeHandler}>
            Go Home
          </button>
        </div>
      ) : (
        <>
          <div className='flex-1 flex flex-col justify-evenly'>
            <div className='flex gap-5 justify-center h-12'>
              {marbles1.map((m) => (
                <div key={m}>{player1[m - 1] === -1 && coinOne}</div>
              ))}
            </div>
            <p className='text-center text-xl'>{`${currentPlayer?.name} ${
              opponentType === OpponentType.player ? ' - ' + player1Score : ''
            }`}</p>
          </div>
          <div className='divider before:bg-slate-500 after:bg-slate-500'>
            vs
          </div>
          <div className='flex-1 flex flex-col justify-evenly'>
            <p className='text-center text-xl'>
              {opponentType === OpponentType.bot
                ? 'Computer'
                : `${otherPlayer?.name} - ${player2Score}`}
            </p>
            <div className='flex gap-5 justify-center h-12'>
              {marbles2.map((m) => (
                <div key={m}>{player2[m - 1] === -1 && coinTwo}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Marbles;
