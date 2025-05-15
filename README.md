# Event_Back
2025 N_M_Assignment 01

## Instruction
### Build
docker compose build
### Execute
docker compose up --build
docker compose up
## Install
### Docker
https://docs.docker.com/desktop/setup/install/mac-install/

#### Dockerfile 작성 참고 사이트
https://velog.io/@yellow-w/1-%EB%8F%84%EC%BB%A4%EB%A1%9C-Nestjs-%EB%A1%9C%EC%BB%AC-%EA%B0%9C%EB%B0%9C-%ED%99%98%EA%B2%BD-%EB%A7%8C%EB%93%A4%EA%B8%B0
### nestjs
npm install -g @nestjs/cli
nest new project-name
### MongoDB for Mac
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
http://localhost:27017/ -> Check :: It looks like you are trying to access MongoDB over HTTP on the native driver port
mongo
#### 만약, command not found: mongo 발생 시,
-> brew install mongodb-community-shell
#### Create User
use admin
db.createUser({user : "root", pwd : "1234", roles : [ "root" ]})

## ISSUE 
### Docker 실행 오류
initializing backend: retrieving system info: retrieving system version: exec: "sw_vers": executable file not found in $PATH
initializing app: getting system info: retrieving system version: exec: "sw_vers": executable file not found in $PATH
### 해결방법
open /Applications/Docker.app/

### Dockerfile 빌드 시, node_modules 권한 문제
### 권한 확인
docker compose ps
docker exec -it [컨테이너 이름 또는 ID] sh
ls -la node_modules
권한 확인 후, dockerfile 에서 npm ci 실행 전에 사용자 지정 (Defalut : root)