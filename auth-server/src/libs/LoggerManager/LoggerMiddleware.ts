import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';
/**
 * LoggerMiddleware
 * ---
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    // 응답 본문을 저장할 변수를 선언
    let responseBody: any = null;
    const logData = {
      method,
      statusCode: 0,
      message: '',
      originalUrl,
      ip,
      userAgent,
    };
    //응답 인터셉트
    const originalJsonMethod = res.json;
    res.json = function (body: any): any {
      responseBody = body;
      return originalJsonMethod.call(res, body);
    };

    res.on('finish', () => {
      // const { statusCode } = res;
      const { status, message, data } = responseBody;
      const errorMessage = typeof data === 'string' ? data : message;
      logData['statusCode'] = status ? status : 500;
      if (status === 200) {
        logData.message = message || data;
        this.logger.log(logData);
      } else {
        logData.message = errorMessage;
        this.logger.error(logData);
      }

      // logData.message = status === 200 ? message || data : errorMessage;
    });
    res.on('error', () => {
      const { statusCode } = res;
      console.log('에러에러');
      // 버퍼로 응답 데이터를 캡처할 변
      this.logger.error({
        method,
        statusCode,
        originalUrl,
        ip,
        userAgent,
      });
    });

    next();
  }
}
