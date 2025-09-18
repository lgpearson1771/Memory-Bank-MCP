import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Project Analysis Module
 * Handles project structure analysis, framework detection, and dependency analysis
 */

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
 * Analyze project structure and characteristics
 */
export async function analyzeProject(projectRoot: string, depth: 'shallow' | 'medium' | 'deep' = 'medium'): Promise<ProjectAnalysis> {
  try {
    // Read package.json for real project metadata
    let packageInfo: any = {
      name: path.basename(projectRoot),
      description: '',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      scripts: {}
    };

    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      packageInfo = { ...packageInfo, ...JSON.parse(packageContent) };
    } catch (error) {
      // No package.json or parsing error - use defaults
    }

    // Scan source files and directories
    const sourceAnalysis = await scanSourceFiles(projectRoot, depth);
    const rootFiles = await fs.readdir(projectRoot);
    
    // Extract real dependency data
    const allDependencies = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
    
    // Detect frameworks based on dependencies and file patterns
    const frameworks = detectFrameworks(rootFiles, allDependencies);
    
    // Analyze architecture patterns
    const architecture = analyzeArchitecture(rootFiles, sourceAnalysis, packageInfo);
    
    // Get project type from package.json or file analysis
    let projectType = 'Unknown';
    if (packageInfo.type === 'module' || frameworks.includes('Node.js')) projectType = 'Node.js Project';
    if (frameworks.some(f => ['React', 'Vue', 'Angular'].includes(f))) projectType = 'Frontend Application';
    if (frameworks.includes('Express') || frameworks.includes('Fastify')) projectType = 'Backend API';
    if (allDependencies['typescript'] || rootFiles.includes('tsconfig.json')) projectType = 'TypeScript Project';
    if (allDependencies['@modelcontextprotocol/sdk']) projectType = 'MCP Server';
    
    // Estimate complexity
    const totalFiles = sourceAnalysis.typescript.length + sourceAnalysis.javascript.length + 
                      sourceAnalysis.python.length + sourceAnalysis.other.length;
    const complexity = totalFiles > 50 ? 'High' : totalFiles > 20 ? 'Medium' : 'Low';
    
    // Generate recommendations
    const recommendedFocusAreas = getRecommendedFocusAreas(projectType, rootFiles);
    const recommendedSections = getRecommendedSections(projectType);
    
    return {
      projectType,
      projectName: packageInfo.name || path.basename(projectRoot),
      description: packageInfo.description || 'A software project',
      version: packageInfo.version || '1.0.0',
      structure: {
        rootFiles,
        directories: sourceAnalysis.directories,
        keyPatterns: detectPatterns(rootFiles),
        complexity,
        estimatedFiles: totalFiles,
        sourceFiles: sourceAnalysis
      },
      dependencies: {
        runtime: packageInfo.dependencies || {},
        development: packageInfo.devDependencies || {},
        scripts: packageInfo.scripts || {}
      },
      frameworks,
      architecture,
      recommendations: {
        focusAreas: recommendedFocusAreas,
        detailLevel: complexity === 'High' ? 'comprehensive' : complexity === 'Medium' ? 'detailed' : 'standard',
        additionalSections: recommendedSections
      }
    };
  } catch (error) {
    throw new Error(`Failed to analyze project: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Scan source files in the project
 */
export async function scanSourceFiles(projectRoot: string, depth: 'shallow' | 'medium' | 'deep'): Promise<{
  typescript: string[];
  javascript: string[];
  python: string[];
  other: string[];
  directories: string[];
}> {
  const maxDepth = depth === 'shallow' ? 2 : depth === 'medium' ? 4 : 6;
  const result = {
    typescript: [] as string[],
    javascript: [] as string[],
    python: [] as string[],
    other: [] as string[],
    directories: [] as string[]
  };

  async function scanDirectory(dir: string, currentDepth: number) {
    if (currentDepth > maxDepth) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(projectRoot, fullPath);
        
        // Skip common directories to ignore
        if (entry.isDirectory()) {
          if (['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'].includes(entry.name)) {
            continue;
          }
          result.directories.push(relativePath);
          await scanDirectory(fullPath, currentDepth + 1);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          
          if (['.ts', '.tsx'].includes(ext)) {
            result.typescript.push(relativePath);
          } else if (['.js', '.jsx', '.mjs'].includes(ext)) {
            result.javascript.push(relativePath);
          } else if (['.py', '.pyw'].includes(ext)) {
            result.python.push(relativePath);
          } else if (['.java', '.cs', '.go', '.rs', '.php', '.rb', '.cpp', '.c', '.h'].includes(ext)) {
            result.other.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  await scanDirectory(projectRoot, 0);
  return result;
}

/**
 * Detect frameworks and technologies based on dependencies and files
 */
export function detectFrameworks(rootFiles: string[], dependencies: Record<string, string>): string[] {
  const frameworks: string[] = [];
  
  // Check dependencies for known frameworks
  const depNames = Object.keys(dependencies);
  
  if (depNames.includes('react')) frameworks.push('React');
  if (depNames.includes('vue')) frameworks.push('Vue.js');
  if (depNames.includes('@angular/core')) frameworks.push('Angular');
  if (depNames.includes('express')) frameworks.push('Express');
  if (depNames.includes('fastify')) frameworks.push('Fastify');
  if (depNames.includes('next')) frameworks.push('Next.js');
  if (depNames.includes('nuxt')) frameworks.push('Nuxt.js');
  if (depNames.includes('svelte')) frameworks.push('Svelte');
  if (depNames.includes('typescript')) frameworks.push('TypeScript');
  if (depNames.includes('jest')) frameworks.push('Jest');
  if (depNames.includes('vitest')) frameworks.push('Vitest');
  if (depNames.includes('webpack')) frameworks.push('Webpack');
  if (depNames.includes('vite')) frameworks.push('Vite');
  if (depNames.includes('@modelcontextprotocol/sdk')) frameworks.push('Model Context Protocol');
  
  // Check root files for framework indicators
  if (rootFiles.includes('next.config.js') || rootFiles.includes('next.config.ts')) {
    if (!frameworks.includes('Next.js')) frameworks.push('Next.js');
  }
  if (rootFiles.includes('nuxt.config.js') || rootFiles.includes('nuxt.config.ts')) {
    if (!frameworks.includes('Nuxt.js')) frameworks.push('Nuxt.js');
  }
  if (rootFiles.includes('angular.json')) {
    if (!frameworks.includes('Angular')) frameworks.push('Angular');
  }
  if (rootFiles.includes('svelte.config.js')) {
    if (!frameworks.includes('Svelte')) frameworks.push('Svelte');
  }
  if (rootFiles.includes('tsconfig.json')) {
    if (!frameworks.includes('TypeScript')) frameworks.push('TypeScript');
  }
  if (rootFiles.includes('jest.config.js') || rootFiles.includes('jest.config.ts')) {
    if (!frameworks.includes('Jest')) frameworks.push('Jest');
  }
  if (rootFiles.includes('vite.config.js') || rootFiles.includes('vite.config.ts')) {
    if (!frameworks.includes('Vite')) frameworks.push('Vite');
  }
  if (rootFiles.includes('webpack.config.js')) {
    if (!frameworks.includes('Webpack')) frameworks.push('Webpack');
  }
  
  // Add Node.js if we have package.json
  if (rootFiles.includes('package.json') && !frameworks.some(f => ['React', 'Vue.js', 'Angular'].includes(f))) {
    frameworks.push('Node.js');
  }
  
  return frameworks;
}

/**
 * Analyze architecture patterns and structure
 */
export function analyzeArchitecture(rootFiles: string[], sourceFiles: any, packageInfo: any): {
  patterns: string[];
  entryPoints: string[];
  configFiles: string[];
} {
  const patterns: string[] = [];
  const entryPoints: string[] = [];
  const configFiles: string[] = [];
  
  // Detect architectural patterns
  if (sourceFiles.directories.includes('src') || sourceFiles.directories.includes('lib')) {
    patterns.push('Source Directory Structure');
  }
  if (sourceFiles.directories.includes('components') || sourceFiles.directories.some((d: string) => d.includes('component'))) {
    patterns.push('Component-Based Architecture');
  }
  if (sourceFiles.directories.includes('services') || sourceFiles.directories.includes('api')) {
    patterns.push('Service Layer Pattern');
  }
  if (sourceFiles.directories.includes('utils') || sourceFiles.directories.includes('helpers')) {
    patterns.push('Utility Module Pattern');
  }
  if (sourceFiles.directories.includes('types') || sourceFiles.directories.includes('interfaces')) {
    patterns.push('Type Definition Organization');
  }
  if (sourceFiles.directories.includes('test') || sourceFiles.directories.includes('tests') || 
      sourceFiles.directories.includes('__tests__')) {
    patterns.push('Test Directory Structure');
  }
  if (rootFiles.includes('Dockerfile') || rootFiles.includes('docker-compose.yml')) {
    patterns.push('Containerized Deployment');
  }
  
  // Identify entry points
  if (packageInfo.main) entryPoints.push(packageInfo.main);
  if (packageInfo.module) entryPoints.push(packageInfo.module);
  if (packageInfo.types) entryPoints.push(packageInfo.types);
  if (rootFiles.includes('index.js')) entryPoints.push('index.js');
  if (rootFiles.includes('index.ts')) entryPoints.push('index.ts');
  if (rootFiles.includes('app.js')) entryPoints.push('app.js');
  if (rootFiles.includes('app.ts')) entryPoints.push('app.ts');
  if (rootFiles.includes('server.js')) entryPoints.push('server.js');
  if (rootFiles.includes('server.ts')) entryPoints.push('server.ts');
  
  // Identify configuration files
  const configExtensions = ['.json', '.js', '.ts', '.yml', '.yaml', '.toml', '.ini'];
  for (const file of rootFiles) {
    if (configExtensions.some(ext => file.endsWith(ext)) && 
        (file.includes('config') || file.includes('rc') || 
         ['tsconfig.json', 'package.json', 'webpack.config.js', 'jest.config.js'].includes(file))) {
      configFiles.push(file);
    }
  }
  
  return { patterns, entryPoints, configFiles };
}

/**
 * Detect common patterns in the project
 */
export function detectPatterns(files: string[]): string[] {
  const patterns: string[] = [];
  
  if (files.includes('package.json')) patterns.push('npm package');
  if (files.includes('yarn.lock')) patterns.push('Yarn dependency management');
  if (files.includes('pnpm-lock.yaml')) patterns.push('pnpm dependency management');
  if (files.includes('Dockerfile')) patterns.push('Docker containerization');
  if (files.includes('docker-compose.yml')) patterns.push('Docker Compose orchestration');
  if (files.includes('.env') || files.includes('.env.example')) patterns.push('Environment configuration');
  if (files.includes('.gitignore')) patterns.push('Git version control');
  if (files.includes('README.md')) patterns.push('Project documentation');
  if (files.includes('LICENSE')) patterns.push('Open source licensing');
  if (files.includes('.github')) patterns.push('GitHub workflows');
  if (files.includes('tsconfig.json')) patterns.push('TypeScript configuration');
  if (files.includes('eslint.config.js') || files.includes('.eslintrc.json')) patterns.push('ESLint code quality');
  if (files.includes('.prettierrc')) patterns.push('Prettier code formatting');
  
  return patterns;
}

/**
 * Get recommended focus areas based on project type
 */
export function getRecommendedFocusAreas(projectType: string, files: string[]): string[] {
  const focusAreas: string[] = [];
  
  // Base recommendations by project type
  if (projectType.includes('Frontend') || projectType.includes('React') || projectType.includes('Vue')) {
    focusAreas.push('components', 'user-interface', 'state-management');
  }
  if (projectType.includes('Backend') || projectType.includes('API') || projectType.includes('Server')) {
    focusAreas.push('api-endpoints', 'data-models', 'authentication');
  }
  if (projectType.includes('MCP')) {
    focusAreas.push('tools', 'protocols', 'integrations');
  }
  if (projectType.includes('TypeScript')) {
    focusAreas.push('type-definitions', 'interfaces');
  }
  
  // Additional recommendations based on files present
  if (files.includes('Dockerfile') || files.includes('docker-compose.yml')) {
    focusAreas.push('deployment', 'containerization');
  }
  if (files.includes('jest.config.js') || files.includes('vitest.config.js')) {
    focusAreas.push('testing');
  }
  if (files.includes('.github')) {
    focusAreas.push('ci-cd', 'automation');
  }
  if (files.includes('README.md')) {
    focusAreas.push('documentation');
  }
  
  return [...new Set(focusAreas)]; // Remove duplicates
}

/**
 * Get recommended sections based on project type
 */
export function getRecommendedSections(projectType: string): string[] {
  const sections: string[] = [];
  
  if (projectType.includes('Frontend')) {
    sections.push('Component Architecture', 'User Experience Flow', 'State Management');
  }
  if (projectType.includes('Backend') || projectType.includes('API')) {
    sections.push('API Design', 'Database Schema', 'Authentication Flow');
  }
  if (projectType.includes('MCP')) {
    sections.push('Tool Definitions', 'Protocol Implementation', 'Integration Points');
  }
  if (projectType.includes('TypeScript')) {
    sections.push('Type System Usage', 'Interface Design');
  }
  
  return sections;
}