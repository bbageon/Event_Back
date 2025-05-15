import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

/** Nest */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
/** Modules */
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
/** libs */
import { LoggerManagerModule } from './libs/LoggerManager/LoggerManager.module';
import { SwaggerManagerModule } from './libs/SwaggerManager/SwaggerManager.module';
/* Logger */
import { LoggerMiddleware } from './libs/LoggerManager/LoggerMiddleware';

const env = process.env.NODE_ENV || 'local';
const envFilePath = [
  `.env.${env}`,
  '.env.development',
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath,
      ignoreEnvFile: false,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],

      /**
       * ENV 설정
       */
      useFactory: async (configService: ConfigService) => {
        const user = configService.get<string>('DATABASE_USER');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const host = configService.get<string>('DATABASE_HOST');
        const port = configService.get<number>('DATABASE_PORT'); // 포트는 숫자로 읽어오는 것이 좋습니다.
        const dbName = configService.get<string>('DATABASE_NAME');
        const authSource = configService.get<string>(
          'DATABASE_AUTH_SOURCE',
          'admin',
        );
        // 필수 환경 변수 누락 시 오류 발생시키기 (선택 사항, 하지만 권장)
        if (!user || !password || !host || !port || !dbName) {
          throw new Error(
            'Database connection ERROR',
          );
        }

        /**
         * MONGODB 설정
         */
        const mongoUri = `mongodb://${user}:${password}@${host}:${port}/${dbName}?authSource=${authSource}`;
        return {
          uri: mongoUri,
          // useNewUrlParser: true,
          // useUnifiedTopology: true,
        };
      },
      inject: [ConfigService], // useFactory 함수에 주입할 서비스 (ConfigService)
    }),
    /** Modules */
    AuthModule,
    UsersModule,

    /** Libs */
    LoggerManagerModule,
    SwaggerManagerModule,
  ],
})
// export class AppModule {}
export class AppModule implements NestModule {
  // Util
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}