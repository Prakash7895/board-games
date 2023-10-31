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

export enum EmitTypes {
  ONLINE = 'online',
  NEW_USER = 'new-user',
  NEW_MESSAGE = 'new-message',
  EMIT_MESSAGE = 'emit-message',
}