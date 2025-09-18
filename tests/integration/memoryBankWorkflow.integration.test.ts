import * as fs from 'fs/promises';
import * as path from 'path';
import { analyzeProject } from '../../src/core/projectAnalysis.js';
import { generateMemoryBankFiles } from '../../src/core/memoryBankGenerator.js';
import { validateMemoryBank } from '../../src/core/validation.js';
import { ensureMemoryBankDirectory } from '../../src/utils/fileUtils.js';
import { TestCleanup } from '../helpers/testCleanup.js';

// Helper function to normalize paths for cross-platform testing
function normalizePaths(paths: string[]): string[] {
  return paths.map(p => p.replace(/\\/g, '/'));
}

describe('Memory Bank Generation Workflow Integration', () => {
  let testTempDir: string;
  
  beforeEach(async () => {
    testTempDir = await TestCleanup.setupTest('integration');
  });

  afterEach(async () => {
    await TestCleanup.cleanupTest(testTempDir);
  });

  describe('End-to-End Memory Bank Generation', () => {
    test('should complete full workflow for React project', async () => {
      // 1. Setup a mock React project
      const projectRoot = path.join(testTempDir, 'react-app');
      await fs.mkdir(path.join(projectRoot, 'src'), { recursive: true });
      await fs.mkdir(path.join(projectRoot, 'public'), { recursive: true });
      
      const packageJson = {
        name: 'test-react-app',
        version: '1.0.0',
        description: 'Test React application for integration testing',
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.8.0'
        },
        devDependencies: {
          '@types/react': '^18.0.27',
          'typescript': '^4.9.5'
        },
        scripts: {
          'start': 'react-scripts start',
          'build': 'react-scripts build',
          'test': 'react-scripts test'
        }
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'src', 'index.tsx'),
        'import React from "react";\nimport ReactDOM from "react-dom/client";'
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'src', 'App.tsx'),
        'export default function App() { return <div>Hello World</div>; }'
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'README.md'),
        '# Test React App\n\nThis is a test application.'
      );
      
      // 2. Analyze the project
      const analysis = await analyzeProject(projectRoot);
      
      expect(analysis.projectName).toBe('test-react-app');
      expect(analysis.frameworks).toContain('React');
      expect(normalizePaths(analysis.structure.sourceFiles.typescript)).toEqual(
        expect.arrayContaining(['src/index.tsx', 'src/App.tsx'])
      );
      
      // 3. Generate memory bank
      const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir,
        analysis,
        {
          structureType: 'standard',
          detailLevel: 'detailed',
          focusAreas: ['architecture', 'components'],
          additionalFiles: []
        }
      );
      
      expect(createdFiles).toHaveLength(6);
      
      // 4. Validate the generated memory bank
      const validation = await validateMemoryBank(memoryBankDir);
      
      expect(validation.isValid).toBe(true);
      expect(validation.coreFilesPresent).toHaveLength(6);
      expect(validation.missingFiles).toHaveLength(0);
      
      // 5. Verify file contents
      const projectBrief = await fs.readFile(
        path.join(memoryBankDir, 'projectbrief.md'),
        'utf-8'
      );
      
      expect(projectBrief).toContain('test-react-app');
      expect(projectBrief).toContain('React');
      expect(projectBrief).toContain('TypeScript');
      
      const techContext = await fs.readFile(
        path.join(memoryBankDir, 'techContext.md'),
        'utf-8'
      );
      
      expect(techContext).toContain('react@^18.2.0');
      expect(techContext).toContain('react-scripts start');
    });

    test('should complete full workflow for Node.js API project', async () => {
      // 1. Setup a mock Node.js API project
      const projectRoot = path.join(testTempDir, 'node-api');
      await fs.mkdir(path.join(projectRoot, 'src'), { recursive: true });
      await fs.mkdir(path.join(projectRoot, 'src', 'routes'), { recursive: true });
      await fs.mkdir(path.join(projectRoot, 'src', 'models'), { recursive: true });
      
      const packageJson = {
        name: 'test-node-api',
        version: '2.0.0',
        description: 'Test Node.js API for integration testing',
        main: 'dist/server.js',
        dependencies: {
          'express': '^4.18.2',
          'mongoose': '^7.0.1',
          'cors': '^2.8.5',
          'helmet': '^6.0.1'
        },
        devDependencies: {
          '@types/express': '^4.17.17',
          'typescript': '^5.0.2',
          'nodemon': '^2.0.20'
        },
        scripts: {
          'start': 'node dist/server.js',
          'dev': 'nodemon src/server.ts',
          'build': 'tsc'
        }
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'src', 'server.ts'),
        'import express from "express";\nconst app = express();'
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'src', 'routes', 'auth.ts'),
        'import { Router } from "express";\nexport const authRouter = Router();'
      );
      
      // 2. Analyze the project
      const analysis = await analyzeProject(projectRoot);
      
      expect(analysis.projectName).toBe('test-node-api');
      expect(analysis.frameworks).toEqual(
        expect.arrayContaining(['Express', 'TypeScript', 'Node.js'])
      );
      
      // 3. Generate memory bank with additional files
      const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir,
        analysis,
        {
          structureType: 'standard',
          detailLevel: 'detailed',
          focusAreas: ['api', 'architecture'],
          additionalFiles: ['api'],
          semanticOrganization: true
        }
      );
      
      expect(createdFiles.length).toBeGreaterThan(6);
      expect(createdFiles).toEqual(
        expect.arrayContaining(['integrations/api.md'])
      );
      
      // 4. Verify semantic folder structure
      const integrationsDir = path.join(memoryBankDir, 'integrations');
      await expect(fs.access(integrationsDir)).resolves.not.toThrow();
      
      const apiFile = await fs.readFile(
        path.join(integrationsDir, 'api.md'),
        'utf-8'
      );
      
      expect(apiFile).toContain('API');
      expect(apiFile).toContain('Express');
      
      // 5. Validate the complete memory bank
      const validation = await validateMemoryBank(memoryBankDir);
      
      expect(validation.isValid).toBe(true);
      expect(validation.structureCompliance?.hasSemanticFolders).toBe(true);
      expect(validation.structureCompliance?.organization).toBe('semantic');
    });

    test('should handle minimal project with flat organization', async () => {
      // 1. Setup a minimal JavaScript project
      const projectRoot = path.join(testTempDir, 'minimal-js');
      await fs.mkdir(projectRoot, { recursive: true });
      
      const packageJson = {
        name: 'minimal-project',
        version: '1.0.0',
        description: 'Minimal project for testing',
        main: 'index.js',
        scripts: {
          'start': 'node index.js'
        }
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'index.js'),
        'console.log("Hello, World!");'
      );
      
      // 2. Analyze and generate with flat organization
      const analysis = await analyzeProject(projectRoot);
      const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
      
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir,
        analysis,
        {
          structureType: 'standard',
          detailLevel: 'high-level',
          focusAreas: ['architecture'],
          additionalFiles: ['features'],
          semanticOrganization: false
        }
      );
      
      // 3. Verify flat organization
      const validation = await validateMemoryBank(memoryBankDir);
      
      expect(validation.isValid).toBe(true);
      expect(validation.structureCompliance?.organization).toBe('flat');
      
      // All additional files should be at root level
      const additionalFiles = createdFiles.filter(f => 
        !['projectbrief.md', 'productContext.md', 'activeContext.md', 
          'systemPatterns.md', 'techContext.md', 'progress.md'].includes(f)
      );
      
      additionalFiles.forEach(file => {
        expect(file).not.toContain('/');
      });
    });

    test('should update existing memory bank correctly', async () => {
      // 1. Setup project and create initial memory bank
      const projectRoot = path.join(testTempDir, 'update-test');
      await fs.mkdir(path.join(projectRoot, 'src'), { recursive: true });
      
      const packageJson = {
        name: 'update-test-project',
        version: '1.0.0',
        dependencies: { 'lodash': '^4.17.0' }
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const analysis = await analyzeProject(projectRoot);
      const memoryBankDir = await ensureMemoryBankDirectory(projectRoot);
      
      await generateMemoryBankFiles(memoryBankDir, analysis, {
        structureType: 'standard',
        detailLevel: 'detailed',
        focusAreas: ['architecture'],
        additionalFiles: []
      });
      
      // 2. Verify initial state
      let validation = await validateMemoryBank(memoryBankDir);
      expect(validation.isValid).toBe(true);
      
      const initialProgress = await fs.readFile(
        path.join(memoryBankDir, 'progress.md'),
        'utf-8'
      );
      expect(initialProgress).toContain('update-test-project');
      
      // 3. Update project (add dependencies)
      const updatedPackageJson = {
        ...packageJson,
        dependencies: {
          ...packageJson.dependencies,
          'express': '^4.18.0'
        }
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(updatedPackageJson, null, 2)
      );
      
      await fs.writeFile(
        path.join(projectRoot, 'src', 'server.js'),
        'const express = require("express");'
      );
      
      // 4. Re-analyze and update memory bank
      const updatedAnalysis = await analyzeProject(projectRoot);
      await generateMemoryBankFiles(memoryBankDir, updatedAnalysis, {
        structureType: 'standard',
        detailLevel: 'detailed',
        focusAreas: ['architecture'],
        additionalFiles: []
      });
      
      // 5. Verify updates
      validation = await validateMemoryBank(memoryBankDir);
      expect(validation.isValid).toBe(true);
      
      const updatedTechContext = await fs.readFile(
        path.join(memoryBankDir, 'techContext.md'),
        'utf-8'
      );
      expect(updatedTechContext).toContain('express');
    });

    test('should handle errors gracefully', async () => {
      // Test with invalid project path
      const invalidPath = path.join(testTempDir, 'non-existent');
      
      await expect(analyzeProject(invalidPath)).rejects.toThrow();
      
      // Test with invalid memory bank directory
      const invalidMemoryBankDir = path.join(testTempDir, 'invalid', 'nested', 'path');
      
      const validation = await validateMemoryBank(invalidMemoryBankDir);
      expect(validation.isValid).toBe(false);
      expect(validation.coreFilesPresent).toHaveLength(0);
    });
  });
});