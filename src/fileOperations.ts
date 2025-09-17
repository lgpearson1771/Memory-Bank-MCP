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
  interactiveMode?: boolean;               // Enable conversational conflict resolution
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
  conflictDetails?: SyncConflictDetails;  // Detailed conflict information for interactive resolution
}

export interface SyncConflictDetails {
  conflictType: 'missing-references' | 'orphaned-references' | 'both' | 'structure-mismatch';
  severity: 'low' | 'medium' | 'high';
  missingFiles: FileConflictInfo[];
  orphanedFiles: FileConflictInfo[];
  suggestedActions: ConflictAction[];
  autoResolvable: boolean;
}

export interface FileConflictInfo {
  fileName: string;
  filePath: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

export interface ConflictAction {
  actionType: 'add-reference' | 'remove-reference' | 'delete-file' | 'create-file' | 'update-structure';
  description: string;
  targetFile: string;
  details: string;
  requiresConfirmation: boolean;
}

export interface InteractiveResolutionResult {
  resolved: boolean;
  actionsPerformed: ConflictAction[];
  userChoices: UserChoice[];
  finalState: CopilotSyncValidation;
  conversationLog: ConversationStep[];
}

export interface UserChoice {
  question: string;
  answer: string;
  selectedAction?: ConflictAction;
}

export interface ConversationStep {
  step: number;
  type: 'question' | 'information' | 'confirmation' | 'warning' | 'result';
  content: string;
  options?: string[];
  userResponse?: string;
  timestamp: string;
}

// New conversational workflow interfaces
export interface ConversationalResponse {
  requiresUserInput: boolean;
  status: 'analysis_complete' | 'awaiting_user_input' | 'ready_to_proceed' | 'completed' | 'error';
  conversation: ConversationPrompt;
  nextSteps: NextStepGuidance[];
  recommendations: AnalysisRecommendations;
  toolToCallNext?: string;
  suggestedParameters?: any;
}

export interface ConversationPrompt {
  message: string;
  options: string[];
  reasoning: string;
  consequences: string[];
  defaultChoice?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NextStepGuidance {
  action: string;
  description: string;
  toolName?: string;
  parameters?: any;
  optional: boolean;
}

export interface AnalysisRecommendations {
  projectType: string;
  suggestedStructure: 'standard' | 'enhanced' | 'custom';
  recommendedFocusAreas: string[];
  additionalFilesRecommended: {
    category: string;
    files: string[];
    reasoning: string;
  }[];
  confidence: 'low' | 'medium' | 'high';
}

export interface ConversationalResponse {
  requiresUserInput: boolean;
  status: 'analysis_complete' | 'awaiting_user_input' | 'ready_to_proceed' | 'completed' | 'error';
  conversation: ConversationPrompt;
  nextSteps: NextStepGuidance[];
  recommendations: AnalysisRecommendations;
  toolToCallNext?: string;
  suggestedParameters?: any;
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
  projectName: string;
  description: string;
  version: string;
  structure: {
    rootFiles: string[];
    directories: string[];
    keyPatterns: string[];
    complexity: 'Low' | 'Medium' | 'High';
    estimatedFiles: number;
    sourceFiles: {
      typescript: string[];
      javascript: string[];
      python: string[];
      other: string[];
    };
  };
  dependencies: {
    runtime: Record<string, string>;
    development: Record<string, string>;
    scripts: Record<string, string>;
  };
  frameworks: string[];
  architecture: {
    patterns: string[];
    entryPoints: string[];
    configFiles: string[];
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
    
    // Read package.json for detailed project info
    let packageInfo: any = {};
    let projectName = 'Unknown Project';
    let description = 'No description available';
    let version = '0.0.0';
    let dependencies = { runtime: {}, development: {}, scripts: {} };
    
    if (packageJsonExists) {
      try {
        const packagePath = path.join(projectRoot, 'package.json');
        const packageContent = await fs.readFile(packagePath, 'utf8');
        packageInfo = JSON.parse(packageContent);
        projectName = packageInfo.name || projectName;
        description = packageInfo.description || description;
        version = packageInfo.version || version;
        dependencies = {
          runtime: packageInfo.dependencies || {},
          development: packageInfo.devDependencies || {},
          scripts: packageInfo.scripts || {}
        };
      } catch (error) {
        console.warn('Failed to parse package.json:', error);
      }
    }
    
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
    
    // Enhanced file scanning
    const sourceFiles = await scanSourceFiles(projectRoot, depth);
    
    // Estimate project complexity
    const fileCount = await countFiles(projectRoot, depth === 'shallow' ? 1 : depth === 'medium' ? 3 : 10);
    const complexity = fileCount < 20 ? 'Low' : fileCount < 100 ? 'Medium' : 'High';
    
    // Detect frameworks and architectural patterns
    const frameworks = detectFrameworks(rootFiles, dependencies.runtime);
    const architecture = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
    
    return {
      projectType,
      projectName,
      description,
      version,
      structure: {
        rootFiles: rootFiles.filter(f => !f.startsWith('.')),
        directories: rootFiles.filter(f => f.endsWith('/') || !f.includes('.')),
        keyPatterns: detectPatterns(rootFiles),
        complexity,
        estimatedFiles: fileCount,
        sourceFiles,
      },
      dependencies,
      frameworks,
      architecture,
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
  options?: { syncValidation?: boolean; projectRoot?: string; interactiveMode?: boolean }
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
      result.copilotSync = await validateCopilotSync(
        memoryBankDir, 
        options.projectRoot, 
        options.interactiveMode || false
      );
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
  projectRoot: string,
  interactiveMode: boolean = false
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
    
    // Find files not referenced in Copilot instructions (compare by filename only)
    unreferencedFiles = memoryBankFiles.filter(file => {
      const fileName = path.basename(file);
      return !copilotReferences.some(ref => {
        const refFileName = path.basename(ref);
        return fileName === refFileName;
      });
    });
    
    // Find references that don't have corresponding files (compare by filename only)
    orphanedReferences = copilotReferences.filter(ref => {
      // Skip copilot-instructions.md itself as it's not a memory bank file
      if (path.basename(ref) === 'copilot-instructions.md') {
        return false;
      }
      const refFileName = path.basename(ref);
      return !memoryBankFiles.some(file => {
        const fileName = path.basename(file);
        return fileName === refFileName;
      });
    });
    
  } catch (error) {
    // Copilot instructions file doesn't exist
    unreferencedFiles = memoryBankFiles;
  }
  
  const isInSync = unreferencedFiles.length === 0 && orphanedReferences.length === 0;
  
  // Generate conflict details if there are sync issues and interactive mode is enabled
  let conflictDetails: SyncConflictDetails | undefined;
  if (!isInSync && interactiveMode) {
    conflictDetails = await generateConflictDetails(
      memoryBankFiles,
      copilotReferences,
      unreferencedFiles,
      orphanedReferences,
      memoryBankDir,
      copilotPath
    );
  }
  
  const result: CopilotSyncValidation = {
    memoryBankFiles,
    copilotReferences,
    missingReferences: unreferencedFiles,
    orphanedReferences,
    isInSync,
    lastValidated: new Date().toISOString()
  };
  
  if (conflictDetails) {
    result.conflictDetails = conflictDetails;
  }
  
  return result;
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
 * Generate detailed conflict analysis for interactive resolution
 */
async function generateConflictDetails(
  _memoryBankFiles: string[],
  _copilotReferences: string[],
  unreferencedFiles: string[],
  orphanedReferences: string[],
  _memoryBankDir: string,
  _copilotPath: string
): Promise<SyncConflictDetails> {
  const missingFiles: FileConflictInfo[] = [];
  const orphanedFiles: FileConflictInfo[] = [];
  const suggestedActions: ConflictAction[] = [];
  
  // Analyze unreferenced files
  for (const file of unreferencedFiles) {
    const filePath = file.includes('/') ? 
      path.join(_memoryBankDir, file) : 
      path.join(_memoryBankDir, file);
    
    let description = 'Memory bank file not referenced in Copilot instructions';
    let impact: 'low' | 'medium' | 'high' = 'medium';
    
    // Determine impact based on file type
    const coreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
    if (coreFiles.includes(file)) {
      impact = 'high';
      description = 'Core memory bank file missing from Copilot instructions - critical for AI understanding';
    } else if (file.includes('/')) {
      impact = 'low';
      description = 'Additional context file in semantic folder not referenced';
    }
    
    missingFiles.push({
      fileName: file,
      filePath,
      description,
      impact,
      suggestedAction: 'Add reference to copilot-instructions.md'
    });
    
    // Create suggested action
    suggestedActions.push({
      actionType: 'add-reference',
      description: `Add reference to ${file} in Copilot instructions`,
      targetFile: 'copilot-instructions.md',
      details: `Update the Memory Bank Structure section to include ${file}`,
      requiresConfirmation: impact === 'high'
    });
  }
  
  // Analyze orphaned references
  for (const ref of orphanedReferences) {
    orphanedFiles.push({
      fileName: ref,
      filePath: `Referenced but not found: ${ref}`,
      description: 'File referenced in Copilot instructions but missing from memory bank',
      impact: 'medium',
      suggestedAction: 'Remove reference or create missing file'
    });
    
    // Create suggested actions
    suggestedActions.push({
      actionType: 'remove-reference',
      description: `Remove obsolete reference to ${ref}`,
      targetFile: 'copilot-instructions.md',
      details: `Remove reference to ${ref} since the file no longer exists`,
      requiresConfirmation: true
    });
    
    suggestedActions.push({
      actionType: 'create-file',
      description: `Create missing file ${ref}`,
      targetFile: ref,
      details: `Generate ${ref} to match the reference in Copilot instructions`,
      requiresConfirmation: true
    });
  }
  
  // Determine conflict type and severity
  let conflictType: 'missing-references' | 'orphaned-references' | 'both' | 'structure-mismatch';
  if (unreferencedFiles.length > 0 && orphanedReferences.length > 0) {
    conflictType = 'both';
  } else if (unreferencedFiles.length > 0) {
    conflictType = 'missing-references';
  } else if (orphanedReferences.length > 0) {
    conflictType = 'orphaned-references';
  } else {
    conflictType = 'structure-mismatch';
  }
  
  // Determine severity
  const highImpactCount = missingFiles.filter(f => f.impact === 'high').length;
  const totalIssues = unreferencedFiles.length + orphanedReferences.length;
  
  let severity: 'low' | 'medium' | 'high';
  if (highImpactCount > 0 || totalIssues > 5) {
    severity = 'high';
  } else if (totalIssues > 2) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  // Determine if auto-resolvable
  const autoResolvable = severity === 'low' && 
                        orphanedReferences.length === 0 && 
                        unreferencedFiles.every(f => !['projectbrief.md', 'activeContext.md'].includes(f));
  
  return {
    conflictType,
    severity,
    missingFiles,
    orphanedFiles,
    suggestedActions,
    autoResolvable
  };
}
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

async function scanSourceFiles(projectRoot: string, depth: 'shallow' | 'medium' | 'deep'): Promise<{
  typescript: string[];
  javascript: string[];
  python: string[];
  other: string[];
}> {
  const maxDepth = depth === 'shallow' ? 2 : depth === 'medium' ? 4 : 6;
  const sourceFiles = {
    typescript: [] as string[],
    javascript: [] as string[],
    python: [] as string[],
    other: [] as string[]
  };
  
  const scanDirectory = async (dir: string, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return;
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(projectRoot, fullPath);
        
        if (entry.isFile()) {
          if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            sourceFiles.typescript.push(relativePath);
          } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
            sourceFiles.javascript.push(relativePath);
          } else if (entry.name.endsWith('.py')) {
            sourceFiles.python.push(relativePath);
          } else if (['.java', '.cs', '.cpp', '.c', '.h', '.go', '.rs', '.rb', '.php'].some(ext => entry.name.endsWith(ext))) {
            sourceFiles.other.push(relativePath);
          }
        } else if (entry.isDirectory()) {
          await scanDirectory(fullPath, currentDepth + 1);
        }
      }
    } catch {
      // Ignore errors and continue
    }
  };
  
  await scanDirectory(projectRoot);
  return sourceFiles;
}

function detectFrameworks(rootFiles: string[], dependencies: Record<string, string>): string[] {
  const frameworks: string[] = [];
  
  // Check package.json dependencies
  const depNames = Object.keys(dependencies);
  
  if (depNames.includes('react')) frameworks.push('React');
  if (depNames.includes('vue')) frameworks.push('Vue.js');
  if (depNames.includes('angular')) frameworks.push('Angular');
  if (depNames.includes('next')) frameworks.push('Next.js');
  if (depNames.includes('express')) frameworks.push('Express.js');
  if (depNames.includes('fastify')) frameworks.push('Fastify');
  if (depNames.includes('@nestjs/core')) frameworks.push('NestJS');
  if (depNames.includes('jest')) frameworks.push('Jest');
  if (depNames.includes('vitest')) frameworks.push('Vitest');
  if (depNames.includes('prisma')) frameworks.push('Prisma');
  if (depNames.includes('mongoose')) frameworks.push('Mongoose');
  
  // Check config files
  if (rootFiles.includes('next.config.js')) frameworks.push('Next.js');
  if (rootFiles.includes('vite.config.ts') || rootFiles.includes('vite.config.js')) frameworks.push('Vite');
  if (rootFiles.includes('webpack.config.js')) frameworks.push('Webpack');
  if (rootFiles.includes('docker-compose.yml')) frameworks.push('Docker Compose');
  
  return [...new Set(frameworks)]; // Remove duplicates
}

function analyzeArchitecture(rootFiles: string[], sourceFiles: any, packageInfo: any): {
  patterns: string[];
  entryPoints: string[];
  configFiles: string[];
} {
  const patterns: string[] = [];
  const entryPoints: string[] = [];
  const configFiles: string[] = [];
  
  // Detect architectural patterns
  if (rootFiles.includes('src')) patterns.push('Source Directory Structure');
  if (rootFiles.includes('lib') || rootFiles.includes('dist')) patterns.push('Build Output Structure');
  if (rootFiles.includes('tests') || rootFiles.includes('test') || rootFiles.includes('__tests__')) patterns.push('Test-Driven Development');
  if (rootFiles.includes('docs')) patterns.push('Documentation-First Approach');
  
  // Entry points
  if (packageInfo.main) entryPoints.push(packageInfo.main);
  if (packageInfo.module) entryPoints.push(packageInfo.module);
  if (packageInfo.types) entryPoints.push(packageInfo.types);
  
  // Common entry points
  if (sourceFiles.typescript.includes('src/index.ts')) entryPoints.push('src/index.ts');
  if (sourceFiles.javascript.includes('src/index.js')) entryPoints.push('src/index.js');
  if (sourceFiles.typescript.includes('index.ts')) entryPoints.push('index.ts');
  if (sourceFiles.javascript.includes('index.js')) entryPoints.push('index.js');
  
  // Config files
  const configPatterns = [
    'tsconfig.json', 'jsconfig.json', 'package.json', 'webpack.config.js', 
    'vite.config.ts', 'jest.config.js', 'eslint.config.js', '.eslintrc.json',
    'prettier.config.js', '.prettierrc', 'docker-compose.yml', 'Dockerfile'
  ];
  
  configFiles.push(...rootFiles.filter(file => configPatterns.includes(file)));
  
  return {
    patterns: [...new Set(patterns)],
    entryPoints: [...new Set(entryPoints)],
    configFiles: [...new Set(configFiles)]
  };
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
**${analysis.projectName}** (v${analysis.version})
${analysis.description}

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
${analysis.description || 'This project serves specific business and technical requirements.'}

## Project Details
- **Name:** ${analysis.projectName}
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

async function generateAdditionalFileContent(
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
${analysis.frameworks.includes('Express.js') || analysis.frameworks.includes('Fastify') || analysis.frameworks.includes('NestJS') ? 
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

/**
 * Perform interactive sync conflict resolution
 */
export async function performInteractiveSyncResolution(
  memoryBankDir: string,
  projectRoot: string,
  conflictDetails: SyncConflictDetails
): Promise<InteractiveResolutionResult> {
  const conversationLog: ConversationStep[] = [];
  const userChoices: UserChoice[] = [];
  const actionsPerformed: ConflictAction[] = [];
  
  let stepNumber = 1;
  
  // Step 1: Present conflict overview
  conversationLog.push({
    step: stepNumber++,
    type: 'information',
    content: generateConflictOverview(conflictDetails),
    timestamp: new Date().toISOString()
  });
  
  // Step 2: Present resolution options
  const resolutionOptions = generateResolutionOptions(conflictDetails);
  const resolutionQuestion: ConversationStep = {
    step: stepNumber++,
    type: 'question',
    content: "How would you like to resolve these sync conflicts?",
    options: resolutionOptions,
    timestamp: new Date().toISOString()
  };
  conversationLog.push(resolutionQuestion);
  
  // For this implementation, we'll simulate different resolution approaches
  // In a real interactive system, this would wait for user input
  const simulatedUserChoice = conflictDetails.autoResolvable ? 
    "Auto-resolve all conflicts" : 
    "Review each conflict individually";
  
  resolutionQuestion.userResponse = simulatedUserChoice;
  userChoices.push({
    question: resolutionQuestion.content,
    answer: simulatedUserChoice
  });
  
  // Step 3: Execute resolution based on user choice
  if (simulatedUserChoice === "Auto-resolve all conflicts" && conflictDetails.autoResolvable) {
    // Auto-resolve: add all missing references
    for (const action of conflictDetails.suggestedActions) {
      if (action.actionType === 'add-reference' && !action.requiresConfirmation) {
        await executeResolutionAction(action, memoryBankDir, projectRoot);
        actionsPerformed.push(action);
      }
    }
    
    conversationLog.push({
      step: stepNumber++,
      type: 'result',
      content: `✅ Auto-resolved ${actionsPerformed.length} conflicts. All missing file references have been added to copilot-instructions.md.`,
      timestamp: new Date().toISOString()
    });
    
  } else {
    // Manual review: present each conflict for user decision
    for (let i = 0; i < conflictDetails.suggestedActions.length; i++) {
      const action = conflictDetails.suggestedActions[i];
      
      const actionQuestion: ConversationStep = {
        step: stepNumber++,
        type: 'confirmation',
        content: `Conflict ${i + 1}/${conflictDetails.suggestedActions.length}: ${action.description}\n\nDetails: ${action.details}\n\nWould you like to perform this action?`,
        options: ['Yes - Apply this fix', 'No - Skip this conflict', 'Stop - Cancel resolution'],
        timestamp: new Date().toISOString()
      };
      conversationLog.push(actionQuestion);
      
      // Simulate user response based on action characteristics
      const responseOptions = ['Yes - Apply this fix', 'No - Skip this conflict', 'Stop - Cancel resolution'];
      const simulatedResponse = action.requiresConfirmation && conflictDetails.severity === 'high' ?
        responseOptions[1] : responseOptions[0];
      
      actionQuestion.userResponse = simulatedResponse;
      
      const choice: UserChoice = {
        question: `Apply fix: ${action.description}?`,
        answer: simulatedResponse
      };
      
      if (simulatedResponse === responseOptions[0]) {
        choice.selectedAction = action;
      }
      
      userChoices.push(choice);
      
      if (simulatedResponse === responseOptions[0]) {
        await executeResolutionAction(action, memoryBankDir, projectRoot);
        actionsPerformed.push(action);
      } else if (simulatedResponse === responseOptions[2]) {
        break;
      }
    }
    
    conversationLog.push({
      step: stepNumber++,
      type: 'result',
      content: `✅ Resolution complete. Applied ${actionsPerformed.length} out of ${conflictDetails.suggestedActions.length} suggested fixes.`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Step 4: Validate final state
  const finalValidation = await validateCopilotSync(memoryBankDir, projectRoot, false);
  
  conversationLog.push({
    step: stepNumber++,
    type: 'information',
    content: `Final sync status: ${finalValidation.isInSync ? '✅ Fully synchronized' : '⚠️ Some conflicts remain'}\n\nMemory bank files: ${finalValidation.memoryBankFiles.length}\nReferenced files: ${finalValidation.copilotReferences.length}\nRemaining unreferenced: ${finalValidation.missingReferences.length}\nRemaining orphaned: ${finalValidation.orphanedReferences.length}`,
    timestamp: new Date().toISOString()
  });
  
  return {
    resolved: finalValidation.isInSync,
    actionsPerformed,
    userChoices,
    finalState: finalValidation,
    conversationLog
  };
}

/**
 * Generate human-readable conflict overview
 */
function generateConflictOverview(conflictDetails: SyncConflictDetails): string {
  const { conflictType, severity, missingFiles, orphanedFiles } = conflictDetails;
  
  let overview = `🔍 Sync Conflict Analysis\n\n`;
  overview += `Conflict Type: ${conflictType.replace(/-/g, ' ').toUpperCase()}\n`;
  overview += `Severity: ${severity.toUpperCase()}\n\n`;
  
  if (missingFiles.length > 0) {
    overview += `📄 Unreferenced Files (${missingFiles.length}):\n`;
    missingFiles.forEach(file => {
      overview += `  • ${file.fileName} (${file.impact} impact)\n    ${file.description}\n`;
    });
    overview += '\n';
  }
  
  if (orphanedFiles.length > 0) {
    overview += `🔗 Orphaned References (${orphanedFiles.length}):\n`;
    orphanedFiles.forEach(file => {
      overview += `  • ${file.fileName}\n    ${file.description}\n`;
    });
    overview += '\n';
  }
  
  overview += `Auto-resolvable: ${conflictDetails.autoResolvable ? 'Yes' : 'No'}\n`;
  overview += `Suggested actions: ${conflictDetails.suggestedActions.length}`;
  
  return overview;
}

/**
 * Generate resolution option descriptions
 */
function generateResolutionOptions(conflictDetails: SyncConflictDetails): string[] {
  const options = [];
  
  if (conflictDetails.autoResolvable) {
    options.push("Auto-resolve all conflicts");
  }
  
  options.push("Review each conflict individually");
  options.push("Show detailed conflict analysis only");
  options.push("Cancel - Exit without changes");
  
  return options;
}

/**
 * Execute a specific resolution action
 */
async function executeResolutionAction(
  action: ConflictAction,
  memoryBankDir: string,
  projectRoot: string
): Promise<void> {
  const copilotPath = path.join(projectRoot, '.github', 'copilot-instructions.md');
  
  switch (action.actionType) {
    case 'add-reference':
      await addFileReferenceToCorpilotInstructions(copilotPath, action.targetFile);
      break;
      
    case 'remove-reference':
      await removeFileReferenceFromCorpilotInstructions(copilotPath, action.targetFile);
      break;
      
    case 'create-file':
      await createMissingMemoryBankFile(memoryBankDir, action.targetFile);
      break;
      
    case 'delete-file':
      await deleteObsoleteMemoryBankFile(memoryBankDir, action.targetFile);
      break;
      
    case 'update-structure':
      // Re-generate copilot instructions to match current structure
      await setupCopilotInstructions(projectRoot, { syncValidation: true });
      break;
  }
}

/**
 * Add file reference to Copilot instructions
 */
async function addFileReferenceToCorpilotInstructions(copilotPath: string, fileName: string): Promise<void> {
  try {
    const content = await fs.readFile(copilotPath, 'utf8');
    
    // Find the Memory Bank Structure section and add the file reference
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('### Core Files') || lines[i].includes('### Additional Files')) {
        // Find the end of this section to insert the reference
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('###') || lines[j].startsWith('##')) {
            insertIndex = j;
            break;
          }
        }
        break;
      }
    }
    
    if (insertIndex > -1) {
      const isSemanticFile = fileName.includes('/');
      const reference = isSemanticFile ? 
        `- \`${fileName}\`` : 
        `- \`${fileName}\` ✅`;
      
      lines.splice(insertIndex, 0, reference);
      await fs.writeFile(copilotPath, lines.join('\n'), 'utf8');
    }
  } catch (error) {
    console.error(`Failed to add reference for ${fileName}:`, error);
  }
}

/**
 * Remove file reference from Copilot instructions
 */
async function removeFileReferenceFromCorpilotInstructions(copilotPath: string, fileName: string): Promise<void> {
  try {
    const content = await fs.readFile(copilotPath, 'utf8');
    const lines = content.split('\n');
    
    // Remove lines that reference the file
    const filteredLines = lines.filter(line => !line.includes(fileName));
    
    await fs.writeFile(copilotPath, filteredLines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Failed to remove reference for ${fileName}:`, error);
  }
}

/**
 * Create missing memory bank file
 */
async function createMissingMemoryBankFile(memoryBankDir: string, fileName: string): Promise<void> {
  try {
    const filePath = path.join(memoryBankDir, fileName);
    const directory = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });
    
    // Generate basic content for the file
    const content = `# ${fileName.replace('.md', '').replace(/([A-Z])/g, ' $1').trim()}

This file was created to resolve a sync conflict between the memory bank and Copilot instructions.

## Overview
[Add content describing the purpose of this file]

## Details
[Add specific information relevant to this context]

Generated: ${new Date().toISOString()}
`;
    
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Failed to create file ${fileName}:`, error);
  }
}

/**
 * Delete obsolete memory bank file
 */
async function deleteObsoleteMemoryBankFile(memoryBankDir: string, fileName: string): Promise<void> {
  try {
    const filePath = path.join(memoryBankDir, fileName);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file ${fileName}:`, error);
  }
}

/**
 * Performs conversational project analysis to guide memory bank generation
 */
export async function analyzeProjectForConversation(
  projectRoot: string,
  mode: 'analyze-first' | 'guided' | 'express' | 'custom' = 'analyze-first'
): Promise<ConversationalResponse> {
  try {
    // Basic project analysis
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const readmePath = path.join(projectRoot, 'README.md');
    
    let projectType = 'Generic Project';
    let hasPackageJson = false;
    let detectedFrameworks: string[] = [];
    
    // Analyze package.json if exists
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      hasPackageJson = true;
      projectType = 'Node.js/TypeScript Project';
      
      // Detect frameworks and libraries
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (dependencies['@modelcontextprotocol/sdk']) detectedFrameworks.push('MCP Server');
      if (dependencies['typescript']) detectedFrameworks.push('TypeScript');
      if (dependencies['react']) detectedFrameworks.push('React');
      if (dependencies['vue']) detectedFrameworks.push('Vue');
      if (dependencies['angular']) detectedFrameworks.push('Angular');
      if (dependencies['express']) detectedFrameworks.push('Express');
      if (dependencies['next']) detectedFrameworks.push('Next.js');
      if (dependencies['jest']) detectedFrameworks.push('Jest Testing');
    } catch {
      // No package.json or invalid JSON
    }
    
    // Check for README
    try {
      await fs.access(readmePath);
      // README exists
    } catch {
      // No README
    }
    
    // Determine project complexity and make recommendations
    const complexity = detectedFrameworks.length > 2 ? 'complex' : detectedFrameworks.length > 0 ? 'moderate' : 'simple';
    
    let suggestedStructure: 'standard' | 'enhanced' | 'custom';
    let recommendedFocusAreas: string[] = [];
    let additionalFilesRecommended: Array<{category: string, files: string[], reasoning: string}> = [];
    
    if (complexity === 'complex') {
      suggestedStructure = 'enhanced';
      recommendedFocusAreas = ['architecture', 'integrations', 'testing'];
      
      if (detectedFrameworks.includes('MCP Server')) {
        additionalFilesRecommended.push({
          category: 'integrations',
          files: ['mcp-integration.md', 'tool-specifications.md'],
          reasoning: 'MCP servers benefit from detailed tool and integration documentation'
        });
      }
      
      if (detectedFrameworks.includes('Jest Testing')) {
        additionalFilesRecommended.push({
          category: 'testing',
          files: ['testing-strategy.md', 'test-coverage.md'],
          reasoning: 'Testing framework detected - comprehensive test documentation recommended'
        });
      }
    } else if (complexity === 'moderate') {
      suggestedStructure = 'enhanced';
      recommendedFocusAreas = ['architecture', 'apis'];
    } else {
      suggestedStructure = 'standard';
      recommendedFocusAreas = ['setup', 'usage'];
    }
    
    // Create conversational response based on mode
    const recommendations: AnalysisRecommendations = {
      projectType,
      suggestedStructure,
      recommendedFocusAreas,
      additionalFilesRecommended,
      confidence: hasPackageJson ? 'high' : 'medium'
    };
    
    let conversation: ConversationPrompt;
    let nextSteps: NextStepGuidance[];
    
    switch (mode) {
      case 'analyze-first':
        conversation = {
          message: `I've analyzed your ${projectType}${detectedFrameworks.length > 0 ? ` with ${detectedFrameworks.join(', ')}` : ''}. Based on the complexity, I recommend an ${suggestedStructure} memory bank structure. Would you like to proceed with this recommendation?`,
          options: [
            'Yes, use the recommended structure',
            'Show me customization options', 
            'Use standard structure instead',
            'Let me see the analysis details first'
          ],
          reasoning: `Detected ${complexity} project complexity with ${detectedFrameworks.length} frameworks/tools`,
          consequences: [
            'Enhanced structure includes semantic folders for better organization',
            'Standard structure uses only the 6 core files',
            'Customization allows you to specify exactly what you need'
          ],
          defaultChoice: 'Yes, use the recommended structure',
          priority: 'medium'
        };
        
        nextSteps = [
          {
            action: 'proceed_with_generation',
            description: 'Generate memory bank with recommended settings',
            toolName: 'generate_memory_bank',
            parameters: { 
              mode: 'guided',
              customizationOptions: {
                structureType: suggestedStructure,
                focusAreas: recommendedFocusAreas,
                detailLevel: 'detailed'
              }
            },
            optional: false
          },
          {
            action: 'customize_options',
            description: 'Configure specific options before generation',
            optional: true
          }
        ];
        break;
        
      case 'guided':
        conversation = {
          message: `Ready to generate your ${projectType} memory bank. I'll create ${suggestedStructure === 'enhanced' ? '6 core files plus organized additional files' : '6 core files'}. Should I proceed?`,
          options: [
            'Yes, generate the memory bank',
            'Let me adjust the focus areas',
            'Show me what files will be created',
            'Change to custom configuration'
          ],
          reasoning: `Configuration ready for ${suggestedStructure} structure`,
          consequences: [
            'Files will be created in .github/memory-bank directory',
            'Copilot instructions will be automatically configured',
            'You can always update or regenerate later'
          ],
          priority: 'high'
        };
        
        nextSteps = [
          {
            action: 'generate_files',
            description: 'Create memory bank files',
            toolName: 'generate_memory_bank',
            optional: false
          }
        ];
        break;
        
      case 'express':
        // For express mode, proceed immediately with smart defaults
        return {
          requiresUserInput: false,
          status: 'ready_to_proceed',
          conversation: {
            message: `Express mode: Creating ${suggestedStructure} memory bank for your ${projectType}`,
            options: [],
            reasoning: 'Using intelligent defaults for fast setup',
            consequences: ['Memory bank will be created immediately', 'You can customize later if needed'],
            priority: 'low'
          },
          nextSteps: [{
            action: 'generate_immediately',
            description: 'Generate with smart defaults',
            toolName: 'generate_memory_bank',
            parameters: { 
              customizationOptions: {
                structureType: suggestedStructure,
                focusAreas: recommendedFocusAreas,
                detailLevel: 'standard',
                autoConfirm: true
              }
            },
            optional: false
          }],
          recommendations,
          toolToCallNext: 'generate_memory_bank',
          suggestedParameters: {
            projectRootPath: projectRoot,
            mode: 'express',
            customizationOptions: {
              structureType: suggestedStructure,
              focusAreas: recommendedFocusAreas,
              detailLevel: 'standard',
              autoConfirm: true
            }
          }
        };
        
      default: // custom
        conversation = {
          message: `I've analyzed your ${projectType}. In custom mode, you have full control over the memory bank structure. What would you like to configure?`,
          options: [
            'Choose structure type (standard/enhanced/custom)',
            'Select focus areas',
            'Configure additional files',
            'Set detail level',
            'Review all options'
          ],
          reasoning: 'Custom mode allows complete control over all aspects',
          consequences: [
            'You can configure every aspect of the memory bank',
            'More options mean more decisions required',
            'Full flexibility for specialized needs'
          ],
          priority: 'medium'
        };
        
        nextSteps = [
          {
            action: 'configure_structure',
            description: 'Choose memory bank structure type',
            optional: false
          },
          {
            action: 'configure_focus',
            description: 'Select focus areas',
            optional: true
          },
          {
            action: 'configure_files',
            description: 'Choose additional files',
            optional: true
          }
        ];
    }
    
    return {
      requiresUserInput: true,
      status: 'awaiting_user_input',
      conversation,
      nextSteps,
      recommendations
    };
    
  } catch (error) {
    return {
      requiresUserInput: false,
      status: 'error',
      conversation: {
        message: `Error analyzing project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        options: ['Retry analysis', 'Proceed with manual configuration'],
        reasoning: 'Project analysis failed',
        consequences: ['May need to configure options manually'],
        priority: 'high'
      },
      nextSteps: [],
      recommendations: {
        projectType: 'Unknown',
        suggestedStructure: 'standard',
        recommendedFocusAreas: [],
        additionalFilesRecommended: [],
        confidence: 'low'
      }
    };
  }
}