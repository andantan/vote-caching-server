import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize, align } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const logger: Logger = createLogger({
  level: "info",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    logFormat
  ),
  transports: new transports.Console(),
  exceptionHandlers: new transports.Console(),
  exitOnError: false,
});

export default logger;