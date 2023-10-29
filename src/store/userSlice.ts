import { getValueFromLocalStorage } from '@/utils';
import { RootState } from '.';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  uuid: string;
}

const initialState: UserState = {
  name: '',
  uuid: getValueFromLocalStorage('uuid') ?? '',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (
      state: UserState,
      { payload }: PayloadAction<Partial<UserState>>
    ) => {
      if (payload.name) {
        state.name = payload.name;
      }
      if (payload.uuid) {
        state.uuid = payload.uuid;
      }
    },
    resetUserState: () => initialState,
  },
});

export const { updateUser, resetUserState } = userSlice.actions;

export const userState = (state: RootState) => state.userSlice;

export default userSlice.reducer;
