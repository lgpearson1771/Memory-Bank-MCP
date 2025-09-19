/**
 * Analysis Types
 * Types related to project analysis, git analysis, and quality metrics
 */

/**
 * Project Analysis Results
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

/**
 * Git Analysis Types
 */
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

/**
 * Quality Metrics
 */
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

/**
 * Analysis Metadata Types
 */
export interface AnalysisMetadata {
  /** Analysis start time */
  startTime: Date;
  /** Analysis end time */
  endTime: Date;
  /** Files analyzed */
  filesAnalyzed: number;
  /** Analysis depth */
  analysisDepth: string;
  /** Analysis version */
  analysisVersion: string;
}

/**
 * Source and Extraction Analysis Types
 */
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
  type: string;
  /** Source identifier */
  identifier: string;
  /** Source version */
  version?: string;
  /** Last updated */
  lastUpdated?: Date;
}

export interface ExtractionDataMetadata {
  /** Source type */
  sourceType: string;
  /** Extraction timestamp */
  extractedAt: Date;
  /** Items extracted */
  itemsExtracted: number;
  /** Extraction rules applied */
  rulesApplied: string[];
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
  relevantCategories: string[];
}

export interface ExtractedData {
  /** Raw data extracted */
  rawData: Record<string, unknown>;
  /** Structured data */
  structuredData: StructuredExtractionResult[];
  /** Metadata */
  extractionMetadata: ExtractionDataMetadata;
}