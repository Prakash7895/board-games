'use client';
import Ground from '@/components/Ground';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Confetti from '@/components/Confetti';
import ChatWindow from '@/components/ChatWindow';
import ScoreBoard from '@/components/ScoreBoard';
import { updateScore } from '@/store/scoreSlice';
import { OpponentType, PlayerTurn } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import {
  initializeGame,
  resetTikadiState,
  tikadiState,
} from '@/store/tikadiSlice';
import { duelState, updateRoom } from '@/store/duelSlice';

export default function PlayGround() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { turn, opponentType, winner } = useSelector(tikadiState);
  const [showPlayAgainBtn, setShowPlayAgainBtn] = useState(false);
  const { room } = useSelector(duelState);

  useEffect(() => {
    let interVal: NodeJS.Timeout;
    if (winner > 0) {
      interVal = setTimeout(() => {
        setShowPlayAgainBtn(true);
      }, 500);
      dispatch(updateScore(turn));
    } else if (winner < 0) {
      setShowPlayAgainBtn(false);
    }

    return () => {
      clearTimeout(interVal);
    };
  }, [winner]);

  const getLabel = () => {
    if (winner > 0) {
      return winner === PlayerTurn.currentPlayer
        ? 'You Won'
        : opponentType === OpponentType.bot
        ? 'Computer Won'
        : 'Opponent Won';
    }
    return turn === PlayerTurn.currentPlayer
      ? 'Your Turn'
      : opponentType === OpponentType.bot
      ? 'Computer Turn'
      : 'Opponent Turn';
  };

  useEffect(() => {
    const value = localStorage.getItem('duel-room');
    const savedRoom = value ? JSON.parse(value) : null;

    if (savedRoom && savedRoom !== room) {
      dispatch(updateRoom(savedRoom));
      dispatch(initializeGame({ opponentType: OpponentType.player }));
    }

    // return () => {
    //   console.log('CLEAN-UP');
    //   window.addEventListener('unload', function () {
    //     console.log('UNLOADED', savedRoom);
    //   });
    // };
  }, [room]);

  return (
    <div className='min-h-screen p-5'>
      <div className='flex flex-col justify-center mb-5'>
        <p className='text-center text-xl mb-2'>{getLabel()}</p>
        <div className='text-center h-12'>
          {showPlayAgainBtn && (
            <>
              <button
                className='btn btn-success btn-outline mx-5'
                onClick={() => dispatch(resetTikadiState())}
              >
                Play Again
              </button>
              <button
                className='btn btn-info mx-5'
                onClick={() => router.push('/')}
              >
                Go Home
              </button>
            </>
          )}
        </div>
        {opponentType === OpponentType.player && (
          <p className='text-center'>
            Share this room id with your friend: {room}
          </p>
        )}
      </div>
      <div className='flex justify-around h-full w-full'>
        {winner === PlayerTurn.currentPlayer && <Confetti />}
        <Ground />
        {opponentType === OpponentType.bot ? <ScoreBoard /> : <ChatWindow />}
      </div>
    </div>
  );
}
