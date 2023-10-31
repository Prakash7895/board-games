'use client';
import { Message } from '@/types';
import React, { useEffect, useRef, useState } from 'react';

const ChatWindow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const value = localStorage.getItem('duel-room');
  const savedRoom = value ? JSON.parse(value) : null;

  const sendMessage = () => {
    if (message.trim().length) {
      setMessages((prev) =>
        prev.concat([{ message, isIncoming: !!(Math.random() < 0.5) }])
      );
      setMessage('');
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current?.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='border border-gray-600 overflow-hidden rounded-lg flex flex-col-reverse h-[30rem] min-w-[20rem]'>
      <div className='flex'>
        <input
          type='text'
          value={message}
          placeholder='Enter a message'
          onChange={(e) => setMessage(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
          className='input w-full max-w-xs bg-transparent !border-0 !outline-none !rounded-none !bg-custom-primary'
        />
        <button
          className='btn bg-custom-primary rounded-none border-0 btn-outline'
          onClick={sendMessage}
        >
          <svg
            width='40px'
            height='40px'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M20 4L13 21L10 14M20 4L12 7.29412M20 4L10 14M10 14L3 11L7 9.35294'
              stroke='#ccc'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>
      <div className='overflow-y-auto no-scrollbar flex-1 p-2' ref={ref}>
        {messages.length ? (
          <div className='flex flex-col'>
            {messages.map((el, idx) => (
              <div key={el.message + idx}>
                <p
                  className={`bg-stone-600 break-words whitespace-break-spaces my-2 p-1 px-2 rounded-lg w-4/5 ${
                    el.isIncoming
                      ? 'rounded-bl-none'
                      : 'rounded-br-none ml-auto'
                  } `}
                >
                  {el.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500 flex justify-center items-center h-full'>
            Your chat appears here...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
