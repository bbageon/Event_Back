/** Nest */
import {
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    ConflictException,
    InternalServerErrorException,
    Get,
    Param,
    Res,
} from '@nestjs/common';
import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

/** Express */
import { Request, Response } from 'express';

/** Service */
import { UsersService } from './users.service';

/** Schema */
import { User, UserDocument } from '../auth/schemas/user.schema';

// Swagger
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';

@UseInterceptors(ClassSerializerInterceptor) 

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    /**
     * 회원가입
     * @param signUpDto 
     * @param res 
     * @returns 
     */
    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(ValidationPipe)

    @ApiOperation({ summary: '새 사용자 등록 (회원가입)' })
    @ApiResponse({ status: HttpStatus.CREATED, description: '사용자 등록 성공', type: User })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: '사용자 이름 중복' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '요청 유효성 검사 실패' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: '서버 오류' })

    async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
        try {
            const newUser = await this.usersService.signUp(signUpDto);

            return res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                message: 'SUCCESS REGISTER',
                data: newUser, // 비밀번호 없음
            });

        } catch (error) {
            if (error instanceof ConflictException) {
                return res.status(HttpStatus.CONFLICT).json({
                    status: HttpStatus.CONFLICT,
                    message: error.message,
                    data: null,
                });
            }
            if (error instanceof InternalServerErrorException) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                    data: null,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'An unexpected error occurred during signup.',
                data: (error as any).message,
            });
        }
    }

    /**
     * 개별 사용자 조회
     * @param id 
     * @param res 
     * @returns 
     */
    @Get('/:id')
    @ApiOperation({ summary: '사용자 ID로 정보 조회' })
    @ApiResponse({ status: HttpStatus.OK, description: '사용자 정보 반환', type: User })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '사용자를 찾을 수 없음' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: '서버 오류' })
    @ApiParam({ name: 'id', description: '사용자 고유 ID (MongoDB ObjectId)', type: String })
    // 이 엔드포인트도 JWT 인증 및 권한 검사가 필요할 수 있습니다 (@UseGuards 등)
    async findUserById(@Param('id') id: string, @Res() res: Response): Promise<any> { // @Param 데코레이터로 URL 파라미터 추출
        try {
            const user = await this.usersService.findById(id); // UsersService에서 findById 구현 필요

            if (!user) {
                // this.logger.warn(`User with ID "${id}" not found.`); // 로거 호출 제거
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: HttpStatus.NOT_FOUND,
                    message: `User with ID "${id}" not found.`,
                    data: null,
                });
            }

            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: 'User found',
                data: user, // password 제외된 UserDocument 객체
            });

        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                    data: null,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'An unexpected error occurred while finding user.',
                data: (error as any).message,
            });
        }
    }
}