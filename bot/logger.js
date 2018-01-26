import { createLogger, format, transports } from 'winston';

const {
  combine, timestamp, label: labeler, printf, colorize,
} = format;

export default label =>
  createLogger({
    format: combine(
      colorize({ all: true }),
      labeler({ label }),
      timestamp(),
      printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`),
    ),
    transports: [new transports.Console({ handleExceptions: true })],
  });
