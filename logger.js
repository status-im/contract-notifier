const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, errors, splat } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = (serviceName) => createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    errors({ stack: true }),
    label({ label: serviceName }),
    splat(),
    myFormat
  ),
  defaultMeta: { service: serviceName },
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" })
  ]
});

module.exports = logger;
