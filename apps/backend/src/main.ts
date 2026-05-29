import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep API URLs consistent across dev/prod (frontend expects `/api/...`)
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PropList API')
    .setDescription('Multi-tenant property listing platform REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS for frontend cross-origin requests
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Set up global validation pipe for request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Force port 5000 to avoid conflicts with Next.js which defaults to 3000
  const port = process.env.PORT === '3000' ? 5000 : (process.env.PORT || 5000);
  await app.listen(port);
  console.log(`NestJS application is running on: http://localhost:${port}/api`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
