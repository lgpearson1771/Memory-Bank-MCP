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
  semanticOrganization?: boolean;          // Enable semantic folder organization
  customFolders?: CustomFolderConfig[];    // User-defined semantic folders
  generateOnlyRequested?: boolean;         // Only generate files explicitly requested by user
  syncValidation?: boolean;                // Enable sync validation with Copilot instructions
}

export interface CustomFolderConfig {
  name: string;                           // Folder name (e.g., "api", "security")
  description: string;                    // Purpose of the folder
  filePatterns: string[];                 // Files that should go in this folder
}

export interface SemanticFolderInfo {
  folderName: string;                     // e.g., "features", "integrations", "deployment"
  purpose: string;                        // Description of folder's purpose
  fileCount: number;                      // Number of files in folder
  files: string[];                        // List of files in folder
}

export interface CopilotSyncValidation {
  memoryBankFiles: string[];              // Files found in .github/memory-bank/ (including nested)
  copilotReferences: string[];            // Files referenced in copilot-instructions.md
  missingReferences: string[];            // Memory bank files not in Copilot instructions
  orphanedReferences: string[];           // Copilot references not in memory bank
  isInSync: boolean;                      // True if all files properly referenced
  lastValidated: string;                  // ISO timestamp of last validation
}

export interface ValidationResult {
  isValid: boolean;
  coreFilesPresent: string[];
  missingFiles: string[];
  additionalFiles: string[];
  quality: {
    completeness: string;
    consistency: string;
    clarity: string;
  };
  copilotSync?: CopilotSyncValidation;    // Enhanced sync validation
  structureCompliance: {                  // Semantic structure validation
    hasSemanticFolders: boolean;
    folderCount: number;
    totalFiles: number;
    organization: 'flat' | 'semantic' | 'unknown';
  };
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
 * Organize additional files into semantic folders
 */
async function organizeAdditionalFilesSemanticaly(
  memoryBankDir: string,
  additionalFiles: string[],
  analysis: ProjectAnalysis,
  options: MemoryBankOptions
): Promise<string[]> {
  const createdFiles: string[] = [];
  
  // Define semantic categories
  const semanticCategories: Record<string, { folder: string; description: string; patterns: string[] }> = {
    features: {
      folder: 'features',
      description: 'Feature-specific documentation and implementation details',
      patterns: ['feature', 'component', 'module', 'functionality', 'behavior']
    },
    integrations: {
      folder: 'integrations',
      description: 'Third-party integrations, APIs, and external services',
      patterns: ['api', 'integration', 'service', 'external', 'third-party', 'webhook']
    },
    deployment: {
      folder: 'deployment',
      description: 'Deployment guides, infrastructure, and operational procedures',
      patterns: ['deploy', 'infrastructure', 'docker', 'kubernetes', 'ci', 'cd', 'pipeline']
    },
    security: {
      folder: 'security',
      description: 'Security considerations, authentication, and compliance',
      patterns: ['security', 'auth', 'authentication', 'authorization', 'compliance', 'privacy']
    },
    testing: {
      folder: 'testing',
      description: 'Testing strategies, frameworks, and quality assurance',
      patterns: ['test', 'testing', 'qa', 'quality', 'spec', 'e2e', 'unit']
    },
    api: {
      folder: 'api',
      description: 'API documentation, endpoints, and interface specifications',
      patterns: ['endpoint', 'route', 'controller', 'graphql', 'rest', 'openapi']
    },
    performance: {
      folder: 'performance',
      description: 'Performance optimization, monitoring, and benchmarks',
      patterns: ['performance', 'optimization', 'benchmark', 'monitoring', 'metrics']
    }
  };
  
  // Add custom folders if specified
  if (options.customFolders) {
    for (const customFolder of options.customFolders) {
      semanticCategories[customFolder.name] = {
        folder: customFolder.name,
        description: customFolder.description,
        patterns: customFolder.filePatterns
      };
    }
  }
  
  // Categorize and create files
  for (const additionalFile of additionalFiles) {
    const fileName = additionalFile.endsWith('.md') ? additionalFile : `${additionalFile}.md`;
    const category = categorizeFile(fileName, semanticCategories);
    
    if (category) {
      // Create semantic folder if it doesn't exist
      const folderPath = path.join(memoryBankDir, category.folder);
      try {
        await fs.access(folderPath);
      } catch {
        await fs.mkdir(folderPath, { recursive: true });
      }
      
      // Generate file content
      const content = await generateAdditionalFileContent(fileName, analysis, options, category);
      const filePath = path.join(folderPath, fileName);
      await fs.writeFile(filePath, content, 'utf8');
      createdFiles.push(`${category.folder}/${fileName}`);
    } else {
      // Fallback to root level if no category matches
      const content = await generateAdditionalFileContent(fileName, analysis, options);
      const filePath = path.join(memoryBankDir, fileName);
      await fs.writeFile(filePath, content, 'utf8');
      createdFiles.push(fileName);
    }
  }
  
  return createdFiles;
}

/**
 * Categorize a file based on its name and content patterns
 */
function categorizeFile(
  fileName: string,
  categories: Record<string, { folder: string; description: string; patterns: string[] }>
): { folder: string; description: string; patterns: string[] } | null {
  const lowerFileName = fileName.toLowerCase();
  
  for (const [, category] of Object.entries(categories)) {
    for (const pattern of category.patterns) {
      if (lowerFileName.includes(pattern.toLowerCase())) {
        return category;
      }
    }
  }
  
  return null;
}

/**
 * Setup copilot instructions
 */
export async function setupCopilotInstructions(
  projectRoot: string,
  options?: { syncValidation?: boolean }
): Promise<void> {
  const githubDir = path.join(projectRoot, '.github');
  const instructionsPath = path.join(githubDir, 'copilot-instructions.md');
  const memoryBankDir = path.join(githubDir, 'memory-bank');
  
  // Ensure .github directory exists
  try {
    await fs.access(githubDir);
  } catch {
    await fs.mkdir(githubDir, { recursive: true });
  }
  
  // Discover existing memory bank structure
  const memoryBankStructure = await discoverMemoryBankStructure(memoryBankDir);
  
  // Generate dynamic Copilot instructions based on actual structure
  const dynamicTemplate = await generateDynamicCopilotTemplate(memoryBankStructure, options);
  
  // Write to project
  await fs.writeFile(instructionsPath, dynamicTemplate, 'utf8');
}

/**
 * Discover the current memory bank structure
 */
async function discoverMemoryBankStructure(memoryBankDir: string): Promise<{
  coreFiles: string[];
  semanticFolders: SemanticFolderInfo[];
  additionalFiles: string[];
  totalFiles: number;
}> {
  const structure = {
    coreFiles: [] as string[],
    semanticFolders: [] as SemanticFolderInfo[],
    additionalFiles: [] as string[],
    totalFiles: 0
  };
  
  try {
    await fs.access(memoryBankDir);
  } catch {
    return structure;
  }
  
  const coreFileNames = [
    'projectbrief.md',
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md'
  ];
  
  // Scan directory structure
  const items = await fs.readdir(memoryBankDir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isFile() && item.name.endsWith('.md')) {
      if (coreFileNames.includes(item.name)) {
        structure.coreFiles.push(item.name);
      } else {
        structure.additionalFiles.push(item.name);
      }
      structure.totalFiles++;
    } else if (item.isDirectory()) {
      // Scan semantic folders
      const folderPath = path.join(memoryBankDir, item.name);
      const folderFiles = await fs.readdir(folderPath);
      const mdFiles = folderFiles.filter(f => f.endsWith('.md'));
      
      if (mdFiles.length > 0) {
        structure.semanticFolders.push({
          folderName: item.name,
          purpose: generateFolderDescription(item.name),
          fileCount: mdFiles.length,
          files: mdFiles
        });
        structure.totalFiles += mdFiles.length;
      }
    }
  }
  
  return structure;
}

/**
 * Generate folder description based on semantic category
 */
function generateFolderDescription(folderName: string): string {
  const descriptions: Record<string, string> = {
    features: 'Feature-specific documentation and implementation details',
    integrations: 'Third-party integrations, APIs, and external services',
    deployment: 'Deployment guides, infrastructure, and operational procedures',
    security: 'Security considerations, authentication, and compliance',
    testing: 'Testing strategies, frameworks, and quality assurance',
    api: 'API documentation, endpoints, and interface specifications',
    performance: 'Performance optimization, monitoring, and benchmarks'
  };
  
  return descriptions[folderName] || `Documentation organized under ${folderName}/`;
}

/**
 * Generate dynamic Copilot instructions template
 */
async function generateDynamicCopilotTemplate(
  structure: {
    coreFiles: string[];
    semanticFolders: SemanticFolderInfo[];
    additionalFiles: string[];
    totalFiles: number;
  },
  options?: { syncValidation?: boolean }
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  let template = `# Memory Bank

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
`;

  // Document core files dynamically
  const coreFileDescriptions: Record<string, string> = {
    'projectbrief.md': 'Foundation document that shapes all other files. Created at project start if it doesn\'t exist. Defines core requirements and goals. Source of truth for project scope.',
    'productContext.md': 'Why this project exists. Problems it solves. How it should work. User experience goals.',
    'activeContext.md': 'Current work focus. Recent changes. Next steps. Active decisions and considerations. Important patterns and preferences. Learnings and project insights.',
    'systemPatterns.md': 'System architecture. Key technical decisions. Design patterns in use. Component relationships. Critical implementation paths.',
    'techContext.md': 'Technologies used. Development setup. Technical constraints. Dependencies. Tool usage patterns.',
    'progress.md': 'What works. What\'s left to build. Current status. Known issues. Evolution of project decisions.'
  };
  
  const allCoreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
  
  for (let i = 0; i < allCoreFiles.length; i++) {
    const fileName = allCoreFiles[i];
    const status = structure.coreFiles.includes(fileName) ? '✅' : '❌';
    template += `${i + 1}. \`${fileName}\` ${status}
   - ${coreFileDescriptions[fileName]}

`;
  }
  
  // Document semantic folders if they exist
  if (structure.semanticFolders.length > 0) {
    template += `### Semantic Organization

This project uses semantic folder organization for additional context:

`;
    
    for (const folder of structure.semanticFolders) {
      template += `#### \`${folder.folderName}/\` (${folder.fileCount} files)
${folder.purpose}
Files: ${folder.files.map(f => `\`${f}\``).join(', ')}

`;
    }
  }
  
  // Document additional files at root level
  if (structure.additionalFiles.length > 0) {
    template += `### Additional Files at Root Level
${structure.additionalFiles.map(f => `- \`${f}\``).join('\n')}

`;
  }
  
  template += `### Memory Bank Statistics
- Total files: ${structure.totalFiles}
- Core files present: ${structure.coreFiles.length}/6
- Semantic folders: ${structure.semanticFolders.length}
- Additional files: ${structure.additionalFiles.length}

`;

  // Add sync validation information if enabled
  if (options?.syncValidation) {
    template += `### Sync Validation
This copilot-instructions.md file is automatically synchronized with the memory bank structure. Last updated: ${timestamp}

`;
  }

  template += `## Core Workflows

### Plan Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> ReadFiles[Read ALL Memory Bank Files]
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

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.

---
*Generated: ${timestamp}*
`;
  
  return template;
}

/**
 * Validate memory bank structure
 */
export async function validateMemoryBank(
  memoryBankDir: string,
  options?: { syncValidation?: boolean; projectRoot?: string }
): Promise<ValidationResult> {
  const requiredFiles = [
    'projectbrief.md',
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md',
  ];
  
  const result: ValidationResult = {
    isValid: false,
    coreFilesPresent: [],
    missingFiles: [],
    additionalFiles: [],
    quality: {
      completeness: '0%',
      consistency: 'Unknown',
      clarity: 'Unknown',
    },
    structureCompliance: {
      hasSemanticFolders: false,
      folderCount: 0,
      totalFiles: 0,
      organization: 'unknown'
    }
  };
  
  try {
    // Discover memory bank structure
    const structure = await discoverMemoryBankStructure(memoryBankDir);
    
    // Basic validation
    const files = await fs.readdir(memoryBankDir);
    const presentFiles = requiredFiles.filter(f => files.includes(f));
    const missingFiles = requiredFiles.filter(f => !files.includes(f));
    const additionalFiles = files.filter(f => !requiredFiles.includes(f) && f.endsWith('.md'));
    
    // Structure compliance assessment
    result.structureCompliance = {
      hasSemanticFolders: structure.semanticFolders.length > 0,
      folderCount: structure.semanticFolders.length,
      totalFiles: structure.totalFiles,
      organization: structure.semanticFolders.length > 0 ? 'semantic' : 'flat'
    };
    
    result.isValid = missingFiles.length === 0;
    result.coreFilesPresent = presentFiles;
    result.missingFiles = missingFiles;
    result.additionalFiles = additionalFiles;
    
    // Enhanced quality assessment
    const completeness = Math.round((presentFiles.length / requiredFiles.length) * 100);
    const consistencyScore = await assessConsistency(memoryBankDir, presentFiles);
    const clarityScore = await assessClarity(memoryBankDir, presentFiles);
    
    result.quality = {
      completeness: `${completeness}%`,
      consistency: consistencyScore,
      clarity: clarityScore,
    };
    
    // Sync validation if requested
    if (options?.syncValidation && options?.projectRoot) {
      result.copilotSync = await validateCopilotSync(memoryBankDir, options.projectRoot);
    }
    
    return result;
    
  } catch (error) {
    result.missingFiles = requiredFiles;
    return result;
  }
}

/**
 * Validate synchronization between memory bank and Copilot instructions
 */
async function validateCopilotSync(
  memoryBankDir: string,
  projectRoot: string
): Promise<CopilotSyncValidation> {
  const copilotPath = path.join(projectRoot, '.github', 'copilot-instructions.md');
  
  // Discover all memory bank files (including nested)
  const memoryBankFiles = await discoverAllMemoryBankFiles(memoryBankDir);
  
  // Read Copilot instructions and extract file references
  let copilotReferences: string[] = [];
  let unreferencedFiles: string[] = [];
  let orphanedReferences: string[] = [];
  
  try {
    const copilotContent = await fs.readFile(copilotPath, 'utf8');
    copilotReferences = extractFileReferences(copilotContent);
    
    // Find files not referenced in Copilot instructions
    unreferencedFiles = memoryBankFiles.filter(file => 
      !copilotReferences.some(ref => ref.includes(file))
    );
    
    // Find references that don't have corresponding files
    orphanedReferences = copilotReferences.filter(ref =>
      !memoryBankFiles.some(file => ref.includes(file))
    );
    
  } catch (error) {
    // Copilot instructions file doesn't exist
    unreferencedFiles = memoryBankFiles;
  }
  
  return {
    memoryBankFiles,
    copilotReferences,
    missingReferences: unreferencedFiles,
    orphanedReferences,
    isInSync: unreferencedFiles.length === 0 && orphanedReferences.length === 0,
    lastValidated: new Date().toISOString()
  };
}

/**
 * Discover all memory bank files recursively
 */
async function discoverAllMemoryBankFiles(memoryBankDir: string): Promise<string[]> {
  const allFiles: string[] = [];
  
  try {
    const items = await fs.readdir(memoryBankDir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.md')) {
        allFiles.push(item.name);
      } else if (item.isDirectory()) {
        const folderPath = path.join(memoryBankDir, item.name);
        const folderFiles = await fs.readdir(folderPath);
        const mdFiles = folderFiles.filter(f => f.endsWith('.md'));
        allFiles.push(...mdFiles.map(f => `${item.name}/${f}`));
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  
  return allFiles;
}

/**
 * Extract file references from Copilot instructions content
 */
function extractFileReferences(content: string): string[] {
  const references: string[] = [];
  
  // Match patterns like `filename.md`, "filename.md", 'filename.md'
  const patterns = [
    /`([^`]+\.md)`/g,
    /"([^"]+\.md)"/g,
    /'([^']+\.md)'/g,
    /\*\*([^*]+\.md)\*\*/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      references.push(match[1]);
    }
  }
  
  return [...new Set(references)]; // Remove duplicates
}

/**
 * Assess consistency of memory bank files
 */
async function assessConsistency(memoryBankDir: string, presentFiles: string[]): Promise<string> {
  if (presentFiles.length === 0) return 'Unknown';
  
  try {
    // Check for cross-references between files
    let crossReferences = 0;
    let totalChecks = 0;
    
    for (const file of presentFiles) {
      const filePath = path.join(memoryBankDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Count references to other memory bank files
      for (const otherFile of presentFiles) {
        if (file !== otherFile) {
          totalChecks++;
          if (content.includes(otherFile.replace('.md', ''))) {
            crossReferences++;
          }
        }
      }
    }
    
    const consistencyRatio = totalChecks > 0 ? crossReferences / totalChecks : 0;
    
    if (consistencyRatio > 0.3) return 'High';
    if (consistencyRatio > 0.1) return 'Medium';
    return 'Low';
    
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Assess clarity of memory bank files
 */
async function assessClarity(memoryBankDir: string, presentFiles: string[]): Promise<string> {
  if (presentFiles.length === 0) return 'Unknown';
  
  try {
    let totalWordCount = 0;
    let totalHeadingCount = 0;
    
    for (const file of presentFiles) {
      const filePath = path.join(memoryBankDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Count words and headings
      const words = content.trim().split(/\s+/).length;
      const headings = (content.match(/^#+\s/gm) || []).length;
      
      totalWordCount += words;
      totalHeadingCount += headings;
    }
    
    const avgWordsPerFile = totalWordCount / presentFiles.length;
    const avgHeadingsPerFile = totalHeadingCount / presentFiles.length;
    
    // Assess based on structure and content length
    if (avgWordsPerFile > 200 && avgHeadingsPerFile > 3) return 'Excellent';
    if (avgWordsPerFile > 100 && avgHeadingsPerFile > 2) return 'Good';
    if (avgWordsPerFile > 50) return 'Fair';
    return 'Poor';
    
  } catch (error) {
    return 'Unknown';
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
  _options: MemoryBankOptions,
  category?: { folder: string; description: string; patterns: string[] }
): Promise<string> {
  const timestamp = new Date().toISOString();
  const baseTitle = fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim();
  
  let content = `# ${baseTitle}\n\n`;
  
  if (category) {
    content += `## Category: ${category.folder}\n${category.description}\n\n`;
  }
  
  content += `## Overview
Additional documentation for ${fileName.replace('.md', '')}.

## Details
[Specific content for this additional section]

## Integration
[How this relates to the main project]`;

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