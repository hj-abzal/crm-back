// authenticated-socket-io.adapter.ts

import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(AuthenticatedSocketIoAdapter.name);

  constructor(
    private app: INestApplication,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): Server {
    const server: Server = super.createIOServer(port, options);

    server.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        this.logger.error("No token provided")
        return next(new Error('No token provided'));
      }

      try {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          this.logger.error("JWT_SECRET not found")
          throw new Error('JWT_SECRET not found');
        }

        // Verify token
        const payload = this.jwtService.verify(token, { secret });

        // Optionally attach user payload to socket
        (socket as any).user = payload;

        next();
      } catch (err) {
        this.logger.error("Invalid or expired token")
        next(new Error('Invalid or expired token'));
      }
    });

    return server;
  }
}
