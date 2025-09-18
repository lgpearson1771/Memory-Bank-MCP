import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  generateMemoryBankFiles, 
  generateFileContent,
  generateAdditionalFileContent,
  type MemoryBankOptions 
} from '../../src/core/memoryBankGenerator.js';
import { mockReactProjectAnalysis, mockNodeApiProjectAnalysis } from '../fixtures/mockData.js';

describe('Memory Bank Generator Module', () => {
  const testTempDir = path.join(process.cwd(), 'temp', 'test', 'unit');
  
  // Helper to create valid options
  const createOptions = (overrides: Partial<MemoryBankOptions> = {}): MemoryBankOptions => ({
    structureType: 'standard',
    detailLevel: 'detailed',
    focusAreas: ['architecture'],
    additionalFiles: [],
    ...overrides
  });
  
  beforeEach(async () => {
    await fs.mkdir(testTempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testTempDir, { recursive: true, force: true });
  });

  describe('generateFileContent', () => {
    test('should generate projectbrief.md content correctly', async () => {
      const content = await generateFileContent(
        'projectbrief.md', 
        mockReactProjectAnalysis,
        createOptions()
      );
      
      expect(content).toContain('# Project Brief');
      expect(content).toContain('test-react-project');
      expect(content).toContain('1.2.3');
      expect(content).toContain('TypeScript/React Project');
      expect(content).toContain('React');
      expect(content).toContain('React Components');
      expect(content).toContain('Generated:');
    });

    test('should generate productContext.md content correctly', async () => {
      const content = await generateFileContent(
        'productContext.md', 
        mockReactProjectAnalysis,
        createOptions()
      );
      
      expect(content).toContain('# Product Context');
      expect(content).toContain('## Purpose');
      expect(content).toContain('test-react-project');
      expect(content).toContain('npm run start');
      expect(content).toContain('react-scripts start');
    });

    test('should generate activeContext.md content correctly', async () => {
      const content = await generateFileContent(
        'activeContext.md', 
        mockReactProjectAnalysis,
        { structureType: 'standard', detailLevel: 'detailed', focusAreas: ['architecture'], additionalFiles: [] }
      );
      
      expect(content).toContain('# Active Context');
      expect(content).toContain('## Current Project State');
      expect(content).toContain('test-react-project');
      expect(content).toContain('Medium complexity');
      expect(content).toContain('React Components');
      expect(content).toContain('## Next Steps');
    });

    test('should generate systemPatterns.md content correctly', async () => {
      const content = await generateFileContent(
        'systemPatterns.md', 
        mockReactProjectAnalysis,
        { structureType: 'standard', detailLevel: 'detailed', focusAreas: ['architecture'], additionalFiles: [] }
      );
      
      expect(content).toContain('# System Patterns');
      expect(content).toContain('## Architecture Overview');
      expect(content).toContain('Component-Based Architecture');
      expect(content).toContain('Source Directory Structure');
      expect(content).toContain('src/index.tsx');
      expect(content).toContain('TypeScript Files');
    });

    test('should generate techContext.md content correctly', async () => {
      const content = await generateFileContent(
        'techContext.md', 
        mockReactProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['architecture'], additionalFiles: [] }
      );
      
      expect(content).toContain('# Technical Context');
      expect(content).toContain('## Technology Stack');
      expect(content).toContain('React');
      expect(content).toContain('react@^18.2.0');
      expect(content).toContain('@types/react');
      expect(content).toContain('package.json');
      expect(content).toContain('tsconfig.json');
    });

    test('should generate progress.md content correctly', async () => {
      const content = await generateFileContent(
        'progress.md', 
        mockReactProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['architecture'], additionalFiles: [] }
      );
      
      expect(content).toContain('# Progress');
      expect(content).toContain('## Current Status');
      expect(content).toContain('test-react-project');
      expect(content).toContain('v1.2.3');
      expect(content).toContain('## What\'s Working');
      expect(content).toContain('React');
      expect(content).toContain('## Next Development Phase');
    });

    test('should handle different project types appropriately', async () => {
      const reactContent = await generateFileContent(
        'techContext.md', 
        mockReactProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['architecture'], additionalFiles: [] }
      );
      
      const nodeContent = await generateFileContent(
        'techContext.md', 
        mockNodeApiProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['api'], additionalFiles: [] }
      );
      
      expect(reactContent).toContain('React');
      expect(reactContent).not.toContain('Express.js');
      
      expect(nodeContent).toContain('Express.js');
      expect(nodeContent).toContain('MongoDB');
      expect(nodeContent).not.toContain('React');
    });

    test('should include timestamps in generated content', async () => {
      const content = await generateFileContent(
        'projectbrief.md', 
        mockReactProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['architecture'], additionalFiles: [] }
      );
      
      expect(content).toMatch(/Generated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });
  });

  describe('generateAdditionalFileContent', () => {
    test('should generate feature documentation content', async () => {
      const content = await generateAdditionalFileContent(
        'authentication.md',
        mockNodeApiProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['features'], additionalFiles: [] },
        { folder: 'features', description: 'Feature documentation', patterns: ['auth', 'login'] }
      );
      
      expect(content).toContain('# Authentication Feature');
      expect(content).toContain('## Overview');
      expect(content).toContain('test-node-api');
      expect(content).toContain('authentication');
    });

    test('should generate API documentation content', async () => {
      const content = await generateAdditionalFileContent(
        'endpoints.md',
        mockNodeApiProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['api'], additionalFiles: [] },
        { folder: 'api', description: 'API documentation', patterns: ['endpoint', 'route'] }
      );
      
      expect(content).toContain('# API Endpoints');
      expect(content).toContain('## Overview');
      expect(content).toContain('Express.js');
      expect(content).toContain('endpoints');
    });

    test('should generate deployment documentation content', async () => {
      const content = await generateAdditionalFileContent(
        'docker.md',
        mockNodeApiProjectAnalysis,
        { detailLevel: 'detailed', focusAreas: ['deployment'], additionalFiles: [] },
        { folder: 'deployment', description: 'Deployment documentation', patterns: ['docker', 'deploy'] }
      );
      
      expect(content).toContain('# Docker Deployment');
      expect(content).toContain('## Overview');
      expect(content).toContain('deployment');
    });
  });

  describe('generateMemoryBankFiles', () => {
    test('should generate all core files', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const options: MemoryBankOptions = {
        detailLevel: 'detailed',
        focusAreas: ['architecture'],
        additionalFiles: []
      };
      
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir, 
        mockReactProjectAnalysis, 
        options
      );
      
      expect(createdFiles).toHaveLength(6);
      expect(createdFiles).toEqual(
        expect.arrayContaining([
          'projectbrief.md',
          'productContext.md', 
          'activeContext.md',
          'systemPatterns.md',
          'techContext.md',
          'progress.md'
        ])
      );
      
      // Verify files actually exist
      for (const file of createdFiles) {
        const filePath = path.join(memoryBankDir, file);
        await expect(fs.access(filePath)).resolves.not.toThrow();
      }
    });

    test('should generate additional files with semantic organization', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const options: MemoryBankOptions = {
        detailLevel: 'detailed',
        focusAreas: ['features', 'api'],
        additionalFiles: ['features', 'api'],
        semanticOrganization: true
      };
      
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir, 
        mockNodeApiProjectAnalysis, 
        options
      );
      
      expect(createdFiles.length).toBeGreaterThan(6);
      expect(createdFiles).toEqual(
        expect.arrayContaining([
          'projectbrief.md',
          'features/authentication.md',
          'api/endpoints.md'
        ])
      );
      
      // Verify semantic folders exist
      await expect(fs.access(path.join(memoryBankDir, 'features'))).resolves.not.toThrow();
      await expect(fs.access(path.join(memoryBankDir, 'api'))).resolves.not.toThrow();
    });

    test('should generate additional files with flat organization', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const options: MemoryBankOptions = {
        detailLevel: 'detailed',
        focusAreas: ['features'],
        additionalFiles: ['features'],
        semanticOrganization: false
      };
      
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir, 
        mockReactProjectAnalysis, 
        options
      );
      
      expect(createdFiles.length).toBeGreaterThan(6);
      
      // Should have files at root level, not in semantic folders
      const additionalFiles = createdFiles.filter(f => !['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'].includes(f));
      additionalFiles.forEach(file => {
        expect(file).not.toContain('/');
      });
    });

    test('should create valid file content that can be read', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const options: MemoryBankOptions = {
        detailLevel: 'detailed',
        focusAreas: ['architecture'],
        additionalFiles: []
      };
      
      await generateMemoryBankFiles(memoryBankDir, mockReactProjectAnalysis, options);
      
      const projectBriefContent = await fs.readFile(
        path.join(memoryBankDir, 'projectbrief.md'), 
        'utf-8'
      );
      
      expect(projectBriefContent).toContain('# Project Brief');
      expect(projectBriefContent).toContain('test-react-project');
      expect(projectBriefContent.length).toBeGreaterThan(100);
    });

    test('should handle custom folder configurations', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const options: MemoryBankOptions = {
        detailLevel: 'detailed',
        focusAreas: ['custom'],
        additionalFiles: ['custom'],
        customFolders: [{
          name: 'custom',
          description: 'Custom documentation',
          filePatterns: ['custom-*.md']
        }]
      };
      
      const createdFiles = await generateMemoryBankFiles(
        memoryBankDir, 
        mockReactProjectAnalysis, 
        options
      );
      
      expect(createdFiles).toEqual(
        expect.arrayContaining(['custom/custom-docs.md'])
      );
    });
  });
});