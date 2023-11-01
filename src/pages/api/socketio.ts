// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { EmitTypes, NextApiResponseServerIO } from '@/types';

const sockets: { uuid: string; name: string }[] = [];

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
        socket.data.uuid = data.uuid;
        socket.data.name = data.name;
        const idx = sockets.findIndex((el) => el.uuid === data.uuid);
        if (idx === -1) {
          sockets.push(data);
        }
        socket.emit(EmitTypes.NEW_USER, sockets);
        socket.broadcast.emit(EmitTypes.NEW_USER, sockets);
      });

      socket.on(EmitTypes.EMIT_MESSAGE, (msg) => {
        socket.broadcast.emit(EmitTypes.NEW_MESSAGE, msg);
      });

      socket.on(EmitTypes.CREATE_OR_JOIN_ROOM, async (room) => {
        console.log(socket.data.name, 'joining room', room);
        await socket.join(room);
        socket.data.room = room;

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
        console.log('clientsArr:', clientsArr);

        socket.to(room).emit(EmitTypes.USER_JOINED_ROOM, clientsArr);
        // socket.to(socket.id).emit(EmitTypes.USER_JOINED_ROOM, clientsArr);
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
        const idx = sockets.findIndex((s) => s.uuid === socket.data.uuid);
        console.log('disconnect idx', idx);
        if (idx >= 0) {
          sockets.splice(idx, 1);
        }
        socket
          .to(socket.data.room)
          .emit(EmitTypes.USER_LEFT_ROOM, 'USER LEFT THE ROOM...');
        socket.broadcast.emit(EmitTypes.NEW_USER, sockets);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
