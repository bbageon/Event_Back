// EVENT_BACK/auth-server/src/auth/dto/signup.dto.ts

import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
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
      description : 'User-ID',
      required : true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}