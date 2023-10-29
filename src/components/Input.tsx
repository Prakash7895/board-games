import { InputProps } from '@/types';
import React, { useState } from 'react';

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  required,
  placeholder,
  labelClassName = '',
  className = 'bg-gray-600',
}) => {
  const [touched, setTouched] = useState(false);

  let hasError = false;
  if (touched && required) {
    hasError = !value.trim().length;
  }

  return (
    <label className={labelClassName}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`outline-none px-2 py-1.5 text-white w-full border-b-2 focus:border-orange-500 border-gray-400 ${
          hasError ? 'border !border-red-600 ' : ''
        } ${className}`}
        onBlur={() => setTouched(true)}
      />
    </label>
  );
};

export default Input;
