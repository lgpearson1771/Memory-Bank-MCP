import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * File Utilities Module
 * Handles file system operations and directory structure discovery
 */

export interface SemanticFolderInfo {
  folderName: string;                     // e.g., "features", "integrations", "deployment"
  purpose: string;                        // Description of folder's purpose
  fileCount: number;                      // Number of files in folder
  files: string[];                        // List of files in folder
}

/**
 * Ensure .github/memory-bank directory exists
 */
export async function ensureMemoryBankDirectory(projectRoot: string): Promise<string> {
  const memoryBankDir = path.join(projectRoot, '.github', 'memory-bank');
  const githubDir = path.dirname(memoryBankDir);
  
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
 * Discover memory bank structure
 */
export async function discoverMemoryBankStructure(memoryBankDir: string): Promise<{
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
export function generateFolderDescription(folderName: string): string {
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
 * Count files in a directory up to a maximum depth
 */
export async function countFiles(dir: string, maxDepth: number, currentDepth = 0): Promise<number> {
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

/**
 * Clean up previous memory bank files before regeneration
 * Preserves core files and custom user files
 */
export async function cleanupPreviousMemoryBankFiles(memoryBankDir: string): Promise<void> {
  try {
    const coreFiles = new Set([
      'projectbrief.md',
      'productContext.md',
      'activeContext.md',
      'systemPatterns.md',
      'techContext.md',
      'progress.md'
    ]);

    const entries = await fs.readdir(memoryBankDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(memoryBankDir, entry.name);
      
      if (entry.isFile()) {
        // Remove files that are not core files and appear to be auto-generated
        if (!coreFiles.has(entry.name) && entry.name.endsWith('.md')) {
          // Check if this is likely a generated file (not custom)
          const content = await fs.readFile(entryPath, 'utf-8');
          if (isLikelyGeneratedFile(content, entry.name)) {
            await fs.unlink(entryPath);
          }
        }
      } else if (entry.isDirectory()) {
        // Remove semantic folders that contain generated files
        if (await isSemanticFolder(entryPath)) {
          await fs.rm(entryPath, { recursive: true, force: true });
        }
      }
    }
  } catch (error) {
    // Ignore cleanup errors to prevent breaking generation
    console.warn('Warning: Memory bank cleanup failed:', error);
  }
}

/**
 * Check if a file appears to be auto-generated
 */
function isLikelyGeneratedFile(content: string, filename: string): boolean {
  // Look for indicators that this is a generated file
  const generatedIndicators = [
    'Generated:',
    'Last Updated:',
    'Auto-generated',
    // Common semantic folder file patterns
    'api-overview',
    'api-reference',
    'api-docs',
    'testing-strategy',
    'testing-guide',
    'testing-framework',
    'deployment-guide',
    'security-guide',
    'feature-overview',
    'integrations-guide'
  ];
  
  // Check content for generation indicators
  const hasGeneratedMarkers = generatedIndicators.some(indicator => 
    content.includes(indicator) || filename.includes(indicator)
  );
  
  // Exclude files that seem to be custom (contain user-specific content)
  const customIndicators = [
    'custom',
    'team',
    'user',
    'notes',
    'decisions',
    'meeting',
    'scratch',
    'todo'
  ];
  
  const seemsCustom = customIndicators.some(indicator => 
    filename.toLowerCase().includes(indicator)
  );
  
  return hasGeneratedMarkers && !seemsCustom;
}

/**
 * Check if a directory is a semantic folder containing generated files
 */
async function isSemanticFolder(dirPath: string): Promise<boolean> {
  try {
    const folderName = path.basename(dirPath);
    
    // Known semantic folder names
    const semanticFolderNames = [
      'api', 'features', 'integrations', 'deployment', 
      'security', 'testing', 'documentation'
    ];
    
    if (!semanticFolderNames.includes(folderName)) {
      return false;
    }
    
    // Check if folder contains generated files
    const files = await fs.readdir(dirPath);
    if (files.length === 0) {
      return true; // Empty semantic folder can be removed
    }
    
    // Check if most files in the folder appear to be generated
    let generatedCount = 0;
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
        if (isLikelyGeneratedFile(content, file)) {
          generatedCount++;
        }
      }
    }
    
    // Remove folder if most files appear to be generated
    return generatedCount > files.length / 2;
  } catch {
    return false;
  }
}