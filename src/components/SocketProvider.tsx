'use client';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import React, { useEffect, ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, userState } from '@/store/userSlice';
import { EmitTypes } from '@/types';
import { Player, updatePlayers } from '@/store/playerSlice';

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}

export const SocketContext = React.createContext<{
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  emitMessage: (message: string) => void;
}>({ socket: null, emitMessage: (msg: string) => {} });

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
    }

    return () => {
      console.log('CLEANING UP');
      // socket?.off(EmitTypes.NEW_USER, onNewUserAdded);
      socket?.disconnect(true);
    };
  }, [socket, uuid, name]);

  const emitMessage = (msg: string) => {
    socket?.emit(EmitTypes.EMIT_MESSAGE, {
      from: { uuid: uuid, name: name },
      message: msg,
    });
  };

  return (
    <SocketContext.Provider value={{ socket, emitMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;