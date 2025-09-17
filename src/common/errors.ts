/**
 * Custom error classes for Memory Bank Generator MCP Server
 * Based on proven patterns from successful MCP implementations
 */

export class MemoryBankError extends Error {
  public readonly errorCode: string;
  public readonly details?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    errorCode: string,
    details?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'MemoryBankError';
    this.errorCode = errorCode;
    this.details = details;
    // Note: captureStackTrace is Node.js specific, skip for cross-platform compatibility
  }
}

export class ProjectAnalysisError extends MemoryBankError {
  constructor(
    message: string,
    projectPath?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'PROJECT_ANALYSIS_ERROR', {
      projectPath,
      ...details,
    });
    this.name = 'ProjectAnalysisError';
  }
}

export class MemoryBankGenerationError extends MemoryBankError {
  constructor(
    message: string,
    stage?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'MEMORY_BANK_GENERATION_ERROR', {
      stage,
      ...details,
    });
    this.name = 'MemoryBankGenerationError';
  }
}

export class FileSystemError extends MemoryBankError {
  constructor(
    message: string,
    filePath?: string,
    operation?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'FILE_SYSTEM_ERROR', {
      filePath,
      operation,
      ...details,
    });
    this.name = 'FileSystemError';
  }
}

export class GitAnalysisError extends MemoryBankError {
  constructor(
    message: string,
    repositoryPath?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'GIT_ANALYSIS_ERROR', {
      repositoryPath,
      ...details,
    });
    this.name = 'GitAnalysisError';
  }
}

export class ConfigurationError extends MemoryBankError {
  constructor(
    message: string,
    configKey?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'CONFIGURATION_ERROR', {
      configKey,
      ...details,
    });
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends MemoryBankError {
  constructor(
    message: string,
    validationType?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', {
      validationType,
      ...details,
    });
    this.name = 'ValidationError';
  }
}

export class IntegrationError extends MemoryBankError {
  constructor(
    message: string,
    integrationTarget?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'INTEGRATION_ERROR', {
      integrationTarget,
      ...details,
    });
    this.name = 'IntegrationError';
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  static isMemoryBankError(error: unknown): error is MemoryBankError {
    return error instanceof MemoryBankError;
  }

  static formatError(error: unknown): {
    message: string;
    errorCode?: string | undefined;
    details?: Record<string, unknown> | undefined;
    stack?: string | undefined;
  } {
    if (this.isMemoryBankError(error)) {
      return {
        message: error.message,
        errorCode: error.errorCode,
        details: error.details,
        stack: error.stack,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      message: String(error),
    };
  }

  static logError(error: unknown, context?: string): void {
    const formatted = this.formatError(error);
    const timestamp = new Date().toISOString();
    
    // Use process.stderr for Node.js environment
    process.stderr.write(`[${timestamp}] ${context ? `[${context}] ` : ''}Error: ${JSON.stringify({
      message: formatted.message,
      errorCode: formatted.errorCode,
      details: formatted.details,
      stack: formatted.stack,
    }, null, 2)}\n`);
  }

  static createMCPError(error: unknown): {
    code: number;
    message: string;
    data?: unknown;
  } {
    const formatted = this.formatError(error);
    
    if (this.isMemoryBankError(error)) {
      // Map specific error types to appropriate MCP error codes
      switch (error.errorCode) {
        case 'CONFIGURATION_ERROR':
        case 'VALIDATION_ERROR':
          return {
            code: -32602, // Invalid params
            message: formatted.message,
            data: formatted.details,
          };
        case 'FILE_SYSTEM_ERROR':
          return {
            code: -32603, // Internal error
            message: formatted.message,
            data: formatted.details,
          };
        case 'PROJECT_ANALYSIS_ERROR':
        case 'MEMORY_BANK_GENERATION_ERROR':
        case 'GIT_ANALYSIS_ERROR':
        case 'INTEGRATION_ERROR':
          return {
            code: -32000, // Server error
            message: formatted.message,
            data: formatted.details,
          };
        default:
          return {
            code: -32603, // Internal error
            message: formatted.message,
            data: formatted.details,
          };
      }
    }

    return {
      code: -32603, // Internal error
      message: formatted.message,
    };
  }
}

/**
 * Async error wrapper utility
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.logError(error, context);
      throw error;
    }
  };
}

/**
 * Type guards for error checking
 */
export function isProjectAnalysisError(
  error: unknown
): error is ProjectAnalysisError {
  return error instanceof ProjectAnalysisError;
}

export function isMemoryBankGenerationError(
  error: unknown
): error is MemoryBankGenerationError {
  return error instanceof MemoryBankGenerationError;
}

export function isFileSystemError(error: unknown): error is FileSystemError {
  return error instanceof FileSystemError;
}

export function isGitAnalysisError(error: unknown): error is GitAnalysisError {
  return error instanceof GitAnalysisError;
}

export function isConfigurationError(
  error: unknown
): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isIntegrationError(error: unknown): error is IntegrationError {
  return error instanceof IntegrationError;
}