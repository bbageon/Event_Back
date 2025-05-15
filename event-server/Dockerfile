FROM node:18-alpine AS development

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 및 lock 파일 복사 (캐싱 활용)
# 이 파일들이 변경되지 않으면 다음 npm ci 단계는 캐시에서 재사용됩니다.
COPY package*.json ./

# 모든 종속성 설치 (개발 및 프로덕션 모두)
# --frozen-lockfile 또는 npm ci 사용 권장 (lock 파일 기반으로 정확히 설치)
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드 (TypeScript 컴파일 등)
# package.json의 scripts.build 명령을 실행합니다.
RUN npm run build