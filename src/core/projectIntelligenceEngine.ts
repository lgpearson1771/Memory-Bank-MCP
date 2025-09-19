/**
 * Project Intelligence Engine - Core Architecture
 * Revolutionary intelligence-driven project analysis and content generation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';
import { securityValidator } from '../security/validation.js';

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
  type: string;
  characteristics: string[];
  complexity: string;
  regulations: string[];
}

export interface MarketPositioning {
  segment: string;
  differentiation: string[];
  competitiveFactors: string[];
}

export interface CompetitiveAdvantage {
  type: string;
  description: string;
  sustainability: 'high' | 'medium' | 'low';
}

export interface BusinessProcess {
  name: string;
  steps: ProcessStep[];
  automation: number;
  efficiency: string;
}

export interface ProcessStep {
  description: string;
  automated: boolean;
  dependencies: string[];
}

export interface UserJourney {
  name: string;
  touchpoints: string[];
  painPoints: string[];
  improvements: string[];
}

export interface BusinessIntegration {
  system: string;
  type: string;
  criticality: 'high' | 'medium' | 'low';
  dataFlow: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: string;
  strength: number;
}

export interface DataFlowEdge {
  source: string;
  target: string;
  dataType: string;
  volume: string;
}

export interface CommunicationEdge {
  source: string;
  target: string;
  protocol: string;
  frequency: string;
}

export interface ComponentCluster {
  components: string[];
  cohesion: number;
  purpose: string;
}

export interface CriticalPath {
  components: string[];
  businessImpact: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface ArchitecturalLayer {
  name: string;
  components: string[];
  dependencies: string[];
  purpose: string;
}

export interface LayerAnalysis {
  layers: ArchitecturalLayer[];
  coupling: number;
  cohesion: number;
  adherence: number;
}

export interface DesignPatternDetection {
  pattern: string;
  confidence: number;
  location: string;
  benefits: string[];
}

export interface CodeQualityMetrics {
  maintainability: number;
  reliability: number;
  security: number;
  performance: number;
}

export interface DataStructureAnalysis {
  name: string;
  type: string;
  businessConcept: string;
  relationships: string[];
  complexity: number;
}

// TypeScript-specific analysis interfaces
export interface TSParameterAnalysis {
  name: string;
  type: string;
  optional: boolean;
}

export interface TSFunctionAnalysis {
  name: string;
  parameters: TSParameterAnalysis[];
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
  documentation: string;
  businessPurpose: string;
  complexity: number;
  lineNumber: number;
}

export interface TSClassAnalysis {
  name: string;
  isExported: boolean;
  isAbstract: boolean;
  methods: TSFunctionAnalysis[];
  properties: { name: string; type: string; isPublic: boolean }[];
  extendsTypes: string[];
  implementsTypes: string[];
  businessPurpose: string;
  lineNumber: number;
}

export interface TSInterfaceAnalysis {
  name: string;
  isExported: boolean;
  properties: { name: string; type: string; isOptional: boolean }[];
  methods: { name: string; parameters: TSParameterAnalysis[]; returnType: string }[];
  businessPurpose: string;
  lineNumber: number;
}

export interface TSImportAnalysis {
  modulePath: string;
  importedItems: string[];
  importType: 'default' | 'named' | 'namespace' | 'side-effect';
  isExternal: boolean;
  lineNumber: number;
}

export interface TSExportAnalysis {
  exportedItems: string[];
  exportType: 'default' | 'named';
  isReExport: boolean;
  reExportPath?: string;
  lineNumber: number;
}

export interface TSComponentAnalysis {
  name: string;
  type: 'function' | 'class';
  props: string[];
  hooks: string[];
  lineNumber: number;
}

export interface TSRouteAnalysis {
  method: string;
  path: string;
  lineNumber: number;
}

export interface TSBusinessContext {
  purpose: string;
  domain: string;
  concepts: string[];
}

export interface TypeScriptAnalysisResult {
  type: 'typescript-ast';
  sourceFile: string;
  parseSuccess: boolean;
  error?: string;
  functions: TSFunctionAnalysis[];
  classes: TSClassAnalysis[];
  interfaces: TSInterfaceAnalysis[];
  imports: TSImportAnalysis[];
  exports: TSExportAnalysis[];
  components: TSComponentAnalysis[];
  routes: TSRouteAnalysis[];
  businessContext: TSBusinessContext;
  complexity: number;
  patterns: string[];
  dependencies: string[];
}

/**
 * Deep File Analysis Engine
 * Multi-language AST parsing and code intelligence
 */
export class DeepFileAnalysisEngine {
  private supportedLanguages: Map<string, LanguageAnalyzer> = new Map();

  constructor() {
    this.initializeLanguageAnalyzers();
  }

  /**
   * Analyze entire project with deep file analysis
   */
  async analyzeProject(projectPath: string): Promise<ProjectIntelligence> {
    try {
      const sanitizedPath = securityValidator.sanitizeProjectPath(projectPath);
      
      // 1. Scan and identify all files
      const fileInventory = await this.scanProjectFiles(sanitizedPath);
      
      // 2. Parse files with appropriate language analyzers
      const parsedFiles = await this.parseAllFiles(fileInventory);
      
      // 3. Extract code intelligence
      const codeAnalysis = await this.analyzeCodeStructure(parsedFiles);
      
      // 4. Detect architectural patterns
      const architecturalPatterns = await this.detectArchitecturalPatterns(codeAnalysis);
      
      // 5. Build relationship graph
      const relationships = await this.buildRelationshipGraph(parsedFiles, codeAnalysis);
      
      // 6. Extract business context
      const businessContext = await this.extractBusinessIntelligence(sanitizedPath, codeAnalysis);
      
      // 7. Calculate quality metrics
      const qualityMetrics = this.calculateIntelligenceQuality(codeAnalysis, businessContext);
      
      return {
        codeAnalysis,
        architecturalPatterns,
        businessContext,
        relationships,
        analysisCompleteness: this.calculateCompleteness(parsedFiles),
        confidenceScore: this.calculateConfidence(codeAnalysis, architecturalPatterns),
        complexityAssessment: this.assessProjectComplexity(codeAnalysis),
        qualityMetrics
      };
      
    } catch (error) {
      throw new Error(`Project analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scan project directory and identify all relevant files
   */
  private async scanProjectFiles(projectPath: string): Promise<FileInventory> {
    const inventory: FileInventory = {
      sourceFiles: [],
      documentationFiles: [],
      configurationFiles: [],
      testFiles: []
    };

    await this.scanDirectory(projectPath, inventory, 0, 3); // Max depth of 3
    return inventory;
  }

  /**
   * Recursively scan directory for files
   */
  private async scanDirectory(dirPath: string, inventory: FileInventory, currentDepth: number, maxDepth: number): Promise<void> {
    if (currentDepth > maxDepth) return;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip common directories to ignore
          if (this.shouldSkipDirectory(entry.name)) continue;
          
          await this.scanDirectory(fullPath, inventory, currentDepth + 1, maxDepth);
        } else if (entry.isFile()) {
          this.categorizeFile(fullPath, inventory);
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(`Cannot read directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Determine if directory should be skipped
   */
  private shouldSkipDirectory(name: string): boolean {
    const skipDirs = [
      'node_modules', '.git', 'dist', 'build', 'target', 'bin', 'obj', 
      '.vscode', '.idea', 'coverage', '.nyc_output', '__pycache__',
      'venv', 'env', '.env'
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  /**
   * Categorize file by type and purpose
   */
  private categorizeFile(filePath: string, inventory: FileInventory): void {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();
    
    // Source files
    if (this.isSourceFile(ext)) {
      inventory.sourceFiles.push(filePath);
    }
    // Documentation files
    else if (this.isDocumentationFile(ext, basename)) {
      inventory.documentationFiles.push(filePath);
    }
    // Configuration files
    else if (this.isConfigurationFile(ext, basename)) {
      inventory.configurationFiles.push(filePath);
    }
    // Test files
    else if (this.isTestFile(filePath)) {
      inventory.testFiles.push(filePath);
    }
  }

  /**
   * Check if file is a source code file
   */
  private isSourceFile(ext: string): boolean {
    const sourceExtensions = [
      '.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cs', '.go', '.rs',
      '.cpp', '.c', '.h', '.hpp', '.php', '.rb', '.swift', '.kt'
    ];
    return sourceExtensions.includes(ext);
  }

  /**
   * Check if file is documentation
   */
  private isDocumentationFile(ext: string, basename: string): boolean {
    const docExtensions = ['.md', '.txt', '.rst', '.adoc'];
    const docNames = ['readme', 'changelog', 'license', 'contributing', 'docs'];
    
    return docExtensions.includes(ext) || docNames.some(name => basename.includes(name));
  }

  /**
   * Check if file is configuration
   */
  private isConfigurationFile(ext: string, basename: string): boolean {
    const configExtensions = ['.json', '.yml', '.yaml', '.toml', '.ini', '.conf', '.config'];
    const configNames = [
      'package.json', 'tsconfig', 'webpack', 'babel', 'eslint', 'prettier',
      'docker', 'makefile', 'cmake', 'pom.xml', 'build.gradle'
    ];
    
    return configExtensions.includes(ext) || configNames.some(name => basename.includes(name));
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /\.test\./i, /\.spec\./i, /test/i, /spec/i, /__tests__/i
    ];
    
    return testPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Parse all identified files
   */
  private async parseAllFiles(inventory: FileInventory): Promise<ParsedFile[]> {
    const parsedFiles: ParsedFile[] = [];
    
    // Parse source files with appropriate language analyzers
    for (const filePath of inventory.sourceFiles) {
      try {
        const parsed = await this.parseSourceFile(filePath);
        if (parsed) {
          parsedFiles.push(parsed);
        }
      } catch (error) {
        console.warn(`Failed to parse ${filePath}: ${error}`);
      }
    }
    
    return parsedFiles;
  }

  /**
   * Parse individual source file
   */
  private async parseSourceFile(filePath: string): Promise<ParsedFile | null> {
    const language = this.detectLanguage(filePath);
    const analyzer = this.supportedLanguages.get(language);
    
    if (!analyzer) {
      console.warn(`No analyzer available for language: ${language}`);
      return null;
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ast = await analyzer.parse(content, filePath);
      
      return {
        filePath,
        language,
        ast,
        parseSuccess: true,
        parseErrors: [],
        metadata: await this.getFileMetadata(filePath)
      };
    } catch (error) {
      return {
        filePath,
        language,
        ast: null,
        parseSuccess: false,
        parseErrors: [{
          message: error instanceof Error ? error.message : 'Parse error',
          line: 0,
          column: 0,
          severity: 'error'
        }],
        metadata: await this.getFileMetadata(filePath)
      };
    }
  }

  /**
   * Detect programming language from file path
   */
  private detectLanguage(filePath: string): ProgrammingLanguage {
    const ext = path.extname(filePath).toLowerCase();
    
    const languageMap: Record<string, ProgrammingLanguage> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cs': 'CSharp',
      '.go': 'Go',
      '.rs': 'Rust'
    };
    
    return languageMap[ext] || 'Unknown';
  }

  /**
   * Get file metadata
   */
  private async getFileMetadata(filePath: string): Promise<FileMetadata> {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
        encoding: 'utf-8',
        lineCount: content.split('\n').length
      };
    } catch (error) {
      return {
        size: 0,
        lastModified: new Date(),
        encoding: 'unknown',
        lineCount: 0
      };
    }
  }

  /**
   * Initialize language-specific analyzers
   */
  private initializeLanguageAnalyzers(): void {
    // TypeScript/JavaScript analyzer
    this.supportedLanguages.set('TypeScript', new TypeScriptAnalyzer());
    this.supportedLanguages.set('JavaScript', new JavaScriptAnalyzer());
    
    // Python analyzer
    this.supportedLanguages.set('Python', new PythonAnalyzer());
    
    // Java analyzer
    this.supportedLanguages.set('Java', new JavaAnalyzer());
    
    // C# analyzer
    this.supportedLanguages.set('CSharp', new CSharpAnalyzer());
    
    // Go analyzer
    this.supportedLanguages.set('Go', new GoAnalyzer());
    
    // Universal fallback
    this.supportedLanguages.set('Unknown', new UniversalAnalyzer());
  }

  // Placeholder methods for code analysis (to be implemented)
  private async analyzeCodeStructure(parsedFiles: ParsedFile[]): Promise<CodeAnalysisResult> {
    // TODO: Implement code structure analysis
    return {
      parsedFiles,
      syntaxTrees: [],
      functions: [],
      components: [],
      dataStructures: [],
      layerArchitecture: { layers: [], coupling: 0, cohesion: 0, adherence: 0 },
      designPatterns: [],
      codeQuality: { maintainability: 0.8, reliability: 0.8, security: 0.8, performance: 0.8 }
    };
  }

  private async detectArchitecturalPatterns(_codeAnalysis: CodeAnalysisResult): Promise<ArchitecturalPattern[]> {
    // TODO: Implement architectural pattern detection
    return [];
  }

  private async buildRelationshipGraph(_parsedFiles: ParsedFile[], _codeAnalysis: CodeAnalysisResult): Promise<RelationshipGraph> {
    // TODO: Implement relationship graph construction
    return {
      dependencies: [],
      dataFlow: [],
      communicationPatterns: [],
      stronglyConnectedComponents: [],
      criticalPaths: [],
      architecturalLayers: []
    };
  }

  private async extractBusinessIntelligence(_projectPath: string, _codeAnalysis: CodeAnalysisResult): Promise<BusinessIntelligence> {
    // TODO: Implement business intelligence extraction
    return {
      problemStatement: '',
      valueProposition: '',
      targetUsers: [],
      businessGoals: [],
      domainAnalysis: { type: '', characteristics: [], complexity: '', regulations: [] },
      marketPosition: { segment: '', differentiation: [], competitiveFactors: [] },
      competitiveAdvantages: [],
      businessProcesses: [],
      userJourneys: [],
      integrationPoints: []
    };
  }

  private calculateIntelligenceQuality(_codeAnalysis: CodeAnalysisResult, _businessContext: BusinessIntelligence): IntelligenceQualityMetrics {
    return {
      analysisDepth: 0.8,
      businessContextRichness: 0.7,
      technicalAccuracy: 0.9,
      architecturalUnderstanding: 0.8
    };
  }

  private calculateCompleteness(parsedFiles: ParsedFile[]): number {
    const successfulParses = parsedFiles.filter(f => f.parseSuccess).length;
    return parsedFiles.length > 0 ? successfulParses / parsedFiles.length : 0;
  }

  private calculateConfidence(_codeAnalysis: CodeAnalysisResult, _patterns: ArchitecturalPattern[]): number {
    // TODO: Implement confidence calculation
    return 0.85;
  }

  private assessProjectComplexity(codeAnalysis: CodeAnalysisResult): ProjectComplexityLevel {
    const fileCount = codeAnalysis.parsedFiles.length;
    
    if (fileCount < 10) return 'Simple';
    if (fileCount < 50) return 'Moderate';
    if (fileCount < 200) return 'Complex';
    return 'Enterprise';
  }
}

// Supporting interfaces
interface FileInventory {
  sourceFiles: string[];
  documentationFiles: string[];
  configurationFiles: string[];
  testFiles: string[];
}

// Language analyzer interfaces and implementations
abstract class LanguageAnalyzer {
  abstract parse(content: string, filePath: string): Promise<any>;
}

// TypeScript analyzer implementation
export class TypeScriptAnalyzer extends LanguageAnalyzer {
  async parse(content: string, filePath: string): Promise<TypeScriptAnalysisResult> {
    try {
      // Create TypeScript source file for AST parsing
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        path.extname(filePath) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );

      // Extract comprehensive code intelligence
      const analysis: TypeScriptAnalysisResult = {
        type: 'typescript-ast',
        sourceFile: filePath,
        parseSuccess: true,
        functions: this.extractFunctions(sourceFile),
        classes: this.extractClasses(sourceFile),
        interfaces: this.extractInterfaces(sourceFile),
        imports: this.extractImports(sourceFile),
        exports: this.extractExports(sourceFile),
        components: this.extractReactComponents(sourceFile),
        routes: this.extractRoutes(sourceFile),
        businessContext: this.extractBusinessContext(sourceFile, content),
        complexity: this.calculateComplexity(sourceFile),
        patterns: this.detectPatterns(sourceFile),
        dependencies: this.extractDependencies(sourceFile)
      };

      return analysis;
    } catch (error) {
      // Return error analysis with partial information
      return {
        type: 'typescript-ast',
        sourceFile: filePath,
        parseSuccess: false,
        error: error instanceof Error ? error.message : 'Parse error',
        functions: [],
        classes: [],
        interfaces: [],
        imports: [],
        exports: [],
        components: [],
        routes: [],
        businessContext: { purpose: '', domain: '', concepts: [] },
        complexity: 0,
        patterns: [],
        dependencies: []
      };
    }
  }

  /**
   * Extract function declarations and expressions
   */
  private extractFunctions(sourceFile: ts.SourceFile): TSFunctionAnalysis[] {
    const functions: TSFunctionAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
        const func = this.analyzeFunctionNode(node, sourceFile);
        if (func) functions.push(func);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return functions;
  }

  /**
   * Analyze individual function node
   */
  private analyzeFunctionNode(node: ts.Node, sourceFile: ts.SourceFile): TSFunctionAnalysis | null {
    let name = 'anonymous';
    let parameters: TSParameterAnalysis[] = [];
    let returnType = 'unknown';
    let isAsync = false;
    let isExported = false;
    let documentation = '';

    // Type-specific analysis based on node type
    if (ts.isFunctionDeclaration(node)) {
      if (node.name) name = node.name.text;
      if (node.modifiers) {
        isExported = node.modifiers.some((mod: ts.ModifierLike) => mod.kind === ts.SyntaxKind.ExportKeyword);
        isAsync = node.modifiers.some((mod: ts.ModifierLike) => mod.kind === ts.SyntaxKind.AsyncKeyword);
      }
      if (node.parameters) {
        parameters = node.parameters.map((param: ts.ParameterDeclaration) => {
          const paramName = ts.isIdentifier(param.name) ? param.name.text : 'destructured';
          const paramType = param.type ? sourceFile.text.substring(param.type.pos, param.type.end).trim() : 'unknown';
          return { name: paramName, type: paramType, optional: !!param.questionToken };
        });
      }
      if (node.type) {
        returnType = sourceFile.text.substring(node.type.pos, node.type.end).trim();
      }
    } else if (ts.isMethodDeclaration(node)) {
      if (ts.isIdentifier(node.name)) name = node.name.text;
      if (node.modifiers) {
        isAsync = node.modifiers.some((mod: ts.ModifierLike) => mod.kind === ts.SyntaxKind.AsyncKeyword);
      }
      if (node.parameters) {
        parameters = node.parameters.map((param: ts.ParameterDeclaration) => {
          const paramName = ts.isIdentifier(param.name) ? param.name.text : 'destructured';
          const paramType = param.type ? sourceFile.text.substring(param.type.pos, param.type.end).trim() : 'unknown';
          return { name: paramName, type: paramType, optional: !!param.questionToken };
        });
      }
      if (node.type) {
        returnType = sourceFile.text.substring(node.type.pos, node.type.end).trim();
      }
    } else if (ts.isArrowFunction(node)) {
      // Arrow functions are typically assigned to variables
      name = 'arrow_function';
      if (node.parameters) {
        parameters = node.parameters.map((param: ts.ParameterDeclaration) => {
          const paramName = ts.isIdentifier(param.name) ? param.name.text : 'destructured';
          const paramType = param.type ? sourceFile.text.substring(param.type.pos, param.type.end).trim() : 'unknown';
          return { name: paramName, type: paramType, optional: !!param.questionToken };
        });
      }
      if (node.type) {
        returnType = sourceFile.text.substring(node.type.pos, node.type.end).trim();
      }
    }

    // Extract JSDoc documentation
    const jsDocComment = this.getJSDocComment(node, sourceFile);
    if (jsDocComment) {
      documentation = jsDocComment;
    }

    // Analyze business purpose from name and documentation
    const businessPurpose = this.inferBusinessPurpose(name, documentation, parameters);

    return {
      name,
      parameters,
      returnType,
      isAsync,
      isExported,
      documentation,
      businessPurpose,
      complexity: this.calculateFunctionComplexity(node),
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    };
  }

  /**
   * Extract class declarations
   */
  private extractClasses(sourceFile: ts.SourceFile): TSClassAnalysis[] {
    const classes: TSClassAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const classAnalysis = this.analyzeClassNode(node, sourceFile);
        if (classAnalysis) classes.push(classAnalysis);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return classes;
  }

  /**
   * Analyze class node
   */
  private analyzeClassNode(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): TSClassAnalysis | null {
    if (!node.name) return null;

    const name = node.name.text;
    const isExported = node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword) || false;
    const isAbstract = node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AbstractKeyword) || false;
    
    // Extract methods
    const methods = node.members
      .filter(ts.isMethodDeclaration)
      .map(method => this.analyzeFunctionNode(method, sourceFile))
      .filter(method => method !== null) as TSFunctionAnalysis[];

    // Extract properties
    const properties = node.members
      .filter(ts.isPropertyDeclaration)
      .map(prop => {
        const propName = ts.isIdentifier(prop.name) ? prop.name.text : 'computed';
        const propType = prop.type ? sourceFile.text.substring(prop.type.pos, prop.type.end).trim() : 'unknown';
        const isPublic = !prop.modifiers?.some(mod => 
          mod.kind === ts.SyntaxKind.PrivateKeyword || mod.kind === ts.SyntaxKind.ProtectedKeyword
        );
        return { name: propName, type: propType, isPublic };
      });

    // Extract inheritance
    const extendsClause = node.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);
    const implementsClause = node.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ImplementsKeyword);
    
    const extendsTypes = extendsClause?.types.map(type => sourceFile.text.substring(type.pos, type.end).trim()) || [];
    const implementsTypes = implementsClause?.types.map(type => sourceFile.text.substring(type.pos, type.end).trim()) || [];

    // Infer business purpose
    const businessPurpose = this.inferClassBusinessPurpose(name, methods, properties);

    return {
      name,
      isExported,
      isAbstract,
      methods,
      properties,
      extendsTypes,
      implementsTypes,
      businessPurpose,
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    };
  }

  /**
   * Extract interface declarations
   */
  private extractInterfaces(sourceFile: ts.SourceFile): TSInterfaceAnalysis[] {
    const interfaces: TSInterfaceAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceAnalysis = this.analyzeInterfaceNode(node, sourceFile);
        if (interfaceAnalysis) interfaces.push(interfaceAnalysis);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return interfaces;
  }

  /**
   * Analyze interface node
   */
  private analyzeInterfaceNode(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): TSInterfaceAnalysis {
    const name = node.name.text;
    const isExported = node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword) || false;
    
    // Extract properties
    const properties = node.members.map(member => {
      if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
        const propName = member.name.text;
        const propType = member.type ? sourceFile.text.substring(member.type.pos, member.type.end).trim() : 'unknown';
        const isOptional = !!member.questionToken;
        return { name: propName, type: propType, isOptional };
      }
      return null;
    }).filter(prop => prop !== null) as { name: string; type: string; isOptional: boolean }[];

    // Extract methods
    const methods = node.members.map(member => {
      if (ts.isMethodSignature(member) && ts.isIdentifier(member.name)) {
        const methodName = member.name.text;
        const parameters = member.parameters.map(param => {
          const paramName = ts.isIdentifier(param.name) ? param.name.text : 'destructured';
          const paramType = param.type ? sourceFile.text.substring(param.type.pos, param.type.end).trim() : 'unknown';
          return { name: paramName, type: paramType, optional: !!param.questionToken };
        });
        const returnType = member.type ? sourceFile.text.substring(member.type.pos, member.type.end).trim() : 'unknown';
        return { name: methodName, parameters, returnType };
      }
      return null;
    }).filter(method => method !== null) as { name: string; parameters: TSParameterAnalysis[]; returnType: string }[];

    // Infer business purpose
    const businessPurpose = this.inferInterfaceBusinessPurpose(name, properties, methods);

    return {
      name,
      isExported,
      properties,
      methods,
      businessPurpose,
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    };
  }

  /**
   * Extract import statements
   */
  private extractImports(sourceFile: ts.SourceFile): TSImportAnalysis[] {
    const imports: TSImportAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const modulePath = node.moduleSpecifier.text;
        let importedItems: string[] = [];
        let importType: 'default' | 'named' | 'namespace' | 'side-effect' = 'side-effect';

        if (node.importClause) {
          if (node.importClause.name) {
            // Default import
            importedItems.push(node.importClause.name.text);
            importType = 'default';
          }
          
          if (node.importClause.namedBindings) {
            if (ts.isNamespaceImport(node.importClause.namedBindings)) {
              // Namespace import (import * as name)
              importedItems.push(node.importClause.namedBindings.name.text);
              importType = 'namespace';
            } else if (ts.isNamedImports(node.importClause.namedBindings)) {
              // Named imports
              importedItems = node.importClause.namedBindings.elements.map(element => 
                element.propertyName ? element.propertyName.text : element.name.text
              );
              importType = 'named';
            }
          }
        }

        imports.push({
          modulePath,
          importedItems,
          importType,
          isExternal: !modulePath.startsWith('.'),
          lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
        });
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return imports;
  }

  /**
   * Extract export statements
   */
  private extractExports(sourceFile: ts.SourceFile): TSExportAnalysis[] {
    const exports: TSExportAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          // Re-exports
          const modulePath = node.moduleSpecifier.text;
          let exportedItems: string[] = [];
          
          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            exportedItems = node.exportClause.elements.map(element => 
              element.propertyName ? element.propertyName.text : element.name.text
            );
          }
          
          exports.push({
            exportedItems,
            exportType: 'named',
            isReExport: true,
            reExportPath: modulePath,
            lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
          });
        }
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return exports;
  }

  /**
   * Extract React components
   */
  private extractReactComponents(sourceFile: ts.SourceFile): TSComponentAnalysis[] {
    const components: TSComponentAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      // Function components
      if (ts.isFunctionDeclaration(node) && this.isReactComponent(node, sourceFile)) {
        const component = this.analyzeReactComponent(node, sourceFile);
        if (component) components.push(component);
      }
      
      // Class components
      if (ts.isClassDeclaration(node) && this.isReactClassComponent(node, sourceFile)) {
        const component = this.analyzeReactClassComponent(node, sourceFile);
        if (component) components.push(component);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return components;
  }

  /**
   * Check if function is a React component
   */
  private isReactComponent(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): boolean {
    if (!node.name) return false;
    
    // Component name should start with uppercase
    const name = node.name.text;
    if (!/^[A-Z]/.test(name)) return false;
    
    // Check if it returns JSX
    const bodyText = node.body ? sourceFile.text.substring(node.body.pos, node.body.end) : '';
    return bodyText.includes('return') && (bodyText.includes('<') || bodyText.includes('jsx') || bodyText.includes('createElement'));
  }

  /**
   * Check if class is a React component
   */
  private isReactClassComponent(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): boolean {
    if (!node.name) return false;
    
    // Check if extends React.Component or Component
    const extendsClause = node.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);
    if (!extendsClause) return false;
    
    const baseClass = sourceFile.text.substring(extendsClause.types[0].pos, extendsClause.types[0].end).trim();
    return baseClass.includes('Component') || baseClass.includes('PureComponent');
  }

  /**
   * Analyze React function component
   */
  private analyzeReactComponent(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): TSComponentAnalysis | null {
    if (!node.name) return null;
    
    const name = node.name.text;
    const props = this.extractComponentProps(node, sourceFile);
    const hooks = this.extractHooks(node, sourceFile);
    
    return {
      name,
      type: 'function',
      props,
      hooks,
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    };
  }

  /**
   * Analyze React class component
   */
  private analyzeReactClassComponent(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): TSComponentAnalysis | null {
    if (!node.name) return null;
    
    const name = node.name.text;
    const props = this.extractClassComponentProps(node, sourceFile);
    
    return {
      name,
      type: 'class',
      props,
      hooks: [],
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    };
  }

  /**
   * Extract API routes (Express.js patterns)
   */
  private extractRoutes(sourceFile: ts.SourceFile): TSRouteAnalysis[] {
    const routes: TSRouteAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const route = this.analyzeRouteCall(node, sourceFile);
        if (route) routes.push(route);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return routes;
  }

  /**
   * Analyze potential route call
   */
  private analyzeRouteCall(node: ts.CallExpression, sourceFile: ts.SourceFile): TSRouteAnalysis | null {
    if (!ts.isPropertyAccessExpression(node.expression)) return null;
    
    const methodName = node.expression.name.text;
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    
    if (!httpMethods.includes(methodName.toLowerCase())) return null;
    
    const args = node.arguments;
    if (args.length < 2) return null;
    
    // Extract path
    const pathArg = args[0];
    let path = 'unknown';
    if (ts.isStringLiteral(pathArg)) {
      path = pathArg.text;
    }
    
    return {
      method: methodName.toUpperCase(),
      path,
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    };
  }

  // Helper methods for business context and complexity analysis
  private extractBusinessContext(sourceFile: ts.SourceFile, content: string): TSBusinessContext {
    const purpose = this.inferFilePurpose(sourceFile.fileName, content);
    const domain = this.inferDomain(content);
    const concepts = this.extractBusinessConcepts(content);
    
    return { purpose, domain, concepts };
  }

  private calculateComplexity(sourceFile: ts.SourceFile): number {
    let complexity = 0;
    
    const visitNode = (node: ts.Node) => {
      // Increment complexity for control flow statements
      if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isForStatement(node) ||
          ts.isConditionalExpression(node) || ts.isCaseClause(node)) {
        complexity++;
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return complexity;
  }

  private calculateFunctionComplexity(node: ts.Node): number {
    let complexity = 1; // Base complexity
    
    const visitNode = (childNode: ts.Node) => {
      if (ts.isIfStatement(childNode) || ts.isWhileStatement(childNode) || ts.isForStatement(childNode) ||
          ts.isConditionalExpression(childNode) || ts.isCaseClause(childNode)) {
        complexity++;
      }
      
      ts.forEachChild(childNode, visitNode);
    };
    
    ts.forEachChild(node, visitNode);
    return complexity;
  }

  private detectPatterns(sourceFile: ts.SourceFile): string[] {
    const patterns: string[] = [];
    const content = sourceFile.text;
    
    // Detect common patterns
    if (content.includes('express') || content.includes('app.get') || content.includes('app.post')) {
      patterns.push('Express.js API');
    }
    if (content.includes('React') || content.includes('jsx') || content.includes('useState')) {
      patterns.push('React Application');
    }
    if (content.includes('async') && content.includes('await')) {
      patterns.push('Async/Await Pattern');
    }
    if (content.includes('class') && content.includes('extends')) {
      patterns.push('Object-Oriented Design');
    }
    
    return patterns;
  }

  private extractDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const modulePath = node.moduleSpecifier.text;
        if (!modulePath.startsWith('.')) {
          dependencies.push(modulePath);
        }
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return [...new Set(dependencies)]; // Remove duplicates
  }

  // Additional helper methods (stubs for now, to be implemented)
  private getJSDocComment(_node: ts.Node, _sourceFile: ts.SourceFile): string | null {
    // Implementation for extracting JSDoc comments
    return null;
  }

  private inferBusinessPurpose(name: string, _documentation: string, _parameters: TSParameterAnalysis[]): string {
    // Infer business purpose from function name, docs, and parameters
    return `Function: ${name}`;
  }

  private inferClassBusinessPurpose(name: string, _methods: TSFunctionAnalysis[], _properties: any[]): string {
    // Infer business purpose from class structure
    return `Class: ${name}`;
  }

  private inferInterfaceBusinessPurpose(name: string, _properties: any[], _methods: any[]): string {
    // Infer business purpose from interface structure
    return `Interface: ${name}`;
  }

  private extractComponentProps(_node: ts.FunctionDeclaration, _sourceFile: ts.SourceFile): string[] {
    // Extract React component props
    return [];
  }

  private extractClassComponentProps(_node: ts.ClassDeclaration, _sourceFile: ts.SourceFile): string[] {
    // Extract React class component props
    return [];
  }

  private extractHooks(_node: ts.FunctionDeclaration, _sourceFile: ts.SourceFile): string[] {
    // Extract React hooks usage
    return [];
  }

  private inferFilePurpose(_fileName: string, _content: string): string {
    // Infer overall file purpose
    return 'TypeScript module';
  }

  private inferDomain(_content: string): string {
    // Infer business domain
    return 'software';
  }

  private extractBusinessConcepts(_content: string): string[] {
    // Extract business concepts from code
    return [];
  }
}

// JavaScript analyzer
class JavaScriptAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement JavaScript AST parsing
    return { type: 'javascript-ast', content: content.length };
  }
}

// Python analyzer
class PythonAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Python AST parsing
    return { type: 'python-ast', content: content.length };
  }
}

// Java analyzer
class JavaAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Java AST parsing
    return { type: 'java-ast', content: content.length };
  }
}

// C# analyzer
class CSharpAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement C# AST parsing
    return { type: 'csharp-ast', content: content.length };
  }
}

// Go analyzer
class GoAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Go AST parsing
    return { type: 'go-ast', content: content.length };
  }
}

// Universal fallback analyzer
class UniversalAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Tree-sitter universal parsing
    return { type: 'universal-ast', content: content.length };
  }
}