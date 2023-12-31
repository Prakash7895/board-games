'use client';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import React, { useEffect, ReactNode, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, userState } from '@/store/userSlice';
import { EmitTypes, PlayerTurn, cbArgs } from '@/types';
import { Player, updatePlayers } from '@/store/playerSlice';
import { appendMessage } from '@/store/chatSlice';
import {
  duelState,
  updateInvitation,
  updateOnlineStatus,
  updateOpponentPlayer,
  updateRestartState,
} from '@/store/duelSlice';
import { updateGameState } from '@/store/tikadiSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updatePlayersScores } from '@/store/scoreSlice';
import { useRouter } from 'next/navigation';

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}

export const SocketContext = React.createContext<{
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  emitMessage: (message: string) => void;
  createOrJoinRoom: (message: string, cb?: (res: cbArgs) => void) => void;
  sendMessageToRoom: (message: string, room: string) => void;
}>({
  socket: null,
  emitMessage: (msg: string) => {},
  createOrJoinRoom: (msg: string) => {},
  sendMessageToRoom: (msg: string, room: string) => {},
});

const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  const { uuid, name } = useSelector(userState);
  const dispatch = useDispatch();
  const router = useRouter();

  const { otherPlayer } = useSelector(duelState);

  useEffect(() => {
    let uuidToUse = uuid;
    const value = localStorage.getItem('name');
    const savedName = value ? JSON.parse(value) : null;

    const value1 = localStorage.getItem('uuid');
    uuidToUse = value1 ? JSON.parse(value1) : null;

    if (!uuidToUse || !name) {
      if (!uuidToUse) {
        uuidToUse = uuidv4();
      }

      dispatch(updateUser({ uuid: uuidToUse, name: savedName }));
      localStorage.setItem('uuid', JSON.stringify(uuidToUse));
    }
  }, [uuid, name, dispatch]);

  useEffect(() => {
    async function initSocket() {
      await fetch('/api/socketio');

      const _socket = io({
        query: {
          userName: name,
        },
      }) as unknown as Socket;

      _socket.on('connect', () => {
        console.log('USER CONNECTED...');
      });

      setSocket(_socket);
    }
    if (uuid && name) {
      initSocket();
    }
  }, [uuid, name]);

  const createOrJoinRoom = useCallback(
    (room: string, cb?: (res: cbArgs) => void) => {
      console.log('Creating room on UI', room);
      if (room) {
        socket?.emit(EmitTypes.CREATE_OR_JOIN_ROOM, room.trim(), (res: any) => {
          cb && cb(res);
        });
      }
    },
    [socket]
  );

  useEffect(() => {
    const onNewUserAdded = (users: Player[]) => {
      dispatch(
        updatePlayers(
          users
            .filter((p) => p.uuid !== uuid)
            .map((p) => ({
              ...p,
              isPlaying: p.isPlaying ? p.isPlaying : false,
            }))
        )
      );
    };

    const newMsgHandler = (msgObj: any) => {
      console.log('NEW_MESSAGE_IN_ROOM', msgObj);
      dispatch(
        appendMessage({
          isIncoming: true,
          message: msgObj.message,
        })
      );
    };

    const cancelInvitationHandler = (obj: any) => {
      if (obj && obj.from && obj.to === uuid) {
        dispatch(updateInvitation(null));
        toast.info(`${obj.from.name} has cancelled the invitation.`);
      }
    };

    const acceptInvitationHandler = (obj: any) => {
      if (obj && obj.room && obj.from && obj.to === uuid) {
        dispatch(updateInvitation(null));
        createOrJoinRoom(obj.room);
        router.push(`/play/${obj.room}`);
      }
    };

    const updateInvitationHandler = (obj: any) => {
      if (obj && obj.from && obj.to === uuid) {
        dispatch(updateInvitation({ from: { ...obj.from, isOnline: true } }));
      }
    };

    const joinRoomHandler = (players: any) => {
      console.log('USER_JOINED_ROOM:', players);
      const opponentPlayer: Player = players.find(
        (p: Player) => p.uuid !== uuid
      );
      if (opponentPlayer) {
        dispatch(
          updateOpponentPlayer({
            name: opponentPlayer.name,
            uuid: opponentPlayer.uuid,
            isOnline: true,
          })
        );
      }
    };

    const leaveRoomHandler = (player: any) => {
      console.log('USER_LEFT_ROOM', player);
      if (player && player.uuid !== uuid) {
        dispatch(
          updateOnlineStatus({
            uuid: player.uuid,
            isOnline: false,
          })
        );
      }
    };

    const gameStateChangeHandler = (state: any) => {
      console.log('GAME_STATE_CHANGE', state);
      console.log('GAME_STATE_CHANGE otherPlayer', otherPlayer);
      if (otherPlayer) {
        dispatch(
          updateGameState({
            player1: state[uuid],
            player2: state[otherPlayer.uuid],
            turn:
              state.turn === uuid
                ? PlayerTurn.currentPlayer
                : PlayerTurn.otherPlayer,
          })
        );
        dispatch(
          updatePlayersScores({
            player1: state.scores[uuid],
            player2: state.scores[otherPlayer.uuid],
          })
        );
      }
    };

    const playAgainHandler = (player: Player) => {
      if (player && player.uuid !== uuid) {
        dispatch(updateRestartState(true));
      }
    };

    if (socket && uuid && name) {
      socket.emit(EmitTypes.ONLINE, {
        uuid: uuid,
        name: name,
      });

      socket.on(EmitTypes.NEW_USER, onNewUserAdded);

      socket?.on(EmitTypes.USER_JOINED_ROOM, joinRoomHandler);

      socket?.on(EmitTypes.USER_LEFT_ROOM, leaveRoomHandler);

      socket.on(EmitTypes.NEW_MESSAGE_IN_ROOM, newMsgHandler);

      socket.on(EmitTypes.GAME_STATE_CHANGE, gameStateChangeHandler);

      socket.on(EmitTypes.PLAY_AGAIN, playAgainHandler);

      socket.on(EmitTypes.REQUEST_TO_PLAY, updateInvitationHandler);

      socket.on(EmitTypes.CANCEL_INVITATION, cancelInvitationHandler);

      socket.on(EmitTypes.ACCEPT_INVITATION, acceptInvitationHandler);
    }

    return () => {
      console.log('ROOT CLEANING UP');
      socket?.off(EmitTypes.NEW_MESSAGE_IN_ROOM, newMsgHandler);
      socket?.off(EmitTypes.CANCEL_INVITATION, cancelInvitationHandler);
      socket?.off(EmitTypes.ACCEPT_INVITATION, acceptInvitationHandler);
      window.addEventListener('unload', function () {
        socket?.disconnect(true);
        console.log('UNLOADED');
      });
    };
  }, [socket, uuid, name, otherPlayer, router, dispatch, createOrJoinRoom]);

  const emitMessage = (msg: string) => {
    socket?.emit(EmitTypes.EMIT_MESSAGE, {
      from: { uuid: uuid, name: name },
      message: msg,
    });
  };

  const sendMessageToRoom = (msg: string, room: string) => {
    if (room) {
      socket?.emit(EmitTypes.SEND_MESSAGE_TO_ROOM, {
        room: room,
        from: {
          uuid,
          name,
        },
        message: msg,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, emitMessage, createOrJoinRoom, sendMessageToRoom }}
    >
      <ToastContainer
        position='top-center'
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />

      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
