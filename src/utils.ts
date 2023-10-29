import { MarblePositions, Position, SelectedMarbles } from './types';

export const getValueFromLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const setValueToLocalStorage = (key: string, value: string | number) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const allPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const getNextPossibleTikadiPositions = (num?: Position) => {
  switch (num) {
    case 1:
      return [2, 4, 5];

    case 2:
      return [1, 3, 5];

    case 3:
      return [2, 5, 6];

    case 4:
      return [1, 5, 7];

    case 5:
      return [1, 2, 3, 4, 6, 7, 8, 9];

    case 6:
      return [3, 5, 9];

    case 7:
      return [4, 5, 8];

    case 8:
      return [5, 7, 9];

    case 9:
      return [5, 6, 8];

    default:
      return allPositions;
  }
};

const winningPositions = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],

  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],

  [1, 5, 9],
  [3, 5, 7],
];

export const checkIfWon = (arr: MarblePositions) => {
  arr.sort();

  const idx = winningPositions.findIndex((el) => {
    if (el.join('') === arr.join('')) {
      return true;
    }
    return false;
  });

  return idx;
};

export const getRandom = (min: number, max: number) => {
  return Math.floor(min + Math.random() * (max - min));
};

export const getNextMove: (
  myPos: MarblePositions,
  otherPos: MarblePositions
) => [Position, SelectedMarbles | -1] = (myPos, otherPos) => {
  const idx = myPos.findIndex((el) => el < 0);
  if (idx >= 0) {
    const emptyPos = allPositions.filter((el) => {
      if ([...myPos, ...otherPos].includes(el as Position)) {
        return false;
      }
      return true;
    });

    return [emptyPos[getRandom(0, emptyPos.length)] as Position, -1];
  } else {
    const posObj: any = {};
    const marbles: SelectedMarbles[] = [];
    for (let i = 0; i < myPos.length; i++) {
      const val = getNextPossibleTikadiPositions(myPos[i] as Position).filter(
        (el) => ![...myPos, ...otherPos].includes(el as Position)
      );
      if (val.length) {
        posObj[`pos${i + 1}`] = val;
        marbles.push((i + 1) as SelectedMarbles);
      }
    }

    const randomMarble = getRandom(0, marbles.length);
    const possiblePositions = posObj[`pos${marbles[randomMarble]}`];
    const randomPos = getRandom(0, possiblePositions.length);

    return [possiblePositions[randomPos] as Position, marbles[randomMarble]];
  }
};

const getUniqueId = () => {
  const since2023 = (new Date().getTime() - new Date('01/01/2023').getTime())
    .toString()
    .split('');

  const charToAdd = 4;
  const arrLength = since2023.length;
  const interval = Math.floor(arrLength / charToAdd);
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < charToAdd; i++) {
    const randomIdx = getRandom(
      Math.max(arrLength - (i + 1) * interval, 0),
      arrLength - i * interval
    );
    const randomChar = getRandom(0, 26);
    since2023.splice(randomIdx, 0, alphabet[randomChar]);
  }
  return since2023.join('');
};

export const getUniqueRoomName = () => {
  return `room-${getUniqueId()}`;
};
