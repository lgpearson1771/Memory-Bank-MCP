/**
 * Generation Types
 * Types related to memory bank generation, content generation, and template handling
 */

/**
 * Memory Bank Generation Configuration
 */
export interface MemoryBankConfig {
  /** Project root path */
  projectRootPath: string;
  /** Generation mode */
  mode: GenerationMode;
  /** Structure type */
  structureType: StructureType;
  /** Detail level */
  detailLevel: DetailLevel;
  /** Focus areas */
  focusAreas?: string[];
  /** Custom folders */
  customFolders?: CustomFolderConfig[];
  /** Additional files */
  additionalFiles?: AdditionalFilesConfig;
  /** Validation settings */
  validation?: ValidationConfig;
}

export type GenerationMode = 'analyze-first' | 'guided' | 'express' | 'custom';
export type StructureType = 'standard' | 'enhanced' | 'custom';
export type DetailLevel = 'brief' | 'standard' | 'comprehensive';

export interface CustomFolderConfig {
  /** Folder name */
  name: string;
  /** Description */
  description: string;
  /** File patterns */
  filePatterns: string[];
}

export interface AdditionalFilesConfig {
  /** API documentation */
  api?: boolean;
  /** Deployment documentation */
  deployment?: boolean;
  /** Feature documentation */
  features?: boolean;
  /** Integration documentation */
  integrations?: boolean;
  /** Security documentation */
  security?: boolean;
  /** Testing documentation */
  testing?: boolean;
}

export interface ValidationConfig {
  /** Enable sync validation */
  syncValidation?: boolean;
  /** Enable content validation */
  contentValidation?: boolean;
  /** Auto confirm */
  autoConfirm?: boolean;
}

/**
 * Memory Bank Generation Results
 */
export interface MemoryBankGenerationResult {
  /** Generation successful */
  success: boolean;
  /** Generated files */
  generatedFiles: GeneratedFile[];
  /** Validation results */
  validationResults?: ValidationResult;
  /** Generation metadata */
  metadata: GenerationMetadata;
  /** Warnings */
  warnings?: string[];
  /** Errors */
  errors?: string[];
}

export interface GeneratedFile {
  /** File path */
  filePath: string;
  /** File type */
  type: MemoryBankFileType;
  /** Content */
  content: string;
  /** Size in bytes */
  size: number;
  /** Generated at */
  generatedAt: Date;
  /** Template used */
  templateUsed?: string;
}

export type MemoryBankFileType = 
  | 'project-context'
  | 'technical-context'
  | 'system-patterns'
  | 'active-context'
  | 'progress'
  | 'api-docs'
  | 'deployment-docs'
  | 'feature-docs'
  | 'integration-docs'
  | 'security-docs'
  | 'testing-docs'
  | 'custom';

export interface ValidationResult {
  /** Overall validation passed */
  passed: boolean;
  /** Content validation results */
  contentValidation?: ContentValidationResult;
  /** Sync validation results */
  syncValidation?: SyncValidationResult;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

export interface ContentValidationResult {
  /** Content completeness score */
  completenessScore: number;
  /** Content quality score */
  qualityScore: number;
  /** Missing sections */
  missingSections: string[];
  /** Quality issues */
  qualityIssues: ContentQualityIssue[];
}

export interface ContentQualityIssue {
  /** Issue type */
  type: string;
  /** Description */
  description: string;
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Location */
  location?: string;
  /** Suggestion */
  suggestion?: string;
}

export interface SyncValidationResult {
  /** Sync successful */
  syncSuccessful: boolean;
  /** Conflicts found */
  conflictsFound: ConflictInfo[];
  /** Auto-resolved conflicts */
  autoResolvedConflicts: string[];
  /** Manual resolution required */
  manualResolutionRequired: string[];
}

export interface ConflictInfo {
  /** Conflict type */
  type: string;
  /** Description */
  description: string;
  /** Source */
  source: string;
  /** Target */
  target: string;
  /** Resolution options */
  resolutionOptions: string[];
}

export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Location */
  location?: string;
  /** Severity */
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Location */
  location?: string;
  /** Recommendation */
  recommendation?: string;
}

export interface GenerationMetadata {
  /** Generation start time */
  startTime: Date;
  /** Generation end time */
  endTime: Date;
  /** Generation mode used */
  mode: GenerationMode;
  /** Analysis results used */
  analysisResults?: string;
  /** Templates used */
  templatesUsed: string[];
  /** Generation version */
  generationVersion: string;
}

/**
 * Content Generation Engine Types
 */
export interface ContentGenerationRequest {
  /** Template type */
  templateType: ContentTemplateType;
  /** Context data */
  context: ContentGenerationContext;
  /** Generation options */
  options?: ContentGenerationOptions;
}

export type ContentTemplateType = 
  | 'project-overview'
  | 'technical-architecture'
  | 'api-documentation'
  | 'system-patterns'
  | 'deployment-guide'
  | 'feature-documentation'
  | 'integration-guide'
  | 'security-documentation'
  | 'testing-guide'
  | 'progress-summary'
  | 'custom';

export interface ContentGenerationContext {
  /** Project analysis results */
  projectAnalysis: any; // Reference to ProjectAnalysisResult
  /** Intelligence results */
  intelligenceResults?: any; // Reference to IntelligenceAnalysisResult
  /** Template variables */
  templateVariables: Record<string, unknown>;
  /** Additional context */
  additionalContext?: Record<string, unknown>;
}

export interface ContentGenerationOptions {
  /** Writing style */
  writingStyle?: WritingStyle;
  /** Target audience */
  targetAudience?: TargetAudience;
  /** Include examples */
  includeExamples?: boolean;
  /** Include diagrams */
  includeDiagrams?: boolean;
  /** Detail level */
  detailLevel?: DetailLevel;
}

export type WritingStyle = 'professional' | 'technical' | 'casual' | 'academic' | 'executive';
export type TargetAudience = 'developers' | 'architects' | 'managers' | 'stakeholders' | 'mixed';

export interface ContentGenerationResult {
  /** Generated content */
  content: string;
  /** Content type */
  contentType: ContentTemplateType;
  /** Quality metrics */
  qualityMetrics: ContentQualityMetrics;
  /** Generation metadata */
  metadata: ContentGenerationMetadata;
}

export interface ContentQualityMetrics {
  /** Specificity score (0-100) */
  specificityScore: number;
  /** Professional tone score (0-100) */
  professionalToneScore: number;
  /** Technical accuracy score (0-100) */
  technicalAccuracyScore: number;
  /** Business context score (0-100) */
  businessContextScore: number;
  /** Narrative coherence score (0-100) */
  narrativeCoherenceScore: number;
  /** Overall quality score (0-100) */
  overallQualityScore: number;
}

export interface ContentGenerationMetadata {
  /** Template used */
  templateUsed: string;
  /** Generation time */
  generationTime: Date;
  /** Processing time (ms) */
  processingTime: number;
  /** Content length */
  contentLength: number;
  /** Variables used */
  variablesUsed: string[];
}

/**
 * Template Engine Types
 */
export interface TemplateDefinition {
  /** Template name */
  name: string;
  /** Template type */
  type: ContentTemplateType;
  /** Template content */
  content: string;
  /** Required variables */
  requiredVariables: string[];
  /** Optional variables */
  optionalVariables?: string[];
  /** Default values */
  defaultValues?: Record<string, unknown>;
  /** Template metadata */
  metadata: TemplateMetadata;
}

export interface TemplateMetadata {
  /** Version */
  version: string;
  /** Author */
  author?: string;
  /** Description */
  description: string;
  /** Tags */
  tags: string[];
  /** Created date */
  createdDate: Date;
  /** Last modified */
  lastModified: Date;
}

export interface TemplateProcessingContext {
  /** Variables */
  variables: Record<string, unknown>;
  /** Functions */
  functions?: Record<string, Function>;
  /** Settings */
  settings?: TemplateSettings;
}

export interface TemplateSettings {
  /** Strip whitespace */
  stripWhitespace?: boolean;
  /** Escape HTML */
  escapeHtml?: boolean;
  /** Custom delimiters */
  customDelimiters?: {
    start: string;
    end: string;
  };
}

export interface TemplateProcessingResult {
  /** Processed content */
  content: string;
  /** Variables used */
  variablesUsed: string[];
  /** Processing errors */
  errors: TemplateError[];
  /** Processing warnings */
  warnings: TemplateWarning[];
}

export interface TemplateError {
  /** Error type */
  type: string;
  /** Error message */
  message: string;
  /** Line number */
  line?: number;
  /** Column number */
  column?: number;
}

export interface TemplateWarning {
  /** Warning type */
  type: string;
  /** Warning message */
  message: string;
  /** Line number */
  line?: number;
  /** Column number */
  column?: number;
}

/**
 * Update and Maintenance Types
 */
export interface UpdateConfig {
  /** Update type */
  updateType: UpdateType;
  /** Specific files to update */
  specificFiles?: string[];
  /** Update options */
  options?: UpdateOptions;
}

export type UpdateType = 'incremental' | 'full-refresh' | 'specific-files';

export interface UpdateOptions {
  /** Preserve manual changes */
  preserveManualChanges?: boolean;
  /** Backup before update */
  backupBeforeUpdate?: boolean;
  /** Force update */
  forceUpdate?: boolean;
  /** Update validation */
  validateUpdate?: boolean;
}

export interface UpdateResult {
  /** Update successful */
  success: boolean;
  /** Updated files */
  updatedFiles: UpdatedFileInfo[];
  /** Validation results */
  validationResults?: ValidationResult;
  /** Update metadata */
  metadata: UpdateMetadata;
  /** Conflicts */
  conflicts?: UpdateConflict[];
}

export interface UpdatedFileInfo {
  /** File path */
  filePath: string;
  /** Update type */
  updateType: 'created' | 'modified' | 'deleted';
  /** Changes made */
  changes: FileChange[];
  /** Backup created */
  backupCreated?: string;
}

export interface FileChange {
  /** Change type */
  type: 'addition' | 'deletion' | 'modification';
  /** Description */
  description: string;
  /** Line numbers affected */
  linesAffected?: number[];
  /** Content changed */
  contentChanged?: boolean;
}

export interface UpdateMetadata {
  /** Update start time */
  startTime: Date;
  /** Update end time */
  endTime: Date;
  /** Update type */
  updateType: UpdateType;
  /** Files processed */
  filesProcessed: number;
  /** Update version */
  updateVersion: string;
}

export interface UpdateConflict {
  /** Conflict type */
  type: string;
  /** File path */
  filePath: string;
  /** Description */
  description: string;
  /** Resolution required */
  resolutionRequired: boolean;
  /** Resolution options */
  resolutionOptions: string[];
}