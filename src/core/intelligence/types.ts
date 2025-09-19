/**
 * Intelligence Engine Type Definitions
 * Core interfaces and types for the Project Intelligence Engine
 */

// Core AST interface
export interface AbstractSyntaxTree {
  language: ProgrammingLanguage;
  rootNode: any;
  sourceFile: string;
  parseSuccess: boolean;
}

/**
 * Core Intelligence Interfaces
 */
export interface ProjectIntelligence {
  // Deep analysis results
  codeAnalysis: CodeAnalysisResult;
  architecturalPatterns: ArchitecturalPattern[];
  businessContext: BusinessIntelligence;
  relationships: RelationshipGraph;
  
  // Intelligence metadata
  analysisCompleteness: number;
  confidenceScore: number;
  complexityAssessment: ProjectComplexityLevel;
  qualityMetrics: IntelligenceQualityMetrics;
}

export interface CodeAnalysisResult {
  // File-level analysis
  parsedFiles: ParsedFile[];
  syntaxTrees: AbstractSyntaxTree[];
  
  // Code understanding
  functions: FunctionAnalysis[];
  components: ComponentAnalysis[];
  dataStructures: DataStructureAnalysis[];
  
  // Architecture insights
  layerArchitecture: LayerAnalysis;
  designPatterns: DesignPatternDetection[];
  codeQuality: CodeQualityMetrics;
}

export interface ParsedFile {
  filePath: string;
  language: ProgrammingLanguage;
  ast: any; // Language-specific AST
  parseSuccess: boolean;
  parseErrors: ParseError[];
  metadata: FileMetadata;
}

export interface FunctionAnalysis {
  name: string;
  signature: string;
  businessPurpose: string;
  complexity: ComplexityMetrics;
  dependencies: string[];
  callers: string[];
  businessLogic: BusinessLogicExtraction[];
}

export interface ComponentAnalysis {
  name: string;
  type: ComponentType;
  responsibility: string;
  interfaces: InterfaceDefinition[];
  dependencies: ComponentDependency[];
  designPatterns: string[];
  qualityScore: number;
}

export interface ArchitecturalPattern {
  type: ArchitecturalPatternType;
  confidence: number;
  evidence: PatternEvidence[];
  description: string;
  implications: ArchitecturalImplication[];
}

export interface BusinessIntelligence {
  // Extracted business context
  problemStatement: string;
  valueProposition: string;
  targetUsers: UserAnalysis[];
  businessGoals: BusinessGoal[];
  
  // Strategic context
  domainAnalysis: DomainAnalysis;
  marketPosition: MarketPositioning;
  competitiveAdvantages: CompetitiveAdvantage[];
  
  // Operational context
  businessProcesses: BusinessProcess[];
  userJourneys: UserJourney[];
  integrationPoints: BusinessIntegration[];
}

export interface RelationshipGraph {
  // Component relationships
  dependencies: DependencyEdge[];
  dataFlow: DataFlowEdge[];
  communicationPatterns: CommunicationEdge[];
  
  // Graph analysis
  stronglyConnectedComponents: ComponentCluster[];
  criticalPaths: CriticalPath[];
  architecturalLayers: ArchitecturalLayer[];
}

// Supporting type definitions
export type ProgrammingLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Java' | 'CSharp' | 'Go' | 'Rust' | 'Unknown';
export type ComponentType = 'Controller' | 'Service' | 'Repository' | 'Model' | 'Utility' | 'Configuration' | 'Test' | 'Unknown';
export type ArchitecturalPatternType = 'MVC' | 'Microservices' | 'Pipeline' | 'EventDriven' | 'Layered' | 'DomainDriven' | 'Unknown';
export type ProjectComplexityLevel = 'Simple' | 'Moderate' | 'Complex' | 'Enterprise';

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  dependencies: number;
}

export interface BusinessLogicExtraction {
  description: string;
  businessValue: string;
  userImpact: string;
  riskFactors: string[];
}

export interface PatternEvidence {
  type: 'file-structure' | 'naming-convention' | 'dependency-pattern' | 'code-organization';
  evidence: string;
  confidence: number;
}

export interface IntelligenceQualityMetrics {
  analysisDepth: number;
  businessContextRichness: number;
  technicalAccuracy: number;
  architecturalUnderstanding: number;
}

// Additional supporting interfaces
export interface ParseError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

export interface FileMetadata {
  size: number;
  lastModified: Date;
  encoding: string;
  lineCount: number;
}

export interface InterfaceDefinition {
  name: string;
  methods: string[];
  properties: string[];
  purpose: string;
}

export interface ComponentDependency {
  target: string;
  type: 'uses' | 'extends' | 'implements' | 'composes';
  strength: number;
}

export interface ArchitecturalImplication {
  type: 'scalability' | 'maintainability' | 'performance' | 'security' | 'complexity';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface UserAnalysis {
  type: string;
  needs: string[];
  painPoints: string[];
  benefits: string[];
}

export interface BusinessGoal {
  description: string;
  priority: 'high' | 'medium' | 'low';
  measurable: boolean;
  timeline: string;
}

export interface DomainAnalysis {
  industry: string;
  subdomain: string;
  keyProcesses: string[];
  regulations: string[];
  stakeholders: string[];
}

export interface MarketPositioning {
  targetMarket: string;
  competitiveAdvantage: string;
  marketSize: 'niche' | 'medium' | 'large';
  growthStage: 'startup' | 'growth' | 'mature';
}

export interface CompetitiveAdvantage {
  type: 'technical' | 'business' | 'operational';
  description: string;
  sustainability: 'low' | 'medium' | 'high';
}

export interface BusinessProcess {
  name: string;
  description: string;
  actors: string[];
  steps: ProcessStep[];
  systemTouchpoints: string[];
}

export interface ProcessStep {
  order: number;
  description: string;
  systemComponent?: string;
  businessValue: string;
}

export interface UserJourney {
  persona: string;
  goal: string;
  touchpoints: JourneyTouchpoint[];
  painPoints: string[];
  opportunities: string[];
}

export interface JourneyTouchpoint {
  step: string;
  systemComponent: string;
  userAction: string;
  systemResponse: string;
  emotionalState: 'frustrated' | 'neutral' | 'satisfied' | 'delighted';
}

export interface BusinessIntegration {
  type: 'system' | 'process' | 'data';
  description: string;
  stakeholders: string[];
  businessValue: string;
  technicalImplementation: string;
}

export interface DataStructureAnalysis {
  name: string;
  type: 'interface' | 'class' | 'enum' | 'type' | 'schema';
  properties: PropertyAnalysis[];
  methods: MethodAnalysis[];
  businessPurpose: string;
  domainConcept: string;
}

export interface PropertyAnalysis {
  name: string;
  type: string;
  businessMeaning: string;
  validation: ValidationRule[];
  relationships: PropertyRelationship[];
}

export interface MethodAnalysis {
  name: string;
  signature: string;
  businessOperation: string;
  sideEffects: string[];
  businessRules: BusinessRule[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'custom';
  description: string;
  businessReason: string;
}

export interface PropertyRelationship {
  relatedProperty: string;
  relationship: 'depends-on' | 'validates' | 'derived-from';
  description: string;
}

export interface BusinessRule {
  description: string;
  condition: string;
  action: string;
  businessJustification: string;
}

export interface LayerAnalysis {
  layers: ArchitecturalLayer[];
  layerViolations: LayerViolation[];
  cohesion: number;
  coupling: number;
}

export interface ArchitecturalLayer {
  name: string;
  responsibility: string;
  components: string[];
  dependencies: string[];
  businessPurpose: string;
}

export interface LayerViolation {
  type: 'upward-dependency' | 'layer-skipping' | 'circular-dependency';
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface DesignPatternDetection {
  pattern: string;
  confidence: number;
  implementation: PatternImplementation;
  businessBenefit: string;
  maintainabilityImpact: 'positive' | 'neutral' | 'negative';
}

export interface PatternImplementation {
  files: string[];
  keyComponents: string[];
  relationships: string[];
  adherenceScore: number;
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  technicalDebt: TechnicalDebtAnalysis;
  testCoverage: TestCoverageAnalysis;
  documentationScore: number;
  performanceIndicators: PerformanceIndicator[];
}

export interface TechnicalDebtAnalysis {
  totalDebt: number;
  debtByCategory: DebtCategory[];
  criticalIssues: TechnicalIssue[];
  recommendation: DebtRemediation[];
}

export interface DebtCategory {
  category: 'code-smell' | 'duplication' | 'complexity' | 'security' | 'performance';
  amount: number;
  impact: 'low' | 'medium' | 'high';
}

export interface TechnicalIssue {
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
}

export interface DebtRemediation {
  action: string;
  effort: 'low' | 'medium' | 'high';
  businessValue: string;
  priority: number;
}

export interface TestCoverageAnalysis {
  overallCoverage: number;
  unitTestCoverage: number;
  integrationTestCoverage: number;
  untested: UntestedComponent[];
  testQuality: TestQualityMetric[];
}

export interface UntestedComponent {
  component: string;
  riskLevel: 'low' | 'medium' | 'high';
  businessCriticality: string;
  recommendedTests: string[];
}

export interface TestQualityMetric {
  metric: string;
  score: number;
  recommendation: string;
}

export interface PerformanceIndicator {
  metric: string;
  value: number;
  threshold: number;
  businessImpact: string;
  optimization: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'import' | 'inheritance' | 'composition' | 'usage';
  strength: number;
  businessRelationship: string;
}

export interface DataFlowEdge {
  source: string;
  target: string;
  dataType: string;
  businessPurpose: string;
  transformation: DataTransformation[];
}

export interface DataTransformation {
  operation: string;
  businessReason: string;
  validation: ValidationRule[];
}

export interface CommunicationEdge {
  source: string;
  target: string;
  protocol: 'synchronous' | 'asynchronous' | 'event' | 'message';
  businessTrigger: string;
  errorHandling: ErrorHandlingStrategy[];
}

export interface ErrorHandlingStrategy {
  errorType: string;
  strategy: 'retry' | 'fallback' | 'circuit-breaker' | 'fail-fast';
  businessImpact: string;
}

export interface ComponentCluster {
  components: string[];
  cohesionScore: number;
  businessPurpose: string;
  refactoringRecommendation: string;
}

export interface CriticalPath {
  components: string[];
  businessProcess: string;
  riskFactors: RiskFactor[];
  mitigation: RiskMitigation[];
}

export interface RiskFactor {
  type: 'technical' | 'business' | 'operational';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface RiskMitigation {
  strategy: string;
  effort: 'low' | 'medium' | 'high';
  effectiveness: 'low' | 'medium' | 'high';
  businessValue: string;
}

// TypeScript-specific analysis interfaces
export interface TSAnalysisResult {
  interfaces: TSInterfaceAnalysis[];
  classes: TSClassAnalysis[];
  enums: TSEnumAnalysis[];
  functions: TSFunctionAnalysis[];
  modules: TSModuleAnalysis[];
  imports: TSImportAnalysis[];
  exports: TSExportAnalysis[];
  components: TSComponentAnalysis[];
  routes: TSRouteAnalysis[];
  businessContext: TSBusinessContext;
  complexity: number;
  patterns: string[];
  dependencies: string[];
}

export interface TSInterfaceAnalysis {
  name: string;
  properties: TSPropertyAnalysis[];
  methods: TSMethodSignature[];
  inheritance: string[];
  businessPurpose: string;
  domainConcept: string;
  usagePatterns: string[];
}

export interface TSClassAnalysis {
  name: string;
  constructor: TSConstructorAnalysis;
  properties: TSPropertyAnalysis[];
  methods: TSMethodAnalysis[];
  inheritance: TSInheritanceAnalysis;
  interfaces: string[];
  businessRole: string;
  designPatterns: string[];
  responsibilities: string[];
}

export interface TSEnumAnalysis {
  name: string;
  values: TSEnumValue[];
  businessDomain: string;
  usageContext: string[];
}

export interface TSFunctionAnalysis {
  name: string;
  signature: TSFunctionSignature;
  parameters: TSParameterAnalysis[];
  returnType: string;
  businessLogic: BusinessLogicExtraction[];
  sideEffects: string[];
  errorHandling: string[];
}

export interface TSModuleAnalysis {
  name: string;
  exports: string[];
  imports: TSImportAnalysis[];
  businessPurpose: string;
  cohesion: number;
  coupling: number;
}

export interface TSImportAnalysis {
  module: string;
  imports: string[];
  usage: string[];
  businessDependency: string;
}

export interface TSExportAnalysis {
  name: string;
  type: 'interface' | 'class' | 'function' | 'constant' | 'type';
  businessValue: string;
  consumers: string[];
}

export interface TSComponentAnalysis {
  name: string;
  type: 'react' | 'angular' | 'vue' | 'generic';
  props: TSPropertyAnalysis[];
  state: TSPropertyAnalysis[];
  lifecycle: TSLifecycleAnalysis[];
  businessPurpose: string;
  userInteractions: UserInteractionAnalysis[];
}

export interface TSRouteAnalysis {
  path: string;
  component: string;
  guards: string[];
  businessProcess: string;
  userJourney: string;
  securityRequirements: string[];
}

export interface TSBusinessContext {
  domainConcepts: DomainConceptMapping[];
  businessRules: BusinessRuleImplementation[];
  workflows: WorkflowAnalysis[];
  stakeholders: StakeholderAnalysis[];
  purpose?: string;
  domain?: string;
  concepts?: string[];
}

export interface TSPropertyAnalysis {
  name: string;
  type: string;
  optional: boolean;
  businessMeaning: string;
  validation: ValidationRule[];
  defaultValue?: any;
}

export interface TSMethodSignature {
  name: string;
  parameters: TSParameterAnalysis[];
  returnType: string;
  businessOperation: string;
}

export interface TSMethodAnalysis extends TSMethodSignature {
  implementation: string;
  businessLogic: BusinessLogicExtraction[];
  errorHandling: string[];
  performance: PerformanceCharacteristics;
}

export interface TSConstructorAnalysis {
  parameters: TSParameterAnalysis[];
  initialization: InitializationAnalysis[];
  businessSetup: string;
}

export interface TSInheritanceAnalysis {
  superClass?: string;
  businessRelationship: string;
  overrides: TSMethodOverride[];
}

export interface TSEnumValue {
  name: string;
  value: string | number;
  businessMeaning: string;
  usageContext: string[];
}

export interface TSFunctionSignature {
  parameters: TSParameterAnalysis[];
  returnType: string;
  generics: string[];
  modifiers: string[];
}

export interface TSParameterAnalysis {
  name: string;
  type: string;
  optional: boolean;
  businessPurpose: string;
  validation: ValidationRule[];
}

export interface TSLifecycleAnalysis {
  method: string;
  businessTrigger: string;
  sideEffects: string[];
  performanceImplications: string[];
}

export interface UserInteractionAnalysis {
  trigger: string;
  businessAction: string;
  systemResponse: string;
  errorScenarios: string[];
}

export interface DomainConceptMapping {
  technicalName: string;
  businessName: string;
  description: string;
  relationships: ConceptRelationship[];
}

export interface ConceptRelationship {
  relatedConcept: string;
  relationship: 'is-a' | 'has-a' | 'uses' | 'depends-on';
  businessContext: string;
}

export interface BusinessRuleImplementation {
  rule: string;
  implementation: string[];
  enforcement: 'validation' | 'constraint' | 'process';
  businessJustification: string;
}

export interface WorkflowAnalysis {
  name: string;
  steps: WorkflowStep[];
  businessValue: string;
  stakeholders: string[];
  systemComponents: string[];
}

export interface WorkflowStep {
  order: number;
  description: string;
  actor: string;
  systemAction: string;
  businessDecision?: BusinessDecision;
}

export interface BusinessDecision {
  criteria: string;
  outcomes: DecisionOutcome[];
  businessImpact: string;
}

export interface DecisionOutcome {
  condition: string;
  action: string;
  nextStep: number;
}

export interface StakeholderAnalysis {
  role: string;
  responsibilities: string[];
  systemInteractions: string[];
  businessGoals: string[];
}

export interface InitializationAnalysis {
  property: string;
  value: string;
  businessReason: string;
  dependencies: string[];
}

export interface TSMethodOverride {
  method: string;
  businessReason: string;
  changedBehavior: string[];
}

export interface PerformanceCharacteristics {
  complexity: string;
  resourceUsage: ResourceUsage;
  optimizations: string[];
  bottlenecks: string[];
}

export interface ResourceUsage {
  memory: 'low' | 'medium' | 'high';
  cpu: 'low' | 'medium' | 'high';
  io: 'low' | 'medium' | 'high';
  network: 'low' | 'medium' | 'high';
}

/**
 * Content Synthesis Types
 */
export interface ContentSynthesisRequest {
  intelligence: ProjectIntelligence;
  options: ContentSynthesisOptions;
  targetSections: string[];
}

export interface ContentSynthesisOptions {
  writingStyle?: 'professional' | 'technical' | 'casual' | 'academic';
  targetAudience?: 'developers' | 'managers' | 'stakeholders' | 'mixed';
  detailLevel?: 'brief' | 'standard' | 'comprehensive';
  includeMetrics?: boolean;
  includeDiagrams?: boolean;
  businessFocus?: boolean;
}

export interface SynthesizedContent {
  sections: { [sectionType: string]: string };
  businessContext: BusinessContext;
  technicalArchitecture: TechnicalArchitecture;
  qualityMetrics: QualityMetrics;
  metadata: ContentSynthesisMetadata;
}

export interface BusinessContext {
  purpose: string;
  domain: string;
  targetAudience: string[];
  keyFeatures: Feature[];
  businessValue: string;
  strategicImportance: string;
  stakeholders: Stakeholder[];
  businessMetrics?: BusinessMetrics;
}

export interface Feature {
  name: string;
  description: string;
  businessValue?: string;
  technicalImplementation?: string;
}

export interface Stakeholder {
  role: string;
  involvement: string;
  benefits?: string[];
  concerns?: string[];
}

export interface BusinessMetrics {
  performanceIndicators: string[];
  successMetrics: string[];
  roi?: string;
  costBenefit?: string;
}

export interface TechnicalArchitecture {
  architecturalPatterns: ArchitecturalPattern[];
  technologyStack: TechnologyInfo[];
  designPatterns: DesignPattern[];
  componentStructure: ComponentStructure;
  dataFlow: DataFlowInfo;
  integrationPoints: IntegrationPoint[];
  scalabilityFactors: ScalabilityInfo;
  performanceCharacteristics: PerformanceInfo;
  securityConsiderations: SecurityInfo;
}

export interface TechnologyInfo {
  name: string;
  purpose: string;
  version?: string;
  justification?: string;
}

export interface DesignPattern {
  name: string;
  description: string;
  implementation: string;
  benefits: string;
  application?: string;
  advantages?: string;
}

export interface ComponentStructure {
  layers: number;
  coupling: string;
  cohesion: string;
  modularity: string;
}

export interface DataFlowInfo {
  pattern: string;
  complexity: string;
  direction: string;
  dataTypes: string[];
}

export interface IntegrationPoint {
  name: string;
  type: string;
  description: string;
  protocols: string[];
}

export interface ScalabilityInfo {
  horizontal: boolean;
  vertical: boolean;
  bottlenecks: string[];
  recommendations: string[];
}

export interface PerformanceInfo {
  throughput: string;
  latency: string;
  resourceEfficiency: string;
  optimizations: string[];
}

export interface SecurityInfo {
  level: string;
  considerations: string[];
  implementations: string[];
  vulnerabilities?: string[];
}

export interface QualityMetrics {
  specificityScore: number;
  professionalToneScore: number;
  businessContextScore: number;
  technicalAccuracyScore: number;
  narrativeCoherenceScore: number;
  overallQualityScore: number;
}

export interface ContentSynthesisMetadata {
  generatedAt: Date;
  intelligenceVersion: string;
  synthesisApproach: string;
  projectComplexity: string;
  processingTime?: number;
  contentLength?: number;
}