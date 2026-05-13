import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { AppLoggerService } from './common/logger';
import { execSync } from 'child_process';

// Kill any process using the specified port (Windows compatible)
function killPortProcess(port: number): void {
  try {
    if (process.platform === 'win32') {
      // Find and kill process on Windows
      const result = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      const lines = result
        .split('\n')
        .filter((line) => line.includes('LISTENING'));
      const pids = new Set<string>();
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) {
          pids.add(pid);
        }
      });
      pids.forEach((pid) => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
          console.log(`Killed process ${pid} on port ${port}`);
        } catch {
          /* Process may already be dead */
        }
      });
    } else {
      // Unix-like systems
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
        stdio: 'pipe',
      });
    }
  } catch {
    // No process on port, which is fine
  }
}

async function bootstrap() {
  const logger = new AppLoggerService();
  logger.setContext('Bootstrap');

  const port = parseInt(process.env.PORT ?? '3000', 10);

  // Kill any existing process on the port before starting
  killPortProcess(port);

  // Small delay to ensure port is released
  await new Promise((resolve) => setTimeout(resolve, 500));

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Security Headers with Helmet
  const helmet = (await import('helmet')).default;
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api', {
    exclude: ['', 'health', 'favicon.ico', 'api'], // Exclude root, health, favicon, and api info endpoints from /api prefix
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Beauty Parlour API')
    .setDescription(
      `
      ## Beauty Parlour Management System API
      
      A comprehensive REST API for managing beauty parlour operations including:
      - **Authentication** - JWT-based auth with role management
      - **Appointments** - Booking and scheduling management
      - **Services** - Service catalog and pricing
      - **Products** - Product inventory and sales
      - **Staff** - Staff profiles and scheduling
      - **Customers** - Customer management and loyalty
      - **Payments** - Payment processing with Razorpay
      - **Reports** - Business analytics and reporting
      
      ### Authentication
      Most endpoints require JWT authentication. Include the token in the Authorization header:
      \`Authorization: Bearer <token>\`
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Services', 'Beauty service catalog endpoints')
    .addTag('Appointments', 'Appointment booking and management')
    .addTag('Products', 'Product catalog and inventory')
    .addTag('Orders', 'Product order management')
    .addTag('Payments', 'Payment processing endpoints')
    .addTag('Staff', 'Staff management endpoints')
    .addTag('Reviews', 'Customer reviews and ratings')
    .addTag('Coupons', 'Discount coupon management')
    .addTag('Loyalty', 'Customer loyalty program')
    .addTag('Reports', 'Business analytics and reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Beauty Parlour API Docs',
  });

  // Optimized CORS with preflight caching and production safety
  const allowedOrigins = (() => {
    const envOrigins = process.env.CORS_ORIGINS;
    if (envOrigins) {
      return envOrigins.split(',').map((origin) => origin.trim());
    }
    // Production defaults: include Firebase + Render
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://beauty-parlour-0124.web.app',
        'https://beauty-parlour-0124.firebaseapp.com',
        'https://beauty-parlour-application.onrender.com',
      ];
    }
    // Development: localhost
    return ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:3000'];
  })();

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400, // Cache preflight for 24 hours
  });

  // Log CORS configuration
  console.log('🌐 CORS Origins Allowed:', allowedOrigins);

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`Server running on http://localhost:${port}/api`);
    console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is still in use. Attempting to force kill...`,
      );
      killPortProcess(port);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        await app.listen(port, '0.0.0.0');
        console.log(`Server running on http://localhost:${port}/api`);
        console.log(
          `Swagger docs available at http://localhost:${port}/api/docs`,
        );
      } catch {
        console.error(
          `Failed to start server on port ${port}. Please manually kill the process and try again.`,
        );
        process.exit(1);
      }
    } else {
      throw error;
    }
  }

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    try {
      await app.close();
      console.log('Server closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
