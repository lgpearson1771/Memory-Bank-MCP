import { ProjectAnalysis as RawProjectAnalysis, analyzeProject } from './projectAnalysis.js';
import { ProjectAnalysisCache } from './analysisCache.js';

/**
 * Prompt Engineering System for AI-Powered Memory Bank Generation
 * 
 * Transforms project analysis into contextual prompts for user's AI assistant.
 * This replaces direct LLM integration with manual workflow automation.
 */

export interface PromptPackage {
    prompts: {
        projectBrief: string;
        productContext: string;
        techContext: string;
        systemPatterns: string;
        activeContext: string;
        progress: string;
    };
    metadata: {
        projectPath: string;
        analysisId: string;
        timestamp: number;
        instructions: string;
        estimatedTokens: number;
    };
}

export interface PromptContext {
    projectPath: string;
    analysis: RawProjectAnalysis;
    keyFiles: string[];
    patterns: PatternInfo[];
    frameworks: string[];
    dependencies: DependencyInfo[];
}

export interface PatternInfo {
    name: string;
    description: string;
    confidence?: number;
}

export interface DependencyInfo {
    name: string;
    version: string;
    type: 'runtime' | 'development';
}

export class PromptEngineeringSystem {
    private cache: ProjectAnalysisCache;
    
    constructor() {
        this.cache = new ProjectAnalysisCache();
    }
    
    /**
     * Generate focused, context-rich prompts for AI processing
     * This is the main entry point for Phase 1 of the manual workflow
     */
    async generateFocusedPrompts(projectPath: string): Promise<PromptPackage> {
        // Perform project analysis first
        const rawAnalysis = await analyzeProject(projectPath);
        
        // Create a simple analysis ID for now (we'll improve caching later)
        const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Build prompt context with project-specific data
        const context = this.buildPromptContext(rawAnalysis, projectPath);
        
        // Generate all 6 prompts with contextual information
        const prompts = {
            projectBrief: this.createProjectBriefPrompt(context),
            productContext: this.createProductContextPrompt(context),
            techContext: this.createTechContextPrompt(context),
            systemPatterns: this.createSystemPatternsPrompt(context),
            activeContext: this.createActiveContextPrompt(context),
            progress: this.createProgressPrompt(context)
        };
        
        // Calculate estimated token usage for user awareness
        const estimatedTokens = this.estimateTokenUsage(prompts);
        
        // Store the raw analysis for Phase 2 (simplified for now)
        await this.storeAnalysisForPhase2(analysisId, rawAnalysis, projectPath);
        
        return {
            prompts,
            metadata: {
                projectPath,
                analysisId,
                timestamp: Date.now(),
                instructions: this.generateUserInstructions(),
                estimatedTokens
            }
        };
    }
    
    /**
     * Store analysis for Phase 2 retrieval (simplified implementation)
     */
    private async storeAnalysisForPhase2(analysisId: string, rawAnalysis: RawProjectAnalysis, projectPath: string): Promise<void> {
        // For now, we'll create a basic storage mechanism
        // TODO: Integrate with proper cache system in next iteration
        const analysisSize = JSON.stringify(rawAnalysis).length;
        console.log(`Analysis prepared with ID: ${analysisId} for project: ${projectPath} (${analysisSize} bytes)`);
        // Note: In the full implementation, this would store the analysis for Phase 2 retrieval
    }
    
    /**
     * Build comprehensive prompt context from project analysis
     */
    private buildPromptContext(analysis: RawProjectAnalysis, projectPath: string): PromptContext {
        return {
            projectPath,
            analysis,
            keyFiles: this.selectKeyFiles(analysis),
            patterns: this.extractPatterns(analysis),
            frameworks: analysis.frameworks || [],
            dependencies: this.extractDependencies(analysis)
        };
    }
    
    /**
     * Create project brief prompt with specific project context
     * This prompt generates the main project overview documentation
     */
    private createProjectBriefPrompt(context: PromptContext): string {
        const { analysis } = context;
        
        // Format key files for prompt inclusion
        const keyFilesSection = context.keyFiles.length > 0 
            ? `\\n\\nKey Files Analyzed:\\n${context.keyFiles.map(f => `- ${f}`).join('\\n')}` 
            : '';
            
        // Format detected patterns
        const patternsSection = context.patterns.length > 0
            ? `\\n\\nDetected Patterns:\\n${context.patterns.map(p => `- ${p.name}: ${p.description}`).join('\\n')}`
            : '';
            
        // Format project structure overview
        const structureSection = this.formatStructureForPrompt(analysis.structure);
        
        return `Analyze this ${analysis.projectType} project and provide a comprehensive, professional project brief.

**Project Context:**
- Name: ${analysis.projectName}
- Location: \`${context.projectPath}\`
- Type: ${analysis.projectType}
- Technology Stack: ${context.frameworks.join(', ') || 'Not specified'}
- Complexity: ${analysis.structure?.complexity || 'Unknown'}
- Total Files: ${analysis.structure?.estimatedFiles || 0}
${keyFilesSection}
${patternsSection}

**Project Structure Overview:**
${structureSection}

**Dependencies & Scripts:**
- Runtime Dependencies: ${Object.keys(analysis.dependencies.runtime).length} packages
- Development Dependencies: ${Object.keys(analysis.dependencies.development).length} packages
- Available Scripts: ${Object.keys(analysis.dependencies.scripts).join(', ') || 'None'}

**Please provide:**
1. **Executive Summary** - Project's core purpose and business value (be specific to THIS project)
2. **Core Functionality** - Main features and capabilities (reference actual implementations)
3. **Architecture Overview** - Key design decisions and patterns (mention specific files/components)
4. **Technology Rationale** - Why these specific technologies were chosen
5. **Development Approach** - Team patterns and conventions observed in the codebase

**Requirements:**
- Write in a professional, technical tone suitable for enterprise documentation
- Be specific to THIS project - reference actual files, functions, and implementations
- Avoid generic descriptions like "A software project" or "Various components"
- Include concrete examples from the codebase where relevant
- Focus on what makes this implementation unique and valuable

This brief will serve as the primary reference for understanding this system.`;
    }
    
    /**
     * Create technical context prompt for detailed implementation analysis
     */
    private createTechContextPrompt(context: PromptContext): string {
        const { analysis } = context;
        
        // Format dependency details
        const runtimeDeps = Object.entries(analysis.dependencies.runtime)
            .slice(0, 10) // Top 10 most important
            .map(([name, version]) => `${name}@${version}`)
            .join(', ') || 'None specified';
            
        const buildScripts = Object.entries(analysis.dependencies.scripts)
            .map(([name, command]) => `- ${name}: ${command}`)
            .join('\\n') || '- No scripts defined';
        
        return `Provide comprehensive technical documentation for this ${analysis.projectType} project.

**Technical Stack Analysis:**
- Primary Languages: ${this.getLanguageStats(analysis)}
- Frameworks & Libraries: ${context.frameworks.join(', ') || 'None detected'}
- Runtime Dependencies: ${runtimeDeps}
- System Type: ${analysis.architecture.systemType}

**Build & Development Workflow:**
${buildScripts}

**Architecture Patterns:**
${analysis.architecture.patterns.map(p => `- ${p}`).join('\\n') || '- No specific patterns detected'}

**Entry Points:**
${analysis.architecture.entryPoints.map(ep => `- \`${ep}\``).join('\\n') || '- No entry points identified'}

**Configuration Files:**
${analysis.architecture.configFiles.map(cf => `- \`${cf}\``).join('\\n') || '- No configuration files detected'}

**Please document:**
1. **Architecture Deep Dive** - Core design patterns and their specific implementations
2. **Technology Stack Details** - Framework versions, configuration, and integration patterns
3. **Code Organization** - Directory structure rationale, module boundaries, shared utilities
4. **Build & Deployment** - Development workflow, build process, environment setup
5. **Integration Points** - External dependencies, APIs, databases, third-party services

**Requirements:**
- Reference specific files and provide concrete examples from the codebase
- Explain technical decisions and trade-offs made in this implementation
- Document any custom implementations or architectural innovations
- Include configuration details and development workflow specifics
- Focus on what makes this technical implementation unique and well-architected

This documentation will serve as the primary technical reference for developers working with this system.`;
    }
    
    /**
     * Create product context prompt for business value analysis
     */
    private createProductContextPrompt(context: PromptContext): string {
        const { analysis } = context;
        
        // Extract business context information
        const domainType = analysis.businessContext?.domainType || 'Unknown';
        const problemDomain = analysis.businessContext?.problemDomain || 'General software development';
        
        return `Based on the codebase analysis, provide comprehensive business context and value proposition for this system.

**Project Business Profile:**
- Project: ${analysis.projectName}
- Domain Type: ${domainType}
- Problem Domain: ${problemDomain}
- System Type: ${analysis.architecture.systemType}
- Project Maturity: ${analysis.structure.complexity} complexity with ${analysis.structure.estimatedFiles} files

**Analyze and explain:**

1. **Business Purpose & Value**
   - What specific business problem does this system solve?
   - Who are the primary users and stakeholders?
   - What business processes does it enable or improve?
   - How does it fit into the larger business ecosystem?

2. **Value Proposition**
   - What are the key business benefits delivered by this system?
   - How does it improve efficiency, reduce costs, or enable new capabilities?
   - What competitive advantages or unique value does it provide?
   - What would be the business impact if this system were unavailable?

3. **Business Domain Context**
   - What industry or business domain does this system serve?
   - What are the key business concepts and terminology used?
   - What compliance, regulatory, or business rule requirements does it address?
   - How does it handle business workflow automation or process optimization?

4. **Stakeholder Impact & ROI**
   - How do different user roles interact with and benefit from this system?
   - What business metrics or KPIs does it influence or improve?
   - How does it integrate with other business systems and processes?
   - What business processes or decisions depend on this system?

**Requirements:**
- Write for both technical and business audiences
- Use business terminology evident in the code and project structure
- Reference specific features that deliver measurable business value
- Avoid technical jargon when explaining business concepts and benefits
- Focus on outcomes, business impact, and stakeholder value rather than just functionality
- Be specific to THIS project's business context and value proposition

This context will help stakeholders understand the business importance and strategic value of this system.`;
    }
    
    /**
     * Create system patterns prompt for architectural analysis
     */
    private createSystemPatternsPrompt(context: PromptContext): string {
        const { analysis } = context;
        
        // Format organization patterns
        const orgPatterns = analysis.structure.organizationPatterns?.map(p => 
            `- ${p.type}: ${p.description} (confidence: ${p.confidence || 'unknown'})`
        ).join('\\n') || '- No specific organization patterns detected';
        
        // Format architectural hints
        const archHints = analysis.structure.architecturalHints?.map(h =>
            `- ${h.pattern}: ${h.evidence?.join(', ') || 'No evidence'}`
        ).join('\\n') || '- No architectural hints detected';
        
        return `Analyze the codebase to identify and document the key patterns, practices, and conventions used throughout this system.

**Project Pattern Analysis:**
- Project: ${analysis.projectName} (${analysis.projectType})
- Organization Type: ${analysis.structure.organizationPatterns?.map(p => p.type).join(', ') || 'Unknown'}
- System Architecture: ${analysis.architecture.systemType}

**Detected Organization Patterns:**
${orgPatterns}

**Architectural Hints:**
${archHints}

**Document the following pattern categories:**

1. **Architectural Patterns**
   - MVC/MVP/MVVM implementations and variations found in this codebase
   - Repository, Unit of Work, and data access patterns
   - Factory, Builder, and object creation patterns
   - Observer, Pub/Sub, and communication patterns used
   - Middleware, interceptor, and request processing patterns

2. **Development Practices & Conventions**
   - Naming conventions for classes, methods, variables, and files
   - File organization and module structure patterns specific to this project
   - Error handling and exception management approaches used
   - Logging, monitoring, and observability patterns implemented
   - Testing patterns and quality assurance practices evident

3. **Data Handling & Processing Patterns**
   - Data access patterns and abstraction layers
   - Validation and sanitization strategies implemented
   - Serialization and data transformation approaches
   - Caching patterns and invalidation strategies used
   - Transaction management and data consistency approaches

4. **Integration & Communication Patterns**
   - API design and integration patterns
   - Service communication and protocol patterns
   - Configuration management and environment handling
   - Dependency injection and inversion of control usage

**Requirements:**
- Provide specific code examples and file references demonstrating each pattern
- Reference actual files, classes, and methods where patterns are implemented
- Explain the benefits and trade-offs of the pattern choices made in this project
- Document any custom or unique pattern implementations specific to this system
- Show how these patterns contribute to maintainability, scalability, and code quality
- Focus on patterns that are unique to or particularly well-implemented in this specific project

This analysis will help developers understand and maintain consistency with the established patterns and practices.`;
    }
    
    /**
     * Create active context prompt for current development state
     */
    private createActiveContextPrompt(context: PromptContext): string {
        const { analysis } = context;
        
        return `Provide active development context for this project, focusing on current state and ongoing development indicators.

**Project Current State:**
- Project: ${analysis.projectName}
- Estimated Files: ${analysis.structure.estimatedFiles}
- Complexity Level: ${analysis.structure.complexity}
- Primary Technologies: ${context.frameworks.join(', ') || 'Not specified'}

**Document the current development context:**

1. **Current Development State**
   - What is the current version or development phase of this project?
   - What features appear to be actively developed or recently implemented?
   - What areas of the codebase show the most recent development activity?
   - What development workflows and practices are evident from the project structure?

2. **Active Areas of Focus**
   - Which components or modules appear to be most actively maintained?
   - What new features or capabilities are being added based on code structure?
   - What technical debt or refactoring efforts are evident?
   - What integration or deployment improvements are apparent?

3. **Development Infrastructure & Practices**
   - What development tools and build processes are set up?
   - What testing infrastructure and practices are in place?
   - What CI/CD or automation practices are evident?
   - What documentation and knowledge management practices are used?

4. **Current Priorities & Next Steps**
   - What appears to be the current development priorities based on project structure?
   - What quality improvements or optimizations are in progress or needed?
   - What external dependencies or integrations are being updated or added?
   - What opportunities exist for code reuse, standardization, or architectural improvements?

**Requirements:**
- Base analysis on observable evidence from the codebase structure and configuration
- Reference specific files, directories, and configurations that indicate development activity
- Avoid speculation - stick to what's observable in the current project state
- Highlight patterns that indicate development priorities and practices
- Provide actionable insights for continued development and improvement
- Focus on what the current state reveals about development momentum and direction

This context will help understand the current development trajectory and immediate opportunities for improvement.`;
    }
    
    /**
     * Create progress prompt for project status and development tracking
     */
    private createProgressPrompt(context: PromptContext): string {
        const { analysis } = context;
        
        // Calculate some basic progress indicators
        const hasTests = analysis.structure.directories.some(d => 
            d.includes('test') || d.includes('spec') || d.includes('__tests__')
        );
        const hasConfig = analysis.architecture.configFiles.length > 0;
        const hasDocs = analysis.structure.rootFiles.some(f => 
            f.toLowerCase().includes('readme') || f.toLowerCase().includes('doc')
        );
        
        return `Based on the project analysis, provide a comprehensive progress report and status overview for this development project.

**Project Progress Indicators:**
- Project: ${analysis.projectName} (${analysis.projectType})
- Scale: ${analysis.structure.estimatedFiles} files, ${analysis.structure.complexity} complexity
- Infrastructure: ${hasConfig ? '✅' : '❌'} Configuration, ${hasTests ? '✅' : '❌'} Testing, ${hasDocs ? '✅' : '❌'} Documentation
- Technologies: ${context.frameworks.join(', ') || 'Basic setup'}

**Document the current project status:**

1. **Development Progress & Maturity**
   - What is the current implementation status of major features and components?
   - Which modules or functionalities appear complete vs. in development vs. planned?
   - What milestones have been achieved in the project lifecycle?
   - What indicates the project's maturity level (prototype, MVP, production-ready, mature)?

2. **Implementation Completeness**
   - What core functionality is working and appears to be tested?
   - What areas need additional development, refinement, or completion?
   - What technical debt or architectural improvements are needed?
   - What quality improvements are evident or required?

3. **Project Health & Development Momentum**
   - What does the codebase structure suggest about development velocity and practices?
   - What areas show active development vs. stable, mature implementation?
   - What patterns suggest good development practices vs. areas needing improvement?
   - What dependencies, integrations, or external systems are fully vs. partially implemented?

4. **Future Roadmap & Development Opportunities**
   - What architectural decisions or code structures suggest planned future expansions?
   - What incomplete implementations or TODO patterns point to intended next steps?
   - What patterns or infrastructure are in place for scalability and growth?
   - What development practices, documentation, or quality improvements would benefit the project?

5. **Success Metrics & Project Value**
   - What evidence suggests this project is delivering value in its intended domain?
   - What indicates the project is meeting its technical and business objectives?
   - What metrics or indicators would best measure continued progress?
   - What would constitute the next major milestone or achievement for this project?

**Requirements:**
- Base analysis on observable code patterns, structure, and implementation completeness
- Reference specific files, components, or features where possible to support assessments
- Avoid speculation - focus on what's evident in the current codebase and project structure
- Provide both current status and logical next development priorities
- Write for project stakeholders who need to understand project momentum and success
- Focus on actionable insights about project health, progress, and opportunities

This progress report will help stakeholders understand where the project stands and what the logical next steps should be.`;
    }
    
    /**
     * Select the most important files for AI analysis context
     */
    private selectKeyFiles(analysis: RawProjectAnalysis): string[] {
        const keyFiles: string[] = [];
        
        // Add entry points if they exist
        if (analysis.architecture?.entryPoints) {
            keyFiles.push(...analysis.architecture.entryPoints);
        }
        
        // Add configuration files if they exist 
        if (analysis.architecture?.configFiles) {
            keyFiles.push(...analysis.architecture.configFiles);
        }
        
        // Add some source files based on type
        if (analysis.structure?.sourceFiles?.typescript && analysis.structure.sourceFiles.typescript.length > 0) {
            keyFiles.push(...analysis.structure.sourceFiles.typescript.slice(0, 5));
        } else if (analysis.structure?.sourceFiles?.javascript && analysis.structure.sourceFiles.javascript.length > 0) {
            keyFiles.push(...analysis.structure.sourceFiles.javascript.slice(0, 5));
        }
        
        // Add some key directories as examples
        if (analysis.structure?.directories) {
            const importantDirs = analysis.structure.directories.filter(d => 
                d.includes('src') || d.includes('lib') || d.includes('components') || 
                d.includes('routes') || d.includes('services') || d.includes('utils')
            ).slice(0, 3);
            keyFiles.push(...importantDirs.map(d => `${d}/`));
        }
        
        // Remove duplicates and return
        return [...new Set(keyFiles)];
    }
    
    /**
     * Extract pattern information from analysis
     */
    private extractPatterns(analysis: RawProjectAnalysis): PatternInfo[] {
        const patterns: PatternInfo[] = [];
        
        // Add organization patterns if they exist
        if (analysis.structure?.organizationPatterns) {
            patterns.push(...analysis.structure.organizationPatterns.map(p => ({
                name: p.type,
                description: p.description,
                confidence: p.confidence
            })));
        }
        
        // Add architectural patterns if they exist
        if (analysis.architecture?.patterns) {
            patterns.push(...analysis.architecture.patterns.map(p => ({
                name: p,
                description: `Detected architectural pattern: ${p}`
            })));
        }
        
        return patterns;
    }
    
    /**
     * Extract dependency information for prompts
     */
    private extractDependencies(analysis: RawProjectAnalysis): DependencyInfo[] {
        const deps: DependencyInfo[] = [];
        
        // Runtime dependencies
        if (analysis.dependencies?.runtime) {
            Object.entries(analysis.dependencies.runtime).forEach(([name, version]) => {
                deps.push({ name, version, type: 'runtime' });
            });
        }
        
        // Development dependencies (top 5 most important)
        if (analysis.dependencies?.development) {
            Object.entries(analysis.dependencies.development)
                .slice(0, 5)
                .forEach(([name, version]) => {
                    deps.push({ name, version, type: 'development' });
                });
        }
        
        return deps;
    }
    
    /**
     * Format project structure for prompt inclusion
     */
    private formatStructureForPrompt(structure: any): string {
        if (!structure || !structure.directories) {
            return 'Structure analysis not available';
        }
        
        const topDirs = structure.directories
            .slice(0, 15) // Top 15 directories
            .map((d: string) => `- ${d}/`)
            .join('\\n');
            
        const sourceFilesSummary = `
- TypeScript files: ${structure.sourceFiles?.typescript?.length || 0}
- JavaScript files: ${structure.sourceFiles?.javascript?.length || 0}
- Other files: ${structure.sourceFiles?.other?.length || 0}`;
        
        return `**Directory Structure:**
${topDirs}

**Source Files Summary:**${sourceFilesSummary}`;
    }
    
    /**
     * Get language statistics for display
     */
    private getLanguageStats(analysis: RawProjectAnalysis): string {
        const stats: string[] = [];
        
        // Check if we have structure analysis
        if (!analysis.structure?.sourceFiles) {
            return 'No source files detected';
        }
        
        const sourceFiles = analysis.structure.sourceFiles;
        
        if (sourceFiles.typescript && sourceFiles.typescript.length > 0) {
            stats.push(`TypeScript (${sourceFiles.typescript.length} files)`);
        }
        if (sourceFiles.javascript && sourceFiles.javascript.length > 0) {
            stats.push(`JavaScript (${sourceFiles.javascript.length} files)`);
        }
        if (sourceFiles.python && sourceFiles.python.length > 0) {
            stats.push(`Python (${sourceFiles.python.length} files)`);
        }
        if (sourceFiles.other && sourceFiles.other.length > 0) {
            stats.push(`Other (${sourceFiles.other.length} files)`);
        }
        
        return stats.join(', ') || 'No source files detected';
    }
    
    /**
     * Estimate token usage for user awareness
     */
    private estimateTokenUsage(prompts: any): number {
        let totalChars = 0;
        Object.values(prompts).forEach((prompt: any) => {
            if (typeof prompt === 'string') {
                totalChars += prompt.length;
            }
        });
        
        // Rough estimation: 4 characters per token
        return Math.ceil(totalChars / 4);
    }
    
    /**
     * Generate user instructions for the manual workflow
     */
    private generateUserInstructions(): string {
        return `
## Instructions for AI Processing

1. **Copy each prompt below** to your AI assistant (one at a time works best)
2. **Let the AI generate comprehensive responses** for each prompt
3. **Gather all 6 responses** from your AI assistant
4. **Return here and call this tool again** with phase: 'process' and all AI responses

**Important:** Save the Analysis ID provided - you'll need it for Phase 2!

**Quality Tips:**
- Ask your AI to be specific to YOUR project (not generic software descriptions)
- Request concrete examples and file references from your actual codebase
- Encourage professional, enterprise-appropriate language
- If responses seem generic, ask for more project-specific details
        `.trim();
    }
    
    /**
     * Get the cache instance for external access
     */
    getCacheInstance(): ProjectAnalysisCache {
        return this.cache;
    }
}