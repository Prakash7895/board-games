import { ReactNode } from 'react';
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export enum ButtonTypes {
  primary = 1,
  secondary = 2,
}

export interface ButtonProps {
  label: string;
  type?: ButtonTypes;
  onClick: () => void;
}

export interface DialogProps {
  children: ReactNode;
}

export interface OverlayProps {
  children: ReactNode;
}

export interface InputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

export interface Message {
  message: string;
  isIncoming: boolean;
}

export enum PlayerTurn {
  currentPlayer = 1,
  otherPlayer = 2,
}

export type Position = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type MarblePositions = [-1 | Position, -1 | Position, -1 | Position];

export type SelectedMarbles = 1 | 2 | 3;

export enum OpponentType {
  bot = 'bot',
  player = 'player',
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface AlertConfirmationProps {
  show: boolean;
  children: ReactNode;
  firstButtonText?: string;
  secondButtonText?: string;
  firstButtonHandler?: () => void;
  secondButtonHandler?: () => void;
}

export enum EmitTypes {
  ONLINE = 'online',
  NEW_USER = 'new-user',
  LEAVE_ROOM = 'leave-room',
  PLAY_AGAIN = 'play-again',
  NEW_MESSAGE = 'new-message',
  EMIT_MESSAGE = 'emit-message',
  USER_LEFT_ROOM = 'user-left-room',
  REQUEST_TO_PLAY = 'request-to-play',
  RESET_GAME_STATE = 'reset-game-state',
  USER_JOINED_ROOM = 'user-joined-room',
  ACCEPT_INVITATION = 'accept-invitation',
  CANCEL_INVITATION = 'cancel-invitation',
  GAME_STATE_CHANGE = 'game-state-change',
  UPDATE_GAME_STATE = 'update-game-state',
  CREATE_OR_JOIN_ROOM = 'create-or-join-room',
  NEW_MESSAGE_IN_ROOM = 'new-message-in-room',
  SEND_MESSAGE_TO_ROOM = 'send-message-to-room',
}

export interface cbArgs {
  status: boolean;
  message?: string;
}
