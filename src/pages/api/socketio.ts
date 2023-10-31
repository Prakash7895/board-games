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

      socket.on('disconnect', function (reason) {
        console.log('Got disconnect!', reason);
        console.log('Got disconnect! DESC', socket.data);
        const idx = sockets.findIndex((s) => s.uuid === socket.data.uuid);
        console.log('disconnect idx', idx);
        if (idx >= 0) {
          sockets.splice(idx, 1);
        }
        socket.broadcast.emit(EmitTypes.NEW_USER, sockets);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}