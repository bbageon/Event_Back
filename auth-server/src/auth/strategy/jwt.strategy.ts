// EVENT_BACK/auth-server/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'; // PassportStrategy 임포트
import { ExtractJwt, Strategy } from 'passport-jwt'; // JWT 전략 관련 클래스 임포트
import { ConfigService } from '@nestjs/config'; // ConfigService 임포트 (JWT_SECRET 읽기용)

// JWT 페이로드 타입 정의 (토큰에 담았던 정보)
// 로그인 시 login 메서드에서 토큰 페이로드에 넣었던 정보와 일치해야 합니다.
export interface JwtPayload {
  username: string;
  sub: string; // 사용자 고유 ID (_id)
  role: string; // 사용자 역할
  // 만료 시간 등 다른 정보는 PassportStrategy가 자동으로 처리
}

@Injectable()
// PassportStrategy를 상속받고, JWT 전략임을 명시 ('jwt'는 기본 전략 이름)
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) { // ConfigService 주입
    super({
      // JWT를 요청 헤더의 Bearer 토큰으로부터 추출하도록 설정
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 토큰 서명 검증 시 사용할 비밀 키 설정 (.env에서 읽어옴)
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // 토큰 만료 여부 자동 확인 활성화
      ignoreExpiration: false,
    });
  }

  // 토큰이 유효하게 검증되면 실행되는 메서드
  // payload는 검증된 JWT 토큰의 페이로드 객체입니다.
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    this.logger.verbose(`Validating JWT payload for user: "${payload.username}"`);
    // 여기서는 간단히 페이로드를 그대로 반환합니다.
    // 필요하다면 데이터베이스에서 사용자 ID(payload.sub)로 사용자를 다시 조회하여
    // 최신 사용자 정보 (예: 역할 변경 여부, 활성 상태 등)를 검증하고 반환할 수 있습니다.
    // const user = await this.userService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('User not found');
    // }
    // return user; // 검증된 사용자 객체를 반환

    // 여기서는 페이로드 자체가 인증된 사용자 정보로 사용됩니다.
    // req.user 객체에 이 반환 값이 담기게 됩니다.
    return payload;
  }
}