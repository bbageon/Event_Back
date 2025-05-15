import {
    Injectable,
    InternalServerErrorException, // 서버 내부 오류
    UnauthorizedException, // 401 인증 실패
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose'; 
  import * as bcrypt from 'bcrypt'; 
  import { JwtService } from '@nestjs/jwt'; 
  import { ConfigService } from '@nestjs/config'; 
  
  // User 스키마 및 문서 타입
  import { User, UserDocument } from './schemas/user.schema';
  
  // DTO 
  import { SignInDto } from './dto/signin.dto'; // 로그인 로직에 사용
  
  interface SignInResult {
    access_token: string;
    // username: string;
    // role: string;
  }
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      private jwtService: JwtService,
      private configService: ConfigService,
    ) { }
  
    /**
     * 로그인
     * @param signInDto 
     * @returns 
     */
    async userSignIn(signInDto: SignInDto): Promise<SignInResult> {
      const { username, password } = signInDto;
      try {
        // 1. 사용자 인증 (validateUser 메서드 호출)
        // validateUser는 유효한 사용자를 찾고 비밀번호를 비교합니다.
        // 성공 시 UserDocument 반환, 실패 시 null 반환.
        const user = await this.validateUser(username, password);
  
        // 2. 인증 실패 시 (validateUser가 null 반환)
        if (!user) {
          throw new UnauthorizedException('Invalid credentials'); // 401 Unauthorized
        }

        const token = await this.createAccessToken(user);
  
        // 4. 생성된 토큰 객체 반환
        return {
            access_token : token.access_token,
            // username : user.username,
            // role : user.role,
        };
  
      } catch (error) {
        throw error;
      }
    }
  
  
    /**
     * 사용자 인증
     * @param username 
     * @param pass 
     * @returns 
     */
    // 사용자 이름과 평문 비밀번호를 받아 유효한 사용자인지 데이터베이스와 비교하여 확인합니다.
    // 이제 Mongoose Document 자체를 반환하므로 이 타입은 올바릅니다.
    private async validateUser(username: string, pass: string): Promise<UserDocument | null> {
       try {
          // 1. 사용자 이름으로 데이터베이스에서 사용자 찾기 (비밀번호 필드 포함)
          const user = await this.userModel.findOne({ username }).select('+password').exec();
  
          // 2. 사용자가 존재하지 않거나 비밀번호 불일치
          if (!user || !(await bcrypt.compare(pass, user.password))) {
            // this.logger.warn(`Invalid credentials attempt for user: "${username}"`); // 로거 호출 제거
            return null; // 사용자가 없거나 비밀번호 불일치 시 null 반환 (예외 던지지 않음)
          }
          // 3. 인증 성공 시, Mongoose Document 자체를 반환합니다.
          return user; // <-- Mongoose Document 자체를 반환 (password 필드 포함 상태)
  
       } catch (error) {
          throw new InternalServerErrorException('Error during user validation process.'); // 서비스 내부 오류
       }
    }
  
    /**
     * 토큰 생성
     * @param user
     * @returns 
     */
    async createAccessToken(user: UserDocument): Promise<{ access_token: string }> {
      // JWT 페이로드 구성: UserDocument 객체의 정보를 사용합니다.
      // _id, username, role 필드는 UserDocument에 포함되어 있습니다.
      const payload = { username: user.username, sub: user._id.toString(), role: user.role }; // _id는 ObjectId 타입이므로 toString()으로 변환
  
      // JwtService.sign() 메서드를 사용하여 페이로드를 기반으로 JWT 토큰 문자열을 생성합니다.
      // AuthModule에 설정된 JWT_SECRET 키와 만료 시간 등이 적용됩니다.
      const access_token = this.jwtService.sign(payload);
  
      return { access_token };
    }
  
    /**
     * 토큰 확인 (유효성 검증)
     * @param token 
     * @returns 
     */
     async validateToken(token: string): Promise<any> {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
  
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
  }