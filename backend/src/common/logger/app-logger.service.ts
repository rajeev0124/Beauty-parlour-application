import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import { join } from 'path';
import { Request, Response } from 'express';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface AuthenticatedRequest extends Request {
  user?: { sub?: string };
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  data?: Record<string, unknown>;
  traceId?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context?: string;
  private logStream: any;
  private readonly logsDir = join(process.cwd(), 'logs');

  constructor() {
    // Ensure logs directory exists
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }

    // Create daily log file
    const date = new Date().toISOString().split('T')[0];
    const logFile = join(this.logsDir, `app-${date}.log`);
    this.logStream = createWriteStream(logFile, { flags: 'a' });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    this.writeLog(LogLevel.ERROR, message, context, { trace });
  }

  warn(message: any, context?: string): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  debug(message: any, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog(LogLevel.DEBUG, message, context);
    }
  }

  verbose(message: any, context?: string): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  private writeLog(
    level: LogLevel,
    message: string | Record<string, unknown>,
    context?: string,
    data?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.context || 'Application',
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      data,
    };

    // Console output with colors
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    };
    const reset = '\x1b[0m';

    console.log(
      `${colors[level]}[${entry.timestamp}] [${entry.level}] [${entry.context}]${reset} ${entry.message}`,
      data ? JSON.stringify(data) : '',
    );

    // File output (JSON for easy parsing)
    (this.logStream as WriteStream).write(JSON.stringify(entry) + '\n');
  }

  // Request logging helper
  logRequest(req: AuthenticatedRequest, res: Response, duration: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket?.remoteAddress,
      userId: req.user?.sub,
    };

    const level = res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.writeLog(
      level,
      `${req.method} ${req.url} ${res.statusCode}`,
      'HTTP',
      logData,
    );
  }

  // Database operation logging
  logDatabaseOperation(
    operation: string,
    collection: string,
    duration: number,
    success: boolean,
  ): void {
    this.writeLog(
      success ? LogLevel.DEBUG : LogLevel.ERROR,
      `${operation} on ${collection}`,
      'Database',
      { duration: `${duration}ms`, success },
    );
  }

  // Security event logging
  logSecurityEvent(event: string, details: any): void {
    this.writeLog(LogLevel.WARN, event, 'Security', details);
  }
}
