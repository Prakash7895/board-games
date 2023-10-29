import React from 'react';
import Tikadi from './Tikadi';
import Marbles from './Marbles';

const Ground = () => {
  return (
    <div className='flex-1 flex'>
      <Marbles />
      <Tikadi />
    </div>
  );
};

export default Ground;
