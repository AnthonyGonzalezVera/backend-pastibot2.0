import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Activar CORS para permitir requests desde el frontend (React/Ionic)
  app.enableCors({
    origin: true,          // permite que cualquier frontend acceda (puedes limitar luego)
    credentials: true,     // permite cookies/tokens si los usas
  });

  //  Puerto dinámico (deploy) con fallback a 3000 (local)
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Pastibot backend running on http://localhost:${port}`);
}
bootstrap();
