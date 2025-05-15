// EVENT_BACK/auth-server/src/auth/dto/signin.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example : 'test1234@test.com',
    description : 'User-ID',
    required : true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example : 'test1234',
    description : 'User-PASSWORD',
    required : true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}