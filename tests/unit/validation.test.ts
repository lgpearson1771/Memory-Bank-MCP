import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  validateMemoryBank,
  validateCopilotSync,
  discoverAllMemoryBankFiles
} from '../../src/core/validation.js';

describe('Validation Module', () => {
  const testTempDir = path.join(process.cwd(), 'temp', 'test', 'unit');
  
  beforeEach(async () => {
    await fs.mkdir(testTempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testTempDir, { recursive: true, force: true });
  });

  describe('validateMemoryBank', () => {
    test('should validate complete memory bank correctly', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create all required core files
      const coreFiles = [
        'projectbrief.md',
        'productContext.md',
        'activeContext.md',
        'systemPatterns.md',
        'techContext.md',
        'progress.md'
      ];
      
      for (const file of coreFiles) {
        await fs.writeFile(
          path.join(memoryBankDir, file),
          `# ${file.replace('.md', '')}\n\nTest content for ${file}`
        );
      }
      
      const result = await validateMemoryBank(memoryBankDir);
      
      expect(result.isValid).toBe(true);
      expect(result.coreFilesPresent).toHaveLength(6);
      expect(result.missingFiles).toHaveLength(0);
      expect(result.coreFilesPresent).toEqual(expect.arrayContaining(coreFiles));
    });

    test('should identify missing core files', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create only some files
      await fs.writeFile(path.join(memoryBankDir, 'projectbrief.md'), '# Project Brief');
      await fs.writeFile(path.join(memoryBankDir, 'progress.md'), '# Progress');
      
      const result = await validateMemoryBank(memoryBankDir);
      
      expect(result.isValid).toBe(false);
      expect(result.coreFilesPresent).toHaveLength(2);
      expect(result.missingFiles).toHaveLength(4);
      expect(result.missingFiles).toEqual(expect.arrayContaining([
        'productContext.md',
        'activeContext.md',
        'systemPatterns.md',
        'techContext.md'
      ]));
    });

    test('should detect semantic folder structure', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      await fs.mkdir(path.join(memoryBankDir, 'features'), { recursive: true });
      await fs.mkdir(path.join(memoryBankDir, 'api'), { recursive: true });
      
      // Create core files
      const coreFiles = [
        'projectbrief.md',
        'productContext.md',
        'activeContext.md',
        'systemPatterns.md',
        'techContext.md',
        'progress.md'
      ];
      
      for (const file of coreFiles) {
        await fs.writeFile(path.join(memoryBankDir, file), `# ${file}`);
      }
      
      // Create semantic folder files
      await fs.writeFile(path.join(memoryBankDir, 'features', 'auth.md'), '# Authentication');
      await fs.writeFile(path.join(memoryBankDir, 'api', 'endpoints.md'), '# API Endpoints');
      
      const result = await validateMemoryBank(memoryBankDir);
      
      expect(result.isValid).toBe(true);
      expect(result.structureCompliance?.hasSemanticFolders).toBe(true);
      expect(result.structureCompliance?.folderCount).toBe(2);
      expect(result.structureCompliance?.organization).toBe('semantic');
    });

    test('should detect flat organization structure', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create all files at root level
      const allFiles = [
        'projectbrief.md',
        'productContext.md',
        'activeContext.md',
        'systemPatterns.md',
        'techContext.md',
        'progress.md',
        'additional-features.md',
        'api-docs.md'
      ];
      
      for (const file of allFiles) {
        await fs.writeFile(path.join(memoryBankDir, file), `# ${file}`);
      }
      
      const result = await validateMemoryBank(memoryBankDir);
      
      expect(result.isValid).toBe(true);
      expect(result.structureCompliance?.hasSemanticFolders).toBe(false);
      expect(result.structureCompliance?.organization).toBe('flat');
      expect(result.structureCompliance?.totalFiles).toBe(8);
    });

    test('should handle non-existent memory bank directory', async () => {
      const nonExistentDir = path.join(testTempDir, 'non-existent');
      
      const result = await validateMemoryBank(nonExistentDir);
      
      expect(result.isValid).toBe(false);
      expect(result.coreFilesPresent).toHaveLength(0);
      expect(result.missingFiles).toHaveLength(6);
    });

    test('should count additional files correctly', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create core files
      const coreFiles = [
        'projectbrief.md',
        'productContext.md',
        'activeContext.md',
        'systemPatterns.md',
        'techContext.md',
        'progress.md'
      ];
      
      for (const file of coreFiles) {
        await fs.writeFile(path.join(memoryBankDir, file), `# ${file}`);
      }
      
      // Create additional files
      await fs.writeFile(path.join(memoryBankDir, 'extra1.md'), '# Extra 1');
      await fs.writeFile(path.join(memoryBankDir, 'extra2.md'), '# Extra 2');
      await fs.writeFile(path.join(memoryBankDir, 'non-md.txt'), 'Not markdown');
      
      const result = await validateMemoryBank(memoryBankDir);
      
      expect(result.isValid).toBe(true);
      expect(result.additionalFiles).toHaveLength(2);
      expect(result.additionalFiles).toEqual(['extra1.md', 'extra2.md']);
    });
  });

  describe('discoverAllMemoryBankFiles', () => {
    test('should discover all markdown files recursively', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      await fs.mkdir(path.join(memoryBankDir, 'features'), { recursive: true });
      await fs.mkdir(path.join(memoryBankDir, 'api', 'nested'), { recursive: true });
      
      // Create files at different levels
      await fs.writeFile(path.join(memoryBankDir, 'root.md'), '# Root');
      await fs.writeFile(path.join(memoryBankDir, 'features', 'feature1.md'), '# Feature 1');
      await fs.writeFile(path.join(memoryBankDir, 'api', 'endpoints.md'), '# Endpoints');
      await fs.writeFile(path.join(memoryBankDir, 'api', 'nested', 'deep.md'), '# Deep');
      await fs.writeFile(path.join(memoryBankDir, 'not-markdown.txt'), 'Text file');
      
      const files = await discoverAllMemoryBankFiles(memoryBankDir);
      
      expect(files).toHaveLength(4);
      expect(files).toEqual(expect.arrayContaining([
        'root.md',
        'features/feature1.md',
        'api/endpoints.md',
        'api/nested/deep.md'
      ]));
      expect(files).not.toContain('not-markdown.txt');
    });

    test('should handle empty directory', async () => {
      const emptyDir = path.join(testTempDir, 'empty');
      await fs.mkdir(emptyDir, { recursive: true });
      
      const files = await discoverAllMemoryBankFiles(emptyDir);
      
      expect(files).toHaveLength(0);
    });

    test('should handle non-existent directory', async () => {
      const nonExistentDir = path.join(testTempDir, 'non-existent');
      
      const files = await discoverAllMemoryBankFiles(nonExistentDir);
      
      expect(files).toHaveLength(0);
    });
  });

  describe('validateCopilotSync', () => {
    test('should detect missing copilot-instructions.md', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      const projectRoot = path.join(testTempDir);
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create memory bank files but no copilot instructions
      await fs.writeFile(path.join(memoryBankDir, 'projectbrief.md'), '# Project Brief');
      
      const result = await validateCopilotSync(memoryBankDir, projectRoot);
      
      expect(result.isInSync).toBe(false);
      expect(result.memoryBankFiles).toContain('projectbrief.md');
      expect(result.copilotReferences).toHaveLength(0);
    });

    test('should detect unreferenced memory bank files', async () => {
      const memoryBankDir = path.join(testTempDir, '.github', 'memory-bank');
      const githubDir = path.join(testTempDir, '.github');
      const projectRoot = path.join(testTempDir);
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create memory bank files
      await fs.writeFile(path.join(memoryBankDir, 'projectbrief.md'), '# Project Brief');
      await fs.writeFile(path.join(memoryBankDir, 'unreferenced.md'), '# Unreferenced');
      
      // Create copilot instructions that only reference one file
      const copilotInstructions = `
        # Copilot Instructions
        See projectbrief.md for project overview.
      `;
      await fs.writeFile(path.join(githubDir, 'copilot-instructions.md'), copilotInstructions);
      
      const result = await validateCopilotSync(memoryBankDir, projectRoot);
      
      expect(result.isInSync).toBe(false);
      expect(result.missingReferences).toContain('unreferenced.md');
      expect(result.copilotReferences).toContain('projectbrief.md');
    });

    test('should handle projects without memory bank', async () => {
      const nonExistentMemoryBank = path.join(testTempDir, '.github', 'memory-bank');
      const projectRoot = path.join(testTempDir);
      
      const result = await validateCopilotSync(nonExistentMemoryBank, projectRoot);
      
      expect(result.memoryBankFiles).toHaveLength(0);
      expect(result.isInSync).toBe(false);
    });
  });
});