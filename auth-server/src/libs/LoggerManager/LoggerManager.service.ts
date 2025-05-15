import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import dayjs from 'dayjs';
import schedule from 'node-schedule';
import { ConfigService } from '@nestjs/config';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


interface LogData {
    label: string;
    level: string;
    timestamp: string;
    message: string;
    originalUrl?: string;
    method?: string;
    statusCode?: number;
    context?: string;
    ip?: string;
    userAgent?: string;
    logVersion: string;
    [key: string]: string | number;
}

/**
 * LoggerManager Service
 * --
 */
@Injectable()
export class LoggerManager {
    private logger: winston.Logger;
    private projectName: 'auth-server';
    private readonly infoLog: boolean;
    private currentDate: string; // 현재 날짜를 추적하기 위한 변수

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.infoLog = this.configService.get<string>('INFO_LOG') === 'true';
        if (this.infoLog) {
            this.currentDate = this.getToday().date; // 초기 날짜 설정
            this.logger = this.createLogger();
        }
        console.log(`[libs][LoggerManager][infoLog][${this.infoLog}]`);
    }
    /**
     * 날짜 조회
     * @returns
     */
    getToday() {
        const d = dayjs().tz('Asia/Seoul');
        const dd = {
            year: `${d.year()}`,
            month: d.month() + 1 < 10 ? `0${d.month() + 1}` : `${d.month() + 1}`,
            day: d.date() < 10 ? `0${d.date()}` : `${d.date()}`,
        };
        const yd = d.clone().subtract(1, 'day').startOf('day');
        const ydd = {
            yesterDayYear: yd.format('YYYY'),
            yesterDayMonth: yd.format('MM'),
            yesterDay: yd.format('DD'),
        };
        return {
            ...dd,
            date: `${dd.year}${dd.month}${dd.day}`,
            ...ydd,
        };
    }
    /**
     * 로그 생성
     * @returns
     */
    createLogger() {
        const dd = this.getToday();
        const myFormat = winston.format.printf(
            (info: winston.Logform.TransformableInfo) => {
                const formatLogData = this.format(info);
                return JSON.stringify(formatLogData);
            },
        );
        const loggingFormat = winston.format.combine(myFormat);
        return winston.createLogger({
            transports: [
                new winston.transports.File({
                    filename: `logs/${dd.year}/${dd.month}/combined_${dd.day}.log`,
                    format: loggingFormat,
                    level: 'info',
                }),
                new winston.transports.File({
                    filename: `logs/${dd.year}/${dd.month}/error_${dd.day}.log`,
                    format: loggingFormat,
                    level: 'error',
                }),
            ],
        });
    }
    /**
     * 로그 포멧
     * @returns
     */
    format(info: winston.Logform.TransformableInfo): LogData {
        const baseMessage = info.message;
        const message =
            typeof baseMessage === 'string'
                ? baseMessage
                : typeof baseMessage === 'object' && baseMessage !== null
                    ? (baseMessage as any).message
                    : '[LoggerManager][Service] message ERROR';


        const logData: LogData = {
            label: this.projectName,
            level: info.level,
            timestamp: dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            message,
            context: (info as any).context || 'HTTP', // 여기도 any 캐스팅
            logVersion: 'V1',
        };

        const optionalFields = [
            'originalUrl',
            'method',
            'statusCode',
            'ip',
            'userAgent',
        ];
        optionalFields.forEach((field) => {
            if (typeof baseMessage === 'object' && baseMessage !== null && field in baseMessage) {
                logData[field] = (baseMessage as any)[field];
            }
        });

        return logData;
    }

    /**
     * 날짜 업데이트 및 인스턴스 변환
     * @returns
     */
    private updateLoggerIfDateChanged() {
        const dd = this.getToday().date;
        if (this.currentDate !== dd) {
            this.currentDate = dd;
            this.logger = this.createLogger();
        }
    }


    log(message: string, context?: string) {
        if (!this.infoLog) return;
        this.updateLoggerIfDateChanged();
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: string) {
        if (!this.infoLog) return;
        this.updateLoggerIfDateChanged();
        this.logger.error(message, { context, trace });
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, { context });
    }

    debug?(message: string, context?: string) {
        this.logger.debug(message, { context });
    }

    verbose?(message: string, context?: string) {
        this.logger.verbose(message, { context });
    }

}
