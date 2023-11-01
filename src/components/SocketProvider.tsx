'use client';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import React, { useEffect, ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, userState } from '@/store/userSlice';
import { EmitTypes } from '@/types';
import { Player, updatePlayers } from '@/store/playerSlice';
import { appendMessage } from '@/store/chatSlice';

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}

export const SocketContext = React.createContext<{
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  emitMessage: (message: string) => void;
  createOrJoinRoom: (message: string) => void;
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
  }, [uuid, name]);

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

  useEffect(() => {
    const onNewUserAdded = (users: Player[]) => {
      console.log('new  users', users);
      dispatch(
        updatePlayers(
          users
            .filter((p) => p.uuid !== uuid)
            .map((p) => ({ ...p, isPlaying: false }))
        )
      );
    };

    if (socket && uuid && name) {
      socket.emit(EmitTypes.ONLINE, {
        uuid: uuid,
        name: name,
      });

      socket.on(EmitTypes.NEW_USER, onNewUserAdded);

      socket?.on(EmitTypes.USER_JOINED_ROOM, (msg) => {
        console.log('USER_JOINED_ROOM:', msg);
      });

      socket?.on(EmitTypes.USER_LEFT_ROOM, (msg) => {
        console.log('USER_LEFT_ROOM:', msg);
      });

      socket.on(EmitTypes.NEW_MESSAGE_IN_ROOM, (msgObj) => {
        console.log('NEW_MESSAGE_IN_ROOM', msgObj);
        dispatch(
          appendMessage({
            isIncoming: true,
            message: msgObj.message,
          })
        );
      });
    }

    // return () => {
    //   console.log('ROOT CLEANING UP');
    //   // socket?.off(EmitTypes.NEW_USER, onNewUserAdded);
    //   socket?.disconnect(true);
    // };

    return () => {
      console.log('ROOT CLEANING UP');
      window.addEventListener('unload', function () {
        socket?.disconnect(true);
        console.log('UNLOADED');
      });
    };
  }, [socket, uuid, name]);

  const emitMessage = (msg: string) => {
    socket?.emit(EmitTypes.EMIT_MESSAGE, {
      from: { uuid: uuid, name: name },
      message: msg,
    });
  };

  const createOrJoinRoom = (room: string) => {
    console.log('Creaing room on UI', room);
    socket?.emit(EmitTypes.CREATE_OR_JOIN_ROOM, room.trim());
  };

  const sendMessageToRoom = (msg: string, room: string) => {
    socket?.emit(EmitTypes.SEND_MESSAGE_TO_ROOM, {
      room: room,
      from: {
        uuid,
        name,
      },
      message: msg,
    });
  };

  return (
    <SocketContext.Provider
      value={{ socket, emitMessage, createOrJoinRoom, sendMessageToRoom }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
