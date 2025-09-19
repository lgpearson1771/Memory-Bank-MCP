/**
 * AST Parsing Utilities
 * Language-specific Abstract Syntax Tree parsing and analysis
 */

import * as ts from 'typescript';
import * as path from 'path';
import {
  ProgrammingLanguage,
  TSFunctionAnalysis,
  TSClassAnalysis,
  TSInterfaceAnalysis,
  TSImportAnalysis,
  TSExportAnalysis,
  TSComponentAnalysis,
  TSRouteAnalysis,
  TSBusinessContext,
  TSParameterAnalysis,
  TSPropertyAnalysis,
  TSMethodAnalysis,
  TSMethodSignature,
  AbstractSyntaxTree
} from './types';

// TypeScript-specific analysis result interface
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

// Base language analyzer abstract class
export abstract class LanguageAnalyzer {
  abstract parse(content: string, filePath: string): Promise<any>;
}

/**
 * TypeScript AST Analyzer
 * Comprehensive TypeScript code analysis using TypeScript compiler API
 */
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
        businessContext: {
          domainConcepts: [],
          businessRules: [],
          workflows: [],
          stakeholders: [],
          purpose: '',
          domain: '',
          concepts: []
        },
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
    let documentation = '';

    // Type-specific analysis based on node type
    if (ts.isFunctionDeclaration(node)) {
      if (node.name) name = node.name.text;
      if (node.modifiers) {
        isAsync = node.modifiers.some((mod: ts.ModifierLike) => mod.kind === ts.SyntaxKind.AsyncKeyword);
      }
      if (node.parameters) {
        parameters = node.parameters.map(param => this.analyzeParameter(param));
      }
      if (node.type) {
        returnType = node.type.getText(sourceFile);
      }
      documentation = this.getJSDocComment(node, sourceFile) || '';
    }

    return {
      name,
      signature: {
        parameters,
        returnType,
        generics: [],
        modifiers: isAsync ? ['async'] : []
      },
      parameters,
      returnType,
      businessLogic: [{
        description: this.inferBusinessPurpose(name, documentation, parameters),
        businessValue: `Function ${name} provides specific functionality`,
        userImpact: 'Impacts user workflow',
        riskFactors: []
      }],
      sideEffects: [],
      errorHandling: []
    };
  }

  /**
   * Analyze method node for class methods
   */
  private analyzeMethodNode(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): TSMethodAnalysis | null {
    if (!node.name) return null;
    
    const name = node.name.getText(sourceFile);
    const parameters = node.parameters?.map(param => this.analyzeParameter(param)) || [];
    const returnType = node.type?.getText(sourceFile) || 'void';
    const documentation = this.getJSDocComment(node, sourceFile) || '';

    return {
      name,
      parameters,
      returnType,
      businessOperation: this.inferBusinessPurpose(name, documentation, parameters),
      implementation: '',
      businessLogic: [{
        description: this.inferBusinessPurpose(name, documentation, parameters),
        businessValue: `Method ${name} provides specific functionality`,
        userImpact: 'Impacts user workflow',
        riskFactors: []
      }],
      errorHandling: [],
      performance: {
        complexity: 'O(1)',
        resourceUsage: {
          memory: 'low',
          cpu: 'low',
          io: 'low',
          network: 'low'
        },
        optimizations: [],
        bottlenecks: []
      }
    };
  }
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
    const methods = node.members
      .filter(ts.isMethodDeclaration)
      .map(method => this.analyzeMethodNode(method, sourceFile))
      .filter((method): method is TSMethodAnalysis => method !== null);
    
    const properties = node.members
      .filter(ts.isPropertyDeclaration)
      .map(prop => this.analyzeProperty(prop, sourceFile));

    return {
      name,
      constructor: {
        parameters: [],
        initialization: [],
        businessSetup: 'Initialize class instance'
      },
      properties,
      methods,
      inheritance: {
        businessRelationship: 'No inheritance',
        overrides: []
      },
      interfaces: [],
      businessRole: this.inferClassBusinessPurpose(name, methods, properties),
      designPatterns: [],
      responsibilities: [`Manage ${name.toLowerCase()} functionality`]
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
  private analyzeInterfaceNode(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): TSInterfaceAnalysis | null {
    const name = node.name.text;
    const properties = node.members
      .filter(ts.isPropertySignature)
      .map(prop => this.analyzePropertySignature(prop, sourceFile));
    
    const methods = node.members
      .filter(ts.isMethodSignature)
      .map(method => this.analyzeMethodSignature(method, sourceFile));

    return {
      name,
      properties,
      methods,
      inheritance: [],
      businessPurpose: this.inferInterfaceBusinessPurpose(name, properties, methods),
      domainConcept: `${name} concept`,
      usagePatterns: []
    };
  }

  /**
   * Extract import statements
   */
  private extractImports(sourceFile: ts.SourceFile): TSImportAnalysis[] {
    const imports: TSImportAnalysis[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const importAnalysis = this.analyzeImportNode(node, sourceFile);
        if (importAnalysis) imports.push(importAnalysis);
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
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        const exportAnalysis = this.analyzeExportNode(node, sourceFile);
        if (exportAnalysis) exports.push(exportAnalysis);
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
      if (ts.isFunctionDeclaration(node) && this.isReactComponent(node)) {
        const component = this.analyzeReactComponent(node, sourceFile);
        if (component) components.push(component);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return components;
  }

  /**
   * Extract routing information
   */
  private extractRoutes(_sourceFile: ts.SourceFile): TSRouteAnalysis[] {
    // Implementation for route extraction
    return [];
  }

  /**
   * Extract business context from code
   */
  private extractBusinessContext(_sourceFile: ts.SourceFile, _content: string): TSBusinessContext {
    return {
      domainConcepts: [],
      businessRules: [],
      workflows: [],
      stakeholders: []
    };
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(sourceFile: ts.SourceFile): number {
    let complexity = 1;
    
    const visitNode = (node: ts.Node) => {
      // Increase complexity for control flow statements
      if (ts.isIfStatement(node) || ts.isForStatement(node) || ts.isWhileStatement(node) ||
          ts.isDoStatement(node) || ts.isSwitchStatement(node) || ts.isConditionalExpression(node)) {
        complexity++;
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return complexity;
  }

  /**
   * Detect design patterns in code
   */
  private detectPatterns(_sourceFile: ts.SourceFile): string[] {
    const patterns: string[] = [];
    
    // Pattern detection logic here
    
    return patterns;
  }

  /**
   * Extract dependencies from imports
   */
  private extractDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    
    const visitNode = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        dependencies.push(node.moduleSpecifier.text);
      }
      
      ts.forEachChild(node, visitNode);
    };
    
    visitNode(sourceFile);
    return [...new Set(dependencies)];
  }

  // Helper methods
  private analyzeParameter(param: ts.ParameterDeclaration): TSParameterAnalysis {
    return {
      name: param.name.getText(),
      type: param.type?.getText() || 'any',
      optional: !!param.questionToken,
      businessPurpose: `Parameter for operation`,
      validation: []
    };
  }

  private analyzeProperty(prop: ts.PropertyDeclaration, sourceFile: ts.SourceFile): TSPropertyAnalysis {
    return {
      name: prop.name?.getText() || 'unknown',
      type: prop.type?.getText() || 'any',
      optional: !!prop.questionToken,
      businessMeaning: 'Class property',
      validation: [],
      defaultValue: prop.initializer?.getText(sourceFile)
    };
  }

  private analyzePropertySignature(prop: ts.PropertySignature, _sourceFile: ts.SourceFile): TSPropertyAnalysis {
    return {
      name: prop.name?.getText() || 'unknown',
      type: prop.type?.getText() || 'any',
      optional: !!prop.questionToken,
      businessMeaning: 'Interface property',
      validation: []
    };
  }

  private analyzeMethodSignature(method: ts.MethodSignature, _sourceFile: ts.SourceFile): TSMethodSignature {
    return {
      name: method.name?.getText() || 'unknown',
      parameters: method.parameters?.map(p => this.analyzeParameter(p)) || [],
      returnType: method.type?.getText() || 'void',
      businessOperation: 'Interface method'
    };
  }

  private analyzeImportNode(node: ts.ImportDeclaration, _sourceFile: ts.SourceFile): TSImportAnalysis | null {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) return null;
    
    return {
      module: node.moduleSpecifier.text,
      imports: [],
      usage: [],
      businessDependency: 'External dependency'
    };
  }

  private analyzeExportNode(_node: ts.ExportDeclaration | ts.ExportAssignment, _sourceFile: ts.SourceFile): TSExportAnalysis | null {
    return {
      name: 'export',
      type: 'constant',
      businessValue: 'Exported functionality',
      consumers: []
    };
  }

  private isReactComponent(node: ts.FunctionDeclaration): boolean {
    return node.name?.text?.match(/^[A-Z]/) !== null;
  }

  private analyzeReactComponent(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): TSComponentAnalysis | null {
    if (!node.name) return null;
    
    return {
      name: node.name.text,
      type: 'react',
      props: this.extractComponentProps(node, sourceFile),
      state: [],
      lifecycle: [],
      businessPurpose: `React component: ${node.name.text}`,
      userInteractions: []
    };
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

  private inferClassBusinessPurpose(name: string, _methods: TSMethodAnalysis[], _properties: any[]): string {
    // Infer business purpose from class structure
    return `Class: ${name}`;
  }

  private inferInterfaceBusinessPurpose(name: string, _properties: any[], _methods: any[]): string {
    // Infer business purpose from interface structure
    return `Interface: ${name}`;
  }

  private extractComponentProps(_node: ts.FunctionDeclaration, _sourceFile: ts.SourceFile): TSPropertyAnalysis[] {
    // Extract React component props
    return [];
  }
}

// JavaScript analyzer
export class JavaScriptAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement JavaScript AST parsing
    return { type: 'javascript-ast', content: content.length };
  }
}

// Python analyzer
export class PythonAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Python AST parsing
    return { type: 'python-ast', content: content.length };
  }
}

// Java analyzer
export class JavaAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Java AST parsing
    return { type: 'java-ast', content: content.length };
  }
}

// C# analyzer
export class CSharpAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement C# AST parsing
    return { type: 'csharp-ast', content: content.length };
  }
}

// Go analyzer
export class GoAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Go AST parsing
    return { type: 'go-ast', content: content.length };
  }
}

// Universal fallback analyzer
export class UniversalAnalyzer extends LanguageAnalyzer {
  async parse(content: string, _filePath: string): Promise<any> {
    // TODO: Implement Tree-sitter universal parsing
    return { type: 'universal-ast', content: content.length };
  }
}

/**
 * Create AST from source code
 */
export function createAbstractSyntaxTree(content: string, filePath: string, language: ProgrammingLanguage): AbstractSyntaxTree {
  try {
    if (language === 'TypeScript' || language === 'JavaScript') {
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        path.extname(filePath) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );
      
      return {
        language,
        rootNode: sourceFile,
        sourceFile: filePath,
        parseSuccess: true
      };
    }
    
    // For other languages, return a placeholder
    return {
      language,
      rootNode: null,
      sourceFile: filePath,
      parseSuccess: false
    };
  } catch (error) {
    return {
      language,
      rootNode: null,
      sourceFile: filePath,
      parseSuccess: false
    };
  }
}