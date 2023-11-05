import { RootState } from '.';
import { PlayerTurn } from '@/types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ScoreState {
  player1: number;
  player2: number;
}

const initialState: ScoreState = {
  player1: 0,
  player2: 0,
};

export const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    updateScore: (
      state: ScoreState,
      { payload }: PayloadAction<PlayerTurn | -1>
    ) => {
      if (payload !== -1) {
        state[`player${payload}`] = state[`player${payload}`] + 1;
      }
    },
    updatePlayersScores: (
      state: ScoreState,
      { payload }: PayloadAction<Partial<ScoreState>>
    ) => {
      if (payload.player1) {
        state.player1 = payload.player1;
      }
      if (payload.player2) {
        state.player2 = payload.player2;
      }
    },
    resetScoreState: () => initialState,
  },
});

export const { updateScore, resetScoreState, updatePlayersScores } =
  scoreSlice.actions;

export const scoreState = (state: RootState) => state.scoreSlice;

export default scoreSlice.reducer;
