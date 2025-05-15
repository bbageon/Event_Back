// EVENT_BACK/auth-server/src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Reflector 임포트 (데코레이터 메타데이터 읽기용)

// RolesGuard는 @Roles() 데코레이터와 함께 사용됩니다.
// @UseGuards(RolesGuard) 가 적용된 라우트 핸들러 실행 전에 권한을 체크합니다.
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector를 주입받아 @Roles() 데코레이터의 메타데이터를 읽어옵니다.
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Roles() 데코레이터에 설정된 'roles' 메타데이터 값을 가져옵니다.
    // 라우트 핸들러(메서드) 또는 클래스(컨트롤러) 레벨에서 설정된 값을 읽을 수 있습니다.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(), // 메서드 핸들러에서 읽기 시도
      context.getClass(), // 클래스(컨트롤러)에서 읽기 시도
    ]);

    // @Roles() 데코레이터가 없는 경우 (즉, 역할 제한이 없는 경우) -> 접근 허용
    if (!requiredRoles) {
      return true;
    }

    // 요청 객체에서 사용자 정보(인증된 사용자)를 가져옵니다.
    // 이 사용자 정보는 AuthGuard('jwt')가 성공적으로 인증했을 때 req.user 에 담아줍니다.
    const request = context.switchToHttp().getRequest();
    const user = request.user; // JWT payload (jwt.strategy.ts의 validate 메서드 반환 값)

    // 사용자 정보가 없거나 (인증 안 됨), 사용자에게 role 속성이 없는 경우 -> 접근 거부
    if (!user || !user.role) {
        return false; // 403 Forbidden (AuthGuard가 401 처리하므로 여기서는 403)
    }

    // 사용자의 역할(user.role)이 requiredRoles 배열에 포함되는지 확인합니다.
    // indexOf 또는 includes 메서드 사용
    const hasRequiredRole = requiredRoles.includes(user.role);

    // 필수 역할이 있는 경우 접근 허용 (true), 없는 경우 접근 거부 (false)
    return hasRequiredRole; // 403 Forbidden
  }
}