/**
 * AI Response Processing System for Manual Workflow (Phase 2)
 * 
 * Processes AI-generated responses from Phase 1 prompts into formatted memory bank files.
 * This completes the manual workflow by turning AI assistant responses into structured documentation.
 */

import { ProjectAnalysisCache } from './analysisCache.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * AI responses from the user's AI assistant for all 6 memory bank sections
 */
export interface AIResponses {
    projectBrief: string;
    productContext: string;
    techContext: string;
    systemPatterns: string;
    activeContext: string;
    progress: string;
}

/**
 * Validation result for AI responses
 */
export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    completeness: number;
    enhancementSuggestions?: string[];
}

export interface ValidationIssue {
    section: string;
    type: 'incomplete' | 'generic' | 'quality';
    message: string;
}

/**
 * Result of memory bank generation from AI responses
 */
export interface MemoryBankResult {
    success: boolean;
    files: string[];
    memoryBankPath: string;
    qualityScore?: number;
    enhancementNeeded?: boolean;
    enhancementSuggestions?: string[];
    error?: string;
}

/**
 * Formatted content ready for file writing
 */
export interface FormattedContent {
    projectBrief: string;
    productContext: string;
    techContext: string;
    systemPatterns: string;
    activeContext: string;
    progress: string;
}

export class AIResponseProcessor {
    private cache: ProjectAnalysisCache;
    
    constructor() {
        this.cache = new ProjectAnalysisCache();
    }
    
    /**
     * Main entry point for processing AI responses into memory bank files
     */
    async processResponses(
        analysisId: string,
        aiResponses: AIResponses,
        projectPath: string
    ): Promise<MemoryBankResult> {
        try {
            console.log(`🔄 Processing AI responses for analysis: ${analysisId}`);
            
            // Basic validation
            const validation = this.validateResponses(aiResponses);
            if (!validation.isValid) {
                return {
                    success: false,
                    files: [],
                    memoryBankPath: '',
                    enhancementNeeded: true,
                    enhancementSuggestions: validation.issues.map(issue => issue.message),
                    error: 'AI responses need improvement before proceeding'
                };
            }
            
            // Format all responses into proper memory bank content
            const formattedContent = this.formatAllResponses(aiResponses, projectPath, analysisId);
            
            // Create memory bank files
            const memoryBankPath = join(projectPath, '.github', 'memory-bank');
            const files = await this.writeMemoryBankFiles(formattedContent, memoryBankPath);
            
            console.log(`✅ Generated ${files.length} memory bank files`);
            
            return {
                success: true,
                files,
                memoryBankPath,
                qualityScore: validation.completeness,
                enhancementNeeded: false
            };
            
        } catch (error: any) {
            console.error('❌ Error processing AI responses:', error);
            return {
                success: false,
                files: [],
                memoryBankPath: '',
                error: error.message
            };
        }
    }
    
    /**
     * Validate AI responses for completeness and basic quality
     */
    private validateResponses(responses: AIResponses): ValidationResult {
        const results: ValidationResult = {
            isValid: true,
            issues: [],
            completeness: 0
        };
        
        const sections = Object.keys(responses) as Array<keyof AIResponses>;
        let validSections = 0;
        
        // Check response completeness
        for (const section of sections) {
            const content = responses[section];
            
            if (!content || content.trim().length < 50) {
                results.issues.push({
                    section,
                    type: 'incomplete',
                    message: `${section} response is too short or missing (needs at least 50 characters)`
                });
                results.isValid = false;
            } else {
                validSections++;
                
                // Check for overly generic content
                const genericPhrases = ['software project', 'this application', 'the system', 'various components'];
                const genericCount = genericPhrases.filter(phrase => 
                    content.toLowerCase().includes(phrase)
                ).length;
                
                if (genericCount > 2) {
                    results.issues.push({
                        section,
                        type: 'generic',
                        message: `${section} appears generic. Consider adding more project-specific details.`
                    });
                }
            }
        }
        
        results.completeness = Math.round((validSections / sections.length) * 100);
        
        return results;
    }
    
    /**
     * Format all AI responses into proper memory bank markdown files
     */
    private formatAllResponses(responses: AIResponses, projectPath: string, analysisId: string): FormattedContent {
        const timestamp = new Date().toISOString();
        const projectName = projectPath.split(/[\\/]/).pop() || 'Unknown Project';
        
        return {
            projectBrief: this.formatProjectBrief(responses.projectBrief, projectName, projectPath, analysisId, timestamp),
            productContext: this.formatProductContext(responses.productContext, projectName, timestamp),
            techContext: this.formatTechContext(responses.techContext, projectName, timestamp),
            systemPatterns: this.formatSystemPatterns(responses.systemPatterns, projectName, timestamp),
            activeContext: this.formatActiveContext(responses.activeContext, projectName, timestamp),
            progress: this.formatProgress(responses.progress, projectName, timestamp)
        };
    }
    
    /**
     * Format project brief with metadata
     */
    private formatProjectBrief(content: string, projectName: string, projectPath: string, analysisId: string, timestamp: string): string {
        return `# Project Brief

*Generated: ${timestamp}*  
*Project: ${projectName}*  
*Analysis ID: ${analysisId}*  
*Location: \`${projectPath}\`*

${content}

---
*This project brief was generated using AI-powered analysis and manual workflow processing.*`;
    }
    
    /**
     * Format product context
     */
    private formatProductContext(content: string, projectName: string, timestamp: string): string {
        return `# Product Context

*Generated: ${timestamp}*  
*Project: ${projectName}*

${content}

---
*This product context was generated using AI-powered business analysis.*`;
    }
    
    /**
     * Format technical context
     */
    private formatTechContext(content: string, projectName: string, timestamp: string): string {
        return `# Technical Context

*Generated: ${timestamp}*  
*Project: ${projectName}*

${content}

---
*This technical context was generated using AI-powered technical analysis.*`;
    }
    
    /**
     * Format system patterns
     */
    private formatSystemPatterns(content: string, projectName: string, timestamp: string): string {
        return `# System Patterns

*Generated: ${timestamp}*  
*Project: ${projectName}*

${content}

---
*These system patterns were identified using AI-powered architectural analysis.*`;
    }
    
    /**
     * Format active context
     */
    private formatActiveContext(content: string, projectName: string, timestamp: string): string {
        return `# Active Context

*Generated: ${timestamp}*  
*Project: ${projectName}*

${content}

---
*This active context was generated using AI-powered development state analysis.*`;
    }
    
    /**
     * Format progress report
     */
    private formatProgress(content: string, projectName: string, timestamp: string): string {
        return `# Progress Report

*Generated: ${timestamp}*  
*Project: ${projectName}*

${content}

---
*This progress report was generated using AI-powered project status analysis.*`;
    }
    
    /**
     * Write all formatted content to memory bank files
     */
    private async writeMemoryBankFiles(content: FormattedContent, memoryBankPath: string): Promise<string[]> {
        // Ensure memory bank directory exists
        await mkdir(memoryBankPath, { recursive: true });
        
        const fileMappings = [
            { filename: 'projectbrief.md', content: content.projectBrief },
            { filename: 'productContext.md', content: content.productContext },
            { filename: 'techContext.md', content: content.techContext },
            { filename: 'systemPatterns.md', content: content.systemPatterns },
            { filename: 'activeContext.md', content: content.activeContext },
            { filename: 'progress.md', content: content.progress }
        ];
        
        const writtenFiles: string[] = [];
        
        // Write each file
        for (const { filename, content } of fileMappings) {
            const filePath = join(memoryBankPath, filename);
            await writeFile(filePath, content, 'utf8');
            writtenFiles.push(filename);
            console.log(`📝 Created: ${filename}`);
        }
        
        return writtenFiles;
    }
    
    /**
     * Get the cache instance for external access
     */
    getCacheInstance(): ProjectAnalysisCache {
        return this.cache;
    }
}