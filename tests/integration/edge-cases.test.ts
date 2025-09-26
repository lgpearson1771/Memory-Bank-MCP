/**
 * Edge Cases and Error Handling Integration Tests
 * Tests various edge cases, error conditions, and boundary scenarios
 */

import { generateMemoryBankTool } from '../../src/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../src/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../src/tools/validateMemoryBank.js';
import { handleAnalyzeProjectStructure } from '../../src/tools/analyzeProjectStructure.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Edge Cases and Error Handling Integration Tests', () => {
  const baseTestPath = path.join(process.cwd(), 'temp-edge-cases-test');

  afterAll(async () => {
    // Clean up all test projects
    try {
      await fs.rm(baseTestPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  async function createTestProject(projectName: string, structure: Record<string, string> = {}): Promise<string> {
    const projectPath = path.join(baseTestPath, projectName);
    
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch {}
    
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create custom structure
    for (const [filePath, content] of Object.entries(structure)) {
      const fullPath = path.join(projectPath, filePath);
      const dirPath = path.dirname(fullPath);
      
      if (dirPath !== projectPath) {
        await fs.mkdir(dirPath, { recursive: true });
      }
      
      await fs.writeFile(fullPath, content);
    }
    
    return projectPath;
  }

  describe('Non-existent Project Path', () => {
    test('should handle non-existent project path gracefully', async () => {
      const nonExistentPath = path.join(process.cwd(), 'this-path-does-not-exist-12345');
      
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: nonExistentPath
      });
      
      expect(generateResult).toHaveProperty('isError', true);
      expect(generateResult.content[0].text).toContain('Error');
      
      const analyzeResult = await handleAnalyzeProjectStructure({
        projectRootPath: nonExistentPath
      });
      
      expect(analyzeResult).toHaveProperty('content');
      const analysisResult = JSON.parse(analyzeResult.content[0].text);
      expect(analysisResult).toHaveProperty('status', 'Project analysis failed');
      expect(analysisResult).toHaveProperty('error');
    }, 10000);
  });

  describe('Empty Project Directory', () => {
    test('should handle empty project directory', async () => {
      const emptyProjectPath = await createTestProject('empty-project', {});
      
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: emptyProjectPath
      });
      
      expect(generateResult).toHaveProperty('content');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      expect(generateResult.content[0].text).toContain('empty-project');
      
      const analyzeResult = await handleAnalyzeProjectStructure({
        projectRootPath: emptyProjectPath
      });
      
      expect(analyzeResult).toHaveProperty('content');
      const analysisResult = JSON.parse(analyzeResult.content[0].text);
      expect(analysisResult).toHaveProperty('status', 'Project analysis completed');
    }, 10000);
  });

  describe('Project Without package.json', () => {
    test('should handle project without package.json', async () => {
      const noPackageJsonPath = await createTestProject('no-package-json', {
        'src/index.js': 'console.log("Hello World");',
        'README.md': '# Test Project\\n\\nA simple test project without package.json',
        'src/utils/helper.js': 'module.exports = { helper: () => "test" };'
      });
      
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: noPackageJsonPath
      });
      
      expect(generateResult).toHaveProperty('content');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      
      const analyzeResult = await handleAnalyzeProjectStructure({
        projectRootPath: noPackageJsonPath
      });
      
      expect(analyzeResult).toHaveProperty('content');
      const analysisResult = JSON.parse(analyzeResult.content[0].text);
      expect(analysisResult).toHaveProperty('status', 'Project analysis completed');
      expect(analysisResult.analysis.structure.sourceFiles.javascript.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Partial Memory Bank Validation', () => {
    test('should validate partially complete memory bank', async () => {
      const partialProjectPath = await createTestProject('partial-memory-bank', {
        'package.json': JSON.stringify({
          name: 'partial-test-project',
          version: '1.0.0',
          description: 'Test project with partial memory bank'
        }, null, 2)
      });
      
      // Create memory bank directory with only some files
      const memoryBankDir = path.join(partialProjectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      await fs.writeFile(
        path.join(memoryBankDir, 'projectbrief.md'),
        '# Partial Test Project\\n\\nThis is a partially complete memory bank.'
      );
      
      await fs.writeFile(
        path.join(memoryBankDir, 'productContext.md'),
        '# Product Context\\n\\nPartial product context information.'
      );
      
      // Missing: activeContext.md, systemPatterns.md, techContext.md, progress.md
      
      const result = await handleValidateMemoryBank({
        projectRootPath: partialProjectPath
      });
      
      expect(result).toHaveProperty('content');
      const validationResult = JSON.parse(result.content[0].text);
      
      expect(validationResult).toHaveProperty('status', 'invalid');
      expect(validationResult).toHaveProperty('fileCount', 2);
      expect(validationResult.issues.length).toBeGreaterThan(0);
      expect(validationResult).toHaveProperty('copilotIntegration', false);
      
      // Should identify missing files
      const missingFiles = validationResult.issues.filter((issue: any) => issue.type === 'missing_file');
      expect(missingFiles.length).toBe(4); // 4 missing core files
    }, 10000);
  });

  describe('Corrupted Memory Bank Files', () => {
    test('should handle corrupted memory bank files', async () => {
      const corruptedProjectPath = await createTestProject('corrupted-memory-bank', {
        'package.json': JSON.stringify({
          name: 'corrupted-test-project',
          version: '1.0.0'
        }, null, 2)
      });
      
      // Create memory bank directory with corrupted/invalid files
      const memoryBankDir = path.join(corruptedProjectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Create files with unusual content
      const corruptedFiles = [
        { name: 'projectbrief.md', content: '' }, // Empty file
        { name: 'productContext.md', content: '\\x00\\x01\\x02INVALID' }, // Binary content
        { name: 'activeContext.md', content: 'Very short' }, // Too short
        { name: 'systemPatterns.md', content: '#'.repeat(10000) }, // Extremely long
        { name: 'techContext.md', content: 'Normal content here' },
        { name: 'progress.md', content: '# Progress\\n\\nSome progress info' }
      ];
      
      for (const file of corruptedFiles) {
        await fs.writeFile(
          path.join(memoryBankDir, file.name),
          file.content
        );
      }
      
      const result = await handleValidateMemoryBank({
        projectRootPath: corruptedProjectPath
      });
      
      expect(result).toHaveProperty('content');
      const validationResult = JSON.parse(result.content[0].text);
      
      expect(validationResult).toHaveProperty('fileCount', 6);
      // The validation should still work, but may flag quality issues
      expect(validationResult).toHaveProperty('status');
    }, 10000);
  });

  describe('Large Project with Many Files', () => {
    test('should handle large project with many files', async () => {
      const largeProjectPath = await createTestProject('large-project', {
        'package.json': JSON.stringify({
          name: 'large-test-project',
          version: '2.0.0',
          description: 'A large project with many files'
        }, null, 2)
      });
      
      // Create many files and directories
      const fileStructure: Record<string, string> = {};
      
      // Create 50 source files
      for (let i = 1; i <= 50; i++) {
        fileStructure[`src/components/Component${i}.js`] = `// Component ${i}\\nexport default function Component${i}() { return null; }`;
        fileStructure[`src/utils/util${i}.js`] = `// Utility ${i}\\nexport const util${i} = () => ${i};`;
      }
      
      // Create test files
      for (let i = 1; i <= 25; i++) {
        fileStructure[`tests/unit/test${i}.spec.js`] = `// Test ${i}\\ndescribe('Test ${i}', () => { it('works', () => {}); });`;
      }
      
      // Create config and documentation files
      fileStructure['README.md'] = '# Large Test Project\\n\\nA project with many files for testing performance.';
      fileStructure['CONTRIBUTING.md'] = '# Contributing Guidelines\\n\\nHow to contribute to this project.';
      fileStructure['docs/api.md'] = '# API Documentation\\n\\nAPI reference for the project.';
      fileStructure['config/webpack.config.js'] = '// Webpack configuration';
      fileStructure['config/babel.config.js'] = '// Babel configuration';
      
      // Create the files
      for (const [filePath, content] of Object.entries(fileStructure)) {
        const fullPath = path.join(largeProjectPath, filePath);
        const dirPath = path.dirname(fullPath);
        
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(fullPath, content);
      }
      
      // Test performance with large project
      const startTime = Date.now();
      
      const analyzeResult = await handleAnalyzeProjectStructure({
        projectRootPath: largeProjectPath
      });
      
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: largeProjectPath
      });
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(analyzeResult).toHaveProperty('content');
      expect(generateResult).toHaveProperty('content');
      const analysisResult = JSON.parse(analyzeResult.content[0].text);
      expect(analysisResult.analysis.projectName).toContain('large-test-project');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      
      // Performance assertion - should handle large projects reasonably quickly
      expect(executionTime).toBeLessThan(5000); // Less than 5 seconds
    }, 15000);
  });

  describe('Special Characters in Project Path', () => {
    test('should handle special characters in project path', async () => {
      // Note: Some special characters may not be valid in all file systems
      const specialProjectPath = await createTestProject('special-chars-áéíóú-project', {
        'package.json': JSON.stringify({
          name: 'special-chars-project',
          version: '1.0.0',
          description: 'Project with special characters: áéíóú ñ 中文 🚀'
        }, null, 2),
        'src/café.js': '// File with special chars\\nexport const café = "coffee";',
        'README.md': '# Special Characters Test 🚀\\n\\nTesting special characters: áéíóú ñ 中文'
      });
      
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: specialProjectPath
      });
      
      expect(generateResult).toHaveProperty('content');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      expect(generateResult.content[0].text).toContain('special-chars-project');
      
      const analyzeResult = await handleAnalyzeProjectStructure({
        projectRootPath: specialProjectPath
      });
      
      expect(analyzeResult).toHaveProperty('content');
      const analysisResult = JSON.parse(analyzeResult.content[0].text);
      expect(analysisResult).toHaveProperty('status', 'Project analysis completed');
    }, 10000);
  });

  describe('Concurrent Tool Usage', () => {
    test('should handle concurrent tool usage safely', async () => {
      const concurrentProjectPath = await createTestProject('concurrent-project', {
        'package.json': JSON.stringify({
          name: 'concurrent-test-project',
          version: '1.0.0',
          description: 'Testing concurrent operations'
        }, null, 2),
        'src/index.js': 'console.log("Concurrent test");'
      });
      
      // Run multiple operations concurrently
      const operations = [
        handleAnalyzeProjectStructure({ projectRootPath: concurrentProjectPath }),
        generateMemoryBankTool.handler({ projectRootPath: concurrentProjectPath }),
        handleValidateMemoryBank({ projectRootPath: concurrentProjectPath }),
        handleUpdateMemoryBank({ projectRootPath: concurrentProjectPath })
      ];
      
      const results = await Promise.all(operations);
      
      // All operations should complete successfully
      for (const result of results) {
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0]).toHaveProperty('text');
        expect(result.content[0].text.length).toBeGreaterThan(0);
      }
      
      // Specific checks for each result
      const analysisResult = JSON.parse(results[0].content[0].text);
      expect(analysisResult).toHaveProperty('status', 'Project analysis completed');
      expect(results[1].content[0].text).toContain('Memory Bank Generation Instructions');
      // Results[2] and [3] will vary based on current state, but should not error
    }, 15000);
  });
});