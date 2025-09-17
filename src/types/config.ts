/**
 * Core configuration types for Memory Bank Generator MCP Server
 */

export interface MemoryBankConfig {
  /** Base path where memory banks will be stored */
  memoryBankPath: string;
  /** Path to memory bank templates */
  templatesPath: string;
  /** Default analysis depth for projects */
  defaultAnalysisDepth: AnalysisDepth;
  /** Whether to enable file watching for updates */
  enableFileWatching: boolean;
  /** Patterns to exclude from analysis */
  excludePatterns: string[];
  /** External integrations configuration */
  integrations: IntegrationsConfig;
}

export interface IntegrationsConfig {
  /** GitHub integration settings */
  github?: {
    enabled: boolean;
    token?: string;
  };
  /** Azure DevOps integration settings */
  azureDevOps?: {
    enabled: boolean;
    organization?: string;
    personalAccessToken?: string;
  };
  /** Custom integrations */
  custom?: Record<string, unknown>;
}

export type AnalysisDepth = 'basic' | 'detailed' | 'comprehensive';

export type UpdateStrategy = 'merge' | 'replace' | 'append';

export type SourceType = 'git' | 'github' | 'azure-devops' | 'documentation' | 'file-system';

/**
 * Project analysis types
 */

export interface ProjectStructure {
  /** Root path of the project */
  rootPath: string;
  /** Project type (detected automatically) */
  projectType: ProjectType;
  /** Main entry points */
  entryPoints: string[];
  /** Source directories */
  sourceDirectories: string[];
  /** Configuration files found */
  configFiles: ConfigFile[];
  /** Dependencies detected */
  dependencies: ProjectDependency[];
  /** File tree structure */
  fileTree: FileNode[];
  /** Project metadata */
  metadata: ProjectMetadata;
}

export interface ProjectMetadata {
  /** Project name */
  name: string;
  /** Project version */
  version?: string;
  /** Project description */
  description?: string;
  /** Main language(s) detected */
  languages: string[];
  /** License information */
  license?: string;
  /** Repository URL */
  repositoryUrl?: string;
  /** Author information */
  author?: string;
  /** Keywords/tags */
  keywords: string[];
}

export interface ProjectDependency {
  /** Dependency name */
  name: string;
  /** Dependency version */
  version: string;
  /** Dependency type */
  type: DependencyType;
  /** Whether it's a direct dependency */
  isDirect: boolean;
  /** Source file where it's used */
  source?: string;
}

export type DependencyType = 'production' | 'development' | 'peer' | 'optional';

export type ProjectType = 
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'unknown';

export interface ConfigFile {
  /** File path relative to project root */
  path: string;
  /** Type of configuration */
  type: ConfigFileType;
  /** Parsed content (if applicable) */
  content?: unknown;
}

export type ConfigFileType = 
  | 'package.json'
  | 'tsconfig.json'
  | 'requirements.txt'
  | 'pom.xml'
  | 'Cargo.toml'
  | 'composer.json'
  | 'Gemfile'
  | 'dockerfile'
  | 'docker-compose'
  | 'eslint'
  | 'prettier'
  | 'jest'
  | 'webpack'
  | 'vite'
  | 'other';

export interface FileNode {
  /** File/directory name */
  name: string;
  /** Full path */
  path: string;
  /** Whether it's a directory */
  isDirectory: boolean;
  /** File size in bytes (for files) */
  size?: number;
  /** Last modified timestamp */
  lastModified?: Date;
  /** Child nodes (for directories) */
  children?: FileNode[];
  /** File extension (for files) */
  extension?: string;
  /** Lines of code (for source files) */
  linesOfCode?: number;
}

/**
 * Context extraction types
 */

export interface ProjectContext {
  /** Project overview and purpose */
  purpose: string;
  /** Problem being solved */
  problemStatement: string;
  /** Solution approach */
  solutionOverview: string;
  /** Target users/audience */
  targetUsers: string[];
  /** Key features */
  keyFeatures: string[];
  /** Business value */
  businessValue?: string;
}

export interface TechnicalContext {
  /** Technology stack */
  technologyStack: TechnologyStack;
  /** Architecture patterns */
  architecturePatterns: string[];
  /** Dependencies and their purposes */
  dependencyAnalysis: DependencyAnalysis[];
  /** Build and deployment process */
  buildProcess: BuildProcess;
  /** Performance considerations */
  performanceNotes?: string[];
  /** Security considerations */
  securityNotes?: string[];
}

export interface TechnologyStack {
  /** Programming languages */
  languages: LanguageUsage[];
  /** Frameworks and libraries */
  frameworks: FrameworkUsage[];
  /** Development tools */
  tools: string[];
  /** Runtime environment */
  runtime: string;
  /** Database technologies */
  databases?: string[];
  /** Cloud/infrastructure */
  infrastructure?: string[];
}

export interface LanguageUsage {
  /** Language name */
  language: string;
  /** Percentage of codebase */
  percentage: number;
  /** Lines of code */
  linesOfCode: number;
  /** Primary use case */
  primaryUse: string;
}

export interface FrameworkUsage {
  /** Framework name */
  name: string;
  /** Framework version */
  version: string;
  /** Purpose/use case */
  purpose: string;
  /** Confidence in identification */
  confidence: number;
}

export interface DependencyAnalysis {
  /** Dependency name */
  name: string;
  /** Purpose in the project */
  purpose: string;
  /** Criticality level */
  criticality: CriticalityLevel;
  /** Update recommendations */
  updateNotes?: string;
}

export type CriticalityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface BuildProcess {
  /** Build tool used */
  buildTool: string;
  /** Build commands */
  buildCommands: string[];
  /** Output directory */
  outputDirectory: string;
  /** Environment requirements */
  environmentRequirements: string[];
  /** Deployment targets */
  deploymentTargets?: string[];
}

export interface ActiveContext {
  /** Current development focus */
  currentFocus: string[];
  /** Recent changes */
  recentChanges: RecentChange[];
  /** Active decisions */
  activeDecisions: Decision[];
  /** Implementation status */
  implementationStatus: ImplementationStatus;
  /** Next steps */
  nextSteps: string[];
}

export interface RecentChange {
  /** Type of change */
  type: ChangeType;
  /** Description */
  description: string;
  /** Timestamp */
  timestamp: Date;
  /** Files affected */
  filesAffected: string[];
  /** Impact assessment */
  impact: ImpactLevel;
}

export type ChangeType = 
  | 'feature'
  | 'bugfix'
  | 'refactor'
  | 'documentation'
  | 'configuration'
  | 'dependency'
  | 'security'
  | 'performance';

export type ImpactLevel = 'major' | 'minor' | 'patch';

export interface Decision {
  /** Decision title */
  title: string;
  /** Decision description */
  description: string;
  /** Decision status */
  status: DecisionStatus;
  /** Date made */
  dateMade?: Date;
  /** Rationale */
  rationale: string;
  /** Alternatives considered */
  alternatives?: string[];
  /** Implementation notes */
  implementationNotes?: string;
}

export type DecisionStatus = 'proposed' | 'accepted' | 'rejected' | 'superseded';

export interface ImplementationStatus {
  /** Overall completion percentage */
  overallProgress: number;
  /** Feature status breakdown */
  features: FeatureStatus[];
  /** Known issues */
  knownIssues: Issue[];
  /** Technical debt items */
  technicalDebt: TechnicalDebtItem[];
}

export interface FeatureStatus {
  /** Feature name */
  name: string;
  /** Status */
  status: FeatureStatusType;
  /** Completion percentage */
  progress: number;
  /** Description */
  description: string;
  /** Blockers */
  blockers?: string[];
}

export type FeatureStatusType = 
  | 'not-started'
  | 'in-progress'
  | 'testing'
  | 'completed'
  | 'blocked'
  | 'cancelled';

export interface Issue {
  /** Issue title */
  title: string;
  /** Issue description */
  description: string;
  /** Severity */
  severity: IssueSeverity;
  /** Status */
  status: IssueStatus;
  /** Files affected */
  filesAffected?: string[];
  /** Workaround */
  workaround?: string;
}

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'investigating' | 'resolved' | 'wontfix';

export interface TechnicalDebtItem {
  /** Description */
  description: string;
  /** Location in codebase */
  location: string;
  /** Estimated effort to resolve */
  effort: EffortLevel;
  /** Priority */
  priority: PriorityLevel;
  /** Impact if not resolved */
  impactIfNotResolved: string;
}

export type EffortLevel = 'small' | 'medium' | 'large' | 'epic';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SystemPatterns {
  /** Code patterns identified */
  codePatterns: CodePattern[];
  /** Communication flows */
  communicationFlows: CommunicationFlow[];
  /** Best practices being followed */
  bestPractices: BestPractice[];
  /** Anti-patterns detected */
  antiPatterns: AntiPattern[];
  /** Evolution patterns */
  evolutionPatterns: EvolutionPattern[];
}

export interface CodePattern {
  /** Pattern name */
  name: string;
  /** Pattern type */
  type: CodePatternType;
  /** Description */
  description: string;
  /** Usage frequency */
  frequency: number;
  /** Example locations */
  examples: string[];
  /** Benefits */
  benefits?: string[];
}

export type CodePatternType = 
  | 'design-pattern'
  | 'architectural-pattern'
  | 'coding-convention'
  | 'naming-convention'
  | 'error-handling'
  | 'testing-pattern'
  | 'documentation-pattern';

export interface CommunicationFlow {
  /** Flow name */
  name: string;
  /** Source component */
  source: string;
  /** Target component */
  target: string;
  /** Communication type */
  type: CommunicationType;
  /** Frequency */
  frequency: FlowFrequency;
  /** Data format */
  dataFormat?: string;
}

export type CommunicationType = 
  | 'function-call'
  | 'event'
  | 'api-call'
  | 'database-query'
  | 'file-io'
  | 'network-request'
  | 'message-queue';

export type FlowFrequency = 'very-high' | 'high' | 'medium' | 'low' | 'rare';

export interface BestPractice {
  /** Practice name */
  name: string;
  /** Category */
  category: BestPracticeCategory;
  /** Description */
  description: string;
  /** Evidence of usage */
  evidence: string[];
  /** Compliance level */
  complianceLevel: ComplianceLevel;
}

export type BestPracticeCategory = 
  | 'code-quality'
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'testing'
  | 'documentation'
  | 'accessibility'
  | 'internationalization';

export type ComplianceLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface AntiPattern {
  /** Anti-pattern name */
  name: string;
  /** Description */
  description: string;
  /** Severity */
  severity: IssueSeverity;
  /** Locations where found */
  locations: string[];
  /** Recommended fix */
  recommendedFix: string;
  /** Risk if not addressed */
  risk: string;
}

export interface EvolutionPattern {
  /** Pattern name */
  name: string;
  /** Description */
  description: string;
  /** Timeline */
  timeline: EvolutionEvent[];
  /** Trend direction */
  trend: TrendDirection;
  /** Prediction */
  prediction?: string;
}

export interface EvolutionEvent {
  /** Event timestamp */
  timestamp: Date;
  /** Event type */
  type: EvolutionEventType;
  /** Description */
  description: string;
  /** Impact */
  impact: ImpactLevel;
}

export type EvolutionEventType = 
  | 'architecture-change'
  | 'technology-adoption'
  | 'refactoring'
  | 'feature-addition'
  | 'dependency-update'
  | 'performance-improvement'
  | 'security-enhancement';

export type TrendDirection = 'improving' | 'stable' | 'declining' | 'unknown';

/**
 * Memory bank types
 */

export interface MemoryBank {
  /** Memory bank metadata */
  metadata: MemoryBankMetadata;
  /** Project context */
  projectContext: ProjectContext;
  /** Technical context */
  technicalContext: TechnicalContext;
  /** Active context */
  activeContext: ActiveContext;
  /** System patterns */
  systemPatterns: SystemPatterns;
  /** Progress information */
  progress: ProgressTracking;
}

export interface MemoryBankMetadata {
  /** Version of the memory bank */
  version: string;
  /** Project path */
  projectPath: string;
  /** Generation timestamp */
  generatedAt: Date;
  /** Last updated timestamp */
  lastUpdatedAt: Date;
  /** Generator version */
  generatorVersion: string;
  /** Analysis depth used */
  analysisDepth: AnalysisDepth;
  /** Confidence score */
  confidenceScore: number;
}

export interface ProgressTracking {
  /** Development timeline */
  timeline: TimelineEvent[];
  /** Feature roadmap */
  roadmap: RoadmapItem[];
  /** Milestones */
  milestones: Milestone[];
  /** Metrics */
  metrics: ProjectMetrics;
}

export interface TimelineEvent {
  /** Event timestamp */
  timestamp: Date;
  /** Event type */
  type: TimelineEventType;
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** Associated features/components */
  associatedItems?: string[];
}

export type TimelineEventType = 
  | 'project-start'
  | 'milestone'
  | 'release'
  | 'major-refactor'
  | 'architecture-change'
  | 'team-change'
  | 'technology-change';

export interface RoadmapItem {
  /** Item title */
  title: string;
  /** Item description */
  description: string;
  /** Priority */
  priority: PriorityLevel;
  /** Estimated completion */
  estimatedCompletion?: Date;
  /** Status */
  status: FeatureStatusType;
  /** Dependencies */
  dependencies?: string[];
  /** Assignee */
  assignee?: string;
}

export interface Milestone {
  /** Milestone name */
  name: string;
  /** Milestone description */
  description: string;
  /** Target date */
  targetDate: Date;
  /** Completion percentage */
  completionPercentage: number;
  /** Associated deliverables */
  deliverables: string[];
  /** Status */
  status: MilestoneStatus;
}

export type MilestoneStatus = 'upcoming' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';

export interface ProjectMetrics {
  /** Lines of code */
  linesOfCode: number;
  /** Number of files */
  numberOfFiles: number;
  /** Code coverage percentage */
  codeCoverage?: number;
  /** Number of dependencies */
  numberOfDependencies: number;
  /** Complexity metrics */
  complexity?: ComplexityMetrics;
  /** Quality metrics */
  quality?: QualityMetrics;
}

export interface ComplexityMetrics {
  /** Cyclomatic complexity */
  cyclomaticComplexity?: number;
  /** Cognitive complexity */
  cognitiveComplexity?: number;
  /** Halstead metrics */
  halsteadMetrics?: HalsteadMetrics;
}

export interface HalsteadMetrics {
  /** Program length */
  programLength: number;
  /** Program vocabulary */
  programVocabulary: number;
  /** Program volume */
  programVolume: number;
  /** Program difficulty */
  programDifficulty: number;
  /** Programming effort */
  programmingEffort: number;
}

export interface QualityMetrics {
  /** Maintainability index */
  maintainabilityIndex?: number;
  /** Technical debt ratio */
  technicalDebtRatio?: number;
  /** Duplication percentage */
  duplicationPercentage?: number;
  /** Security hotspots */
  securityHotspots?: number;
}

/**
 * Git analysis types
 */

export interface GitContext {
  /** Repository information */
  repository: GitRepository;
  /** Commit history */
  commitHistory: GitCommit[];
  /** Branch information */
  branches: GitBranch[];
  /** Contributors */
  contributors: GitContributor[];
  /** Activity patterns */
  activityPatterns: GitActivityPattern[];
}

export interface GitRepository {
  /** Repository URL */
  url?: string;
  /** Current branch */
  currentBranch: string;
  /** Remote repositories */
  remotes: GitRemote[];
  /** Repository age */
  age: number; // days
  /** Total commits */
  totalCommits: number;
}

export interface GitRemote {
  /** Remote name */
  name: string;
  /** Remote URL */
  url: string;
  /** Remote type */
  type: 'origin' | 'upstream' | 'other';
}

export interface GitCommit {
  /** Commit hash */
  hash: string;
  /** Commit message */
  message: string;
  /** Author */
  author: string;
  /** Author email */
  authorEmail: string;
  /** Commit date */
  date: Date;
  /** Files changed */
  filesChanged: string[];
  /** Lines added */
  linesAdded: number;
  /** Lines deleted */
  linesDeleted: number;
}

export interface GitBranch {
  /** Branch name */
  name: string;
  /** Whether it's the current branch */
  isCurrent: boolean;
  /** Whether it's a remote branch */
  isRemote: boolean;
  /** Last commit hash */
  lastCommit: string;
  /** Last commit date */
  lastCommitDate: Date;
}

export interface GitContributor {
  /** Contributor name */
  name: string;
  /** Contributor email */
  email: string;
  /** Number of commits */
  commitCount: number;
  /** Lines contributed */
  linesContributed: number;
  /** First contribution date */
  firstContribution: Date;
  /** Last contribution date */
  lastContribution: Date;
}

export interface GitActivityPattern {
  /** Pattern type */
  type: ActivityPatternType;
  /** Pattern description */
  description: string;
  /** Frequency */
  frequency: FlowFrequency;
  /** Time period */
  timePeriod: TimePeriod;
}

export type ActivityPatternType = 
  | 'daily-commits'
  | 'weekly-cycles'
  | 'release-cycles'
  | 'contributor-patterns'
  | 'file-hotspots'
  | 'refactoring-patterns';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Validation types
 */

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation score (0-100) */
  score: number;
  /** Validation issues */
  issues: ValidationIssue[];
  /** Recommendations */
  recommendations: ValidationRecommendation[];
}

export interface ValidationIssue {
  /** Issue type */
  type: ValidationIssueType;
  /** Issue severity */
  severity: IssueSeverity;
  /** Issue message */
  message: string;
  /** Location of issue */
  location?: string;
  /** How to fix */
  fixSuggestion?: string;
}

export type ValidationIssueType = 
  | 'missing-content'
  | 'inconsistent-data'
  | 'outdated-information'
  | 'formatting-error'
  | 'incomplete-analysis'
  | 'confidence-too-low';

export interface ValidationRecommendation {
  /** Recommendation type */
  type: RecommendationType;
  /** Recommendation message */
  message: string;
  /** Priority */
  priority: PriorityLevel;
  /** Implementation effort */
  effort: EffortLevel;
}

export type RecommendationType = 
  | 'improve-analysis'
  | 'add-missing-context'
  | 'update-stale-data'
  | 'enhance-categorization'
  | 'increase-detail-level'
  | 'validate-external-sources';