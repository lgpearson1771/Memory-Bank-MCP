/**
 * Intelligence Types
 * Types related to the Project Intelligence Engine, AST parsing, and semantic analysis
 */

/**
 * Project Intelligence Engine Results
 */
export interface IntelligenceAnalysisResult {
  /** Deep file analysis results */
  deepFileAnalysis: DeepFileAnalysisResult;
  /** Semantic relationship mapping */
  semanticMapping: SemanticMappingResult;
  /** Dynamic content synthesis */
  contentSynthesis?: ContentSynthesisResult;
  /** Intelligence metadata */
  metadata: IntelligenceMetadata;
}

export interface IntelligenceMetadata {
  /** Analysis start time */
  startTime: Date;
  /** Analysis end time */
  endTime: Date;
  /** Files analyzed */
  filesAnalyzed: number;
  /** Intelligence version */
  intelligenceVersion: string;
  /** Processing phases completed */
  phasesCompleted: string[];
}

/**
 * Deep File Analysis Types
 */
export interface DeepFileAnalysisResult {
  /** File analyses */
  fileAnalyses: Map<string, FileAnalysis>;
  /** Aggregate insights */
  aggregateInsights: AggregateInsights;
  /** Quality metrics */
  qualityMetrics: FileAnalysisQualityMetrics;
}

export interface FileAnalysis {
  /** File path */
  filePath: string;
  /** File type */
  fileType: FileType;
  /** Language */
  language: string;
  /** AST analysis */
  astAnalysis?: ASTAnalysis;
  /** Content analysis */
  contentAnalysis: ContentAnalysis;
  /** Metadata */
  metadata: FileMetadata;
}

export type FileType = 
  | 'source'
  | 'test'
  | 'config'
  | 'documentation'
  | 'build'
  | 'assets'
  | 'data'
  | 'unknown';

export interface ASTAnalysis {
  /** AST nodes */
  nodes: ASTNode[];
  /** Exports */
  exports: ExportInfo[];
  /** Imports */
  imports: ImportInfo[];
  /** Classes */
  classes: ClassInfo[];
  /** Functions */
  functions: FunctionInfo[];
  /** Variables */
  variables: VariableInfo[];
  /** Types */
  types: TypeInfo[];
  /** Interfaces */
  interfaces: InterfaceInfo[];
  /** Complexity metrics */
  complexityMetrics: ComplexityMetrics;
}

export interface ASTNode {
  /** Node type */
  type: string;
  /** Node name */
  name?: string;
  /** Position */
  position: Position;
  /** Children */
  children: ASTNode[];
  /** Properties */
  properties: Record<string, unknown>;
}

export interface Position {
  /** Start line */
  startLine: number;
  /** Start column */
  startColumn: number;
  /** End line */
  endLine: number;
  /** End column */
  endColumn: number;
}

export interface ExportInfo {
  /** Export name */
  name: string;
  /** Export type */
  type: ExportType;
  /** Is default export */
  isDefault: boolean;
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export type ExportType = 'function' | 'class' | 'variable' | 'type' | 'interface' | 'namespace' | 'unknown';

export interface ImportInfo {
  /** Module path */
  modulePath: string;
  /** Import type */
  importType: ImportType;
  /** Named imports */
  namedImports: string[];
  /** Default import */
  defaultImport?: string;
  /** Namespace import */
  namespaceImport?: string;
  /** Position */
  position: Position;
}

export type ImportType = 'named' | 'default' | 'namespace' | 'side-effect';

export interface ClassInfo {
  /** Class name */
  name: string;
  /** Extends */
  extends?: string;
  /** Implements */
  implements: string[];
  /** Methods */
  methods: MethodInfo[];
  /** Properties */
  properties: PropertyInfo[];
  /** Is abstract */
  isAbstract: boolean;
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export interface MethodInfo {
  /** Method name */
  name: string;
  /** Parameters */
  parameters: ParameterInfo[];
  /** Return type */
  returnType?: string;
  /** Is static */
  isStatic: boolean;
  /** Is private */
  isPrivate: boolean;
  /** Is async */
  isAsync: boolean;
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export interface ParameterInfo {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type?: string;
  /** Is optional */
  isOptional: boolean;
  /** Default value */
  defaultValue?: string;
}

export interface PropertyInfo {
  /** Property name */
  name: string;
  /** Property type */
  type?: string;
  /** Is static */
  isStatic: boolean;
  /** Is private */
  isPrivate: boolean;
  /** Is readonly */
  isReadonly: boolean;
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export interface FunctionInfo {
  /** Function name */
  name: string;
  /** Parameters */
  parameters: ParameterInfo[];
  /** Return type */
  returnType?: string;
  /** Is async */
  isAsync: boolean;
  /** Is arrow function */
  isArrowFunction: boolean;
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export interface VariableInfo {
  /** Variable name */
  name: string;
  /** Variable type */
  type?: string;
  /** Declaration type */
  declarationType: VariableDeclarationType;
  /** Initial value */
  initialValue?: string;
  /** Position */
  position: Position;
}

export type VariableDeclarationType = 'var' | 'let' | 'const';

export interface TypeInfo {
  /** Type name */
  name: string;
  /** Type definition */
  definition: string;
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export interface InterfaceInfo {
  /** Interface name */
  name: string;
  /** Extends */
  extends: string[];
  /** Properties */
  properties: InterfacePropertyInfo[];
  /** Methods */
  methods: InterfaceMethodInfo[];
  /** Position */
  position: Position;
  /** Documentation */
  documentation?: string;
}

export interface InterfacePropertyInfo {
  /** Property name */
  name: string;
  /** Property type */
  type: string;
  /** Is optional */
  isOptional: boolean;
  /** Is readonly */
  isReadonly: boolean;
}

export interface InterfaceMethodInfo {
  /** Method name */
  name: string;
  /** Parameters */
  parameters: ParameterInfo[];
  /** Return type */
  returnType: string;
  /** Is optional */
  isOptional: boolean;
}

export interface ComplexityMetrics {
  /** Cyclomatic complexity */
  cyclomaticComplexity: number;
  /** Lines of code */
  linesOfCode: number;
  /** Function count */
  functionCount: number;
  /** Class count */
  classCount: number;
  /** Nesting depth */
  nestingDepth: number;
}

export interface ContentAnalysis {
  /** TODO comments */
  todos: TODOComment[];
  /** FIXME comments */
  fixmes: FIXMEComment[];
  /** Code smells */
  codeSmells: CodeSmell[];
  /** Dependencies used */
  dependenciesUsed: string[];
  /** Patterns detected */
  patternsDetected: string[];
}

export interface TODOComment {
  /** Comment text */
  text: string;
  /** Position */
  position: Position;
  /** Priority */
  priority?: string;
}

export interface FIXMEComment {
  /** Comment text */
  text: string;
  /** Position */
  position: Position;
  /** Severity */
  severity?: string;
}

export interface CodeSmell {
  /** Smell type */
  type: string;
  /** Description */
  description: string;
  /** Position */
  position: Position;
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FileMetadata {
  /** File size */
  size: number;
  /** Last modified */
  lastModified: Date;
  /** Creation date */
  creationDate?: Date;
  /** Line count */
  lineCount: number;
  /** Character count */
  characterCount: number;
}

export interface AggregateInsights {
  /** Architecture patterns */
  architecturePatterns: ArchitecturePattern[];
  /** Design patterns */
  designPatterns: DesignPattern[];
  /** Technology stack */
  technologyStack: TechnologyInfo[];
  /** Code quality overview */
  codeQualityOverview: CodeQualityOverview;
}

export interface ArchitecturePattern {
  /** Pattern name */
  name: string;
  /** Description */
  description: string;
  /** Confidence */
  confidence: number;
  /** Evidence */
  evidence: string[];
}

export interface DesignPattern {
  /** Pattern name */
  name: string;
  /** Description */
  description: string;
  /** Files involved */
  filesInvolved: string[];
  /** Confidence */
  confidence: number;
}

export interface TechnologyInfo {
  /** Technology name */
  name: string;
  /** Version */
  version?: string;
  /** Purpose */
  purpose: string;
  /** Files using */
  filesUsing: string[];
}

export interface CodeQualityOverview {
  /** Average complexity */
  averageComplexity: number;
  /** Total lines of code */
  totalLinesOfCode: number;
  /** Test coverage estimate */
  testCoverageEstimate: number;
  /** Documentation coverage */
  documentationCoverage: number;
}

export interface FileAnalysisQualityMetrics {
  /** Analysis completeness */
  analysisCompleteness: number;
  /** Parsing success rate */
  parsingSuccessRate: number;
  /** Files with errors */
  filesWithErrors: string[];
  /** Analysis duration */
  analysisDuration: number;
}

/**
 * Semantic Mapping Types
 */
export interface SemanticMappingResult {
  /** Relationship graph */
  relationshipGraph: RelationshipGraph;
  /** Context clusters */
  contextClusters: ContextCluster[];
  /** Semantic insights */
  semanticInsights: SemanticInsight[];
  /** Mapping quality metrics */
  qualityMetrics: SemanticMappingQualityMetrics;
}

export interface RelationshipGraph {
  /** Nodes */
  nodes: RelationshipNode[];
  /** Edges */
  edges: RelationshipEdge[];
  /** Graph metrics */
  metrics: GraphMetrics;
}

export interface RelationshipNode {
  /** Node ID */
  id: string;
  /** Node type */
  type: NodeType;
  /** Node name */
  name: string;
  /** File path */
  filePath: string;
  /** Properties */
  properties: Record<string, unknown>;
  /** Metadata */
  metadata: NodeMetadata;
}

export type NodeType = 
  | 'file'
  | 'class'
  | 'function'
  | 'interface'
  | 'type'
  | 'variable'
  | 'module'
  | 'namespace';

export interface NodeMetadata {
  /** Importance score */
  importanceScore: number;
  /** Centrality score */
  centralityScore: number;
  /** Complexity score */
  complexityScore: number;
}

export interface RelationshipEdge {
  /** Edge ID */
  id: string;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Relationship type */
  type: RelationshipType;
  /** Strength */
  strength: number;
  /** Properties */
  properties: Record<string, unknown>;
}

export type RelationshipType = 
  | 'imports'
  | 'exports'
  | 'extends'
  | 'implements'
  | 'uses'
  | 'calls'
  | 'references'
  | 'depends-on';

export interface GraphMetrics {
  /** Node count */
  nodeCount: number;
  /** Edge count */
  edgeCount: number;
  /** Density */
  density: number;
  /** Average clustering coefficient */
  averageClusteringCoefficient: number;
  /** Connected components */
  connectedComponents: number;
}

export interface ContextCluster {
  /** Cluster ID */
  id: string;
  /** Cluster name */
  name: string;
  /** Nodes in cluster */
  nodes: string[];
  /** Cluster type */
  type: ClusterType;
  /** Cohesion score */
  cohesionScore: number;
  /** Purpose */
  purpose: string;
}

export type ClusterType = 
  | 'feature'
  | 'layer'
  | 'domain'
  | 'utility'
  | 'infrastructure'
  | 'test';

export interface SemanticInsight {
  /** Insight type */
  type: InsightType;
  /** Description */
  description: string;
  /** Confidence */
  confidence: number;
  /** Supporting evidence */
  evidence: string[];
  /** Recommendations */
  recommendations: string[];
}

export type InsightType = 
  | 'architecture-pattern'
  | 'design-pattern'
  | 'code-smell'
  | 'optimization-opportunity'
  | 'refactoring-suggestion'
  | 'dependency-issue';

export interface SemanticMappingQualityMetrics {
  /** Mapping completeness */
  mappingCompleteness: number;
  /** Relationship accuracy */
  relationshipAccuracy: number;
  /** Clustering quality */
  clusteringQuality: number;
  /** Insight reliability */
  insightReliability: number;
}

/**
 * Content Synthesis Types
 */
export interface ContentSynthesisResult {
  /** Synthesized sections */
  synthesizedSections: SynthesizedSection[];
  /** Narrative structure */
  narrativeStructure: NarrativeStructure;
  /** Content quality metrics */
  qualityMetrics: ContentSynthesisQualityMetrics;
}

export interface SynthesizedSection {
  /** Section type */
  type: SectionType;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Sources */
  sources: string[];
  /** Confidence */
  confidence: number;
}

export type SectionType = 
  | 'overview'
  | 'architecture'
  | 'features'
  | 'implementation'
  | 'dependencies'
  | 'patterns'
  | 'quality'
  | 'recommendations';

export interface NarrativeStructure {
  /** Story arc */
  storyArc: StoryArcElement[];
  /** Key themes */
  keyThemes: string[];
  /** Logical flow */
  logicalFlow: FlowElement[];
}

export interface StoryArcElement {
  /** Element type */
  type: StoryElementType;
  /** Description */
  description: string;
  /** Supporting sections */
  supportingSections: string[];
}

export type StoryElementType = 
  | 'introduction'
  | 'problem'
  | 'solution'
  | 'implementation'
  | 'benefits'
  | 'conclusion';

export interface FlowElement {
  /** From section */
  from: string;
  /** To section */
  to: string;
  /** Connection type */
  connectionType: FlowConnectionType;
  /** Strength */
  strength: number;
}

export type FlowConnectionType = 
  | 'sequential'
  | 'causal'
  | 'elaborative'
  | 'contrastive'
  | 'supportive';

export interface ContentSynthesisQualityMetrics {
  /** Coherence score */
  coherenceScore: number;
  /** Completeness score */
  completenessScore: number;
  /** Accuracy score */
  accuracyScore: number;
  /** Readability score */
  readabilityScore: number;
}