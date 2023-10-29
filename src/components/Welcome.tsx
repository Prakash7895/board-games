'use client';
import { userState } from '@/store/userSlice';
import React from 'react';
import { useSelector } from 'react-redux';

const Welcome = () => {
  const { name } = useSelector(userState);
  return <div>Welcome, {name}</div>;
};

export default Welcome;
