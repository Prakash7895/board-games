'use client';
import Input from './Input';
import Button from './Button';
import Dialog from './Dialog';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, userState } from '@/store/userSlice';
import React, { useEffect, useState } from 'react';
import { ButtonTypes } from '@/types';

const NameConfirmation: React.FC<{
  visible?: boolean;
  onCancel?: () => void;
}> = ({ visible = false, onCancel }) => {
  const { name: currName } = useSelector(userState);
  const [name, setName] = useState(currName);
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const value = localStorage.getItem('name');
    const savedName = value ? JSON.parse(value) : null;

    setShow(!savedName);
    if (savedName) {
      dispatch(
        updateUser({
          name: savedName,
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    setName(currName);
  }, [currName, visible]);

  return show || visible ? (
    <Dialog>
      <div className='flex flex-col gap-4 py-2'>
        <Input
          placeholder='Enter Name'
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <div className='text-right flex items-center gap-3 justify-end'>
          <Button
            label='Cancel'
            type={ButtonTypes.secondary}
            onClick={() => {
              onCancel && onCancel();
            }}
          />
          <Button
            label='Ok'
            onClick={() => {
              if (name.trim().length) {
                setShow(false);
                localStorage.setItem('name', JSON.stringify(name.trim()));
                dispatch(
                  updateUser({
                    name: name.trim(),
                  })
                );
                onCancel && onCancel();
              }
            }}
          />
        </div>
      </div>
    </Dialog>
  ) : null;
};

export default NameConfirmation;
