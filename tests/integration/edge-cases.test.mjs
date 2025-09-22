#!/usr/bin/env node
/**
 * Edge Cases and Error Handling Integration Tests
 * Tests various edge cases, error conditions, and boundary scenarios
 */

import { generateMemoryBankTool } from '../../dist/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../dist/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../dist/tools/validateMemoryBank.js';
import { handleSetupCopilotInstructions } from '../../dist/tools/setupCopilotInstructions.js';
import { handleAnalyzeProjectStructure } from '../../dist/tools/analyzeProjectStructure.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Edge Cases Test Suite
 */
class EdgeCasesTestSuite {
  constructor() {
    this.testResults = [];
    this.baseTestPath = path.join(process.cwd(), 'temp-edge-cases-test');
  }

  async log(message) {
    console.log(message);
  }

  async createTestProject(projectName, structure = {}) {
    const projectPath = path.join(this.baseTestPath, projectName);
    
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
      
      if (typeof content === 'string') {
        await fs.writeFile(fullPath, content);
      }
    }
    
    return projectPath;
  }

  async cleanupTestProjects() {
    try {
      await fs.rm(this.baseTestPath, { recursive: true, force: true });
    } catch {}
  }

  async runTest(testName, testFunction) {
    await this.log(`\n📋 Testing: ${testName}`);
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED', result });
      await this.log(`✅ ${testName} - PASSED`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      await this.log(`❌ ${testName} - FAILED: ${error.message}`);
      return null;
    }
  }

  async testNonExistentProject() {
    return await this.runTest('Non-existent Project Path', async () => {
      const nonExistentPath = '/completely/fake/path/that/does/not/exist';
      
      // Test generate tool
      const generateResult = await generateMemoryBankTool.handler({
        projectRootPath: nonExistentPath
      });
      
      if (!generateResult.isError) {
        throw new Error('Expected error for non-existent path in generate tool');
      }
      
      if (!generateResult.content[0].text.includes('Error')) {
        throw new Error('Error message not properly formatted in generate tool');
      }
      
      // Test update tool
      const updateResult = await handleUpdateMemoryBank({
        projectRootPath: nonExistentPath
      });
      
      if (!updateResult.isError) {
        throw new Error('Expected error for non-existent path in update tool');
      }
      
      // Test validate tool
      const validateResult = await handleValidateMemoryBank({
        projectRootPath: nonExistentPath
      });
      
      const validation = JSON.parse(validateResult.content[0].text);
      if (validation.status !== 'invalid') {
        throw new Error('Expected invalid status for non-existent path');
      }

      return { generateError: true, updateError: true, validateInvalid: true };
    });
  }

  async testEmptyProject() {
    return await this.runTest('Empty Project Directory', async () => {
      const emptyProjectPath = await this.createTestProject('empty-project', {});
      
      try {
        // Test analysis of empty project
        const analysisResult = await handleAnalyzeProjectStructure({
          projectRootPath: emptyProjectPath,
          analysisDepth: 'shallow'
        });
        
        const analysisText = analysisResult.content[0].text;
        if (!analysisText.includes('package.json') && !analysisText.includes('Project Analysis') && !analysisText.includes('empty-project')) {
          throw new Error('Empty project analysis should mention project details');
        }
        
        // Test generation with empty project
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: emptyProjectPath
        });
        
        const instructions = generateResult.content[0].text;
        if (!instructions.includes('Memory Bank Generation Instructions')) {
          throw new Error('Should still provide instructions for empty project');
        }
        
        return { analysisHandled: true, generationHandled: true };
      } finally {
        await fs.rm(emptyProjectPath, { recursive: true, force: true });
      }
    });
  }

  async testProjectWithNoPackageJson() {
    return await this.runTest('Project Without package.json', async () => {
      const projectPath = await this.createTestProject('no-package-json', {
        'README.md': '# Test Project\n\nThis project has no package.json',
        'index.js': 'console.log("Hello World");',
        'src/app.js': 'module.exports = {};'
      });
      
      try {
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        const instructions = generateResult.content[0].text;
        
        // Should still work but indicate unknown project type
        if (!instructions.includes('Memory Bank Generation Instructions')) {
          throw new Error('Should provide instructions even without package.json');
        }
        
        if (!instructions.includes('Unknown') && !instructions.includes('Unspecified')) {
          throw new Error('Should indicate unknown/unspecified project type');
        }
        
        return { instructionsProvided: true, unknownTypeHandled: true };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testPartialMemoryBank() {
    return await this.runTest('Partial Memory Bank Validation', async () => {
      const projectPath = await this.createTestProject('partial-memory-bank', {
        'package.json': JSON.stringify({
          name: 'partial-test',
          version: '1.0.0',
          dependencies: { express: '^4.0.0' }
        }, null, 2),
        '.github/memory-bank/projectbrief.md': '# Project Brief\n\nPartial content',
        '.github/memory-bank/productContext.md': '# Product Context\n\nSome context',
        // Missing: activeContext.md, systemPatterns.md, techContext.md, progress.md
      });
      
      try {
        const validateResult = await handleValidateMemoryBank({
          projectRootPath: projectPath
        });
        
        const validation = JSON.parse(validateResult.content[0].text);
        
        if (validation.status !== 'invalid') {
          throw new Error('Partial memory bank should be invalid');
        }
        
        if (validation.fileCount !== 2) {
          throw new Error(`Expected 2 files found, got ${validation.fileCount}`);
        }
        
        const expectedMissing = 4; // 6 total files - 2 present files = 4 missing
        if (validation.issues.length < 4 || validation.issues.length > 5) {
          throw new Error(`Expected around ${expectedMissing} missing files, got ${validation.issues.length}`);
        }
        
        return { status: validation.status, presentFiles: validation.fileCount, missingFiles: validation.issues.length };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testCorruptedMemoryBankFiles() {
    return await this.runTest('Corrupted Memory Bank Files', async () => {
      const projectPath = await this.createTestProject('corrupted-memory-bank', {
        'package.json': JSON.stringify({ name: 'corrupted-test', version: '1.0.0' }, null, 2),
        '.github/memory-bank/projectbrief.md': '', // Empty file
        '.github/memory-bank/productContext.md': '   \n  \n  ', // Whitespace only
        '.github/memory-bank/activeContext.md': '# Title Only', // Minimal content
        '.github/memory-bank/systemPatterns.md': 'No markdown headers at all',
        '.github/memory-bank/techContext.md': '# Tech Context\n\nValid content here',
        '.github/memory-bank/progress.md': '# Progress\n\nMore valid content'
      });
      
      try {
        const validateResult = await handleValidateMemoryBank({
          projectRootPath: projectPath
        });
        
        const validation = JSON.parse(validateResult.content[0].text);
        
        // Should be valid since we only check for file presence now
        if (validation.status !== 'valid') {
          throw new Error('Should be valid - we only check file presence, not content quality');
        }
        
        if (validation.fileCount !== 6) {
          throw new Error(`Expected 6 files found, got ${validation.fileCount}`);
        }
        
        return { status: validation.status, fileCount: validation.fileCount };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testLargeProject() {
    return await this.runTest('Large Project with Many Files', async () => {
      const fileStructure = {
        'package.json': JSON.stringify({
          name: 'large-project',
          version: '1.0.0',
          description: 'A large project with many files',
          dependencies: {
            express: '^4.18.0',
            react: '^18.2.0',
            mongoose: '^7.0.0',
            lodash: '^4.17.21'
          }
        }, null, 2)
      };
      
      // Create many directories and files
      const dirs = ['src', 'lib', 'tests', 'docs', 'config', 'scripts', 'assets'];
      const fileTypes = ['.js', '.ts', '.json', '.md', '.css', '.html'];
      
      for (let i = 0; i < 50; i++) {
        const dir = dirs[i % dirs.length];
        const ext = fileTypes[i % fileTypes.length];
        const fileName = `file${i}${ext}`;
        fileStructure[`${dir}/${fileName}`] = `// Generated file ${i}\nconsole.log('File ${i}');`;
      }
      
      const projectPath = await this.createTestProject('large-project', fileStructure);
      
      try {
        const startTime = Date.now();
        
        const analysisResult = await handleAnalyzeProjectStructure({
          projectRootPath: projectPath,
          analysisDepth: 'deep'
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const analysisText = analysisResult.content[0].text;
        
        if (!analysisText.includes('large-project')) {
          throw new Error('Large project analysis missing project name');
        }
        
        if (duration > 10000) { // 10 seconds
          throw new Error(`Analysis took too long: ${duration}ms`);
        }
        
        // Test generation still works with large project
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        const instructions = generateResult.content[0].text;
        if (!instructions.includes('large-project')) {
          throw new Error('Generation failed for large project');
        }
        
        return { analysisTime: duration, fileCount: Object.keys(fileStructure).length };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testSpecialCharactersInPath() {
    return await this.runTest('Special Characters in Project Path', async () => {
      // Create project with special characters (spaces, unicode, etc.)
      const specialProjectName = 'test project with spaces & symbols 测试';
      const projectPath = await this.createTestProject(specialProjectName, {
        'package.json': JSON.stringify({
          name: 'special-chars-test',
          version: '1.0.0',
          description: 'Project with special characters in path'
        }, null, 2),
        'src/index.js': 'console.log("Special chars test");'
      });
      
      try {
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        const instructions = generateResult.content[0].text;
        if (!instructions.includes('special-chars-test')) {
          throw new Error('Failed to handle special characters in path');
        }
        
        return { pathHandled: true, projectName: 'special-chars-test' };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testConcurrentToolUsage() {
    return await this.runTest('Concurrent Tool Usage', async () => {
      const projectPath = await this.createTestProject('concurrent-test', {
        'package.json': JSON.stringify({
          name: 'concurrent-test',
          version: '1.0.0'
        }, null, 2),
        'src/index.js': 'console.log("Concurrent test");'
      });
      
      try {
        // Run multiple tools concurrently
        const promises = [
          generateMemoryBankTool.handler({ projectRootPath: projectPath }),
          handleAnalyzeProjectStructure({ projectRootPath: projectPath, analysisDepth: 'shallow' }),
          handleValidateMemoryBank({ projectRootPath: projectPath }),
          handleUpdateMemoryBank({ projectRootPath: projectPath })
        ];
        
        const results = await Promise.all(promises);
        
        // Verify all tools completed successfully
        for (let i = 0; i < results.length; i++) {
          if (results[i].isError) {
            throw new Error(`Tool ${i} failed in concurrent execution`);
          }
        }
        
        return { concurrentToolsCompleted: results.length };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async runAllTests() {
    await this.log('🧪 Starting Edge Cases and Error Handling Tests');
    await this.log('=' .repeat(60));

    try {
      await this.testNonExistentProject();
      await this.testEmptyProject();
      await this.testProjectWithNoPackageJson();
      await this.testPartialMemoryBank();
      await this.testCorruptedMemoryBankFiles();
      await this.testLargeProject();
      await this.testSpecialCharactersInPath();
      await this.testConcurrentToolUsage();
      
    } finally {
      await this.cleanupTestProjects();
    }

    // Report results
    await this.log('\n' + '='.repeat(60));
    await this.log('🏁 Edge Cases Test Results');
    await this.log('='.repeat(60));
    
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    
    for (const test of this.testResults) {
      const icon = test.status === 'PASSED' ? '✅' : '❌';
      await this.log(`${icon} ${test.name}: ${test.status}`);
    }
    
    await this.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      await this.log('\n🎉 All edge case tests passed! Error handling verified.');
      return true;
    } else {
      await this.log('\n⚠️ Some edge case tests failed. Check the errors above.');
      return false;
    }
  }
}

// Run the test suite
async function runEdgeCasesTests() {
  const suite = new EdgeCasesTestSuite();
  const success = await suite.runAllTests();
  process.exit(success ? 0 : 1);
}

// Export for potential programmatic use
export { EdgeCasesTestSuite };

// Run if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  runEdgeCasesTests().catch(console.error);
}