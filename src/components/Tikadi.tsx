import React, { useContext, useEffect, useRef } from 'react';
import {
  EmitTypes,
  OpponentType,
  PlayerTurn,
  Position,
  SelectedMarbles,
} from '@/types';
import { useSelector, useDispatch } from 'react-redux';
import {
  moveToSelectedPosition,
  selectMarble,
  tikadiState,
} from '@/store/tikadiSlice';
import {
  checkIfWon,
  getNextMove,
  getNextPossibleTikadiPositions,
} from '@/utils';
import { coinOne, coinTwo } from './Marbles';
import { SocketContext } from './SocketProvider';
import { duelState } from '@/store/duelSlice';

const Tikadi = () => {
  const {
    turn,
    winner,
    player1,
    player2,
    opponentType,
    selectedMarble,
    nextPossiblePositions,
  } = useSelector(tikadiState);
  const { room, otherPlayer, currentPlayer } = useSelector(duelState);
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const ref = useRef<HTMLDivElement>(null);

  const findNextPosition = (num: Position) => {
    const nextPossiblePos = getNextPossibleTikadiPositions(num);
    return nextPossiblePos.filter((el) => {
      if ([...player1, ...player2].includes(el as Position)) {
        return false;
      }
      return true;
    });
  };

  const moveMarbleToThisPosition = (pos: Position) => {
    if (selectedMarble === -1) {
      let marble = -1;
      if (player1.includes(pos)) {
        marble = player1.findIndex((el) => el === pos);
      }

      if (marble >= 0) {
        const nextPos = findNextPosition(pos);
        if (nextPos.length > 0) {
          dispatch(selectMarble((marble + 1) as SelectedMarbles));
        }
      }
    } else {
      const idx = [...player1, ...player2].findIndex((el) => el === pos);
      if (idx < 0 && nextPossiblePositions.includes(pos)) {
        dispatch(moveToSelectedPosition(pos));
        if (
          opponentType !== OpponentType.bot &&
          otherPlayer &&
          socket &&
          currentPlayer &&
          room
        ) {
          console.log('EMITING STATE CHANGE....');
          socket.emit(EmitTypes.UPDATE_GAME_STATE, {
            room: room.trim(),
            newPos: pos,
            playerUUID: currentPlayer.uuid,
            turn: otherPlayer.uuid,
            marbleNum: selectedMarble,
          });
        }
      }
    }
  };

  const getMarbleForThisPosition = (pos: Position) => {
    if (player1.includes(pos as Position)) {
      return coinOne;
    } else if (player2.includes(pos as Position)) {
      return coinTwo;
    }
    return null;
  };

  const isSelectable = (num: Position) => {
    if (winner !== -1 || turn === -1 || turn === PlayerTurn.otherPlayer) {
      return false;
    }

    if (selectedMarble === -1) {
      const selectables =
        turn === PlayerTurn.currentPlayer ? [...player1] : [...player2];

      const idx = selectables.findIndex((el) => el < 0);

      if (!selectables.includes(num) || idx >= 0) {
        return false;
      }

      const nextPos = findNextPosition(num);

      return nextPos.length > 0;
    }
    return nextPossiblePositions.includes(num);
  };

  useEffect(() => {
    let interVal: NodeJS.Timeout;

    if (turn === PlayerTurn.otherPlayer && opponentType === OpponentType.bot) {
      const [pos, marble] = getNextMove([...player2], [...player1]);

      interVal = setTimeout(() => {
        if (marble >= 0) {
          dispatch(selectMarble(marble as SelectedMarbles));
        }
        dispatch(moveToSelectedPosition(pos));
      }, 500);
    }

    return () => {
      clearTimeout(interVal);
    };
  }, [turn, opponentType, player1, player2, dispatch]);

  const circle = (num: Position) => (
    <div
      className={`w-12 h-12 rounded-full flex justify-center items-center bg-custom-tertiary ${
        isSelectable(num) ? 'request-loader cursor-pointer' : ''
      }`}
      onClick={() =>
        winner === -1 &&
        turn === PlayerTurn.currentPlayer &&
        moveMarbleToThisPosition(num)
      }
    >
      {/* <span className={`h-full w-full circle-${num} `}></span> */}
      {getMarbleForThisPosition(num)}
    </div>
  );
  const threeCircles = (num: number) => (
    <div className='flex justify-between'>
      {circle(num as Position)}
      {circle((num + 1) as Position)}
      {circle((num + 2) as Position)}
    </div>
  );

  const winIdx =
    winner >= 0
      ? checkIfWon([
          ...(winner === PlayerTurn.currentPlayer ? player1 : player2),
        ])
      : -1;

  const rod = (
    className: string,
    idx: number,
    isVertical?: boolean,
    style?: React.CSSProperties
  ) => (
    <div className={`bg-custom-primary ${className} mx-5`} style={style}>
      <div
        className={`bg-sky-500 ${
          idx === winIdx
            ? 'w-full h-full'
            : isVertical
            ? 'w-full h-0'
            : 'w-0 h-full'
        } transition-all duration-500`}
      ></div>
    </div>
  );

  const diagonalHeight = (ref.current?.offsetWidth ?? 1) * 1.25;

  return (
    <div
      ref={ref}
      className='aspect-square w-full lg:w-fit lg:h-[30rem] relative mx-auto'
    >
      <div className='w-full h-full flex flex-col justify-between z-10 relative'>
        {threeCircles(1)}
        {threeCircles(4)}
        {threeCircles(7)}
      </div>
      <div className='absolute top-0 bottom-0 left-0 right-0 z-0'>
        <div className='h-full flex flex-col justify-between py-5'>
          {rod('h-2', 0)}
          {rod('h-2', 1)}
          {rod('h-2', 2)}
        </div>
      </div>
      <div className='absolute top-0 bottom-0 left-0 right-0 z-0'>
        <div className='h-full flex justify-between py-5'>
          {rod('w-2 h-full', 3, true)}
          {rod('w-2 h-full', 4, true)}
          {rod('w-2 h-full', 5, true)}
        </div>
      </div>
      <div className='absolute top-0 bottom-0 left-0 right-0 z-0 p-0'>
        {rod(`h-2 mt-[22px] ml-[27px] rotate-45 origin-top-left`, 6, false, {
          width: `${diagonalHeight}px`,
        })}
      </div>
      <div className='absolute bottom-0 left-0 right-0 z-0 p-0'>
        {rod(
          `h-2 mb-[22px] ml-[28px] -rotate-45 origin-bottom-left`,
          7,
          false,
          {
            width: `${diagonalHeight}px`,
          }
        )}
      </div>
    </div>
  );
};

export default Tikadi;
