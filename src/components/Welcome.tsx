'use client';
import { userState } from '@/store/userSlice';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import NameConfirmation from './NameConfirmation';

const Welcome = () => {
  const [show, setShow] = useState(false);
  const { name } = useSelector(userState);

  return (
    <div className='flex items-center justify-center gap-2'>
      Welcome, {name}{' '}
      <img
        title='Edit Name'
        src={'./edit.svg'}
        className={`w-6 h-6 cursor-pointer`}
        onClick={() => setShow(true)}
      />
      <NameConfirmation visible={show} onCancel={() => setShow(false)} />
    </div>
  );
};

export default Welcome;
