import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectAnalysis } from './projectAnalysis.js';
import { MemoryBankOptions, generateAdditionalFileContent } from './memoryBankGenerator.js';

/**
 * Semantic Organization Module
 * Handles semantic folder organization for additional memory bank files
 */

/**
 * Organize additional files into semantic folders based on content and purpose
 */
export async function organizeAdditionalFilesSemanticaly(
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
export function categorizeFile(
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