import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  analyzeProject, 
  scanSourceFiles, 
  detectFrameworks, 
  analyzeArchitecture
} from '../../src/core/projectAnalysis.js';

describe('Project Analysis Module', () => {
  const testTempDir = path.join(process.cwd(), 'temp', 'test', 'unit');
  
  beforeEach(async () => {
    await fs.mkdir(testTempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testTempDir, { recursive: true, force: true });
  });

  describe('scanSourceFiles', () => {
    test('should identify TypeScript files correctly', async () => {
      const projectDir = path.join(testTempDir, 'ts-project');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'src', 'index.ts'), 'console.log("test");');
      await fs.writeFile(path.join(projectDir, 'src', 'app.tsx'), 'import React from "react";');
      
      const result = await scanSourceFiles(projectDir, 'medium');
      
      expect(result.typescript).toEqual(
        expect.arrayContaining(['src/index.ts', 'src/app.tsx'])
      );
      expect(result.typescript).toHaveLength(2);
    });

    test('should identify JavaScript files correctly', async () => {
      const projectDir = path.join(testTempDir, 'js-project');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'src', 'index.js'), 'console.log("test");');
      await fs.writeFile(path.join(projectDir, 'app.js'), 'module.exports = {};');
      
      const result = await scanSourceFiles(projectDir, 'medium');
      
      expect(result.javascript).toEqual(
        expect.arrayContaining(['src/index.js', 'app.js'])
      );
      expect(result.javascript).toHaveLength(2);
    });

    test('should identify Python files correctly', async () => {
      const projectDir = path.join(testTempDir, 'py-project');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'src', 'main.py'), 'print("hello")');
      await fs.writeFile(path.join(projectDir, 'utils.py'), 'def helper(): pass');
      
      const result = await scanSourceFiles(projectDir, 'medium');
      
      expect(result.python).toEqual(
        expect.arrayContaining(['src/main.py', 'utils.py'])
      );
      expect(result.python).toHaveLength(2);
    });

    test('should respect depth limits', async () => {
      const projectDir = path.join(testTempDir, 'deep-project');
      await fs.mkdir(path.join(projectDir, 'src', 'deep', 'nested', 'very'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'src', 'index.ts'), 'test');
      await fs.writeFile(path.join(projectDir, 'src', 'deep', 'nested', 'very', 'deep.ts'), 'test');
      
      const shallowResult = await scanSourceFiles(projectDir, 'shallow');
      const mediumResult = await scanSourceFiles(projectDir, 'medium');
      
      expect(shallowResult.typescript).toContain('src/index.ts');
      expect(shallowResult.typescript).not.toContain('src/deep/nested/very/deep.ts');
      
      expect(mediumResult.typescript).toContain('src/index.ts');
      expect(mediumResult.typescript).toContain('src/deep/nested/very/deep.ts');
    });

    test('should skip node_modules and other ignored directories', async () => {
      const projectDir = path.join(testTempDir, 'skip-project');
      await fs.mkdir(path.join(projectDir, 'node_modules', 'react'), { recursive: true });
      await fs.mkdir(path.join(projectDir, '.git'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'dist'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'node_modules', 'react', 'index.js'), 'test');
      await fs.writeFile(path.join(projectDir, '.git', 'config'), 'test');
      await fs.writeFile(path.join(projectDir, 'dist', 'bundle.js'), 'test');
      await fs.writeFile(path.join(projectDir, 'src.js'), 'test');
      
      const result = await scanSourceFiles(projectDir, 'medium');
      
      expect(result.javascript).toContain('src.js');
      expect(result.javascript).not.toContain('node_modules/react/index.js');
      expect(result.javascript).not.toContain('dist/bundle.js');
      expect(result.directories).not.toContain('node_modules');
      expect(result.directories).not.toContain('.git');
    });
  });

  describe('detectFrameworks', () => {
    test('should detect React framework', () => {
      const dependencies = { 'react': '^18.0.0', 'react-dom': '^18.0.0' };
      const rootFiles = ['package.json', 'src', 'public'];
      
      const frameworks = detectFrameworks(rootFiles, dependencies);
      
      expect(frameworks).toContain('React');
    });

    test('should detect Express.js framework', () => {
      const dependencies = { 'express': '^4.18.0' };
      const rootFiles = ['package.json', 'server.js'];
      
      const frameworks = detectFrameworks(rootFiles, dependencies);
      
      expect(frameworks).toContain('Express.js');
    });

    test('should detect Next.js framework', () => {
      const dependencies = { 'next': '^13.0.0' };
      const rootFiles = ['package.json', 'pages', 'next.config.js'];
      
      const frameworks = detectFrameworks(rootFiles, dependencies);
      
      expect(frameworks).toContain('Next.js');
    });

    test('should detect Vue.js framework', () => {
      const dependencies = { 'vue': '^3.0.0' };
      const rootFiles = ['package.json', 'src'];
      
      const frameworks = detectFrameworks(rootFiles, dependencies);
      
      expect(frameworks).toContain('Vue.js');
    });

    test('should detect multiple frameworks', () => {
      const dependencies = { 
        'react': '^18.0.0', 
        'express': '^4.18.0',
        'mongoose': '^7.0.0'
      };
      const rootFiles = ['package.json', 'src', 'server'];
      
      const frameworks = detectFrameworks(rootFiles, dependencies);
      
      expect(frameworks).toContain('React');
      expect(frameworks).toContain('Express.js');
      expect(frameworks).toContain('MongoDB');
    });

    test('should return empty array when no frameworks detected', () => {
      const dependencies = { 'lodash': '^4.17.0' };
      const rootFiles = ['package.json', 'index.js'];
      
      const frameworks = detectFrameworks(rootFiles, dependencies);
      
      expect(frameworks).toEqual([]);
    });
  });

  describe('analyzeArchitecture', () => {
    test('should detect source directory structure pattern', () => {
      const rootFiles = ['package.json', 'src', 'lib'];
      const sourceFiles = { directories: ['src', 'lib'] };
      const packageInfo = {};
      
      const result = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
      
      expect(result.patterns).toContain('Source Directory Structure');
    });

    test('should detect component-based architecture', () => {
      const rootFiles = ['package.json', 'src'];
      const sourceFiles = { directories: ['src/components', 'src/pages'] };
      const packageInfo = {};
      
      const result = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
      
      expect(result.patterns).toContain('Component-Based Architecture');
    });

    test('should detect service layer pattern', () => {
      const rootFiles = ['package.json', 'src'];
      const sourceFiles = { directories: ['src/services', 'src/api'] };
      const packageInfo = {};
      
      const result = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
      
      expect(result.patterns).toContain('Service Layer Pattern');
    });

    test('should identify entry points from package.json', () => {
      const rootFiles = ['package.json'];
      const sourceFiles = { directories: [] };
      const packageInfo = { main: 'dist/server.js' };
      
      const result = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
      
      expect(result.entryPoints).toContain('dist/server.js');
    });

    test('should identify common entry points from root files', () => {
      const rootFiles = ['index.js', 'server.ts', 'app.py'];
      const sourceFiles = { directories: [] };
      const packageInfo = {};
      
      const result = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
      
      expect(result.entryPoints).toEqual(
        expect.arrayContaining(['index.js', 'server.ts', 'app.py'])
      );
    });

    test('should identify configuration files', () => {
      const rootFiles = ['package.json', 'tsconfig.json', 'webpack.config.js', '.env'];
      const sourceFiles = { directories: [] };
      const packageInfo = {};
      
      const result = analyzeArchitecture(rootFiles, sourceFiles, packageInfo);
      
      expect(result.configFiles).toEqual(
        expect.arrayContaining(['package.json', 'tsconfig.json', 'webpack.config.js'])
      );
    });
  });

  describe('analyzeProject', () => {
    test('should analyze a React project correctly', async () => {
      const projectDir = path.join(testTempDir, 'react-project');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'public'), { recursive: true });
      
      const packageJson = {
        name: 'test-react-app',
        version: '1.0.0',
        description: 'Test React application',
        dependencies: { 'react': '^18.0.0', 'react-dom': '^18.0.0' },
        devDependencies: { 'typescript': '^4.9.0' },
        scripts: { 'start': 'react-scripts start' }
      };
      
      await fs.writeFile(
        path.join(projectDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      await fs.writeFile(path.join(projectDir, 'src', 'index.tsx'), 'import React from "react";');
      await fs.writeFile(path.join(projectDir, 'src', 'App.tsx'), 'export default function App() {}');
      
      const result = await analyzeProject(projectDir);
      
      expect(result.projectName).toBe('test-react-app');
      expect(result.version).toBe('1.0.0');
      expect(result.projectType).toContain('TypeScript');
      expect(result.frameworks).toContain('React');
      expect(result.structure.sourceFiles.typescript).toEqual(
        expect.arrayContaining(['src/index.tsx', 'src/App.tsx'])
      );
      expect(result.dependencies.runtime).toHaveProperty('react');
      expect(result.dependencies.development).toHaveProperty('typescript');
      expect(result.dependencies.scripts).toHaveProperty('start');
    });

    test('should handle projects without package.json', async () => {
      const projectDir = path.join(testTempDir, 'no-package');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.writeFile(path.join(projectDir, 'index.js'), 'console.log("test");');
      
      const result = await analyzeProject(projectDir);
      
      expect(result.projectName).toBe('no-package');
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe('Project analysis');
      expect(result.projectType).toContain('JavaScript');
    });

    test('should determine complexity based on file count', async () => {
      const projectDir = path.join(testTempDir, 'complexity-test');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      
      // Create many files for high complexity
      for (let i = 0; i < 50; i++) {
        await fs.writeFile(path.join(projectDir, 'src', `file${i}.ts`), 'test');
      }
      
      const result = await analyzeProject(projectDir);
      
      expect(result.structure.complexity).toBe('High');
      expect(result.structure.estimatedFiles).toBeGreaterThan(40);
    });

    test('should include recommendations based on project analysis', async () => {
      const projectDir = path.join(testTempDir, 'recommendations-test');
      await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
      
      const packageJson = {
        name: 'test-api',
        dependencies: { 'express': '^4.18.0' },
        scripts: { 'test': 'jest' }
      };
      
      await fs.writeFile(
        path.join(projectDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      await fs.writeFile(path.join(projectDir, 'src', 'server.js'), 'const express = require("express");');
      
      const result = await analyzeProject(projectDir);
      
      expect(result.recommendations.focusAreas).toEqual(
        expect.arrayContaining(['architecture', 'apis'])
      );
      expect(result.recommendations.detailLevel).toBe('standard');
    });
  });
});