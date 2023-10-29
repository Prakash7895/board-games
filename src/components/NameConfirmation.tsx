'use client';
import Input from './Input';
import Button from './Button';
import Dialog from './Dialog';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/store/userSlice';
import React, { useEffect, useState } from 'react';
import { setValueToLocalStorage, getValueFromLocalStorage } from '@/utils';

const NameConfirmation = () => {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();

  const savedName = getValueFromLocalStorage('name');

  useEffect(() => {
    setShow(!savedName);
    if (savedName) {
      dispatch(
        updateUser({
          name: savedName,
        })
      );
    }
  }, [savedName]);

  return show ? (
    <Dialog>
      <div className='flex flex-col gap-4 py-2'>
        <Input
          placeholder='Enter Name'
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <div className='text-right'>
          <Button
            label='Ok'
            onClick={() => {
              if (name.trim().length) {
                setShow(false);
                setValueToLocalStorage('name', name.trim());
                dispatch(
                  updateUser({
                    name: name.trim(),
                  })
                );
              }
            }}
          />
        </div>
      </div>
    </Dialog>
  ) : null;
};

export default NameConfirmation;
