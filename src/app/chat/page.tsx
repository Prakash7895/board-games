'use client';
import { SocketContext } from '@/components/SocketProvider';
import { EmitTypes } from '@/types';
import React, { useState, useContext, useEffect } from 'react';

const Chat = () => {
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const { socket, emitMessage } = useContext(SocketContext);

  useEffect(() => {
    const msgHandler = (msg: string) => {
      setMessages((prev) => [msg, ...prev]);
    };
    socket?.on(EmitTypes.NEW_MESSAGE, msgHandler);

    return () => {
      socket?.off(EmitTypes.NEW_MESSAGE, msgHandler);
    };
  }, [socket]);

  const sendMessage = (msg: string) => {
    emitMessage(msg);
    setMessage('');
  };

  return (
    <div className='h-screen flex flex-col p-10 w-1/2'>
      <input
        value={userName}
        placeholder='Enter user name'
        className='input text-black'
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        value={message}
        placeholder='Enter Message'
        className='input text-black'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage(message);
          }
        }}
        onChange={(e) => setMessage(e.target.value)}
      />
      {messages.map((m, idx) => {
        return (
          <p key={m?.from?.uuid + idx}>{m?.from?.name + ' => ' + m.message}</p>
        );
      })}
    </div>
  );
};

export default Chat;
