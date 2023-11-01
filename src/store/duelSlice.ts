import { RootState } from '.';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface Player {
  name: string;
  uuid: string;
  isOnline: boolean;
}

enum GameState {
  waiting = 1,
  started = 2,
}

interface DuelState {
  currentPlayer: Player | null;
  otherPlayer: Player | null;
  state: GameState;
  room: string;
}

const initialState: DuelState = {
  room: '',
  otherPlayer: null,
  currentPlayer: null,
  state: GameState.waiting,
};

export const duelSlice = createSlice({
  name: 'duel',
  initialState,
  reducers: {
    updateCurrentPlayer: (
      state: DuelState,
      { payload }: PayloadAction<Player>
    ) => {
      state.currentPlayer = payload;
    },
    updateOpponentPlayer: (
      state: DuelState,
      { payload }: PayloadAction<Player>
    ) => {
      state.otherPlayer = payload;
    },
    startDuel: (state: DuelState) => {
      state.state = GameState.started;
    },
    updateRoom: (state: DuelState, { payload }: PayloadAction<string>) => {
      // console.log('updateRoom', payload);
      return {
        ...state,
        room: payload,
      };
    },
    resetDuelState: () => initialState,
  },
});

export const {
  startDuel,
  updateRoom,
  resetDuelState,
  updateCurrentPlayer,
  updateOpponentPlayer,
} = duelSlice.actions;

export const duelState = (state: RootState) => state.duelSlice;

export default duelSlice.reducer;
