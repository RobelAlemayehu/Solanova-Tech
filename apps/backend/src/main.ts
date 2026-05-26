import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend cross-origin requests
  app.enableCors();

  // Set up global validation pipe for request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Port configured via environment variable (default to 5000)
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`NestJS application is running on: http://localhost:${port}`);
}

bootstrap();
