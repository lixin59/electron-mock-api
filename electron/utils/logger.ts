import fs from 'fs';
import path from 'path';
import type { QueryOptions, Logger } from 'winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment';
import { getAppDirectoryMain } from './appDir';

const homeDir = getAppDirectoryMain();
let gLogger: null | Logger = null;

const { combine, timestamp, label, printf } = winston.format;
const cpFormate = printf(config => {
  const { level, message, meta, timestamp: time } = config;
  return `[${time}]  (${level})  (${message}) :  ${JSON.stringify(meta)}\n`;
});

export function CreateDailyLogger() {
  const dirname = path.join(homeDir, 'logs');
  if (gLogger === null) {
    gLogger = winston.createLogger({
      level: 'info',
      format: combine(
        label({ label: 'right meow!' }),
        timestamp({ format: () => moment().format('YYYY-MM-DD HH:mm:ss') }),
        cpFormate
      ),
      transports: [
        new DailyRotateFile({
          dirname,
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          json: false,
          level: 'info',
          zippedArchive: false
        })
      ],
      exitOnError: false,
      levels: {
        error: 0,
        warn: 1,
        maintenance: 2,
        toolsError: 3,
        info: 4,
        debug: 5
      }
    });
  }
}

export function Info(msg: string, meta?: Record<string, any>) {
  try {
    if (gLogger === null) {
      return;
    }
    gLogger.info(msg, { meta });
  } catch (e) {
    fs.writeFileSync(path.join(homeDir, 'logs/err.log'), `记录日志出错 ${e}`);
  }
}

export function Warn(msg: string, meta?: Record<string, any>) {
  try {
    if (gLogger === null) return;
    gLogger.warn(msg, { meta });
  } catch (e) {
    fs.writeFileSync(path.join(homeDir, 'logs/err.log'), `记录日志出错 ${e}`);
  }
}

export function Success(msg: string, meta?: Record<string, any>) {
  try {
    if (gLogger === null) return;
    gLogger.debug(msg, { meta });
  } catch (e) {
    fs.writeFileSync(path.join(homeDir, 'logs/err.log'), `记录日志出错 ${e}`);
  }
}

export function lError(msg: string | Error, meta?: Record<string, any>) {
  try {
    if (gLogger === null) return;
    if (typeof msg === 'string') {
      gLogger.error(msg, { meta });
    }
    if (msg instanceof Error) {
      gLogger.error(msg.message, { meta });
    }
  } catch (e) {
    fs.writeFileSync(path.join(homeDir, 'logs/err.log'), `记录日志出错 ${e}`);
  }
}

export function Query(options: QueryOptions, f?: (err: Error, results: any) => void) {
  if (gLogger === null) {
    throw new Error('logger does not exist');
  }
  return gLogger.query(options, f);
}
