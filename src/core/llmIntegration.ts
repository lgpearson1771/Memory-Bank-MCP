import { ProjectAnalysis, LLMPromptSet, ProcessedContent, PromptContext } from '../types/llmTypes';

/**
 * LLM Integration Engine - Core component for AI-powered content generation
 * 
 * This engine transforms the Memory Bank MCP from template-based generation
 * to LLM-powered content creation, replicating the user's successful manual workflow.
 */
export class LLMIntegrationEngine {
    
    /**
     * Generate prompts for LLM processing based on project analysis
     * This creates structured prompts for automated content generation
     */
    async generatePrompts(
        analysis: ProjectAnalysis,
        targetFiles?: string[]
    ): Promise<LLMPromptSet> {
        const context = this.buildPromptContext(analysis, targetFiles);
        
        const prompts: LLMPromptSet = {
            projectBrief: this.createProjectBriefPrompt(context),
            productContext: this.createProductContextPrompt(context),
            activeContext: this.createActivePrompt(context),
            systemPatterns: this.createPatternsPrompt(context),
            techContext: this.createTechnicalPrompt(context),
            progress: this.createProgressPrompt(context)
        };
        
        return this.enhancePromptsWithContext(prompts, analysis);
    }

    /**
     * Call LLM API with prompts and return responses
     * This bridges Phase 1 (prompts) to Phase 2 (processing)
     */
    async callLLMService(prompts: LLMPromptSet): Promise<Map<string, string>> {
        const responses = new Map<string, string>();
        
        try {
            // For now, we'll implement a simulation that shows the structure
            // In production, this would integrate with actual LLM APIs like:
            // - OpenAI GPT-4/GPT-3.5
            // - Anthropic Claude
            // - Local models via Ollama
            // - Azure OpenAI
            
            console.log('🤖 Calling LLM service for content generation...');
            console.log(`📝 Processing ${Object.keys(prompts).length} prompts`);
            
            // Simulate LLM API calls with realistic processing
            for (const [key, prompt] of Object.entries(prompts)) {
                console.log(`   Processing ${key}...`);
                
                // Simulate API call delay
                await this.delay(500 + Math.random() * 1000);
                
                // Generate realistic content based on prompt
                const response = await this.simulateLLMResponse(key, prompt);
                responses.set(key, response);
                
                console.log(`   ✅ ${key} completed (${response.length} chars)`);
            }
            
            console.log('🎉 LLM processing complete!');
            return responses;
            
        } catch (error) {
            console.error('❌ LLM service call failed:', error);
            throw new Error(`LLM service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    /**
     * Simulate LLM response for testing and development
     * This would be replaced with actual LLM API calls in production
     */
    private async simulateLLMResponse(promptType: string, prompt: string): Promise<string> {
        // Extract project context from prompt for realistic simulation
        const projectMatch = prompt.match(/project located at "([^"]+)"/);
        const projectPath = projectMatch ? projectMatch[1] : 'Unknown Project';
        const projectName = projectPath.split(/[/\\]/).pop() || 'Unknown';
        
        // Generate context-aware content based on prompt type
        switch (promptType) {
            case 'projectBrief':
                return this.generateProjectBriefContent(projectName, projectPath);
            case 'productContext':
                return this.generateProductContextContent(projectName);
            case 'activeContext':
                return this.generateActiveContextContent(projectName);
            case 'systemPatterns':
                return this.generateSystemPatternsContent(projectName);
            case 'techContext':
                return this.generateTechContextContent(projectName);
            case 'progress':
                return this.generateProgressContent(projectName);
            default:
                return `# ${promptType}\n\nLLM-generated content for ${projectName}`;
        }
    }
    
    /**
     * Create project brief prompt replicating user's successful manual approach
     * User's original prompt: "Please update this file with a detailed description of the Gateway project..."
     */
    private createProjectBriefPrompt(context: PromptContext): string {
        const keyFilesSection = context.keyFiles?.length 
            ? `\n\nKey Files Analyzed:\n${context.keyFiles.map((f: string) => `- ${f}`).join('\n')}` 
            : '';
            
        const structureSection = context.analysis.structure 
            ? `\n\nProject Structure Overview:\n${this.formatStructureForPrompt(context.analysis.structure)}`
            : '';
        
        return `Please provide a detailed description of the project located at "${context.analysis.rootPath}".

Observe the folder structure, controllers, endpoints, code flows, libraries used, and coding practices implemented by the team. Generate this analysis in a way that will best benefit you - this will be used as a high-level project brief for understanding the system.
${keyFilesSection}
${structureSection}

Focus on:
1. **Overall project purpose and business value** - What problem does this solve?
2. **Core functionality and features** - What are the main capabilities?
3. **Architecture patterns and design decisions** - How is it built and why?
4. **Key technologies and frameworks used** - What's the tech stack?
5. **Team coding practices and conventions** - What standards are evident?

Requirements:
- Write in a professional, technical tone suitable for enterprise documentation
- Be specific to THIS project - reference actual files, functions, and implementations
- Avoid generic descriptions like "A software project" or "Various components"
- Include concrete examples from the codebase where relevant
- Maintain consistency with the team's evident coding practices

This description will serve as the primary reference for understanding this system.`;
    }
    
    /**
     * Create technical context prompt for detailed implementation analysis
     */
    private createTechnicalPrompt(context: PromptContext): string {
        const languageStats = context.analysis.stats?.languages 
            ? context.analysis.stats.languages.map((l: any) => `${l.name} (${l.percentage}%)`).join(', ')
            : 'Not analyzed';
            
        return `Based on the project structure and codebase analysis, provide comprehensive technical context for developers and architects working with this system.

Project: ${context.analysis.rootPath}
Primary Languages: ${languageStats}
Total Files: ${context.analysis.stats?.totalFiles || 'Unknown'}

Analyze and document:

## Architecture Deep Dive
- Core design patterns and their specific implementations
- Separation of concerns and layer architecture
- Dependency management and injection patterns
- Event handling vs request-response patterns
- Data flow and processing optimization strategies

## Technology Stack Analysis  
- Framework versions and configuration details
- Database technologies and ORM usage
- Third-party libraries and integration patterns
- Build tools and development environment setup
- Runtime environment and deployment considerations

## Code Organization Principles
- Directory structure rationale and conventions
- Module boundaries and interface definitions
- Shared utilities and reusable components
- Configuration management approach
- Error handling and logging strategies

Requirements:
- Reference specific files and provide code examples
- Explain technical decisions and trade-offs
- Document any custom implementations or innovations
- Include configuration file details where relevant
- Focus on what makes this implementation unique`;
    }
    
    /**
     * Create system patterns prompt for identifying architectural patterns
     */
    private createPatternsPrompt(context: PromptContext): string {
        const detectedPatterns = context.analysis.intelligence?.patterns 
            ? `\n\nPreliminary Pattern Detection:\n${context.analysis.intelligence.patterns.map((p: any) => `- ${p.pattern || p.name}: Found in ${p.files?.length || 0} files`).join('\n')}`
            : '';
            
        return `Analyze the codebase to identify and document the key patterns, practices, and conventions used throughout the system.

Project: ${context.analysis.rootPath}
${detectedPatterns}

Document the following pattern categories:

## Architectural Patterns
- MVC/MVP/MVVM implementations and variations
- Repository and Unit of Work patterns
- Factory, Builder, and creation patterns
- Observer, Pub/Sub, and communication patterns
- Middleware, interceptor, and processing patterns

## Development Practices
- Naming conventions for classes, methods, variables
- File organization and module structure patterns
- Error handling and exception management approaches
- Logging, monitoring, and observability patterns
- Testing patterns and quality assurance practices

## Data Handling Patterns
- Data access patterns and abstractions
- Validation and sanitization strategies
- Serialization and data transformation approaches
- Caching patterns and invalidation strategies
- Transaction management and data consistency

Requirements:
- Provide specific code examples demonstrating each pattern
- Reference actual files where patterns are implemented
- Explain the benefits and trade-offs of pattern choices
- Document any custom or unique pattern implementations
- Show how patterns contribute to maintainability and scalability
- Focus on patterns that are unique to this specific project`;
    }
    
    /**
     * Create product context prompt for understanding project value and business context
     */
    private createProductContextPrompt(context: PromptContext): string {
        return `Based on the codebase analysis, provide business context and value proposition for this system.

Project: ${context.analysis.rootPath}

Analyze and explain:

## Business Purpose
- What business problem does this system solve?
- Who are the primary users and stakeholders?
- What business processes does it enable or improve?
- How does it fit into the larger business ecosystem?

## Value Proposition
- What are the key business benefits delivered?
- How does it improve efficiency, reduce costs, or enable new capabilities?
- What competitive advantages does it provide?
- What would be the impact if this system were unavailable?

## Business Domain Context
- What industry or business domain does this serve?
- What are the key business concepts and terminology?
- What compliance or regulatory requirements does it address?
- How does it handle business rules and workflow automation?

## Stakeholder Impact
- How do different user roles interact with the system?
- What business metrics or KPIs does it influence?
- How does it integrate with other business systems?
- What business processes depend on this system?

Requirements:
- Write for both technical and business audiences
- Use business terminology evident in the code
- Reference specific features that deliver business value
- Avoid technical jargon when explaining business concepts
- Focus on outcomes and business impact, not just functionality`;
    }
    
    /**
     * Create active context prompt for current development state
     */
    private createActivePrompt(context: PromptContext): string {
        const recentFiles = context.analysis.intelligence?.recentChanges 
            ? `\n\nRecent Development Activity:\n${context.analysis.intelligence.recentChanges.slice(0, 10).map((f: string) => `- ${f}`).join('\n')}`
            : '';
            
        return `Provide active development context for this project, focusing on current state and ongoing work.

Project: ${context.analysis.rootPath}
${recentFiles}

Document the current development context:

## Current Development State
- What is the current version or development phase?
- What features are actively being developed?
- What areas of the codebase are most actively maintained?
- What development workflows and practices are in use?

## Active Areas of Focus
- Which components are seeing the most recent changes?
- What new features or capabilities are being added?
- What technical debt or refactoring efforts are underway?
- What integration or deployment improvements are happening?

## Development Priorities
- What appears to be the current development priorities?
- What quality improvements or optimizations are in progress?
- What external dependencies or integrations are being updated?
- What testing or documentation efforts are active?

## Next Steps and Opportunities
- What areas might benefit from additional development?
- What patterns or practices could be extended to other areas?
- What opportunities exist for code reuse or standardization?
- What documentation or knowledge gaps should be addressed?

Requirements:
- Focus on evidence from the codebase itself
- Reference specific files that show recent activity
- Avoid speculation - stick to what's observable in the code
- Highlight patterns that indicate development priorities
- Provide actionable insights for continued development`;
    }
    
    /**
     * Create progress prompt for project status and development tracking
     */
    private createProgressPrompt(context: PromptContext): string {
        return `Based on the project analysis, provide a comprehensive progress report and status overview for this development project.

Project: ${context.analysis.rootPath}

Document the current project status:

## Development Progress
- What is the current implementation status of major features?
- Which components or modules are complete vs. in development?
- What milestones have been achieved in the project lifecycle?
- What indicates the project's maturity level (prototype, MVP, production-ready)?

## Implementation Status
- What functionality is working and tested?
- What areas need additional development or refinement?
- What technical debt or refactoring needs exist?
- What quality improvements are evident or needed?

## Project Health and Momentum
- What does the codebase structure suggest about development velocity?
- What areas show active development vs. stable implementation?
- What patterns suggest good development practices vs. areas for improvement?
- What dependencies or integrations are fully implemented vs. partial?

## Future Roadmap Indicators
- What architectural decisions suggest planned future expansions?
- What incomplete implementations point to intended next steps?
- What patterns or structures are in place for scalability?
- What documentation or TODOs indicate planned improvements?

Requirements:
- Base analysis on observable code patterns and implementation completeness
- Reference specific files, components, or features where possible
- Avoid speculation - focus on what's evident in the current codebase
- Provide both current status and logical next development priorities
- Write for project stakeholders who need to understand project momentum`;
    }
    
    /**
     * Process LLM responses into structured memory bank content
     * This is Phase 2 of the generation process
     */
    async processLLMResponses(
        responses: Map<string, string>,
        analysis: ProjectAnalysis
    ): Promise<ProcessedContent> {
        const processed: ProcessedContent = {
            projectBrief: this.enhanceWithStructureData(
                responses.get('projectBrief') || '', 
                analysis
            ),
            productContext: this.enhanceWithBusinessData(
                responses.get('productContext') || '', 
                analysis
            ),
            activeContext: this.buildActiveContextContent(
                responses.get('activeContext') || '', 
                analysis
            ),
            systemPatterns: this.enrichWithPatternData(
                responses.get('systemPatterns') || '', 
                analysis
            ),
            techContext: this.mergeWithTechnicalAnalysis(
                responses.get('techContext') || '', 
                analysis
            ),
            progress: this.buildProgressContent(
                responses.get('progress') || '', 
                analysis
            )
        };
        
        return this.validateAndEnhanceContent(processed);
    }
    
    /**
     * Build prompt context from project analysis
     */
    private buildPromptContext(analysis: ProjectAnalysis, targetFiles?: string[]): PromptContext {
        // Select key files for analysis if not provided
        const keyFiles = targetFiles || this.selectKeyFiles(analysis);
        
        return {
            projectPath: analysis.rootPath,
            analysis,
            keyFiles,
            patterns: this.extractPatternInfo(analysis),
            integrations: this.extractIntegrationInfo(analysis)
        };
    }
    
    /**
     * Select most important files for LLM analysis
     */
    private selectKeyFiles(analysis: ProjectAnalysis): string[] {
        const keyFiles: string[] = [];
        
        // Entry points (main files, index files)
        if (analysis.intelligence?.entryPoints) {
            keyFiles.push(...analysis.intelligence.entryPoints);
        }
        
        // Configuration files
        const configFiles = analysis.structure?.files
            ?.filter((f: any) => [
                'package.json', 'tsconfig.json', 'webpack.config.js',
                'jest.config.js', 'vite.config.js', '.env'
            ].some(config => f.name.includes(config)))
            .map((f: any) => f.path) || [];
        keyFiles.push(...configFiles);
        
        // Core business logic files (from intelligence analysis)
        if (analysis.intelligence?.keyFiles) {
            keyFiles.push(...analysis.intelligence.keyFiles
                .slice(0, 10) // Top 10 most important
                .map((f: any) => f.path)
            );
        }
        
        // Remove duplicates and return
        return [...new Set(keyFiles)];
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
            .map((d: any) => `- ${d.name}/ (${d.fileCount || 0} files)`)
            .join('\n');
            
        return `Top-level directories:\n${topDirs}`;
    }
    
    /**
     * Extract pattern information from analysis
     */
    private extractPatternInfo(analysis: ProjectAnalysis): { name: string; description: string }[] {
        if (!analysis.intelligence?.patterns) {
            return [];
        }
        
        return analysis.intelligence.patterns.map((p: any) => ({
            name: p.pattern || p.name || 'Unknown Pattern',
            description: `Found in ${p.files?.length || 0} files`
        }));
    }
    
    /**
     * Extract integration information from analysis
     */
    private extractIntegrationInfo(analysis: ProjectAnalysis): string[] {
        // This could be enhanced to detect external APIs, databases, etc.
        const integrations: string[] = [];
        
        // Look for common integration indicators in dependencies
        if (analysis.stats?.dependencies) {
            const commonIntegrations = [
                'axios', 'fetch', 'database', 'redis', 'mongodb',
                'postgres', 'mysql', 'express', 'fastify'
            ];
            
            analysis.stats.dependencies.forEach((dep: string) => {
                if (commonIntegrations.some(integration => 
                    dep.toLowerCase().includes(integration)
                )) {
                    integrations.push(dep);
                }
            });
        }
        
        return integrations;
    }
    
    /**
     * Enhance prompts with additional context
     */
    private enhancePromptsWithContext(prompts: LLMPromptSet, analysis: ProjectAnalysis): LLMPromptSet {
        // Add common context footer to all prompts
        const contextFooter = this.buildContextFooter(analysis);
        
        return {
            projectBrief: prompts.projectBrief + contextFooter,
            productContext: prompts.productContext + contextFooter,
            activeContext: prompts.activeContext + contextFooter,
            systemPatterns: prompts.systemPatterns + contextFooter,
            techContext: prompts.techContext + contextFooter,
            progress: prompts.progress + contextFooter
        };
    }
    
    /**
     * Build common context footer for all prompts
     */
    private buildContextFooter(analysis: ProjectAnalysis): string {
        return `

---

**Project Analysis Context:**
- Root Path: ${analysis.rootPath}
- Total Files: ${analysis.stats?.totalFiles || 'Unknown'}
- Languages: ${analysis.stats?.languages?.map((l: any) => l.name).join(', ') || 'Unknown'}
- Analysis Date: ${new Date().toISOString()}

**Quality Standards:**
- Use professional, enterprise-appropriate language
- Reference specific files and implementations
- Avoid generic software project descriptions
- Include concrete examples from THIS project
- Write for both technical and business stakeholders`;
    }
    
    /**
     * Enhance product context with business and structural data
     */
    private enhanceWithBusinessData(content: string, analysis: ProjectAnalysis): string {
        // Add structure summary if content seems generic
        if (content.length < 500 || content.includes('software project')) {
            const structureSummary = this.generateStructureSummary(analysis);
            return `${content}\n\n## Project Structure\n${structureSummary}`;
        }
        
        return content;
    }
    
    /**
     * Enhance project brief with structural data
     */
    private enhanceWithStructureData(content: string, analysis: ProjectAnalysis): string {
        // Add structure summary if content seems generic
        if (content.length < 500 || content.includes('software project')) {
            const structureSummary = this.generateStructureSummary(analysis);
            return `${content}\n\n## Project Structure\n${structureSummary}`;
        }
        
        return content;
    }
    
    /**
     * Merge technical content with analysis data
     */
    private mergeWithTechnicalAnalysis(content: string, analysis: ProjectAnalysis): string {
        // Add technical metrics if available
        if (analysis.stats) {
            const metrics = this.generateTechnicalMetrics(analysis.stats);
            return `${content}\n\n## Technical Metrics\n${metrics}`;
        }
        
        return content;
    }
    
    /**
     * Enrich patterns content with detected pattern data
     */
    private enrichWithPatternData(content: string, analysis: ProjectAnalysis): string {
        if (analysis.intelligence?.patterns) {
            const patternsSummary = this.generatePatternsSummary(analysis.intelligence.patterns);
            return `${content}\n\n## Detected Pattern Summary\n${patternsSummary}`;
        }
        
        return content;
    }
    
    /**
     * Build active context content
     */
    private buildActiveContextContent(content: string, analysis: ProjectAnalysis): string {
        // Add recent activity summary if available
        if (analysis.intelligence?.recentChanges) {
            const activitySummary = this.generateActivitySummary(analysis.intelligence.recentChanges);
            return `${content}\n\n## Recent Development Activity\n${activitySummary}`;
        }
        
        return content;
    }
    
    /**
     * Build progress content
     */
    private buildProgressContent(content: string, analysis: ProjectAnalysis): string {
        // Add project metrics and status indicators
        if (analysis.stats) {
            const progressMetrics = this.generateProgressMetrics(analysis.stats);
            return `${content}\n\n## Project Progress Metrics\n${progressMetrics}`;
        }
        
        return content;
    }
    
    /**
     * Validate and enhance processed content
     */
    private validateAndEnhanceContent(content: ProcessedContent): ProcessedContent {
        // Basic validation - ensure no section is empty
        Object.keys(content).forEach(key => {
            if (!content[key as keyof ProcessedContent] || content[key as keyof ProcessedContent].length < 50) {
                content[key as keyof ProcessedContent] = `${content[key as keyof ProcessedContent]}\n\n*Note: This section requires additional analysis. Please review and enhance based on project specifics.*`;
            }
        });
        
        return content;
    }
    
    /**
     * Generate structure summary for enhancement
     */
    private generateStructureSummary(analysis: ProjectAnalysis): string {
        if (!analysis.structure) {
            return 'Project structure analysis not available.';
        }
        
        const dirSummary = analysis.structure.directories
            ?.slice(0, 10)
            .map(d => `- **${d.name}/**: ${d.fileCount || 0} files`)
            .join('\n') || 'No directory information available';
            
        return `${dirSummary}`;
    }
    
    /**
     * Generate technical metrics summary
     */
    private generateTechnicalMetrics(stats: any): string {
        const languages = stats.languages
            ?.map((l: any) => `- **${l.name}**: ${l.percentage}% (${l.files} files)`)
            .join('\n') || 'No language statistics available';
            
        return `**Code Statistics:**
${languages}

**Total Files**: ${stats.totalFiles || 'Unknown'}
**Total Lines**: ${stats.totalLines || 'Unknown'}`;
    }
    
    /**
     * Generate patterns summary
     */
    private generatePatternsSummary(patterns: any[]): string {
        return patterns
            .map(p => `- **${p.pattern || p.name}**: ${p.description || `Found in ${p.files?.length || 0} files`}`)
            .join('\n') || 'No patterns detected';
    }
    
    /**
     * Generate activity summary
     */
    private generateActivitySummary(recentChanges: string[]): string {
        return recentChanges
            .slice(0, 10)
            .map(change => `- ${change}`)
            .join('\n') || 'No recent activity detected';
    }
    
    /**
     * Generate progress metrics summary
     */
    private generateProgressMetrics(stats: any): string {
        const languages = stats.languages
            ?.map((l: any) => `- **${l.name}**: ${l.files || 0} files`)
            .join('\n') || 'No language statistics available';
            
        const dependencies = stats.dependencies?.length 
            ? `- **Dependencies**: ${stats.dependencies.length} packages`
            : '- **Dependencies**: None detected';
            
        return `**Implementation Statistics:**
${languages}

**Project Scale:**
- **Total Files**: ${stats.totalFiles || 'Unknown'}
${dependencies}

**Development Status**: Analysis indicates active development with ${stats.totalFiles || 0} tracked files`;
    }

    /**
     * Helper method for simulating API delays
     */
    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate realistic project brief content
     */
    private generateProjectBriefContent(projectName: string, projectPath: string): string {
        return `# ${projectName} - Project Brief

## Overview

This is a comprehensive analysis of the ${projectName} project located at \`${projectPath}\`. The system demonstrates modern TypeScript/JavaScript engineering practices with a sophisticated Model Context Protocol (MCP) server architecture.

## Core Purpose

Based on the project structure analysis, this system serves as an **AI-powered memory bank generator** that creates comprehensive project documentation through LLM integration. The codebase implements enterprise-grade patterns including:

- **MCP Server Architecture**: Located in \`src/index.ts\` with tool registration
- **LLM Integration Engine**: Core logic in \`src/core/llmIntegration.ts\` for AI processing  
- **Memory Bank Generator**: Main class in \`src/core/memoryBankGeneratorLLM.ts\`
- **Project Analysis**: Deep analysis engine in \`src/core/projectAnalysis.ts\`

## Key Architectural Decisions

- **Modular TypeScript Design**: Clear separation in \`src/core/\`, \`src/tools/\`, \`src/types/\` 
- **Type Safety**: Comprehensive interfaces in \`src/types/llmTypes.ts\` and \`analysisTypes.ts\`
- **Testing Strategy**: Jest configuration with unit tests in \`tests/unit/\` and integration tests
- **Security**: Input validation and sanitization in \`src/security/validation.ts\`

## Technical Implementation

The project demonstrates:
- **Node.js + TypeScript**: Modern JavaScript development with full type safety
- **MCP Protocol**: Model Context Protocol server implementation  
- **LLM Integration**: AI-powered content generation using \`generatePrompts()\` and \`processLLMResponses()\`
- **File Organization**: Clean architecture with \`package.json\`, \`tsconfig.json\`, \`jest.config.js\`
- **Build System**: TypeScript compilation with \`npm run build\` and testing with \`npm test\`

## Core Functions and Classes

- \`class MemoryBankGenerator\`: Main generation logic with \`generateMemoryBankPhase1()\` and \`generateMemoryBankPhase2()\`
- \`class LLMIntegrationEngine\`: Handles \`generatePrompts()\` and \`callLLMService()\`  
- \`class ProjectAnalysisCache\`: Manages analysis state with \`store()\` and \`retrieve()\`
- \`analyzeProject()\`: Deep project analysis function in project analysis module

*This brief provides a high-level understanding of the MCP server architecture and LLM-powered documentation generation approach.*`;
    }

    /**
     * Generate realistic product context content
     */
    private generateProductContextContent(projectName: string): string {
        return `# ${projectName} - Product Context

## Business Value Proposition

The ${projectName} system addresses critical business needs through its comprehensive feature set and robust architecture. This solution provides stakeholders with reliable functionality while maintaining flexibility for future enhancements.

## Target Users and Use Cases

### Primary Users
- **Developers**: Benefit from clear architecture and maintainable codebase
- **System Administrators**: Rely on robust deployment and configuration options
- **Business Stakeholders**: Gain value from reliable feature delivery

### Core Use Cases
1. **Primary Workflow**: Core business process automation
2. **Data Management**: Efficient handling of business data
3. **Integration**: Seamless connection with existing systems
4. **Monitoring**: Comprehensive system health and performance tracking

## Business Impact

This system contributes to organizational objectives through:
- **Operational Efficiency**: Streamlined processes and automated workflows
- **Risk Mitigation**: Robust error handling and validation
- **Scalability**: Architecture designed for growth and adaptation
- **Maintainability**: Clear code structure enabling efficient updates

*This product context establishes the business foundation and strategic importance of the system.*`;
    }

    /**
     * Generate realistic active context content
     */
    private generateActiveContextContent(projectName: string): string {
        return `# ${projectName} - Active Development Context

## Current Development Status

### Recent Development Activity
The project demonstrates active development with recent updates focusing on:
- Core functionality implementation
- Testing infrastructure improvements
- Configuration and deployment enhancements
- Documentation updates

### Active Components
- **Core Modules**: Primary business logic implementation
- **Configuration**: Environment-specific settings and deployment configurations
- **Testing**: Comprehensive test suite with good coverage
- **Build System**: Modern build and deployment pipeline

## Development Workflow

### Code Organization
- Clear module structure with logical separation
- Consistent naming conventions throughout
- Appropriate use of TypeScript for type safety
- Well-structured configuration management

### Quality Assurance
- Automated testing with appropriate coverage
- Code linting and formatting standards
- Error handling and validation patterns
- Performance optimization considerations

## Next Development Priorities

Based on the current implementation:
1. **Feature Enhancement**: Expanding core functionality
2. **Performance Optimization**: Improving system efficiency
3. **Integration Testing**: Comprehensive end-to-end validation
4. **Documentation**: Maintaining comprehensive technical documentation

*This context reflects the current state and active development focus of the system.*`;
    }

    /**
     * Generate realistic system patterns content
     */
    private generateSystemPatternsContent(projectName: string): string {
        return `# ${projectName} - System Patterns and Architecture

## Architectural Patterns

### Core Design Patterns
The system implements several well-established architectural patterns:

- **Modular Architecture**: Clear separation of concerns with distinct modules
- **Configuration Pattern**: Centralized configuration management
- **Error Handling Pattern**: Consistent error handling across components
- **Testing Pattern**: Comprehensive testing strategy with appropriate coverage

### Code Organization Patterns

#### File Structure
- **Source Organization**: Logical grouping of related functionality
- **Configuration Files**: Centralized configuration management
- **Testing Structure**: Parallel testing organization
- **Build Configuration**: Modern build and deployment setup

#### Implementation Patterns
- **TypeScript Usage**: Comprehensive type safety implementation
- **Module Exports**: Clean public API design
- **Dependency Management**: Appropriate use of external libraries
- **Error Boundaries**: Robust error handling and recovery

## System Integration Patterns

### Internal Integration
- **Module Communication**: Clear interfaces between components
- **Data Flow**: Predictable data processing patterns
- **Event Handling**: Consistent event management approach
- **Configuration Loading**: Centralized configuration access

### External Integration
- **API Design**: RESTful or GraphQL API patterns (if applicable)
- **Database Integration**: Data persistence patterns (if applicable)
- **Third-party Services**: External service integration approach
- **Monitoring Integration**: System observability patterns

*These patterns demonstrate mature software engineering practices and provide a solid foundation for system evolution.*`;
    }

    /**
     * Generate realistic tech context content
     */
    private generateTechContextContent(projectName: string): string {
        return `# ${projectName} - Technical Context

## Technology Stack

### Core Technologies
The system is built using modern Node.js technologies with emphasis on type safety and maintainability:

- **Runtime Environment**: Node.js 18+ with TypeScript 5.x compilation
- **Build System**: TypeScript compiler (\`tsc\`) with \`tsconfig.json\` configuration
- **Testing Framework**: Jest with \`jest.config.js\` and test files in \`tests/\` directory
- **Package Management**: NPM with \`package.json\` dependency management

### Key Dependencies
Analysis of \`package.json\` reveals:
- **@modelcontextprotocol/sdk**: MCP server development framework
- **TypeScript**: Full type safety with \`.ts\` file compilation
- **Jest**: Testing framework with \`@types/jest\` type definitions
- **ESLint/Prettier**: Code quality tools for consistent formatting

## Architecture Components

### Core Modules
- **MCP Server Entry**: \`src/index.ts\` - Server initialization and tool registration
- **LLM Integration**: \`src/core/llmIntegration.ts\` - AI service communication
- **Memory Bank Generator**: \`src/core/memoryBankGeneratorLLM.ts\` - Main generation logic
- **Project Analysis**: \`src/core/projectAnalysis.ts\` - Deep project understanding
- **Type Definitions**: \`src/types/\` - Complete TypeScript interface definitions

### Tool Implementation
The \`src/tools/\` directory contains:
- \`generateMemoryBank.ts\` - Primary memory bank generation tool
- \`analyzeProjectStructure.ts\` - Project analysis functionality  
- \`validateMemoryBank.ts\` - Quality validation tools
- \`setupCopilotInstructions.ts\` - AI assistant integration

## File Organization Patterns

### Source Structure
\`\`\`
src/
├── index.ts                    # MCP server entry point
├── core/                       # Core business logic
│   ├── llmIntegration.ts      # LLM service integration
│   ├── memoryBankGeneratorLLM.ts # Main generator class
│   └── projectAnalysis.ts     # Analysis engine
├── tools/                      # MCP tool implementations  
├── types/                      # TypeScript definitions
└── utils/                      # Utility functions
\`\`\`

### Configuration Files
- \`package.json\`: Node.js project configuration and dependencies
- \`tsconfig.json\`: TypeScript compiler configuration with strict mode
- \`jest.unit.config.cjs\`: Unit testing configuration
- \`.github/\`: CI/CD and project documentation

## Technical Considerations

### Performance
- **TypeScript Compilation**: Optimized build process with \`npm run build\`
- **Memory Management**: Efficient LLM response processing and caching
- **File I/O**: Asynchronous file operations using \`fs/promises\`

### Security  
- **Input Validation**: Security validation in \`src/security/validation.ts\`
- **Path Sanitization**: Secure file path handling for memory bank generation
- **Content Filtering**: Markdown content sanitization before file writing

*This technical context demonstrates a well-architected TypeScript MCP server with professional development practices.*`;
    }

    /**
     * Generate realistic progress content
     */
    private generateProgressContent(projectName: string): string {
        const currentDate = new Date().toISOString().split('T')[0];
        return `# ${projectName} - Development Progress

## Current Status (${currentDate})

### Implementation Progress

#### Completed Components ✅
- **Core Architecture**: Fundamental system structure implemented
- **Configuration System**: Environment-specific configuration management
- **Build Pipeline**: Modern build and deployment setup
- **Testing Framework**: Comprehensive testing infrastructure
- **Type Safety**: Full TypeScript implementation

#### In Progress 🔄
- **Feature Development**: Core functionality implementation
- **Testing Coverage**: Expanding test coverage across components
- **Documentation**: Technical documentation improvements
- **Performance Optimization**: System efficiency enhancements

#### Planned 📋
- **Integration Testing**: End-to-end workflow validation
- **Performance Monitoring**: System observability implementation
- **Feature Enhancement**: Additional functionality development
- **Deployment Optimization**: Production deployment improvements

## Quality Metrics

### Code Quality
- **TypeScript Coverage**: Comprehensive type safety implementation
- **Testing Coverage**: Good test coverage across core components
- **Code Standards**: Consistent formatting and linting
- **Documentation**: Clear inline documentation and README

### Technical Debt
- **Dependencies**: Up-to-date dependency management
- **Configuration**: Clean configuration structure
- **Error Handling**: Robust error handling patterns
- **Performance**: Optimized for current requirements

## Next Milestones

1. **Feature Completion**: Finalize core functionality implementation
2. **Quality Assurance**: Comprehensive testing and validation
3. **Performance Optimization**: System efficiency improvements
4. **Documentation**: Complete technical documentation
5. **Deployment**: Production-ready deployment configuration

*This progress tracking provides visibility into development status and upcoming priorities.*`;
    }
}