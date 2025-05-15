// EVENT_BACK/auth-server/src/auth/auth.module.ts 파일 내용 (Passport, JWT, Strategy, Guard 포함)

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport'; // PassportModule 임포트
import { JwtModule } from '@nestjs/jwt'; // JwtModule 임포트
import { ConfigService, ConfigModule } from '@nestjs/config'; // ConfigService, ConfigModule 임포트 (JWT 설정에 사용)
import { Reflector } from '@nestjs/core'; // RolesGuard 사용을 위해 필요 (프로바이더로 제공되어야 함)


// User 스키마 임포트
import { User, UserSchema } from './schemas/user.schema';
// AuthService, AuthController 임포트
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// JWT 전략 임포트
import { JwtStrategy } from './strategy';
// 역할 기반 Guard 임포트 (Guard 자체는 여기서 직접 사용 안 하지만, Provider로 등록)
import { RolesGuard } from './roles';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // .env에서 JWT_SECRET 읽어옴 (필수)
        // signOptions: { expiresIn: '60m' }, // 토큰 만료 시간 설정 (선택 사항, 기본값도 있음)
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    Reflector,
  ],
  exports: [AuthService, JwtModule, PassportModule, RolesGuard, Reflector],
  // User 모델 자체도 UsersModule 등에서 사용한다면 export 필요
  // exports: [AuthService, JwtModule, PassportModule, RolesGuard, Reflector, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
})
export class AuthModule {}