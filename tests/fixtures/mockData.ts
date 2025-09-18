import { ProjectAnalysis } from '../../src/core/projectAnalysis.js';

/**
 * Mock project analysis data for testing
 */
export const mockReactProjectAnalysis: ProjectAnalysis = {
  projectName: 'test-react-project',
  version: '1.2.3',
  description: 'A test React project for testing memory bank generation',
  projectType: 'TypeScript/React Project',
  frameworks: ['React', 'React Router'],
  structure: {
    rootFiles: ['package.json', 'tsconfig.json', 'README.md', 'public', 'src'],
    sourceFiles: {
      typescript: ['src/index.tsx', 'src/App.tsx', 'src/components/Home.tsx'],
      javascript: [],
      python: [],
      other: ['src/index.css', 'public/index.html']
    },
    directories: ['src', 'public', 'src/components', 'src/utils'],
    complexity: 'Medium',
    estimatedFiles: 15,
    keyPatterns: ['React Components', 'TypeScript', 'CSS Modules']
  },
  dependencies: {
    runtime: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.8.0',
      'axios': '^1.3.0',
      'lodash': '^4.17.21'
    },
    development: {
      '@types/react': '^18.0.27',
      '@types/react-dom': '^18.0.10',
      'typescript': '^4.9.5',
      'eslint': '^8.34.0',
      'prettier': '^2.8.4'
    },
    scripts: {
      'start': 'react-scripts start',
      'build': 'react-scripts build',
      'test': 'react-scripts test',
      'lint': 'eslint src/**/*.{ts,tsx}'
    }
  },
  architecture: {
    patterns: ['Component-Based Architecture', 'Source Directory Structure'],
    entryPoints: ['src/index.tsx'],
    configFiles: ['package.json', 'tsconfig.json']
  },
  recommendations: {
    focusAreas: ['architecture', 'components', 'testing'],
    detailLevel: 'standard',
    additionalSections: ['features', 'testing']
  }
};

export const mockNodeApiProjectAnalysis: ProjectAnalysis = {
  projectName: 'test-node-api',
  version: '2.1.0',
  description: 'A test Node.js API server for testing memory bank generation',
  projectType: 'TypeScript/Node.js Project',
  frameworks: ['Express.js', 'MongoDB'],
  structure: {
    rootFiles: ['package.json', 'tsconfig.json', 'README.md', 'src', 'dist'],
    sourceFiles: {
      typescript: ['src/server.ts', 'src/routes/auth.ts', 'src/models/User.ts'],
      javascript: [],
      python: [],
      other: ['.env.example', 'src/middleware/auth.ts']
    },
    directories: ['src', 'dist', 'src/routes', 'src/models', 'src/middleware', 'src/config'],
    complexity: 'High',
    estimatedFiles: 25,
    keyPatterns: ['Express.js', 'MongoDB', 'JWT Authentication']
  },
  dependencies: {
    runtime: {
      'express': '^4.18.2',
      'mongoose': '^7.0.1',
      'cors': '^2.8.5',
      'helmet': '^6.0.1',
      'bcryptjs': '^2.4.3',
      'jsonwebtoken': '^9.0.0'
    },
    development: {
      '@types/express': '^4.17.17',
      '@types/node': '^18.15.0',
      'typescript': '^5.0.2',
      'jest': '^29.5.0',
      'nodemon': '^2.0.20'
    },
    scripts: {
      'start': 'node dist/server.js',
      'dev': 'nodemon src/server.ts',
      'build': 'tsc',
      'test': 'jest'
    }
  },
  architecture: {
    patterns: ['Service Layer Pattern', 'Source Directory Structure', 'MVC Architecture'],
    entryPoints: ['src/server.ts'],
    configFiles: ['package.json', 'tsconfig.json', '.env']
  },
  recommendations: {
    focusAreas: ['api', 'architecture', 'security'],
    detailLevel: 'comprehensive',
    additionalSections: ['api', 'security', 'deployment']
  }
};

export const mockSimpleProjectAnalysis: ProjectAnalysis = {
  projectName: 'simple-project',
  version: '1.0.0',
  description: 'A simple project for testing',
  projectType: 'JavaScript Project',
  frameworks: [],
  structure: {
    rootFiles: ['package.json', 'index.js', 'README.md'],
    sourceFiles: {
      typescript: [],
      javascript: ['index.js', 'utils.js'],
      python: [],
      other: ['README.md']
    },
    directories: [],
    complexity: 'Low',
    estimatedFiles: 3,
    keyPatterns: ['JavaScript']
  },
  dependencies: {
    runtime: {},
    development: {},
    scripts: {
      'start': 'node index.js'
    }
  },
  architecture: {
    patterns: [],
    entryPoints: ['index.js'],
    configFiles: ['package.json']
  },
  recommendations: {
    focusAreas: ['architecture'],
    detailLevel: 'brief',
    additionalSections: []
  }
};