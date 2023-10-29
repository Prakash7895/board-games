import { OverlayProps } from '@/types';
import React from 'react';

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  return (
    <>
      <div className='absolute top-0 left-0 bottom-0 right-0 bg-black opacity-40'></div>
      <div className='absolute top-0 left-0 bottom-0 right-0 bg-transparent flex justify-center items-center z-[100]'>
        {children}
      </div>
    </>
  );
};

export default Overlay;
