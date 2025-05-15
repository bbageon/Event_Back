import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerCustomOptions,
	ApiResponseOptions,
	getSchemaPath,
} from '@nestjs/swagger';

// Dtos
import { SignInDto } from 'src/auth/dto';
import { SignUpDto } from 'src/user/dto';

@Injectable()
export class SwaggerManager {
	constructor() { }

	setupSwagger(app: INestApplication): void {
		const options = new DocumentBuilder()
			.setTitle('EVNET_BACK_AUTH_SERVER_DOCUMENT')
			.setDescription('이벤트 인증 서버 문서.')
			.setVersion('1.0')
			.addBearerAuth(
				{
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					in: 'header',
					description: 'Enter JWT token',
				},
				'access-token',
			)
			.build();
		//웹 페이지를 새로고침을 해도 Token 값 유지
		const swaggerCustomOptions: SwaggerCustomOptions = {
			swaggerOptions: {
				docExpansion: 'none', // 기본적으로 모든 섹션을 접어서 열립니다.
				persistAuthorization: true, //웹 페이지를 새로고침을 해도 Token 값 유지
				// supportedSubmitMethods: ['get', 'post', 'put'], //try it out 버튼 활성화
				plugins: [{}],
			},
		};

		const document = SwaggerModule.createDocument(app, options, {
			extraModels: [
				SignInDto,
				SignUpDto,
			], // 여기에 DTO를 추가
		});
		SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);
	}
}

/**
 * 공통 응답 형식(성공) - 고정된 값이 필요할 떄
 * ---
 * @param : type : DTO
 * @param : default: boolean - 기본응답여부,
 * @param : isArray : boolean - 배열유무
 * @param : length : boolean -  배열 생성 갯수
 * @param : additionalProperties : 추가 옵션 {key: value,key: value}
 */
export const createSuccessResponse = (
	type: any,
	options: {
		default?: boolean;
		isArray?: boolean;
		length?: number;
	} = {},
): ApiResponseOptions => ({
	status: HttpStatus.OK,
	description: '성공 응답',
	content: {
		'application/json': {
			schema:
				options.default === true
					? {
						properties: {
							status: {
								type: 'integer',
								example: HttpStatus.OK,
							},
							message: { type: 'string', example: 'success' },
							data: { type: 'object', example: type },
						},
					}
					: {
						type: 'object',
						properties: {
							status: { type: 'integer', example: HttpStatus.OK },
							message: { type: 'string', example: 'success' },
							data: options.isArray
								? {
									type: 'array',

									items: { $ref: getSchemaPath(type) },
									// 배열 예시 생성을 위해 minItems와 maxItems를 사용할 수 있습니다.
									minItems: options.length,
									maxItems: options.length,
								}
								: { $ref: getSchemaPath(type) },
						},
					},
		},
	},
});

/**
 * 공통 응답 형식(에러)
 * ---
 * @param : message : string
 */
export const createErrorResponse = (message: string): ApiResponseOptions => ({
	status: HttpStatus.INTERNAL_SERVER_ERROR,
	description: '서버 에러 응답',
	content: {
		'application/json': {
			schema: {
				properties: {
					status: {
						type: 'integer',
						example: HttpStatus.INTERNAL_SERVER_ERROR,
					},
					message: { type: 'string', example: 'Server error' },
					data: { type: 'string', example: message },
				},
			},
		},
	},
});