import { ButtonProps, ButtonTypes } from '@/types';
import React from 'react';

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = ButtonTypes.primary,
}) => {
  return (
    <button
      className={type == ButtonTypes.primary ? 'btn glass !btn-warning' : 'btn btn-neutral'}
      // className='bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded hover:shadow-sm hover:shadow-orange-300'
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
