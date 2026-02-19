import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // อนุญาตให้ Frontend ส่ง Header แปลกๆ มาได้
  app.enableCors({
    origin: '*',
    allowedHeaders: 'Content-Type, Accept, x-role, x-tenant',
  }); 
  
  await app.listen(3000);
}
bootstrap();