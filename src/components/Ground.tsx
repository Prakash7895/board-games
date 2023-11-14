import React from 'react';
import Tikadi from './Tikadi';
import Marbles from './Marbles';

const Ground = () => {
  return (
    <div className='flex-1 flex flex-col lg:flex-row gap-10'>
      <Marbles />
      <Tikadi />
    </div>
  );
};

export default Ground;
