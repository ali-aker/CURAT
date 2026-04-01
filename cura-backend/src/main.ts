import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/http-exception.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Helmet
  app.use(helmet());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get('app.env') === 'development' ? '*' : [],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
}

bootstrap();