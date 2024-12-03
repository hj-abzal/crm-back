import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;

    const { statusCode } = res;
    const contentLength = res.get('content-length');
    this.logger.log(
      `${method} ${originalUrl} ${statusCode} ${
        contentLength || 0
      } - ${userAgent} ${ip}`,
    );

    next();
  }
}
