import { ProjectAnalysisResult } from './analysisTypes.js';

/**
 * LLM Types for AI-powered content generation
 * Defines interfaces for prompts, responses, and phase management
 */

// Type alias for compatibility
export type ProjectAnalysis = ProjectAnalysisResult & {
  rootPath: string;
  stats?: {
    totalFiles: number;
    totalLines?: number;
    languages: Array<{ name: string; percentage: number; files?: number }>;
    dependencies?: string[];
  };
  structure?: {
    directories: Array<{ name: string; fileCount?: number }>;
    files: Array<{ name: string; path: string }>;
  };
  intelligence?: {
    entryPoints?: string[];
    keyFiles?: Array<{ path: string; purpose?: string }>;
    patterns?: Array<{ pattern?: string; name?: string; files?: string[]; description?: string }>;
    recentChanges?: string[];
  };
};

export interface LLMPromptSet {
    projectBrief: string;
    productContext: string;
    activeContext: string;
    systemPatterns: string;
    techContext: string;
    progress: string;
}

export interface LLMResponse {
    content: string;
    confidence?: number;
    metadata?: {
        tokensUsed?: number;
        processingTime?: number;
        model?: string;
    };
}

export interface ProcessedContent {
    projectBrief: string;
    productContext: string;
    activeContext: string;
    systemPatterns: string;
    techContext: string;
    progress: string;
}

export interface ContentEnhancementRequest {
    originalContent: string;
    qualityIssues: string[];
    enhancementPrompt: string;
}

export interface PromptContext {
    projectPath: string;
    analysis: ProjectAnalysis;
    keyFiles?: string[];
    patterns?: PatternInfo[];
    integrations?: string[];
}

export interface PatternInfo {
    name: string;
    description: string;
}

export interface Phase1Result {
    success: boolean;
    phase: 'prompts-ready';
    analysisId: string;
    prompts: LLMPromptSet;
    instructions: string;
    metadata: {
        filesAnalyzed: number;
        keyPatterns: number;
        estimatedTokens: number;
    };
}

export interface Phase2Result {
    success: boolean;
    phase: 'complete' | 'needs-enhancement';
    files?: string[];
    enhancementRequests?: string[];
    qualityMetrics: LLMQualityMetrics;
    metadata?: {
        generationTime: number;
        qualityScore: number;
    };
}

export interface LLMQualityMetrics {
    specificity: number;           // 85% target (specific file/function references)
    professionalTone: number;      // 90% target (enterprise-appropriate language)  
    technicalAccuracy: number;     // 85% target (correct technical concepts)
    businessContext: number;       // 80% target (clear business value)
    narrativeCoherence: number;    // 90% target (logical flow and structure)
    overallScore: number;          // Weighted average of all metrics
}

export interface QualityIssue {
    type: 'low-specificity' | 'unprofessional-tone' | 'generic-content' | 'low-technical-accuracy';
    score?: number;
    threshold?: number;
    phrases?: string[];
    enhancementPrompt: string;
}

export interface LLMValidationResult {
    passed: boolean;
    metrics: LLMQualityMetrics;
    issues?: QualityIssue[];
    enhancementRequests?: string[];
    overallScore: number;
}

export interface QualityThresholds {
    specificity: number;           // Default: 85
    professionalTone: number;      // Default: 90
    technicalAccuracy: number;     // Default: 85
    businessContext: number;       // Default: 80
    narrativeCoherence: number;    // Default: 90
}

export interface CachedAnalysis {
    analysis: ProjectAnalysis;
    timestamp: number;
    expires: number;
}

export interface MemoryBankGenerationOptions {
    analysisDepth?: 'shallow' | 'standard' | 'deep';
    includeTests?: boolean;
    focusAreas?: string[];
    qualityThresholds?: Partial<QualityThresholds>;
}

export interface EnhancementResponse {
    enhanced: boolean;
    content: ProcessedContent;
    qualityImprovement: number;
    iterations: number;
}