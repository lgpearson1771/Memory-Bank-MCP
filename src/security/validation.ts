/**
 * Security Validation Module
 * Provides input validation, path sanitization, and content filtering
 * to prevent security vulnerabilities in the Memory Bank Generator
 */

import * as path from 'path';

/**
 * Path validation and sanitization utilities
 */
export interface PathValidator {
  /**
   * Sanitize a project path to prevent traversal attacks
   * @param inputPath - Raw input path from user
   * @returns Sanitized absolute path
   * @throws Error if path is invalid or dangerous
   */
  sanitizeProjectPath(inputPath: string): string;
  
  /**
   * Validate that a target path stays within base directory boundaries
   * @param basePath - Base directory that should contain the target
   * @param targetPath - Path to validate
   * @returns true if safe, false if outside boundaries
   */
  validateWithinBoundaries(basePath: string, targetPath: string): boolean;
  
  /**
   * Normalize path separators for cross-platform compatibility
   * @param inputPath - Path with potentially mixed separators
   * @returns Normalized path using platform-appropriate separators
   */
  normalizePath(inputPath: string): string;
}

/**
 * Content sanitization utilities for generated files
 */
export interface ContentSanitizer {
  /**
   * Escape HTML entities to prevent XSS in generated markdown
   * @param content - Raw content that may contain HTML
   * @returns Content with HTML entities escaped
   */
  escapeHtml(content: string): string;
  
  /**
   * Sanitize markdown content to remove dangerous elements
   * @param content - Raw markdown content
   * @returns Sanitized markdown with dangerous patterns removed
   */
  sanitizeMarkdown(content: string): string;
  
  /**
   * Filter dangerous shell commands from code blocks
   * @param content - Content that may contain code blocks
   * @returns Content with dangerous commands filtered/commented
   */
  filterDangerousCommands(content: string): string;
  
  /**
   * Validate and sanitize package.json data
   * @param packageData - Raw package.json object
   * @returns Sanitized package data with dangerous fields cleaned
   */
  validatePackageJson(packageData: any): any;
}

/**
 * Security configuration options
 */
export interface SecurityConfig {
  // Path validation settings
  allowSymlinks: boolean;
  maxPathDepth: number;
  
  // Content filtering settings
  strictHtmlEscaping: boolean;
  allowedCommands: string[];
  dangerousPatterns: RegExp[];
  
  // Logging settings
  logSecurityEvents: boolean;
  throwOnViolation: boolean;
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowSymlinks: false,
  maxPathDepth: 10,
  strictHtmlEscaping: true,
  allowedCommands: ['npm', 'node', 'git', 'echo', 'cat', 'ls'],
  dangerousPatterns: [
    /rm\s+-rf/gi,
    /curl.*\|\s*bash/gi,
    /wget.*\|\s*sh/gi,
    /sudo\s+/gi,
    /eval\s*\(/gi,
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi
  ],
  logSecurityEvents: true,
  throwOnViolation: false
};

/**
 * Implementation of path validation utilities
 */
export class PathValidatorImpl implements PathValidator {
  constructor(private config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {}

  sanitizeProjectPath(inputPath: string): string {
    // Check for traversal patterns in the original input
    if (inputPath.includes('..')) {
      if (this.config.logSecurityEvents) {
        console.warn(`Security: Path traversal attempt blocked: ${inputPath}`);
      }
      if (this.config.throwOnViolation) {
        throw new Error('Path traversal detected in input path');
      }
      // Return a safe fallback path instead of allowing traversal
      return path.resolve(process.cwd(), 'safe-default-project');
    }
    
    // Resolve to absolute path to eliminate any remaining traversal patterns
    const resolved = path.resolve(inputPath);
    
    // Additional security check: ensure the resolved path is in a reasonable location
    // Prevent paths that resolve to system directories or far outside expected project areas
    const cwd = process.cwd();
    const relative = path.relative(cwd, resolved);
    
    // If the resolved path is way outside current working directory (more than 3 levels up)
    if (relative.startsWith('..')) {
      const upLevels = (relative.match(/\.\./g) || []).length;
      if (upLevels > 3) {
        if (this.config.logSecurityEvents) {
          console.warn(`Security: Path too far outside working directory: ${inputPath} -> ${resolved}`);
        }
        return path.resolve(cwd, 'safe-default-project');
      }
    }
    
    return this.normalizePath(resolved);
  }

  validateWithinBoundaries(basePath: string, targetPath: string): boolean {
    const normalizedBase = path.resolve(basePath);
    const normalizedTarget = path.resolve(targetPath);
    
    // Check if target is within base directory
    const relative = path.relative(normalizedBase, normalizedTarget);
    
    // If relative path starts with '..', it's outside boundaries
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  normalizePath(inputPath: string): string {
    // Use path.normalize to handle separators correctly
    return path.normalize(inputPath);
  }
}

/**
 * Implementation of content sanitization utilities
 */
export class ContentSanitizerImpl implements ContentSanitizer {
  constructor(private config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {}

  escapeHtml(content: string): string {
    if (!this.config.strictHtmlEscaping) {
      return content;
    }
    
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  sanitizeMarkdown(content: string): string {
    let sanitized = content;
    
    // Remove dangerous HTML tags while preserving markdown
    sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, 
      '<!-- Script tag removed for security -->');
    
    sanitized = sanitized.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, 
      '<!-- iframe removed for security -->');
    
    // Filter dangerous commands from code blocks
    sanitized = this.filterDangerousCommands(sanitized);
    
    // Handle other dangerous patterns
    this.config.dangerousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        if (this.config.logSecurityEvents) {
          console.warn(`Security: Dangerous pattern detected and filtered`);
        }
      }
    });
    
    return sanitized;
  }

  filterDangerousCommands(content: string): string {
    let filtered = content;
    
    // Process code blocks to filter dangerous commands
    filtered = filtered.replace(/```(?:bash|sh|shell|zsh)?([\s\S]*?)```/gi, 
      (_match, codeContent) => {
        let filteredCode = codeContent;
        
        // Check each line for dangerous patterns
        const lines = filteredCode.split('\n');
        const filteredLines = lines.filter((line: string) => {
          // Check against dangerous patterns
          for (const pattern of this.config.dangerousPatterns) {
            if (pattern.test(line)) {
              if (this.config.logSecurityEvents) {
                console.warn(`Security: Dangerous command filtered: ${line.trim()}`);
              }
              // Remove the line entirely instead of commenting it
              return false;
            }
          }
          return true;
        });
        
        // If all lines were filtered out, return empty code block
        if (filteredLines.length === 0) {
          return '```bash\n\n```';
        }
        
        return '```bash\n' + filteredLines.join('\n') + '\n```';
      });
    
    return filtered;
  }

  validatePackageJson(packageData: any): any {
    if (!packageData || typeof packageData !== 'object') {
      return packageData;
    }
    
    const sanitized = { ...packageData };
    
    // Sanitize string fields that might contain dangerous content
    if (typeof sanitized.name === 'string') {
      sanitized.name = this.escapeHtml(sanitized.name);
    }
    
    if (typeof sanitized.description === 'string') {
      sanitized.description = this.sanitizeMarkdown(sanitized.description);
    }
    
    // Filter dangerous scripts
    if (sanitized.scripts && typeof sanitized.scripts === 'object') {
      const filteredScripts: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(sanitized.scripts)) {
        if (typeof value === 'string') {
          // Check for dangerous script content
          let hasViolation = false;
          for (const pattern of this.config.dangerousPatterns) {
            if (pattern.test(value)) {
              hasViolation = true;
              break;
            }
          }
          
          if (hasViolation) {
            if (this.config.logSecurityEvents) {
              console.warn(`Security: Dangerous script filtered: ${key} = ${value}`);
            }
            filteredScripts[key] = '# SECURITY: Script filtered for safety';
          } else {
            filteredScripts[key] = value;
          }
        }
      }
      
      sanitized.scripts = filteredScripts;
    }
    
    // Filter dangerous dependencies (paths that could be traversals)
    if (sanitized.dependencies && typeof sanitized.dependencies === 'object') {
      const filteredDeps: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(sanitized.dependencies)) {
        // Check for path traversal in dependency names
        if (key.includes('..') || key.startsWith('/') || key.match(/^[a-zA-Z]:/)) {
          if (this.config.logSecurityEvents) {
            console.warn(`Security: Dangerous dependency filtered: ${key}`);
          }
          // Skip dangerous dependency
          continue;
        }
        filteredDeps[key] = value as string;
      }
      
      sanitized.dependencies = filteredDeps;
    }
    
    return sanitized;
  }
}

/**
 * Main security validation facade
 */
export class SecurityValidator {
  private pathValidator: PathValidator;
  private contentSanitizer: ContentSanitizer;
  private config: SecurityConfig;
  
  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
    this.pathValidator = new PathValidatorImpl(config);
    this.contentSanitizer = new ContentSanitizerImpl(config);
  }
  
  // Path validation methods
  sanitizeProjectPath(inputPath: string): string {
    return this.pathValidator.sanitizeProjectPath(inputPath);
  }
  
  validateWithinBoundaries(basePath: string, targetPath: string): boolean {
    return this.pathValidator.validateWithinBoundaries(basePath, targetPath);
  }
  
  normalizePath(inputPath: string): string {
    return this.pathValidator.normalizePath(inputPath);
  }
  
  // Content sanitization methods
  escapeHtml(content: string): string {
    return this.contentSanitizer.escapeHtml(content);
  }
  
  sanitizeMarkdown(content: string): string {
    return this.contentSanitizer.sanitizeMarkdown(content);
  }
  
  filterDangerousCommands(content: string): string {
    return this.contentSanitizer.filterDangerousCommands(content);
  }
  
  validatePackageJson(packageData: any): any {
    return this.contentSanitizer.validatePackageJson(packageData);
  }
  
  /**
   * Validate a complete project path for memory bank creation
   * @param projectRoot - Root directory of the project
   * @param requestedPath - Path where user wants to create memory bank
   * @returns Validated and sanitized path for memory bank creation
   */
  validateMemoryBankPath(projectRoot: string, requestedPath?: string): string {
    const sanitizedRoot = this.sanitizeProjectPath(projectRoot);
    
    if (!requestedPath) {
      // Default to .github/memory-bank within project
      return path.join(sanitizedRoot, '.github', 'memory-bank');
    }
    
    const sanitizedRequested = this.sanitizeProjectPath(requestedPath);
    
    // Ensure the requested path is within project boundaries
    if (!this.validateWithinBoundaries(sanitizedRoot, sanitizedRequested)) {
      if (this.config.logSecurityEvents) {
        console.warn(`Security: Memory bank path outside project boundaries: ${requestedPath}`);
      }
      // Return safe default within the original project root instead of allowing boundary violation
      return path.join(sanitizedRoot, '.github', 'memory-bank');
    }
    
    return path.join(sanitizedRequested, '.github', 'memory-bank');
  }
}

// Export singleton instance for convenience
export const securityValidator = new SecurityValidator();