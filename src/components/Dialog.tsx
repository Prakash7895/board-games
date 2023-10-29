import { DialogProps } from '@/types';
import React from 'react';
import Overlay from './Overlay';

const Dialog: React.FC<DialogProps> = ({ children }) => {
  return (
    <Overlay>
      <div className='bg-gray-700 min-w-[300px] rounded-lg px-4 py-2'>{children}</div>
    </Overlay>
  );
};

export default Dialog;
