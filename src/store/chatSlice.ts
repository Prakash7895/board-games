import { Message } from '@/types';
import { RootState } from '.';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ChatState {
  chats: Message[];
}

const initialState: ChatState = {
  chats: [],
};

export const chatSlice = createSlice({
  name: 'duel',
  initialState,
  reducers: {
    appendMessage: (state: ChatState, { payload }: PayloadAction<Message>) => {
      state.chats = [...state.chats, payload];
    },
    resetChatState: () => initialState,
  },
});

export const { appendMessage, resetChatState } = chatSlice.actions;

export const chatState = (state: RootState) => state.chatSlice;

export default chatSlice.reducer;
