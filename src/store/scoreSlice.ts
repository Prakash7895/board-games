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
      { payload }: PayloadAction<PlayerTurn>
    ) => {
      state[`player${payload}`] = state[`player${payload}`] + 1;
    },
    resetScoreState: () => initialState,
  },
});

export const { updateScore, resetScoreState } = scoreSlice.actions;

export const scoreState = (state: RootState) => state.scoreSlice;

export default scoreSlice.reducer;
