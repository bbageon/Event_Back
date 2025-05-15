// EVENT_BACK/auth-server/src/auth/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

// 이 데코레이터를 사용하여 엔드포인트에 필요한 역할(들)을 설정합니다.
// 예: @Roles('ADMIN') 또는 @Roles('OPERATOR', 'ADMIN')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);