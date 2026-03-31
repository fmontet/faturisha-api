import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api/v1'); // optional: versioned prefix for all routes

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      transform: true, // auto-transform types
      forbidNonWhitelisted: true, // throws error on extra fields
    }),
  );

  // Optional: enable CORS (useful for frontend later)
  app.enableCors();
  // app.enableCors({
  //   origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:4200',
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  //   credentials: true,
  // });

  app.enableShutdownHooks(); // for graceful shutdown

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});
