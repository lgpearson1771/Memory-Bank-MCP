import * as fs from 'fs/promises';
import * as path from 'path';
import { securityValidator } from '../security/validation.js';

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
    // Enhanced folder structure analysis
    organizationPatterns: OrganizationPattern[];
    architecturalHints: ArchitecturalHint[];
    enterprisePatterns: EnterprisePattern[];
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
    // Enhanced architecture analysis
    systemType: 'Microservice' | 'Monolith' | 'Pipeline' | 'Library' | 'Tool' | 'Unknown';
    serviceArchitecture: ServiceArchitecture;
    enterpriseIntegration: EnterpriseIntegration;
  };
  // Enhanced business context
  businessContext: BusinessContext;
  recommendations: {
    focusAreas: string[];
    detailLevel: string;
    additionalSections: string[];
  };
}

// New interfaces for enhanced analysis
export interface OrganizationPattern {
  type: 'MVC' | 'Layered' | 'Domain-Driven' | 'Feature-Based' | 'Modular' | 'Flat';
  confidence: number;
  indicators: string[];
  description: string;
}

export interface ArchitecturalHint {
  pattern: string;
  confidence: number;
  evidence: string[];
  implications: string[];
}

export interface EnterprisePattern {
  type: 'Microsoft-Ecosystem' | 'Service-Oriented' | 'Pipeline-Architecture' | 'Enterprise-Library' | 'Monitoring-Integration';
  detected: boolean;
  indicators: string[];
  description: string;
}

export interface ServiceArchitecture {
  hasControllers: boolean;
  hasServices: boolean;
  hasRepositories: boolean;
  hasMiddleware: boolean;
  integrationPoints: string[];
  apiPatterns: string[];
}

export interface EnterpriseIntegration {
  microsoftEcosystem: boolean;
  azureIntegration: boolean;
  enterpriseLibraries: string[];
  monitoringFrameworks: string[];
  authenticationPatterns: string[];
}

export interface BusinessContext {
  domainType: 'Enterprise' | 'Consumer' | 'Developer-Tool' | 'Educational' | 'Gaming' | 'Unknown';
  problemDomain: string;
  businessValue: string[];
  userTypes: string[];
  integrationContext: string[];
}

/**
 * Analyze project structure and characteristics
 */
export async function analyzeProject(projectRoot: string, depth: 'shallow' | 'medium' | 'deep' = 'medium'): Promise<ProjectAnalysis> {
  try {
    // Validate and sanitize the project root path
    const sanitizedProjectRoot = securityValidator.sanitizeProjectPath(projectRoot);
    
    // Read package.json for real project metadata
    let packageInfo: any = {
      name: path.basename(sanitizedProjectRoot),
      description: '',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      scripts: {}
    };

    try {
      const packagePath = path.join(sanitizedProjectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const rawPackageInfo = JSON.parse(packageContent);
      
      // Sanitize package.json content before using it
      packageInfo = { ...packageInfo, ...securityValidator.validatePackageJson(rawPackageInfo) };
    } catch (error) {
      // No package.json or parsing error - use defaults
    }

    // Scan source files and directories (using sanitized path)
    const sourceAnalysis = await scanSourceFiles(sanitizedProjectRoot, depth);
    const rootFiles = await fs.readdir(sanitizedProjectRoot);
    
    // Extract real dependency data
    const allDependencies = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
    
    // Enhanced folder structure analysis
    const organizationPatterns = analyzeOrganizationPatterns(sourceAnalysis.directories);
    const architecturalHints = analyzeArchitecturalHints(rootFiles, sourceAnalysis);
    const enterprisePatterns = analyzeEnterprisePatterns(rootFiles, allDependencies, sourceAnalysis);
    
    // Detect frameworks based on dependencies and file patterns
    const frameworks = detectFrameworks(rootFiles, allDependencies);
    
    // Analyze architecture patterns (enhanced)
    const architecture = analyzeArchitecture(rootFiles, sourceAnalysis, packageInfo);
    
    // Get project type from package.json or file analysis
    let projectType = 'Unknown';
    if (packageInfo.type === 'module' || frameworks.includes('Node.js')) projectType = 'Node.js Project';
    if (frameworks.some(f => ['React', 'Vue', 'Angular'].includes(f))) projectType = 'Frontend Application';
    if (frameworks.includes('Express') || frameworks.includes('Fastify')) projectType = 'Backend API';
    if (allDependencies['typescript'] || rootFiles.includes('tsconfig.json')) projectType = 'TypeScript Project';
    if (allDependencies['@modelcontextprotocol/sdk']) projectType = 'MCP Server';
    
    const businessContext = analyzeBusinessContext(projectType, packageInfo, rootFiles, allDependencies);
    
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
      description: securityValidator.sanitizeMarkdown(packageInfo.description || 'A software project'),
      version: packageInfo.version || '1.0.0',
      structure: {
        rootFiles,
        directories: sourceAnalysis.directories,
        keyPatterns: detectPatterns(rootFiles),
        complexity,
        estimatedFiles: totalFiles,
        sourceFiles: sourceAnalysis,
        // Enhanced folder structure analysis
        organizationPatterns,
        architecturalHints,
        enterprisePatterns
      },
      dependencies: {
        runtime: packageInfo.dependencies || {},
        development: packageInfo.devDependencies || {},
        scripts: packageInfo.scripts || {}
      },
      frameworks,
      architecture,
      // Enhanced business context
      businessContext,
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
  systemType: 'Microservice' | 'Monolith' | 'Pipeline' | 'Library' | 'Tool' | 'Unknown';
  serviceArchitecture: ServiceArchitecture;
  enterpriseIntegration: EnterpriseIntegration;
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
  
  // Determine system type
  let systemType: 'Microservice' | 'Monolith' | 'Pipeline' | 'Library' | 'Tool' | 'Unknown' = 'Unknown';
  
  if (sourceFiles.directories.some((d: string) => d.includes('pipeline')) || 
      sourceFiles.directories.some((d: string) => d.includes('stage'))) {
    systemType = 'Pipeline';
  } else if (rootFiles.includes('docker-compose.yml') && 
             sourceFiles.directories.some((d: string) => d.includes('service'))) {
    systemType = 'Microservice';
  } else if (packageInfo.main && !sourceFiles.directories.some((d: string) => d.includes('app'))) {
    systemType = 'Library';
  } else if (packageInfo.bin || sourceFiles.directories.some((d: string) => d.includes('cli'))) {
    systemType = 'Tool';
  } else {
    systemType = 'Monolith';
  }
  
  // Analyze service architecture
  const serviceArchitecture: ServiceArchitecture = {
    hasControllers: sourceFiles.directories.some((d: string) => d.includes('controller')),
    hasServices: sourceFiles.directories.some((d: string) => d.includes('service')),
    hasRepositories: sourceFiles.directories.some((d: string) => d.includes('repository')) || 
                     sourceFiles.directories.some((d: string) => d.includes('data')),
    hasMiddleware: sourceFiles.directories.some((d: string) => d.includes('middleware')),
    integrationPoints: sourceFiles.directories.filter((d: string) => 
      d.includes('integration') || d.includes('connector') || d.includes('adapter')
    ),
    apiPatterns: sourceFiles.directories.filter((d: string) => 
      d.includes('api') || d.includes('endpoint') || d.includes('route')
    )
  };
  
  // Analyze enterprise integration
  const enterpriseIntegration: EnterpriseIntegration = {
    microsoftEcosystem: false, // Will be set based on dependencies
    azureIntegration: false,   // Will be set based on dependencies
    enterpriseLibraries: [],  // Will be populated based on dependencies
    monitoringFrameworks: [],  // Will be populated based on dependencies
    authenticationPatterns: sourceFiles.directories.filter((d: string) => 
      d.includes('auth') || d.includes('security') || d.includes('identity')
    )
  };
  
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
  
  return { patterns, entryPoints, configFiles, systemType, serviceArchitecture, enterpriseIntegration };
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

/**
 * Analyze organization patterns in folder structure
 */
export function analyzeOrganizationPatterns(directories: string[]): OrganizationPattern[] {
  const patterns: OrganizationPattern[] = [];
  
  // MVC Pattern Detection
  const hasMvcStructure = directories.some(d => d.includes('controller')) && 
                         directories.some(d => d.includes('model')) && 
                         directories.some(d => d.includes('view'));
  if (hasMvcStructure) {
    patterns.push({
      type: 'MVC',
      confidence: 0.8,
      indicators: ['controllers/', 'models/', 'views/'],
      description: 'Model-View-Controller architectural pattern with separate concerns'
    });
  }
  
  // Layered Architecture Detection
  const hasLayeredStructure = directories.some(d => d.includes('service')) && 
                             directories.some(d => d.includes('repositor')) && 
                             directories.some(d => d.includes('controller'));
  if (hasLayeredStructure) {
    patterns.push({
      type: 'Layered',
      confidence: 0.85,
      indicators: ['controllers/', 'services/', 'repositories/'],
      description: 'Layered architecture with controller, service, and data access layers'
    });
  }
  
  // Domain-Driven Design Detection
  const hasDomainStructure = directories.some(d => d.includes('domain')) || 
                            directories.some(d => d.includes('aggregate')) || 
                            directories.some(d => d.includes('entity'));
  if (hasDomainStructure) {
    patterns.push({
      type: 'Domain-Driven',
      confidence: 0.7,
      indicators: ['domain/', 'entities/', 'aggregates/'],
      description: 'Domain-driven design with business logic encapsulation'
    });
  }
  
  // Feature-Based Organization
  const hasFeatureStructure = directories.filter(d => 
    !['src', 'lib', 'test', 'tests', 'node_modules', 'dist', 'build'].includes(d.split('/')[0])
  ).length > 3;
  if (hasFeatureStructure) {
    patterns.push({
      type: 'Feature-Based',
      confidence: 0.6,
      indicators: directories.slice(0, 3),
      description: 'Feature-based organization with grouped functionality'
    });
  }
  
  // Modular Structure
  const hasModularStructure = directories.some(d => d.includes('module')) || 
                             directories.some(d => d.includes('lib')) || 
                             directories.some(d => d.includes('core'));
  if (hasModularStructure) {
    patterns.push({
      type: 'Modular',
      confidence: 0.75,
      indicators: ['modules/', 'lib/', 'core/'],
      description: 'Modular architecture with reusable components'
    });
  }
  
  return patterns;
}

/**
 * Analyze architectural hints from file structure
 */
export function analyzeArchitecturalHints(rootFiles: string[], sourceAnalysis: any): ArchitecturalHint[] {
  const hints: ArchitecturalHint[] = [];
  
  // Pipeline Architecture Hint
  if (sourceAnalysis.directories.some((d: string) => d.includes('pipeline')) || 
      sourceAnalysis.directories.some((d: string) => d.includes('stage'))) {
    hints.push({
      pattern: 'Pipeline Architecture',
      confidence: 0.8,
      evidence: ['pipeline/', 'stages/', 'processing/'],
      implications: ['Multi-stage data processing', 'Sequential workflow', 'Stage-based execution']
    });
  }
  
  // Microservices Architecture Hint
  if (rootFiles.includes('docker-compose.yml') && 
      sourceAnalysis.directories.some((d: string) => d.includes('service'))) {
    hints.push({
      pattern: 'Microservices Architecture',
      confidence: 0.75,
      evidence: ['docker-compose.yml', 'services/', 'api/'],
      implications: ['Service independence', 'Container deployment', 'API communication']
    });
  }
  
  // Event-Driven Architecture Hint
  if (sourceAnalysis.directories.some((d: string) => d.includes('event')) || 
      sourceAnalysis.directories.some((d: string) => d.includes('queue'))) {
    hints.push({
      pattern: 'Event-Driven Architecture',
      confidence: 0.7,
      evidence: ['events/', 'handlers/', 'queues/'],
      implications: ['Asynchronous processing', 'Event handling', 'Loose coupling']
    });
  }
  
  // Enterprise Integration Hint
  if (sourceAnalysis.directories.some((d: string) => d.includes('integration')) || 
      sourceAnalysis.directories.some((d: string) => d.includes('connector'))) {
    hints.push({
      pattern: 'Enterprise Integration',
      confidence: 0.8,
      evidence: ['integrations/', 'connectors/', 'adapters/'],
      implications: ['External system integration', 'Data transformation', 'Protocol handling']
    });
  }
  
  return hints;
}

/**
 * Analyze enterprise patterns in the project
 */
export function analyzeEnterprisePatterns(_rootFiles: string[], dependencies: Record<string, string>, sourceAnalysis: any): EnterprisePattern[] {
  const patterns: EnterprisePattern[] = [];
  const depNames = Object.keys(dependencies);
  
  // Microsoft Ecosystem Pattern
  const hasMicrosoftDeps = depNames.some(dep => 
    dep.includes('azure') || dep.includes('microsoft') || dep.includes('@azure')
  );
  const hasDotNetFiles = sourceAnalysis.other?.some((file: string) => file.endsWith('.cs')) || false;
  patterns.push({
    type: 'Microsoft-Ecosystem',
    detected: hasMicrosoftDeps || hasDotNetFiles,
    indicators: hasMicrosoftDeps ? ['Azure dependencies', 'Microsoft libraries'] : [],
    description: 'Integration with Microsoft Azure and .NET ecosystem'
  });
  
  // Service-Oriented Architecture Pattern
  const hasServiceStructure = sourceAnalysis.directories?.some((d: string) => d.includes('service')) && 
                              sourceAnalysis.directories?.some((d: string) => d.includes('api'));
  patterns.push({
    type: 'Service-Oriented',
    detected: hasServiceStructure,
    indicators: hasServiceStructure ? ['services/', 'api/', 'controllers/'] : [],
    description: 'Service-oriented architecture with API endpoints'
  });
  
  // Pipeline Architecture Pattern
  const hasPipelineStructure = sourceAnalysis.directories?.some((d: string) => d.includes('pipeline')) || 
                               sourceAnalysis.directories?.some((d: string) => d.includes('stage')) ||
                               sourceAnalysis.directories?.some((d: string) => d.includes('process'));
  patterns.push({
    type: 'Pipeline-Architecture',
    detected: hasPipelineStructure,
    indicators: hasPipelineStructure ? ['pipeline/', 'stages/', 'processors/'] : [],
    description: 'Multi-stage pipeline architecture for data processing'
  });
  
  // Enterprise Library Pattern
  const hasEnterpriseLibs = depNames.some(dep => 
    dep.includes('enterprise') || dep.includes('commons') || dep.includes('shared')
  );
  patterns.push({
    type: 'Enterprise-Library',
    detected: hasEnterpriseLibs,
    indicators: hasEnterpriseLibs ? ['Enterprise libraries', 'Shared components'] : [],
    description: 'Usage of enterprise-grade libraries and frameworks'
  });
  
  // Monitoring Integration Pattern
  const hasMonitoring = depNames.some(dep => 
    dep.includes('log') || dep.includes('metric') || dep.includes('trace') || 
    dep.includes('monitor') || dep.includes('telemetry')
  );
  patterns.push({
    type: 'Monitoring-Integration',
    detected: hasMonitoring,
    indicators: hasMonitoring ? ['Logging frameworks', 'Metrics libraries', 'Tracing tools'] : [],
    description: 'Comprehensive monitoring and observability integration'
  });
  
  return patterns;
}

/**
 * Analyze business context from project characteristics
 */
export function analyzeBusinessContext(projectType: string, _packageInfo: any, _rootFiles: string[], dependencies: Record<string, string>): BusinessContext {
  const depNames = Object.keys(dependencies);
  
  // Determine domain type
  let domainType: BusinessContext['domainType'] = 'Unknown';
  if (depNames.some(dep => dep.includes('azure') || dep.includes('enterprise'))) {
    domainType = 'Enterprise';
  } else if (depNames.some(dep => dep.includes('game') || dep.includes('phaser'))) {
    domainType = 'Gaming';
  } else if (depNames.some(dep => dep.includes('education') || dep.includes('learn'))) {
    domainType = 'Educational';
  } else if (projectType.includes('Tool') || projectType.includes('CLI')) {
    domainType = 'Developer-Tool';
  } else if (depNames.some(dep => dep.includes('react') || dep.includes('vue'))) {
    domainType = 'Consumer';
  }
  
  // Analyze problem domain
  let problemDomain = 'General software development';
  if (projectType.includes('MCP')) {
    problemDomain = 'AI assistant integration and tool protocol implementation';
  } else if (domainType === 'Enterprise') {
    problemDomain = 'Enterprise business process automation and integration';
  } else if (domainType === 'Gaming') {
    problemDomain = 'Interactive entertainment and user engagement';
  } else if (domainType === 'Educational') {
    problemDomain = 'Learning and knowledge transfer';
  }
  
  // Identify business value
  const businessValue: string[] = [];
  if (domainType === 'Enterprise') {
    businessValue.push('Process automation', 'Operational efficiency', 'Business intelligence');
  } else if (domainType === 'Consumer') {
    businessValue.push('User experience', 'Customer engagement', 'Market reach');
  } else if (domainType === 'Developer-Tool') {
    businessValue.push('Developer productivity', 'Code quality', 'Development efficiency');
  }
  
  // Identify user types
  const userTypes: string[] = [];
  if (domainType === 'Enterprise') {
    userTypes.push('Business users', 'System administrators', 'Enterprise developers');
  } else if (domainType === 'Consumer') {
    userTypes.push('End users', 'Customers', 'General public');
  } else if (domainType === 'Developer-Tool') {
    userTypes.push('Software developers', 'DevOps engineers', 'Technical teams');
  }
  
  // Identify integration context
  const integrationContext: string[] = [];
  if (depNames.some(dep => dep.includes('azure'))) {
    integrationContext.push('Azure cloud services');
  }
  if (depNames.some(dep => dep.includes('aws'))) {
    integrationContext.push('AWS cloud services');
  }
  if (depNames.some(dep => dep.includes('database') || dep.includes('sql'))) {
    integrationContext.push('Database systems');
  }
  if (depNames.some(dep => dep.includes('api') || dep.includes('rest') || dep.includes('axios'))) {
    integrationContext.push('REST API services');
  }
  
  return {
    domainType,
    problemDomain,
    businessValue,
    userTypes,
    integrationContext
  };
}