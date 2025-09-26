/**
 * Unit tests for MCP tools
 * Tests the core functionality of our Memory Bank MCP tools
 */

import { generateMemoryBankTool } from '../../src/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../src/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../src/tools/validateMemoryBank.js';
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
      
      // Create copilot instructions with proper memory bank references
      const githubDir = path.join(testProjectPath, '.github');
      const copilotInstructions = `# Copilot Instructions

# Memory Bank

I am GitHub Copilot, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

### Core Files (Required)
1. \`projectbrief.md\` ✅
2. \`productContext.md\` ✅  
3. \`activeContext.md\` ✅
4. \`systemPatterns.md\` ✅
5. \`techContext.md\` ✅
6. \`progress.md\` ✅

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
`;
      
      await fs.writeFile(
        path.join(githubDir, 'copilot-instructions.md'),
        copilotInstructions
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