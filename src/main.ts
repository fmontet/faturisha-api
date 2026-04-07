import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';

function setupRedoc(app: INestApplication) {
  const redocHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Faturisha API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <redoc spec-url='/api/docs-json'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `;

  app.use('/api/redoc', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(redocHtml);
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');
  // app.enableVersioning({
  //   type: VersioningType.URI, // results in /api/v1/..., /api/v2/...
  //   defaultVersion: '1',
  // });

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
  //   origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:3000',
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  //   credentials: true,
  // });

  app.enableShutdownHooks(); // for graceful shutdown

  const config = new DocumentBuilder()
    .setTitle('Faturisha API')
    .setDescription('Generate PDF invoices and receipts')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI for development/testing - can be disabled in production
  SwaggerModule.setup('api/docs', app, document);

  // Redoc — cleaner public-facing docs
  setupRedoc(app);
  // SwaggerModule.setup('api/redoc', app, document, {
  //   customSiteTitle: 'Faturisha API Docs',
  //   customCss: '.swagger-ui { display: none }',
  //   customJs: 'https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js',
  // });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});
