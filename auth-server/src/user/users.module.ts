import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // MongooseModule 임포트
import { ConfigModule } from '@nestjs/config'; // ConfigModule 임포트 (필요시)

// User 스키마 및 클래스 임포트 (상위 디렉토리에 있으므로 경로 주의)
import { User, UserSchema } from '../auth/schemas/user.schema';

// UsersService, UsersController 임포트 (아직 없다면 Step 2에서 생성)
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}