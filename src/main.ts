import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties not in the DTO
      forbidNonWhitelisted: true, // Throw an error for extra properties
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  app.enableCors({ credentials: true, origin: '*' });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get('PORT');

  await app.listen(PORT, () => console.log('PORT:', PORT));
}

bootstrap();
