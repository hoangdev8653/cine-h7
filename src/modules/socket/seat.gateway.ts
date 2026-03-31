import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SeatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinShowtime')
  handleJoinShowtime(
    @ConnectedSocket() client: Socket,
    @MessageBody() showtimeId: string,
  ) {
    client.join(`showtime_${showtimeId}`);
    console.log(`Client ${client.id} joined showtime_${showtimeId}`);
    return { event: 'joined', data: showtimeId };
  }

  @SubscribeMessage('selectSeat')
  async handleSelectSeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string; seatId: string; userId: string },
  ) {
    const { showtimeId, seatId, userId } = data;
    const lockKey = `seat_lock:${showtimeId}:${seatId}`;
    console.log("showtimeId", showtimeId);
    console.log("seatId", seatId);
    console.log("userId", userId);
    const locked = await this.redisService.setLock(lockKey, userId, 300);

    if (locked) {
      this.server.to(`showtime_${showtimeId}`).emit('seatSelected', {
        seatId,
        userId,
        status: 'locking',
      });
      return { status: 'success' };
    } else {
      return { status: 'failed', message: 'Seat already locked' };
    }
  }

  @SubscribeMessage('unselectSeat')
  async handleUnselectSeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string; seatId: string; userId: string },
  ) {
    const { showtimeId, seatId, userId } = data;
    console.log("showtimeId", showtimeId);
    console.log("seatId", seatId);
    console.log("userId", userId);
    const lockKey = `seat_lock:${showtimeId}:${seatId}`;
    const released = await this.redisService.releaseLock(lockKey, userId);
    if (released) {
      this.server.to(`showtime_${showtimeId}`).emit('seatUnselected', {
        seatId,
        userId,
      });
      return { status: 'success' };
    }
    return { status: 'failed', message: 'Not your lock' };
  }
}
