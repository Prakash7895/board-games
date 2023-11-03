'use client';
import Ground from '@/components/Ground';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import Confetti from '@/components/Confetti';
import ChatWindow from '@/components/ChatWindow';
import ScoreBoard from '@/components/ScoreBoard';
import { resetScoreState, updateScore } from '@/store/scoreSlice';
import { EmitTypes, OpponentType, PlayerTurn, cbArgs } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import {
  initializeGame,
  resetTikadiState,
  tikadiState,
} from '@/store/tikadiSlice';
import {
  duelState,
  resetDuelState,
  updateCurrentPlayer,
  updateRestartState,
  updateRoom,
} from '@/store/duelSlice';
import { SocketContext } from '@/components/SocketProvider';
import { userState } from '@/store/userSlice';
import AlertConfirmation from '@/components/AlertConfirmation';
import { resetChatState } from '@/store/chatSlice';
import { toast } from 'react-toastify';

export default function PlayGround() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { name, uuid } = useSelector(userState);
  const { turn, opponentType, winner } = useSelector(tikadiState);
  const [showPlayAgainBtn, setShowPlayAgainBtn] = useState(false);
  const { room, restart, otherPlayer } = useSelector(duelState);
  const { createOrJoinRoom, socket } = useContext(SocketContext);

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
    return turn === -1
      ? ''
      : turn === PlayerTurn.currentPlayer
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
    if (name || uuid) {
      dispatch(
        updateCurrentPlayer({
          name: name,
          uuid: uuid,
          isOnline: true,
        })
      );
    }
    let interval: NodeJS.Timeout;
    if (opponentType !== OpponentType.bot && socket) {
      interval = setTimeout(() => {
        createOrJoinRoom(savedRoom);
      }, 100);
    }

    // return () => {
    //   console.log('CLEAN-UP');
    //   window.addEventListener('unload', function () {
    //     console.log('UNLOADED', savedRoom);
    //   });
    // };
    return () => {
      clearTimeout(interval);
    };
  }, [room, socket, name, uuid]);

  const goHomeHandler = () => {
    if (opponentType === OpponentType.player) {
      socket?.emit(EmitTypes.LEAVE_ROOM, room);
    }
    localStorage.removeItem('duel-room');
    dispatch(updateRestartState(false));
    dispatch(resetTikadiState());
    dispatch(resetScoreState());
    dispatch(resetChatState());
    dispatch(resetDuelState());
    router.push('/');
  };

  return (
    <div className='min-h-screen p-5'>
      <AlertConfirmation
        show={restart}
        firstButtonText='Play'
        secondButtonText='Go Home'
        firstButtonHandler={() => {
          socket?.emit(EmitTypes.RESET_GAME_STATE, { room }, (res: cbArgs) => {
            if (res.message) {
              toast.info(res.message);
            }
            dispatch(updateRestartState(false));
          });
        }}
        secondButtonHandler={goHomeHandler}
      >
        <p>{otherPlayer?.name} wants a rematch.</p>
      </AlertConfirmation>
      <div className='flex flex-col justify-center mb-5'>
        <p className='text-center text-xl mb-2'>{getLabel()}</p>
        <div className='text-center h-12'>
          {showPlayAgainBtn && (
            <>
              <button
                className='btn btn-success btn-outline mx-5'
                onClick={() => {
                  if (opponentType !== OpponentType.bot) {
                    dispatch(
                      initializeGame({
                        opponentType: OpponentType.player,
                        turn: -1,
                      })
                    );
                    socket?.emit(EmitTypes.PLAY_AGAIN, room);
                  } else {
                    dispatch(resetTikadiState());
                  }
                }}
              >
                Play Again
              </button>
              <button className='btn btn-info mx-5' onClick={goHomeHandler}>
                Go Home
              </button>
            </>
          )}
        </div>
        {opponentType === OpponentType.player && (
          <div className='text-center flex items-center justify-center gap-2'>
            <p>Share this room id with your friend: {room}</p>
            <img
              src='./copy.svg'
              className='w-7 h-7 cursor-pointer'
              title='Click to copy room id'
              onClick={() => {
                navigator.clipboard.writeText(room);
              }}
            />
          </div>
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
