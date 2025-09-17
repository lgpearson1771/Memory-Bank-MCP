/**
 * MCP Tools definitions for Memory Bank Generator
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
  analysis: ProjectAnalysisResult;
  /** Analysis metadata */
  metadata: AnalysisMetadata;
  /** Confidence score */
  confidenceScore: number;
  /** Analysis duration */
  durationMs: number;
}

export interface GenerateMemoryBankOutput {
  /** Generated memory bank */
  memoryBank: MemoryBankResult;
  /** Generation metadata */
  metadata: GenerationMetadata;
  /** Files created */
  filesCreated: string[];
  /** Generation duration */
  durationMs: number;
}

export interface UpdateMemoryBankOutput {
  /** Updated memory bank */
  memoryBank: MemoryBankResult;
  /** Update metadata */
  metadata: UpdateMetadata;
  /** Files modified */
  filesModified: string[];
  /** Changes applied */
  changesApplied: ChangeRecord[];
  /** Update duration */
  durationMs: number;
}

export interface ExtractFromSourceOutput {
  /** Extracted information */
  extractedData: ExtractedData;
  /** Extraction metadata */
  metadata: ExtractionMetadata;
  /** Source information */
  sourceInfo: SourceInfo;
  /** Extraction duration */
  durationMs: number;
}

export interface CategorizeInformationOutput {
  /** Categorized information */
  categorizedData: CategorizedInformation[];
  /** Categorization metadata */
  metadata: CategorizationMetadata;
  /** Confidence scores */
  confidenceScores: Record<string, number>;
  /** Categorization duration */
  durationMs: number;
}

export interface ValidateMemoryBankOutput {
  /** Validation result */
  validation: MemoryBankValidationResult;
  /** Quality score */
  qualityScore: number;
  /** Validation issues found */
  issues: ValidationIssueResult[];
  /** Recommendations */
  recommendations: ValidationRecommendationResult[];
  /** Validation duration */
  durationMs: number;
}

/**
 * Supporting types
 */

export type MemoryBankCategory = 
  | 'projectContext'
  | 'technicalContext'
  | 'activeContext'
  | 'systemPatterns'
  | 'progress'
  | 'all';

export interface ProjectChanges {
  /** Files added */
  addedFiles?: string[];
  /** Files modified */
  modifiedFiles?: string[];
  /** Files deleted */
  deletedFiles?: string[];
  /** Dependency changes */
  dependencyChanges?: DependencyChange[];
  /** Configuration changes */
  configChanges?: ConfigChange[];
  /** Git commits */
  commits?: CommitChange[];
}

export interface DependencyChange {
  /** Change type */
  type: 'added' | 'removed' | 'updated';
  /** Dependency name */
  name: string;
  /** Old version (for updates/removals) */
  oldVersion?: string;
  /** New version (for additions/updates) */
  newVersion?: string;
  /** Dependency type */
  dependencyType: 'production' | 'development' | 'peer' | 'optional';
}

export interface ConfigChange {
  /** Configuration file affected */
  file: string;
  /** Change type */
  type: 'added' | 'modified' | 'deleted';
  /** Specific changes */
  changes?: Record<string, unknown>;
}

export interface CommitChange {
  /** Commit hash */
  hash: string;
  /** Commit message */
  message: string;
  /** Author */
  author: string;
  /** Timestamp */
  timestamp: Date;
  /** Files affected */
  filesAffected: string[];
}

export interface SourceConfig {
  /** GitHub configuration */
  github?: GitHubSourceConfig;
  /** Azure DevOps configuration */
  azureDevOps?: AzureDevOpsSourceConfig;
  /** Git repository configuration */
  git?: GitSourceConfig;
  /** Documentation configuration */
  documentation?: DocumentationSourceConfig;
  /** File system configuration */
  fileSystem?: FileSystemSourceConfig;
}

export interface GitHubSourceConfig {
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** GitHub token */
  token?: string;
  /** Branch to analyze */
  branch?: string;
  /** Include issues */
  includeIssues?: boolean;
  /** Include pull requests */
  includePullRequests?: boolean;
  /** Include releases */
  includeReleases?: boolean;
}

export interface AzureDevOpsSourceConfig {
  /** Organization name */
  organization: string;
  /** Project name */
  project: string;
  /** Repository name */
  repository: string;
  /** Personal access token */
  token?: string;
  /** Include work items */
  includeWorkItems?: boolean;
  /** Include pull requests */
  includePullRequests?: boolean;
}

export interface GitSourceConfig {
  /** Repository path */
  repositoryPath: string;
  /** Branch to analyze */
  branch?: string;
  /** Number of commits to analyze */
  commitLimit?: number;
  /** Include diff analysis */
  includeDiffs?: boolean;
}

export interface DocumentationSourceConfig {
  /** Documentation paths */
  paths: string[];
  /** File patterns to include */
  includePatterns?: string[];
  /** File patterns to exclude */
  excludePatterns?: string[];
  /** Parse markdown */
  parseMarkdown?: boolean;
}

export interface FileSystemSourceConfig {
  /** Base path */
  basePath: string;
  /** Include patterns */
  includePatterns?: string[];
  /** Exclude patterns */
  excludePatterns?: string[];
  /** Follow symlinks */
  followSymlinks?: boolean;
}

export interface ExtractionRule {
  /** Rule name */
  name: string;
  /** Rule type */
  type: ExtractionRuleType;
  /** Pattern to match */
  pattern?: string;
  /** Target category */
  targetCategory?: MemoryBankCategory;
  /** Priority */
  priority?: number;
  /** Whether rule is enabled */
  enabled?: boolean;
}

export type ExtractionRuleType = 
  | 'regex'
  | 'keyword'
  | 'semantic'
  | 'structural'
  | 'metadata'
  | 'custom';

export type OutputFormat = 'json' | 'markdown' | 'yaml' | 'text';

export interface InformationItem {
  /** Information content */
  content: string;
  /** Source of information */
  source: string;
  /** Information type */
  type: InformationType;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Confidence score */
  confidence?: number;
}

export type InformationType = 
  | 'code-comment'
  | 'documentation'
  | 'commit-message'
  | 'issue-description'
  | 'readme-section'
  | 'config-value'
  | 'dependency-description'
  | 'error-message'
  | 'log-entry'
  | 'other';

export type CategorizationStrategy = 
  | 'keyword-based'
  | 'semantic-similarity'
  | 'rule-based'
  | 'ml-classification'
  | 'hybrid';

export interface ValidationRule {
  /** Rule name */
  name: string;
  /** Rule type */
  type: ValidationRuleType;
  /** Rule configuration */
  config?: Record<string, unknown>;
  /** Severity if rule fails */
  severity?: 'error' | 'warning' | 'info';
  /** Whether rule is enabled */
  enabled?: boolean;
}

export type ValidationRuleType = 
  | 'completeness'
  | 'consistency'
  | 'accuracy'
  | 'freshness'
  | 'format'
  | 'custom';

/**
 * Result types
 */

export interface ProjectAnalysisResult {
  /** Project structure */
  projectStructure: ProjectStructureResult;
  /** Context analysis */
  contextAnalysis: ContextAnalysisResult;
  /** Pattern analysis */
  patternAnalysis: PatternAnalysisResult;
  /** Git analysis */
  gitAnalysis?: GitAnalysisResult;
  /** Quality metrics */
  qualityMetrics: QualityMetricsResult;
}

export interface ProjectStructureResult {
  /** Basic project information */
  basicInfo: BasicProjectInfo;
  /** File structure */
  fileStructure: FileStructureResult;
  /** Dependencies */
  dependencies: DependencyResult[];
  /** Configuration */
  configuration: ConfigurationResult;
}

export interface BasicProjectInfo {
  /** Project name */
  name: string;
  /** Project type */
  type: string;
  /** Primary language */
  primaryLanguage: string;
  /** Languages used */
  languages: string[];
  /** Project size */
  size: ProjectSizeInfo;
}

export interface ProjectSizeInfo {
  /** Lines of code */
  linesOfCode: number;
  /** Number of files */
  fileCount: number;
  /** Number of directories */
  directoryCount: number;
  /** Repository size in bytes */
  sizeBytes: number;
}

export interface FileStructureResult {
  /** Source directories */
  sourceDirectories: string[];
  /** Test directories */
  testDirectories: string[];
  /** Documentation directories */
  documentationDirectories: string[];
  /** Configuration files */
  configurationFiles: string[];
  /** Entry points */
  entryPoints: string[];
}

export interface DependencyResult {
  /** Dependency name */
  name: string;
  /** Version */
  version: string;
  /** Type */
  type: string;
  /** Purpose */
  purpose?: string;
  /** Last updated */
  lastUpdated?: Date;
  /** Security vulnerabilities */
  vulnerabilities?: SecurityVulnerability[];
}

export interface SecurityVulnerability {
  /** Vulnerability ID */
  id: string;
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Description */
  description: string;
  /** Affected versions */
  affectedVersions: string;
  /** Fixed version */
  fixedVersion?: string;
}

export interface ConfigurationResult {
  /** Build configuration */
  buildConfig?: BuildConfigInfo;
  /** Test configuration */
  testConfig?: TestConfigInfo;
  /** Linting configuration */
  lintConfig?: LintConfigInfo;
  /** Environment configuration */
  envConfig?: EnvConfigInfo;
}

export interface BuildConfigInfo {
  /** Build tool */
  tool: string;
  /** Build script */
  script?: string;
  /** Output directory */
  outputDir?: string;
  /** Source maps enabled */
  sourceMaps?: boolean;
}

export interface TestConfigInfo {
  /** Test framework */
  framework?: string;
  /** Test script */
  script?: string;
  /** Coverage enabled */
  coverage?: boolean;
  /** Test directories */
  testDirs?: string[];
}

export interface LintConfigInfo {
  /** Linter used */
  linter?: string;
  /** Rules configuration */
  rules?: Record<string, unknown>;
  /** Ignored patterns */
  ignoredPatterns?: string[];
}

export interface EnvConfigInfo {
  /** Environment variables */
  variables?: string[];
  /** Configuration files */
  configFiles?: string[];
  /** Secrets detected */
  secretsDetected?: boolean;
}

export interface ContextAnalysisResult {
  /** Project purpose */
  purpose?: string;
  /** Domain */
  domain?: string;
  /** Target audience */
  targetAudience?: string[];
  /** Key features */
  keyFeatures?: string[];
  /** Business value */
  businessValue?: string;
}

export interface PatternAnalysisResult {
  /** Architectural patterns */
  architecturalPatterns: string[];
  /** Design patterns */
  designPatterns: string[];
  /** Code conventions */
  codeConventions: string[];
  /** Anti-patterns */
  antiPatterns: AntiPatternResult[];
}

export interface AntiPatternResult {
  /** Pattern name */
  name: string;
  /** Description */
  description: string;
  /** Locations */
  locations: string[];
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Recommendation */
  recommendation: string;
}

export interface GitAnalysisResult {
  /** Repository info */
  repositoryInfo: GitRepositoryInfo;
  /** Commit analysis */
  commitAnalysis: GitCommitAnalysis;
  /** Contributor analysis */
  contributorAnalysis: GitContributorAnalysis;
  /** Activity patterns */
  activityPatterns: GitActivityPatternResult[];
}

export interface GitRepositoryInfo {
  /** Current branch */
  currentBranch: string;
  /** Total branches */
  totalBranches: number;
  /** Total commits */
  totalCommits: number;
  /** Repository age (days) */
  age: number;
  /** Remote URL */
  remoteUrl?: string;
}

export interface GitCommitAnalysis {
  /** Recent commits */
  recentCommits: RecentCommitInfo[];
  /** Commit frequency */
  commitFrequency: CommitFrequencyInfo;
  /** Commit message patterns */
  messagePatterns: CommitMessagePattern[];
}

export interface RecentCommitInfo {
  /** Commit hash */
  hash: string;
  /** Message */
  message: string;
  /** Author */
  author: string;
  /** Date */
  date: Date;
  /** Files changed */
  filesChanged: number;
  /** Lines changed */
  linesChanged: number;
}

export interface CommitFrequencyInfo {
  /** Daily average */
  dailyAverage: number;
  /** Weekly average */
  weeklyAverage: number;
  /** Monthly average */
  monthlyAverage: number;
  /** Peak activity periods */
  peakPeriods: string[];
}

export interface CommitMessagePattern {
  /** Pattern type */
  type: string;
  /** Pattern */
  pattern: string;
  /** Frequency */
  frequency: number;
  /** Examples */
  examples: string[];
}

export interface GitContributorAnalysis {
  /** Total contributors */
  totalContributors: number;
  /** Active contributors */
  activeContributors: number;
  /** Top contributors */
  topContributors: ContributorInfo[];
  /** Contribution distribution */
  contributionDistribution: ContributionDistribution;
}

export interface ContributorInfo {
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Commit count */
  commits: number;
  /** Lines contributed */
  linesContributed: number;
  /** First contribution */
  firstContribution: Date;
  /** Last contribution */
  lastContribution: Date;
}

export interface ContributionDistribution {
  /** Top contributor percentage */
  topContributorPercentage: number;
  /** Top 5 contributors percentage */
  top5ContributorPercentage: number;
  /** Gini coefficient */
  giniCoefficient: number;
}

export interface GitActivityPatternResult {
  /** Pattern name */
  name: string;
  /** Description */
  description: string;
  /** Confidence */
  confidence: number;
  /** Supporting data */
  data: Record<string, unknown>;
}

export interface QualityMetricsResult {
  /** Code quality score */
  codeQualityScore: number;
  /** Maintainability score */
  maintainabilityScore: number;
  /** Security score */
  securityScore: number;
  /** Performance score */
  performanceScore?: number;
  /** Test coverage */
  testCoverage?: number;
  /** Documentation coverage */
  documentationCoverage?: number;
}

export interface MemoryBankResult {
  /** Memory bank content */
  content: MemoryBankContent;
  /** Metadata */
  metadata: MemoryBankMetadataResult;
  /** File paths */
  filePaths: Record<MemoryBankCategory, string>;
}

export interface MemoryBankContent {
  /** Project context content */
  projectContext?: string;
  /** Technical context content */
  technicalContext?: string;
  /** Active context content */
  activeContext?: string;
  /** System patterns content */
  systemPatterns?: string;
  /** Progress content */
  progress?: string;
}

export interface MemoryBankMetadataResult {
  /** Generation timestamp */
  generatedAt: Date;
  /** Generator version */
  generatorVersion: string;
  /** Analysis depth */
  analysisDepth: AnalysisDepth;
  /** Confidence score */
  confidenceScore: number;
  /** Source project path */
  sourceProjectPath: string;
}

export interface AnalysisMetadata {
  /** Analysis start time */
  startTime: Date;
  /** Analysis end time */
  endTime: Date;
  /** Files analyzed */
  filesAnalyzed: number;
  /** Analysis depth */
  analysisDepth: AnalysisDepth;
  /** Analysis version */
  analysisVersion: string;
}

export interface GenerationMetadata {
  /** Template used */
  templateUsed?: string;
  /** Categories generated */
  categoriesGenerated: MemoryBankCategory[];
  /** Generation strategy */
  generationStrategy: string;
  /** Quality checks performed */
  qualityChecks: string[];
}

export interface UpdateMetadata {
  /** Update strategy used */
  updateStrategy: UpdateStrategy;
  /** Categories updated */
  categoriesUpdated: MemoryBankCategory[];
  /** Change detection method */
  changeDetectionMethod: string;
  /** Conflicts resolved */
  conflictsResolved: number;
}

export interface ChangeRecord {
  /** Change type */
  type: 'addition' | 'modification' | 'deletion';
  /** Category affected */
  category: MemoryBankCategory;
  /** Section affected */
  section?: string;
  /** Change description */
  description: string;
  /** Confidence score */
  confidence: number;
}

export interface ExtractedData {
  /** Raw data extracted */
  rawData: Record<string, unknown>;
  /** Structured data */
  structuredData: StructuredExtractionResult[];
  /** Metadata */
  extractionMetadata: ExtractionDataMetadata;
}

export interface StructuredExtractionResult {
  /** Data type */
  type: string;
  /** Content */
  content: string;
  /** Source location */
  source: string;
  /** Confidence */
  confidence: number;
  /** Relevant categories */
  relevantCategories: MemoryBankCategory[];
}

export interface ExtractionDataMetadata {
  /** Source type */
  sourceType: SourceType;
  /** Extraction timestamp */
  extractedAt: Date;
  /** Items extracted */
  itemsExtracted: number;
  /** Extraction rules applied */
  rulesApplied: string[];
}

export interface ExtractionMetadata {
  /** Extraction start time */
  startTime: Date;
  /** Extraction end time */
  endTime: Date;
  /** Source connection info */
  sourceConnectionInfo: SourceConnectionInfo;
  /** Extraction rules used */
  rulesUsed: ExtractionRule[];
}

export interface SourceConnectionInfo {
  /** Connection successful */
  connectionSuccessful: boolean;
  /** Connection details */
  connectionDetails?: Record<string, unknown>;
  /** Authentication used */
  authenticationUsed?: boolean;
  /** Rate limits encountered */
  rateLimitsEncountered?: boolean;
}

export interface SourceInfo {
  /** Source type */
  type: SourceType;
  /** Source identifier */
  identifier: string;
  /** Source version */
  version?: string;
  /** Last updated */
  lastUpdated?: Date;
}

export interface CategorizedInformation {
  /** Original information */
  originalInfo: InformationItem;
  /** Assigned category */
  assignedCategory: MemoryBankCategory;
  /** Confidence score */
  confidence: number;
  /** Reasoning */
  reasoning?: string;
  /** Alternative categories */
  alternativeCategories?: MemoryBankCategory[];
}

export interface CategorizationMetadata {
  /** Strategy used */
  strategyUsed: CategorizationStrategy;
  /** Total items processed */
  totalItemsProcessed: number;
  /** Successfully categorized */
  successfullyCategorized: number;
  /** Average confidence */
  averageConfidence: number;
}

export interface MemoryBankValidationResult {
  /** Overall validation status */
  isValid: boolean;
  /** Validation score */
  score: number;
  /** Categories validated */
  categoriesValidated: MemoryBankCategory[];
  /** Validation timestamp */
  validatedAt: Date;
}

export interface ValidationIssueResult {
  /** Issue ID */
  id: string;
  /** Issue type */
  type: string;
  /** Severity */
  severity: 'error' | 'warning' | 'info';
  /** Message */
  message: string;
  /** Category affected */
  category?: MemoryBankCategory;
  /** Location */
  location?: string;
  /** Suggested fix */
  suggestedFix?: string;
}

export interface ValidationRecommendationResult {
  /** Recommendation ID */
  id: string;
  /** Recommendation type */
  type: string;
  /** Priority */
  priority: 'high' | 'medium' | 'low';
  /** Description */
  description: string;
  /** Implementation effort */
  effort: 'small' | 'medium' | 'large';
  /** Expected benefit */
  expectedBenefit: string;
}