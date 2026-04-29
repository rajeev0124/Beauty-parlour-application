import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from './app-logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Log request
    this.logger.debug(`Incoming ${req.method} ${req.url}`);

    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.logRequest(req, res, duration);
    });

    next();
  }
}
