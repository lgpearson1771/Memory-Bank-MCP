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