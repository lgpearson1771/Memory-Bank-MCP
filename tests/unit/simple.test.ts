/**
 * Unit tests for MCP tools
 * Tests the core functionality of our Memory Bank MCP tools
 */

import { generateMemoryBankTool } from '../../dist/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../dist/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../dist/tools/validateMemoryBank.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('MCP Tools Unit Tests', () => {
  const testProjectPath = path.join(process.cwd(), 'temp-test-unit');

  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
    await fs.mkdir(testProjectPath, { recursive: true });
    
    // Create a minimal package.json for testing
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      description: 'Test project for MCP tools',
      dependencies: { 'express': '^4.18.0' }
    };
    
    await fs.writeFile(
      path.join(testProjectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Generate Memory Bank Tool', () => {
    test('should generate memory bank instructions', async () => {
      const result = await generateMemoryBankTool.handler({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0].text).toContain('Memory Bank Generation Instructions');
      expect(result.content[0].text).toContain('projectbrief.md');
      expect(result.content[0].text).toContain('test-project');
    });
  });

  describe('Update Memory Bank Tool', () => {
    test('should generate update instructions', async () => {
      const result = await handleUpdateMemoryBank({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0].text).toContain('Memory Bank Update Instructions');
      expect(result.content[0].text).toContain('Replace placeholder content');
      expect(result.content[0].text).toContain('TODO');
      expect(result.content[0].text).toContain('test-project');
    });
  });

  describe('Validate Memory Bank Tool', () => {
    test('should validate missing memory bank', async () => {
      const result = await handleValidateMemoryBank({
        projectRootPath: testProjectPath
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const jsonResult = JSON.parse(result.content[0].text);
      expect(jsonResult).toHaveProperty('status', 'invalid');
      expect(jsonResult).toHaveProperty('issues');
      expect(jsonResult.issues).toHaveLength(6); // 6 missing files
      expect(jsonResult).toHaveProperty('copilotIntegration', false);
    });

    test('should validate complete memory bank', async () => {
      // Create memory bank directory and files
      const memoryBankDir = path.join(testProjectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const coreFiles = [
        'projectbrief.md', 'productContext.md', 'activeContext.md',
        'systemPatterns.md', 'techContext.md', 'progress.md'
      ];
      
      // Create all required files
      for (const file of coreFiles) {
        await fs.writeFile(
          path.join(memoryBankDir, file), 
          `# ${file}\n\nSample content for ${file}`
        );
      }
      
      // Create copilot instructions
      const githubDir = path.join(testProjectPath, '.github');
      await fs.writeFile(
        path.join(githubDir, 'copilot-instructions.md'),
        '# Copilot Instructions\n\nMemory bank integration enabled.'
      );

      const result = await handleValidateMemoryBank({
        projectRootPath: testProjectPath
      });

      const jsonResult = JSON.parse(result.content[0].text);
      expect(jsonResult).toHaveProperty('status', 'valid');
      expect(jsonResult).toHaveProperty('fileCount', 6);
      expect(jsonResult).toHaveProperty('copilotIntegration', true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid project path gracefully', async () => {
      const invalidPath = '/nonexistent/path/that/does/not/exist';
      
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: invalidPath
      });
      
      expect(generateResult).toHaveProperty('isError', true);
      expect(generateResult.content[0].text).toContain('Error');
    });
  });
});