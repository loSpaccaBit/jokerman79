/**
 * Production-safe logging system
 * Replaces console.log statements with proper logging abstraction
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private isClient: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isClient = typeof window !== 'undefined';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    return `${timestamp} ${levelName} ${context} ${entry.message}`;
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    if (this.isDevelopment || !this.isClient) {
      return;
    }

    try {
      // Send to monitoring service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      // Fallback to console in case of logging service failure
      console.error('Failed to send log to monitoring service:', error);
    }
  }

  private logEntry(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context,
    };

    // Always log to console in development
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(entry);
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, data);
          break;
      }
    }

    // Send to monitoring service in production
    if (!this.isDevelopment && level >= LogLevel.WARN) {
      this.sendToMonitoring(entry);
    }
  }

  debug(message: string, data?: any, context?: string): void {
    this.logEntry(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: any, context?: string): void {
    this.logEntry(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.logEntry(LogLevel.WARN, message, data, context);
  }

  error(message: string, error?: Error | any, context?: string): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    this.logEntry(LogLevel.ERROR, message, errorData, context);
  }

  // Casino-specific logging methods
  gameEvent(eventType: string, gameId: string, data?: any): void {
    this.info(`Game Event: ${eventType}`, { gameId, ...data }, 'CASINO');
  }

  securityEvent(eventType: string, details: any): void {
    this.warn(`Security Event: ${eventType}`, details, 'SECURITY');
  }

  performanceMetric(metric: string, value: number, context?: string): void {
    this.info(`Performance: ${metric} = ${value}ms`, { metric, value }, context || 'PERFORMANCE');
  }

  userAction(action: string, userId?: string, data?: any): void {
    this.info(`User Action: ${action}`, { userId, ...data }, 'USER');
  }

  apiCall(method: string, url: string, duration: number, status: number): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.logEntry(level, `API ${method} ${url} - ${status}`, { duration, status }, 'API');
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common use cases
export const logDebug = (message: string, data?: any, context?: string) => 
  logger.debug(message, data, context);

export const logInfo = (message: string, data?: any, context?: string) => 
  logger.info(message, data, context);

export const logWarn = (message: string, data?: any, context?: string) => 
  logger.warn(message, data, context);

export const logError = (message: string, error?: Error | any, context?: string) => 
  logger.error(message, error, context);

// Casino-specific logging shortcuts
export const logGameEvent = (eventType: string, gameId: string, data?: any) =>
  logger.gameEvent(eventType, gameId, data);

export const logSecurityEvent = (eventType: string, details: any) =>
  logger.securityEvent(eventType, details);

export const logPerformance = (metric: string, value: number, context?: string) =>
  logger.performanceMetric(metric, value, context);

export const logUserAction = (action: string, userId?: string, data?: any) =>
  logger.userAction(action, userId, data);

export const logApiCall = (method: string, url: string, duration: number, status: number) =>
  logger.apiCall(method, url, duration, status);

// Error boundary logging
export const logErrorBoundary = (error: Error, errorInfo: any) => {
  logger.error('React Error Boundary Caught Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
  }, 'ERROR_BOUNDARY');
};

export default logger;