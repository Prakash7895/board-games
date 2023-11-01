import { RootState } from '.';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface Player {
  name: string;
  uuid: string;
  isPlaying: boolean;
}

interface PlayersState {
  players: Player[];
}

const initialState: PlayersState = {
  players: [],
};

export const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    updatePlayers: (
      state: PlayersState,
      { payload }: PayloadAction<Player[]>
    ) => {
      state.players = payload;
    },
    resetPlayerState: () => initialState,
  },
});

export const { updatePlayers, resetPlayerState } = playerSlice.actions;

export const playerState = (state: RootState) => state.playerSlice;

export default playerSlice.reducer;
