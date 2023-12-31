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
  restart: boolean;
  invitation: {
    from?: Player;
    to?: Player;
  } | null;
}

const initialState: DuelState = {
  room: '',
  otherPlayer: null,
  currentPlayer: null,
  state: GameState.waiting,
  restart: false, // to play another round
  invitation: null,
};

export const duelSlice = createSlice({
  name: 'duel',
  initialState,
  reducers: {
    updateRestartState: (
      state: DuelState,
      { payload }: PayloadAction<boolean>
    ) => {
      state.restart = payload;
    },
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
      return {
        ...state,
        room: payload,
      };
    },
    updateOnlineStatus: (
      state: DuelState,
      {
        payload,
      }: PayloadAction<{
        uuid: string;
        isOnline: boolean;
      }>
    ) => {
      if (state.currentPlayer && payload.uuid === state.currentPlayer?.uuid) {
        state.currentPlayer = {
          ...state.currentPlayer,
          isOnline: payload.isOnline,
        };
      } else if (
        state.otherPlayer &&
        payload.uuid === state.otherPlayer?.uuid
      ) {
        state.otherPlayer = {
          ...state.otherPlayer,
          isOnline: payload.isOnline,
        };
      }
    },
    updateInvitation: (
      state: DuelState,
      { payload }: PayloadAction<{ from?: Player; to?: Player } | null>
    ) => {
      state.invitation = payload;
    },
    resetDuelState: () => initialState,
  },
});

export const {
  startDuel,
  updateRoom,
  resetDuelState,
  updateInvitation,
  updateOnlineStatus,
  updateRestartState,
  updateCurrentPlayer,
  updateOpponentPlayer,
} = duelSlice.actions;

export const duelState = (state: RootState) => state.duelSlice;

export default duelSlice.reducer;
