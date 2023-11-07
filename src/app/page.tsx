'use client';
import AlertConfirmation from '@/components/AlertConfirmation';
import OnlinePlayers from '@/components/OnlinePlayers';
import StartCTAs from '@/components/StartCTAs';
import Welcome from '@/components/Welcome';
import { useDispatch, useSelector } from 'react-redux';
import { duelState, resetDuelState, updateInvitation } from '@/store/duelSlice';
import { useContext } from 'react';
import { SocketContext } from '@/components/SocketProvider';
import { EmitTypes } from '@/types';
import { userState } from '@/store/userSlice';
import { resetChatState } from '@/store/chatSlice';
import { resetScoreState } from '@/store/scoreSlice';
import { resetTikadiState } from '@/store/tikadiSlice';
import { getUniqueRoomName } from '@/utils';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { invitation } = useSelector(duelState);
  const { name, uuid } = useSelector(userState);

  const { socket } = useContext(SocketContext);

  const cancelInvite = () => {
    socket?.emit(EmitTypes.CANCEL_INVITATION, {
      to: invitation?.from.uuid,
      from: { uuid, name },
    });
    dispatch(updateInvitation(null));
  };

  const resetRootState = () => {
    dispatch(resetChatState());
    dispatch(resetDuelState());
    dispatch(resetScoreState());
    dispatch(resetTikadiState());
  };

  const acceptInvite = () => {
    resetRootState();
    const newRoom = getUniqueRoomName();
    localStorage.setItem('duel-room', JSON.stringify(newRoom));
    socket?.emit(EmitTypes.ACCEPT_INVITATION, {
      room: newRoom,
      to: invitation?.from.uuid,
      from: { uuid, name },
    });
    socket?.emit(EmitTypes.CREATE_OR_JOIN_ROOM, newRoom);
    router.push('/play');
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-10'>
      <h1 className='text-5xl'>Three Men&apos;s Morris</h1>
      <Welcome />
      <StartCTAs />
      <OnlinePlayers />
      <AlertConfirmation
        show={!!invitation}
        firstButtonText='Accept'
        secondButtonText='Cancel'
        firstButtonHandler={acceptInvite}
        secondButtonHandler={cancelInvite}
      >
        <p className='text-xl'>Invitation</p>
        <p>{invitation?.from.name} has invited you to play.</p>
      </AlertConfirmation>
    </main>
  );
}
