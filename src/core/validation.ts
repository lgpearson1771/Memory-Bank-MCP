import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Memory Bank Validation Module
 * Handles validation of memory bank structure, completeness, and Copilot sync
 */

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
  actionType: 'add-reference' | 'remove-reference' | 'create-file' | 'delete-file' | 'update-structure';
  description: string;
  targetFile: string;
  details: string;
  requiresConfirmation: boolean;
}

/**
 * Validate memory bank structure and content
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
    // Import and use utility functions
    const { discoverMemoryBankStructure } = await import('../utils/fileUtils.js');
    
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
export async function validateCopilotSync(
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
export async function discoverAllMemoryBankFiles(memoryBankDir: string): Promise<string[]> {
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
export async function generateConflictDetails(
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

/**
 * Extract file references from content
 */
export function extractFileReferences(content: string): string[] {
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
export async function assessConsistency(memoryBankDir: string, presentFiles: string[]): Promise<string> {
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
export async function assessClarity(memoryBankDir: string, presentFiles: string[]): Promise<string> {
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