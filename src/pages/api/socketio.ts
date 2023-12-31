// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import {
  EmitTypes,
  MarblePositions,
  NextApiResponseServerIO,
  Position,
} from '@/types';
import { checkIfWon, getRandom } from '@/utils';

const userArr: { uuid: string; name: string; isPlaying: boolean }[] = [];

interface IWinner {
  [key: string]: number;
}

const rooms: {
  [key: string]: {
    [k: string]: MarblePositions | string | IWinner;
  };
} = {};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket?.server.io) {
    console.log('New Socket.io server...');

    const httpServer: NetServer = res.socket.server as any;

    const io = new ServerIO(httpServer);

    io.on('connection', (socket) => {
      socket.on(EmitTypes.ONLINE, (data) => {
        console.log('NEW ONLINE', data);
        socket.data.uuid = data.uuid;
        socket.data.name = data.name;
        const idx = userArr.findIndex((el) => el.uuid === data.uuid);
        if (idx === -1) {
          userArr.push({ ...data, isPlaying: false });
        }
        socket.emit(EmitTypes.NEW_USER, userArr);
        socket.broadcast.emit(EmitTypes.NEW_USER, userArr);
      });

      const getRoomUser = (room: string) => {
        const clients = io.sockets.adapter.rooms.get(room);
        const idsArr = clients ? Array.from(clients) : [];

        const clientsArr = [];
        for (let i = 0; i < idsArr.length; i++) {
          const client = io.sockets.sockets.get(idsArr[i]);
          clientsArr.push({
            uuid: client?.data.uuid,
            name: client?.data.name,
          });
        }

        return clientsArr;
      };

      socket.on(EmitTypes.EMIT_MESSAGE, (msg) => {
        socket.broadcast.emit(EmitTypes.NEW_MESSAGE, msg);
      });

      socket.on(EmitTypes.CREATE_OR_JOIN_ROOM, async (room, cb) => {
        console.log(socket.data.name, 'joining room', room);
        if (socket.data) {
          const clients = io.sockets.adapter.rooms.get(room);

          const idsArr = clients ? Array.from(clients) : [];
          console.log('idsArr: ', idsArr);

          if (idsArr.length >= 2) {
            cb &&
              cb({
                status: false,
                message: 'Room is already full.',
              });
          } else {
            await socket.join(room);
            socket.data.room = room;

            const clientsArr = getRoomUser(room);
            console.log('clientsArr:', clientsArr);

            io.sockets.in(room).emit(EmitTypes.USER_JOINED_ROOM, clientsArr);
            if (
              clientsArr.length === 2 &&
              (!(room in rooms) || (room in rooms && rooms[room].winner))
            ) {
              rooms[room] = {
                winner: '',
                [clientsArr[0].uuid]: [-1, -1, -1],
                [clientsArr[1].uuid]: [-1, -1, -1],
                turn: getRandom(0, 2) ? clientsArr[0].uuid : clientsArr[1].uuid,
                scores: {
                  [clientsArr[0].uuid]: 0,
                  [clientsArr[1].uuid]: 0,
                },
              };
              io.sockets
                .in(room)
                .emit(EmitTypes.GAME_STATE_CHANGE, rooms[room]);
            }
            if (clientsArr.length === 2 && room in rooms) {
              io.sockets
                .in(room)
                .emit(EmitTypes.GAME_STATE_CHANGE, rooms[room]);
            }

            cb && cb({ status: true });

            const idx = userArr.findIndex((u) => u.uuid === socket.data.uuid);
            if (idx >= 0) {
              userArr[idx] = {
                ...userArr[idx],
                isPlaying: true,
              };
            }
            socket.broadcast.emit(EmitTypes.NEW_USER, userArr);
          }
        }
      });

      socket.on(EmitTypes.PLAY_AGAIN, (room) => {
        socket.to(room).emit(EmitTypes.PLAY_AGAIN, {
          uuid: socket.data.uuid,
          name: socket.data.name,
        });
      });

      socket.on(EmitTypes.LEAVE_ROOM, async (room) => {
        const clientsArr = getRoomUser(room);

        await socket.leave(room);
        console.log('LEFT ROOM DATA', socket.data);

        const idx = userArr.findIndex((u) => u.uuid === socket.data.uuid);
        console.log('LEAVE_ROOM', idx);
        if (idx >= 0) {
          userArr[idx] = {
            ...userArr[idx],
            isPlaying: false,
          };
        }

        let winner = '';
        for (let i = 0; i < clientsArr.length; i++) {
          if (clientsArr[i].uuid) {
            const uuid = clientsArr[i].uuid;
            const win = checkIfWon([...(rooms[room][uuid] as MarblePositions)]);
            if (win >= 0) {
              winner = uuid;
            }
          }
        }

        const scores = { ...((rooms[room]?.scores ?? {}) as IWinner) };

        if (winner) {
          rooms[room] = {
            ...rooms[room],
            [clientsArr[0].uuid]: [-1, -1, -1],
            [clientsArr[1].uuid]: [-1, -1, -1],
            winner,
            scores: {
              ...scores,
              [winner]: scores[winner] + 1,
            },
          };

          io.sockets.in(room).emit(EmitTypes.GAME_STATE_CHANGE, rooms[room]);
        }

        socket.broadcast.emit(EmitTypes.NEW_USER, userArr);

        socket.to(room).emit(EmitTypes.USER_LEFT_ROOM, {
          uuid: socket.data.uuid,
          name: socket.data.name,
        });
      });

      socket.on(EmitTypes.RESET_GAME_STATE, (obj, cb) => {
        const { room } = obj;
        console.log('RESET_GAME_STATE');

        if (room in rooms) {
          console.log('RESET_GAME_STATE if');
          const clientsArr = getRoomUser(room);

          if (clientsArr.length < 2) {
            console.log('RESET_GAME_STATE if if');
            cb && cb({ status: false, message: 'User left the room.' });
          } else {
            console.log('RESET_GAME_STATE if else');
            rooms[room] = {
              winner: '',
              [clientsArr[0].uuid]: [-1, -1, -1],
              [clientsArr[1].uuid]: [-1, -1, -1],
              turn: getRandom(0, 2) ? clientsArr[0].uuid : clientsArr[1].uuid,
              scores: {
                [clientsArr[0].uuid]: 0,
                [clientsArr[1].uuid]: 0,
              },
            };

            cb && cb({ status: true });

            io.sockets.in(room).emit(EmitTypes.GAME_STATE_CHANGE, rooms[room]);
          }
        }
      });

      socket.on(EmitTypes.UPDATE_GAME_STATE, (newState) => {
        const { playerUUID, marbleNum, newPos, room, turn } = newState;
        console.log('UPDATE_GAME_STATE', newState);

        const updatedPos = [...(rooms[room][playerUUID] as MarblePositions)];
        updatedPos[marbleNum - 1] = newPos as Position;

        const clientsArr = getRoomUser(room);
        let winner = '';
        for (let i = 0; i < clientsArr.length; i++) {
          if (clientsArr[i].uuid) {
            const uuid = clientsArr[i].uuid;
            const win = checkIfWon([...(rooms[room][uuid] as MarblePositions)]);
            if (win >= 0) {
              winner = uuid;
            }
          }
        }

        const scores = { ...(rooms[room].scores as IWinner) };
        if (winner) {
          scores[winner] = scores[winner] + 1;
        }

        rooms[room] = {
          ...rooms[room],
          [playerUUID]: [...updatedPos],
          turn: turn,
          winner,
          scores,
        };

        console.log('UPDATED ROOM STATE:', rooms[room]);

        io.sockets.in(room).emit(EmitTypes.GAME_STATE_CHANGE, rooms[room]);
      });

      socket.on(EmitTypes.REQUEST_TO_PLAY, (obj) => {
        const { to, uuid, name } = obj;

        socket.broadcast.emit(EmitTypes.REQUEST_TO_PLAY, {
          from: {
            uuid: uuid,
            name: name,
          },
          to: to,
        });
      });

      socket.on(EmitTypes.CANCEL_INVITATION, (obj) => {
        socket.broadcast.emit(EmitTypes.CANCEL_INVITATION, obj);
      });

      socket.on(EmitTypes.ACCEPT_INVITATION, (obj) => {
        socket.broadcast.emit(EmitTypes.ACCEPT_INVITATION, obj);
      });

      socket.on(EmitTypes.SEND_MESSAGE_TO_ROOM, (roomMsgObj) => {
        socket.to(roomMsgObj.room).emit(EmitTypes.NEW_MESSAGE_IN_ROOM, {
          message: roomMsgObj.message,
          from: roomMsgObj.from,
        });
      });

      socket.on('disconnect', function (reason) {
        console.log('Got disconnect!', reason);
        console.log('Got disconnect! DESC', socket.data);
        const idx = userArr.findIndex((s) => s.uuid === socket.data.uuid);
        console.log('disconnect idx', idx);
        if (idx >= 0) {
          userArr.splice(idx, 1);
        }
        socket.leave(socket.data.room);
        socket.to(socket.data.room).emit(EmitTypes.USER_LEFT_ROOM, {
          name: socket.data.name,
          uuid: socket.data.uuid,
        });
        socket.broadcast.emit(EmitTypes.NEW_USER, userArr);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
