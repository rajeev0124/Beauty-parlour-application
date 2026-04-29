import { Controller, Get, Res } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import type { Response } from 'express';

@Controller()
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  healthCheck() {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return { 
      status: 'ok', 
      message: 'Beauty Parlour API is running',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStates[this.connection.readyState] || 'unknown',
        connected: this.connection.readyState === 1,
        name: this.connection.name
      }
    };
  }

  @Get('health')
  detailedHealth() {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return {
      api: { status: 'healthy', uptime: process.uptime() },
      database: {
        status: dbStates[this.connection.readyState] || 'unknown',
        connected: this.connection.readyState === 1,
        host: this.connection.host,
        name: this.connection.name
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      timestamp: new Date().toISOString()
    };
  }

  @Get('favicon.ico')
  favicon(@Res() res: Response) {
    res.status(204).send();
  }

  @Get('api')
  apiRoot() {
    return {
      name: 'Beauty Parlour API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/docs',
      health: '/health',
      timestamp: new Date().toISOString()
    };
  }
}
