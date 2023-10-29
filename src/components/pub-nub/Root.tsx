'use client';

import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { updatePlayers } from '@/store/playerSlice';
import { userState } from '@/store/userSlice';

const rootChannelName = ['rootChannel'];

const Root = () => {
  const dispatch = useDispatch();
  const { name, uuid } = useSelector(userState);

  const [message, setMessage] = useState('');
  const [messages, addMessage] = useState<string[]>([]);

  const handleMessage = (event: any) => {
    const message = event.message;
    if (typeof message === 'string' || message.hasOwnProperty('text')) {
      const text = message.text || message;
      addMessage((messages) => [...messages, text]);
    }
  };

  const dispatchPlayers = (
    players: {
      uuid: string;
      state?: any;
    }[]
  ) =>
    dispatch(
      updatePlayers(
        players
          .filter((p) => p.state && p.uuid !== uuid)
          .map((p) => ({
            isPlaying: false,
            name: p.state.name,
            uuid: p.uuid,
          }))
      )
    );

  return (
    <>
      {/* <div>
        <div>React Chat Example</div>
        <div>
          {messages.map((message, index) => {
            return <div key={`message-${index}`}>{message}</div>;
          })}
        </div>
        <div>
          <input
            type='text'
            placeholder='Type your message'
            value={message}
            onKeyPress={(e) => {
              if (e.key !== 'Enter') return;
              sendMessage(message);
            }}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              sendMessage(message);
            }}
          >
            Send Message
          </button>
        </div>
      </div> */}
    </>
  );
};

export default Root;
