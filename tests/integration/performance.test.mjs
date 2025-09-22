#!/usr/bin/env node
/**
 * Performance and Load Integration Tests
 * Tests performance characteristics and load handling of MCP tools
 */

import { generateMemoryBankTool } from '../../dist/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../dist/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../dist/tools/validateMemoryBank.js';
import { handleAnalyzeProjectStructure } from '../../dist/tools/analyzeProjectStructure.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Performance Test Suite
 */
class PerformanceTestSuite {
  constructor() {
    this.testResults = [];
    this.baseTestPath = path.join(process.cwd(), 'temp-performance-test');
  }

  async log(message) {
    console.log(message);
  }

  async createProjectOfSize(projectName, fileCount, complexity = 'medium') {
    const projectPath = path.join(this.baseTestPath, projectName);
    
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch {}
    
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: `Performance test project with ${fileCount} files`,
      dependencies: {},
      devDependencies: {}
    };
    
    // Add dependencies based on complexity
    if (complexity === 'high') {
      packageJson.dependencies = {
        express: '^4.18.0',
        react: '^18.2.0',
        'socket.io': '^4.7.0',
        mongoose: '^7.5.0',
        lodash: '^4.17.21',
        axios: '^1.5.0',
        moment: '^2.29.4',
        uuid: '^9.0.0'
      };
      packageJson.devDependencies = {
        jest: '^29.6.0',
        webpack: '^5.88.0',
        babel: '^6.23.0',
        eslint: '^8.48.0'
      };
    } else if (complexity === 'medium') {
      packageJson.dependencies = {
        express: '^4.18.0',
        lodash: '^4.17.21',
        axios: '^1.5.0'
      };
      packageJson.devDependencies = {
        jest: '^29.6.0'
      };
    }
    
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create directory structure
    const dirs = ['src', 'lib', 'components', 'utils', 'services', 'models', 'controllers', 'middleware', 'tests', 'docs'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }
    
    // Generate files
    const fileTypes = [
      { ext: '.js', template: 'const module = {};\nmodule.exports = module;' },
      { ext: '.ts', template: 'export interface TestInterface {}\nexport class TestClass {}' },
      { ext: '.json', template: '{"test": "data", "number": 42}' },
      { ext: '.md', template: '# Documentation\n\nThis is a test file.' },
      { ext: '.css', template: '.test { color: blue; background: white; }' },
      { ext: '.html', template: '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>' }
    ];
    
    for (let i = 0; i < fileCount; i++) {
      const dir = dirs[i % dirs.length];
      const fileType = fileTypes[i % fileTypes.length];
      const fileName = `file${i}${fileType.ext}`;
      const filePath = path.join(projectPath, dir, fileName);
      
      let content = fileType.template;
      if (complexity === 'high') {
        // Add more content for high complexity
        content += `\n// Generated content ${i}\n${'// More content\n'.repeat(10)}`;
      }
      
      await fs.writeFile(filePath, content);
    }
    
    return projectPath;
  }

  async cleanupTestProjects() {
    try {
      await fs.rm(this.baseTestPath, { recursive: true, force: true });
    } catch {}
  }

  async runPerformanceTest(testName, testFunction) {
    await this.log(`\n⏱️ Performance Test: ${testName}`);
    try {
      const startTime = process.hrtime.bigint();
      const result = await testFunction();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      result.duration = duration;
      this.testResults.push({ name: testName, status: 'PASSED', result });
      await this.log(`✅ ${testName} - PASSED (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      await this.log(`❌ ${testName} - FAILED: ${error.message}`);
      return null;
    }
  }

  async testSmallProjectPerformance() {
    return await this.runPerformanceTest('Small Project (10 files)', async () => {
      const projectPath = await this.createProjectOfSize('small-project', 10, 'medium');
      
      try {
        const analysisResult = await handleAnalyzeProjectStructure({
          projectRootPath: projectPath,
          analysisDepth: 'shallow'
        });
        
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        if (generateResult.isError) {
          throw new Error('Generation failed for small project');
        }
        
        return { 
          projectSize: 10, 
          analysisLength: analysisResult.content[0].text.length,
          instructionsLength: generateResult.content[0].text.length
        };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testMediumProjectPerformance() {
    return await this.runPerformanceTest('Medium Project (100 files)', async () => {
      const projectPath = await this.createProjectOfSize('medium-project', 100, 'medium');
      
      try {
        const analysisResult = await handleAnalyzeProjectStructure({
          projectRootPath: projectPath,
          analysisDepth: 'medium'
        });
        
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        if (generateResult.isError) {
          throw new Error('Generation failed for medium project');
        }
        
        return { 
          projectSize: 100,
          analysisLength: analysisResult.content[0].text.length,
          instructionsLength: generateResult.content[0].text.length
        };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testLargeProjectPerformance() {
    return await this.runPerformanceTest('Large Project (500 files)', async () => {
      const projectPath = await this.createProjectOfSize('large-project', 500, 'high');
      
      try {
        const analysisResult = await handleAnalyzeProjectStructure({
          projectRootPath: projectPath,
          analysisDepth: 'deep'
        });
        
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        if (generateResult.isError) {
          throw new Error('Generation failed for large project');
        }
        
        return { 
          projectSize: 500,
          analysisLength: analysisResult.content[0].text.length,
          instructionsLength: generateResult.content[0].text.length
        };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testMemoryUsage() {
    return await this.runPerformanceTest('Memory Usage Test', async () => {
      const initialMemory = process.memoryUsage();
      
      const projectPath = await this.createProjectOfSize('memory-test', 200, 'high');
      
      try {
        // Run multiple operations to stress memory
        for (let i = 0; i < 5; i++) {
          await generateMemoryBankTool.handler({ projectRootPath: projectPath });
          await handleAnalyzeProjectStructure({ projectRootPath: projectPath, analysisDepth: 'deep' });
          await handleValidateMemoryBank({ projectRootPath: projectPath });
        }
        
        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        
        // Memory increase should be reasonable (less than 100MB)
        if (memoryIncrease > 100 * 1024 * 1024) {
          throw new Error(`Excessive memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
        }
        
        return {
          initialMemoryMB: (initialMemory.heapUsed / 1024 / 1024).toFixed(2),
          finalMemoryMB: (finalMemory.heapUsed / 1024 / 1024).toFixed(2),
          increaseMB: (memoryIncrease / 1024 / 1024).toFixed(2)
        };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testConcurrentRequests() {
    return await this.runPerformanceTest('Concurrent Requests Test', async () => {
      const projectPath = await this.createProjectOfSize('concurrent-test', 50, 'medium');
      
      try {
        // Run 10 concurrent requests
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(generateMemoryBankTool.handler({ projectRootPath: projectPath }));
        }
        
        const results = await Promise.all(promises);
        
        // Verify all requests completed successfully
        for (const result of results) {
          if (result.isError) {
            throw new Error('Concurrent request failed');
          }
        }
        
        return { concurrentRequests: promises.length, allSuccessful: true };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testDeepDirectoryNesting() {
    return await this.runPerformanceTest('Deep Directory Nesting', async () => {
      const projectPath = await this.createProjectOfSize('nested-test', 20, 'low');
      
      // Create deeply nested structure
      let currentPath = projectPath;
      for (let i = 0; i < 15; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        await fs.mkdir(currentPath, { recursive: true });
        await fs.writeFile(path.join(currentPath, `file${i}.js`), `// Nested file at level ${i}`);
      }
      
      try {
        const analysisResult = await handleAnalyzeProjectStructure({
          projectRootPath: projectPath,
          analysisDepth: 'deep'
        });
        
        const generateResult = await generateMemoryBankTool.handler({
          projectRootPath: projectPath
        });
        
        if (generateResult.isError) {
          throw new Error('Generation failed for deeply nested project');
        }
        
        return { nestingLevels: 15, analysisCompleted: true };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async testValidationPerformance() {
    return await this.runPerformanceTest('Validation Performance', async () => {
      const projectPath = await this.createProjectOfSize('validation-test', 30, 'medium');
      
      // Create memory bank with all files
      const memoryBankDir = path.join(projectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const files = ['projectbrief.md', 'productContext.md', 'activeContext.md', 
                     'systemPatterns.md', 'techContext.md', 'progress.md'];
      
      for (const file of files) {
        await fs.writeFile(path.join(memoryBankDir, file), `# ${file}\n\nTest content for ${file}`);
      }
      
      try {
        // Run validation multiple times to test consistency
        const validationTimes = [];
        for (let i = 0; i < 5; i++) {
          const startTime = process.hrtime.bigint();
          await handleValidateMemoryBank({ projectRootPath: projectPath });
          const endTime = process.hrtime.bigint();
          validationTimes.push(Number(endTime - startTime) / 1000000);
        }
        
        const avgTime = validationTimes.reduce((a, b) => a + b, 0) / validationTimes.length;
        const maxTime = Math.max(...validationTimes);
        const minTime = Math.min(...validationTimes);
        
        return { 
          avgValidationTime: avgTime.toFixed(2),
          maxValidationTime: maxTime.toFixed(2),
          minValidationTime: minTime.toFixed(2),
          consistency: (maxTime - minTime < 100) // Within 100ms
        };
      } finally {
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    });
  }

  async runAllTests() {
    await this.log('⚡ Starting Performance and Load Tests');
    await this.log('=' .repeat(50));

    try {
      await this.testSmallProjectPerformance();
      await this.testMediumProjectPerformance();
      await this.testLargeProjectPerformance();
      await this.testMemoryUsage();
      await this.testConcurrentRequests();
      await this.testDeepDirectoryNesting();
      await this.testValidationPerformance();
      
    } finally {
      await this.cleanupTestProjects();
    }

    // Report results
    await this.log('\n' + '='.repeat(50));
    await this.log('🏁 Performance Test Results');
    await this.log('='.repeat(50));
    
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    
    for (const test of this.testResults) {
      const icon = test.status === 'PASSED' ? '✅' : '❌';
      const duration = test.result?.duration ? ` (${test.result.duration.toFixed(2)}ms)` : '';
      await this.log(`${icon} ${test.name}: ${test.status}${duration}`);
    }
    
    await this.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
    
    // Performance analysis
    const passedTests = this.testResults.filter(t => t.status === 'PASSED' && t.result?.duration);
    if (passedTests.length > 0) {
      const totalTime = passedTests.reduce((sum, test) => sum + test.result.duration, 0);
      const avgTime = totalTime / passedTests.length;
      await this.log(`⏱️ Average test duration: ${avgTime.toFixed(2)}ms`);
      
      const slowest = passedTests.reduce((prev, current) => 
        (prev.result.duration > current.result.duration) ? prev : current
      );
      await this.log(`🐌 Slowest test: ${slowest.name} (${slowest.result.duration.toFixed(2)}ms)`);
    }
    
    if (failed === 0) {
      await this.log('\n🎉 All performance tests passed! System performance verified.');
      return true;
    } else {
      await this.log('\n⚠️ Some performance tests failed. Check the errors above.');
      return false;
    }
  }
}

// Run the test suite
async function runPerformanceTests() {
  const suite = new PerformanceTestSuite();
  const success = await suite.runAllTests();
  process.exit(success ? 0 : 1);
}

// Export for potential programmatic use
export { PerformanceTestSuite };

// Run if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  runPerformanceTests().catch(console.error);
}