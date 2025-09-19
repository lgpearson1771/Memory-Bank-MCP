/**
 * MCP Protocol Types
 * Core MCP tool input/output schemas and protocol-related types
 */

import { AnalysisDepth, UpdateStrategy, SourceType } from './config.js';

/**
 * Tool input schemas
 */

export interface AnalyzeProjectInput {
  /** Path to the project to analyze */
  projectPath: string;
  /** Depth of analysis to perform */
  analysisDepth?: AnalysisDepth;
  /** Whether to include git history in analysis */
  includeHistory?: boolean;
  /** Patterns to exclude from analysis */
  excludePatterns?: string[];
  /** Force reanalysis even if cache exists */
  forceReanalysis?: boolean;
}

export interface GenerateMemoryBankInput {
  /** Path to the project to generate memory bank for */
  projectPath: string;
  /** Path where memory bank should be created */
  outputPath?: string;
  /** Template to use for generation */
  template?: string;
  /** Specific categories to generate */
  categories?: MemoryBankCategory[];
  /** Analysis depth for generation */
  analysisDepth?: AnalysisDepth;
  /** Whether to overwrite existing memory bank */
  overwrite?: boolean;
}

export interface UpdateMemoryBankInput {
  /** Path to existing memory bank */
  memoryBankPath: string;
  /** Changes to apply */
  changes?: ProjectChanges;
  /** Strategy for updating */
  updateStrategy?: UpdateStrategy;
  /** Specific categories to update */
  categories?: MemoryBankCategory[];
  /** Whether to validate after update */
  validate?: boolean;
}

export interface ExtractFromSourceInput {
  /** Type of source to extract from */
  sourceType: SourceType;
  /** Configuration for the source */
  sourceConfig: SourceConfig;
  /** Rules for extraction */
  extractionRules?: ExtractionRule[];
  /** Output format */
  outputFormat?: OutputFormat;
}

export interface CategorizeInformationInput {
  /** Information to categorize */
  information: InformationItem[];
  /** Target memory bank categories */
  targetCategories?: MemoryBankCategory[];
  /** Categorization strategy */
  strategy?: CategorizationStrategy;
  /** Confidence threshold */
  confidenceThreshold?: number;
}

export interface ValidateMemoryBankInput {
  /** Path to memory bank to validate */
  memoryBankPath: string;
  /** Validation rules to apply */
  validationRules?: ValidationRule[];
  /** Whether to include recommendations */
  includeRecommendations?: boolean;
  /** Minimum quality score required */
  minimumQualityScore?: number;
}

/**
 * Tool output schemas
 */

export interface AnalyzeProjectOutput {
  /** Analysis results */
  analysis: Record<string, unknown>;
  /** Analysis metadata */
  metadata: Record<string, unknown>;
  /** Confidence score */
  confidenceScore: number;
  /** Analysis duration */
  durationMs: number;
}

export interface GenerateMemoryBankOutput {
  /** Generated memory bank */
  memoryBank: Record<string, unknown>;
  /** Generation metadata */
  metadata: Record<string, unknown>;
  /** Quality score */
  qualityScore: number;
  /** Generation duration */
  durationMs: number;
}

export interface UpdateMemoryBankOutput {
  /** Updated memory bank */
  memoryBank: Record<string, unknown>;
  /** Update metadata */
  metadata: Record<string, unknown>;
  /** Changes applied */
  changesApplied: Record<string, unknown>[];
  /** Update duration */
  durationMs: number;
}

export interface ExtractFromSourceOutput {
  /** Extracted information */
  extractedData: Record<string, unknown>[];
  /** Source metadata */
  sourceMetadata: SourceMetadata;
  /** Quality metrics */
  qualityMetrics: Record<string, unknown>;
  /** Extraction duration */
  durationMs: number;
}

export interface CategorizeInformationOutput {
  /** Categorized information */
  categorizedData: Record<string, unknown>[];
  /** Categorization metadata */
  metadata: Record<string, unknown>;
  /** Confidence scores */
  confidenceScores: Record<string, unknown>[];
  /** Categorization duration */
  durationMs: number;
}

export interface ValidateMemoryBankOutput {
  /** Validation results */
  validationResults: Record<string, unknown>[];
  /** Overall validation status */
  isValid: boolean;
  /** Quality score */
  qualityScore: number;
  /** Recommendations */
  recommendations: Record<string, unknown>[];
  /** Validation duration */
  durationMs: number;
}

/**
 * Memory Bank Categories
 */
export type MemoryBankCategory = 
  | 'project-overview'
  | 'architecture'
  | 'dependencies'
  | 'configuration'
  | 'development'
  | 'deployment'
  | 'testing'
  | 'documentation'
  | 'security'
  | 'performance'
  | 'monitoring'
  | 'troubleshooting';

/**
 * Source Configuration Types
 */
export interface SourceConfig {
  /** Type of source */
  type: SourceType;
  /** Base configuration */
  baseConfig: Record<string, any>;
  /** Authentication configuration */
  authConfig?: AuthConfig;
  /** Rate limiting configuration */
  rateLimitConfig?: RateLimitConfig;
  /** Timeout configuration */
  timeoutConfig?: TimeoutConfig;
}

export interface AuthConfig {
  /** Authentication type */
  type: 'token' | 'basic' | 'oauth' | 'ssh-key';
  /** Authentication credentials */
  credentials: Record<string, string>;
  /** Additional auth parameters */
  parameters?: Record<string, any>;
}

export interface RateLimitConfig {
  /** Requests per minute */
  requestsPerMinute: number;
  /** Burst allowance */
  burstAllowance?: number;
  /** Retry configuration */
  retryConfig?: RetryConfig;
}

export interface TimeoutConfig {
  /** Connection timeout in ms */
  connectionTimeout: number;
  /** Request timeout in ms */
  requestTimeout: number;
  /** Total operation timeout in ms */
  operationTimeout: number;
}

export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Base delay between retries in ms */
  baseDelayMs: number;
  /** Exponential backoff multiplier */
  backoffMultiplier: number;
  /** Maximum delay between retries in ms */
  maxDelayMs: number;
}

/**
 * Output Formats
 */
export type OutputFormat = 'json' | 'markdown' | 'yaml' | 'text';

/**
 * Basic Metadata Types
 */
export interface SourceMetadata {
  /** Source timestamp */
  timestamp: string;
  /** Source version/revision */
  version?: string;
  /** Source configuration used */
  configuration: Record<string, any>;
  /** Access metadata */
  accessMetadata?: AccessMetadata;
}

export interface AccessMetadata {
  /** Access timestamp */
  accessedAt: string;
  /** Access method */
  accessMethod: string;
  /** Rate limit status */
  rateLimitStatus?: RateLimitStatus;
  /** Data freshness */
  dataFreshness?: string;
}

export interface RateLimitStatus {
  /** Remaining requests */
  remaining: number;
  /** Reset timestamp */
  resetAt: string;
  /** Rate limit exceeded */
  exceeded: boolean;
}

export interface PerformanceMetrics {
  /** CPU usage percentage */
  cpuUsage?: number;
  /** Memory usage in MB */
  memoryUsage?: number;
  /** Disk I/O operations */
  diskIo?: number;
  /** Network requests made */
  networkRequests?: number;
  /** Cache hit rate */
  cacheHitRate?: number;
}

// Forward declarations for types defined in other modules
export interface ProjectChanges {
  /** Added files */
  addedFiles?: string[];
  /** Modified files */
  modifiedFiles?: string[];
  /** Deleted files */
  deletedFiles?: string[];
  /** Dependency changes */
  dependencyChanges?: DependencyChange[];
  /** Configuration changes */
  configChanges?: ConfigChange[];
  /** Commit changes */
  commitChanges?: CommitChange[];
  /** Timestamp of changes */
  timestamp: string;
  /** Change description */
  description?: string;
  /** Change author */
  author?: string;
}

export interface DependencyChange {
  /** Package name */
  packageName: string;
  /** Change type */
  changeType: 'added' | 'updated' | 'removed';
  /** Previous version */
  previousVersion?: string;
  /** New version */
  newVersion?: string;
  /** Dependency type */
  dependencyType: 'runtime' | 'development' | 'peer' | 'optional';
  /** Change impact */
  impact: 'low' | 'medium' | 'high';
}

export interface ConfigChange {
  /** Configuration file path */
  filePath: string;
  /** Change type */
  changeType: 'added' | 'modified' | 'removed';
  /** Changed properties */
  changedProperties: string[];
  /** Change description */
  description?: string;
  /** Change impact */
  impact: 'low' | 'medium' | 'high';
}

export interface CommitChange {
  /** Commit hash */
  hash: string;
  /** Commit message */
  message: string;
  /** Commit author */
  author: string;
  /** Commit timestamp */
  timestamp: string;
  /** Files changed */
  filesChanged: string[];
  /** Commit impact */
  impact: 'low' | 'medium' | 'high';
}

export interface ExtractionRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule type */
  type: ExtractionRuleType;
  /** Rule pattern */
  pattern: string;
  /** Target categories */
  targetCategories: MemoryBankCategory[];
  /** Rule priority */
  priority: number;
  /** Rule enabled status */
  enabled: boolean;
  /** Rule configuration */
  configuration?: Record<string, any>;
}

export type ExtractionRuleType = 
  | 'regex'
  | 'xpath'
  | 'css-selector'
  | 'json-path'
  | 'yaml-path'
  | 'custom';

export interface InformationItem {
  /** Item identifier */
  id: string;
  /** Item content */
  content: string;
  /** Item type */
  type: InformationType;
  /** Item metadata */
  metadata: Record<string, any>;
  /** Item source */
  source: string;
  /** Item timestamp */
  timestamp: string;
  /** Item confidence score */
  confidenceScore?: number;
}

export type InformationType = 
  | 'code'
  | 'documentation'
  | 'configuration'
  | 'dependency'
  | 'test'
  | 'build'
  | 'deployment'
  | 'security'
  | 'performance'
  | 'monitoring'
  | 'other';

export type CategorizationStrategy = 
  | 'keyword-based'
  | 'pattern-based'
  | 'ml-based'
  | 'rule-based'
  | 'hybrid';

export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule type */
  type: ValidationRuleType;
  /** Rule severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Rule enabled status */
  enabled: boolean;
  /** Rule configuration */
  configuration?: Record<string, any>;
  /** Rule message template */
  messageTemplate?: string;
}

export type ValidationRuleType = 
  | 'completeness'
  | 'consistency'
  | 'accuracy'
  | 'freshness'
  | 'structure'
  | 'content-quality'
  | 'format'
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'custom';

/**
 * Error metadata for project analysis errors
 */
export interface ErrorMetadata {
  /** Error details */
  details: string;
  /** Recovery suggestions */
  suggestions?: string[];
}