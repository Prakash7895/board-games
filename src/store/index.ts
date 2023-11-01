import { configureStore } from '@reduxjs/toolkit';
import playerSlice from './playerSlice';
import tikadiSlice from './tikadiSlice';
import scoreSlice from './scoreSlice';
import userSlice from './userSlice';
import duelSlice from './duelSlice';
import chatSlice from './chatSlice';

const store = configureStore({
  reducer: {
    playerSlice,
    tikadiSlice,
    scoreSlice,
    userSlice,
    duelSlice,
    chatSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
