import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';
import { LoggingMiddleware } from './logging.middleware';

@Global()
@Module({
  providers: [AppLoggerService, LoggingMiddleware],
  exports: [AppLoggerService, LoggingMiddleware],
})
export class LoggerModule {}
