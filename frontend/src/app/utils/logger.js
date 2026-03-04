import { config } from '../../api/config/env';

class Logger {
  constructor() {
    this.isDev = config.isDev;
    this.isProd = config.isProd;
  }

  format(level, message) {
    const time = new Date().toISOString();
    return `[${time}] [${level}] ${message}`;
  }

  info(message, data) {
    if (!this.isDev) return;

    console.log(this.format('INFO', message), data ?? '');
  }

  debug(message, data) {
    if (!this.isDev) return;

    console.debug(this.format('DEBUG', message), data ?? '');
  }

  warn(message, data) {
    console.warn(this.format('WARN', message), data ?? '');
  }

  error(message, error) {
    console.error(this.format('ERROR', message), error ?? '');

    // Тут можно будет подключить Sentry или другую систему
    // if (this.isProd && error) {
    //   sendToMonitoring(error);
    // }
  }

  api(method, url, status) {
    if (!this.isDev) return;

    console.log(
      this.format('API', `${method.toUpperCase()} ${url} → ${status}`)
    );
  }
}

export const logger = new Logger();