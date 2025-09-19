/**
 * Project Intelligence Engine - Main Entry Point
 * Comprehensive intelligence-driven project analysis and content generation
 */

import { DeepFileAnalysisEngine } from './deepFileAnalysis';
import { SemanticRelationshipMapper } from './semanticMapping';
import { DynamicContentSynthesisEngine } from './contentSynthesis';
import { ProjectIntelligence } from './types';

// Re-export all types and classes for easy access
export * from './types';
export * from './astParsing';
export * from './deepFileAnalysis';
export * from './semanticMapping';
export * from './contentSynthesis';

/**
 * Main Project Intelligence Engine
 * Orchestrates deep analysis, semantic mapping, and intelligence generation
 */
export class ProjectIntelligenceEngine {
  private deepAnalysisEngine: DeepFileAnalysisEngine;
  private semanticMapper: SemanticRelationshipMapper;
  private contentSynthesizer: DynamicContentSynthesisEngine;

  constructor() {
    this.deepAnalysisEngine = new DeepFileAnalysisEngine();
    this.semanticMapper = new SemanticRelationshipMapper();
    this.contentSynthesizer = new DynamicContentSynthesisEngine();
  }

  /**
   * Analyze project and generate comprehensive intelligence
   */
  async analyzeProject(projectPath: string): Promise<ProjectIntelligence> {
    try {
      // Use the deep file analysis engine for comprehensive analysis
      const intelligence = await this.deepAnalysisEngine.analyzeProject(projectPath);
      
      // Enhance with semantic relationship mapping
      const enhancedRelationships = await this.semanticMapper.buildRelationshipGraph(
        intelligence.codeAnalysis.parsedFiles,
        intelligence.codeAnalysis
      );
      
      // Return enhanced intelligence with semantic relationships
      return {
        ...intelligence,
        relationships: enhancedRelationships
      };
    } catch (error) {
      console.error('Project Intelligence Engine analysis failed:', error);
      throw new Error(`Intelligence analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate synthesized content from project intelligence
   */
  async generateContent(intelligence: ProjectIntelligence, options?: any): Promise<any> {
    try {
      return await this.contentSynthesizer.synthesizeContent(intelligence, options);
    } catch (error) {
      console.error('Content synthesis failed:', error);
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get analysis engine for direct access to deep file analysis
   */
  getAnalysisEngine(): DeepFileAnalysisEngine {
    return this.deepAnalysisEngine;
  }

  /**
   * Get semantic mapper for direct access to relationship mapping
   */
  getSemanticMapper(): SemanticRelationshipMapper {
    return this.semanticMapper;
  }

  /**
   * Get content synthesizer for direct access to content generation
   */
  getContentSynthesizer(): DynamicContentSynthesisEngine {
    return this.contentSynthesizer;
  }
}