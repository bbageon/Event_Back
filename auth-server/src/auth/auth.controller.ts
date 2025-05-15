// EVENT_BACK/auth-server/src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  HttpStatus,
  UnauthorizedException,
  Logger,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Service
import { AuthService } from './auth.service';

// Passport, Guard
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles';
import { Roles } from './roles';
import { Role } from 'src/enum';

// Swagger, Dto
import { SignInDto } from './dto/signin.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth') // Swagger 문서에 표시될 태그 설정
@Controller('auth') // 모든 엔드포인트는 '/auth'로 시작
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}


  /**
   * 로그인
   * @param signInDto 
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: HttpStatus.OK, description: '로그인 성공, JWT 토큰 반환', type: Object })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '잘못된 인증 정보' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: '서버 오류' })
  @Post('/signin')
  async signIn(@Body()signInDto: SignInDto, @Res() res: Response) {
    const { username, password } = signInDto;

    try {
      const user = await this.authService.userSignIn(signInDto);
      return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: 'Login successful',
          data: user,
      });

    } catch (error) {
      if (error instanceof UnauthorizedException) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
              status: HttpStatus.UNAUTHORIZED,
              message: error.message,
              data: null,
          });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server error',
          data: (error as any).message,
      });
    }
  }


  @ApiOperation({ summary: '인증된 사용자 프로필 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '프로필 정보 반환', type: Object }) // <-- type: UserOutputDto -> type: Object 로 수정
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '인증 정보 없음 또는 만료/유효하지 않음' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: '서버 오류' })
  @Get('/profile')
  @UseGuards(AuthGuard('jwt')) // JWT 인증 Guard 적용
  @ApiBearerAuth('access-token')
  async getProfile(@Req() req, @Res() res: Response) {
    try {
      return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: 'Profile fetched successfully',
          data: req.user, // JWT payload (password는 원래 payload에 포함 안 됨) 반환
      });
    } catch (error) {
       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server error',
          data: (error as any).message,
       });
    }
  }

  /**
   * 관리자 로그인
   * @param req
   * @param res 
   * @returns 
   */
  @ApiOperation({ summary: '관리자 전용 데이터 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '관리자 데이터 반환', type: Object })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '인증 정보 없음 또는 만료/유효하지 않음' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: '접근 권한 없음 (ADMIN 역할 아님)' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: '서버 오류' })
  @Get('/admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  async getAdminOnlyData(@Req() req, @Res() res: Response) {
     try {
        return res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            message: 'Welcome, Admin! This is admin-only data.',
            data: req.user, // ADMIN 사용자 정보(payload) 반환
        });

     } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server error',
          data: (error as any).message,
       });
     }
  }

    /**
     * 토큰 검사
     * @param req 
     * @param res 
     * @returns 
     */
    @Post('check') // POST /auth/check
    @UseGuards(AuthGuard('jwt'), RolesGuard) // JWT 인증 및 역할 Guard 적용
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN) // 이 엔드포인트에 접근 가능한 모든 역할 명시
    @ApiOperation({ summary: '토큰 유효성 검사' })
    @ApiResponse({ status: HttpStatus.OK, description: '토큰 유효함, 사용자 정보 반환', type: Object }) // <-- type: Object
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '토큰 무효 또는 만료' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: '요청 경로 접근 권한 없음 (Guard 통과 후 Role 불일치)' }) // RolesGuard가 처리
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: '서버 오류' })
    @ApiBearerAuth('access-token')

    async authCheck(@Req() req: Request, @Res() res: Response) {
        try {
            const user = (req as any).user;
            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: 'Token is valid',
                data: user, // JWT payload 반환
            });
        } catch (e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Server error',
                data: (e as any).message,
            });
        }
    }
}