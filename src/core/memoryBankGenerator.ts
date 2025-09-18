import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectAnalysis } from './projectAnalysis.js';
import { securityValidator } from '../security/validation.js';

/**
 * Memory Bank Generator Module
 * Handles memory bank file generation and content creation
 */

export interface MemoryBankOptions {
  structureType: 'standard' | 'custom';
  focusAreas: string[];
  detailLevel: 'high-level' | 'detailed' | 'granular';
  additionalFiles: string[];
  semanticOrganization?: boolean;          // Enable semantic folder organization
  customFolders?: CustomFolderConfig[];    // User-defined semantic folders
  generateOnlyRequested?: boolean;         // Only generate files explicitly requested by user
  syncValidation?: boolean;                // Enable sync validation with Copilot instructions
  interactiveMode?: boolean;               // Enable conversational conflict resolution
}

export interface CustomFolderConfig {
  name: string;                           // Folder name (e.g., "api", "security")
  description: string;                    // Purpose of the folder
  filePatterns: string[];                 // Files that should go in this folder
}

/**
 * Generate memory bank files with core and optional additional files
 */
export async function generateMemoryBankFiles(
  memoryBankDir: string,
  analysis: ProjectAnalysis,
  options: MemoryBankOptions
): Promise<string[]> {
  const createdFiles: string[] = [];
  
  // Core files that are always created at root level
  const coreFiles = [
    'projectbrief.md',
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md',
  ];
  
  // Generate core files
  for (const file of coreFiles) {
    const content = await generateFileContent(file, analysis, options);
    const filePath = path.join(memoryBankDir, file);
    await fs.writeFile(filePath, content, 'utf8');
    createdFiles.push(file);
  }
  
  // Only generate additional files if explicitly requested
  if (options.additionalFiles && options.additionalFiles.length > 0) {
    // Semantic folder organization (if enabled)
    if (options.semanticOrganization !== false) {
      const { organizeAdditionalFilesSemanticaly } = await import('../core/semanticOrganization.js');
      const semanticFiles = await organizeAdditionalFilesSemanticaly(
        memoryBankDir,
        options.additionalFiles,
        analysis,
        options
      );
      createdFiles.push(...semanticFiles);
    } else {
      // Traditional flat structure for additional files
      for (const additionalFile of options.additionalFiles) {
        const fileName = additionalFile.endsWith('.md') ? additionalFile : `${additionalFile}.md`;
        const content = await generateAdditionalFileContent(fileName, analysis, options);
        const filePath = path.join(memoryBankDir, fileName);
        await fs.writeFile(filePath, content, 'utf8');
        createdFiles.push(fileName);
      }
    }
  }
  
  return createdFiles;
}

/**
 * Generate content for core memory bank files
 */
export async function generateFileContent(
  fileName: string,
  analysis: ProjectAnalysis,
  options: MemoryBankOptions
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  // Sanitize the analysis data before using it in content generation
  const sanitizedAnalysis = {
    ...analysis,
    projectName: securityValidator.escapeHtml(analysis.projectName),
    description: securityValidator.filterDangerousCommands(
      securityValidator.sanitizeMarkdown(analysis.description)
    )
  };
  
  switch (fileName) {
    case 'projectbrief.md':
      return `# Project Brief

## Project Overview
**${sanitizedAnalysis.projectName}** (v${analysis.version})
${sanitizedAnalysis.description}

**Project Type:** ${analysis.projectType}
**Complexity:** ${analysis.structure.complexity}
**Total Files:** ${analysis.structure.estimatedFiles}

## Technology Stack
${analysis.frameworks.length > 0 ? 
  `### Frameworks & Libraries\n${analysis.frameworks.map(fw => `- ${fw}`).join('\n')}\n` : 
  '### Core Technologies\n'}
${analysis.structure.keyPatterns.map(pattern => `- ${pattern}`).join('\n')}

## Project Structure
- **Source Files:** ${Object.values(analysis.structure.sourceFiles).flat().length} files
  - TypeScript: ${analysis.structure.sourceFiles.typescript.length}
  - JavaScript: ${analysis.structure.sourceFiles.javascript.length}
  - Python: ${analysis.structure.sourceFiles.python.length}
  - Other: ${analysis.structure.sourceFiles.other.length}

## Entry Points
${analysis.architecture.entryPoints.length > 0 ? 
  analysis.architecture.entryPoints.map(entry => `- \`${entry}\``).join('\n') : 
  '- No specific entry points detected'}

## Focus Areas
${options.focusAreas.map(area => `- ${area}`).join('\n')}

Generated: ${timestamp}
`;

    case 'productContext.md':
      const hasScripts = Object.keys(analysis.dependencies.scripts).length > 0;
      return `# Product Context

## Purpose
${sanitizedAnalysis.description || 'This project serves specific business and technical requirements.'}

## Project Details
- **Name:** ${sanitizedAnalysis.projectName}
- **Version:** ${analysis.version}
- **Type:** ${analysis.projectType}

## Architecture Patterns
${analysis.architecture.patterns.length > 0 ? 
  analysis.architecture.patterns.map(pattern => `- ${pattern}`).join('\n') : 
  '- Standard project organization'}

## Development Workflow
${hasScripts ? 
  `### Available Scripts\n${Object.entries(analysis.dependencies.scripts).map(([name, cmd]) => `- \`npm run ${name}\`: ${cmd}`).join('\n')}` :
  '### Development\nStandard development practices apply.'}

## Runtime Dependencies
${Object.keys(analysis.dependencies.runtime).length > 0 ? 
  Object.entries(analysis.dependencies.runtime).slice(0, 10).map(([name, version]) => `- ${name}@${version}`).join('\n') :
  'No external runtime dependencies detected.'}

## Configuration
${analysis.architecture.configFiles.length > 0 ? 
  `Configuration managed through:\n${analysis.architecture.configFiles.map(file => `- \`${file}\``).join('\n')}` :
  'Standard configuration practices.'}

Generated: ${timestamp}
`;

    case 'activeContext.md':
      return `# Active Context

## Current Project State
Working on **${analysis.projectName}** - ${analysis.projectType} with ${analysis.structure.complexity.toLowerCase()} complexity.

## Project Structure Overview
- **Total Files:** ${analysis.structure.estimatedFiles}
- **Main Directories:** ${analysis.structure.directories.slice(0, 5).join(', ')}
- **Key Technologies:** ${analysis.structure.keyPatterns.join(', ')}

## Active Development Areas
${analysis.frameworks.length > 0 ? 
  `### Framework Integration\n${analysis.frameworks.map(fw => `- ${fw} configuration and usage`).join('\n')}\n` : ''}

### Source Organization
${Object.entries(analysis.structure.sourceFiles)
  .filter(([_, files]) => files.length > 0)
  .map(([type, files]) => `- **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${files.length} files`)
  .join('\n')}

## Next Steps
1. **Code Review:** Focus on ${analysis.structure.sourceFiles.typescript.length > 0 ? 'TypeScript' : 'JavaScript'} implementation
2. **Dependencies:** Monitor ${Object.keys(analysis.dependencies.runtime).length} runtime dependencies
3. **Architecture:** Leverage identified patterns: ${analysis.architecture.patterns.join(', ')}

## Recent Insights
- Project uses ${analysis.frameworks.length} framework(s)
- Configuration spread across ${analysis.architecture.configFiles.length} files
- Entry points: ${analysis.architecture.entryPoints.join(', ') || 'Standard'}

Last updated: ${timestamp}
`;

    case 'systemPatterns.md':
      return `# System Patterns

## Architecture Overview
**${analysis.projectName}** follows ${analysis.architecture.patterns.join(', ') || 'standard'} architectural patterns.

**Complexity Level:** ${analysis.structure.complexity}
**Project Type:** ${analysis.projectType}

## Technology Integration
### Frameworks & Tools
${analysis.frameworks.length > 0 ? 
  analysis.frameworks.map(fw => `- **${fw}**: Integrated for enhanced functionality`).join('\n') :
  'No major frameworks detected - likely using vanilla technologies'}

### Key Patterns Detected
${analysis.structure.keyPatterns.map(pattern => `- **${pattern}**: Core technology component`).join('\n')}

## File Organization
### Source Code Structure
${Object.entries(analysis.structure.sourceFiles)
  .filter(([_, files]) => files.length > 0)
  .map(([type, files]) => {
    const sampleFiles = files.slice(0, 3);
    return `**${type.charAt(0).toUpperCase() + type.slice(1)} Files (${files.length}):**\n${sampleFiles.map(file => `  - \`${file}\``).join('\n')}${files.length > 3 ? `\n  - ... and ${files.length - 3} more` : ''}`;
  }).join('\n\n')}

## Entry Points & Flow
${analysis.architecture.entryPoints.length > 0 ? 
  `Main application entry points:\n${analysis.architecture.entryPoints.map(entry => `- \`${entry}\``).join('\n')}` :
  'Entry points follow standard conventions for the project type.'}

## Configuration Management
${analysis.architecture.configFiles.length > 0 ? 
  `Configuration handled through:\n${analysis.architecture.configFiles.map(file => `- \`${file}\``).join('\n')}` :
  'Standard configuration practices apply.'}

Generated: ${timestamp}
`;

    case 'techContext.md':
      return `# Technical Context

## Technology Stack
### Primary Technologies
${analysis.structure.keyPatterns.map(tech => `- **${tech}**: Core technology component`).join('\n')}

### Frameworks & Libraries
${analysis.frameworks.length > 0 ? 
  analysis.frameworks.map(fw => `- **${fw}**: Framework integration`).join('\n') :
  'No major frameworks detected - vanilla implementation'}

## Dependencies Management
### Runtime Dependencies (${Object.keys(analysis.dependencies.runtime).length})
${Object.keys(analysis.dependencies.runtime).length > 0 ? 
  Object.entries(analysis.dependencies.runtime).slice(0, 8).map(([name, version]) => `- \`${name}@${version}\``).join('\n') +
  (Object.keys(analysis.dependencies.runtime).length > 8 ? `\n- ... and ${Object.keys(analysis.dependencies.runtime).length - 8} more dependencies` : '') :
  'No external runtime dependencies detected.'}

### Development Dependencies (${Object.keys(analysis.dependencies.development).length})
${Object.keys(analysis.dependencies.development).length > 0 ? 
  Object.entries(analysis.dependencies.development).slice(0, 5).map(([name, version]) => `- \`${name}@${version}\``).join('\n') +
  (Object.keys(analysis.dependencies.development).length > 5 ? `\n- ... and ${Object.keys(analysis.dependencies.development).length - 5} more dev dependencies` : '') :
  'No development dependencies detected.'}

## Project Structure
- **Root Directory:** ${analysis.structure.rootFiles.slice(0, 8).join(', ')}${analysis.structure.rootFiles.length > 8 ? ` and ${analysis.structure.rootFiles.length - 8} more files` : ''}
- **Source Files:** ${Object.values(analysis.structure.sourceFiles).flat().length} total across ${Object.entries(analysis.structure.sourceFiles).filter(([_, files]) => files.length > 0).length} languages
- **Configuration:** ${analysis.architecture.configFiles.length} config files

## Build & Development
${Object.keys(analysis.dependencies.scripts).length > 0 ? 
  `### Available Scripts\n${Object.entries(analysis.dependencies.scripts).map(([name, cmd]) => `- \`npm run ${name}\`\n  ${cmd}`).join('\n')}` :
  '### Development\nStandard development workflow without custom scripts.'}

## Architecture Decisions
${analysis.architecture.patterns.length > 0 ? 
  `Current architectural patterns:\n${analysis.architecture.patterns.map(pattern => `- ${pattern}`).join('\n')}` :
  'Standard project organization without specific architectural patterns.'}

Generated: ${timestamp}
`;

    case 'progress.md':
      const totalDeps = Object.keys(analysis.dependencies.runtime).length + Object.keys(analysis.dependencies.development).length;
      return `# Progress

## Current Status
**${analysis.projectName}** v${analysis.version} - ${analysis.projectType}

### Project Metrics
- **Complexity:** ${analysis.structure.complexity}
- **File Count:** ${analysis.structure.estimatedFiles} files
- **Dependencies:** ${totalDeps} total packages
- **Frameworks:** ${analysis.frameworks.length} integrated

## What's Working
### Technology Stack
${analysis.frameworks.length > 0 ? 
  `- Frameworks: ${analysis.frameworks.join(', ')}` : 
  '- Core technologies without major frameworks'}
- Technologies: ${analysis.structure.keyPatterns.join(', ')}
- Configuration: ${analysis.architecture.configFiles.length} config files

### Source Code Organization
${Object.entries(analysis.structure.sourceFiles)
  .filter(([_, files]) => files.length > 0)
  .map(([type, files]) => `- **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${files.length} files organized`)
  .join('\n')}

## Development Infrastructure
${Object.keys(analysis.dependencies.scripts).length > 0 ? 
  `### Automated Scripts (${Object.keys(analysis.dependencies.scripts).length})\n${Object.keys(analysis.dependencies.scripts).map(script => `- \`${script}\``).join('\n')}` :
  '### Development\n- Manual development workflow'}

### Entry Points Established
${analysis.architecture.entryPoints.length > 0 ? 
  analysis.architecture.entryPoints.map(entry => `- \`${entry}\``).join('\n') :
  '- Standard entry point conventions'}

## Next Development Phase
### Immediate Focus
1. **Code Quality:** Review ${Object.values(analysis.structure.sourceFiles).flat().length} source files
2. **Dependencies:** Audit ${Object.keys(analysis.dependencies.runtime).length} runtime dependencies
3. **Architecture:** Enhance ${analysis.architecture.patterns.join(', ') || 'current patterns'}

### Technical Debt
- Configuration consolidation across ${analysis.architecture.configFiles.length} files
- Dependency optimization for ${totalDeps} packages
- ${analysis.structure.complexity} complexity management

## Recent Accomplishments
- Memory bank analysis completed with ${options.detailLevel} detail level
- Project structure documented: ${analysis.structure.directories.join(', ')}
- Technology stack identified and categorized

Last updated: ${timestamp}
`;

    default:
      return `# ${fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim()}

## Project Context
${analysis.projectName} - ${analysis.description}

## Content for ${fileName}
Detailed documentation specific to this section.

Generated: ${timestamp}
`;
  }
}

/**
 * Generate content for additional files (features, api, deployment, etc.)
 */
export async function generateAdditionalFileContent(
  fileName: string,
  analysis: ProjectAnalysis,
  _options: MemoryBankOptions,
  category?: { folder: string; description: string; patterns: string[] }
): Promise<string> {
  const timestamp = new Date().toISOString();
  const baseTitle = fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim();
  const fileType = fileName.replace('.md', '');
  
  let content = `# ${baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1)}\n\n`;
  
  if (category) {
    content += `## Category: ${category.folder}\n${category.description}\n\n`;
  }
  
  // Generate specific content based on file type
  switch (fileType.toLowerCase()) {
    case 'api':
      content += `## API Overview
${analysis.projectName} exposes APIs for core functionality.

### Framework Integration
${analysis.frameworks.includes('Express') || analysis.frameworks.includes('Express.js') || analysis.frameworks.includes('Fastify') || analysis.frameworks.includes('NestJS') ? 
  `API framework detected: ${analysis.frameworks.filter(fw => fw.includes('Express') || fw.includes('Fastify') || fw.includes('NestJS')).join(', ')}` :
  'API implementation follows standard patterns for the project type.'}

### Entry Points
${analysis.architecture.entryPoints.length > 0 ? 
  `Main API entry points:\n${analysis.architecture.entryPoints.map(entry => `- \`${entry}\``).join('\n')}` :
  'API entry points follow standard conventions.'}

### Dependencies
${Object.keys(analysis.dependencies.runtime).filter(dep => 
  ['express', 'fastify', 'axios', 'fetch', 'request'].some(apiDep => dep.includes(apiDep))
).length > 0 ? 
  `API-related dependencies:\n${Object.entries(analysis.dependencies.runtime)
    .filter(([name]) => ['express', 'fastify', 'axios', 'fetch', 'request'].some(apiDep => name.includes(apiDep)))
    .map(([name, version]) => `- \`${name}@${version}\``)
    .join('\n')}` :
  'No specific API dependencies detected in package.json.'}

### Implementation Notes
- Follow REST/GraphQL conventions as appropriate
- Implement proper error handling and validation
- Consider authentication and authorization requirements`;
      break;

    case 'deployment':
      content += `## Deployment Strategy
Deployment configuration for ${analysis.projectName}.

### Project Type: ${analysis.projectType}
${analysis.projectType.includes('Node.js') || analysis.projectType.includes('TypeScript') ? 
  'Node.js deployment strategies apply.' :
  'Deployment follows conventions for the detected project type.'}

### Build Process
${Object.keys(analysis.dependencies.scripts).length > 0 ? 
  `Available build scripts:\n${Object.entries(analysis.dependencies.scripts)
    .filter(([name]) => name.includes('build') || name.includes('start') || name.includes('deploy'))
    .map(([name, cmd]) => `- \`npm run ${name}\`: ${cmd}`)
    .join('\n')}` :
  'No specific build scripts detected. Manual deployment process may be required.'}

### Dependencies
- **Runtime:** ${Object.keys(analysis.dependencies.runtime).length} packages
- **Development:** ${Object.keys(analysis.dependencies.development).length} packages

### Configuration Files
${analysis.architecture.configFiles.filter(file => 
  file.includes('docker') || file.includes('deploy') || file.includes('config')
).length > 0 ? 
  `Deployment-related config:\n${analysis.architecture.configFiles
    .filter(file => file.includes('docker') || file.includes('deploy') || file.includes('config'))
    .map(file => `- \`${file}\``)
    .join('\n')}` :
  'Standard configuration files apply for deployment.'}

### Environment Considerations
- Ensure all dependencies are production-ready
- Configure environment variables as needed
- Set up proper logging and monitoring`;
      break;

    case 'features':
      content += `## Feature Overview
Core features and functionality of ${analysis.projectName}.

### Project Scope
${analysis.description || 'Feature set determined by project requirements and technical implementation.'}

### Technical Implementation
**Project Type:** ${analysis.projectType}
**Complexity:** ${analysis.structure.complexity}

### Framework Features
${analysis.frameworks.length > 0 ? 
  `Leveraging capabilities from:\n${analysis.frameworks.map(fw => `- **${fw}**: Framework-specific features and patterns`).join('\n')}` :
  'Features implemented using core technologies without major framework dependencies.'}

### Source Code Organization
${Object.entries(analysis.structure.sourceFiles)
  .filter(([_, files]) => files.length > 0)
  .map(([type, files]) => `- **${type.charAt(0).toUpperCase() + type.slice(1)} Features:** ${files.length} implementation files`)
  .join('\n')}

### Key Capabilities
${analysis.structure.keyPatterns.map(pattern => `- ${pattern} integration`).join('\n')}

### Development Scripts
${Object.keys(analysis.dependencies.scripts).length > 0 ? 
  `Feature development supported by:\n${Object.keys(analysis.dependencies.scripts).slice(0, 5).map(script => `- \`npm run ${script}\``).join('\n')}` :
  'Manual feature development workflow.'}`;
      break;

    case 'testing':
      const testingFrameworks = analysis.frameworks.filter(fw => fw.includes('Jest') || fw.includes('Vitest'));
      content += `## Testing Strategy
Testing approach for ${analysis.projectName}.

### Testing Framework
${testingFrameworks.length > 0 ? 
  `Using: ${testingFrameworks.join(', ')}` :
  'Testing framework to be determined based on project requirements.'}

### Test Organization
${analysis.structure.sourceFiles.typescript.length > 0 || analysis.structure.sourceFiles.javascript.length > 0 ? 
  `- **Source Files to Test:** ${analysis.structure.sourceFiles.typescript.length + analysis.structure.sourceFiles.javascript.length} files
- **Test Coverage:** Focus on core functionality and edge cases` :
  'Test organization follows standard practices for the project type.'}

### Testing Dependencies
${Object.keys(analysis.dependencies.development).filter(dep => 
  dep.includes('test') || dep.includes('jest') || dep.includes('vitest') || dep.includes('mocha')
).length > 0 ? 
  `Test-related dev dependencies:\n${Object.entries(analysis.dependencies.development)
    .filter(([name]) => name.includes('test') || name.includes('jest') || name.includes('vitest') || name.includes('mocha'))
    .map(([name, version]) => `- \`${name}@${version}\``)
    .join('\n')}` :
  'No specific testing dependencies detected. Consider adding test framework.'}

### Test Scripts
${Object.entries(analysis.dependencies.scripts).filter(([name]) => name.includes('test')).length > 0 ? 
  `Available test commands:\n${Object.entries(analysis.dependencies.scripts)
    .filter(([name]) => name.includes('test'))
    .map(([name, cmd]) => `- \`npm run ${name}\`: ${cmd}`)
    .join('\n')}` :
  'No test scripts configured. Manual testing approach.'}

### Testing Approach
- Unit tests for core functionality
- Integration tests for component interaction
- End-to-end tests for user workflows`;
      break;

    case 'security':
      content += `## Security Considerations
Security measures and best practices for ${analysis.projectName}.

### Project Security Profile
**Type:** ${analysis.projectType}
**Dependencies:** ${Object.keys(analysis.dependencies.runtime).length} runtime packages

### Dependency Security
${Object.keys(analysis.dependencies.runtime).length > 0 ? 
  `Monitor security for ${Object.keys(analysis.dependencies.runtime).length} runtime dependencies:
${Object.keys(analysis.dependencies.runtime).slice(0, 8).map(dep => `- \`${dep}\``).join('\n')}${Object.keys(analysis.dependencies.runtime).length > 8 ? `\n- ... and ${Object.keys(analysis.dependencies.runtime).length - 8} more` : ''}

Run \`npm audit\` regularly to check for vulnerabilities.` :
  'No external runtime dependencies detected. Reduced attack surface.'}

### Framework Security
${analysis.frameworks.length > 0 ? 
  `Security considerations for integrated frameworks:\n${analysis.frameworks.map(fw => `- **${fw}**: Follow framework-specific security guidelines`).join('\n')}` :
  'Security follows standard practices for the project type without framework-specific concerns.'}

### Configuration Security
${analysis.architecture.configFiles.length > 0 ? 
  `Secure configuration across ${analysis.architecture.configFiles.length} config files:
${analysis.architecture.configFiles.map(file => `- \`${file}\``).join('\n')}

Ensure sensitive data is not exposed in configuration files.` :
  'Standard configuration security practices apply.'}

### Best Practices
- Keep dependencies updated and audited
- Implement proper input validation
- Use environment variables for sensitive configuration
- Enable security headers and HTTPS in production`;
      break;

    default:
      content += `## Overview
Documentation for ${baseTitle} in the context of ${analysis.projectName}.

### Project Integration
**Type:** ${analysis.projectType}
**Frameworks:** ${analysis.frameworks.join(', ') || 'Core technologies'}

### Related Files
${Object.values(analysis.structure.sourceFiles).flat().length > 0 ? 
  `${Object.values(analysis.structure.sourceFiles).flat().length} source files in the project may relate to this documentation.` :
  'Source file organization to be documented as project develops.'}

### Implementation Notes
Specific implementation details for ${baseTitle} functionality.`;
      break;
  }

  if (category) {
    content += `

## Folder Organization
This file is organized under \`${category.folder}/\` for better categorization and maintainability.
Related patterns: ${category.patterns.join(', ')}`;
  }

  content += `

Generated: ${timestamp}
`;

  return content;
}