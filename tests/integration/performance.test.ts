/**
 * Performance and Load Integration Tests
 * Tests performance characteristics and load handling of MCP tools
 */

import { generateMemoryBankTool } from '../../src/tools/generateMemoryBank.js';
import { handleUpdateMemoryBank } from '../../src/tools/updateMemoryBank.js';
import { handleValidateMemoryBank } from '../../src/tools/validateMemoryBank.js';
import { handleAnalyzeProjectStructure } from '../../src/tools/analyzeProjectStructure.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Performance and Load Integration Tests', () => {
  const baseTestPath = path.join(process.cwd(), 'temp-performance-test');

  afterAll(async () => {
    // Clean up all test projects
    try {
      await fs.rm(baseTestPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  async function createProjectOfSize(projectName: string, fileCount: number, complexity: 'simple' | 'medium' | 'complex' = 'medium'): Promise<string> {
    const projectPath = path.join(baseTestPath, projectName);
    
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch {}
    
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create package.json with dependencies based on complexity
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};
    
    if (complexity === 'medium' || complexity === 'complex') {
      dependencies.express = '^4.18.2';
      dependencies.lodash = '^4.17.21';
      devDependencies.jest = '^29.6.4';
      devDependencies.webpack = '^5.88.2';
    }
    
    if (complexity === 'complex') {
      dependencies.react = '^18.2.0';
      dependencies['@types/node'] = '^20.5.0';
      dependencies.typescript = '^5.1.6';
      devDependencies['@babel/core'] = '^7.22.9';
      devDependencies['eslint'] = '^8.45.0';
    }
    
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: `Performance test project with ${fileCount} files`,
      dependencies,
      devDependencies,
      scripts: {
        start: 'node src/index.js',
        test: 'jest',
        build: 'webpack'
      }
    };
    
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create README
    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      `# ${projectName}\\n\\nA performance test project with ${fileCount} files for testing MCP tool performance.\\n\\n## Description\\n\\nThis project is automatically generated to test the performance characteristics of Memory Bank MCP tools.\\n\\n## Features\\n\\n- ${fileCount} source files\\n- Complexity level: ${complexity}\\n- Generated for performance testing`
    );
    
    // Create directories
    const directories = ['src', 'tests', 'docs', 'config'];
    for (const dir of directories) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }
    
    // Generate files based on count
    let createdFiles = 2; // package.json and README.md already created
    
    for (let i = 1; i <= fileCount && createdFiles < fileCount; i++) {
      // Create source files
      if (createdFiles < fileCount) {
        const sourceContent = complexity === 'simple' 
          ? `// Simple file ${i}\\nexport const value${i} = ${i};`
          : complexity === 'medium'
          ? `// Module ${i}\\nimport { helper } from './utils';\\n\\nexport class Component${i} {\\n  constructor() {\\n    this.id = ${i};\\n    this.data = helper.process(${i});\\n  }\\n\\n  render() {\\n    return \`<div>Component ${i}: \${this.data}</div>\`;\\n  }\\n}`
          : `// Complex component ${i}\\nimport React, { useState, useEffect } from 'react';\\nimport { connect } from 'react-redux';\\nimport { fetchData, updateData } from '../actions';\\n\\ninterface Props {\\n  id: number;\\n  data: any[];\\n  onUpdate: (data: any) => void;\\n}\\n\\nconst Component${i}: React.FC<Props> = ({ id, data, onUpdate }) => {\\n  const [loading, setLoading] = useState(false);\\n  const [error, setError] = useState<string | null>(null);\\n\\n  useEffect(() => {\\n    setLoading(true);\\n    fetchData(id)\\n      .then(result => {\\n        onUpdate(result);\\n        setLoading(false);\\n      })\\n      .catch(err => {\\n        setError(err.message);\\n        setLoading(false);\\n      });\\n  }, [id]);\\n\\n  if (loading) return <div>Loading...</div>;\\n  if (error) return <div>Error: {error}</div>;\\n\\n  return (\\n    <div className=\\"component-${i}\\">\\n      <h3>Component ${i}</h3>\\n      <pre>{JSON.stringify(data, null, 2)}</pre>\\n    </div>\\n  );\\n};\\n\\nexport default connect(mapStateToProps, mapDispatchToProps)(Component${i});`;
        
        const extension = complexity === 'complex' ? '.tsx' : '.js';
        await fs.writeFile(
          path.join(projectPath, 'src', `component${i}${extension}`),
          sourceContent
        );
        createdFiles++;
      }
      
      // Create test files (every 3rd iteration)
      if (i % 3 === 0 && createdFiles < fileCount) {
        const testContent = `// Test for component ${i}\\nimport Component${i} from '../src/component${i}';\\n\\ndescribe('Component${i}', () => {\\n  it('should render correctly', () => {\\n    expect(true).toBe(true);\\n  });\\n\\n  it('should handle props', () => {\\n    expect(true).toBe(true);\\n  });\\n});`;
        
        await fs.writeFile(
          path.join(projectPath, 'tests', `component${i}.test.js`),
          testContent
        );
        createdFiles++;
      }
      
      // Create utility files (every 5th iteration)
      if (i % 5 === 0 && createdFiles < fileCount) {
        const utilContent = `// Utility ${i}\\nexport const util${i} = {\\n  process: (data) => data * ${i},\\n  format: (value) => \`Util${i}: \${value}\`,\\n  validate: (input) => input !== null && input !== undefined\\n};`;
        
        await fs.writeFile(
          path.join(projectPath, 'src', `util${i}.js`),
          utilContent
        );
        createdFiles++;
      }
      
      // Create config files (every 10th iteration)
      if (i % 10 === 0 && createdFiles < fileCount) {
        const configContent = `// Configuration ${i}\\nexport default {\\n  name: 'config${i}',\\n  version: '${i}.0.0',\\n  settings: {\\n    debug: ${i % 2 === 0},\\n    maxItems: ${i * 10},\\n    timeout: ${i * 1000}\\n  }\\n};`;
        
        await fs.writeFile(
          path.join(projectPath, 'config', `config${i}.js`),
          configContent
        );
        createdFiles++;
      }
    }
    
    return projectPath;
  }

  async function measurePerformance<T>(testName: string, operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await operation();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ ${testName}: ${duration}ms`);
    
    return { result, duration };
  }

  describe('Small Project Performance (10 files)', () => {
    test('should handle small project efficiently', async () => {
      const projectPath = await createProjectOfSize('small-perf-project', 10, 'simple');
      
      const { result: analyzeResult, duration: analyzeDuration } = await measurePerformance(
        'Analyze small project',
        () => handleAnalyzeProjectStructure({ projectRootPath: projectPath })
      );
      
      const { result: generateResult, duration: generateDuration } = await measurePerformance(
        'Generate memory bank for small project',
        () => generateMemoryBankTool.handler({ projectRootPath: projectPath })
      );
      
      expect(analyzeResult).toHaveProperty('content');
      expect(generateResult).toHaveProperty('content');
      expect(analyzeResult.content[0].text).toContain('small-perf-project');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      
      // Performance assertions for small projects
      expect(analyzeDuration).toBeLessThan(1000); // < 1 second
      expect(generateDuration).toBeLessThan(2000); // < 2 seconds
    }, 10000);
  });

  describe('Medium Project Performance (100 files)', () => {
    test('should handle medium project with good performance', async () => {
      const projectPath = await createProjectOfSize('medium-perf-project', 100, 'medium');
      
      const { result: analyzeResult, duration: analyzeDuration } = await measurePerformance(
        'Analyze medium project',
        () => handleAnalyzeProjectStructure({ projectRootPath: projectPath })
      );
      
      const { result: generateResult, duration: generateDuration } = await measurePerformance(
        'Generate memory bank for medium project',
        () => generateMemoryBankTool.handler({ projectRootPath: projectPath })
      );
      
      expect(analyzeResult).toHaveProperty('content');
      expect(generateResult).toHaveProperty('content');
      expect(analyzeResult.content[0].text).toContain('medium-perf-project');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      
      // Performance assertions for medium projects  
      expect(analyzeDuration).toBeLessThan(3000); // < 3 seconds
      expect(generateDuration).toBeLessThan(5000); // < 5 seconds
    }, 15000);
  });

  describe('Large Project Performance (500 files)', () => {
    test('should handle large project within reasonable time', async () => {
      const projectPath = await createProjectOfSize('large-perf-project', 500, 'complex');
      
      const { result: analyzeResult, duration: analyzeDuration } = await measurePerformance(
        'Analyze large project',
        () => handleAnalyzeProjectStructure({ projectRootPath: projectPath })
      );
      
      const { result: generateResult, duration: generateDuration } = await measurePerformance(
        'Generate memory bank for large project',
        () => generateMemoryBankTool.handler({ projectRootPath: projectPath })
      );
      
      expect(analyzeResult).toHaveProperty('content');
      expect(generateResult).toHaveProperty('content');
      expect(analyzeResult.content[0].text).toContain('large-perf-project');
      expect(generateResult.content[0].text).toContain('Memory Bank Generation Instructions');
      
      // Performance assertions for large projects
      expect(analyzeDuration).toBeLessThan(10000); // < 10 seconds
      expect(generateDuration).toBeLessThan(15000); // < 15 seconds
    }, 30000);
  });

  describe('Memory Usage Test', () => {
    test('should not consume excessive memory', async () => {
      const projectPath = await createProjectOfSize('memory-test-project', 200, 'medium');
      
      const initialMemory = process.memoryUsage();
      
      // Perform multiple operations
      await handleAnalyzeProjectStructure({ projectRootPath: projectPath });
      await generateMemoryBankTool.handler({ projectRootPath: projectPath });
      await handleValidateMemoryBank({ projectRootPath: projectPath });
      await handleUpdateMemoryBank({ projectRootPath: projectPath });
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      console.log(`📊 Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);
      
      // Should not increase memory by more than 100MB
      expect(memoryIncreaseMB).toBeLessThan(100);
    }, 20000);
  });

  describe('Concurrent Requests Performance', () => {
    test('should handle concurrent requests efficiently', async () => {
      const projectPath = await createProjectOfSize('concurrent-perf-project', 50, 'medium');
      
      const { duration: concurrentDuration } = await measurePerformance(
        'Concurrent operations',
        async () => {
          const operations = [
            handleAnalyzeProjectStructure({ projectRootPath: projectPath }),
            generateMemoryBankTool.handler({ projectRootPath: projectPath }),
            handleValidateMemoryBank({ projectRootPath: projectPath }),
            handleUpdateMemoryBank({ projectRootPath: projectPath }),
            handleAnalyzeProjectStructure({ projectRootPath: projectPath })
          ];
          
          return Promise.all(operations);
        }
      );
      
      // Concurrent operations should not take much longer than sequential
      expect(concurrentDuration).toBeLessThan(8000); // < 8 seconds for 5 operations
    }, 15000);
  });

  describe('Deep Directory Nesting Performance', () => {
    test('should handle deeply nested directories', async () => {
      const projectPath = await createProjectOfSize('deep-nesting-project', 30, 'simple');
      
      // Create deeply nested structure
      let currentPath = path.join(projectPath, 'src');
      for (let i = 1; i <= 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        await fs.mkdir(currentPath, { recursive: true });
        await fs.writeFile(
          path.join(currentPath, `file${i}.js`),
          `// Deep file at level ${i}\\nexport const level${i} = ${i};`
        );
      }
      
      const { result: analyzeResult, duration } = await measurePerformance(
        'Analyze deeply nested project',
        () => handleAnalyzeProjectStructure({ projectRootPath: projectPath })
      );
      
      expect(analyzeResult).toHaveProperty('content');
      expect(analyzeResult.content[0].text).toContain('deep-nesting-project');
      expect(duration).toBeLessThan(3000); // < 3 seconds
    }, 10000);
  });

  describe('Validation Performance', () => {
    test('should validate memory banks quickly', async () => {
      const projectPath = await createProjectOfSize('validation-perf-project', 100, 'medium');
      
      // Create a complete memory bank
      const memoryBankDir = path.join(projectPath, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      const coreFiles = ['projectbrief.md', 'productContext.md', 'activeContext.md', 'systemPatterns.md', 'techContext.md', 'progress.md'];
      
      for (const file of coreFiles) {
        await fs.writeFile(
          path.join(memoryBankDir, file),
          `# ${file}\\n\\nContent for ${file} in validation performance test.\\n\\n## Details\\n\\nThis file contains comprehensive information about the project for testing validation performance.`
        );
      }
      
      // Create copilot instructions
      await fs.writeFile(
        path.join(projectPath, '.github', 'copilot-instructions.md'),
        `# Memory Bank\\n\\nMemory bank files: \`projectbrief.md\`, \`productContext.md\`, \`activeContext.md\`, \`systemPatterns.md\`, \`techContext.md\`, \`progress.md\``
      );
      
      const { result: validateResult, duration } = await measurePerformance(
        'Validate complete memory bank',
        () => handleValidateMemoryBank({ projectRootPath: projectPath })
      );
      
      expect(validateResult).toHaveProperty('content');
      const validationResult = JSON.parse(validateResult.content[0].text);
      expect(validationResult).toHaveProperty('status', 'valid');
      expect(validationResult).toHaveProperty('fileCount', 6);
      expect(duration).toBeLessThan(2000); // < 2 seconds
    }, 10000);
  });
});