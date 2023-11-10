import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';
import {
  MarblePositions,
  OpponentType,
  PlayerTurn,
  Position,
  SelectedMarbles,
} from '@/types';
import { checkIfWon, getNextPossibleTikadiPositions } from '@/utils';

interface TikadiState {
  turn: PlayerTurn | -1;
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
  turn: -1,
  opponentType: OpponentType.bot,
  nextPossiblePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

export const tikadiSlice = createSlice({
  name: 'tikadi',
  initialState,
  reducers: {
    updateGameState: (
      state: TikadiState,
      {
        payload,
      }: PayloadAction<{
        player1: MarblePositions;
        player2: MarblePositions;
        turn: PlayerTurn;
      }>
    ) => {
      state.player1 = payload.player1;
      state.player2 = payload.player2;

      const idx = payload.player1.findIndex((el) => el < 0);
      state.selectedMarble = (idx < 0 ? idx : idx + 1) as SelectedMarbles;

      if (state.selectedMarble > 0) {
        const nextPos = getNextPossibleTikadiPositions();
        state.nextPossiblePositions = nextPos.filter((el) => {
          if ([...state.player1, ...state.player2].includes(el as Position)) {
            return false;
          }
          return true;
        }) as Position[];
      }

      const winCheckPlayer1 = checkIfWon([...state.player1]) >= 0;
      console.log('WIN Check Player 1', winCheckPlayer1);

      const winCheckPlayer2 = checkIfWon([...state.player2]) >= 0;
      console.log('WIN Check Player 2', winCheckPlayer2);
      if (winCheckPlayer1 || winCheckPlayer2) {
        state.winner = winCheckPlayer1
          ? PlayerTurn.currentPlayer
          : PlayerTurn.otherPlayer;
      } else {
        state.turn = payload.turn;
      }
    },
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
      if (state.turn !== -1) {
        let updatedPosition: MarblePositions = [
          ...state[`player${state.turn}`],
        ];
        updatedPosition[state.selectedMarble - 1] = payload.payload as Position;

        state[`player${state.turn}`] = updatedPosition;

        const winCheck = checkIfWon([...updatedPosition]) >= 0;

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
              if (
                [...state.player1, ...state.player2].includes(el as Position)
              ) {
                return false;
              }
              return true;
            }) as Position[];
          } else {
            state.nextPossiblePositions = [];
          }
        }
      }
    },
    selectMarble: (
      state: TikadiState,
      { payload }: PayloadAction<SelectedMarbles>
    ) => {
      state.selectedMarble = payload;
      if (state.turn !== -1) {
        const currPos = state[`player${state.turn}`][state.selectedMarble - 1];
        const nextPos = getNextPossibleTikadiPositions(currPos as Position);
        state.nextPossiblePositions = nextPos.filter((el) => {
          if ([...state.player1, ...state.player2].includes(el as Position)) {
            return false;
          }
          return true;
        }) as Position[];
      }
    },
    initializeGame: (
      state: TikadiState,
      {
        payload,
      }: PayloadAction<{
        opponentType: OpponentType;
        turn?: PlayerTurn | -1;
      }>
    ) => {
      const turn = payload.turn ? payload.turn : state.turn;
      return {
        ...initialState,
        opponentType: payload.opponentType,
        turn:
          turn === -1
            ? turn
            : turn === 1
            ? PlayerTurn.currentPlayer
            : PlayerTurn.otherPlayer,
      };
    },
    resetTikadiState: () => initialState,
  },
});

export const {
  selectMarble,
  initializeGame,
  updatePosition,
  updateGameState,
  resetTikadiState,
  moveToSelectedPosition,
} = tikadiSlice.actions;

export const tikadiState = (state: RootState) => state.tikadiSlice;

export default tikadiSlice.reducer;
