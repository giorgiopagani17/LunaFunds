import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const jwtSecret = configService.get<string>('JWT_SECRET');

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in .env');
  }

  // Abilita CORS
  app.enableCors({
    origin: 'http://localhost:9000', // Permetti l'accesso solo dal frontend su localhost:9000
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Metodi permessi
    credentials: true, // Abilita l'invio di cookie se necessario
  });

  await app.listen(3000);
}
bootstrap();
