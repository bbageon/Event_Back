import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerManager } from './libs/LoggerManager/LoggerManager.service';
import { SwaggerManager } from './libs/SwaggerManager/SwaggerManager.service';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ConfigService를 통해 환경 변수 설정
  const configService = app.get(ConfigService);
  // SwaggerManager 설정
  const swaggerManager = app.get(SwaggerManager);
  // LoggerManager 설정
  const loggerManager = app.get(LoggerManager);
  // 애플리케이션의 로거 설정
  app.useLogger(loggerManager);
  // Swagger 설정
  swaggerManager.setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
