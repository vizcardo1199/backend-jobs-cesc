import * as winston from "winston";
import {LeveledLogMethod, Logger, LogMethod} from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';
import {DAILY_ROTATE_FILE_TIMESTAMP_FORMAT, ISO_8601_FORMAT_TIMESTAMP} from "./constants.config";

let logger: Logger;

const createLog = (): Logger => {

    const consoleDefaultFormat = winston.format.printf(msg => {
        let newMessage = `${msg.timestamp} [${msg.level}] [${msg.pid}] --- [${msg.appName}]`;
        if (msg.className) {
            newMessage = `${newMessage} ${msg.className}`;
        }
        newMessage = `${newMessage} : ${msg.message}`;
        return newMessage;
    });

    const baseLoggerFormat = winston.format.combine(
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.timestamp({format: ISO_8601_FORMAT_TIMESTAMP}),
        consoleDefaultFormat
    );

    logger = winston.createLogger({
        level: process.env.APP_LOG_LEVEL,
        format: baseLoggerFormat,
        defaultMeta: {
            appName: process.env.APP_NAME,
            pid: global.process.pid
        },
        transports: [
            new DailyRotateFile({
                level: 'error',
                dirname: 'logs',
                filename: process.env.APP_NAME + '-error-%DATE%.log',
                datePattern: DAILY_ROTATE_FILE_TIMESTAMP_FORMAT,
                maxFiles: '30d',
                zippedArchive: false
            }),
            new DailyRotateFile({
                dirname: 'logs',
                filename: process.env.APP_NAME + '-%DATE%.log',
                datePattern: DAILY_ROTATE_FILE_TIMESTAMP_FORMAT,
                maxFiles: '30d',
                zippedArchive: false
            })
        ]
    });
    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console())
    }

    return logger;
};

export const configureLogApp = () => {
    createLog();
};


export class AppLogger {

    static getLogger(className: string): AppLogger {
        return logger.child({className: className});
    }

    static getDefaultLogger(): AppLogger {
        return logger;
    }

    debug: LeveledLogMethod = logger.debug;
    info: LeveledLogMethod = logger.info;
    warn: LeveledLogMethod = logger.warn;
    error: LeveledLogMethod = logger.error;
    log: LogMethod = logger.log;

}
