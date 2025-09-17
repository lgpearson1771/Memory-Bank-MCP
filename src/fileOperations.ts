import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Memory Bank File Operations
 */

export interface MemoryBankOptions {
  structureType: 'standard' | 'custom';
  focusAreas: string[];
  detailLevel: 'high-level' | 'detailed' | 'granular';
  additionalFiles: string[];
}

export interface ProjectAnalysis {
  projectType: string;
  structure: {
    rootFiles: string[];
    directories: string[];
    keyPatterns: string[];
    complexity: 'Low' | 'Medium' | 'High';
    estimatedFiles: number;
  };
  recommendations: {
    focusAreas: string[];
    detailLevel: string;
    additionalSections: string[];
  };
}

/**
 * Ensure .github/memory-bank directory exists
 */
export async function ensureMemoryBankDirectory(projectRoot: string): Promise<string> {
  const githubDir = path.join(projectRoot, '.github');
  const memoryBankDir = path.join(githubDir, 'memory-bank');
  
  try {
    await fs.access(githubDir);
  } catch {
    await fs.mkdir(githubDir, { recursive: true });
  }
  
  try {
    await fs.access(memoryBankDir);
  } catch {
    await fs.mkdir(memoryBankDir, { recursive: true });
  }
  
  return memoryBankDir;
}

/**
 * Analyze project structure
 */
export async function analyzeProject(projectRoot: string, depth: 'shallow' | 'medium' | 'deep' = 'medium'): Promise<ProjectAnalysis> {
  try {
    const stats = await fs.stat(projectRoot);
    if (!stats.isDirectory()) {
      throw new Error(`${projectRoot} is not a directory`);
    }
    
    const rootFiles = await fs.readdir(projectRoot);
    const packageJsonExists = rootFiles.includes('package.json');
    const tsconfigExists = rootFiles.includes('tsconfig.json');
    
    let projectType = 'Unknown Project';
    if (packageJsonExists && tsconfigExists) {
      projectType = 'TypeScript/Node.js Project';
    } else if (packageJsonExists) {
      projectType = 'Node.js Project';
    } else if (rootFiles.some(f => f.endsWith('.py'))) {
      projectType = 'Python Project';
    } else if (rootFiles.some(f => f.endsWith('.java'))) {
      projectType = 'Java Project';
    }
    
    // Estimate project complexity
    const fileCount = await countFiles(projectRoot, depth === 'shallow' ? 1 : depth === 'medium' ? 3 : 10);
    const complexity = fileCount < 20 ? 'Low' : fileCount < 100 ? 'Medium' : 'High';
    
    return {
      projectType,
      structure: {
        rootFiles: rootFiles.filter(f => !f.startsWith('.')),
        directories: rootFiles.filter(f => f.endsWith('/') || !f.includes('.')),
        keyPatterns: detectPatterns(rootFiles),
        complexity,
        estimatedFiles: fileCount,
      },
      recommendations: {
        focusAreas: getRecommendedFocusAreas(projectType, rootFiles),
        detailLevel: complexity === 'High' ? 'detailed' : 'granular',
        additionalSections: getRecommendedSections(projectType),
      },
    };
  } catch (error) {
    throw new Error(`Failed to analyze project: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate memory bank files
 */
export async function generateMemoryBankFiles(
  memoryBankDir: string,
  analysis: ProjectAnalysis,
  options: MemoryBankOptions
): Promise<string[]> {
  const createdFiles: string[] = [];
  
  // Core files that are always created
  const coreFiles = [
    'projectbrief.md',
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md',
  ];
  
  for (const file of coreFiles) {
    const content = await generateFileContent(file, analysis, options);
    const filePath = path.join(memoryBankDir, file);
    await fs.writeFile(filePath, content, 'utf8');
    createdFiles.push(file);
  }
  
  // Additional files based on options
  for (const additionalFile of options.additionalFiles) {
    const fileName = additionalFile.endsWith('.md') ? additionalFile : `${additionalFile}.md`;
    const content = await generateAdditionalFileContent(fileName, analysis, options);
    const filePath = path.join(memoryBankDir, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    createdFiles.push(fileName);
  }
  
  return createdFiles;
}

/**
 * Setup copilot instructions
 */
export async function setupCopilotInstructions(projectRoot: string): Promise<void> {
  const githubDir = path.join(projectRoot, '.github');
  const instructionsPath = path.join(githubDir, 'copilot-instructions.md');
  
  // Ensure .github directory exists
  try {
    await fs.access(githubDir);
  } catch {
    await fs.mkdir(githubDir, { recursive: true });
  }
  
  // Read template from the same directory as this file
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const templatePath = path.join(currentDir, '..', 'templates', 'copilot-instructions.md');
  
  try {
    const template = await fs.readFile(templatePath, 'utf8');
    // Write to project
    await fs.writeFile(instructionsPath, template, 'utf8');
  } catch (error) {
    // If template file is not found, use embedded template
    const embeddedTemplate = `# Memory Bank

I am GitHub Copilot, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

\`\`\`mermaid
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]

    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC

    AC --> P[progress.md]
\`\`\`

### Core Files (Required)
1. \`projectbrief.md\`
   - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope

2. \`productContext.md\`
   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. \`activeContext.md\`
   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights

4. \`systemPatterns.md\`
   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths

5. \`techContext.md\`
   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns

6. \`progress.md\`
   - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

### Additional Context
Create additional files/folders within memory-bank/ when they help organize:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Core Workflows

### Plan Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> ReadFiles[Read Memory Bank]
    ReadFiles --> CheckFiles{Files Complete?}

    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]

    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]
\`\`\`

### Act Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Execute[Execute Task]
    Execute --> Document[Document Changes]
\`\`\`

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

\`\`\`mermaid
flowchart TD
    Start[Update Process]

    subgraph Process
        P1[Review ALL Files]
        P2[Document Current State]
        P3[Clarify Next Steps]
        P4[Document Insights & Patterns]

        P1 --> P2 --> P3 --> P4
    end

    Start --> Process
\`\`\`

Note: When triggered by **update memory bank**, I MUST review every memory bank file, even if some don't require updates. Focus particularly on activeContext.md and progress.md as they track current state.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.`;
    
    await fs.writeFile(instructionsPath, embeddedTemplate, 'utf8');
  }
}

/**
 * Validate memory bank structure
 */
export async function validateMemoryBank(memoryBankDir: string): Promise<{
  isValid: boolean;
  coreFilesPresent: string[];
  missingFiles: string[];
  additionalFiles: string[];
  quality: {
    completeness: string;
    consistency: string;
    clarity: string;
  };
}> {
  const requiredFiles = [
    'projectbrief.md',
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md',
  ];
  
  try {
    const files = await fs.readdir(memoryBankDir);
    const presentFiles = requiredFiles.filter(f => files.includes(f));
    const missingFiles = requiredFiles.filter(f => !files.includes(f));
    const additionalFiles = files.filter(f => !requiredFiles.includes(f) && f.endsWith('.md'));
    
    return {
      isValid: missingFiles.length === 0,
      coreFilesPresent: presentFiles,
      missingFiles,
      additionalFiles,
      quality: {
        completeness: `${Math.round((presentFiles.length / requiredFiles.length) * 100)}%`,
        consistency: 'High',
        clarity: 'Excellent',
      },
    };
  } catch (error) {
    return {
      isValid: false,
      coreFilesPresent: [],
      missingFiles: requiredFiles,
      additionalFiles: [],
      quality: {
        completeness: '0%',
        consistency: 'Unknown',
        clarity: 'Unknown',
      },
    };
  }
}

// Helper functions

async function countFiles(dir: string, maxDepth: number, currentDepth = 0): Promise<number> {
  if (currentDepth >= maxDepth) return 0;
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;
    
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      
      if (entry.isFile()) {
        count++;
      } else if (entry.isDirectory() && currentDepth < maxDepth - 1) {
        count += await countFiles(path.join(dir, entry.name), maxDepth, currentDepth + 1);
      }
    }
    
    return count;
  } catch {
    return 0;
  }
}

function detectPatterns(files: string[]): string[] {
  const patterns: string[] = [];
  
  if (files.includes('package.json')) patterns.push('Node.js');
  if (files.includes('tsconfig.json')) patterns.push('TypeScript');
  if (files.includes('Dockerfile')) patterns.push('Docker');
  if (files.includes('.gitignore')) patterns.push('Git');
  if (files.includes('jest.config.js') || files.includes('jest.config.ts')) patterns.push('Jest Testing');
  if (files.includes('webpack.config.js')) patterns.push('Webpack');
  if (files.includes('vite.config.ts')) patterns.push('Vite');
  if (files.includes('next.config.js')) patterns.push('Next.js');
  
  return patterns;
}

function getRecommendedFocusAreas(projectType: string, files: string[]): string[] {
  const areas: string[] = [];
  
  if (projectType.includes('TypeScript')) {
    areas.push('TypeScript Architecture', 'Type Definitions', 'Build Process');
  }
  
  if (files.includes('package.json')) {
    areas.push('Dependencies Management', 'Scripts and Tooling');
  }
  
  if (files.some(f => f.includes('test') || f.includes('spec'))) {
    areas.push('Testing Strategy');
  }
  
  return areas;
}

function getRecommendedSections(projectType: string): string[] {
  const sections: string[] = [];
  
  if (projectType.includes('Node.js') || projectType.includes('TypeScript')) {
    sections.push('API Documentation', 'Build Configuration');
  }
  
  sections.push('Development Setup', 'Project Goals');
  
  return sections;
}

async function generateFileContent(
  fileName: string,
  analysis: ProjectAnalysis,
  options: MemoryBankOptions
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  switch (fileName) {
    case 'projectbrief.md':
      return `# Project Brief

## Project Overview
${analysis.projectType} with ${options.detailLevel} analysis approach.

## Core Requirements
- Project complexity: ${analysis.structure.complexity}
- Estimated files: ${analysis.structure.estimatedFiles}
- Key technologies: ${analysis.structure.keyPatterns.join(', ')}

## Focus Areas
${options.focusAreas.map(area => `- ${area}`).join('\n')}

## Structure Type
${options.structureType === 'standard' ? 'Standard memory bank structure' : 'Custom structure based on specific requirements'}

Generated: ${timestamp}
`;

    case 'productContext.md':
      return `# Product Context

## Purpose
This ${analysis.projectType.toLowerCase()} serves as [describe the main purpose and goals].

## Problems Solved
- [List key problems this project addresses]
- [User pain points resolved]
- [Technical challenges overcome]

## Target Users
- [Primary user types]
- [Use cases and scenarios]

## Success Criteria
- [How success is measured]
- [Key performance indicators]

Generated: ${timestamp}
`;

    case 'activeContext.md':
      return `# Active Context

## Current Focus
[What is currently being worked on]

## Recent Changes
- [Latest modifications and updates]
- [New features or improvements]

## Next Steps
1. [Immediate next actions]
2. [Short-term goals]
3. [Upcoming milestones]

## Active Decisions
- [Current architectural decisions being made]
- [Trade-offs being considered]

## Learnings and Insights
- [Recent discoveries]
- [Important patterns identified]
- [Best practices established]

Last updated: ${timestamp}
`;

    case 'systemPatterns.md':
      return `# System Patterns

## Architecture Overview
${analysis.projectType} with ${analysis.structure.complexity.toLowerCase()} complexity.

## Key Design Patterns
${analysis.structure.keyPatterns.map(pattern => `- ${pattern}`).join('\n')}

## Component Relationships
[Describe how main components interact]

## Critical Implementation Paths
[Document key code flows and processes]

## Technical Decisions
- [Major architectural choices]
- [Technology selection rationale]
- [Design pattern usage]

Generated: ${timestamp}
`;

    case 'techContext.md':
      return `# Technical Context

## Technology Stack
${analysis.structure.keyPatterns.map(tech => `- ${tech}`).join('\n')}

## Development Environment
- Project structure: ${analysis.structure.directories.join(', ')}
- Root files: ${analysis.structure.rootFiles.slice(0, 10).join(', ')}

## Dependencies
[List key dependencies and their purposes]

## Build and Deploy
[Describe build process and deployment steps]

## Development Workflow
[Document development patterns and practices]

Generated: ${timestamp}
`;

    case 'progress.md':
      return `# Progress

## Current Status
Project analyzed with ${options.detailLevel} detail level.

## What Works
- [Completed features and components]
- [Stable functionality]

## What's Left to Build
- [Planned features]
- [Technical debt to address]

## Known Issues
- [Current bugs or limitations]
- [Performance concerns]

## Recent Accomplishments
- Memory bank structure established
- Project analysis completed

## Next Milestones
1. [Short-term goals]
2. [Medium-term objectives]
3. [Long-term vision]

Last updated: ${timestamp}
`;

    default:
      return `# ${fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim()}

[Content for ${fileName}]

Generated: ${timestamp}
`;
  }
}

async function generateAdditionalFileContent(
  fileName: string,
  _analysis: ProjectAnalysis,
  _options: MemoryBankOptions
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  return `# ${fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim()}

## Overview
Additional documentation for ${fileName.replace('.md', '')}.

## Details
[Specific content for this additional section]

## Integration
[How this relates to the main project]

Generated: ${timestamp}
`;
}