/**
 * Deep File Analysis Engine
 * Multi-language AST parsing and code intelligence
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { securityValidator } from '../../security/validation';
import {
  ProjectIntelligence,
  CodeAnalysisResult,
  ParsedFile,
  ArchitecturalPattern,
  BusinessIntelligence,
  RelationshipGraph,
  IntelligenceQualityMetrics,
  ProjectComplexityLevel,
  ProgrammingLanguage,
  FunctionAnalysis,
  ComponentAnalysis,
  DataStructureAnalysis,
  LayerAnalysis,
  DesignPatternDetection,
  CodeQualityMetrics
} from './types';
import {
  TypeScriptAnalyzer,
  JavaScriptAnalyzer,
  PythonAnalyzer,
  JavaAnalyzer,
  CSharpAnalyzer,
  GoAnalyzer,
  UniversalAnalyzer,
  LanguageAnalyzer
} from './astParsing';

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
        confidenceScore: this.calculateConfidenceScore(codeAnalysis),
        complexityAssessment: this.assessComplexity(codeAnalysis),
        qualityMetrics
      };
    } catch (error) {
      console.error('Project analysis failed:', error);
      throw new Error(`Deep analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize language-specific analyzers
   */
  private initializeLanguageAnalyzers(): void {
    this.supportedLanguages.set('ts', new TypeScriptAnalyzer());
    this.supportedLanguages.set('tsx', new TypeScriptAnalyzer());
    this.supportedLanguages.set('js', new JavaScriptAnalyzer());
    this.supportedLanguages.set('jsx', new JavaScriptAnalyzer());
    this.supportedLanguages.set('py', new PythonAnalyzer());
    this.supportedLanguages.set('java', new JavaAnalyzer());
    this.supportedLanguages.set('cs', new CSharpAnalyzer());
    this.supportedLanguages.set('go', new GoAnalyzer());
    this.supportedLanguages.set('universal', new UniversalAnalyzer());
  }

  /**
   * Scan project files and create inventory
   */
  private async scanProjectFiles(projectPath: string): Promise<FileInventoryItem[]> {
    const files: FileInventoryItem[] = [];
    
    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          // Skip common non-source directories
          if (entry.isDirectory() && this.shouldSkipDirectory(entry.name)) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && this.isSourceFile(entry.name)) {
            const language = this.detectLanguage(entry.name);
            const stats = await fs.stat(fullPath);
            
            files.push({
              filePath: fullPath,
              fileName: entry.name,
              language,
              size: stats.size,
              lastModified: stats.mtime,
              relativePath: path.relative(projectPath, fullPath)
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${dirPath}:`, error);
      }
    };
    
    await scanDirectory(projectPath);
    return files;
  }

  /**
   * Parse all files using appropriate language analyzers
   */
  private async parseAllFiles(fileInventory: FileInventoryItem[]): Promise<ParsedFile[]> {
    const parsedFiles: ParsedFile[] = [];
    
    for (const file of fileInventory) {
      try {
        const content = await fs.readFile(file.filePath, 'utf-8');
        const analyzer = this.getAnalyzer(file.language);
        
        if (analyzer) {
          const ast = await analyzer.parse(content, file.filePath);
          
          parsedFiles.push({
            filePath: file.filePath,
            language: file.language,
            ast,
            parseSuccess: true,
            parseErrors: [],
            metadata: {
              size: file.size,
              lastModified: file.lastModified,
              encoding: 'utf-8',
              lineCount: content.split('\\n').length
            }
          });
        }
      } catch (error) {
        console.warn(`Failed to parse ${file.filePath}:`, error);
        parsedFiles.push({
          filePath: file.filePath,
          language: file.language,
          ast: null,
          parseSuccess: false,
          parseErrors: [{
            message: error instanceof Error ? error.message : 'Parse error',
            line: 0,
            column: 0,
            severity: 'error'
          }],
          metadata: {
            size: file.size,
            lastModified: file.lastModified,
            encoding: 'utf-8',
            lineCount: 0
          }
        });
      }
    }
    
    return parsedFiles;
  }

  /**
   * Analyze code structure and extract intelligence
   */
  private async analyzeCodeStructure(parsedFiles: ParsedFile[]): Promise<CodeAnalysisResult> {
    const functions: FunctionAnalysis[] = [];
    const components: ComponentAnalysis[] = [];
    const dataStructures: DataStructureAnalysis[] = [];
    
    // Extract code elements from parsed files
    for (const file of parsedFiles) {
      if (file.parseSuccess && file.ast) {
        // Extract functions, classes, interfaces, etc.
        const fileFunctions = this.extractFunctionsFromAST(file);
        const fileComponents = this.extractComponentsFromAST(file);
        const fileDataStructures = this.extractDataStructuresFromAST(file);
        
        functions.push(...fileFunctions);
        components.push(...fileComponents);
        dataStructures.push(...fileDataStructures);
      }
    }
    
    const layerArchitecture = this.analyzeLayerArchitecture(parsedFiles);
    const designPatterns = this.detectDesignPatterns(parsedFiles);
    const codeQuality = this.analyzeCodeQuality(parsedFiles);
    
    return {
      parsedFiles,
      syntaxTrees: parsedFiles.map(f => ({
        language: f.language,
        rootNode: f.ast,
        sourceFile: f.filePath,
        parseSuccess: f.parseSuccess
      })),
      functions,
      components,
      dataStructures,
      layerArchitecture,
      designPatterns,
      codeQuality
    };
  }

  /**
   * Detect architectural patterns in the codebase
   */
  private async detectArchitecturalPatterns(codeAnalysis: CodeAnalysisResult): Promise<ArchitecturalPattern[]> {
    const patterns: ArchitecturalPattern[] = [];
    
    // Analyze file structure patterns
    const fileStructurePatterns = this.analyzeFileStructurePatterns(codeAnalysis.parsedFiles);
    patterns.push(...fileStructurePatterns);
    
    // Analyze dependency patterns
    const dependencyPatterns = this.analyzeDependencyPatterns(codeAnalysis);
    patterns.push(...dependencyPatterns);
    
    // Analyze naming conventions
    const namingPatterns = this.analyzeNamingPatterns(codeAnalysis);
    patterns.push(...namingPatterns);
    
    return patterns;
  }

  /**
   * Build relationship graph (placeholder - will be implemented by SemanticRelationshipMapper)
   */
  private async buildRelationshipGraph(_parsedFiles: ParsedFile[], _codeAnalysis: CodeAnalysisResult): Promise<RelationshipGraph> {
    // This will be implemented by the SemanticRelationshipMapper
    return {
      dependencies: [],
      dataFlow: [],
      communicationPatterns: [],
      stronglyConnectedComponents: [],
      criticalPaths: [],
      architecturalLayers: []
    };
  }

  /**
   * Extract business intelligence from code and project context
   */
  private async extractBusinessIntelligence(projectPath: string, codeAnalysis: CodeAnalysisResult): Promise<BusinessIntelligence> {
    // Analyze README and documentation files
    const documentation = await this.analyzeProjectDocumentation(projectPath);
    
    // Infer business context from code structure
    const businessContext = this.inferBusinessContext(codeAnalysis);
    
    return {
      problemStatement: documentation.problemStatement || this.inferProblemStatement(codeAnalysis),
      valueProposition: documentation.valueProposition || this.inferValueProposition(codeAnalysis),
      targetUsers: this.identifyTargetUsers(codeAnalysis),
      businessGoals: this.extractBusinessGoals(codeAnalysis),
      domainAnalysis: businessContext.domain,
      marketPosition: this.analyzeMarketPosition(codeAnalysis),
      competitiveAdvantages: this.identifyCompetitiveAdvantages(codeAnalysis),
      businessProcesses: this.extractBusinessProcesses(codeAnalysis),
      userJourneys: this.mapUserJourneys(codeAnalysis),
      integrationPoints: this.identifyIntegrationPoints(codeAnalysis)
    };
  }

  // Helper methods
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt'];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  private isSourceFile(fileName: string): boolean {
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cs', '.go', '.rs', '.cpp', '.c', '.h'];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  private detectLanguage(fileName: string): ProgrammingLanguage {
    const ext = path.extname(fileName).toLowerCase();
    
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'TypeScript';
      case '.js':
      case '.jsx':
        return 'JavaScript';
      case '.py':
        return 'Python';
      case '.java':
        return 'Java';
      case '.cs':
        return 'CSharp';
      case '.go':
        return 'Go';
      case '.rs':
        return 'Rust';
      default:
        return 'Unknown';
    }
  }

  private getAnalyzer(language: ProgrammingLanguage): LanguageAnalyzer | null {
    switch (language) {
      case 'TypeScript':
        return this.supportedLanguages.get('ts') || null;
      case 'JavaScript':
        return this.supportedLanguages.get('js') || null;
      case 'Python':
        return this.supportedLanguages.get('py') || null;
      case 'Java':
        return this.supportedLanguages.get('java') || null;
      case 'CSharp':
        return this.supportedLanguages.get('cs') || null;
      case 'Go':
        return this.supportedLanguages.get('go') || null;
      default:
        return this.supportedLanguages.get('universal') || null;
    }
  }

  // Analysis helper methods (stubs for now)
  private extractFunctionsFromAST(_file: ParsedFile): FunctionAnalysis[] {
    return [];
  }

  private extractComponentsFromAST(_file: ParsedFile): ComponentAnalysis[] {
    return [];
  }

  private extractDataStructuresFromAST(_file: ParsedFile): DataStructureAnalysis[] {
    return [];
  }

  private analyzeLayerArchitecture(_parsedFiles: ParsedFile[]): LayerAnalysis {
    return {
      layers: [],
      layerViolations: [],
      cohesion: 0,
      coupling: 0
    };
  }

  private detectDesignPatterns(_parsedFiles: ParsedFile[]): DesignPatternDetection[] {
    return [];
  }

  private analyzeCodeQuality(_parsedFiles: ParsedFile[]): CodeQualityMetrics {
    return {
      maintainabilityIndex: 0,
      technicalDebt: {
        totalDebt: 0,
        debtByCategory: [],
        criticalIssues: [],
        recommendation: []
      },
      testCoverage: {
        overallCoverage: 0,
        unitTestCoverage: 0,
        integrationTestCoverage: 0,
        untested: [],
        testQuality: []
      },
      documentationScore: 0,
      performanceIndicators: []
    };
  }

  private analyzeFileStructurePatterns(_parsedFiles: ParsedFile[]): ArchitecturalPattern[] {
    return [];
  }

  private analyzeDependencyPatterns(_codeAnalysis: CodeAnalysisResult): ArchitecturalPattern[] {
    return [];
  }

  private analyzeNamingPatterns(_codeAnalysis: CodeAnalysisResult): ArchitecturalPattern[] {
    return [];
  }

  private async analyzeProjectDocumentation(_projectPath: string): Promise<{ problemStatement?: string; valueProposition?: string }> {
    return {};
  }

  private inferBusinessContext(_codeAnalysis: CodeAnalysisResult): { domain: any } {
    return { domain: {} };
  }

  private inferProblemStatement(_codeAnalysis: CodeAnalysisResult): string {
    return 'Software solution addressing specific business needs';
  }

  private inferValueProposition(_codeAnalysis: CodeAnalysisResult): string {
    return 'Provides value through software automation and efficiency';
  }

  private identifyTargetUsers(_codeAnalysis: CodeAnalysisResult): any[] {
    return [];
  }

  private extractBusinessGoals(_codeAnalysis: CodeAnalysisResult): any[] {
    return [];
  }

  private analyzeMarketPosition(_codeAnalysis: CodeAnalysisResult): any {
    return {};
  }

  private identifyCompetitiveAdvantages(_codeAnalysis: CodeAnalysisResult): any[] {
    return [];
  }

  private extractBusinessProcesses(_codeAnalysis: CodeAnalysisResult): any[] {
    return [];
  }

  private mapUserJourneys(_codeAnalysis: CodeAnalysisResult): any[] {
    return [];
  }

  private identifyIntegrationPoints(_codeAnalysis: CodeAnalysisResult): any[] {
    return [];
  }

  private calculateCompleteness(parsedFiles: ParsedFile[]): number {
    const successfulParses = parsedFiles.filter(f => f.parseSuccess).length;
    return parsedFiles.length > 0 ? (successfulParses / parsedFiles.length) * 100 : 0;
  }

  private calculateConfidenceScore(codeAnalysis: CodeAnalysisResult): number {
    // Base confidence on successful parsing and analysis depth
    const baseScore = codeAnalysis.parsedFiles.filter(f => f.parseSuccess).length * 10;
    return Math.min(baseScore, 100);
  }

  private assessComplexity(codeAnalysis: CodeAnalysisResult): ProjectComplexityLevel {
    const fileCount = codeAnalysis.parsedFiles.length;
    const functionCount = codeAnalysis.functions.length;
    
    if (fileCount < 10 && functionCount < 50) return 'Simple';
    if (fileCount < 50 && functionCount < 200) return 'Moderate';
    if (fileCount < 200 && functionCount < 1000) return 'Complex';
    return 'Enterprise';
  }

  private calculateIntelligenceQuality(codeAnalysis: CodeAnalysisResult, businessContext: BusinessIntelligence): IntelligenceQualityMetrics {
    return {
      analysisDepth: this.calculateAnalysisDepth(codeAnalysis),
      businessContextRichness: this.calculateBusinessRichness(businessContext),
      technicalAccuracy: this.calculateTechnicalAccuracy(codeAnalysis),
      architecturalUnderstanding: this.calculateArchitecturalUnderstanding(codeAnalysis)
    };
  }

  private calculateAnalysisDepth(codeAnalysis: CodeAnalysisResult): number {
    const successRate = codeAnalysis.parsedFiles.filter(f => f.parseSuccess).length / Math.max(codeAnalysis.parsedFiles.length, 1);
    return successRate * 100;
  }

  private calculateBusinessRichness(businessContext: BusinessIntelligence): number {
    let richness = 0;
    if (businessContext.problemStatement) richness += 25;
    if (businessContext.valueProposition) richness += 25;
    if (businessContext.targetUsers.length > 0) richness += 25;
    if (businessContext.businessGoals.length > 0) richness += 25;
    return richness;
  }

  private calculateTechnicalAccuracy(codeAnalysis: CodeAnalysisResult): number {
    const parseSuccessRate = codeAnalysis.parsedFiles.filter(f => f.parseSuccess).length / Math.max(codeAnalysis.parsedFiles.length, 1);
    return parseSuccessRate * 100;
  }

  private calculateArchitecturalUnderstanding(_codeAnalysis: CodeAnalysisResult): number {
    return 75; // Placeholder
  }
}

// Supporting interface
interface FileInventoryItem {
  filePath: string;
  fileName: string;
  language: ProgrammingLanguage;
  size: number;
  lastModified: Date;
  relativePath: string;
}