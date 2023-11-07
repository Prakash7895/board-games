'use client';
import { playerState } from '@/store/playerSlice';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import AlertConfirmation from './AlertConfirmation';
import { SocketContext } from './SocketProvider';
import { EmitTypes } from '@/types';
import { userState } from '@/store/userSlice';

const OnlinePlayers = () => {
  const { players } = useSelector(playerState);
  const { name, uuid } = useSelector(userState);
  const [show, setShow] = useState(false);

  const { socket } = useContext(SocketContext);

  const inviteHandler = (playerUUID: string) => {
    socket?.emit(EmitTypes.REQUEST_TO_PLAY, {
      to: playerUUID,
      uuid,
      name,
    });
    setShow(true);
  };

  return (
    <div className='w-full flex gap-4 overflow-x-auto h-56 justify-center'>
      {players.length ? (
        players.map((player) => (
          <div
            key={player.name}
            className='flex flex-col justify-between gap-2 shadow shadow-white rounded min-w-[100px] mb-3 mt-10 mx-1 p-2 tooltip tooltip-info z-50'
            data-tip={player.isPlaying ? 'Playing' : null}
          >
            <Image
              alt='User'
              src={'/user.svg'}
              width={50}
              height={50}
              className='mx-auto'
            />
            <p className='truncate whitespace-pre-wrap text-center'>
              {player.name}
            </p>
            <button
              className={`btn btn-outline btn-accent min-h-6 h-6 ${
                player.isPlaying ? 'btn-disabled !text-gray-400' : ''
              } `}
              onClick={() => inviteHandler(player.uuid)}
            >
              Invite
            </button>
          </div>
        ))
      ) : (
        <p className='text-info flex justify-center items-center h-full'>
          Searching for players online...
        </p>
      )}
      <AlertConfirmation
        show={show}
        secondButtonText='Cancel'
        secondButtonHandler={() => setShow(false)}
      >
        <p className='text-xl'>Requested</p>
        <p>Waiting for other player to accept...</p>
      </AlertConfirmation>
    </div>
  );
};

export default OnlinePlayers;
