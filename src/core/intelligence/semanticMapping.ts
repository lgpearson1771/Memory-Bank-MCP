/**
 * Semantic Relationship Mapping Engine
 * Maps dependencies, data flow, and architectural relationships between components
 */

import {
  RelationshipGraph,
  ParsedFile,
  CodeAnalysisResult,
  DependencyEdge,
  DataFlowEdge,
  CommunicationEdge,
  ComponentCluster,
  CriticalPath,
  ArchitecturalLayer
} from './types';

// Semantic Relationship Mapping Interfaces
export interface DependencyNode {
  filePath: string;
  exports: { name: string; type: string; isDefault: boolean }[];
  imports: { source: string; items: string[]; type: string; isExternal: boolean }[];
  functions: { name: string; isExported: boolean; complexity: number; callsExternal: boolean }[];
  classes: { name: string; isExported: boolean; methodCount: number; extendsTypes: string[]; implementsTypes: string[] }[];
  dependents: { sourceFile: string; exportedItems: string[]; dependencyType: string }[];
  dependencies: { targetFile: string; importedItems: string[]; importType: string; strength: number }[];
  cycleRisk: number;
  importance: number;
}

export interface ComponentInteraction {
  sourceComponent: string;
  targetComponent: string;
  interactionType: string;
  sourceFile: string;
  targetFile: string;
  strength: number;
  dataFlow: string[];
}

export interface DataFlowPath {
  startComponent: string;
  endComponent: string;
  dataType: string;
  transformations: string[];
  filePath: string;
  confidence: number;
}

export interface CommunicationPattern {
  patternType: string;
  frequency: number;
  components: string[];
  description: string;
}

export interface StronglyConnectedComponent {
  id: string;
  files: string[];
  cycleRisk: number;
  refactoringPriority: number;
}

/**
 * Semantic Relationship Mapping Engine
 * Maps dependencies, data flow, and architectural relationships between components
 */
export class SemanticRelationshipMapper {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private componentInteractions: ComponentInteraction[] = [];
  private dataFlowPaths: DataFlowPath[] = [];

  /**
   * Build comprehensive relationship mapping from parsed files
   */
  async buildRelationshipGraph(parsedFiles: ParsedFile[], _codeAnalysis: CodeAnalysisResult): Promise<RelationshipGraph> {
    try {
      // 1. Build dependency graph from imports/exports
      this.buildDependencyGraph(parsedFiles);
      
      // 2. Map component interactions
      this.mapComponentInteractions(parsedFiles);
      
      // 3. Analyze data flow patterns
      this.analyzeDataFlow(parsedFiles);
      
      // 4. Detect communication patterns
      this.detectCommunicationPatterns(parsedFiles);
      
      // 5. Identify critical paths and strongly connected components
      const criticalPaths = this.findCriticalPaths();
      const stronglyConnectedComponents = this.findStronglyConnectedComponents();
      
      // 6. Map architectural layers
      const architecturalLayers = this.mapArchitecturalLayers(parsedFiles);

      return {
        // Convert internal structures to interface requirements
        dependencies: this.convertToDependencyEdges(),
        dataFlow: this.convertToDataFlowEdges(),
        communicationPatterns: this.convertToCommunicationEdges(),
        stronglyConnectedComponents,
        criticalPaths,
        architecturalLayers
      };
      
    } catch (error) {
      console.error('Relationship mapping failed:', error);
      return {
        dependencies: [],
        dataFlow: [],
        communicationPatterns: [],
        stronglyConnectedComponents: [],
        criticalPaths: [],
        architecturalLayers: []
      };
    }
  }

  /**
   * Build dependency graph from import/export analysis
   */
  private buildDependencyGraph(parsedFiles: ParsedFile[]): void {
    // Initialize nodes for each file
    for (const file of parsedFiles) {
      if (!file.parseSuccess) continue;
      
      const node: DependencyNode = {
        filePath: file.filePath,
        exports: this.extractExports(file),
        imports: this.extractImports(file),
        functions: this.extractFunctionInfo(file),
        classes: this.extractClassInfo(file),
        dependents: [],
        dependencies: [],
        cycleRisk: 0,
        importance: 0
      };
      
      this.dependencyGraph.set(file.filePath, node);
    }
    
    // Build dependency relationships
    this.buildDependencyRelationships();
    
    // Calculate metrics
    this.calculateDependencyMetrics();
  }

  /**
   * Map component interactions based on method calls and data flow
   */
  private mapComponentInteractions(parsedFiles: ParsedFile[]): void {
    for (const file of parsedFiles) {
      if (!file.parseSuccess) continue;
      
      const interactions = this.analyzeFileInteractions(file);
      this.componentInteractions.push(...interactions);
    }
  }

  /**
   * Analyze data flow patterns through the system
   */
  private analyzeDataFlow(parsedFiles: ParsedFile[]): void {
    for (const file of parsedFiles) {
      if (!file.parseSuccess) continue;
      
      const dataFlows = this.extractDataFlowFromFile(file);
      this.dataFlowPaths.push(...dataFlows);
    }
  }

  /**
   * Detect communication patterns (sync/async, events, etc.)
   */
  private detectCommunicationPatterns(parsedFiles: ParsedFile[]): void {
    // Communication patterns are analyzed but stored in componentInteractions
    this.analyzeCommunicationPatterns(parsedFiles);
  }

  /**
   * Find critical paths through the system
   */
  private findCriticalPaths(): CriticalPath[] {
    const criticalPaths: CriticalPath[] = [];
    
    // Identify entry and exit points
    const entryPoints = this.findEntryPoints();
    const exitPoints = this.findExitPoints();
    
    // Find paths between entry and exit points
    for (const entry of entryPoints) {
      for (const exit of exitPoints) {
        const path = this.findShortestPath(entry.filePath, exit.filePath);
        if (path && path.length > 2) {
          criticalPaths.push({
            components: path,
            businessProcess: this.inferBusinessProcess(path),
            riskFactors: this.assessPathRisks(path),
            mitigation: this.suggestMitigation(path)
          });
        }
      }
    }
    
    return criticalPaths.sort((a, b) => {
      const aRisk = a.riskFactors.reduce((sum, r) => sum + this.riskScore(r), 0);
      const bRisk = b.riskFactors.reduce((sum, r) => sum + this.riskScore(r), 0);
      return bRisk - aRisk;
    }).slice(0, 10);
  }

  /**
   * Find strongly connected components (circular dependencies)
   */
  private findStronglyConnectedComponents(): ComponentCluster[] {
    const components: ComponentCluster[] = [];
    const visited = new Set<string>();
    
    for (const [filePath] of this.dependencyGraph) {
      if (!visited.has(filePath)) {
        const component = this.findComponentFromNode(filePath, visited);
        if (component.files.length > 1) {
          components.push({
            components: component.files,
            cohesionScore: this.calculateComponentCohesion(component.files),
            businessPurpose: this.inferComponentPurpose(component.files),
            refactoringRecommendation: this.suggestRefactoring(component.files)
          });
        }
      }
    }
    
    return components.sort((a, b) => b.cohesionScore - a.cohesionScore);
  }

  /**
   * Map architectural layers based on file organization and dependencies
   */
  private mapArchitecturalLayers(parsedFiles: ParsedFile[]): ArchitecturalLayer[] {
    const layers: ArchitecturalLayer[] = [];
    
    const layerCandidates = this.identifyLayerCandidates(parsedFiles);
    
    for (const [layerName, files] of layerCandidates) {
      const dependencies = this.calculateLayerDependencies(files);
      
      layers.push({
        name: layerName,
        responsibility: this.identifyLayerPurpose(layerName, files),
        components: files,
        dependencies,
        businessPurpose: this.identifyLayerBusinessPurpose(layerName, files)
      });
    }
    
    return layers.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Conversion methods to interface types
  private convertToDependencyEdges(): DependencyEdge[] {
    const edges: DependencyEdge[] = [];
    
    for (const [sourceFile, node] of this.dependencyGraph) {
      for (const dep of node.dependencies) {
        edges.push({
          source: sourceFile,
          target: dep.targetFile,
          type: dep.importType as any,
          strength: dep.strength,
          businessRelationship: this.inferBusinessRelationship(sourceFile, dep.targetFile)
        });
      }
    }
    
    return edges;
  }

  private convertToDataFlowEdges(): DataFlowEdge[] {
    return this.dataFlowPaths.map(path => ({
      source: path.startComponent,
      target: path.endComponent,
      dataType: path.dataType,
      businessPurpose: this.inferDataFlowPurpose(path),
      transformation: path.transformations.map(t => ({
        operation: t,
        businessReason: 'Data transformation',
        validation: []
      }))
    }));
  }

  private convertToCommunicationEdges(): CommunicationEdge[] {
    return this.componentInteractions.map(interaction => ({
      source: interaction.sourceComponent,
      target: interaction.targetComponent,
      protocol: this.inferProtocol(interaction.interactionType),
      businessTrigger: this.inferBusinessTrigger(interaction),
      errorHandling: this.inferErrorHandling(interaction)
    }));
  }

  // Helper methods for analysis
  private extractExports(file: ParsedFile): { name: string; type: string; isDefault: boolean }[] {
    // Extract exports from AST
    if (file.ast && file.ast.exports) {
      return file.ast.exports.map((exp: any) => ({
        name: exp.name || 'default',
        type: exp.type || 'unknown',
        isDefault: exp.isDefault || false
      }));
    }
    return [];
  }

  private extractImports(file: ParsedFile): { source: string; items: string[]; type: string; isExternal: boolean }[] {
    // Extract imports from AST
    if (file.ast && file.ast.imports) {
      return file.ast.imports.map((imp: any) => ({
        source: imp.module || '',
        items: imp.imports || [],
        type: imp.type || 'import',
        isExternal: this.isExternalModule(imp.module)
      }));
    }
    return [];
  }

  private extractFunctionInfo(file: ParsedFile): { name: string; isExported: boolean; complexity: number; callsExternal: boolean }[] {
    // Extract function information from AST
    if (file.ast && file.ast.functions) {
      return file.ast.functions.map((func: any) => ({
        name: func.name || 'anonymous',
        isExported: func.isExported || false,
        complexity: func.complexity || 1,
        callsExternal: func.callsExternal || false
      }));
    }
    return [];
  }

  private extractClassInfo(file: ParsedFile): { name: string; isExported: boolean; methodCount: number; extendsTypes: string[]; implementsTypes: string[] }[] {
    // Extract class information from AST
    if (file.ast && file.ast.classes) {
      return file.ast.classes.map((cls: any) => ({
        name: cls.name || 'Anonymous',
        isExported: cls.isExported || false,
        methodCount: cls.methods?.length || 0,
        extendsTypes: cls.inheritance?.superClass ? [cls.inheritance.superClass] : [],
        implementsTypes: cls.interfaces || []
      }));
    }
    return [];
  }

  private buildDependencyRelationships(): void {
    for (const [sourceFile, sourceNode] of this.dependencyGraph) {
      for (const importInfo of sourceNode.imports) {
        const targetFile = this.resolveImportPath(sourceFile, importInfo.source);
        if (targetFile && this.dependencyGraph.has(targetFile)) {
          const targetNode = this.dependencyGraph.get(targetFile)!;
          
          // Add dependency
          sourceNode.dependencies.push({
            targetFile,
            importedItems: importInfo.items,
            importType: importInfo.type,
            strength: this.calculateDependencyStrength(importInfo)
          });
          
          // Add dependent
          targetNode.dependents.push({
            sourceFile,
            exportedItems: importInfo.items,
            dependencyType: importInfo.type
          });
        }
      }
    }
  }

  private calculateDependencyMetrics(): void {
    for (const [, node] of this.dependencyGraph) {
      node.cycleRisk = this.calculateCycleRisk(node);
      node.importance = this.calculateImportance(node);
    }
  }

  // Stub implementations for analysis methods
  private isExternalModule(moduleName: string): boolean {
    return !moduleName.startsWith('.') && !moduleName.startsWith('/');
  }

  private resolveImportPath(_sourceFile: string, importPath: string): string | null {
    // Simplified path resolution
    return importPath.startsWith('.') ? importPath : null;
  }

  private calculateDependencyStrength(_importInfo: any): number {
    return 1; // Simplified calculation
  }

  private calculateCycleRisk(_node: DependencyNode): number {
    return 0; // Placeholder for cycle detection algorithm
  }

  private calculateImportance(node: DependencyNode): number {
    return node.dependents.length + node.exports.length;
  }

  private analyzeFileInteractions(_file: ParsedFile): ComponentInteraction[] {
    return []; // Placeholder for interaction analysis
  }

  private extractDataFlowFromFile(_file: ParsedFile): DataFlowPath[] {
    return []; // Placeholder for data flow analysis
  }

  private analyzeCommunicationPatterns(_parsedFiles: ParsedFile[]): CommunicationPattern[] {
    return []; // Placeholder for communication pattern analysis
  }

  private findEntryPoints(): DependencyNode[] {
    const entryPoints: DependencyNode[] = [];
    for (const [, node] of this.dependencyGraph) {
      if (node.dependencies.length === 0 || this.isLikelyEntryPoint(node)) {
        entryPoints.push(node);
      }
    }
    return entryPoints;
  }

  private findExitPoints(): DependencyNode[] {
    const exitPoints: DependencyNode[] = [];
    for (const [, node] of this.dependencyGraph) {
      if (node.dependents.length === 0 || this.isLikelyExitPoint(node)) {
        exitPoints.push(node);
      }
    }
    return exitPoints;
  }

  private isLikelyEntryPoint(node: DependencyNode): boolean {
    return node.filePath.includes('main') || 
           node.filePath.includes('index') || 
           node.filePath.includes('app');
  }

  private isLikelyExitPoint(node: DependencyNode): boolean {
    return node.filePath.includes('output') || 
           node.filePath.includes('export') || 
           node.filePath.includes('response');
  }

  private findShortestPath(_start: string, _end: string): string[] | null {
    // Placeholder for shortest path algorithm
    return null;
  }

  private inferBusinessProcess(_path: string[]): string {
    return `Business process involving ${_path.length} components`;
  }

  private assessPathRisks(_path: string[]): any[] {
    return [{
      type: 'complexity',
      description: 'Path complexity risk',
      probability: 'medium',
      impact: 'medium'
    }];
  }

  private suggestMitigation(_path: string[]): any[] {
    return [{
      strategy: 'Simplify path',
      effort: 'medium',
      effectiveness: 'high',
      businessValue: 'Improved maintainability'
    }];
  }

  private riskScore(_risk: any): number {
    return 1; // Simplified risk scoring
  }

  private findComponentFromNode(startNode: string, visited: Set<string>): { files: string[] } {
    visited.add(startNode);
    return { files: [startNode] };
  }

  private calculateComponentCohesion(_files: string[]): number {
    return 0.7; // Placeholder calculation
  }

  private inferComponentPurpose(files: string[]): string {
    if (files.some(f => f.includes('service'))) return 'Business logic services';
    if (files.some(f => f.includes('controller'))) return 'API controllers';
    if (files.some(f => f.includes('model'))) return 'Data models';
    return 'General purpose components';
  }

  private suggestRefactoring(_files: string[]): string {
    return 'Consider breaking down into smaller, more focused components';
  }

  private identifyLayerCandidates(parsedFiles: ParsedFile[]): Map<string, string[]> {
    const layers = new Map<string, string[]>();
    
    for (const file of parsedFiles) {
      const path = file.filePath;
      let layer = 'core';
      
      if (path.includes('controller')) layer = 'controllers';
      else if (path.includes('service')) layer = 'services';
      else if (path.includes('model') || path.includes('entity')) layer = 'models';
      else if (path.includes('view') || path.includes('component')) layer = 'views';
      else if (path.includes('repository') || path.includes('dao')) layer = 'data';
      else if (path.includes('util') || path.includes('helper')) layer = 'utilities';
      
      const existing = layers.get(layer) || [];
      existing.push(path);
      layers.set(layer, existing);
    }
    
    return layers;
  }

  private calculateLayerDependencies(_files: string[]): string[] {
    return []; // Placeholder for layer dependency calculation
  }

  private identifyLayerPurpose(layerName: string, _files: string[]): string {
    switch (layerName) {
      case 'controllers': return 'Handle HTTP requests and responses';
      case 'services': return 'Implement business logic';
      case 'models': return 'Define data structures and validation';
      case 'views': return 'Render user interface components';
      case 'data': return 'Manage data persistence and access';
      case 'utilities': return 'Provide helper functions and utilities';
      default: return 'Core application functionality';
    }
  }

  private identifyLayerBusinessPurpose(layerName: string, _files: string[]): string {
    return this.identifyLayerPurpose(layerName, _files);
  }

  private inferBusinessRelationship(_source: string, _target: string): string {
    return 'Functional dependency';
  }

  private inferDataFlowPurpose(_path: DataFlowPath): string {
    return `Data flow for ${_path.dataType}`;
  }

  private inferProtocol(interactionType: string): 'synchronous' | 'asynchronous' | 'event' | 'message' {
    if (interactionType.includes('async')) return 'asynchronous';
    if (interactionType.includes('event')) return 'event';
    if (interactionType.includes('message')) return 'message';
    return 'synchronous';
  }

  private inferBusinessTrigger(_interaction: ComponentInteraction): string {
    return 'User action or system event';
  }

  private inferErrorHandling(_interaction: ComponentInteraction): any[] {
    return [{
      errorType: 'communication_failure',
      strategy: 'retry',
      businessImpact: 'User experience degradation'
    }];
  }
}