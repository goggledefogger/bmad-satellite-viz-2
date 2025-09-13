/**
 * Comprehensive logging utility for debugging satellite data API integration
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      case 'trace': return LogLevel.TRACE;
      default: return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    let formatted = `[${timestamp}] ${levelName}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        formatted += `\nStack: ${error.stack}`;
      }
    }
    
    return formatted;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context, error);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.TRACE:
        console.trace(formattedMessage);
        break;
    }
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  // Specialized logging methods for satellite data
  apiCall(method: string, url: string, context?: Record<string, unknown>): void {
    this.debug(`API Call: ${method} ${url}`, {
      method,
      url,
      ...context,
    });
  }

  apiResponse(method: string, url: string, status: number, responseTime: number, context?: Record<string, unknown>): void {
    this.debug(`API Response: ${method} ${url} - ${status} (${responseTime}ms)`, {
      method,
      url,
      status,
      responseTime,
      ...context,
    });
  }

  apiError(method: string, url: string, error: Error, context?: Record<string, unknown>): void {
    this.error(`API Error: ${method} ${url}`, {
      method,
      url,
      ...context,
    }, error);
  }

  cacheHit(key: string, context?: Record<string, unknown>): void {
    this.debug(`Cache Hit: ${key}`, { key, ...context });
  }

  cacheMiss(key: string, context?: Record<string, unknown>): void {
    this.debug(`Cache Miss: ${key}`, { key, ...context });
  }

  cacheSet(key: string, ttl: number, context?: Record<string, unknown>): void {
    this.debug(`Cache Set: ${key} (TTL: ${ttl}s)`, { key, ttl, ...context });
  }

  satelliteData(count: number, source: string, context?: Record<string, unknown>): void {
    this.info(`Satellite Data: ${count} satellites from ${source}`, {
      count,
      source,
      ...context,
    });
  }

  tleParsed(count: number, context?: Record<string, unknown>): void {
    this.debug(`TLE Parsed: ${count} TLE entries`, { count, ...context });
  }

  orbitalCalculation(satelliteId: string, context?: Record<string, unknown>): void {
    this.trace(`Orbital Calculation: ${satelliteId}`, { satelliteId, ...context });
  }

  performance(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export logger class for testing
export { Logger };


