import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';
import {
  MarblePositions,
  OpponentType,
  PlayerTurn,
  Position,
  SelectedMarbles,
} from '@/types';
import { checkIfWon, getNextPossibleTikadiPositions, getRandom } from '@/utils';

interface TikadiState {
  turn: PlayerTurn;
  winner: PlayerTurn | -1;
  player1: MarblePositions;
  player2: MarblePositions;
  opponentType: OpponentType;
  selectedMarble: SelectedMarbles | -1;
  nextPossiblePositions: Position[];
}

interface updatePositionPayload {
  position: Position;
  playerNumber: 1 | 2;
  marbleNumber: 0 | 1 | 2;
}

const initialState: TikadiState = {
  winner: -1,
  selectedMarble: 1,
  player1: [-1, -1, -1],
  player2: [-1, -1, -1],
  turn: PlayerTurn.currentPlayer,
  opponentType: OpponentType.bot,
  nextPossiblePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

export const tikadiSlice = createSlice({
  name: 'tikadi',
  initialState,
  reducers: {
    updatePosition: (
      state: TikadiState,
      { payload }: PayloadAction<updatePositionPayload>
    ) => {
      let updatedPosition: MarblePositions = [
        ...state[`player${payload.playerNumber}`],
      ];

      updatedPosition[payload.marbleNumber] = payload.position;

      state[`player${payload.playerNumber}`] = updatedPosition;
    },
    moveToSelectedPosition: (
      state: TikadiState,
      payload: PayloadAction<number>
    ) => {
      let updatedPosition: MarblePositions = [...state[`player${state.turn}`]];
      updatedPosition[state.selectedMarble - 1] = payload.payload as Position;

      state[`player${state.turn}`] = updatedPosition;

      const winCheck = checkIfWon(updatedPosition) >= 0;
      console.log('WIN Check', winCheck);

      if (winCheck) {
        state.winner = state.turn;
      } else {
        state.turn =
          state.turn === PlayerTurn.currentPlayer
            ? PlayerTurn.otherPlayer
            : PlayerTurn.currentPlayer;

        const idx = state[`player${state.turn}`].findIndex((el) => el < 0);
        state.selectedMarble = (idx < 0 ? idx : idx + 1) as SelectedMarbles;

        if (state.selectedMarble > 0) {
          const nextPos = getNextPossibleTikadiPositions();
          state.nextPossiblePositions = nextPos.filter((el) => {
            if ([...state.player1, ...state.player2].includes(el as Position)) {
              return false;
            }
            return true;
          }) as Position[];
        } else {
          state.nextPossiblePositions = [];
        }
      }
    },
    selectMarble: (
      state: TikadiState,
      { payload }: PayloadAction<SelectedMarbles>
    ) => {
      state.selectedMarble = payload;
      const currPos = state[`player${state.turn}`][state.selectedMarble - 1];
      const nextPos = getNextPossibleTikadiPositions(currPos as Position);
      state.nextPossiblePositions = nextPos.filter((el) => {
        if ([...state.player1, ...state.player2].includes(el as Position)) {
          return false;
        }
        return true;
      }) as Position[];
    },
    initializeGame: (
      state: TikadiState,
      {
        payload,
      }: PayloadAction<{
        opponentType: OpponentType;
      }>
    ) => {
      const turn = getRandom(1, 3);
      return {
        ...initialState,
        opponentType: payload.opponentType,
        turn: turn === 1 ? PlayerTurn.currentPlayer : PlayerTurn.otherPlayer,
      };
    },
    resetTikadiState: () => initialState,
  },
});

export const {
  initializeGame,
  selectMarble,
  updatePosition,
  resetTikadiState,
  moveToSelectedPosition,
} = tikadiSlice.actions;

export const tikadiState = (state: RootState) => state.tikadiSlice;

export default tikadiSlice.reducer;