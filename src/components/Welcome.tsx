'use client';
import { userState } from '@/store/userSlice';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import NameConfirmation from './NameConfirmation';
import Image from 'next/image';
import Tooltip from './Tooltip';

const Welcome = () => {
  const [show, setShow] = useState(false);
  const { name } = useSelector(userState);

  return (
    <div className='flex items-center justify-center gap-2'>
      {name && (
        <>
          Welcome, {name}{' '}
          <Tooltip tooltip='Edit Name'>
            <Image
              src={'/edit.svg'}
              alt='Edit Icon'
              width={24}
              height={24}
              className={`cursor-pointer`}
              onClick={() => setShow(true)}
            />
          </Tooltip>
        </>
      )}
      <NameConfirmation visible={show} onCancel={() => setShow(false)} />
    </div>
  );
};

export default Welcome;
